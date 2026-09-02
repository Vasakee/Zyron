"use client";

import Link from "next/link";
import { Code2, ArrowLeft, Terminal, GitBranch, Cpu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function IntegrationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-border-hairline pb-4">
        <Link
          href="/portal"
          className="font-mono text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>BACK TO DASHBOARD</span>
        </Link>
        <Badge severity="informational" size="sm">
          ROADMAP // IN DEVELOPMENT
        </Badge>
      </div>

      <div className="p-8 md:p-12 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6 text-center max-w-2xl mx-auto">
        <div className="h-12 w-12 rounded-[4px] bg-bg-void border border-border-hairline text-accent-scan flex items-center justify-center mx-auto">
          <Code2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <Eyebrow size="xs" variant="scan" prefix="// DEVELOPER_SYSTEM · ">
            COMING_SOON
          </Eyebrow>
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            CI/CD & Pre-Commit CLI Hooks
          </h1>
          <p className="text-xs sm:text-sm text-text-muted font-mono leading-relaxed">
            Automated AST taint execution directly inside GitHub Actions workflows and Foundry test suites prior to pull request merge.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border-hairline font-mono text-xs text-left">
          <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">GITHUB ACTION</div>
            <div className="text-text-primary font-medium text-[11px]">zyron-scan-action</div>
            <div className="text-[10px] text-accent-scan">Q4 2026 Release</div>
          </div>
          <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">FOUNDRY PLUGIN</div>
            <div className="text-text-primary font-medium text-[11px]">forge zyron-taint</div>
            <div className="text-[10px] text-accent-scan">Q4 2026 Release</div>
          </div>
          <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">LOCAL CLI</div>
            <div className="text-text-primary font-medium text-[11px]">zyron check</div>
            <div className="text-[10px] text-accent-scan">Q4 2026 Release</div>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/portal">
            <Button variant="primary" size="md">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
