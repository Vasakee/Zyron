// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ZyronAttestation.sol";

contract ZyronAttestationTest is Test {
    ZyronAttestation public attestation;

    address public admin = address(this);
    address public operator = address(0x111);
    address public leadAuditor = address(0x444);
    address public peerAuditor = address(0x555);
    address public attacker = address(0x666);

    bytes32 public auditId = keccak256(abi.encodePacked("ZYR-9481"));
    bytes32 public bytecodeHash = keccak256(abi.encodePacked("deployed_bytecode_sha256"));
    bytes32 public reportHash = keccak256(abi.encodePacked("report_pdf_sha256"));

    function setUp() public {
        attestation = new ZyronAttestation(operator);
    }

    // ─── PUBLISH TESTS ───────────────────────────────────────

    function test_PublishAttestationSuccess() public {
        vm.prank(operator);
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );

        ZyronAttestation.AttestationRecord memory record = attestation.verifyAttestation(auditId);
        assertEq(record.auditId, auditId);
        assertEq(record.bytecodeHash, bytecodeHash);
        assertEq(record.reportHash, reportHash);
        assertEq(record.leadAuditor, leadAuditor);
        assertEq(record.peerAuditor, peerAuditor);
        assertEq(record.sloc, 2410);
        assertEq(keccak256(bytes(record.contractFileName)), keccak256(bytes("VaultCore.sol")));
        assertTrue(record.isVerified);
        assertEq(attestation.attestationCount(), 1);
    }

    function test_PublishDuplicateReverts() public {
        vm.prank(operator);
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );

        vm.prank(operator);
        vm.expectRevert("ZyronAttestation: Attestation already exists for this audit ID");
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );
    }

    function test_PublishZeroBytecodeHashReverts() public {
        vm.prank(operator);
        vm.expectRevert("ZyronAttestation: Invalid bytecode hash");
        attestation.publishAttestation(
            auditId, bytes32(0), reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );
    }

    function test_PublishZeroReportHashReverts() public {
        vm.prank(operator);
        vm.expectRevert("ZyronAttestation: Invalid report hash");
        attestation.publishAttestation(
            auditId, bytecodeHash, bytes32(0),
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );
    }

    function test_PublishZeroLeadAuditorReverts() public {
        vm.prank(operator);
        vm.expectRevert("ZyronAttestation: Invalid lead auditor address");
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            address(0), peerAuditor, 2410, "VaultCore.sol"
        );
    }

    // ─── VERIFY TESTS ────────────────────────────────────────

    function test_VerifyByAuditId() public {
        vm.prank(operator);
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );

        ZyronAttestation.AttestationRecord memory record = attestation.verifyAttestation(auditId);
        assertEq(record.sloc, 2410);
        assertTrue(record.isVerified);
    }

    function test_VerifyByBytecodeHash() public {
        vm.prank(operator);
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );

        ZyronAttestation.AttestationRecord memory record = attestation.verifyByBytecodeHash(bytecodeHash);
        assertEq(record.auditId, auditId);
    }

    function test_VerifyByReportHash() public {
        vm.prank(operator);
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );

        ZyronAttestation.AttestationRecord memory record = attestation.verifyByReportHash(reportHash);
        assertEq(record.auditId, auditId);
    }

    function test_VerifyNonExistentReverts() public {
        vm.expectRevert("ZyronAttestation: No verified attestation found for this audit ID");
        attestation.verifyAttestation(auditId);
    }

    // ─── ACCESS CONTROL TESTS ────────────────────────────────

    function test_UnauthorizedPublisherReverts() public {
        vm.prank(attacker);
        vm.expectRevert("ZyronAttestation: Caller is not authorized operator");
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );
    }

    // ─── PAUSE TESTS ─────────────────────────────────────────

    function test_PublishWhenPausedReverts() public {
        attestation.pause(); // admin = address(this)

        vm.prank(operator);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        attestation.publishAttestation(
            auditId, bytecodeHash, reportHash,
            leadAuditor, peerAuditor, 2410, "VaultCore.sol"
        );
    }
}
