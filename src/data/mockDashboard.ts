import type { NetWorthPoint, AllocationSlice } from "@/types/portfolio";
import type { ModuleReadinessItem } from "@/types/insight";
import { familyMembers } from "./mockFamily";
import { brokerAccounts } from "./mockBrokerAccounts";
import { mutualFundFolios } from "./mockMutualFunds";
import { insurancePolicies, premiumsDueSoon } from "./mockInsurance";
import { reconciliationExceptions, tallyCompanies } from "./mockTally";
import { TOTAL_DOCUMENTS } from "./mockDocuments";

// NOTE: there is intentionally no bank data and no AI summary here — the Bank
// Balance and AI Desk modules are out of scope for the current version.

// Re-export tenant identity so existing imports of these from "@/data/mockDashboard"
// keep working while the canonical source lives in ./tenant (no import cycle).
export { TENANT_ID, tenant } from "./tenant";

// --- Derived aggregates (single source of truth) -----------------------------

const sum = <T>(rows: readonly T[], pick: (row: T) => number): number =>
  rows.reduce((acc, row) => acc + pick(row), 0);

const consolidatedNetWorth = sum(familyMembers, (m) => m.netWorth);
const totalListedEquity = sum(brokerAccounts, (a) => a.equityValue);
const brokerCash = sum(brokerAccounts, (a) => a.cashBalance);
const mutualFundValue = sum(mutualFundFolios, (f) => f.currentValue);
const insuranceCover = sum(insurancePolicies, (p) => p.sumAssured);

const openExceptions = reconciliationExceptions.filter(
  (e) => e.status !== "resolved",
).length;
const pendingAuthentications = brokerAccounts.filter(
  (a) => a.pendingAuth,
).length;
const premiumsDueAmount = sum(premiumsDueSoon, (p) => p.annualPremium);

export interface DashboardMetrics {
  consolidatedNetWorth: number;
  totalListedEquity: number;
  mutualFundValue: number;
  insuranceCover: number;
  /** Broker cash from Angel funds / RMS — not a bank balance. */
  brokerCash: number;
  openExceptions: number;
  pendingAuthentications: number;
  premiumsDue: { count: number; amount: number };
  todaysMovement: { amount: number; percent: number };
}

export const dashboardMetrics: DashboardMetrics = {
  consolidatedNetWorth,
  totalListedEquity,
  mutualFundValue,
  insuranceCover,
  brokerCash,
  openExceptions,
  pendingAuthentications,
  premiumsDue: { count: premiumsDueSoon.length, amount: premiumsDueAmount },
  todaysMovement: { amount: 6_240_000, percent: 0.42 },
};

export const netWorthTrend: NetWorthPoint[] = [
  { period: "Dec", value: 1_305_000_000 },
  { period: "Jan", value: 1_332_000_000 },
  { period: "Feb", value: 1_358_000_000 },
  { period: "Mar", value: 1_329_000_000 },
  { period: "Apr", value: 1_386_000_000 },
  { period: "May", value: 1_418_000_000 },
  { period: "Jun", value: 1_452_000_000 },
  { period: "Jul", value: consolidatedNetWorth },
];

export const allocation: AllocationSlice[] = [
  { label: "Listed Equity", value: totalListedEquity, color: "#2563eb" },
  { label: "Mutual Funds", value: mutualFundValue, color: "#1e40af" },
  { label: "Broker Cash", value: brokerCash, color: "#10b981" },
  { label: "Real Estate", value: 360_000_000, color: "#13284c" },
  { label: "Unlisted / PE", value: 168_800_000, color: "#f59e0b" },
];

export const moduleReadiness: ModuleReadinessItem[] = [
  {
    key: "broker-hub",
    title: "Broker Hub",
    description:
      "Consolidated demat holdings and broker cash across the family's trading accounts.",
    status: "live",
    href: "/broker-hub",
    meta: `${brokerAccounts.length} accounts · ₹${(brokerCash / 1_00_00_000).toFixed(2)} Cr cash`,
    icon: "broker",
    progress: 100,
  },
  {
    key: "mutual-funds",
    title: "Mutual Funds",
    description:
      "Folio-level holdings, NAV and XIRR across AMCs, transacted through SMC.",
    status: "live",
    href: "/mutual-funds",
    meta: `${mutualFundFolios.length} folios via SMC`,
    icon: "funds",
    progress: 100,
  },
  {
    key: "tally-sync",
    title: "Tally Sync",
    description:
      "Ledger reconciliation between books of account and consolidated holdings.",
    status: "syncing",
    href: "/tally-sync",
    meta: `${tallyCompanies.length} companies · FY 25-26`,
    icon: "tally",
    progress: 60,
  },
  {
    key: "insurance-vault",
    title: "Insurance Vault",
    description:
      "Policy register with sum assured, premium schedule and nominee tracking.",
    status: "live",
    href: "/insurance-vault",
    meta: `${insurancePolicies.length} policies · ₹${(insuranceCover / 1_00_00_000).toFixed(0)} Cr cover`,
    icon: "insurance",
    progress: 100,
  },
  {
    key: "tax-centre",
    title: "Tax Centre",
    description:
      "FIFO capital gains, STCG/LTCG schedules and charges across PANs and entities.",
    status: "live",
    href: "/tax-centre",
    meta: "FY 2026-27",
    icon: "tax",
    progress: 100,
  },
  {
    key: "reconciliation",
    title: "Reconciliation Centre",
    description:
      "Broker holdings, funds and trade book reconciled against the internal ledger.",
    status: "live",
    href: "/reconciliation",
    meta: "Investment reconciliation",
    icon: "sync",
    progress: 100,
  },
  {
    key: "document-vault",
    title: "Document Vault",
    description:
      "Secure repository for contract notes, statements and policy documents.",
    status: "beta",
    href: "/document-vault",
    meta: `${TOTAL_DOCUMENTS} documents`,
    icon: "documents",
    progress: 65,
  },
  {
    key: "workflow-centre",
    title: "Workflow Centre",
    description:
      "Approvals, maker-checker controls and a full tenant audit trail.",
    status: "planned",
    href: "/workflow-centre",
    meta: "Approvals engine",
    icon: "workflow",
    progress: 20,
  },
];

/** Shared operational exception feed consumed by the dashboard preview. */
export const recentExceptions = reconciliationExceptions;
