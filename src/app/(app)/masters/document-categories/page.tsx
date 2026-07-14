import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { documentCategories } from "@/data/mockDocumentCategories";

export const metadata: Metadata = { title: "Document Categories" };

const statusBadge: Record<string, MasterBadgeSpec> = {
  active: { tone: "success", label: "Active" },
  draft: { tone: "warning", label: "Draft" },
  archived: { tone: "neutral", label: "Archived" },
};

const rows = documentCategories.map((c) => ({
  id: c.id,
  tenantId: c.tenantId,
  code: c.code,
  label: c.label,
  description: c.description,
  documentCount: c.documentCount,
  retentionMonths: c.retentionMonths,
  status: c.status,
}));

const columns: MasterColumn[] = [
  { key: "label", header: "Category", type: "strong" },
  { key: "code", header: "Code", type: "mono" },
  { key: "description", header: "Description", type: "muted" },
  { key: "documentCount", header: "Documents", type: "number", align: "right" },
  { key: "retentionMonths", header: "Retention (mo)", type: "number", align: "right" },
  { key: "status", header: "Status", type: "badge", badgeMap: statusBadge },
];

const filters: MasterFilter[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
];

const detailFields: MasterDetailField[] = [
  { key: "label", label: "Category", type: "strong" },
  { key: "code", label: "Code", type: "mono" },
  { key: "description", label: "Description", type: "muted" },
  { key: "documentCount", label: "Documents", type: "number" },
  { key: "retentionMonths", label: "Retention (months)", type: "number" },
  { key: "status", label: "Status", type: "badge", badgeMap: statusBadge },
];

export default function DocumentCategoriesMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Document Categories"
      description="Master register of document classifications, retention rules and counts for the vault."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["label", "code", "description"]}
      titleKey="label"
      subtitleKey="code"
      detailFields={detailFields}
      addLabel="Add category"
      entityLabel="category"
      searchPlaceholder="Search by name, code or description…"
    />
  );
}
