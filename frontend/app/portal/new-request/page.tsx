"use client";

import * as React from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileCode,
  FileCheck,
  Check,
  ArrowRight,
  AlertCircle,
  Hash,
  ShieldCheck,
  Terminal,
  Layers,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Search,
  Lock,
  Globe,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MOCK_REPOSITORIES, type MockRepository, type SolContractFile } from "@/lib/mock-data";

export default function NewAuditRequestPage() {
  // Method Toggle: "upload" | "github"
  const [sourceMode, setSourceMode] = React.useState<"upload" | "github">("upload");

  // GitHub State
  const [isGithubConnected, setIsGithubConnected] = React.useState(false);
  const [repoSearch, setRepoSearch] = React.useState("");
  const [selectedRepoId, setSelectedRepoId] = React.useState<string>("repo-1");
  const [selectedBranch, setSelectedBranch] = React.useState<string>("main");

  // Form State
  const [protocolName, setProtocolName] = React.useState("Aura Liquidity Protocol");
  const [contractFileName, setContractFileName] = React.useState("VaultCore.sol");
  const [contractAddress, setContractAddress] = React.useState("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  const [compilerVersion, setCompilerVersion] = React.useState("v0.8.20");
  const [network, setNetwork] = React.useState("Ethereum Mainnet (1)");
  const [gitCommit, setGitCommit] = React.useState("8f9b2d4c01e9a37");

  // Invariant checkboxes
  const [invariants, setInvariants] = React.useState<Record<string, boolean>>({
    reentrancy: true,
    oracle: true,
    access: true,
    erc20: true,
    crosschain: false,
  });

  // Source code state
  const [sourceCode, setSourceCode] = React.useState<string>(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title VaultCore - Liquidity collateral vault
/// @notice Manages multi-asset staking deposits and yield distributions
contract VaultCore is ReentrancyGuard, Ownable {
    mapping(address => uint256) public userBalances;
    uint256 public totalVaultCollateral;
    IERC20 public immutable rewardToken;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Zero deposit");
        userBalances[msg.sender] += msg.value;
        totalVaultCollateral += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdrawAll() external nonReentrant {
        uint256 amount = userBalances[msg.sender];
        require(amount > 0, "No balance");

        // Checks-Effects-Interactions
        userBalances[msg.sender] = 0;
        totalVaultCollateral -= amount;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }
}`);

  const [fileName, setFileName] = React.useState<string>("VaultCore.sol");
  const [fileSize, setFileSize] = React.useState<string>("14.8 KB");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Selected repo object
  const selectedRepo = MOCK_REPOSITORIES.find((r) => r.id === selectedRepoId) || MOCK_REPOSITORIES[0];

  // Filtered repos list
  const filteredRepos = MOCK_REPOSITORIES.filter(
    (repo) =>
      repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  // Dynamic SLOC count based on source code lines
  const calculatedSloc = React.useMemo(() => {
    return sourceCode
      .split("\n")
      .filter((line) => line.trim().length > 0 && !line.trim().startsWith("//")).length;
  }, [sourceCode]);

  // Turnaround SLA estimation based on SLOC
  const turnaroundSla = React.useMemo(() => {
    if (calculatedSloc < 500) return "24–36 Hours";
    if (calculatedSloc < 1500) return "36–48 Hours";
    return "48–72 Hours";
  }, [calculatedSloc]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setContractFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    setFileName("VaultCore.sol");
    setFileSize("14.8 KB");
    setContractFileName("VaultCore.sol");
    setProtocolName("Aura Liquidity Protocol");
    setContractAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  };

  const handleSelectRepoContract = (file: SolContractFile) => {
    setFileName(file.fileName);
    setContractFileName(file.fileName);
    setSourceCode(file.sourceCode);
    setGitCommit(file.commit);
    setFileSize(`${(file.sloc * 0.038).toFixed(1)} KB`);
    if (selectedRepo) {
      setProtocolName(`Aura ${selectedRepo.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const toggleInvariant = (key: string) => {
    setInvariants((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline border-l-2 border-l-signal-resolved space-y-6">
          <div className="flex items-center justify-between border-b border-border-hairline pb-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-signal-resolved/10 border border-signal-resolved text-signal-resolved flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <Eyebrow size="xs" variant="scan" prefix="// STATUS: ">
                  SUBMITTED_FOR_REVIEW
                </Eyebrow>
                <h1 className="font-display text-xl font-semibold text-text-primary">
                  Audit Request Ingested — Ticket #ZAM-9486
                </h1>
              </div>
            </div>
            <StatusPill status="pending" size="sm" />
          </div>

          <p className="text-sm text-text-muted leading-relaxed">
            Your contract <code className="text-text-primary font-mono text-xs">{fileName}</code> ({calculatedSloc} SLOC) has been pinned to commit <code className="text-accent-scan font-mono text-xs">{gitCommit.slice(0, 7)}</code>. The automated AST symbolic scanner is initializing.
          </p>

          {/* Submission Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px]">TICKET ID</div>
              <div className="text-accent-scan font-bold">#ZAM-9486</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">COMPILER</div>
              <div className="text-text-primary">{compilerVersion}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">SCOPED SLOC</div>
              <div className="text-text-primary">{calculatedSloc} SLOC</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">INITIAL TRIAGE SLA</div>
              <div className="text-signal-resolved">{turnaroundSla}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/portal">
              <Button variant="primary" size="md">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/portal">
              <Button variant="outline" size="md">
                View Live Pipeline Rail
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-4">
        <div>
          <Eyebrow size="sm" variant="scan" prefix="// INTAKE_WORKFLOW · ">
            NEW_AUDIT_ENGAGEMENT
          </Eyebrow>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            New Audit Request
          </h1>
        </div>
        <div className="font-mono text-xs text-text-muted">
          STAGE 01 OF 04 // SCOPE & BYTECODE LOCK
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* STEP 1: TARGET PROTOCOL METADATA */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                01
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Protocol & Contract Scope Metadata
              </h2>
            </div>
            <span className="font-mono text-[11px] text-text-muted">STEP 1 OF 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Name */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>PROTOCOL / REPOSITORY NAME</span>
                <span className="text-accent-scan text-[10px]">REQUIRED</span>
              </label>
              <Input
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                placeholder="e.g. Aura Liquidity Pool V3"
                required
              />
            </div>

            {/* Primary Contract File */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>PRIMARY CONTRACT FILENAME</span>
                <span className="text-accent-scan text-[10px]">REQUIRED</span>
              </label>
              <Input
                value={contractFileName}
                onChange={(e) => setContractFileName(e.target.value)}
                placeholder="e.g. VaultCore.sol"
                required
              />
            </div>

            {/* Deployed / Target Contract Address (with Input mono variant) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>TARGET CONTRACT ADDRESS (MONOSPACE)</span>
                <span className="text-text-muted text-[10px]">OPTIONAL FOR PRE-DEPLOYMENT</span>
              </label>
              <Input
                isMono
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                prefix={<span className="font-mono text-xs text-accent-scan">0x</span>}
              />
            </div>

            {/* Compiler Version */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">
                SOLIDITY COMPILER VERSION (SOLC)
              </label>
              <select
                value={compilerVersion}
                onChange={(e) => setCompilerVersion(e.target.value)}
                className="w-full h-10 px-3 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
              >
                <option value="v0.8.24">v0.8.24 (Cancun EVM)</option>
                <option value="v0.8.20">v0.8.20 (Shanghai EVM / PUSH0)</option>
                <option value="v0.8.19">v0.8.19</option>
                <option value="v0.8.18">v0.8.18</option>
                <option value="v0.8.17">v0.8.17</option>
              </select>
            </div>

            {/* Target EVM Network */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">
                DEPLOYMENT TARGET CHAIN
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full h-10 px-3 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
              >
                <option value="Ethereum Mainnet (1)">Ethereum Mainnet (ChainID: 1)</option>
                <option value="Arbitrum One (42161)">Arbitrum One (ChainID: 42161)</option>
                <option value="Optimism (10)">Optimism Mainnet (ChainID: 10)</option>
                <option value="Base (8453)">Base (ChainID: 8453)</option>
                <option value="Polygon (137)">Polygon POS (ChainID: 137)</option>
              </select>
            </div>
          </div>
        </section>

        {/* STEP 2: SOLIDITY SOURCE INGESTION (File Upload vs GitHub Repository) */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                02
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Contract Source Ingestion
              </h2>
            </div>

            {/* Segmented Method Toggle */}
            <div className="flex items-center rounded-[4px] border border-border-hairline bg-bg-void p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSourceMode("upload")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  sourceMode === "upload"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold border border-border-hairline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("github")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  sourceMode === "github"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold border border-border-hairline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Connect GitHub Repository
              </button>
            </div>
          </div>

          {/* PATH A: UPLOAD FILE DRAG AND DROP */}
          {sourceMode === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    setContractFileName(file.name);
                    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setSourceCode(event.target.result as string);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className={`border-2 border-dashed rounded-[4px] p-8 text-center transition-colors relative ${
                  isDragOver
                    ? "border-accent-scan bg-accent-scan/5"
                    : "border-border-hairline hover:border-hairline/80 bg-bg-void/40"
                }`}
              >
                <input
                  type="file"
                  accept=".sol,.zip,.tar,.gz"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center space-y-2 pointer-events-none">
                  <div className="h-10 w-10 rounded-[4px] bg-bg-panel-raised border border-border-hairline flex items-center justify-center text-accent-scan">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-display text-sm font-semibold text-text-primary">
                      Drag and drop <code className="text-accent-scan font-mono">.sol</code> contract file or repository archive
                    </div>
                    <div className="font-mono text-xs text-text-muted">
                      Supports single Solidity files (.sol) or zipped multi-file projects up to 25MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Sample Quick-Load */}
              <div className="flex items-center justify-between text-xs font-mono text-text-muted pt-1">
                <span>QUICK LOAD FOR TESTING:</span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-accent-scan hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Load Sample VaultCore.sol (1,482 SLOC)
                </button>
              </div>
            </div>
          )}

          {/* PATH B: CONNECT GITHUB REPOSITORY */}
          {sourceMode === "github" && (
            <div className="space-y-6">
              {/* State 1: Not Connected */}
              {!isGithubConnected ? (
                <div className="p-8 rounded-[4px] bg-bg-void border border-border-hairline text-center space-y-4">
                  <div className="h-12 w-12 rounded-[4px] bg-bg-panel border border-border-hairline mx-auto flex items-center justify-center text-accent-scan">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <div className="font-display text-base font-semibold text-text-primary">
                      Connect GitHub Organization
                    </div>
                    <p className="text-xs text-text-muted font-mono leading-relaxed">
                      Grant Zyron read-only repository tree and commit hash access for deterministic AST bytecode mapping.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setIsGithubConnected(true)}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Connect GitHub
                  </Button>
                </div>
              ) : (
                /* State 2: Connected Repositories Table & File Picker */
                <div className="space-y-6">
                  {/* Connected Status Toolbar */}
                  <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
                      <span className="text-text-primary font-semibold">GITHUB CONNECTED:</span>
                      <span className="text-accent-scan">aura-finance</span>
                      <span className="text-text-muted text-[11px]">({MOCK_REPOSITORIES.length} repositories)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-56">
                        <Input
                          placeholder="Search repositories..."
                          value={repoSearch}
                          onChange={(e) => setRepoSearch(e.target.value)}
                          prefix={<Search className="h-3 w-3 text-text-muted" />}
                          className="h-7 text-xs bg-bg-panel"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGithubConnected(false)}
                        className="text-text-muted hover:text-signal-critical text-[11px] underline"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Repositories Table (Matching Table Primitive) */}
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-text-muted">
                      SELECT TARGET REPOSITORY:
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Repository</TableHead>
                          <TableHead className="w-28">Visibility</TableHead>
                          <TableHead className="w-32">Default Branch</TableHead>
                          <TableHead className="w-36">Last Updated</TableHead>
                          <TableHead className="w-28 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRepos.map((repo) => {
                          const isSelected = selectedRepoId === repo.id;
                          return (
                            <TableRow
                              key={repo.id}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-bg-panel-raised border-l-2 border-l-accent-scan" : ""
                              }`}
                              onClick={() => {
                                setSelectedRepoId(repo.id);
                                setSelectedBranch(repo.defaultBranch);
                              }}
                            >
                              <TableCell className="font-medium text-text-primary flex items-center gap-2">
                                <Code2 className="h-3.5 w-3.5 text-accent-scan" />
                                <span>{repo.fullName}</span>
                              </TableCell>
                              <TableCell>
                                <Badge severity={repo.isPrivate ? "informational" : "resolved"} size="sm">
                                  {repo.isPrivate ? "PRIVATE" : "PUBLIC"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-text-muted">
                                <span className="flex items-center gap-1">
                                  <GitBranch className="h-3 w-3" />
                                  {repo.defaultBranch}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-text-muted">
                                {repo.lastUpdated}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isSelected ? "primary" : "secondary"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRepoId(repo.id);
                                    setSelectedBranch(repo.defaultBranch);
                                  }}
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Detected Solidity Files in Selected Repo */}
                  {selectedRepo && (
                    <div className="p-5 rounded-[4px] bg-bg-void border border-border-hairline space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-text-muted">REPOSITORY:</span>
                          <span className="text-text-primary font-semibold">{selectedRepo.fullName}</span>
                        </div>

                        {/* Branch Selector */}
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-text-muted">BRANCH:</span>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="h-7 px-2 rounded-[2px] bg-bg-panel border border-border-hairline text-accent-scan font-mono text-xs focus:outline-none"
                          >
                            {selectedRepo.branches.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Detected Files List */}
                      <div className="space-y-2">
                        <div className="font-mono text-xs text-text-muted flex items-center justify-between">
                          <span>DETECTED SOLIDITY CONTRACTS ({selectedRepo.contractFiles.length})</span>
                          <span className="text-[10px] text-accent-scan">CLICK TO INGEST SOURCE</span>
                        </div>

                        <div className="space-y-2">
                          {selectedRepo.contractFiles.map((file) => {
                            const isCurrentFile = fileName === file.fileName;
                            return (
                              <div
                                key={file.path}
                                onClick={() => handleSelectRepoContract(file)}
                                className={`p-3 rounded-[4px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                                  isCurrentFile
                                    ? "bg-bg-panel-raised border-accent-scan"
                                    : "bg-bg-panel border-border-hairline hover:border-hairline/90"
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="font-mono text-xs font-semibold text-text-primary flex items-center gap-2">
                                    <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                                    <span>{file.path}</span>
                                    {isCurrentFile && (
                                      <Badge severity="resolved" size="sm">
                                        INGESTED
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="font-mono text-[11px] text-text-muted pl-5.5">
                                    COMMIT: {file.commit.slice(0, 7)} · {file.sloc} executable lines
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isCurrentFile ? "primary" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectRepoContract(file);
                                  }}
                                >
                                  {isCurrentFile ? "Ingested ✓" : "Ingest Contract"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CONVERGED INGESTION STATISTICS STRIP (Appears for both Upload & GitHub methods) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px]">INGESTED FILE</div>
              <div className="text-text-primary font-medium truncate">{fileName}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">SOURCE LINES (SLOC)</div>
              <div className="text-accent-scan font-bold">{calculatedSloc} lines</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">PINNED COMMIT</div>
              <div className="text-text-primary">{gitCommit.slice(0, 7)}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">ESTIMATED TURNAROUND</div>
              <div className="text-signal-resolved font-medium">{turnaroundSla}</div>
            </div>
          </div>

          {/* Solidity Source Preview Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                SOLIDITY SOURCE PREVIEW
              </span>
              <span>{calculatedSloc} executable lines parsed</span>
            </div>
            <div className="rounded-[4px] border border-border-hairline bg-bg-void/90 p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto text-text-muted">
              <pre>
                <code>{sourceCode}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* STEP 3: AUDIT REVIEW PARAMETERS & INVARIANTS */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                03
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Scope Focus & Invariant Specifications
              </h2>
            </div>
            <span className="font-mono text-[11px] text-text-muted">STEP 3 OF 3</span>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-xs text-text-muted">
              SELECT KEY ATTACK VECTORS FOR DUAL-AUDITOR MANUAL SCRUTINY:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: "reentrancy",
                  label: "Reentrancy & State Ordering",
                  swc: "SWC-107",
                  desc: "External low-level calls before state decrement",
                },
                {
                  key: "oracle",
                  label: "Oracle Manipulation & Flash Loans",
                  swc: "SWC-120",
                  desc: "Spot price dependency and arithmetic slippage",
                },
                {
                  key: "access",
                  label: "Access Control & Upgradeability",
                  swc: "SWC-105",
                  desc: "Privilege escalation and initialization front-running",
                },
                {
                  key: "erc20",
                  label: "ERC-20 Return Value Handling",
                  swc: "SWC-104",
                  desc: "Non-standard tokens (USDT/BNB) silent failure modes",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleInvariant(item.key)}
                  className={`p-3.5 rounded-[4px] border cursor-pointer select-none transition-colors ${
                    invariants[item.key]
                      ? "bg-bg-panel-raised border-accent-scan/50"
                      : "bg-bg-void border-border-hairline hover:border-hairline/80 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-sans text-xs font-semibold text-text-primary flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-[2px] border flex items-center justify-center ${
                          invariants[item.key]
                            ? "bg-accent-scan border-accent-scan text-bg-void"
                            : "border-border-hairline"
                        }`}
                      >
                        {invariants[item.key] && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-accent-scan">
                      {item.swc}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1.5 pl-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBMISSION & QUOTE RECAP BAR */}
        <div className="p-6 rounded-[4px] bg-bg-panel-raised border border-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 font-mono text-xs">
            <div className="text-text-primary font-semibold flex items-center gap-2">
              <span>SCOPED REVIEW SUMMARY:</span>
              <span className="text-accent-scan">#ZAM-9486</span>
            </div>
            <div className="text-text-muted text-[11px]">
              {calculatedSloc} SLOC · 14 AST Passes · 2 Senior Auditors · {turnaroundSla} ETA
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/portal">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit for Review
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
