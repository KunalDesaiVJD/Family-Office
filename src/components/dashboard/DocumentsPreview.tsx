import { Badge, type BadgeTone } from "@/components/ui";
import { Icon } from "@/components/icons";
import { vaultDocuments } from "@/data/mockDocuments";
import type { DocumentCategory, DocumentStatus } from "@/types/document";
import { formatDate } from "@/lib/format";

const categoryLabel: Record<DocumentCategory, string> = {
  statement: "Statement",
  contract_note: "Contract Note",
  policy: "Policy",
  legal: "Legal",
  tax: "Tax",
  kyc: "KYC",
};

const statusTone: Record<DocumentStatus, BadgeTone> = {
  verified: "success",
  pending: "warning",
  expiring: "danger",
};

const statusLabel: Record<DocumentStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  expiring: "Expiring",
};

/** Most recent documents in the vault. */
export function DocumentsPreview({ limit = 5 }: { limit?: number }) {
  const items = [...vaultDocuments]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, limit);

  return (
    <ul className="divide-y divide-line">
      {items.map((d) => (
        <li
          key={d.id}
          className="flex items-center justify-between gap-3 px-6 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-muted">
              <Icon name="documents" size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{d.name}</p>
              <p className="text-xs text-muted">
                {categoryLabel[d.category]} · {formatDate(d.uploadedAt)}
              </p>
            </div>
          </div>
          <Badge tone={statusTone[d.status]}>{statusLabel[d.status]}</Badge>
        </li>
      ))}
    </ul>
  );
}
