// Platform feature-flag defaults. Per-tenant overrides live on tenant.featureFlags.

import type { FeatureFlagKey } from "@/types/tenant";

// NOTE: there are intentionally no bankBalances or aiDesk flags — the Bank
// Balance and AI Desk modules are out of scope for the current version.
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
  brokerHub: true,
  mutualFunds: true,
  tallySync: true,
  insuranceVault: true,
  documentVault: true,
  taxCentre: true,
  reconciliation: true,
  workflow: true,
  masterData: true,
  // Off by default — future / gated capabilities.
  controlledTrading: false,
  billing: false,
  liveConnectors: false,
  ssoEnforcement: false,
};

export const featureFlagKeys = Object.keys(
  DEFAULT_FEATURE_FLAGS,
) as FeatureFlagKey[];

/** Resolve a flag: tenant override first, then platform default. */
export function isFeatureEnabled(
  key: FeatureFlagKey,
  overrides?: Partial<Record<FeatureFlagKey, boolean>>,
): boolean {
  if (overrides && key in overrides && overrides[key] !== undefined) {
    return Boolean(overrides[key]);
  }
  return DEFAULT_FEATURE_FLAGS[key];
}
