// Tenant & platform-level domain types.
// The platform is multi-tenant by design even though only one family is onboarded today.

export type PlanTier = "family" | "office" | "enterprise";

export interface Tenant {
  /** Stable tenant identifier — present on every record for SaaS multi-tenancy. */
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  /** Subscription plan id (see config/plans). */
  planId: string;
  baseCurrency: string;
  /** IANA timezone used for all date/time rendering, e.g. "Asia/Kolkata". */
  timeZone: string;
  primaryContact: string;
  onboardedAt: string;
  /** Per-tenant feature-flag overrides on top of the platform defaults. */
  featureFlags: Partial<Record<FeatureFlagKey, boolean>>;
}

/** Canonical set of platform feature-flag keys. */
export type FeatureFlagKey =
  | "brokerHub"
  | "mutualFunds"
  | "bankBalances"
  | "tallySync"
  | "insuranceVault"
  | "aiDesk"
  | "documentVault"
  | "taxCentre"
  | "workflow"
  | "masterData"
  | "controlledTrading"
  | "billing"
  | "liveConnectors"
  | "ssoEnforcement";

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

/** Canonical alias — a platform user is a tenant-scoped user. */
export type User = TenantUser;

export interface FeatureFlag {
  key: FeatureFlagKey;
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

/** Canonical alias for a single audit-log record. */
export type AuditLog = AuditLogEntry;
