"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCheck2,
  Download,
  ExternalLink,
  ShieldCheck,
  Hash,
  GitCommit,
  Clock,
  Search,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { MOCK_AUDIT_REQUESTS } from "@/lib/mock-data";

export default function AuditorReportsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const completedAudits = MOCK_AUDIT_REQUESTS.filter(
    (a) => a.stage === "completed" || a.id === "ZAM-9481"
  );

  const filteredAudits = completedAudits.filter(
    (a) =>
      a.protocolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contractFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              Attestation Reports & Deliverable Vault
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Finalized cryptographic audit deliverables signed by Zyron Security Labs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge severity="resolved" size="sm">
            {completedAudits.length} REPORTS SEALED
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report by protocol, ticket ID (#ZAM-), or contract file..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredAudits.map((audit) => (
          <div
            key={audit.id}
            className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 font-mono text-xs"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-hairline pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-accent-scan font-bold">{audit.id}</span>
                  <h3 className="font-display text-sm font-semibold text-text-primary">
                    {audit.protocolName}
                  </h3>
                  <span className="text-text-muted text-[11px]">
                    ({audit.contractFileName})
                  </span>
                  <Badge severity="resolved" size="sm">
                    FINAL ATTESTATION SEALED ✓
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-0.5">
                  <span>SCOPE: {audit.sloc.toLocaleString()} SLOC</span>
                  <span>·</span>
                  <span>LEAD: {audit.assignedAuditor || "0xAuditor_K4"}</span>
                  <span>·</span>
                  <span>ROUNDS: {audit.roundsToResolution || 2} Rounds to Full Resolution</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/portal/vault#${audit.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                    View in Client Document Vault
                  </Button>
                </Link>
                <Link href={`/auditor/review/${audit.id}`}>
                  <Button variant="outline" size="sm">
                    Inspect Review Workspace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hash & Artifact Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
                <div className="text-text-muted text-[10px]">VERIFIED BYTECODE SHA-256 HASH</div>
                <div className="text-accent-scan select-all text-xs truncate">
                  {audit.bytecodeHash || "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b"}
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
                <div className="text-text-muted text-[10px]">DELIVERABLES GENERATED</div>
                <div className="text-text-primary flex items-center justify-between text-xs">
                  <span>Signed PDF Report ({audit.pdfSize || "2.4 MB"})</span>
                  <span className="text-signal-resolved font-bold">SHA-256 Sealed</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
