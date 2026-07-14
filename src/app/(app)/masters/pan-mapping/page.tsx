import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { panRecords } from "@/data/mockPanRegistry";

export const metadata: Metadata = { title: "PAN Mapping" };

const holderTypeBadge: Record<string, MasterBadgeSpec> = {
  individual: { tone: "info", label: "Individual" },
  entity: { tone: "brand", label: "Entity" },
};

const statusBadge: Record<string, MasterBadgeSpec> = {
  active: { tone: "success", label: "Active" },
  inactive: { tone: "neutral", label: "Inactive" },
};

const subtypeLabels: Record<string, string> = {
  father: "Father",
  self: "Self",
  spouse: "Spouse",
  mother: "Mother",
  son: "Son",
  daughter: "Daughter",
  huf: "HUF",
  private_limited: "Private Limited",
  llp: "LLP",
  trust: "Trust",
  partnership: "Partnership",
  individual: "Individual",
};

const rows = panRecords.map((r) => ({
  id: r.id,
  tenantId: r.tenantId,
  pan: r.pan,
  holderName: r.holderName,
  holderType: r.holderType,
  subtype: r.subtype,
  subtypeLabel: subtypeLabels[r.subtype] ?? r.subtype,
  linkedTo: r.linkedTo,
  status: r.status,
}));

const columns: MasterColumn[] = [
  { key: "pan", header: "PAN", type: "mono" },
  { key: "holderName", header: "Holder", type: "strong" },
  { key: "holderType", header: "Holder Type", type: "badge", badgeMap: holderTypeBadge },
  { key: "subtypeLabel", header: "Classification", type: "muted" },
  { key: "linkedTo", header: "Linked To", type: "muted" },
  { key: "status", header: "Status", type: "badge", badgeMap: statusBadge },
];

const filters: MasterFilter[] = [
  {
    key: "holderType",
    label: "Holder Type",
    options: [
      { value: "individual", label: "Individual" },
      { value: "entity", label: "Entity" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

const detailFields: MasterDetailField[] = [
  { key: "pan", label: "PAN", type: "mono" },
  { key: "holderName", label: "Holder", type: "strong" },
  { key: "holderType", label: "Holder Type", type: "badge", badgeMap: holderTypeBadge },
  { key: "subtypeLabel", label: "Classification", type: "muted" },
  { key: "linkedTo", label: "Linked To", type: "muted" },
  { key: "status", label: "Status", type: "badge", badgeMap: statusBadge },
];

export default function PanMappingMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="PAN Mapping"
      description="Unified PAN registry mapping every PAN to its holder — individuals and legal entities."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["pan", "holderName"]}
      titleKey="holderName"
      subtitleKey="pan"
      detailFields={detailFields}
      addLabel="Add PAN"
      entityLabel="PAN record"
    />
  );
}
