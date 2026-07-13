import type { Tenant } from "@/types/tenant";
import type { NetWorthPoint, AllocationSlice } from "@/types/portfolio";
import type { ReconciliationException } from "@/types/tally";

/** Single active tenant today; the model is multi-tenant. */
export const TENANT_ID = "tnt_crownglobe";

export const tenant: Tenant = {
  id: TENANT_ID,
  name: "CrownGlobe Family",
  slug: "crownglobe-family",
  plan: "family",
  baseCurrency: "INR",
  primaryContact: "info@crownglobe.com",
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

export interface DashboardMetrics {
  consolidatedNetWorth: number;
  totalListedEquity: number;
  mutualFundValue: number;
  bankBalance: number;
  insuranceCover: number;
  brokerCash: number;
  openExceptions: number;
  pendingAuthentications: number;
  premiumsDue: { count: number; amount: number };
  todaysMovement: { amount: number; percent: number };
}

/** All amounts in INR (paise-free rupees). */
export const dashboardMetrics: DashboardMetrics = {
  consolidatedNetWorth: 1_420_000_000,
  totalListedEquity: 584_000_000,
  mutualFundValue: 312_000_000,
  bankBalance: 126_000_000,
  insuranceCover: 451_000_000,
  brokerCash: 38_000_000,
  openExceptions: 7,
  pendingAuthentications: 3,
  premiumsDue: { count: 4, amount: 1_860_000 },
  todaysMovement: { amount: 6_840_000, percent: 0.48 },
};

export const netWorthTrend: NetWorthPoint[] = [
  { period: "Dec", value: 1_268_000_000 },
  { period: "Jan", value: 1_295_000_000 },
  { period: "Feb", value: 1_312_000_000 },
  { period: "Mar", value: 1_288_000_000 },
  { period: "Apr", value: 1_340_000_000 },
  { period: "May", value: 1_372_000_000 },
  { period: "Jun", value: 1_398_000_000 },
  { period: "Jul", value: 1_420_000_000 },
];

export const allocation: AllocationSlice[] = [
  { label: "Listed Equity", value: 584_000_000, color: "#2563eb" },
  { label: "Mutual Funds", value: 312_000_000, color: "#1e40af" },
  { label: "Bank & Cash", value: 164_000_000, color: "#10b981" },
  { label: "Real Estate", value: 260_000_000, color: "#13284c" },
  { label: "Unlisted / PE", value: 100_000_000, color: "#f59e0b" },
];

export type ModuleReadinessStatus = "live" | "beta" | "planned" | "syncing";

export interface ModuleReadinessItem {
  title: string;
  description: string;
  status: ModuleReadinessStatus;
  href: string;
  meta: string;
}

export const moduleReadiness: ModuleReadinessItem[] = [
  {
    title: "Broker Hub",
    description:
      "Consolidated demat holdings and broker cash across the family's trading accounts.",
    status: "live",
    href: "/broker-hub",
    meta: "5 accounts · ₹3.80 Cr cash",
  },
  {
    title: "Mutual Funds",
    description:
      "Folio-level holdings, NAV and XIRR across AMCs for every family member.",
    status: "live",
    href: "/mutual-funds",
    meta: "7 folios · ₹31.20 Cr",
  },
  {
    title: "Bank Balances",
    description:
      "Aggregated balances across savings, current and deposit accounts by entity.",
    status: "beta",
    href: "/bank-balances",
    meta: "4 accounts linked",
  },
  {
    title: "Tally Sync",
    description:
      "Ledger reconciliation between books of account and consolidated holdings.",
    status: "syncing",
    href: "/tally-sync",
    meta: "3 companies · FY 25-26",
  },
  {
    title: "Insurance Vault",
    description:
      "Policy register with sum assured, premium schedule and nominee tracking.",
    status: "live",
    href: "/insurance-vault",
    meta: "7 policies · ₹45 Cr cover",
  },
  {
    title: "Tax Centre",
    description:
      "Capital gains, advance tax and filing status across PANs and entities.",
    status: "planned",
    href: "/tax-centre",
    meta: "AY 2026-27",
  },
  {
    title: "Document Vault",
    description:
      "Secure repository for statements, contract notes and legal documents.",
    status: "beta",
    href: "/document-vault",
    meta: "128 documents",
  },
  {
    title: "AI Desk",
    description:
      "Automated exception summaries and narrative insights over consolidated data.",
    status: "beta",
    href: "/ai-desk",
    meta: "7 open exceptions",
  },
  {
    title: "Workflow Centre",
    description:
      "Approvals, maker-checker controls and a full tenant audit trail.",
    status: "planned",
    href: "/workflow-centre",
    meta: "Approvals engine",
  },
];

export const recentExceptions: ReconciliationException[] = [
  {
    id: "exc_1001",
    tenantId: TENANT_ID,
    source: "ICICI Direct",
    description: "Contract note value mismatch vs demat holding",
    severity: "high",
    amount: 245_000,
    status: "open",
    raisedAt: "2026-07-12",
  },
  {
    id: "exc_1002",
    tenantId: TENANT_ID,
    source: "HDFC Bank",
    description: "Unreconciled inflow not mapped to a ledger",
    severity: "medium",
    amount: 1_200_000,
    status: "in_review",
    raisedAt: "2026-07-11",
  },
  {
    id: "exc_1003",
    tenantId: TENANT_ID,
    source: "Tally · Crown Global Ventures",
    description: "Dividend credit missing in books of account",
    severity: "medium",
    amount: 84_000,
    status: "open",
    raisedAt: "2026-07-10",
  },
  {
    id: "exc_1004",
    tenantId: TENANT_ID,
    source: "Zerodha",
    description: "Corporate action (bonus) not yet reflected",
    severity: "low",
    amount: 0,
    status: "open",
    raisedAt: "2026-07-09",
  },
  {
    id: "exc_1005",
    tenantId: TENANT_ID,
    source: "Kotak Securities",
    description: "Re-authentication required to resume sync",
    severity: "high",
    amount: 0,
    status: "open",
    raisedAt: "2026-07-13",
  },
];
