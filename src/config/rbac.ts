// Role → permission matrix and helpers.

import type { UserRole } from "@/types/tenant";
import type {
  Permission,
  PermissionAction,
  PermissionResource,
  Role,
} from "@/types/rbac";

const RESOURCES: PermissionResource[] = [
  "dashboard",
  "family",
  "entities",
  "pan",
  "broker",
  "demat",
  "mutualFunds",
  "insurance",
  "tally",
  "documents",
  "tax",
  "reconciliation",
  "workflow",
  "admin",
  "billing",
  "audit",
  "trading",
];

const ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "export",
];

export const ALL_PERMISSIONS: Permission[] = RESOURCES.flatMap((r) =>
  ACTIONS.map((a) => `${r}:${a}` as Permission),
);

const perms = (
  resources: PermissionResource[],
  actions: PermissionAction[],
): Permission[] =>
  resources.flatMap((r) => actions.map((a) => `${r}:${a}` as Permission));

const VIEWABLE: PermissionResource[] = [
  "dashboard",
  "family",
  "entities",
  "pan",
  "broker",
  "demat",
  "mutualFunds",
  "insurance",
  "tally",
  "documents",
  "tax",
  "reconciliation",
  "workflow",
];

const MANAGEABLE: PermissionResource[] = [
  "family",
  "entities",
  "pan",
  "broker",
  "demat",
  "mutualFunds",
  "insurance",
  "tally",
  "documents",
];

export const ROLE_DEFINITIONS: Record<UserRole, Role> = {
  owner: {
    key: "owner",
    label: "Owner",
    description:
      "Full, unrestricted access including billing and controlled trading.",
    permissions: "*",
  },
  admin: {
    key: "admin",
    label: "Administrator",
    description: "Full operational access except controlled trading.",
    permissions: ALL_PERMISSIONS.filter((p) => !p.startsWith("trading:")),
  },
  advisor: {
    key: "advisor",
    label: "Advisor",
    description: "Manage wealth records and raise items for approval.",
    permissions: [
      ...perms(VIEWABLE, ["view", "export"]),
      ...perms(MANAGEABLE, ["create", "edit"]),
      "workflow:approve",
    ],
  },
  member: {
    key: "member",
    label: "Family Member",
    description: "View and export consolidated wealth.",
    permissions: perms(VIEWABLE, ["view", "export"]),
  },
  viewer: {
    key: "viewer",
    label: "Viewer",
    description: "Read-only access to consolidated wealth.",
    permissions: perms(VIEWABLE, ["view"]),
  },
  auditor: {
    key: "auditor",
    label: "Auditor",
    description: "Read-only access plus the full audit trail.",
    permissions: [...perms(VIEWABLE, ["view"]), "audit:view", "audit:export"],
  },
};

export function permissionsForRole(role: UserRole): Permission[] {
  const def = ROLE_DEFINITIONS[role];
  return def.permissions === "*" ? ALL_PERMISSIONS : def.permissions;
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const def = ROLE_DEFINITIONS[role];
  return def.permissions === "*" ? true : def.permissions.includes(permission);
}
