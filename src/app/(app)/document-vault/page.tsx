import type { Metadata } from "next";
import {
  PageHeader,
  MetricCard,
  Card,
  Badge,
  Button,
  DataTable,
  EmptyState,
  type DataTableColumn,
  type BadgeTone,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatNumber, formatDate } from "@/lib/format";
import { documentCategoryLabel } from "@/lib/status";
import { vaultDocuments, TOTAL_DOCUMENTS } from "@/data/mockDocuments";
import type { VaultDocument } from "@/types/document";

export const metadata: Metadata = { title: "Document Vault" };

const STATUS_TONES: Record<VaultDocument["status"], BadgeTone> = {
  verified: "success",
  pending: "warning",
  expiring: "danger",
};

const STATUS_LABELS: Record<VaultDocument["status"], string> = {
  verified: "Verified",
  pending: "Pending",
  expiring: "Expiring",
};

const documents = [...vaultDocuments].sort((a, b) =>
  b.uploadedAt.localeCompare(a.uploadedAt),
);

const categoryCount = new Set(documents.map((d) => d.category)).size;
const verifiedCount = documents.filter((d) => d.status === "verified").length;
const actionNeededCount = documents.filter(
  (d) => d.status === "expiring" || d.status === "pending",
).length;

const columns: DataTableColumn<VaultDocument>[] = [
  {
    key: "name",
    header: "Document",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.name}</span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (_v, row) => (
      <Badge tone="neutral">{documentCategoryLabel[row.category]}</Badge>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    render: (_v, row) => <span className="text-muted">{row.owner}</span>,
  },
  {
    key: "sizeKb",
    header: "Size",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">
        {formatNumber(row.sizeKb)} KB
      </span>
    ),
  },
  {
    key: "uploadedAt",
    header: "Uploaded",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">
        {formatDate(row.uploadedAt)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <Badge tone={STATUS_TONES[row.status]} dot>
        {STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
];

export default function DocumentVaultPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="V J Desai Family · Operations"
        title="Document Vault"
        description="Secure repository for Angel contract notes, ledgers, statements, policy and tax documents across the family office."
        actions={
          <Button
            variant="outline"
            size="md"
            leftIcon={<Icon name="download" size={16} />}
          >
            Export
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Total Documents"
          value={formatNumber(TOTAL_DOCUMENTS)}
          sublabel={`${documents.length} shown`}
          icon={<Icon name="documents" size={18} />}
        />
        <MetricCard
          label="Categories"
          value={String(categoryCount)}
          sublabel="Distinct classifications"
        />
        <MetricCard
          label="Verified"
          value={String(verifiedCount)}
          sublabel="Integrity confirmed"
          tone="positive"
        />
        <MetricCard
          label="Action Needed"
          value={String(actionNeededCount)}
          sublabel="Pending or expiring"
          tone="warning"
        />
        <MetricCard label="Storage Used" value="2.4 GB" sublabel="of 50 GB" />
      </div>

      <Card
        title="Recent Documents"
        description="Latest uploads with category, owner and verification standing across the vault."
        padded={false}
      >
        <DataTable columns={columns} rows={documents} />
      </Card>

      <Card
        title="Upload & Encryption"
        description="Secure ingestion pipeline"
        action={
          <Badge tone="info" dot>
            Beta
          </Badge>
        }
      >
        <EmptyState
          icon={<Icon name="documents" size={18} />}
          title="Drag-and-drop upload with encryption at rest"
          description="Drop contract notes, broker ledgers and statements into the vault to have them classified automatically, encrypted at rest with per-tenant keys and reconciled against family member and entity records. Automated ingestion and retention policies are rolling out in this beta module."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="shield" size={16} />}
            >
              Request access
            </Button>
          }
        />
      </Card>
    </div>
  );
}
