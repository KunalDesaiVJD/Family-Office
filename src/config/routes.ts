// Centralised route constants — the single source of truth for app paths.

export const ROUTES = {
  dashboard: "/dashboard",
  family: "/family",
  brokerHub: "/broker-hub",
  mutualFunds: "/mutual-funds",
  bankBalances: "/bank-balances",
  insuranceVault: "/insurance-vault",
  tallySync: "/tally-sync",
  taxCentre: "/tax-centre",
  documentVault: "/document-vault",
  aiDesk: "/ai-desk",
  workflowCentre: "/workflow-centre",
  adminSettings: "/admin-settings",
  masters: {
    familyMembers: "/masters/family-members",
    legalEntities: "/masters/legal-entities",
    panMapping: "/masters/pan-mapping",
    brokerAccounts: "/masters/broker-accounts",
    dematAccounts: "/masters/demat-accounts",
    bankAccounts: "/masters/bank-accounts",
    mutualFundFolios: "/masters/mutual-fund-folios",
    insurancePolicies: "/masters/insurance-policies",
    tallyCompanies: "/masters/tally-companies",
    documentCategories: "/masters/document-categories",
  },
} as const;

export type AppRoute = string;
