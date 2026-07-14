import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { brokerAccounts } from "@/data/mockBrokerAccounts";

export const metadata: Metadata = { title: "Demat Accounts" };

const depositoryBadge: Record<string, MasterBadgeSpec> = {
  NSDL: { tone: "info", label: "NSDL" },
  CDSL: { tone: "brand", label: "CDSL" },
};

const connectionBadge: Record<string, MasterBadgeSpec> = {
  connected: { tone: "success", label: "Connected" },
  syncing: { tone: "info", label: "Syncing" },
  auth_required: { tone: "warning", label: "Auth required" },
  error: { tone: "danger", label: "Error" },
  disconnected: { tone: "neutral", label: "Disconnected" },
};

const rows = brokerAccounts.map((a) => ({
  id: a.demat.id,
  tenantId: a.tenantId,
  ownerName: a.ownerName,
  broker: a.broker,
  dpId: a.demat.dpId,
  boId: a.demat.boId,
  depository: a.demat.depository,
  connectionStatus: a.connectionStatus,
  equityValue: a.equityValue,
  lastSyncedAt: a.lastSyncedAt,
}));

const columns: MasterColumn[] = [
  { key: "ownerName", header: "Owner", type: "strong" },
  { key: "broker", header: "Broker", type: "muted" },
  { key: "dpId", header: "DP ID", type: "mono" },
  { key: "boId", header: "BO ID", type: "mono" },
  { key: "depository", header: "Depository", type: "badge", badgeMap: depositoryBadge },
  {
    key: "connectionStatus",
    header: "Connection",
    type: "badge",
    badgeMap: connectionBadge,
  },
  { key: "lastSyncedAt", header: "Last Synced", type: "datetime" },
];

const filters: MasterFilter[] = [
  {
    key: "depository",
    label: "Depository",
    options: [
      { value: "NSDL", label: "NSDL" },
      { value: "CDSL", label: "CDSL" },
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
  { key: "ownerName", label: "Owner", type: "strong" },
  { key: "broker", label: "Broker", type: "muted" },
  { key: "dpId", label: "DP ID", type: "mono" },
  { key: "boId", label: "BO ID", type: "mono" },
  {
    key: "depository",
    label: "Depository",
    type: "badge",
    badgeMap: depositoryBadge,
  },
  {
    key: "connectionStatus",
    label: "Connection",
    type: "badge",
    badgeMap: connectionBadge,
  },
  { key: "equityValue", label: "Equity Value", type: "compactCurrency" },
  { key: "lastSyncedAt", label: "Last Synced", type: "datetime" },
];

export default function DematAccountsMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Demat Accounts"
      description="Consolidated demat accounts (NSDL/CDSL) linked to the family's broker relationships."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["ownerName", "dpId", "boId"]}
      titleKey="ownerName"
      subtitleKey="broker"
      detailFields={detailFields}
      addLabel="Add demat"
      entityLabel="demat account"
    />
  );
}
