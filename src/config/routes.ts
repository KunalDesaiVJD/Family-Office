// Centralised route constants — the single source of truth for app paths.

// Bank Balances and AI Desk are intentionally absent — they are out of scope
// for the current V J Desai Family version.

export const ROUTES = {
  dashboard: "/dashboard",
  family: "/family",
  brokerHub: "/broker-hub",
  mutualFunds: "/mutual-funds",
  insuranceVault: "/insurance-vault",
  tallySync: "/tally-sync",
  taxCentre: "/tax-centre",
  taxImports: "/tax-centre/imports",
  reconciliation: "/reconciliation",
  documentVault: "/document-vault",
  workflowCentre: "/workflow-centre",
  adminSettings: "/admin-settings",
  masters: {
    familyMembers: "/masters/family-members",
    legalEntities: "/masters/legal-entities",
    panMapping: "/masters/pan-mapping",
    brokerAccounts: "/masters/broker-accounts",
    dematAccounts: "/masters/demat-accounts",
    mutualFundFolios: "/masters/mutual-fund-folios",
    insurancePolicies: "/masters/insurance-policies",
    tallyCompanies: "/masters/tally-companies",
    documentCategories: "/masters/document-categories",
  },
} as const;

export type AppRoute = string;
