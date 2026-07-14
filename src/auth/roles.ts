// Application access roles and their permission sets. These are the DB-backed
// roles used by the auth foundation (seeded into the Role table). They map onto
// the shared Permission vocabulary in @/types/rbac.

import type { Permission } from "@/types/rbac";
import { ALL_PERMISSIONS } from "@/config/rbac";

export type AppRole =
  | "family_admin"
  | "trader"
  | "accountant"
  | "viewer"
  | "reviewer"
  | "developer_support";

export interface AppRoleDefinition {
  key: AppRole;
  label: string;
  description: string;
  /** Explicit permission list, or "*" for all permissions. */
  permissions: Permission[] | "*";
}

export const APP_ROLES: Record<AppRole, AppRoleDefinition> = {
  family_admin: {
    key: "family_admin",
    label: "Family Admin",
    description: "Full access across the family office.",
    permissions: "*",
  },
  trader: {
    key: "trader",
    label: "Trader",
    description: "View portfolios and raise / place controlled trade orders.",
    permissions: [
      "dashboard:view",
      "dashboard:export",
      "broker:view",
      "demat:view",
      "mutualFunds:view",
      "trading:view",
      "trading:create",
      "aiDesk:view",
    ],
  },
  accountant: {
    key: "accountant",
    label: "Accountant",
    description: "Manage Tally, ledgers, documents and tax records.",
    permissions: [
      "dashboard:view",
      "dashboard:export",
      "tally:view",
      "tally:create",
      "tally:edit",
      "documents:view",
      "documents:create",
      "documents:edit",
      "tax:view",
      "tax:edit",
      "tax:export",
    ],
  },
  viewer: {
    key: "viewer",
    label: "Viewer",
    description: "Read-only access to consolidated wealth.",
    permissions: [
      "dashboard:view",
      "family:view",
      "entities:view",
      "pan:view",
      "broker:view",
      "demat:view",
      "mutualFunds:view",
      "insurance:view",
      "tally:view",
      "documents:view",
      "tax:view",
      "aiDesk:view",
      "workflow:view",
    ],
  },
  reviewer: {
    key: "reviewer",
    label: "Reviewer",
    description: "Review and approve items and read the audit trail.",
    permissions: [
      "dashboard:view",
      "workflow:view",
      "workflow:approve",
      "audit:view",
      "audit:export",
      "aiDesk:view",
    ],
  },
  developer_support: {
    key: "developer_support",
    label: "Developer Support",
    description: "Read-only diagnostic access for platform support.",
    permissions: [
      "dashboard:view",
      "admin:view",
      "audit:view",
      "workflow:view",
      "aiDesk:view",
    ],
  },
};

export const APP_ROLE_LIST: AppRoleDefinition[] = Object.values(APP_ROLES);

export function permissionsForAppRole(role: AppRole): Permission[] {
  const def = APP_ROLES[role];
  return def.permissions === "*" ? ALL_PERMISSIONS : def.permissions;
}

/** Role-based permission helper — usable on the server or client. */
export function appRoleCan(role: AppRole, permission: Permission): boolean {
  const def = APP_ROLES[role];
  return def.permissions === "*" ? true : def.permissions.includes(permission);
}
