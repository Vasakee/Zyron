// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ZyronEscrow
 * @dev Multi-sig & operator controlled escrow smart contract for protocol security engagements.
 * Supports milestone-based release (50% scan start, 50% final attestation).
 *
 * Security features:
 *   - SafeERC20 for USDT compatibility (no-return-value tokens)
 *   - ReentrancyGuard on all fund-moving functions
 *   - Pausable emergency stop mechanism
 *   - Token allowlist to prevent malicious token deposits
 */
contract ZyronEscrow is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    address public admin;
    address public operator; // Backend hot wallet triggering milestone releases

    struct EngagementEscrow {
        bytes32 auditId;
        address client;
        address token;          // USDC or USDT address
        uint256 totalAmount;
        uint256 depositedAt;
        bool scanReleased;      // 50% milestone released on AST scan start
        bool finalReleased;     // 50% milestone released on attestation
        bool refunded;
    }

    // Mapping: auditId (keccak256 hash) => EngagementEscrow
    mapping(bytes32 => EngagementEscrow) public escrows;

    // Token allowlist: only approved stablecoins (USDC, USDT) can be deposited
    mapping(address => bool) public allowedTokens;

    event EscrowDeposited(bytes32 indexed auditId, address indexed client, address indexed token, uint256 amount);
    event MilestoneReleased(bytes32 indexed auditId, uint256 milestoneNumber, uint256 amountReleased, address recipient);
    event EscrowRefunded(bytes32 indexed auditId, address indexed client, uint256 amount);
    event TokenAllowlistUpdated(address indexed token, bool allowed);
    event OperatorUpdated(address indexed newOperator);
    event AdminUpdated(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "ZyronEscrow: Caller is not admin");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == admin, "ZyronEscrow: Caller is not authorized operator");
        _;
    }

    constructor(address _operator) {
        require(_operator != address(0), "ZyronEscrow: Invalid operator address");
        admin = msg.sender;
        operator = _operator;
    }

    // ─── TOKEN ALLOWLIST ─────────────────────────────────────

    /**
     * @notice Add or remove a token from the allowlist (Admin only)
     * @param token ERC20 token address (e.g. USDC, USDT)
     * @param allowed Whether the token is allowed for escrow deposits
     */
    function setAllowedToken(address token, bool allowed) external onlyAdmin {
        require(token != address(0), "ZyronEscrow: Invalid token address");
        allowedTokens[token] = allowed;
        emit TokenAllowlistUpdated(token, allowed);
    }

    // ─── DEPOSIT ─────────────────────────────────────────────

    /**
     * @notice Deposit USDC/USDT tokens into escrow for an audit engagement
     * @param auditId Keccak256 hash of ticket string (e.g. keccak256("ZYR-9481"))
     * @param token Address of ERC20 token (must be allowlisted)
     * @param amount Total engagement fee in token decimals (6 decimals for USDC/USDT)
     */
    function deposit(bytes32 auditId, address token, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "ZyronEscrow: Deposit amount must be > 0");
        require(allowedTokens[token], "ZyronEscrow: Token not allowed");
        require(escrows[auditId].totalAmount == 0, "ZyronEscrow: Escrow already exists for this audit ID");

        // SafeERC20: handles USDT (no bool return) and other non-standard tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        escrows[auditId] = EngagementEscrow({
            auditId: auditId,
            client: msg.sender,
            token: token,
            totalAmount: amount,
            depositedAt: block.timestamp,
            scanReleased: false,
            finalReleased: false,
            refunded: false
        });

        emit EscrowDeposited(auditId, msg.sender, token, amount);
    }

    // ─── MILESTONE RELEASES ──────────────────────────────────

    /**
     * @notice Release 50% milestone payment to platform treasury upon automated AST scan start
     */
    function releaseScanMilestone(bytes32 auditId, address treasuryRecipient) external onlyOperator nonReentrant whenNotPaused {
        EngagementEscrow storage escrow = escrows[auditId];
        require(escrow.totalAmount > 0, "ZyronEscrow: Escrow does not exist");
        require(!escrow.scanReleased, "ZyronEscrow: Scan milestone already released");
        require(!escrow.refunded, "ZyronEscrow: Escrow was refunded");
        require(treasuryRecipient != address(0), "ZyronEscrow: Invalid treasury recipient");

        uint256 scanAmount = escrow.totalAmount / 2; // 50%
        escrow.scanReleased = true;

        IERC20(escrow.token).safeTransfer(treasuryRecipient, scanAmount);

        emit MilestoneReleased(auditId, 1, scanAmount, treasuryRecipient);
    }

    /**
     * @notice Release final 50% milestone payment upon cryptographic attestation delivery
     */
    function releaseFinalMilestone(bytes32 auditId, address treasuryRecipient) external onlyOperator nonReentrant whenNotPaused {
        EngagementEscrow storage escrow = escrows[auditId];
        require(escrow.totalAmount > 0, "ZyronEscrow: Escrow does not exist");
        require(escrow.scanReleased, "ZyronEscrow: Scan milestone must be released first");
        require(!escrow.finalReleased, "ZyronEscrow: Final milestone already released");
        require(!escrow.refunded, "ZyronEscrow: Escrow was refunded");
        require(treasuryRecipient != address(0), "ZyronEscrow: Invalid treasury recipient");

        uint256 finalAmount = escrow.totalAmount - (escrow.totalAmount / 2); // Remaining 50%
        escrow.finalReleased = true;

        IERC20(escrow.token).safeTransfer(treasuryRecipient, finalAmount);

        emit MilestoneReleased(auditId, 2, finalAmount, treasuryRecipient);
    }

    // ─── REFUND ──────────────────────────────────────────────

    /**
     * @notice Refund remaining unreleased escrow balance back to client in case of cancellation
     */
    function refundClient(bytes32 auditId) external onlyAdmin nonReentrant {
        EngagementEscrow storage escrow = escrows[auditId];
        require(escrow.totalAmount > 0, "ZyronEscrow: Escrow does not exist");
        require(!escrow.finalReleased, "ZyronEscrow: Cannot refund fully completed audit");
        require(!escrow.refunded, "ZyronEscrow: Escrow already refunded");

        uint256 refundAmount = escrow.totalAmount;
        if (escrow.scanReleased) {
            refundAmount = escrow.totalAmount - (escrow.totalAmount / 2);
        }

        escrow.refunded = true;

        IERC20(escrow.token).safeTransfer(escrow.client, refundAmount);

        emit EscrowRefunded(auditId, escrow.client, refundAmount);
    }

    // ─── ADMIN ───────────────────────────────────────────────

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function setOperator(address _newOperator) external onlyAdmin {
        require(_newOperator != address(0), "ZyronEscrow: Invalid operator address");
        operator = _newOperator;
        emit OperatorUpdated(_newOperator);
    }

    function setAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "ZyronEscrow: Invalid admin address");
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
    }
}
