"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Activity,
  Terminal,
  Cpu,
  ArrowLeftRight,
  ShieldAlert,
  Inbox,
  Menu,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";

export function AuditorHeader() {
  const { loginAs } = useAuth();
  const { toggle, isOpen } = useSidebar();

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-border-hairline bg-bg-panel/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
      {/* Left Context + Mobile Drawer Trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-[4px] bg-bg-panel border border-border-hairline text-text-muted hover:text-text-primary hover:border-accent-scan/50 transition-colors shrink-0"
          aria-label="Toggle auditor navigation"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 font-mono text-xs text-text-muted truncate">
          <span className="text-accent-scan font-bold truncate">AUDITOR_LABS</span>
          <span>/</span>
          <span className="text-text-primary truncate">Workbench</span>
          <Badge severity="high" size="sm" className="hidden sm:inline-flex">
            2 RE-TEST
          </Badge>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center w-64 lg:w-80">
        <Input
          placeholder="Filter queue by ticket, contract, SWC (⌘K)..."
          prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
          className="h-8 text-xs bg-bg-void/70"
        />
      </div>

      {/* Right Telemetry & Role Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-text-muted bg-bg-void px-2.5 py-1 rounded-[2px] border border-border-hairline">
          <Cpu className="h-3 w-3 text-accent-scan" />
          <span>SOLC AST: v0.8.24</span>
        </div>

        <button
          onClick={() => loginAs("client")}
          className="font-mono text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-bg-panel border border-border-hairline hover:border-accent-scan/50 transition-colors"
          title="Switch to Client View"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 text-accent-scan" />
          <span className="hidden sm:inline">Client View</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-border-hairline font-mono text-xs">
          <div className="h-7 w-7 rounded-[4px] bg-signal-high/15 border border-signal-high/40 flex items-center justify-center text-signal-high font-bold text-[11px]">
            K4
          </div>
          <span className="hidden xl:inline text-text-primary text-xs font-semibold">
            0xAuditor_K4
          </span>
        </div>
      </div>
    </header>
  );
}
