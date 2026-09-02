"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Key,
  Lock,
  Activity,
  ArrowLeftRight,
  LogOut,
  Bell,
  Terminal,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";

export function AdminHeader() {
  const { user, loginAs, logout } = useAuth();
  const { toggle, isOpen } = useSidebar();

  return (
    <header className="h-14 border-b border-signal-critical/30 bg-bg-panel px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 font-mono text-xs">
      {/* Left: Mobile Drawer Trigger + Privileged Context Indicator */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-[4px] bg-bg-void border border-signal-critical/40 text-signal-critical hover:bg-signal-critical/10 transition-colors shrink-0"
          aria-label="Toggle admin navigation"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-signal-critical/10 border border-signal-critical/40 text-signal-critical truncate">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-bold tracking-wider uppercase text-[11px] truncate">
            PLATFORM_ADMIN
          </span>
        </div>

        <span className="text-text-muted text-[11px] hidden xl:inline truncate">
          · IMMUTABLE ROLE MUTATION ACTIVE
        </span>
      </div>

      {/* Right: Telemetry & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 bg-bg-void px-2.5 py-1 rounded-[2px] border border-border-hairline text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved animate-pulse" />
          <span className="text-text-muted">SESSION:</span>
          <span className="text-text-primary font-bold">0xAdmin_SecOps</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loginAs("auditor")}
            className="px-2 py-1 rounded-[2px] bg-bg-void border border-border-hairline hover:border-signal-high/60 text-signal-high text-[11px] transition-colors"
          >
            <span className="hidden sm:inline">Auditor View</span>
            <span className="sm:hidden">Auditor</span>
          </button>
          <button
            onClick={() => loginAs("client")}
            className="px-2 py-1 rounded-[2px] bg-bg-void border border-border-hairline hover:border-accent-scan/60 text-accent-scan text-[11px] transition-colors"
          >
            <span className="hidden sm:inline">Client View</span>
            <span className="sm:hidden">Client</span>
          </button>
        </div>
      </div>
    </header>
  );
}
