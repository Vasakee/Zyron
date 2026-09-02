"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal,
  Activity,
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Sliders,
  Sparkles,
  BarChart3,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";

export default function TokenRiskPage() {
  const [tokenAddress, setTokenAddress] = React.useState("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984");
  const [isScanning, setIsScanning] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "honeypot" | "bytecode" | "liquidity">("overview");

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Eyebrow variant="scan">SECURITY LAB · AUTOMATED ANALYSIS</Eyebrow>
            <Badge severity="resolved" size="sm">AST ENGINE ACTIVE</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
            Token Risk Analyzer
          </h1>
          <p className="text-sm text-text-muted font-sans max-w-2xl">
            Real-time heuristic & dynamic sandbox testing for ERC-20, SPL, and cross-chain tokens. Detect honeypots, hidden burn triggers, and proxy backdoors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning} className="gap-1.5 font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-accent-scan" : ""}`} />
            <span>Re-Verify AST</span>
          </Button>
          <Button variant="primary" size="sm" className="gap-1.5 font-mono text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Export Attestation</span>
          </Button>
        </div>
      </div>

      {/* Search & Query Bar */}
      <div className="p-4 rounded-[12px] bg-bg-panel border border-border-hairline flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter token contract address (e.g. 0x1f98... or SOL mint)"
            className="pl-10 font-mono text-xs bg-bg-void border-border-hairline h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-[6px] bg-bg-panel-raised border border-border-hairline text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1 font-mono"
            title="Copy Address"
          >
            {copied ? <Check className="h-4 w-4 text-signal-resolved" /> : <Copy className="h-4 w-4" />}
          </button>
          <Button variant="primary" size="md" onClick={handleScan} className="gap-2 font-mono text-xs w-full md:w-auto">
            <Zap className="h-3.5 w-3.5" />
            <span>Analyze Token</span>
          </Button>
        </div>
      </div>

      {/* Token Identity & Market Telemetry Card */}
      <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border-hairline/60">
          {/* Left: Token Logo & Core Details */}
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Glowing Logo Badge */}
            <div className="h-12 w-12 rounded-[10px] bg-gradient-to-br from-accent-scan/20 to-signal-resolved/10 border border-accent-scan/40 flex items-center justify-center font-mono font-bold text-accent-scan text-base shrink-0 shadow-lg shadow-accent-scan/10">
              $ZAM
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-medium text-text-primary">
                  Zyron Protocol
                </h2>
                <span className="font-mono text-xs text-accent-scan font-bold px-2 py-0.5 rounded bg-accent-scan/10 border border-accent-scan/20">
                  $ZAM
                </span>
                <span className="font-mono text-[10px] text-signal-resolved px-2 py-0.5 rounded bg-signal-resolved/10 border border-signal-resolved/20">
                  ERC-20 · ETHEREUM MAINNET
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
                <span>Contract: 0x1f98...F984</span>
                <span>•</span>
                <span>Created: Block #10,861,674 (4.2 yrs)</span>
                <span>•</span>
                <span className="text-signal-resolved">Audit Verified (ZAM-9481) ✓</span>
              </div>
            </div>
          </div>

          {/* Right: Live Price & 24h Delta */}
          <div className="flex items-baseline lg:flex-col lg:items-end gap-2 lg:gap-0.5 shrink-0 font-mono">
            <div className="text-2xl font-display font-medium text-text-primary">$12.48 USD</div>
            <div className="text-xs text-signal-resolved flex items-center gap-1 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>+4.82% (24h)</span>
            </div>
          </div>
        </div>

        {/* 6-Column Market & Tokenomics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded-[8px] bg-bg-void/80 border border-white/[0.04] space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Market Cap</div>
            <div className="text-sm font-bold text-text-primary">$7.48B</div>
            <div className="text-[9px] text-text-muted">FDV: $12.48B</div>
          </div>

          <div className="p-3 rounded-[8px] bg-bg-void/80 border border-white/[0.04] space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">24h Volume</div>
            <div className="text-sm font-bold text-text-primary">$248.5M</div>
            <div className="text-[9px] text-signal-resolved">+18.4% vs 7d avg</div>
          </div>

          <div className="p-3 rounded-[8px] bg-bg-void/80 border border-white/[0.04] space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Token Holders</div>
            <div className="text-sm font-bold text-text-primary">384,192</div>
            <div className="text-[9px] text-text-muted">+1,420 in 24h</div>
          </div>

          <div className="p-3 rounded-[8px] bg-bg-void/80 border border-white/[0.04] space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">DEX Liquidity</div>
            <div className="text-sm font-bold text-signal-resolved">$34.2M</div>
            <div className="text-[9px] text-text-muted">UniV3 + Curve</div>
          </div>

          <div className="p-3 rounded-[8px] bg-bg-void/80 border border-white/[0.04] space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Total Supply</div>
            <div className="text-sm font-bold text-text-primary">1,000,000,000</div>
            <div className="text-[9px] text-text-muted">Fixed · Non-mintable</div>
          </div>

          <div className="p-3 rounded-[8px] bg-bg-void/80 border border-white/[0.04] space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Circulating</div>
            <div className="text-sm font-bold text-text-primary">600,000,000</div>
            <div className="text-[9px] text-text-muted">60.00% of Total</div>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Safety Score */}
        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>SAFETY SCORE</span>
            <ShieldCheck className="h-4 w-4 text-signal-resolved" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-signal-resolved">99</span>
            <span className="font-mono text-xs text-text-muted">/ 100</span>
          </div>
          <div className="text-[11px] font-mono text-signal-resolved flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Clean · 0 High-risk flags</span>
          </div>
        </div>

        {/* Metric 2: Tax Breakdown */}
        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>BUY / SELL TAX</span>
            <Percent className="h-4 w-4 text-accent-scan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-text-primary">0.00%</span>
            <span className="font-mono text-xs text-text-muted">/ 0.00%</span>
          </div>
          <div className="text-[11px] font-mono text-signal-resolved">
            Fixed in Bytecode · Unmodifiable
          </div>
        </div>

        {/* Metric 3: Ownership Status */}
        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>OWNERSHIP</span>
            <Lock className="h-4 w-4 text-signal-resolved" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-medium text-signal-resolved">Renounced</span>
          </div>
          <div className="text-[11px] font-mono text-text-muted truncate">
            Owner: 0x0000...0000 (Burned)
          </div>
        </div>

        {/* Metric 4: Liquidity Lock */}
        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>LIQUIDITY LOCK</span>
            <TrendingUp className="h-4 w-4 text-signal-resolved" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-signal-resolved">100%</span>
            <span className="font-mono text-xs text-text-muted">Locked</span>
          </div>
          <div className="text-[11px] font-mono text-text-muted">
            Uniswap V3 · 730d remaining
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border-hairline font-mono text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "overview"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Diagnostic Matrix
        </button>
        <button
          onClick={() => setActiveTab("honeypot")}
          className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "honeypot"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Honeypot Sandbox Simulation
        </button>
        <button
          onClick={() => setActiveTab("bytecode")}
          className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "bytecode"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          AST Bytecode Invariants
        </button>
        <button
          onClick={() => setActiveTab("liquidity")}
          className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "liquidity"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          DEX Pools & Liquidity Locks
        </button>
      </div>

      {/* Tab 1: Diagnostic Matrix */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Security Invariant Table */}
          <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent-scan" />
                <h2 className="font-mono text-xs font-semibold text-text-primary">
                  CONTRACT HEURISTICS & PERMISSIONS
                </h2>
              </div>
              <Badge severity="resolved" size="sm">0 VULNERABILITIES</Badge>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-[6px] bg-bg-void/80 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Minting Capability</div>
                  <div className="text-[10px] text-text-muted">Total supply fixed at 1,000,000,000 $ZAM</div>
                </div>
                <Badge severity="resolved" size="sm">DISABLED ✓</Badge>
              </div>

              <div className="p-3 rounded-[6px] bg-bg-void/80 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Proxy & Upgradeability</div>
                  <div className="text-[10px] text-text-muted">Standard ERC-20, no diamond/ERC-1967 delegatecall</div>
                </div>
                <Badge severity="resolved" size="sm">IMMUTABLE ✓</Badge>
              </div>

              <div className="p-3 rounded-[6px] bg-bg-void/80 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Blacklist / Freeze Mechanism</div>
                  <div className="text-[10px] text-text-muted">No caller blocking or balance freezing methods detected</div>
                </div>
                <Badge severity="resolved" size="sm">NOT PRESENT ✓</Badge>
              </div>

              <div className="p-3 rounded-[6px] bg-bg-void/80 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Max Transaction / Wallet Limits</div>
                  <div className="text-[10px] text-text-muted">No anti-whale balance throttling or transfer ceilings</div>
                </div>
                <Badge severity="informational" size="sm">UNCAPPED</Badge>
              </div>

              <div className="p-3 rounded-[6px] bg-bg-void/80 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">External Call in _transfer</div>
                  <div className="text-[10px] text-text-muted">Checks-Effects-Interactions clean, no reentrancy hooks</div>
                </div>
                <Badge severity="resolved" size="sm">SAFE ✓</Badge>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Honeypot Trace */}
          <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-signal-resolved" />
                <h2 className="font-mono text-xs font-semibold text-text-primary">
                  EVM SANDBOX EXECUTION LOG
                </h2>
              </div>
              <span className="text-[10px] font-mono text-text-muted">Fork #19,842,109</span>
            </div>

            <div className="p-4 rounded-[8px] bg-bg-void font-mono text-[11px] space-y-2 text-text-muted border border-white/[0.04]">
              <div className="text-accent-scan font-semibold">[SIMULATION SETUP]</div>
              <div>→ Initializing local Anvil fork at block #19,842,109...</div>
              <div>→ Funder account: 0x7099...79C8 (Balance: 100.0 ETH)</div>
              <div>→ DEX Target: Uniswap V3 Pool (0x88e6...0684)</div>

              <div className="text-signal-resolved font-semibold pt-1">[STEP 1: BUY EXECUTION]</div>
              <div>→ execute: swapExactETHForTokens(amount: 1.0 ETH)</div>
              <div>→ Gas used: 114,289 gas</div>
              <div>→ Tokens received: 42,918.42 $ZAM</div>
              <div>→ Effective buy fee deducted: 0.00% (PASS)</div>

              <div className="text-signal-resolved font-semibold pt-1">[STEP 2: SELL EXECUTION]</div>
              <div>→ execute: approve(UniswapRouter, MAX_UINT256)</div>
              <div>→ execute: swapExactTokensForETH(amount: 42,918.42 $ZAM)</div>
              <div>→ Gas used: 91,402 gas</div>
              <div>→ ETH received: 0.9982 ETH (after DEX fee)</div>
              <div>→ Effective sell fee deducted: 0.00% (PASS)</div>

              <div className="p-2 rounded bg-signal-resolved/10 border border-signal-resolved/20 text-signal-resolved font-bold flex items-center justify-between text-[11px]">
                <span>✓ HONEYPOT INVARIANT: PASSED</span>
                <span>GAS DELTA: OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Honeypot Simulation */}
      {activeTab === "honeypot" && (
        <div className="p-6 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div>
              <h2 className="font-display text-lg font-medium text-text-primary">Multi-DEX Sandbox Test Suite</h2>
              <p className="text-xs text-text-muted font-sans">Simulating sequential swaps, fee delta verifications, and gas exhaustion traps.</p>
            </div>
            <Badge severity="resolved">100% SUCCESS RATE</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-[8px] bg-bg-void border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between text-text-primary font-bold">
                <span>Uniswap V3 (0.05%)</span>
                <span className="text-signal-resolved">PASSED</span>
              </div>
              <div className="text-[11px] text-text-muted space-y-1">
                <div>Buy Gas: 114,289</div>
                <div>Sell Gas: 91,402</div>
                <div>Slippage: 0.04%</div>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-bg-void border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between text-text-primary font-bold">
                <span>Uniswap V2 (0.30%)</span>
                <span className="text-signal-resolved">PASSED</span>
              </div>
              <div className="text-[11px] text-text-muted space-y-1">
                <div>Buy Gas: 98,420</div>
                <div>Sell Gas: 84,109</div>
                <div>Slippage: 0.28%</div>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-bg-void border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between text-text-primary font-bold">
                <span>Curve Tricrypto</span>
                <span className="text-signal-resolved">PASSED</span>
              </div>
              <div className="text-[11px] text-text-muted space-y-1">
                <div>Buy Gas: 142,109</div>
                <div>Sell Gas: 128,400</div>
                <div>Slippage: 0.01%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AST Bytecode */}
      {activeTab === "bytecode" && (
        <div className="p-6 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div>
              <h2 className="font-display text-lg font-medium text-text-primary">Disassembled AST Opcodes</h2>
              <p className="text-xs text-text-muted font-sans">Formal verification proof showing non-reentrancy and zero hidden balance drains.</p>
            </div>
            <Badge severity="low">SOLC 0.8.24</Badge>
          </div>

          <div className="p-4 rounded-[8px] bg-bg-void font-mono text-xs text-text-muted space-y-1 overflow-x-auto max-h-[300px] border border-white/[0.04]">
            <div className="text-accent-scan">// Verified bytecode decompilation - Hash: 0x7f2a...98e1</div>
            <div>[0000] PUSH1 0x80</div>
            <div>[0002] PUSH1 0x40</div>
            <div>[0004] MSTORE</div>
            <div>[0005] CALLVALUE</div>
            <div>[0006] DUP1</div>
            <div>[0007] ISZERO</div>
            <div>[0008] PUSH2 0x0010</div>
            <div>[000B] JUMPI</div>
            <div>[000C] PUSH1 0x00</div>
            <div>[000E] DUP1</div>
            <div>[000F] REVERT</div>
            <div className="text-signal-resolved">[0010] JUMPDEST // transfer(address,uint256) signature 0xa9059cbb verified</div>
            <div>[0011] PUSH1 0x04</div>
            <div>[0013] CALLDATASIZE</div>
            <div>[0014] LT</div>
            <div>[0015] PUSH2 0x0020</div>
            <div>[0018] JUMPI</div>
            <div className="text-signal-resolved">// CEI validation passed without delegatecall traps</div>
          </div>
        </div>
      )}

      {/* Tab 4: Liquidity */}
      {activeTab === "liquidity" && (
        <div className="p-6 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div>
              <h2 className="font-display text-lg font-medium text-text-primary">Liquidity Lock Proofs</h2>
              <p className="text-xs text-text-muted font-sans">Cryptographically verified LP token lockup on Uncx / Team.Finance.</p>
            </div>
            <Badge severity="resolved">100% LOCKED</Badge>
          </div>

          <div className="p-4 rounded-[8px] bg-bg-void border border-white/[0.04] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Lock Contract:</span>
              <span className="text-text-primary">0x663A5C229c09b049E36dCc11a9B0d4a8EB9db214 (Uncx Network)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Total Locked:</span>
              <span className="text-signal-resolved font-bold">$14,280,000.00 USD (100.00% of Pool)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Unlock Timestamp:</span>
              <span className="text-text-primary">2028-08-24 00:00:00 UTC (730 days remaining)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Beneficiary:</span>
              <span className="text-text-primary">0x0000...0000 (Burned Vault)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
