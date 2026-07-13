import type { NetWorthPoint, AllocationSlice } from "@/types/portfolio";
import type {
  ModuleReadinessItem,
  AiDailySummary,
} from "@/types/insight";
import { familyMembers } from "./mockFamily";
import { brokerAccounts } from "./mockBrokerAccounts";
import { mutualFundFolios } from "./mockMutualFunds";
import { bankAccounts } from "./mockBank";
import { insurancePolicies, premiumsDueSoon } from "./mockInsurance";
import { reconciliationExceptions, tallyCompanies } from "./mockTally";
import { TOTAL_DOCUMENTS } from "./mockDocuments";

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
const bankBalance = sum(bankAccounts, (a) => a.balance);
const insuranceCover = sum(insurancePolicies, (p) => p.sumAssured);
const bankAndCash = bankBalance + brokerCash;

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
  bankBalance: number;
  insuranceCover: number;
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
  bankBalance,
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
  { label: "Bank & Cash", value: bankAndCash, color: "#10b981" },
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
    key: "bank-balances",
    title: "Bank Balances",
    description:
      "Aggregated balances across savings, current and deposit accounts by entity.",
    status: "beta",
    href: "/bank-balances",
    meta: `${bankAccounts.length} accounts linked`,
    icon: "bank",
    progress: 70,
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
      "Capital gains, advance tax and filing status across PANs and entities.",
    status: "planned",
    href: "/tax-centre",
    meta: "AY 2026-27",
    icon: "tax",
    progress: 25,
  },
  {
    key: "document-vault",
    title: "Document Vault",
    description:
      "Secure repository for statements, contract notes and legal documents.",
    status: "beta",
    href: "/document-vault",
    meta: `${TOTAL_DOCUMENTS} documents`,
    icon: "documents",
    progress: 65,
  },
  {
    key: "ai-desk",
    title: "AI Desk",
    description:
      "Automated exception summaries and narrative insights over consolidated data.",
    status: "beta",
    href: "/ai-desk",
    meta: `${openExceptions} open exceptions`,
    icon: "ai",
    progress: 55,
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

export const aiDailySummary: AiDailySummary = {
  date: "2026-07-13",
  headline:
    "Consolidated wealth up 0.42% today; two broker connections need re-authentication.",
  highlights: [
    {
      id: "hl_1",
      tone: "positive",
      text: "Listed equity gained ₹62.4 L, led by Larsen & Toubro (+1.24%) and Reliance (+0.82%).",
    },
    {
      id: "hl_2",
      tone: "warning",
      text: "Angel One (Desai Family HUF) and ICICI Direct (Vijay Desai) require re-authentication to resume sync.",
    },
    {
      id: "hl_3",
      tone: "info",
      text: "All 7 SMC-distributed mutual fund folios refreshed NAVs; the fund book stands at ₹31.82 Cr.",
    },
    {
      id: "hl_4",
      tone: "warning",
      text: "5 insurance premiums totalling ₹13.85 L fall due within 45 days, including one policy in grace.",
    },
  ],
  exceptionsSummary:
    "7 open reconciliation exceptions across brokers, banks and Tally — 2 high-severity, ₹15.8 L exposure.",
  confidence: "high",
};

/** Shared exception feed consumed by the dashboard preview and the AI Desk. */
export const recentExceptions = reconciliationExceptions;
