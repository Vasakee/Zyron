"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Key,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Edit,
  History,
  CheckCircle2,
  X,
  Check,
  UserCheck,
  UserX,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "client" | "auditor" | "senior_auditor" | "admin";
  accessLevel: "Read-Only" | "Source Review" | "Lead Sign-off" | "Root Superuser";
  organization: string;
  status: "active" | "suspended";
  lastActive: string;
  twoFactorEnabled: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  targetUser: string;
  action: string;
  previousRole: string;
  newRole: string;
  justification: string;
}

export default function UserRoleManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

  const [users, setUsers] = React.useState<UserAccount[]>([
    {
      id: "usr_01",
      name: "0xAuditor_K4",
      email: "k4@zyron.labs",
      role: "senior_auditor",
      accessLevel: "Lead Sign-off",
      organization: "Zyron Security Labs",
      status: "active",
      lastActive: "2 mins ago",
      twoFactorEnabled: true,
    },
    {
      id: "usr_02",
      name: "0xAuditor_M2",
      email: "m2@zyron.labs",
      role: "auditor",
      accessLevel: "Source Review",
      organization: "Zyron Security Labs",
      status: "active",
      lastActive: "14 mins ago",
      twoFactorEnabled: true,
    },
    {
      id: "usr_03",
      name: "0xAuditor_S9",
      email: "s9@zyron.labs",
      role: "auditor",
      accessLevel: "Source Review",
      organization: "Zyron Security Labs",
      status: "active",
      lastActive: "1h ago",
      twoFactorEnabled: true,
    },
    {
      id: "usr_04",
      name: "Aura Finance DAO",
      email: "security@auraprotocol.io",
      role: "client",
      accessLevel: "Read-Only",
      organization: "Aura Protocol DAO Ltd.",
      status: "active",
      lastActive: "3h ago",
      twoFactorEnabled: true,
    },
    {
      id: "usr_05",
      name: "Nexus Collateral Core",
      email: "secops@nexusvaults.org",
      role: "client",
      accessLevel: "Read-Only",
      organization: "Nexus Vaults Foundation",
      status: "active",
      lastActive: "Yesterday",
      twoFactorEnabled: false,
    },
    {
      id: "usr_06",
      name: "Chronos Yield Team",
      email: "devs@chronos.fi",
      role: "client",
      accessLevel: "Read-Only",
      organization: "Chronos DAO",
      status: "active",
      lastActive: "3 days ago",
      twoFactorEnabled: true,
    },
    {
      id: "usr_07",
      name: "Solv Synthetic Protocol",
      email: "audit-contact@solv.protocol",
      role: "client",
      accessLevel: "Read-Only",
      organization: "Solv Financial",
      status: "suspended",
      lastActive: "14 days ago",
      twoFactorEnabled: false,
    },
    {
      id: "usr_08",
      name: "0xAdmin_SecOps",
      email: "admin@zyron.labs",
      role: "admin",
      accessLevel: "Root Superuser",
      organization: "Zyron Governance",
      status: "active",
      lastActive: "Active Now",
      twoFactorEnabled: true,
    },
  ]);

  // Real Audit Log of Role Mutations
  const [auditLog, setAuditLog] = React.useState<AuditLogEntry[]>([
    {
      id: "LOG-9821",
      timestamp: "2026-08-22 14:15 UTC",
      actor: "0xAdmin_SecOps",
      targetUser: "0xAuditor_K4 (k4@zyron.labs)",
      action: "ELEVATE_ACCESS",
      previousRole: "auditor (Source Review)",
      newRole: "senior_auditor (Lead Sign-off)",
      justification: "Assigned lead signing responsibility for Q3/Q4 DeFi protocol queue.",
    },
    {
      id: "LOG-9819",
      timestamp: "2026-08-20 09:30 UTC",
      actor: "0xAdmin_SecOps",
      targetUser: "Solv Synthetic Protocol",
      action: "SUSPEND_ACCESS",
      previousRole: "client (Active)",
      newRole: "client (Suspended)",
      justification: "Invoice past due Net-30; restricted repository ingestion pending settlement.",
    },
  ]);

  // Modal State for Consequential Role Change Confirmation
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<UserAccount | null>(null);
  const [targetNewRole, setTargetNewRole] = React.useState<"client" | "auditor" | "senior_auditor" | "admin">("auditor");
  const [justification, setJustification] = React.useState("");
  const [acknowledgedRisk, setAcknowledgedRisk] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mutationSuccess, setMutationSuccess] = React.useState(false);

  const openEditModal = (user: UserAccount) => {
    setSelectedUserForEdit(user);
    setTargetNewRole(user.role);
    setJustification("");
    setAcknowledgedRisk(false);
  };

  const handleConfirmRoleMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !justification.trim() || !acknowledgedRisk) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const updatedRole = targetNewRole;
      const updatedAccess: UserAccount["accessLevel"] =
        updatedRole === "admin"
          ? "Root Superuser"
          : updatedRole === "senior_auditor"
          ? "Lead Sign-off"
          : updatedRole === "auditor"
          ? "Source Review"
          : "Read-Only";

      // Update users state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserForEdit.id
            ? { ...u, role: updatedRole, accessLevel: updatedAccess }
            : u
        )
      );

      // Append immutable entry to audit log
      const newEntry: AuditLogEntry = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
        actor: "0xAdmin_SecOps",
        targetUser: `${selectedUserForEdit.name} (${selectedUserForEdit.email})`,
        action: "ROLE_PERMISSION_MUTATION",
        previousRole: `${selectedUserForEdit.role} (${selectedUserForEdit.accessLevel})`,
        newRole: `${updatedRole} (${updatedAccess})`,
        justification: justification.trim(),
      };

      setAuditLog((prev) => [newEntry, ...prev]);
      setMutationSuccess(true);
      setSelectedUserForEdit(null);
      setTimeout(() => setMutationSuccess(false), 3000);
    }, 1000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              User & Role Governance
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Manage privileged access levels and confidential smart contract source permissions across all accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge severity="informational" size="sm">
            {users.length} REGISTERED ACCOUNTS
          </Badge>
          <Badge severity="critical" size="sm">
            MUTATIONS AUDIT-LOGGED
          </Badge>
        </div>
      </div>

      {mutationSuccess && (
        <div className="p-4 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/40 text-signal-resolved font-mono text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Role mutation committed and permanently written to the admin audit log.</span>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email, or organization..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-text-muted text-[11px] shrink-0">FILTER ROLE:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="auditor">Auditors Only</option>
            <option value="senior_auditor">Senior Auditors Only</option>
            <option value="client">Clients Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ACCOUNTS TABLE                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-text-primary font-sans">
            Platform Accounts Register
          </h3>
          <span className="text-[11px] text-text-muted">
            Showing {filteredUsers.length} of {users.length} accounts
          </span>
        </div>

        <div className="rounded-[4px] bg-bg-panel border border-border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-hairline bg-bg-void/60 text-[11px]">
                <TableHead className="font-mono text-text-muted py-3 px-4">ACCOUNT / ENTITY</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">ASSIGNED ROLE</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">ACCESS PRIVILEGE</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">SECURITY (2FA)</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">STATUS</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4 text-right">GOVERNANCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-border-hairline hover:bg-bg-panel-raised/50 transition-colors"
                >
                  {/* Account Name & Email */}
                  <TableCell className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-text-primary text-xs">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {user.email} · {user.organization}
                      </div>
                    </div>
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-[2px] font-bold border ${
                        user.role === "admin"
                          ? "bg-signal-critical/15 text-signal-critical border-signal-critical/40"
                          : user.role === "senior_auditor"
                          ? "bg-signal-high/15 text-signal-high border-signal-high/40"
                          : user.role === "auditor"
                          ? "bg-accent-scan/15 text-accent-scan border-accent-scan/40"
                          : "bg-bg-void text-text-muted border-border-hairline"
                      }`}
                    >
                      {user.role.toUpperCase().replace("_", " ")}
                    </span>
                  </TableCell>

                  {/* Access Level */}
                  <TableCell className="py-3.5 px-4 text-text-primary text-xs">
                    <div className="flex items-center gap-1.5">
                      {user.accessLevel === "Root Superuser" ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-signal-critical" />
                      ) : user.accessLevel === "Lead Sign-off" ? (
                        <Key className="h-3.5 w-3.5 text-signal-high" />
                      ) : user.accessLevel === "Source Review" ? (
                        <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-text-muted" />
                      )}
                      <span>{user.accessLevel}</span>
                    </div>
                  </TableCell>

                  {/* 2FA */}
                  <TableCell className="py-3.5 px-4">
                    {user.twoFactorEnabled ? (
                      <span className="text-[10px] text-signal-resolved flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Enforced (FIDO2)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-signal-critical flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Unenforced</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-medium ${
                        user.status === "active"
                          ? "text-signal-resolved bg-signal-resolved/10"
                          : "text-signal-critical bg-signal-critical/10"
                      }`}
                    >
                      {user.status.toUpperCase()}
                    </span>
                  </TableCell>

                  {/* Edit Role Button */}
                  <TableCell className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      leftIcon={<Edit className="h-3 w-3 text-accent-scan" />}
                    >
                      Modify Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: IMMUTABLE AUDIT LOG OF ACCESS CHANGES                          */}
      {/* ========================================================================= */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-accent-scan" />
            <h3 className="font-display text-sm font-semibold text-text-primary font-sans">
              Privileged Governance Audit Trail
            </h3>
          </div>
          <span className="text-[10px] text-text-muted">
            SHA-256 APPEND-ONLY LOG
          </span>
        </div>

        <div className="rounded-[4px] bg-bg-panel border border-border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-hairline bg-bg-void/60 text-[11px]">
                <TableHead className="font-mono text-text-muted py-3 px-4">LOG ID / TIME</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">ACTOR</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">TARGET ACCOUNT</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">TRANSITION</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">JUSTIFICATION / REASON</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-b border-border-hairline hover:bg-bg-panel-raised/50"
                >
                  <TableCell className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="text-accent-scan font-bold">{log.id}</span>
                      <div className="text-[10px] text-text-muted">{log.timestamp}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">
                    <span className="text-signal-critical font-semibold">{log.actor}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">
                    {log.targetUser}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-text-muted line-through">{log.previousRole}</span>
                      <ArrowRight className="h-3 w-3 text-accent-scan" />
                      <span className="text-signal-resolved font-bold">{log.newRole}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-muted text-[11px] font-sans">
                    "{log.justification}"
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CONSEQUENTAL ROLE MUTATION CONFIRMATION                            */}
      {/* ========================================================================= */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[4px] bg-bg-panel border-2 border-signal-critical/50 shadow-2xl p-6 md:p-8 space-y-6 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// PRIVILEGED_ACTION · ">
                  CONSEQUENTIAL_ACCESS_MUTATION
                </Eyebrow>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Modify Account Role & Code Access
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Account Info */}
            <div className="p-4 rounded-[3px] bg-bg-void border border-border-hairline space-y-2">
              <div className="text-[10px] text-text-muted">TARGET ACCOUNT:</div>
              <div className="text-text-primary font-bold text-sm">
                {selectedUserForEdit.name} ({selectedUserForEdit.email})
              </div>
              <div className="text-[11px] text-text-muted">
                Organization: {selectedUserForEdit.organization} · Current Role: <strong className="text-accent-scan">{selectedUserForEdit.role.toUpperCase()}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmRoleMutation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">SELECT NEW PRIVILEGE LEVEL</label>
                <select
                  value={targetNewRole}
                  onChange={(e) => setTargetNewRole(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
                >
                  <option value="client">Client (Read-Only Portal & Billing Access)</option>
                  <option value="auditor">Auditor (Unreleased Smart Contract Source Access)</option>
                  <option value="senior_auditor">Senior Auditor (Dual-Pane Review & Final Signing Authority)</option>
                  <option value="admin">Platform Admin (Root Superuser Access)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">MANDATORY JUSTIFICATION REASON</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="State the security or operational justification (e.g. Lead auditor rotation for DeFi protocol scope #ZAM-9481)..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none resize-none font-sans"
                />
              </div>

              {/* Warning Callout */}
              <div className="p-3.5 rounded-[3px] bg-signal-critical/10 border border-signal-critical/40 space-y-2">
                <div className="flex items-center gap-2 text-signal-critical font-bold text-[11px]">
                  <AlertTriangle className="h-4 w-4" />
                  <span>CONSEQUENTIAL ACCESS PRIVILEGE WARNING</span>
                </div>
                <p className="text-[11px] text-text-muted font-sans leading-relaxed">
                  Elevating this account grants access to unreleased, proprietary client Solidity source code, AST invariants, and cryptographic attestation keys.
                </p>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgedRisk}
                    onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                    className="mt-0.5 rounded bg-bg-void border-border-hairline text-signal-critical focus:ring-0"
                  />
                  <span className="text-[11px] text-text-primary font-bold">
                    I acknowledge that this action will be permanently recorded in the immutable audit trail.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserForEdit(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!justification.trim() || !acknowledgedRisk}
                  isLoading={isSubmitting}
                  className="bg-signal-critical hover:bg-signal-critical/90 text-bg-void font-bold"
                  leftIcon={<Key className="h-4 w-4" />}
                >
                  Commit Role Mutation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
