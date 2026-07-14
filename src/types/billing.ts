// Subscription / billing plan types (SaaS-ready; no real billing in this build).

import type { PlanTier, FeatureFlagKey } from "./tenant";

export type BillingCycle = "monthly" | "annual";

export interface PlanLimits {
  /** -1 denotes unlimited. */
  maxUsers: number;
  maxEntities: number;
  maxConnectors: number;
  auditRetentionMonths: number;
}

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  /** Price per billing cycle in INR; 0 denotes custom / contact sales. */
  priceInr: number;
  billingCycle: BillingCycle;
  /** Feature flags enabled by this plan. */
  features: FeatureFlagKey[];
  limits: PlanLimits;
}
