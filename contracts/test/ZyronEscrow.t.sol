// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ZyronEscrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract ZyronEscrowTest is Test {
    ZyronEscrow public escrow;
    MockUSDC public usdc;

    address public admin = address(this);
    address public operator = address(0x111);
    address public client = address(0x222);
    address public treasury = address(0x333);
    address public attacker = address(0x666);

    bytes32 public auditId = keccak256(abi.encodePacked("ZYR-9481"));
    uint256 public depositAmount = 10_000 * 1e6; // 10,000 USDC

    function setUp() public {
        usdc = new MockUSDC();
        escrow = new ZyronEscrow(operator);

        // Allowlist USDC
        escrow.setAllowedToken(address(usdc), true);

        // Fund client
        usdc.mint(client, depositAmount);

        // Client approves escrow contract
        vm.prank(client);
        usdc.approve(address(escrow), type(uint256).max);
    }

    // ─── DEPOSIT TESTS ───────────────────────────────────────

    function test_DepositSuccess() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        (bytes32 id, address storedClient, address token, uint256 amount, , bool scanReleased, bool finalReleased, bool refunded) = escrow.escrows(auditId);
        assertEq(id, auditId);
        assertEq(storedClient, client);
        assertEq(token, address(usdc));
        assertEq(amount, depositAmount);
        assertFalse(scanReleased);
        assertFalse(finalReleased);
        assertFalse(refunded);
        assertEq(usdc.balanceOf(address(escrow)), depositAmount);
    }

    function test_DepositZeroAmountReverts() public {
        vm.prank(client);
        vm.expectRevert("ZyronEscrow: Deposit amount must be > 0");
        escrow.deposit(auditId, address(usdc), 0);
    }

    function test_DepositDuplicateAuditIdReverts() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount / 2);

        usdc.mint(client, depositAmount);
        vm.prank(client);
        vm.expectRevert("ZyronEscrow: Escrow already exists for this audit ID");
        escrow.deposit(auditId, address(usdc), depositAmount / 2);
    }

    function test_DepositUnallowedTokenReverts() public {
        MockUSDC fakeToken = new MockUSDC();
        fakeToken.mint(client, depositAmount);

        vm.prank(client);
        fakeToken.approve(address(escrow), type(uint256).max);

        vm.prank(client);
        vm.expectRevert("ZyronEscrow: Token not allowed");
        escrow.deposit(auditId, address(fakeToken), depositAmount);
    }

    // ─── MILESTONE RELEASE TESTS ─────────────────────────────

    function test_ReleaseScanMilestoneSuccess() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        uint256 expectedRelease = depositAmount / 2; // 5,000 USDC

        vm.prank(operator);
        escrow.releaseScanMilestone(auditId, treasury);

        (, , , , , bool scanReleased, , ) = escrow.escrows(auditId);
        assertTrue(scanReleased);
        assertEq(usdc.balanceOf(treasury), expectedRelease);
    }

    function test_ReleaseScanMilestoneAlreadyReleasedReverts() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        vm.prank(operator);
        escrow.releaseScanMilestone(auditId, treasury);

        vm.prank(operator);
        vm.expectRevert("ZyronEscrow: Scan milestone already released");
        escrow.releaseScanMilestone(auditId, treasury);
    }

    function test_ReleaseFinalMilestoneSuccess() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        vm.prank(operator);
        escrow.releaseScanMilestone(auditId, treasury);

        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.prank(operator);
        escrow.releaseFinalMilestone(auditId, treasury);

        (, , , , , , bool finalReleased, ) = escrow.escrows(auditId);
        assertTrue(finalReleased);
        assertEq(usdc.balanceOf(treasury), treasuryBefore + (depositAmount - depositAmount / 2));
        assertEq(usdc.balanceOf(address(escrow)), 0); // All funds released
    }

    function test_ReleaseFinalWithoutScanReverts() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        vm.prank(operator);
        vm.expectRevert("ZyronEscrow: Scan milestone must be released first");
        escrow.releaseFinalMilestone(auditId, treasury);
    }

    // ─── REFUND TESTS ────────────────────────────────────────

    function test_RefundFullBeforeScanRelease() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        escrow.refundClient(auditId); // admin = address(this)

        (, , , , , , , bool refunded) = escrow.escrows(auditId);
        assertTrue(refunded);
        assertEq(usdc.balanceOf(client), depositAmount);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function test_RefundPartialAfterScanRelease() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        vm.prank(operator);
        escrow.releaseScanMilestone(auditId, treasury);

        uint256 expectedRefund = depositAmount - (depositAmount / 2);

        escrow.refundClient(auditId);

        assertEq(usdc.balanceOf(client), expectedRefund);
    }

    function test_RefundAfterFullCompletionReverts() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        vm.prank(operator);
        escrow.releaseScanMilestone(auditId, treasury);
        vm.prank(operator);
        escrow.releaseFinalMilestone(auditId, treasury);

        vm.expectRevert("ZyronEscrow: Cannot refund fully completed audit");
        escrow.refundClient(auditId);
    }

    // ─── ACCESS CONTROL TESTS ────────────────────────────────

    function test_UnauthorizedOperatorReverts() public {
        vm.prank(client);
        escrow.deposit(auditId, address(usdc), depositAmount);

        vm.prank(attacker);
        vm.expectRevert("ZyronEscrow: Caller is not authorized operator");
        escrow.releaseScanMilestone(auditId, attacker);
    }

    // ─── PAUSE TESTS ─────────────────────────────────────────

    function test_DepositWhenPausedReverts() public {
        escrow.pause();

        vm.prank(client);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        escrow.deposit(auditId, address(usdc), depositAmount);
    }
}
