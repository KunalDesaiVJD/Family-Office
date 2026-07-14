import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { legalEntities } from "@/data/mockFamily";

export const metadata: Metadata = { title: "Legal Entities" };

const typeBadge: Record<string, MasterBadgeSpec> = {
  individual: { tone: "brand", label: "Individual" },
  huf: { tone: "brand", label: "HUF" },
  private_limited: { tone: "brand", label: "Private Limited" },
  llp: { tone: "brand", label: "LLP" },
  partnership: { tone: "brand", label: "Partnership" },
  trust: { tone: "brand", label: "Trust" },
};

const statusBadge: Record<string, MasterBadgeSpec> = {
  active: { tone: "success", label: "Registered" },
};

const rows = legalEntities.map((e) => ({
  id: e.id,
  tenantId: e.tenantId,
  name: e.name,
  type: e.type,
  pan: e.pan,
  jurisdiction: e.jurisdiction,
  incorporatedOn: e.incorporatedOn,
  status: "active",
}));

const columns: MasterColumn[] = [
  { key: "name", header: "Entity", type: "strong" },
  { key: "type", header: "Type", type: "badge", badgeMap: typeBadge },
  { key: "pan", header: "PAN", type: "mono" },
  { key: "jurisdiction", header: "Jurisdiction", type: "muted" },
  { key: "incorporatedOn", header: "Incorporated", type: "date" },
  { key: "status", header: "Status", type: "badge", badgeMap: statusBadge },
];

const filters: MasterFilter[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { value: "individual", label: "Individual" },
      { value: "huf", label: "HUF" },
      { value: "private_limited", label: "Private Limited" },
      { value: "llp", label: "LLP" },
      { value: "partnership", label: "Partnership" },
      { value: "trust", label: "Trust" },
    ],
  },
];

const detailFields: MasterDetailField[] = [
  { key: "name", label: "Entity", type: "strong" },
  { key: "type", label: "Type", type: "badge", badgeMap: typeBadge },
  { key: "pan", label: "PAN", type: "mono" },
  { key: "jurisdiction", label: "Jurisdiction", type: "muted" },
  { key: "incorporatedOn", label: "Incorporated", type: "date" },
  { key: "status", label: "Status", type: "badge", badgeMap: statusBadge },
];

export default function LegalEntitiesMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Legal Entities"
      description="Master register of legal entities the family owns or controls, with PAN and jurisdiction for each."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["name", "pan"]}
      titleKey="name"
      subtitleKey="jurisdiction"
      detailFields={detailFields}
      addLabel="Add entity"
      entityLabel="legal entity"
    />
  );
}
