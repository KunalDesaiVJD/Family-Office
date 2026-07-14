"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Permission } from "@/types/rbac";
import { appRoleCan, APP_ROLES, type AppRole } from "./roles";
import { MOCK_SESSION, type AuthSession } from "./mockAuth";

export interface AuthContextValue {
  session: AuthSession;
  role: AppRole;
  roleLabel: string;
  /** Role-based permission check. */
  can: (permission: Permission) => boolean;
}

function buildValue(session: AuthSession): AuthContextValue {
  return {
    session,
    role: session.user.role,
    roleLabel: APP_ROLES[session.user.role].label,
    can: (permission) => appRoleCan(session.user.role, permission),
  };
}

// Defaults to the mock session so `useAuth()` is always safe to call.
const AuthContext = createContext<AuthContextValue>(buildValue(MOCK_SESSION));

export function AuthProvider({
  children,
  session = MOCK_SESSION,
}: {
  children: ReactNode;
  session?: AuthSession;
}) {
  return (
    <AuthContext.Provider value={buildValue(session)}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
