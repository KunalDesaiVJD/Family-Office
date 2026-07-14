import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { bankAccounts } from "@/data/mockBank";

export const metadata: Metadata = { title: "Bank Accounts" };

const typeBadge: Record<string, MasterBadgeSpec> = {
  savings: { tone: "neutral", label: "Savings" },
  current: { tone: "neutral", label: "Current" },
  fd: { tone: "neutral", label: "Fixed Deposit" },
  nre: { tone: "neutral", label: "NRE" },
  nro: { tone: "neutral", label: "NRO" },
};

const connectionBadge: Record<string, MasterBadgeSpec> = {
  connected: { tone: "success", label: "Connected" },
  syncing: { tone: "info", label: "Syncing" },
  auth_required: { tone: "warning", label: "Auth required" },
  error: { tone: "danger", label: "Error" },
  disconnected: { tone: "neutral", label: "Disconnected" },
};

const rows = bankAccounts.map((a) => ({
  id: a.id,
  tenantId: a.tenantId,
  entityId: a.entityId,
  holderName: a.holderName,
  bank: a.bank,
  accountType: a.accountType,
  maskedNumber: a.maskedNumber,
  balance: a.balance,
  connectionStatus: a.connectionStatus,
  lastSyncedAt: a.lastSyncedAt,
}));

const bankOptions = Array.from(new Set(rows.map((r) => r.bank))).map((v) => ({
  value: v,
  label: v,
}));

const columns: MasterColumn[] = [
  { key: "holderName", header: "Holder", type: "strong" },
  { key: "bank", header: "Bank", type: "text" },
  { key: "accountType", header: "Type", type: "badge", badgeMap: typeBadge },
  { key: "maskedNumber", header: "Account", type: "mono" },
  { key: "balance", header: "Balance", type: "compactCurrency", align: "right" },
  {
    key: "connectionStatus",
    header: "Connection",
    type: "badge",
    badgeMap: connectionBadge,
  },
  { key: "lastSyncedAt", header: "Last Synced", type: "datetime" },
];

const filters: MasterFilter[] = [
  { key: "bank", label: "Bank", options: bankOptions },
  {
    key: "accountType",
    label: "Type",
    options: [
      { value: "savings", label: "Savings" },
      { value: "current", label: "Current" },
      { value: "fd", label: "Fixed Deposit" },
      { value: "nre", label: "NRE" },
      { value: "nro", label: "NRO" },
    ],
  },
  {
    key: "connectionStatus",
    label: "Connection",
    options: [
      { value: "connected", label: "Connected" },
      { value: "syncing", label: "Syncing" },
      { value: "auth_required", label: "Auth required" },
      { value: "error", label: "Error" },
      { value: "disconnected", label: "Disconnected" },
    ],
  },
];

const detailFields: MasterDetailField[] = [
  { key: "holderName", label: "Holder", type: "strong" },
  { key: "bank", label: "Bank" },
  { key: "accountType", label: "Account Type", type: "badge", badgeMap: typeBadge },
  { key: "maskedNumber", label: "Account Number", type: "mono" },
  { key: "balance", label: "Balance", type: "compactCurrency" },
  {
    key: "connectionStatus",
    label: "Connection",
    type: "badge",
    badgeMap: connectionBadge,
  },
  { key: "entityId", label: "Legal Entity", type: "mono" },
  { key: "lastSyncedAt", label: "Last Synced", type: "datetime" },
];

export default function BankAccountsMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Bank Accounts"
      description="Master register of bank accounts by entity across savings, current and deposit relationships."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["holderName", "bank", "maskedNumber"]}
      titleKey="holderName"
      subtitleKey="bank"
      detailFields={detailFields}
      addLabel="Add account"
      entityLabel="bank account"
      searchPlaceholder="Search by holder, bank or account…"
    />
  );
}
