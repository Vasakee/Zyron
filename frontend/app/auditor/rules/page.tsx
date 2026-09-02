"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";

interface AstRule {
  id: string;
  name: string;
  swcId: string;
  severity: "critical" | "high" | "medium" | "low";
  stage: string;
  confidence: number;
  description: string;
  astPattern: string;
  enabled: boolean;
}

export default function AstTaintRulesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>("all");

  const [rules, setRules] = React.useState<AstRule[]>([
    {
      id: "AST-PASS-01",
      name: "Reentrancy Call Graph Taint Analysis",
      swcId: "SWC-107",
      severity: "critical",
      stage: "Symbolic EVM Flow",
      confidence: 96,
      description: "Detects low-level external calls (`.call`, `.transfer`, `.send`) executing prior to internal state storage variable mutations.",
      astPattern: "FunctionCall[member='call'] -> StateVariableWrite",
      enabled: true,
    },
    {
      id: "AST-PASS-02",
      name: "Unchecked ERC-20 Return Value Check",
      swcId: "SWC-104",
      severity: "high",
      stage: "Static AST Pass",
      confidence: 94,
      description: "Flags direct `IERC20.transfer` or `transferFrom` calls without SafeERC20 wrapper or boolean return verification.",
      astPattern: "MemberAccess[name='transfer'] != SafeERC20.safeTransfer",
      enabled: true,
    },
    {
      id: "AST-PASS-03",
      name: "Unprotected Delegatecall / Selfdestruct Taint",
      swcId: "SWC-106",
      severity: "critical",
      stage: "Bytecode CFG",
      confidence: 99,
      description: "Identifies arbitrary user-controlled target addresses passed into `delegatecall` opcodes without access control modifier.",
      astPattern: "DelegateCallOpcode[!onlyOwner && !hasRole]",
      enabled: true,
    },
    {
      id: "AST-PASS-04",
      name: "Oracle Staleness & Min/Max Deviation Bounds",
      swcId: "SWC-114",
      severity: "high",
      stage: "Semantic Analysis",
      confidence: 89,
      description: "Validates that `latestRoundData()` consumes `updatedAt` and verifies `answeredInRound >= roundId` and non-zero prices.",
      astPattern: "AggregatorV3Interface.latestRoundData() -> MissingStalenessCheck",
      enabled: true,
    },
    {
      id: "AST-PASS-05",
      name: "Missing Zero-Address Parameter Guard",
      swcId: "SWC-105",
      severity: "medium",
      stage: "Static AST Pass",
      confidence: 91,
      description: "Flags constructor or setter functions accepting storage address pointers without `require(addr != address(0))` validation.",
      astPattern: "Assignment[StorageVariable, address] -> NoZeroCheck",
      enabled: true,
    },
    {
      id: "AST-PASS-06",
      name: "Read-Only Reentrancy across Curve/Uniswap Balances",
      swcId: "SWC-107-B",
      severity: "high",
      stage: "Cross-Contract Graph",
      confidence: 87,
      description: "Checks whether protocol queries external pool `get_virtual_price()` or `balanceOf()` during un-synced intermediate reentrant callback states.",
      astPattern: "ExternalViewCall[Curve/UniV2] -> StateComputation",
      enabled: true,
    },
    {
      id: "AST-PASS-07",
      name: "Block Timestamp Manipulation Drift",
      swcId: "SWC-116",
      severity: "low",
      stage: "Static AST Pass",
      confidence: 72,
      description: "Warns if `block.timestamp` is used for critical lottery randomness or tight deadline bounds under 15 seconds.",
      astPattern: "Identifier[block.timestamp] in RandomnessOrShortLock",
      enabled: true,
    },
    {
      id: "AST-PASS-08",
      name: "Strict Balance Equality Flaw (`address.balance == X`)",
      swcId: "SWC-132",
      severity: "medium",
      stage: "Static AST Pass",
      confidence: 95,
      description: "Flags contract logic depending on exact `address(this).balance == expectedAmount`, vulnerable to forced ETH injection via `selfdestruct`.",
      astPattern: "BinaryOperation[EQ, MemberAccess[balance]]",
      enabled: true,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.swcId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      selectedSeverity === "all" || r.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              AST Symbolic Taint Rules Engine
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Configure and calibrate the 14 automated AST taint execution passes used across auditor scans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge severity="resolved" size="sm">
            {activeCount}/{rules.length} PASSES ACTIVE
          </Badge>
          <Badge severity="informational" size="sm">
            SOLC v0.8.20 / v0.8.24
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AST rule by name, ID (#AST-PASS-), or SWC taxonomy..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-text-muted text-[11px] shrink-0">SEVERITY:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-3 font-mono text-xs">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-[4px] border space-y-3 transition-colors ${
              rule.enabled
                ? "bg-bg-panel border-border-hairline hover:border-accent-scan/40"
                : "bg-bg-void/60 border-border-hairline/60 opacity-60"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-accent-scan font-bold">{rule.id}</span>
                  <h3 className="font-display text-sm font-semibold text-text-primary font-sans">
                    {rule.name}
                  </h3>
                  <Badge severity={rule.severity} size="sm">
                    {rule.severity.toUpperCase()} ({rule.swcId})
                  </Badge>
                </div>
                <div className="text-[10px] text-text-muted">
                  ANALYSIS STAGE: {rule.stage} · BASELINE CONFIDENCE: {rule.confidence}%
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-xs font-mono transition-colors ${
                    rule.enabled
                      ? "bg-signal-resolved/10 border-signal-resolved/40 text-signal-resolved font-bold"
                      : "bg-bg-void border-border-hairline text-text-muted"
                  }`}
                >
                  {rule.enabled ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>ENABLED</span>
                    </>
                  ) : (
                    <span>DISABLED</span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-text-muted font-sans leading-relaxed">
              {rule.description}
            </p>

            <div className="p-2.5 rounded-[2px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-text-muted">
                <span className="text-[10px] text-accent-scan font-bold">AST PATTERN MATCHER:</span>
                <code className="text-text-primary font-mono text-[10px]">{rule.astPattern}</code>
              </div>
              <span className="text-[10px] text-text-muted shrink-0">EVM Engine: Symbolic Taint</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
