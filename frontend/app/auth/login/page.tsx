"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Wallet,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  User,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { useAuth, SAMPLE_ACCOUNTS } from "@/lib/auth-context";

export default function LoginPage() {
  const { loginAs } = useAuth();
  const [email, setEmail] = React.useState("security@auraprotocol.io");
  const [password, setPassword] = React.useState("••••••••••••");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isWeb3Loading, setIsWeb3Loading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // If email has auditor domain, login as auditor, otherwise client
      if (email.includes("zyron") || email.includes("auditor")) {
        loginAs("auditor");
      } else {
        loginAs("client");
      }
    }, 800);
  };

  const handleWeb3Login = () => {
    setIsWeb3Loading(true);
    setTimeout(() => {
      setIsWeb3Loading(false);
      loginAs("client");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 1-CLICK DEMO PERSONA SELECTOR */}
      <div className="p-4 rounded-[4px] bg-bg-panel border border-accent-scan/30 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2">
          <span className="text-accent-scan font-bold flex items-center gap-1.5 text-[11px]">
            <Sparkles className="h-3.5 w-3.5" />
            INSTANT DEMO PERSONAS
          </span>
          <span className="text-text-muted text-[10px]">1-CLICK LOGIN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Client Sample Button */}
          <button
            type="button"
            onClick={() => loginAs("client")}
            className="p-2.5 rounded-[2px] bg-bg-void border border-border-hairline hover:border-accent-scan/60 text-left transition-colors space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-semibold group-hover:text-accent-scan text-[11px]">
                Client Portal
              </span>
              <Badge severity="resolved" size="sm">
                DAO CLIENT
              </Badge>
            </div>
            <div className="text-[10px] text-text-muted">Aura Finance DAO</div>
          </button>

          {/* Auditor Sample Button */}
          <button
            type="button"
            onClick={() => loginAs("auditor")}
            className="p-2.5 rounded-[2px] bg-bg-void border border-border-hairline hover:border-signal-high/60 text-left transition-colors space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-semibold group-hover:text-signal-high text-[11px]">
                Auditor Workspace
              </span>
              <Badge severity="high" size="sm">
                LEAD AUDITOR
              </Badge>
            </div>
            <div className="text-[10px] text-text-muted">0xAuditor_K4 (Queue)</div>
          </button>

          {/* Platform Admin Sample Button */}
          <button
            type="button"
            onClick={() => loginAs("admin")}
            className="p-2.5 rounded-[2px] bg-bg-void border border-border-hairline hover:border-accent-scan text-left transition-colors space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-semibold group-hover:text-accent-scan text-[11px]">
                Platform Admin
              </span>
              <Badge severity="critical" size="sm">
                SUPERUSER
              </Badge>
            </div>
            <div className="text-[10px] text-text-muted">0xAdmin_SecOps (Global)</div>
          </button>
        </div>
      </div>

      {/* STANDARD FORM LOGIN */}
      <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="space-y-1.5 border-b border-border-hairline pb-4">
          <Eyebrow size="xs" variant="scan" prefix="// ACCESS_PORTAL · ">
            CREDENTIAL_AUTHENTICATION
          </Eyebrow>
          <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Sign In with Email or Wallet
          </h1>
          <p className="text-xs text-text-muted font-mono">
            Access your protocol pipeline or internal auditor review queue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">EMAIL ADDRESS</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="security@protocol.io"
              prefix={<Mail className="h-3.5 w-3.5 text-text-muted" />}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <label className="text-text-muted">PASSWORD</label>
              <Link
                href="/auth/reset-password"
                className="text-accent-scan hover:underline text-[11px]"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              prefix={<Lock className="h-3.5 w-3.5 text-text-muted" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In with Credentials
          </Button>
        </form>

        {/* Web3 Sign-in Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border-hairline" />
          <span className="bg-bg-panel px-2 font-mono text-[10px] text-text-muted uppercase tracking-wider relative">
            OR SIGN IN WITH WALLET
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="md"
          isLoading={isWeb3Loading}
          onClick={handleWeb3Login}
          leftIcon={<Wallet className="h-4 w-4 text-accent-scan" />}
        >
          Sign In with Ethereum (EIP-4361)
        </Button>

        <div className="pt-2 border-t border-border-hairline text-center font-mono text-xs text-text-muted">
          <span>Need to audit a new protocol? </span>
          <Link href="/auth/register" className="text-accent-scan hover:underline font-semibold">
            Register Protocol →
          </Link>
        </div>
      </div>
    </div>
  );
}
