// Tenant & platform-level domain types.
// The platform is multi-tenant by design even though only one family is onboarded today.

export type PlanTier = "family" | "office" | "enterprise";

export interface Tenant {
  /** Stable tenant identifier — present on every record for SaaS multi-tenancy. */
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  baseCurrency: string;
  primaryContact: string;
  onboardedAt: string;
  /** Future billing plans / connector toggles live behind feature flags. */
  featureFlags: Record<string, boolean>;
}

export type UserRole =
  | "owner"
  | "admin"
  | "advisor"
  | "member"
  | "viewer"
  | "auditor";

export type UserStatus = "active" | "invited" | "suspended";

export interface TenantUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActiveAt: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: "tenant" | "global";
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
  timestamp: string;
  ipAddress?: string;
}
