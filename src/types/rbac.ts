// Role-based access control types. The permission matrix lives in config/rbac.

import type { UserRole } from "./tenant";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export";

export type PermissionResource =
  | "dashboard"
  | "family"
  | "entities"
  | "pan"
  | "broker"
  | "demat"
  | "mutualFunds"
  | "insurance"
  | "tally"
  | "documents"
  | "tax"
  | "reconciliation"
  | "workflow"
  | "admin"
  | "billing"
  | "audit"
  | "trading";

/** e.g. "broker:view", "workflow:approve". */
export type Permission = `${PermissionResource}:${PermissionAction}`;

export interface Role {
  key: UserRole;
  label: string;
  description: string;
  /** Explicit permission list, or "*" for all permissions. */
  permissions: Permission[] | "*";
}
