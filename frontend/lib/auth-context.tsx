"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export type UserRole = "client" | "auditor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  walletAddress?: string;
  auditorHandle?: string;
  specialization?: string;
}

export const SAMPLE_ACCOUNTS: Record<UserRole, AuthUser> = {
  client: {
    id: "usr_client_01",
    email: "security@auraprotocol.io",
    name: "Aura Core Protocol",
    role: "client",
    organization: "Aura Finance DAO Ltd.",
    walletAddress: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  },
  auditor: {
    id: "usr_auditor_01",
    email: "k4@zyron.labs",
    name: "0xAuditor_K4",
    role: "auditor",
    auditorHandle: "0xAuditor_K4",
    specialization: "EVM Opcodes · Reentrancy · Invariant Proofs",
  },
  admin: {
    id: "usr_admin_01",
    email: "admin@zyron.labs",
    name: "Platform Security Lead",
    role: "admin",
    organization: "Zyron Security Labs HQ",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(SAMPLE_ACCOUNTS.client);
  const router = useRouter();

  // Load from localStorage if present
  React.useEffect(() => {
    try {
      const savedRole = localStorage.getItem("zyron_auth_role") as UserRole | null;
      if (savedRole && SAMPLE_ACCOUNTS[savedRole]) {
        setUser(SAMPLE_ACCOUNTS[savedRole]);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const loginAs = (role: UserRole) => {
    const selected = SAMPLE_ACCOUNTS[role];
    setUser(selected);
    try {
      localStorage.setItem("zyron_auth_role", role);
    } catch (e) {}

    if (role === "client") {
      router.push("/portal");
    } else if (role === "auditor") {
      router.push("/auditor/queue");
    } else if (role === "admin") {
      router.push("/admin/users");
    } else {
      router.push("/portal");
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("zyron_auth_role");
    } catch (e) {}
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
