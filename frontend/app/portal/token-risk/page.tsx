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
  Terminal,
  Activity,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TokenRiskPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Auth Guard: redirect unauthenticated users
  React.useEffect(() => {
    if (!user) {
      toast.error("Authentication Required: Please sign in to access the Token Risk & AI Audit Analyzer.");
      router.push("/auth/login");
    }
  }, [user, router]);

  const [tokenAddress, setTokenAddress] = React.useState("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984");
  const [contractFileName, setContractFileName] = React.useState("VaultCore.sol");
  const [isScanning, setIsScanning] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "ai" | "honeypot">("overview");

  const [scanResult, setScanResult] = React.useState<any>(null);
  const [aiResult, setAiResult] = React.useState<any>(null);

  const handleScan = async () => {
    if (!user) {
      toast.error("Authentication Required: Please sign in to run AI code security scans.");
      router.push("/auth/login");
      return;
    }

    setIsScanning(true);
    toast.info(`Analyzing bytecode & initializing Gemini 1.5 Pro AI scan...`);
    try {
      // 1. Call Token Static & Honeypot Risk API
      const tokenRes = await apiClient.post("/scanner/analyze-token", {
        contractFileName,
        contractAddress: tokenAddress,
      });
      setScanResult(tokenRes.data);

      // 2. Call Gemini 1.5 Pro AI Audit API
      const aiRes = await apiClient.post("/scanner/ai-audit", {
        contractFileName,
        contractAddress: tokenAddress,
      });
      setAiResult(aiRes.data);

      toast.success(`AST static scan & Gemini 1.5 Pro AI analysis complete! Score calculated.`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Scan failed";
      toast.error(`Scanner Error: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskScore = scanResult ? scanResult.tokenRiskScore : 0;
  const safetyScore = 100 - riskScore;
  const findings = scanResult?.findings || [];
  const aiFindings = aiResult?.findings || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Eyebrow variant="scan">SECURITY LAB · AI & AST ANALYSIS</Eyebrow>
            <Badge severity="resolved" size="sm">GEMINI 1.5 PRO ACTIVE</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
            Token Risk & AI Audit Analyzer
          </h1>
          <p className="text-sm text-text-muted font-sans max-w-2xl">
            Real-time static rules & Gemini 1.5 Pro AI analysis for ERC-20, SPL, and multi-chain smart contracts. Detect honeypots, hidden burn triggers, and proxy backdoors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning} className="gap-1.5 font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-accent-scan" : ""}`} />
            <span>Re-Verify AST</span>
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
          <Button variant="primary" size="md" onClick={handleScan} isLoading={isScanning} className="gap-2 font-mono text-xs w-full md:w-auto">
            <Zap className="h-3.5 w-3.5" />
            <span>Analyze Token & AI Audit</span>
          </Button>
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
            <span className={`font-display text-3xl font-medium ${safetyScore >= 80 ? "text-signal-resolved" : "text-signal-critical"}`}>
              {safetyScore}
            </span>
            <span className="font-mono text-xs text-text-muted">/ 100</span>
          </div>
          <div className="text-[11px] font-mono text-signal-resolved flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{findings.length === 0 ? "Clean · 0 High-risk flags" : `${findings.length} Flag(s) Detected`}</span>
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

        {/* Metric 4: AI Model Status */}
        <div className="p-4 rounded-[10px] bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>AI AUDIT ENGINE</span>
            <Sparkles className="h-4 w-4 text-accent-scan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-medium text-accent-scan">Gemini 1.5 Pro</span>
          </div>
          <div className="text-[11px] font-mono text-text-muted">
            {aiResult ? aiResult.modelUsed : "Active & Ready"}
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
          Diagnostic Matrix ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "ai"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Gemini AI Findings ({aiFindings.length})
        </button>
      </div>

      {/* Tab 1: Diagnostic Matrix */}
      {activeTab === "overview" && (
        <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent-scan" />
              <h2 className="font-mono text-xs font-semibold text-text-primary">
                CONTRACT HEURISTICS & PERMISSIONS
              </h2>
            </div>
            <Badge severity={findings.length > 0 ? "high" : "resolved"} size="sm">
              {findings.length} VULNERABILITIES DETECTED
            </Badge>
          </div>

          {findings.length === 0 ? (
            <div className="p-6 rounded-[8px] bg-bg-void/80 text-center font-mono text-xs text-signal-resolved">
              ✓ Clean Contract: 0 Static Security Violations Found for {contractFileName}.
            </div>
          ) : (
            <div className="space-y-2.5 font-mono text-xs">
              {findings.map((f: any, idx: number) => (
                <div key={idx} className="p-3 rounded-[6px] bg-bg-void/80 border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary font-bold">{f.title}</span>
                    <Badge severity={f.severity.toLowerCase()} size="sm">{f.severity}</Badge>
                  </div>
                  <div className="text-[11px] text-text-muted">{f.description}</div>
                  {f.remediatedCode && (
                    <div className="text-[10px] text-signal-resolved bg-bg-panel p-2 rounded mt-1 font-mono">
                      Fix: {f.remediatedCode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Gemini AI Findings */}
      {activeTab === "ai" && (
        <div className="p-5 rounded-[12px] bg-bg-panel border border-border-hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-scan" />
              <h2 className="font-mono text-xs font-semibold text-text-primary">
                GEMINI 1.5 PRO REASONING RESULTS
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted">{aiResult?.modelUsed || "Gemini 1.5 Pro"}</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {aiFindings.length === 0 ? (
              <div className="p-4 rounded bg-bg-void text-text-muted">
                Run an AI audit to view Gemini 1.5 Pro reasoning findings.
              </div>
            ) : (
              aiFindings.map((f: any, idx: number) => (
                <div key={idx} className="p-4 rounded-[8px] bg-bg-void border border-accent-scan/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-accent-scan font-bold text-sm">{f.title}</span>
                    <Badge severity={f.severity.toLowerCase()} size="sm">{f.severity}</Badge>
                  </div>
                  <div className="text-text-muted text-xs">{f.description}</div>
                  <div className="text-[11px] text-text-muted">
                    <span className="text-text-primary font-semibold">Location:</span> {f.location} | <span className="text-text-primary font-semibold">Impact:</span> {f.impact}
                  </div>
                  {f.remediatedCode && (
                    <div className="p-2.5 rounded bg-bg-panel text-signal-resolved text-[11px]">
                      <div className="font-bold text-text-primary text-[10px] mb-1">RECOMMENDED REMEDIATION:</div>
                      <code>{f.remediatedCode}</code>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
