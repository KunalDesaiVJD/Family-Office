import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { mutualFundFolios } from "@/data/mockMutualFunds";

export const metadata: Metadata = { title: "Mutual Fund Folios" };

const categoryBadge: Record<string, MasterBadgeSpec> = {
  equity: { tone: "info", label: "Equity" },
  debt: { tone: "info", label: "Debt" },
  hybrid: { tone: "info", label: "Hybrid" },
  liquid: { tone: "info", label: "Liquid" },
  index: { tone: "info", label: "Index" },
  elss: { tone: "info", label: "ELSS" },
};

const rows = mutualFundFolios.map((f) => ({
  id: f.id,
  tenantId: f.tenantId,
  ownerName: f.ownerName,
  amc: f.amc,
  scheme: f.scheme,
  folioNo: f.folioNo,
  category: f.category,
  currentValue: f.currentValue,
  invested: f.invested,
  xirr: f.xirr,
  distributor: f.distributor,
}));

const amcOptions = Array.from(new Set(rows.map((r) => r.amc))).map((v) => ({
  value: v,
  label: v,
}));

const columns: MasterColumn[] = [
  { key: "ownerName", header: "Owner", type: "strong" },
  { key: "amc", header: "AMC", type: "muted" },
  { key: "scheme", header: "Scheme", type: "text" },
  { key: "folioNo", header: "Folio", type: "mono" },
  { key: "category", header: "Category", type: "badge", badgeMap: categoryBadge },
  { key: "currentValue", header: "Value", type: "compactCurrency", align: "right" },
  { key: "xirr", header: "XIRR %", type: "number", align: "right" },
];

const filters: MasterFilter[] = [
  {
    key: "category",
    label: "Category",
    options: [
      { value: "equity", label: "Equity" },
      { value: "debt", label: "Debt" },
      { value: "hybrid", label: "Hybrid" },
      { value: "liquid", label: "Liquid" },
      { value: "index", label: "Index" },
      { value: "elss", label: "ELSS" },
    ],
  },
  { key: "amc", label: "AMC", options: amcOptions },
];

const detailFields: MasterDetailField[] = [
  { key: "scheme", label: "Scheme", type: "strong" },
  { key: "ownerName", label: "Owner" },
  { key: "amc", label: "AMC", type: "muted" },
  { key: "folioNo", label: "Folio Number", type: "mono" },
  { key: "category", label: "Category", type: "badge", badgeMap: categoryBadge },
  { key: "currentValue", label: "Current Value", type: "compactCurrency" },
  { key: "invested", label: "Invested", type: "compactCurrency" },
  { key: "xirr", label: "XIRR %", type: "number" },
  { key: "distributor", label: "Distributor", type: "muted" },
];

export default function MutualFundFoliosMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Mutual Fund Folios"
      description="Master register of mutual fund folios across AMCs, transacted through SMC Global Securities."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["ownerName", "scheme", "folioNo", "amc"]}
      titleKey="scheme"
      subtitleKey="ownerName"
      detailFields={detailFields}
      addLabel="Add folio"
      entityLabel="folio"
      searchPlaceholder="Search by owner, scheme, folio or AMC…"
    />
  );
}
