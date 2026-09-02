// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ZyronAttestation
 * @dev Immutable on-chain attestation registry for verified smart contract security audit reports.
 * Allows anyone to query proof of audit by ticket hash, bytecode SHA-256, or report hash.
 *
 * Security features:
 *   - Pausable emergency stop mechanism
 *   - Operator + Admin dual role access control
 */
contract ZyronAttestation is Pausable {
    address public admin;
    address public operator; // Backend hot wallet authorized to sign attestations

    struct AttestationRecord {
        bytes32 auditId;          // keccak256 hash of ticket string (e.g. keccak256("ZYR-9481"))
        bytes32 bytecodeHash;     // SHA-256 hash of audited deployed contract bytecode
        bytes32 reportHash;       // SHA-256 hash of final PDF security report
        address leadAuditor;      // Wallet address of lead auditor
        address peerAuditor;      // Wallet address of secondary peer auditor
        uint256 sloc;             // Audited lines of code count
        uint256 timestamp;        // Attestation seal timestamp
        string  contractFileName; // Primary contract name (e.g. "VaultCore.sol")
        bool    isVerified;       // Verification flag
    }

    // Mapping: auditId (keccak256 hash) => AttestationRecord
    mapping(bytes32 => AttestationRecord) public registry;

    // Index mapping: bytecodeHash => auditId (reverse lookup)
    mapping(bytes32 => bytes32) public bytecodeToAuditId;

    // Index mapping: reportHash => auditId (reverse lookup)
    mapping(bytes32 => bytes32) public reportToAuditId;

    // Total attestation count
    uint256 public attestationCount;

    event AttestationPublished(
        bytes32 indexed auditId,
        bytes32 indexed bytecodeHash,
        bytes32 indexed reportHash,
        address leadAuditor,
        uint256 sloc,
        string contractFileName,
        uint256 timestamp
    );

    event OperatorUpdated(address indexed newOperator);
    event AdminUpdated(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "ZyronAttestation: Caller is not admin");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == admin, "ZyronAttestation: Caller is not authorized operator");
        _;
    }

    constructor(address _operator) {
        require(_operator != address(0), "ZyronAttestation: Invalid operator address");
        admin = msg.sender;
        operator = _operator;
    }

    /**
     * @notice Publish immutable audit attestation onto the blockchain
     */
    function publishAttestation(
        bytes32 auditId,
        bytes32 bytecodeHash,
        bytes32 reportHash,
        address leadAuditor,
        address peerAuditor,
        uint256 sloc,
        string calldata contractFileName
    ) external onlyOperator whenNotPaused {
        require(!registry[auditId].isVerified, "ZyronAttestation: Attestation already exists for this audit ID");
        require(bytecodeHash != bytes32(0), "ZyronAttestation: Invalid bytecode hash");
        require(reportHash != bytes32(0), "ZyronAttestation: Invalid report hash");
        require(leadAuditor != address(0), "ZyronAttestation: Invalid lead auditor address");

        AttestationRecord memory record = AttestationRecord({
            auditId: auditId,
            bytecodeHash: bytecodeHash,
            reportHash: reportHash,
            leadAuditor: leadAuditor,
            peerAuditor: peerAuditor,
            sloc: sloc,
            timestamp: block.timestamp,
            contractFileName: contractFileName,
            isVerified: true
        });

        registry[auditId] = record;
        bytecodeToAuditId[bytecodeHash] = auditId;
        reportToAuditId[reportHash] = auditId;
        attestationCount++;

        emit AttestationPublished(
            auditId,
            bytecodeHash,
            reportHash,
            leadAuditor,
            sloc,
            contractFileName,
            block.timestamp
        );
    }

    /**
     * @notice Verify and return attestation record by audit ID hash
     */
    function verifyAttestation(bytes32 auditId) external view returns (AttestationRecord memory) {
        require(registry[auditId].isVerified, "ZyronAttestation: No verified attestation found for this audit ID");
        return registry[auditId];
    }

    /**
     * @notice Verify and return attestation record by deployed bytecode SHA-256 hash
     */
    function verifyByBytecodeHash(bytes32 bytecodeHash) external view returns (AttestationRecord memory) {
        bytes32 auditId = bytecodeToAuditId[bytecodeHash];
        require(auditId != bytes32(0), "ZyronAttestation: No audit record found for this bytecode hash");
        return registry[auditId];
    }

    /**
     * @notice Verify and return attestation record by PDF report SHA-256 hash
     */
    function verifyByReportHash(bytes32 reportHash) external view returns (AttestationRecord memory) {
        bytes32 auditId = reportToAuditId[reportHash];
        require(auditId != bytes32(0), "ZyronAttestation: No audit record found for this report hash");
        return registry[auditId];
    }

    // ─── ADMIN ───────────────────────────────────────────────

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function setOperator(address _newOperator) external onlyAdmin {
        require(_newOperator != address(0), "ZyronAttestation: Invalid operator address");
        operator = _newOperator;
        emit OperatorUpdated(_newOperator);
    }

    function setAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "ZyronAttestation: Invalid admin address");
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
    }
}
