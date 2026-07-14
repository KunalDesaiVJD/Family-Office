"use client";

import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  MetricCard,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDateTime, formatNumber, maskClientCode } from "@/lib/format";
import type {
  ImportStatus,
  TradeImportBatch,
  TradeImportRow,
  TradeValidationError,
} from "@/lib/portfolio/types";

interface Props {
  batches: TradeImportBatch[];
}

const statusMeta: Record<ImportStatus, { tone: BadgeTone; label: string }> = {
  uploaded: { tone: "neutral", label: "Uploaded" },
  validating: { tone: "info", label: "Validating" },
  validated: { tone: "info", label: "Validated" },
  awaiting_review: { tone: "warning", label: "Awaiting Review" },
  imported: { tone: "success", label: "Imported" },
  partially_imported: { tone: "warning", label: "Partially Imported" },
  rejected: { tone: "danger", label: "Rejected" },
  failed: { tone: "danger", label: "Failed" },
};

const rowStatusMeta: Record<TradeImportRow["status"], { tone: BadgeTone; label: string }> = {
  valid: { tone: "success", label: "Valid" },
  invalid: { tone: "danger", label: "Invalid" },
  duplicate: { tone: "warning", label: "Duplicate" },
};

const sourceLabel: Record<string, string> = {
  csv_upload: "CSV Upload",
  excel_upload: "Excel Upload",
  contract_note_pdf: "Contract Note PDF",
  angel_api: "Angel API",
  manual_adjustment: "Manual Adjustment",
  mock: "Mock",
};

const TIMELINE: { key: string; label: string; statuses: ImportStatus[] }[] = [
  { key: "uploaded", label: "Uploaded", statuses: ["uploaded", "validating", "validated", "awaiting_review", "imported", "partially_imported", "rejected", "failed"] },
  { key: "validated", label: "Validated", statuses: ["validated", "awaiting_review", "imported", "partially_imported", "rejected"] },
  { key: "reviewed", label: "Reviewed", statuses: ["imported", "partially_imported", "rejected"] },
  { key: "imported", label: "Imported", statuses: ["imported", "partially_imported"] },
];

const strong = (v: string) => <span className="font-medium text-ink">{v}</span>;
const muted = (v: string) => <span className="text-muted">{v}</span>;

function UploadTile({ icon, title, hint }: { icon: "download" | "documents" | "tally"; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-slate-50/50 px-4 py-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-blue shadow-card">
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <Button variant="outline" size="sm" className="mt-3" disabled>
        Choose file
      </Button>
    </div>
  );
}

