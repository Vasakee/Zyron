// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ZyronEscrow.sol";
import "../src/ZyronAttestation.sol";

contract DeployScript is Script {
  function run() external {
    vm.startBroadcast();

    // 1. Deploy ZyronAttestation
    ZyronAttestation attestation = new ZyronAttestation(msg.sender);
    console.log("ZyronAttestation Deployed at:", address(attestation));

    // 2. Deploy ZyronEscrow
    ZyronEscrow escrow = new ZyronEscrow(msg.sender);
    console.log("ZyronEscrow Deployed at:", address(escrow));

    // 3. Allowlist Arbitrum Sepolia USDC & Base Sepolia USDC
    address arbitrumSepoliaUSDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    address baseSepoliaUSDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    escrow.setAllowedToken(arbitrumSepoliaUSDC, true);
    escrow.setAllowedToken(baseSepoliaUSDC, true);

    vm.stopBroadcast();

    console.log("--------------------------------------------------");
    console.log("Deployment Complete!");
    console.log("ESCROW_CONTRACT_ADDRESS=", address(escrow));
    console.log("ATTESTATION_CONTRACT_ADDRESS=", address(attestation));
    console.log("--------------------------------------------------");
  }
}
