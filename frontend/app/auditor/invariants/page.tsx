"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  Cpu,
  Clock,
  Sparkles,
  Check,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";

interface InvariantProof {
  id: string;
  name: string;
  targetScope: string;
  category: "Solvency" | "Access Control" | "Reentrancy" | "Oracle Bounds";
  fuzzRuns: number;
  status: "passed" | "running" | "failed";
  runtimeMs: number;
  assertionSnippet: string;
  description: string;
}

export default function InvariantProofSuitePage() {
  const [isRunningAll, setIsRunningAll] = React.useState(false);
  const [fuzzRunMultiplier, setFuzzRunMultiplier] = React.useState("10000");

  const [invariants, setInvariants] = React.useState<InvariantProof[]>([
    {
      id: "INV-PROOF-01",
      name: "Invariant: Vault Collateral Solvency Guarantee",
      targetScope: "VaultCore.sol::userBalances",
      category: "Solvency",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 1420,
      assertionSnippet: "assertEq(address(vault).balance, sumUserBalances(allUsers));",
      description: "Asserts that total ETH & ERC-20 assets locked inside the contract strictly match the ledger sum across 10,000 randomized state actions.",
    },
    {
      id: "INV-PROOF-02",
      name: "Invariant: Non-Reentrant Checks-Effects Ordering",
      targetScope: "VaultCore.sol::withdrawAll",
      category: "Reentrancy",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 880,
      assertionSnippet: "assertEq(vault.reentrancyGuardState(), GUARD_UNLOCKED_OR_ZEROED);",
      description: "Asserts that external low-level transfer callbacks cannot re-enter deposit or withdraw state before caller balances are wiped.",
    },
    {
      id: "INV-PROOF-03",
      name: "Invariant: Oracle Timestamp Max Delay Bound",
      targetScope: "CollateralVault.sol::latestRoundData",
      category: "Oracle Bounds",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 640,
      assertionSnippet: "assertTrue(block.timestamp - updatedAt <= MAX_ORACLE_DELAY);",
      description: "Asserts that oracle price data older than 3,600s or containing zero price reverts immediately prior to liquidation evaluation.",
    },
    {
      id: "INV-PROOF-04",
      name: "Invariant: Strategy Router Whitelist Boundary",
      targetScope: "StrategyRouter.sol::executeRebalance",
      category: "Access Control",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 910,
      assertionSnippet: "assertTrue(approvedStrategies[strategy] && msg.sender == owner);",
      description: "Fuzz tests randomized delegatecall targets to guarantee execution is strictly constrained to DAO-approved strategy contracts.",
    },
  ]);

  const handleRunAll = () => {
    setIsRunningAll(true);
    setInvariants((prev) => prev.map((inv) => ({ ...inv, status: "running" })));

    setTimeout(() => {
      setIsRunningAll(false);
      setInvariants((prev) =>
        prev.map((inv) => ({
          ...inv,
          status: "passed",
          fuzzRuns: Number(fuzzRunMultiplier) || 10000,
        }))
      );
    }, 1800);
  };

  const totalRuns = invariants.reduce((acc, curr) => acc + curr.fuzzRuns, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              Foundry Formal Invariant Proof Suite
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Automated property-based fuzzing and symbolic state proofs executed across protocol targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            isLoading={isRunningAll}
            leftIcon={<Play className="h-3.5 w-3.5" />}
            onClick={handleRunAll}
          >
            Run All Invariant Proofs
          </Button>
        </div>
      </div>

      {/* Telemetry Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">TOTAL INVARIANT PROOFS</div>
          <div className="text-text-primary font-bold text-sm">{invariants.length} Registered</div>
          <div className="text-[10px] text-signal-resolved">100% Passing</div>
        </div>

        <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">TOTAL FUZZ RUNS</div>
          <div className="text-text-primary font-bold text-sm">{totalRuns.toLocaleString()} Runs</div>
          <div className="text-[10px] text-text-muted">Zero Invariant Violations</div>
        </div>

        <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">EXECUTION ENGINE</div>
          <div className="text-text-primary font-bold text-sm">Foundry / Forge</div>
          <div className="text-[10px] text-accent-scan">EVM Shanghai Profile</div>
        </div>

        <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">FUZZ DEPTH MULTIPLIER</div>
          <select
            value={fuzzRunMultiplier}
            onChange={(e) => setFuzzRunMultiplier(e.target.value)}
            className="w-full h-7 px-2 rounded-[2px] bg-bg-void border border-border-hairline text-text-primary text-[11px] focus:outline-none"
          >
            <option value="1000">1,000 Runs / Invariant</option>
            <option value="10000">10,000 Runs / Invariant</option>
            <option value="50000">50,000 Runs / Invariant</option>
          </select>
        </div>
      </div>

      {/* Invariant Proof Cards */}
      <div className="space-y-4 font-mono text-xs">
        {invariants.map((inv) => (
          <div
            key={inv.id}
            className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 hover:border-border-hairline/90 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-accent-scan font-bold">{inv.id}</span>
                  <h3 className="font-display text-sm font-semibold text-text-primary font-sans">
                    {inv.name}
                  </h3>
                  <Badge severity="informational" size="sm">
                    {inv.category}
                  </Badge>
                </div>
                <div className="text-[10px] text-text-muted">
                  SCOPE TARGET: {inv.targetScope} · {inv.fuzzRuns.toLocaleString()} FUZZ RUNS
                </div>
              </div>

              <div className="flex items-center gap-3">
                {inv.status === "passed" && (
                  <Badge severity="resolved" size="sm">
                    PASSED ({inv.runtimeMs}ms) ✓
                  </Badge>
                )}
                {inv.status === "running" && (
                  <Badge severity="high" size="sm">
                    FUZZING RUNTIME...
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-xs text-text-muted font-sans leading-relaxed">
              {inv.description}
            </p>

            <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
              <div className="text-[10px] text-accent-scan font-bold">SOLIDITY INVARIANT ASSERTION:</div>
              <code className="text-text-primary font-mono text-xs select-all block">
                {inv.assertionSnippet}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