function Def({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

export function TradeImportClient({ batches }: Props) {
  const [selectedId, setSelectedId] = useState(batches[0]?.id ?? "");
  const batch = batches.find((b) => b.id === selectedId) ?? batches[0];

  if (!batch) {
    return (
      <EmptyState
        title="No import batches"
        description="Upload a broker trade book (CSV/Excel) or contract note PDF to begin importing historical trades."
        icon={<Icon name="download" size={22} />}
      />
    );
  }

  const rows = batch.rows ?? [];
  const previewRows = rows;
  const errorRows: (TradeValidationError & { rowNumber: number; id: string })[] = rows.flatMap((r) =>
    r.errors.map((e) => ({ ...e, rowNumber: r.rowNumber, id: `${r.rowNumber}-${e.field ?? "row"}-${e.code}` })),
  );
  const duplicateRows = rows.filter((r) => r.isDuplicate);
  const rejectedRows = rows.filter((r) => r.status === "invalid");
  const activeStep = TIMELINE.filter((s) => s.statuses.includes(batch.status)).length;

  const previewCols: DataTableColumn<TradeImportRow>[] = [
    { key: "rowNumber", header: "#", render: (_v, r) => muted(String(r.rowNumber)) },
    { key: "tradeDateTime", header: "Trade Time", render: (_v, r) => muted(formatDateTime(r.raw.tradeDateTime)) },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.raw.tradingSymbol || "—") },
    { key: "buySell", header: "Side", render: (_v, r) => <Badge tone={r.raw.buySell?.toUpperCase() === "SELL" ? "danger" : "success"}>{r.raw.buySell || "—"}</Badge> },
    { key: "quantity", header: "Qty", align: "right", render: (_v, r) => <span className="tabular-nums">{formatNumber(r.raw.quantity)}</span> },
    { key: "price", header: "Price", align: "right", render: (_v, r) => <span className="tabular-nums">{formatNumber(r.raw.price, 2)}</span> },
    { key: "isin", header: "ISIN", render: (_v, r) => muted(r.raw.isin ?? "—") },
    { key: "status", header: "Status", render: (_v, r) => <Badge tone={rowStatusMeta[r.status].tone} dot>{rowStatusMeta[r.status].label}</Badge> },
  ];

  const errorCols: DataTableColumn<(typeof errorRows)[number]>[] = [
    { key: "rowNumber", header: "Row", render: (_v, r) => muted(String(r.rowNumber)) },
    { key: "field", header: "Field", render: (_v, r) => strong(r.field ?? "—") },
    { key: "code", header: "Code", render: (_v, r) => muted(r.code) },
    { key: "severity", header: "Severity", render: (_v, r) => <Badge tone={r.severity === "error" ? "danger" : "warning"}>{r.severity}</Badge> },
    { key: "message", header: "Message", render: (_v, r) => <span className="text-ink">{r.message}</span> },
  ];

  const dupCols: DataTableColumn<TradeImportRow>[] = [
    { key: "rowNumber", header: "Row", render: (_v, r) => muted(String(r.rowNumber)) },
    { key: "tradeId", header: "Trade ID", render: (_v, r) => strong(r.raw.tradeId) },
    { key: "orderId", header: "Order ID", render: (_v, r) => muted(r.raw.orderId) },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.raw.tradingSymbol) },
    { key: "tradeDateTime", header: "Trade Time", render: (_v, r) => muted(formatDateTime(r.raw.tradeDateTime)) },
  ];

  return (
    <div className="space-y-8">
      {/* Upload placeholders */}
      <Card
        title="Upload Trade History"
        description="File processing is not enabled in this version — the upload flow and validation are demonstrated on mock batches."
        action={<Badge tone="neutral" dot>Upload disabled in this version</Badge>}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <UploadTile icon="download" title="CSV Trade Book" hint="Angel / broker CSV export" />
          <UploadTile icon="tally" title="Excel Trade Book" hint=".xlsx statement" />
          <UploadTile icon="documents" title="Contract Note PDF" hint="Parsing arrives with live connector" />
        </div>
      </Card>

      {/* Batch selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Import Batch</span>
        {batches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedId(b.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              b.id === batch.id ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-line bg-white text-muted hover:text-ink"
            }`}
          >
            {b.fileName}
            <Badge tone={statusMeta[b.status].tone}>{statusMeta[b.status].label}</Badge>
          </button>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total Rows" value={formatNumber(batch.totalRows)} icon={<Icon name="documents" size={18} />} />
        <MetricCard label="Valid Rows" value={formatNumber(batch.validRows)} tone="positive" icon={<Icon name="check" size={18} />} />
        <MetricCard label="Invalid Rows" value={formatNumber(batch.invalidRows)} tone={batch.invalidRows > 0 ? "negative" : "default"} icon={<Icon name="alert" size={18} />} />
        <MetricCard label="Duplicate Rows" value={formatNumber(batch.duplicateRows)} tone={batch.duplicateRows > 0 ? "warning" : "default"} icon={<Icon name="sync" size={18} />} />
        <MetricCard label="Imported Rows" value={formatNumber(batch.importedRows)} tone="positive" icon={<Icon name="funds" size={18} />} />
        <MetricCard label="Rejected Rows" value={formatNumber(batch.rejectedRows)} tone={batch.rejectedRows > 0 ? "negative" : "default"} icon={<Icon name="alert" size={18} />} />
      </div>

      {/* Import summary + mapping + timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Import Summary">
          <div className="px-1">
            <Def label="Source file">{batch.fileName}</Def>
            <Def label="Source"><Badge tone="neutral">{sourceLabel[batch.source] ?? batch.source}</Badge></Def>
            <Def label="Status"><Badge tone={statusMeta[batch.status].tone} dot>{statusMeta[batch.status].label}</Badge></Def>
            <Def label="Uploaded by">{batch.uploadedBy}</Def>
            <Def label="Uploaded at">{formatDateTime(batch.uploadedAt)}</Def>
          </div>
        </Card>

        <Card title="Mapping" description="Owner, financial year and broker account mapping for this batch.">
          <div className="px-1">
            <Def label="Family member">{batch.familyMemberName ?? "—"}</Def>
            <Def label="Financial year">{batch.financialYear ?? "—"}</Def>
            <Def label="Broker account">{batch.brokerAccountId ?? "—"}</Def>
            <Def label="Client code">{batch.clientCode ? maskClientCode(batch.clientCode) : "—"}</Def>
          </div>
        </Card>

        <Card title="Import Status" description="Lifecycle of this import batch.">
          <ol className="relative space-y-4 px-1">
            {TIMELINE.map((step, i) => {
              const done = i < activeStep;
              return (
                <li key={step.key} className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-brand-blue text-white" : "bg-slate-100 text-muted"}`}>
                    {done ? <Icon name="check" size={13} /> : i + 1}
                  </span>
                  <span className={`text-sm ${done ? "font-medium text-ink" : "text-muted"}`}>{step.label}</span>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      {/* Preview */}
      <Card title="Import Preview" description="Parsed rows from the selected batch." padded={false}>
        <DataTable columns={previewCols} rows={previewRows} rowKey="rowNumber" emptyMessage="No rows parsed for this batch (awaiting file processing)." />
      </Card>

      {/* Validation errors */}
      <Card title="Validation Errors" description="Row-level errors and warnings from the validation rules." padded={false}>
        <DataTable columns={errorCols} rows={errorRows} emptyMessage="No validation errors — all rows passed." />
      </Card>

      {/* Duplicate detection */}
      <Card
        title="Duplicate Detection"
        description="Duplicates keyed on tenantId + clientCode + orderId + tradeId + tradeDateTime."
        action={<Badge tone={duplicateRows.length > 0 ? "warning" : "success"} dot>{duplicateRows.length} duplicate row(s)</Badge>}
        padded={false}
      >
        {duplicateRows.length > 0 ? (
          <DataTable columns={dupCols} rows={duplicateRows} rowKey="rowNumber" />
        ) : (
          <div className="p-6">
            <EmptyState title="No duplicates detected" description="Every row in this batch has a unique trade key." icon={<Icon name="check" size={22} />} />
          </div>
        )}
      </Card>

      {/* Rejected rows */}
      <Card
        title="Rejected Rows"
        description="Rows that would be rejected on import until their errors are corrected."
        action={<Badge tone={rejectedRows.length > 0 ? "danger" : "success"} dot>{rejectedRows.length} row(s)</Badge>}
        padded={false}
      >
        {rejectedRows.length > 0 ? (
          <DataTable columns={previewCols} rows={rejectedRows} rowKey="rowNumber" />
        ) : (
          <div className="p-6">
            <EmptyState title="No rejected rows" description="All rows are valid or awaiting review." icon={<Icon name="check" size={22} />} />
          </div>
        )}
      </Card>
    </div>
  );
}
