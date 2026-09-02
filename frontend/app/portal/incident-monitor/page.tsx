"use client";

import * as React from "react";
import Link from "next/link";
import {
  Radio,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingUp,
  Clock,
  Terminal,
  Filter,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";

interface MempoolEvent {
  id: string;
  txHash: string;
  targetContract: string;
  functionName: string;
  valueUSD: string;
  gasPriceGwei: number;
  threatLevel: "normal" | "medium" | "high" | "critical";
  status: string;
  timestamp: string;
  ceiStatus: "PASS" | "WARN" | "BLOCKED";
}

const MOCK_EVENTS: MempoolEvent[] = [
  {
    id: "EVT-8921",
    txHash: "0x9b2a74c108e4f1a23901bc94d7102e3b890a4128",
    targetContract: "VaultRouter.sol (0x7f2a...8901)",
    functionName: "depositAndAllocate(uint256,bytes)",
    valueUSD: "$1,420,500.00",
    gasPriceGwei: 24.5,
    threatLevel: "normal",
    status: "Verified Delta Neutral",
    timestamp: "12s ago",
    ceiStatus: "PASS",
  },
  {
    id: "EVT-8920",
    txHash: "0x4f1c9812e9b010c2837190820491823901a823b1",
    targetContract: "CurveTricryptoPool.sol (0x88e6...0684)",
    functionName: "exchange_underlying(int128,int128,uint256,uint256)",
    valueUSD: "$890,120.00",
    gasPriceGwei: 88.0,
    threatLevel: "medium",
    status: "Arbitrage Sandwich Detected (MEV)",
    timestamp: "24s ago",
    ceiStatus: "PASS",
  },
  {
    id: "EVT-8919",
    txHash: "0x8e0291ba09124a91b2901a82390184b910283019",
    targetContract: "LendingPoolCore.sol (0x1f98...f984)",
    functionName: "flashLoanSimple(address,uint256,bytes)",
    valueUSD: "$12,400,000.00",
    gasPriceGwei: 142.2,
    threatLevel: "high",
    status: "Flash Loan Reentrancy Guard Tripped",
    timestamp: "48s ago",
    ceiStatus: "BLOCKED",
  },
  {
    id: "EVT-8918",
    txHash: "0x3c2e109823b10293810293801298301928301928",
    targetContract: "ChainlinkOracleRelay.sol (0x54a1...9921)",
    functionName: "updateAnswer(int256,uint256)",
    valueUSD: "$0.00",
    gasPriceGwei: 19.8,
    threatLevel: "normal",
    status: "Oracle Price Heartbeat Update",
    timestamp: "1m ago",
    ceiStatus: "PASS",
  },
  {
    id: "EVT-8917",
    txHash: "0x1290381029381029381029381029381029381029",
    targetContract: "Permit2Vault.sol (0x0000...0022)",
    functionName: "permitTransferFrom(PermitBatch,Signature)",
    valueUSD: "$450,200.00",
    gasPriceGwei: 28.4,
    threatLevel: "normal",
    status: "Signature Replay Invariant Verified",
    timestamp: "1m ago",
    ceiStatus: "PASS",
  },
];

export default function IncidentMonitorPage() {
  const [selectedChain, setSelectedChain] = React.useState<"eth" | "arb" | "base" | "sol">("eth");
  const [searchFilter, setSearchFilter] = React.useState("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Eyebrow variant="scan">TELEMETRY · MEMPOOL RADAR</Eyebrow>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/20 text-signal-resolved font-mono text-[10px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved animate-pulse" />
              LIVE TELEMETRY ACTIVE
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
            Incident Monitor & Threat Radar
          </h1>
          <p className="text-sm text-text-muted font-sans max-w-2xl">
            Real-time on-chain mempool anomaly detection, MEV sandwich defense, and instant protocol exploit tripwires.
          </p>
        </div>

        {/* Chain Selector */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setSelectedChain("eth")}
            className={`px-3 py-1.5 rounded-[6px] border transition-colors ${
              selectedChain === "eth"
                ? "bg-accent-scan text-bg-void border-accent-scan font-bold"
                : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            Ethereum L1
          </button>
          <button
            onClick={() => setSelectedChain("arb")}
            className={`px-3 py-1.5 rounded-[6px] border transition-colors ${
              selectedChain === "arb"
                ? "bg-accent-scan text-bg-void border-accent-scan font-bold"
                : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            Arbitrum
          </button>
          <button
            onClick={() => setSelectedChain("base")}
            className={`px-3 py-1.5 rounded-[6px] border transition-colors ${
              selectedChain === "base"
                ? "bg-accent-scan text-bg-void border-accent-scan font-bold"
                : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            Base
          </button>
          <button
            onClick={() => setSelectedChain("sol")}
            className={`px-3 py-1.5 rounded-[6px] border transition-colors ${
              selectedChain === "sol"
                ? "bg-accent-scan text-bg-void border-accent-scan font-bold"
                : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            Solana
          </button>
        </div>
      </div>

      {/* Real-time Status KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>MEMPOOL LATENCY</span>
            <Activity className="h-3.5 w-3.5 text-signal-resolved" />
          </div>
          <div className="font-display text-2xl font-medium text-signal-resolved">0.12s</div>
          <div className="text-[11px] font-mono text-text-muted">14,892 Nodes Synchronized</div>
        </div>

        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>ACTIVE BLOCK</span>
            <Radio className="h-3.5 w-3.5 text-accent-scan animate-pulse" />
          </div>
          <div className="font-display text-2xl font-medium text-text-primary">#19,842,109</div>
          <div className="text-[11px] font-mono text-signal-resolved">12.1s Block Time · Steady</div>
        </div>

        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>24H MONITORED TVL</span>
            <Lock className="h-3.5 w-3.5 text-accent-scan" />
          </div>
          <div className="font-display text-2xl font-medium text-text-primary">$4.28B+</div>
          <div className="text-[11px] font-mono text-text-muted">38 Protocol Contracts Active</div>
        </div>

        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>TRIPPED TRIPWIRES</span>
            <ShieldCheck className="h-3.5 w-3.5 text-signal-resolved" />
          </div>
          <div className="font-display text-2xl font-medium text-signal-resolved">0 Active</div>
          <div className="text-[11px] font-mono text-signal-resolved">1 Flashloan Intercepted</div>
        </div>
      </div>

      {/* Live Mempool Telemetry Spectrum Bar Visualizer */}
      <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-hairline font-mono text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent-scan" />
            <span className="font-bold text-text-primary">REAL-TIME TRANSACTION INGESTION & GAS SPIKE SPECTRUM</span>
          </div>
          <div className="flex items-center gap-4 text-text-muted text-[11px]">
            <span>Mean Gas: 24.5 Gwei</span>
            <span className="text-signal-resolved">Peak: 142.2 Gwei (Flash Loan)</span>
          </div>
        </div>

        {/* Dynamic Spectrum Wave Simulation */}
        <div className="flex items-end justify-between gap-1.5 h-20 px-2 py-1 bg-bg-void/80 rounded-[8px] border border-white/[0.04]">
          <div className="w-full bg-accent-scan/20 rounded-t h-[30%] hover:bg-accent-scan/40 transition-all" title="T-60s: 22 Gwei" />
          <div className="w-full bg-accent-scan/25 rounded-t h-[45%] hover:bg-accent-scan/40 transition-all" title="T-55s: 25 Gwei" />
          <div className="w-full bg-accent-scan/20 rounded-t h-[35%] hover:bg-accent-scan/40 transition-all" title="T-50s: 21 Gwei" />
          <div className="w-full bg-accent-scan/35 rounded-t h-[60%] hover:bg-accent-scan/50 transition-all" title="T-45s: 38 Gwei" />
          <div className="w-full bg-accent-scan/40 rounded-t h-[50%] hover:bg-accent-scan/50 transition-all" title="T-40s: 32 Gwei" />
          <div className="w-full bg-accent-scan/30 rounded-t h-[40%] hover:bg-accent-scan/40 transition-all" title="T-35s: 26 Gwei" />
          <div className="w-full bg-signal-high/60 rounded-t h-[85%] hover:bg-signal-high transition-all" title="T-30s: 88 Gwei (MEV Arb)" />
          <div className="w-full bg-accent-scan/45 rounded-t h-[65%] hover:bg-accent-scan/60 transition-all" title="T-25s: 42 Gwei" />
          <div className="w-full bg-accent-scan/30 rounded-t h-[40%] hover:bg-accent-scan/40 transition-all" title="T-20s: 28 Gwei" />
          <div className="w-full bg-signal-critical rounded-t h-[100%] hover:brightness-125 transition-all" title="T-15s: 142 Gwei (Flash Loan Sweep Blocked)" />
          <div className="w-full bg-accent-scan/60 rounded-t h-[75%] hover:bg-accent-scan/75 transition-all" title="T-10s: 48 Gwei" />
          <div className="w-full bg-accent-scan/35 rounded-t h-[45%] hover:bg-accent-scan/50 transition-all" title="T-5s: 29 Gwei" />
          <div className="w-full bg-accent-scan rounded-t h-[35%] animate-pulse" title="NOW: 24.5 Gwei" />
        </div>
      </div>

      {/* Live Mempool Stream Table */}
      <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Terminal className="h-4 w-4 text-accent-scan" />
            <h2 className="font-bold text-text-primary">LIVE INGESTION RADAR FEED</h2>
            <Badge severity="informational" size="sm">5 TRANSACTIONS IN QUEUE</Badge>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by target or hash..."
              className="pl-9 font-mono text-xs bg-bg-void border-border-hairline h-8 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border-hairline/60 text-[11px] text-text-muted">
                <th className="pb-2 font-medium">EVENT / HASH</th>
                <th className="pb-2 font-medium">TARGET CONTRACT</th>
                <th className="pb-2 font-medium">FUNCTION INVOCATION</th>
                <th className="pb-2 font-medium">VOLUME</th>
                <th className="pb-2 font-medium">GAS</th>
                <th className="pb-2 font-medium">CEI INVARIANT</th>
                <th className="pb-2 font-medium text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline/40">
              {MOCK_EVENTS.map((evt) => (
                <tr key={evt.id} className="hover:bg-bg-panel-raised/50 transition-colors group">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-primary font-bold">{evt.id}</span>
                      <span className="text-[10px] text-accent-scan truncate max-w-[90px]">
                        {evt.txHash.slice(0, 10)}...
                      </span>
                    </div>
                  </td>

                  <td className="py-3 pr-3 text-text-muted">
                    <div className="text-text-primary font-medium">{evt.targetContract.split(" ")[0]}</div>
                    <div className="text-[10px] text-text-muted">{evt.targetContract.split(" ")[1]}</div>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="text-text-primary font-medium">{evt.functionName}</div>
                    <div className={`text-[10px] ${
                      evt.threatLevel === "critical"
                        ? "text-signal-critical font-bold"
                        : evt.threatLevel === "high"
                        ? "text-signal-high font-bold"
                        : evt.threatLevel === "medium"
                        ? "text-accent-scan"
                        : "text-text-muted"
                    }`}>
                      {evt.status}
                    </div>
                  </td>

                  <td className="py-3 pr-3 text-text-primary font-medium">
                    {evt.valueUSD}
                  </td>

                  <td className="py-3 pr-3 text-text-muted">
                    {evt.gasPriceGwei} Gwei
                  </td>

                  <td className="py-3 pr-3">
                    {evt.ceiStatus === "PASS" ? (
                      <span className="px-2 py-0.5 rounded-[4px] bg-signal-resolved/10 text-signal-resolved font-bold text-[10px]">
                        PASS ✓
                      </span>
                    ) : evt.ceiStatus === "BLOCKED" ? (
                      <span className="px-2 py-0.5 rounded-[4px] bg-signal-critical/15 text-signal-critical font-bold text-[10px]">
                        BLOCKED ⚠
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-[4px] bg-signal-medium/15 text-signal-medium font-bold text-[10px]">
                        WARN
                      </span>
                    )}
                  </td>

                  <td className="py-3 text-right text-text-muted text-[11px]">
                    {evt.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
