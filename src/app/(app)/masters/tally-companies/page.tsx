import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { tallyCompanies } from "@/data/mockTally";

export const metadata: Metadata = { title: "Tally Companies" };

const syncBadge: Record<string, MasterBadgeSpec> = {
  synced: { tone: "success", label: "Synced" },
  pending: { tone: "warning", label: "Pending" },
  error: { tone: "danger", label: "Error" },
  never: { tone: "neutral", label: "Never" },
};

const rows = tallyCompanies.map((c) => ({
  id: c.id,
  tenantId: c.tenantId,
  entityId: c.entityId,
  companyName: c.companyName,
  gstin: c.gstin,
  financialYear: c.financialYear,
  lastSyncedAt: c.lastSyncedAt,
  syncState: c.syncState,
  ledgerCount: c.ledgerCount,
  closingBalance: c.closingBalance,
}));

const columns: MasterColumn[] = [
  { key: "companyName", header: "Company", type: "strong" },
  { key: "gstin", header: "GSTIN", type: "mono" },
  { key: "financialYear", header: "FY", type: "muted" },
  { key: "ledgerCount", header: "Ledgers", type: "number", align: "right" },
  { key: "closingBalance", header: "Closing", type: "compactCurrency", align: "right" },
  { key: "syncState", header: "Sync", type: "badge", badgeMap: syncBadge },
  { key: "lastSyncedAt", header: "Last Synced", type: "datetime" },
];

const financialYears = Array.from(new Set(rows.map((r) => r.financialYear)));

const filters: MasterFilter[] = [
  {
    key: "syncState",
    label: "Sync State",
    options: [
      { value: "synced", label: "Synced" },
      { value: "pending", label: "Pending" },
      { value: "error", label: "Error" },
      { value: "never", label: "Never" },
    ],
  },
  {
    key: "financialYear",
    label: "Financial Year",
    options: financialYears.map((fy) => ({ value: fy, label: fy })),
  },
];

const detailFields: MasterDetailField[] = [
  { key: "companyName", label: "Company", type: "strong" },
  { key: "gstin", label: "GSTIN", type: "mono" },
  { key: "entityId", label: "Legal Entity", type: "mono" },
  { key: "financialYear", label: "Financial Year", type: "muted" },
  { key: "ledgerCount", label: "Ledgers", type: "number" },
  { key: "closingBalance", label: "Closing Balance", type: "currency" },
  { key: "syncState", label: "Sync State", type: "badge", badgeMap: syncBadge },
  { key: "lastSyncedAt", label: "Last Synced", type: "datetime" },
];

export default function TallyCompaniesMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Tally Companies"
      description="Master register of Tally company files mapped to legal entities, with sync status."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["companyName", "gstin"]}
      titleKey="companyName"
      subtitleKey="gstin"
      detailFields={detailFields}
      addLabel="Add company"
      entityLabel="Tally company"
    />
  );
}
