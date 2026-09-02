"use client";

import * as React from "react";
import Link from "next/link";
import {
  Inbox,
  AlertTriangle,
  GitCommit,
  Clock,
  CheckCircle2,
  User,
  ArrowRight,
  Filter,
  Search,
  ArrowUpDown,
  Check,
  Split,
  FileCode2,
  ShieldAlert,
  Layers,
  Sparkles,
  Radio,
  Cpu,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";

interface ReverifyTicket {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  sloc: number;
  compiler: string;
  fixCommit: string;
  clientComment: string;
  submittedAt: string;
  findingAnchor: string;
  swcId: string;
  severity: "critical" | "high" | "medium";
  slaDeadline: string;
}

interface ClaimedTicket {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  sloc: number;
  compiler: string;
  stage: "scanning" | "in-review";
  submittedAt: string;
  slaDeadline: string;
  currentActivity: string;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface UnclaimedTicket {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  sloc: number;
  compiler: string;
  submittedAt: string;
  slaDeadline: string;
  astCandidateSummary: string;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export default function AuditorTicketQueuePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"sla" | "newest" | "sloc">("sla");

  // Awaiting Re-Verification state (client posted a fix commit comment)
  const [reverifyTickets, setReverifyTickets] = React.useState<ReverifyTicket[]>([
    {
      id: "ZAM-9481",
      protocolName: "Aura Liquidity Pool V3",
      contractFileName: "VaultCore.sol",
      contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      sloc: 2410,
      compiler: "v0.8.20",
      fixCommit: "4b8f10e",
      clientComment: "Applied OpenZeppelin SafeERC20 wrapper on line 146 & updated unit tests.",
      submittedAt: "3 hours ago",
      findingAnchor: "VaultCore.sol:146",
      swcId: "SWC-104",
      severity: "high",
      slaDeadline: "2026-08-21 18:00 UTC",
    },
    {
      id: "ZAM-9478",
      protocolName: "Nexus Collateral Vault",
      contractFileName: "CollateralManager.sol",
      contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      sloc: 1180,
      compiler: "v0.8.24",
      fixCommit: "3c1a9f0",
      clientComment: "Enforced MAX_ORACLE_DELAY = 3600s staleness bounds on latestRoundData().",
      submittedAt: "1 day ago",
      findingAnchor: "CollateralManager.sol:62",
      swcId: "SWC-114",
      severity: "medium",
      slaDeadline: "2026-08-20 12:00 UTC",
    },
  ]);

  // My Claimed Tickets state
  const [claimedTickets, setClaimedTickets] = React.useState<ClaimedTicket[]>([
    {
      id: "ZAM-9481",
      protocolName: "Aura Liquidity Pool V3",
      contractFileName: "VaultCore.sol",
      contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      sloc: 2410,
      compiler: "v0.8.20",
      stage: "scanning",
      submittedAt: "2026-08-18 21:30 UTC",
      slaDeadline: "2026-08-21 18:00 UTC",
      currentActivity: "Symbolic EVM execution pass 11/14 active",
      findings: { critical: 1, high: 1, medium: 2, low: 0 },
    },
    {
      id: "ZAM-9478",
      protocolName: "Nexus Collateral Vault",
      contractFileName: "CollateralManager.sol",
      contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      sloc: 1180,
      compiler: "v0.8.24",
      stage: "in-review",
      submittedAt: "2026-08-17 14:15 UTC",
      slaDeadline: "2026-08-20 12:00 UTC",
      currentActivity: "Manual line review: liquidation fee precision & invariant check",
      findings: { critical: 0, high: 2, medium: 1, low: 3 },
    },
  ]);

  // Unclaimed Ingestion Queue state
  const [unclaimedTickets, setUnclaimedTickets] = React.useState<UnclaimedTicket[]>([
    {
      id: "ZAM-9485",
      protocolName: "PerpetualOrderBook",
      contractFileName: "OrderEngine.sol",
      contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
      sloc: 3240,
      compiler: "v0.8.23",
      submittedAt: "2026-08-19 22:45 UTC",
      slaDeadline: "2026-08-23 00:00 UTC",
      astCandidateSummary: "2 High candidates detected in pre-compilation AST taint pass",
      findings: { critical: 0, high: 2, medium: 1, low: 1 },
    },
    {
      id: "ZAM-9492",
      protocolName: "ZeroKnowledgeVerifier",
      contractFileName: "ZKVerifier.sol",
      contractAddress: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      sloc: 890,
      compiler: "v0.8.24",
      submittedAt: "2026-08-20 11:15 UTC",
      slaDeadline: "2026-08-22 18:00 UTC",
      astCandidateSummary: "1 Critical candidate: pairing check loop invariant flaw",
      findings: { critical: 1, high: 0, medium: 1, low: 0 },
    },
  ]);

  // Toast / Status feedback when claiming a ticket
  const [claimedToast, setClaimedToast] = React.useState<string | null>(null);

  // Claim action: moves an unclaimed ticket into claimedTickets
  const handleClaimTicket = (ticket: UnclaimedTicket) => {
    setUnclaimedTickets((prev) => prev.filter((t) => t.id !== ticket.id));

    const newClaimed: ClaimedTicket = {
      id: ticket.id,
      protocolName: ticket.protocolName,
      contractFileName: ticket.contractFileName,
      contractAddress: ticket.contractAddress,
      sloc: ticket.sloc,
      compiler: ticket.compiler,
      stage: "in-review",
      submittedAt: ticket.submittedAt,
      slaDeadline: ticket.slaDeadline,
      currentActivity: "Assigned to 0xAuditor_K4 — Initial manual review pass queued",
      findings: ticket.findings,
    };

    setClaimedTickets((prev) => [newClaimed, ...prev]);
    setClaimedToast(`Claimed ${ticket.id} (${ticket.protocolName})`);
    setTimeout(() => setClaimedToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* QUEUE HEADER & TELEMETRY */}
      <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// AUDITOR_WORKSPACE · ">
                TICKET_QUEUE_TRIAGE
              </Eyebrow>
              <Badge severity="high" size="sm">
                LEAD AUDITOR QUEUE
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Internal Ticket Queue Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
              Utilitarian triage workbench for assigned reviews, incoming scope ingestion, and pending client remediation re-verification passes.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <div className="p-3 rounded-[4px] bg-bg-void border border-signal-high/30 space-y-0.5">
              <div className="text-text-muted text-[10px]">AWAITING RE-TEST</div>
              <div className="text-lg font-bold text-signal-high font-display">
                {reverifyTickets.length} Commits
              </div>
            </div>

            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-0.5">
              <div className="text-text-muted text-[10px]">MY CLAIMED</div>
              <div className="text-lg font-bold text-accent-scan font-display">
                {claimedTickets.length} Tickets
              </div>
            </div>

            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-0.5">
              <div className="text-text-muted text-[10px]">UNCLAIMED INTAKE</div>
              <div className="text-lg font-bold text-text-primary font-display">
                {unclaimedTickets.length} Scopes
              </div>
            </div>
          </div>
        </div>

        {/* Claim Feedback Toast */}
        {claimedToast && (
          <div className="p-3 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/40 text-signal-resolved font-mono text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{claimedToast} — Transferred to "My Claimed Tickets".</span>
            </div>
            <span className="text-[10px] text-text-muted">Assigned Lead: 0xAuditor_K4</span>
          </div>
        )}
      </section>

      {/* FILTER, SEARCH & SORT UTILITY CONTROLS */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Search tickets, commits, addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
              className="h-8 text-xs bg-bg-void"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[11px]">SEVERITY:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Candidates Only</option>
              <option value="high">High Candidates Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[11px]">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
            >
              <option value="sla">SLA Urgency (Nearest Deadline)</option>
              <option value="newest">Newest Ingested</option>
              <option value="sloc">SLOC Count (Largest First)</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-text-muted flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
          <span>AST ENGINE QUEUE: REAL-TIME SYNC</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* GROUP 1: AWAITING RE-VERIFICATION (CRITICALLY & DISTINCTLY HIGHLIGHTED)   */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="p-4 rounded-[4px] bg-signal-high/10 border border-signal-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-mono">
            <span className="h-2.5 w-2.5 rounded-full bg-signal-high animate-ping" />
            <span className="font-bold text-signal-high text-xs tracking-wider uppercase">
              Awaiting Re-Verification ({reverifyTickets.length} Tickets)
            </span>
            <span className="text-text-muted text-xs hidden sm:inline">
              · Client has submitted new fix commit references pending your re-audit
            </span>
          </div>

          <span className="font-mono text-[11px] text-signal-high font-semibold bg-signal-high/15 px-2 py-0.5 rounded-[2px] border border-signal-high/30 self-start sm:self-auto">
            PRIORITY ACTION REQUIRED
          </span>
        </div>

        {/* Re-Verification Tickets Rows */}
        <div className="space-y-3">
          {reverifyTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-[4px] bg-bg-panel border-2 border-signal-high/40 hover:border-signal-high transition-colors space-y-4 font-mono text-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-accent-scan font-bold text-sm">
                      {ticket.id}
                    </span>
                    <h3 className="font-display text-base font-semibold text-text-primary">
                      {ticket.protocolName}
                    </h3>
                    <span className="text-text-muted text-xs">
                      ({ticket.contractFileName})
                    </span>
                    <Badge severity={ticket.severity} size="sm">
                      {ticket.severity.toUpperCase()} ({ticket.swcId})
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                    <span>ANCHOR: {ticket.findingAnchor}</span>
                    <span>·</span>
                    <span>SCOPE: {ticket.sloc.toLocaleString()} SLOC</span>
                    <span>·</span>
                    <span>COMPILER: {ticket.compiler}</span>
                    <span>·</span>
                    <span className="text-signal-high font-medium">
                      SUBMITTED: {ticket.submittedAt}
                    </span>
                  </div>
                </div>

                {/* Direct Review Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/auditor/review/${ticket.id}`}>
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-signal-high hover:bg-signal-high/90 text-bg-void font-bold"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Review Fix Commit ({ticket.fixCommit})
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Client Submitted Fix Callout */}
              <div className="p-3 rounded-[3px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <GitCommit className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5 sm:mt-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-signal-resolved font-bold">CLIENT FIX COMMIT:</span>
                      <code className="bg-bg-panel px-1.5 py-0.2 rounded border border-signal-resolved/40 text-text-primary font-bold text-[11px]">
                        {ticket.fixCommit}
                      </code>
                    </div>
                    <p className="text-text-muted font-sans text-xs italic">
                      "{ticket.clientComment}"
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-text-muted shrink-0 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-accent-scan" />
                  <span>SLA ETA: {ticket.slaDeadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* GROUP 2: MY CLAIMED TICKETS (ACTIVE WORKSTREAM)                          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <div className="flex items-center gap-2 font-mono text-xs">
            <User className="h-3.5 w-3.5 text-accent-scan" />
            <span className="font-bold text-text-primary uppercase tracking-wider">
              My Claimed Tickets ({claimedTickets.length})
            </span>
            <span className="text-text-muted hidden sm:inline">
              · Actively Assigned to 0xAuditor_K4
            </span>
          </div>

          <span className="font-mono text-xs text-text-muted">
            DUAL-AUDITOR PEER REVIEW ACTIVE
          </span>
        </div>

        {/* Claimed Tickets Rows */}
        <div className="space-y-3">
          {claimedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-[4px] bg-bg-panel border border-border-hairline hover:border-hairline/90 transition-colors space-y-3 font-mono text-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-accent-scan font-bold text-sm">
                      {ticket.id}
                    </span>
                    <h3 className="font-display text-base font-semibold text-text-primary">
                      {ticket.protocolName}
                    </h3>
                    <span className="text-text-muted text-xs">
                      ({ticket.contractFileName})
                    </span>
                    <StatusPill status={ticket.stage} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                    <span>ADDR: {ticket.contractAddress.slice(0, 10)}...{ticket.contractAddress.slice(-6)}</span>
                    <span>·</span>
                    <span>SCOPE: {ticket.sloc.toLocaleString()} SLOC</span>
                    <span>·</span>
                    <span>COMPILER: {ticket.compiler}</span>
                    <span>·</span>
                    <span className="text-signal-resolved">SLA: {ticket.slaDeadline}</span>
                  </div>

                  <div className="text-xs text-text-muted font-sans pt-0.5">
                    Activity: <span className="text-text-primary">{ticket.currentActivity}</span>
                  </div>
                </div>

                {/* Severity Breakdown & Action */}
                <div className="flex flex-wrap items-center gap-4 self-end lg:self-auto shrink-0">
                  {/* Severity Counters */}
                  <div className="flex items-center gap-1.5">
                    {ticket.findings.critical > 0 && (
                      <Badge severity="critical" size="sm">
                        {ticket.findings.critical} CRIT
                      </Badge>
                    )}
                    {ticket.findings.high > 0 && (
                      <Badge severity="high" size="sm">
                        {ticket.findings.high} HIGH
                      </Badge>
                    )}
                    {ticket.findings.medium > 0 && (
                      <Badge severity="medium" size="sm">
                        {ticket.findings.medium} MED
                      </Badge>
                    )}
                  </div>

                  <Link href={`/auditor/review/${ticket.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<Split className="h-3.5 w-3.5 text-accent-scan" />}>
                      Open Workbench
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* GROUP 3: UNCLAIMED INGESTION QUEUE (NEW INTAKE)                          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Inbox className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-bold text-text-primary uppercase tracking-wider">
              Unclaimed Ingestion Queue ({unclaimedTickets.length})
            </span>
            <span className="text-text-muted hidden sm:inline">
              · Fresh Ingestions Awaiting Auditor Assignment
            </span>
          </div>

          <span className="font-mono text-xs text-accent-scan">
            OPEN FOR CLAIM
          </span>
        </div>

        {/* Unclaimed Rows */}
        {unclaimedTickets.length > 0 ? (
          <div className="space-y-3">
            {unclaimedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-[4px] bg-bg-panel/70 border border-border-hairline hover:border-accent-scan/40 transition-colors space-y-3 font-mono text-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-text-muted font-bold text-sm">
                        {ticket.id}
                      </span>
                      <h3 className="font-display text-base font-semibold text-text-primary">
                        {ticket.protocolName}
                      </h3>
                      <span className="text-text-muted text-xs">
                        ({ticket.contractFileName})
                      </span>
                      <Badge severity="informational" size="sm">
                        UNCLAIMED
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                      <span>SCOPE: {ticket.sloc.toLocaleString()} SLOC</span>
                      <span>·</span>
                      <span>COMPILER: {ticket.compiler}</span>
                      <span>·</span>
                      <span>INGESTED: {ticket.submittedAt}</span>
                      <span>·</span>
                      <span className="text-signal-resolved">SLA: {ticket.slaDeadline}</span>
                    </div>

                    <div className="text-xs text-text-muted font-sans pt-0.5">
                      Telemetry: <span className="text-accent-scan font-mono">{ticket.astCandidateSummary}</span>
                    </div>
                  </div>

                  {/* Claim Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaimTicket(ticket)}
                      leftIcon={<User className="h-3.5 w-3.5" />}
                    >
                      Claim Ticket for Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted space-y-1">
            <CheckCircle2 className="h-5 w-5 text-signal-resolved mx-auto" />
            <div>All ingested scopes currently claimed by active auditors.</div>
          </div>
        )}
      </section>
    </div>
  );
}
