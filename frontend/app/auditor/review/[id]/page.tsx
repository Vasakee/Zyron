"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Clock,
  Split,
  MessageSquare,
  Send,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  FileCode2,
  FileEdit,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderTree,
  FileText,
  Building,
  Hash,
  ExternalLink,
  BookOpen,
  Info,
  Sliders,
  CheckCheck,
  Plus,
  Bot,
  User,
  Sparkles,
  GitCompare,
  Eye,
  FileDiff,
  FileCheck2,
  Lock,
  Download,
  FileJson,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { MOCK_AUDIT_REQUESTS, type AuditRequest } from "@/lib/mock-data";

interface DiffLine {
  type: "add" | "delete" | "context" | "header";
  oldLine?: number;
  newLine?: number;
  code: string;
}

interface ProjectFile {
  path: string;
  name: string;
  folder: string;
  sloc: number;
  hasFixDiff: boolean;
  additions: number;
  deletions: number;
  diffLines: DiffLine[];
  flags: { line: number; type: "CRITICAL" | "HIGH" | "FIX_APPLIED" | "AI_FLAG"; label: string }[];
  lines: { line: number; code: string; highlight?: boolean; flag?: string; label?: string }[];
}

interface TriageFinding {
  id: string;
  swcId: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: string;
  title: string;
  file: string;
  line: number;
  description: string;
  remediation: string;
  status: "open" | "fix-submitted" | "resolved";
}

