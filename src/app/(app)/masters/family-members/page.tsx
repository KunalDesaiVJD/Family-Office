import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { familyMembers } from "@/data/mockFamily";

export const metadata: Metadata = { title: "Family Members" };

const RELATIONSHIP: Record<string, string> = {
  self: "Self",
  spouse: "Spouse",
  son: "Son",
  daughter: "Daughter",
  father: "Father",
  mother: "Mother",
  huf: "HUF",
  entity: "Entity",
};

const statusBadge: Record<string, MasterBadgeSpec> = {
  active: { tone: "success", label: "Active" },
  onboarding: { tone: "warning", label: "Onboarding" },
  inactive: { tone: "neutral", label: "Inactive" },
};

const rows = familyMembers.map((m) => ({
  id: m.id,
  tenantId: m.tenantId,
  name: m.name,
  relationship: RELATIONSHIP[m.relationship] ?? m.relationship,
  governanceRole: m.governanceRole,
  pan: m.pan,
  netWorth: m.netWorth,
  entities: m.entityIds.length,
  status: m.status,
  joinedAt: m.joinedAt,
}));

const relationshipOptions = Array.from(
  new Set(rows.map((r) => r.relationship)),
).map((v) => ({ value: v, label: v }));

const columns: MasterColumn[] = [
  { key: "name", header: "Member", type: "strong" },
  { key: "relationship", header: "Relationship", type: "text" },
  { key: "governanceRole", header: "Governance Role", type: "muted" },
  { key: "pan", header: "PAN", type: "mono" },
  { key: "netWorth", header: "Net Worth", type: "compactCurrency", align: "right" },
  { key: "entities", header: "Entities", type: "number", align: "right" },
  { key: "status", header: "Status", type: "badge", badgeMap: statusBadge },
];

const filters: MasterFilter[] = [
  { key: "relationship", label: "Relationship", options: relationshipOptions },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "onboarding", label: "Onboarding" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

const detailFields: MasterDetailField[] = [
  { key: "name", label: "Member", type: "strong" },
  { key: "relationship", label: "Relationship" },
  { key: "governanceRole", label: "Governance Role" },
  { key: "pan", label: "PAN", type: "mono" },
  { key: "netWorth", label: "Net Worth", type: "compactCurrency" },
  { key: "entities", label: "Linked Entities", type: "number" },
  { key: "status", label: "Status", type: "badge", badgeMap: statusBadge },
  { key: "joinedAt", label: "Joined", type: "date" },
];

export default function FamilyMembersMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Family Members"
      description="Master register of family members — relationships, governance roles, PANs and linked entities across the household."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["name", "pan", "governanceRole"]}
      titleKey="name"
      subtitleKey="governanceRole"
      detailFields={detailFields}
      addLabel="Add member"
      entityLabel="family member"
      searchPlaceholder="Search by name, PAN or role…"
    />
  );
}
