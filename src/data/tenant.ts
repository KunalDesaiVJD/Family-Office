import type { Tenant } from "@/types/tenant";

// Standalone tenant module so every mock-data file can import TENANT_ID
// without creating a cycle through the aggregating dashboard module.
export const TENANT_ID = "tnt_vjdesai";

export const tenant: Tenant = {
  id: TENANT_ID,
  name: "V J Desai Family",
  slug: "vj-desai-family",
  plan: "family",
  baseCurrency: "INR",
  primaryContact: "info@vjdesai.com",
  onboardedAt: "2025-11-02",
  featureFlags: {
    brokerHub: true,
    mutualFunds: true,
    bankBalances: true,
    tallySync: true,
    insuranceVault: true,
    aiDesk: true,
    controlledTrading: false,
    billing: false,
  },
};