export default function AuditorCodeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params?.id as string) || "ZAM-9481";

  const audit =
    MOCK_AUDIT_REQUESTS.find(
      (a) => a.id.toLowerCase() === ticketId.toLowerCase()
    ) || MOCK_AUDIT_REQUESTS[0];

  // Ticket Completion Status
  const [ticketStage, setTicketStage] = React.useState<string>(audit.stage);
  const [isFinalized, setIsFinalized] = React.useState(false);

  // Scope Dossier Drawer
  const [showProjectDossier, setShowProjectDossier] = React.useState(false);

  // View Mode: 'diff' vs 'full'
  const [viewMode, setViewMode] = React.useState<"diff" | "full">("diff");
  const [selectedFilePath, setSelectedFilePath] = React.useState<string>("contracts/VaultCore.sol");
  const [activeRightTab, setActiveRightTab] = React.useState<"triage" | "comms">("triage");

  // Finding triage state for this ticket
  const [findings, setFindings] = React.useState<TriageFinding[]>([
    {
      id: "ZAM-9481-002",
      swcId: "SWC-104",
      severity: "high",
      cvss: "CVSS 7.8",
      title: "Unchecked ERC-20 Transfer in Reward Distribution",
      file: "contracts/VaultCore.sol",
      line: 146,
      description: "Raw transfer ignores non-boolean returns on tokens like USDT.",
      remediation: "Import SafeERC20 and use safeTransfer.",
      status: "resolved", // Marked resolved by auditor
    },
    {
      id: "ZAM-VAULT-001",
      swcId: "SWC-107",
      severity: "critical",
      cvss: "CVSS 9.1",
      title: "Reentrancy in withdrawAll() allows pool liquidation",
      file: "contracts/VaultCore.sol",
      line: 142,
      description: "External low-level call msg.sender.call executes prior to zeroing userBalances.",
      remediation: "Zero userBalances state before external call (Checks-Effects-Interactions).",
      status: "fix-submitted", // Can be resolved by auditor in UI
    },
  ]);

  const [selectedFindingId, setSelectedFindingId] = React.useState<string>("ZAM-VAULT-001");
  const [auditorNote, setAuditorNote] = React.useState("");

  // Report Compilation Modal State
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Invariant Check: All findings must be resolved to generate a report
  const allFindingsResolved = findings.every((f) => f.status === "resolved");
  const openOrFixCount = findings.filter((f) => f.status !== "resolved").length;

  // Selected Finding Reference
  const selectedFinding =
    findings.find((f) => f.id === selectedFindingId) || findings[0];

  // Action: Resolve finding
  const handleResolveFinding = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "resolved" } : f))
    );
  };

  // Action: Finalize Report
  const handleFinalizeReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsFinalized(true);
      setTicketStage("completed");
      setShowReportModal(false);

      // Mutate the mock audit record so Document Vault reflects it immediately
      audit.stage = "completed";
      audit.completedAt = new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC";
      audit.bytecodeHash = "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b";
      audit.roundsToResolution = 2;
      audit.pdfSize = "2.4 MB";
      audit.findings = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        resolved: findings.length,
      };
    }, 1200);
  };

  // Communication Thread
  const [newComment, setNewComment] = React.useState("");
  const [commsThread, setCommsThread] = React.useState([
    {
      id: "m-1",
      sender: "0xAuditor_K4",
      role: "auditor",
      timestamp: "2026-08-18 21:40 UTC",
      message:
        "AST Pass 04 flagged unchecked ERC-20 return on line 146 of VaultCore.sol (SWC-104). Non-standard tokens like USDT will cause silent failures. Please apply SafeERC20 wrapper.",
    },
    {
      id: "m-2",
      sender: "0xClient_8f",
      role: "client",
      timestamp: "2026-08-19 14:20 UTC",
      message:
        "Applied SafeERC20 wrapper across VaultCore.sol and updated Foundry invariant fuzz test suite in test/VaultCore.t.sol. Pinned commit 4b8f10e for re-verification.",
      commitRef: "4b8f10e",
    },
  ]);

  // Project Files
  const projectFiles: ProjectFile[] = [
    {
      path: "contracts/VaultCore.sol",
      name: "VaultCore.sol",
      folder: "contracts",
      sloc: 1480,
      hasFixDiff: true,
      additions: 3,
      deletions: 1,
      diffLines: [
        { type: "header", code: "@@ -139,11 +139,13 @@ function withdrawAll() external nonReentrant {" },
        { type: "context", oldLine: 139, newLine: 139, code: "        // Check user liquidity constraints" },
        { type: "context", oldLine: 140, newLine: 140, code: '        require(!lockedPositions[msg.sender], "Position locked");' },
        { type: "context", oldLine: 141, newLine: 141, code: "        " },
        { type: "context", oldLine: 142, newLine: 142, code: '        (bool sent, ) = msg.sender.call{value: amount}("");' },
        { type: "context", oldLine: 143, newLine: 143, code: '        require(sent, "Transfer failed");' },
        { type: "context", oldLine: 144, newLine: 144, code: "        userBalances[msg.sender] = 0;" },
        { type: "context", oldLine: 145, newLine: 145, code: "        " },
        { type: "delete", oldLine: 146, code: "        rewardToken.transfer(msg.sender, accruedYield);" },
        { type: "add", newLine: 146, code: "        // Remediation: SafeERC20 applied in commit 4b8f10e (Fixes SWC-104)" },
        { type: "add", newLine: 147, code: "        using SafeERC20 for IERC20;" },
        { type: "add", newLine: 148, code: "        rewardToken.safeTransfer(msg.sender, accruedYield);" },
        { type: "context", oldLine: 147, newLine: 149, code: "        " },
        { type: "context", oldLine: 148, newLine: 150, code: "        emit LiquidityWithdrawn(msg.sender, amount, accruedYield);" },
      ],
      flags: [
        { line: 142, type: "CRITICAL", label: "SWC-107 Reentrancy (External call before state zeroing)" },
        { line: 146, type: "FIX_APPLIED", label: "SWC-104 SafeERC20 Fix Applied (Commit 4b8f10e)" },
      ],
      lines: [
        { line: 130, code: "    /**" },
        { line: 131, code: "     * @notice Withdraws entire balance and transfers accrued reward yield." },
        { line: 132, code: "     */" },
        { line: 133, code: "    function withdrawAll() external nonReentrant {" },
        { line: 134, code: "        uint256 amount = userBalances[msg.sender];" },
        { line: 135, code: '        require(amount > 0, "No active collateral");' },
        { line: 136, code: "        " },
        { line: 137, code: "        uint256 accruedYield = calculateAccruedReward(msg.sender);" },
        { line: 138, code: "        " },
        { line: 139, code: "        // Check user liquidity constraints" },
        { line: 140, code: '        require(!lockedPositions[msg.sender], "Position locked");' },
        { line: 141, code: "        " },
        { line: 142, code: '        (bool sent, ) = msg.sender.call{value: amount}("");', highlight: true, flag: "CRITICAL", label: "SWC-107 Reentrancy" },
        { line: 143, code: '        require(sent, "Transfer failed");' },
        { line: 144, code: "        userBalances[msg.sender] = 0; // Mutated after low-level call", highlight: true, flag: "CRITICAL", label: "Order flaw" },
        { line: 145, code: "        " },
        { line: 146, code: "        rewardToken.safeTransfer(msg.sender, accruedYield); // Client fix in 4b8f10e", highlight: true, flag: "FIX_APPLIED", label: "SafeERC20 wrapper applied" },
        { line: 147, code: "        " },
        { line: 148, code: "        emit LiquidityWithdrawn(msg.sender, amount, accruedYield);" },
        { line: 149, code: "    }" },
      ],
    },
    {
      path: "test/VaultCore.t.sol",
      name: "VaultCore.t.sol",
      folder: "test",
      sloc: 310,
      hasFixDiff: true,
      additions: 9,
      deletions: 0,
      diffLines: [
        { type: "header", code: "@@ +40,9 @@ test/VaultCore.t.sol (New Invariant Test Case)" },
        { type: "add", newLine: 40, code: "    function testFuzz_SafeTransferWithNonStandardERC20(uint256 yieldAmount) public {" },
        { type: "add", newLine: 41, code: "        vm.assume(yieldAmount > 0 && yieldAmount < 1e24);" },
        { type: "add", newLine: 42, code: "        mockUSDT.mint(address(vault), yieldAmount);" },
        { type: "add", newLine: 43, code: "        " },
        { type: "add", newLine: 44, code: "        // Verify SafeERC20 wrapper executes without reverting" },
        { type: "add", newLine: 45, code: "        vm.prank(alice);" },
        { type: "add", newLine: 46, code: "        vault.withdrawAll();" },
        { type: "add", newLine: 47, code: "        assertEq(mockUSDT.balanceOf(alice), yieldAmount);" },
        { type: "add", newLine: 48, code: "    }" },
      ],
      flags: [
        { line: 45, type: "FIX_APPLIED", label: "Added SafeERC20 mock fuzz test invariant" },
      ],
      lines: [
        { line: 40, code: "    function testFuzz_SafeTransferWithNonStandardERC20(uint256 yieldAmount) public {" },
        { line: 41, code: "        vm.assume(yieldAmount > 0 && yieldAmount < 1e24);" },
        { line: 42, code: "        mockUSDT.mint(address(vault), yieldAmount);" },
        { line: 43, code: "        " },
        { line: 44, code: "        // Verify SafeERC20 wrapper executes without reverting" },
        { line: 45, code: "        vm.prank(alice);", highlight: true, flag: "FIX_APPLIED", label: "Remediation invariant fuzz test" },
        { line: 46, code: "        vault.withdrawAll();" },
        { line: 47, code: "        assertEq(mockUSDT.balanceOf(alice), yieldAmount);" },
        { line: 48, code: "    }" },
      ],
    },
  ];

  const activeFile =
    projectFiles.find((f) => f.path === selectedFilePath) || projectFiles[0];

  const handlePostAuditorComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const msg = {
      id: `m-${Date.now()}`,
      sender: "0xAuditor_K4",
      role: "auditor",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      message: newComment.trim(),
    };

    setCommsThread((prev) => [...prev, msg]);
    setNewComment("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SUCCESS BANNER WHEN REPORT IS FINALIZED */}
      {isFinalized && (
        <div className="p-6 rounded-[4px] bg-signal-resolved/10 border-2 border-signal-resolved font-mono text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-signal-resolved font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>ATTESTATION REPORT FINALIZED & SEALED</span>
            </div>
            <Badge severity="resolved" size="sm">
              COMPLETED ✓
            </Badge>
          </div>

          <p className="text-text-primary text-xs leading-relaxed font-sans">
            Cryptographic attestation certificate for ticket <strong>#{audit.id}</strong> ({audit.protocolName}) has been sealed with SHA-256 bytecode hash and published to the client's <strong>Document Vault</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href={`/portal/vault#${audit.id}`}>
              <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                View Certificate in Client Document Vault
              </Button>
            </Link>
            <Link href="/auditor/queue">
              <Button variant="outline" size="sm">
                Return to Ticket Queue
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* TOP AUDITOR BREADCRUMB & SCOPE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/auditor/queue"
            className="text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>TICKET QUEUE</span>
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-accent-scan font-bold">{audit.id}</span>
          <span className="text-text-primary font-semibold hidden sm:inline">
            {audit.protocolName}
          </span>
          <span className="text-text-muted text-[11px]">
            ({audit.contractFileName})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Conditional Report Generation Action */}
          {allFindingsResolved ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold shadow-lg"
              leftIcon={<FileCheck2 className="h-4 w-4" />}
              onClick={() => setShowReportModal(true)}
            >
              Generate Final Attestation Report
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-bg-void border border-border-hairline text-text-muted text-[11px]" title="Resolve all findings to unlock report compilation">
              <Lock className="h-3 w-3 text-signal-critical" />
              <span>Report Locked ({openOrFixCount} Unresolved)</span>
            </div>
          )}

          <Badge severity={ticketStage === "completed" ? "resolved" : "high"} size="sm">
            {ticketStage.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* DUAL-PANE CODE REVIEW & VULNERABILITY TRIAGE SURFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT 7 COLS: CODE PANE (COMMIT DIFF VIEW VS FULL SOURCE FILE VIEW)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 rounded-[4px] bg-bg-panel border border-border-hairline overflow-hidden space-y-0">
          {/* Top Control Bar */}
          <div className="border-b border-border-hairline bg-bg-void/90 flex flex-col sm:flex-row sm:items-center justify-between font-mono text-xs px-2 pt-1 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {projectFiles.map((file) => {
                const isSelected = selectedFilePath === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs transition-colors whitespace-nowrap ${
                      isSelected
                        ? "border-accent-scan text-accent-scan bg-bg-panel font-medium"
                        : "border-transparent text-text-muted hover:text-text-primary hover:bg-bg-panel/40"
                    }`}
                  >
                    <FileCode2 className={`h-3.5 w-3.5 ${isSelected ? "text-accent-scan" : "text-text-muted"}`} />
                    <span>{file.name}</span>
                    {file.hasFixDiff && (
                      <span className="text-[10px] text-signal-resolved font-bold">
                        +{file.additions} -{file.deletions}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center rounded-[3px] border border-border-hairline bg-bg-panel p-0.5 self-start sm:self-auto my-1">
              <button
                onClick={() => setViewMode("diff")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors text-[11px] font-mono ${
                  viewMode === "diff"
                    ? "bg-accent-scan text-bg-void font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <GitCompare className="h-3 w-3" />
                <span>Commit Diff</span>
              </button>

              <button
                onClick={() => setViewMode("full")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors text-[11px] font-mono ${
                  viewMode === "full"
                    ? "bg-bg-panel-raised text-text-primary font-bold border border-border-hairline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Full Source</span>
              </button>
            </div>
          </div>

          {/* Sub-Header */}
          <div className="p-2.5 px-4 bg-bg-panel-raised/50 border-b border-border-hairline flex flex-wrap items-center justify-between font-mono text-[11px] text-text-muted gap-2">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-medium">{activeFile.path}</span>
              <span className="text-signal-resolved font-bold">
                ({activeFile.additions} additions, {activeFile.deletions} deletions in commit 4b8f10e)
              </span>
            </div>
            <span className="text-[10px]">Comparing: 8f9b2d4 → 4b8f10e</span>
          </div>

          {/* Diff View */}
          {viewMode === "diff" && (
            <div className="p-4 bg-bg-void font-mono text-xs leading-relaxed overflow-x-auto select-text space-y-0.5 max-h-[580px] overflow-y-auto divide-y divide-border-hairline/20">
              {activeFile.diffLines.map((row, idx) => {
                if (row.type === "header") {
                  return (
                    <div
                      key={idx}
                      className="py-1 px-3 bg-bg-panel text-accent-scan text-[11px] font-bold rounded-[2px] my-1"
                    >
                      {row.code}
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 py-0.5 px-2 rounded-[2px] transition-colors ${
                      row.type === "add"
                        ? "bg-signal-resolved/10 text-signal-resolved border-l-2 border-l-signal-resolved"
                        : row.type === "delete"
                        ? "bg-signal-critical/10 text-signal-critical border-l-2 border-l-signal-critical"
                        : "text-text-muted hover:bg-bg-panel/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-text-muted/40 select-none text-[10px] w-12 shrink-0 font-mono">
                      <span className="w-5 text-right">{row.oldLine || " "}</span>
                      <span className="w-5 text-right">{row.newLine || " "}</span>
                    </div>
                    <span className="select-none font-bold w-3 text-center shrink-0">
                      {row.type === "add" ? "+" : row.type === "delete" ? "-" : " "}
                    </span>
                    <div className="flex-1 whitespace-pre font-mono text-xs">
                      {row.code}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Source View */}
          {viewMode === "full" && (
            <div className="p-4 bg-bg-void font-mono text-xs leading-relaxed overflow-x-auto select-text space-y-1 max-h-[580px] overflow-y-auto">
              {activeFile.lines.map((row) => (
                <div
                  key={row.line}
                  className={`flex items-start gap-4 py-0.5 px-2 rounded-[2px] transition-colors ${
                    row.flag === "CRITICAL"
                      ? "bg-signal-critical/10 border-l-2 border-l-signal-critical"
                      : row.flag === "FIX_APPLIED"
                      ? "bg-signal-high/15 border-l-2 border-l-signal-high"
                      : "hover:bg-bg-panel/60"
                  }`}
                >
                  <span className="text-text-muted/50 select-none text-[11px] w-8 shrink-0 text-right">
                    {row.line}
                  </span>
                  <div className="flex-1 text-text-primary whitespace-pre font-mono">
                    {row.code}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-bg-panel-raised border-t border-border-hairline flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5">
              <GitCompare className="h-3.5 w-3.5 text-signal-resolved" />
              <span>Viewing fix commit diff for 4b8f10e</span>
            </span>
            <span className="text-accent-scan">EVM Runtime: Shanghai</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 5 COLS: AUDITOR TRIAGE & VERIFICATION WORKBENCH                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex rounded-[4px] border border-border-hairline bg-bg-panel p-1 font-mono text-xs">
            <button
              onClick={() => setActiveRightTab("triage")}
              className={`flex-1 py-1.5 px-2 rounded-[2px] transition-colors flex items-center justify-center gap-1.5 ${
                activeRightTab === "triage"
                  ? "bg-bg-panel-raised text-accent-scan font-bold border border-border-hairline"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Remediation Triage ({findings.length})</span>
            </button>

            <button
              onClick={() => setActiveRightTab("comms")}
              className={`flex-1 py-1.5 px-2 rounded-[2px] transition-colors flex items-center justify-center gap-1.5 ${
                activeRightTab === "comms"
                  ? "bg-bg-panel-raised text-accent-scan font-bold border border-border-hairline"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Comms Thread ({commsThread.length})</span>
            </button>
          </div>

          {/* TAB 1: TRIAGE & RESOLUTION */}
          {activeRightTab === "triage" && (
            <div className="space-y-4 font-mono text-xs">
              {/* Finding Selector */}
              <div className="flex rounded-[4px] border border-border-hairline bg-bg-panel p-1 font-mono text-xs">
                {findings.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFindingId(f.id)}
                    className={`flex-1 py-2 px-2 rounded-[2px] transition-colors flex items-center justify-between ${
                      selectedFindingId === f.id
                        ? "bg-bg-panel-raised text-accent-scan font-bold border border-border-hairline"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <span className="truncate">{f.swcId}</span>
                    {f.status === "resolved" ? (
                      <span className="text-[9px] text-signal-resolved font-bold">RESOLVED ✓</span>
                    ) : (
                      <span className="text-[9px] text-signal-high font-bold">RE-VERIFY</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Finding Card */}
              <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-5">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-scan font-bold">{selectedFinding.id}</span>
                      <Badge severity={selectedFinding.severity} size="sm">
                        {selectedFinding.severity.toUpperCase()} ({selectedFinding.cvss})
                      </Badge>
                    </div>
                    <h4 className="font-display text-sm font-semibold text-text-primary font-sans">
                      {selectedFinding.title}
                    </h4>
                  </div>

                  {selectedFinding.status === "resolved" ? (
                    <Badge severity="resolved" size="sm">
                      RESOLVED ✓
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-signal-high bg-signal-high/15 px-2 py-0.5 rounded-[2px] border border-signal-high/30 font-bold">
                      AWAITING SIGN-OFF
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-[2px] bg-bg-void border border-border-hairline space-y-1">
                  <div className="text-[10px] text-text-muted">ROOT CAUSE & EXPLOIT IMPACT:</div>
                  <p className="text-xs text-text-muted font-sans leading-relaxed">
                    {selectedFinding.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-text-muted text-[11px]">AUDITOR RE-VERIFICATION NOTES:</label>
                  <Input
                    value={auditorNote}
                    onChange={(e) => setAuditorNote(e.target.value)}
                    placeholder="Describe invariant checks verified..."
                    className="text-xs"
                  />

                  {selectedFinding.status !== "resolved" ? (
                    <Button
                      variant="primary"
                      className="w-full bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold"
                      onClick={() => handleResolveFinding(selectedFinding.id)}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      Approve & Mark Finding Resolved
                    </Button>
                  ) : (
                    <div className="p-3 rounded-[3px] bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Finding verified resolved in commit 4b8f10e</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMMS THREAD */}
          {activeRightTab === "comms" && (
            <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                <div className="flex items-center gap-2 font-semibold text-text-primary">
                  <MessageSquare className="h-4 w-4 text-accent-scan" />
                  <span>Client & Auditor Communication Feed</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  TICKET #{audit.id}
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {commsThread.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-[4px] border space-y-1.5 ${
                      item.role === "auditor"
                        ? "bg-bg-panel-raised border-accent-scan/30"
                        : "bg-bg-void border-border-hairline"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${item.role === "auditor" ? "text-accent-scan" : "text-text-primary"}`}>
                          {item.sender}
                        </span>
                        <Badge severity={item.role === "auditor" ? "informational" : "resolved"} size="sm">
                          {item.role === "auditor" ? "LEAD AUDITOR" : "CLIENT"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-text-muted">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-text-primary font-sans leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REPORT COMPILATION & ATTESTATION PREVIEW MODAL                            */}
      {/* ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[4px] bg-bg-panel border border-border-hairline shadow-2xl p-6 md:p-8 space-y-6 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// COMPILATION_ENGINE · ">
                  ATTESTATION_DELIVERABLE_PREVIEW
                </Eyebrow>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Sign & Finalize Audit Attestation
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Certificate Preview Card (Matching Document Vault Structure) */}
            <div className="p-6 rounded-[4px] bg-bg-void border border-border-hairline space-y-4">
              <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                <div>
                  <div className="font-display font-bold text-sm text-text-primary">
                    ZYRON SECURITY LABS
                  </div>
                  <div className="text-[10px] text-text-muted">
                    FINAL ATTESTATION CERTIFICATE #{audit.id}
                  </div>
                </div>
                <Badge severity="resolved" size="sm">
                  100% MITIGATED ✓
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-text-muted text-[10px]">AUDITED TARGET:</span>
                  <div className="text-text-primary font-medium">{audit.protocolName}</div>
                </div>
                <div>
                  <span className="text-text-muted text-[10px]">PINNED COMMIT SHA:</span>
                  <div className="text-signal-resolved font-bold">4b8f10e</div>
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1">
                <div className="text-text-muted text-[10px]">IMMUTABLE BYTECODE SHA-256 HASH:</div>
                <div className="text-accent-scan select-all text-xs truncate">
                  0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-hairline text-center text-[10px]">
                <div className="p-2 rounded bg-bg-panel">
                  <div className="text-text-muted">TOTAL RESOLVED</div>
                  <div className="text-signal-resolved font-bold text-xs">{findings.length} Verified</div>
                </div>
                <div className="p-2 rounded bg-bg-panel">
                  <div className="text-text-muted">OPEN CRITICAL</div>
                  <div className="text-signal-resolved font-bold text-xs">0 Open</div>
                </div>
                <div className="p-2 rounded bg-bg-panel">
                  <div className="text-text-muted">REVIEW ROUNDS</div>
                  <div className="text-text-primary font-bold text-xs">2 Rounds</div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-text-muted flex items-center justify-between">
                <span>LEAD AUDITOR: 0xAuditor_K4</span>
                <span>PEER AUDITOR: 0xAuditor_M2</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border-hairline">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="md"
                isLoading={isGenerating}
                className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold"
                leftIcon={<FileCheck2 className="h-4 w-4" />}
                onClick={handleFinalizeReport}
              >
                Sign & Finalize Attestation Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
