import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { brokerAccounts } from "@/data/mockBrokerAccounts";

export const metadata: Metadata = { title: "Broker Accounts" };

const connectionBadge: Record<string, MasterBadgeSpec> = {
  connected: { tone: "success", label: "Connected" },
  syncing: { tone: "info", label: "Syncing" },
  auth_required: { tone: "warning", label: "Auth required" },
  error: { tone: "danger", label: "Error" },
  disconnected: { tone: "neutral", label: "Disconnected" },
};

const rows = brokerAccounts.map((a) => ({
  id: a.id,
  tenantId: a.tenantId,
  ownerName: a.ownerName,
  broker: a.broker,
  clientCode: a.clientCode,
  depository: a.demat.depository,
  equityValue: a.equityValue,
  cashBalance: a.cashBalance,
  connectionStatus: a.connectionStatus,
  pendingAuthLabel: a.pendingAuth ? "Yes" : "No",
  lastSyncedAt: a.lastSyncedAt,
}));

const columns: MasterColumn[] = [
  { key: "ownerName", header: "Owner", type: "strong" },
  { key: "broker", header: "Broker", type: "text" },
  { key: "clientCode", header: "Client Code", type: "mono" },
  { key: "equityValue", header: "Equity", type: "compactCurrency", align: "right" },
  { key: "cashBalance", header: "Cash", type: "compactCurrency", align: "right" },
  { key: "connectionStatus", header: "Connection", type: "badge", badgeMap: connectionBadge },
  { key: "lastSyncedAt", header: "Last Synced", type: "datetime" },
];

const brokerOptions = Array.from(new Set(rows.map((r) => r.broker))).map((b) => ({
  value: b,
  label: b,
}));

const filters: MasterFilter[] = [
  { key: "broker", label: "Broker", options: brokerOptions },
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
  { key: "ownerName", label: "Owner", type: "strong" },
  { key: "broker", label: "Broker", type: "text" },
  { key: "clientCode", label: "Client Code", type: "mono" },
  { key: "depository", label: "Depository", type: "text" },
  { key: "equityValue", label: "Equity Value", type: "currency" },
  { key: "cashBalance", label: "Cash Balance", type: "currency" },
  { key: "connectionStatus", label: "Connection", type: "badge", badgeMap: connectionBadge },
  { key: "pendingAuthLabel", label: "Pending Auth", type: "text" },
  { key: "lastSyncedAt", label: "Last Synced", type: "datetime" },
];

export default function BrokerAccountsMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Broker Accounts"
      description="Master register of broker and trading accounts across family members, with connection health."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["ownerName", "clientCode", "broker"]}
      titleKey="ownerName"
      subtitleKey="broker"
      detailFields={detailFields}
      addLabel="Add account"
      entityLabel="broker account"
    />
  );
}
