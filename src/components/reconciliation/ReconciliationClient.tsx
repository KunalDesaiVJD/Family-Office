"use client";

import { useMemo, useState } from "react";
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
import { ROUTES } from "@/config/routes";
import { formatDateTime, formatNumber, maskClientCode } from "@/lib/format";
import { getFinancialYear } from "@/lib/portfolio/financialYear";
import type {
  ReconciliationException,
  ReconciliationRun,
  ReconExceptionStatus,
  ReconExceptionType,
  ReconSeverity,
  ReconciliationType,
} from "@/lib/portfolio/types";

interface Props {
  exceptions: ReconciliationException[];
  runs: ReconciliationRun[];
  lastRunAt: string;
}

const severityTone: Record<ReconSeverity, BadgeTone> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

const statusTone: Record<ReconExceptionStatus, BadgeTone> = {
  Open: "info",
  "In Review": "warning",
  "Waiting for Data": "neutral",
  Resolved: "success",
  Ignored: "neutral",
};

const typeLabel: Record<ReconExceptionType, string> = {
  HOLDING_QUANTITY_MISMATCH: "Holding Qty Mismatch",
  HOLDING_VALUE_MISMATCH: "Holding Value Mismatch",
  MISSING_TRADE: "Missing Trade",
  DUPLICATE_TRADE: "Duplicate Trade",
  TRADE_VALUE_MISMATCH: "Trade Value Mismatch",
  FUNDS_BALANCE_MISMATCH: "Funds Balance Mismatch",
  CONTRACT_NOTE_MISSING: "Contract Note Missing",
  LEDGER_ENTRY_MISSING: "Ledger Entry Missing",
  SYMBOL_MAPPING_MISSING: "Symbol Mapping Missing",
  PRICE_MISSING: "Price Missing",
  UNKNOWN: "Unknown",
};

const runMeta: Record<ReconciliationType, { label: string; icon: "funds" | "check" | "bank" | "documents" | "tally" }> = {
  holding: { label: "Holding Reconciliation", icon: "funds" },
  trade: { label: "Trade Reconciliation", icon: "check" },
  funds: { label: "Funds Reconciliation", icon: "bank" },
  contract_note: { label: "Contract Note (placeholder)", icon: "documents" },
  tally_broker_ledger: { label: "Tally ↔ Broker Ledger (placeholder)", icon: "tally" },
};

const ALL = "all";
const strong = (v: string) => <span className="font-medium text-ink">{v}</span>;
const muted = (v: string) => <span className="text-muted">{v}</span>;

function uniq(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort();
}

function fmtVal(v: string | number | undefined): string {
  if (v === undefined) return "—";
  return typeof v === "number" ? formatNumber(v, Number.isInteger(v) ? 0 : 2) : v;
}

function Select({ label, value, onChange, options, render }: { label: string; value: string; onChange: (v: string) => void; options: string[]; render?: (v: string) => string }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand-blue/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20"
      >
        <option value={ALL}>All</option>
        {options.map((o) => (
          <option key={o} value={o}>{render ? render(o) : o}</option>
        ))}
      </select>
    </label>
  );
}

export function ReconciliationClient({ exceptions, runs, lastRunAt }: Props) {
  const [status, setStatus] = useState(ALL);
  const [severity, setSeverity] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [broker, setBroker] = useState(ALL);
  const [symbol, setSymbol] = useState(ALL);
  const [fy, setFy] = useState(ALL);
  const [selected, setSelected] = useState<ReconciliationException | null>(null);

  const eq = (v: string, f: string) => f === ALL || v === f;

  const filtered = useMemo(
    () =>
      exceptions.filter(
        (e) =>
          eq(e.status, status) &&
          eq(e.severity, severity) &&
          eq(e.exceptionType, type) &&
          eq(e.accountOwner ?? "", owner) &&
          eq(e.brokerAccountId ?? "", broker) &&
          eq(e.tradingSymbol ?? "", symbol) &&
          eq(getFinancialYear(e.createdAt).key, fy),
      ),
    [exceptions, status, severity, type, owner, broker, symbol, fy],
  );

  const open = exceptions.filter((e) => e.status !== "Resolved" && e.status !== "Ignored");
  const summary = {
    total: exceptions.length,
    critical: open.filter((e) => e.severity === "Critical").length,
    high: open.filter((e) => e.severity === "High").length,
    resolved: exceptions.filter((e) => e.status === "Resolved").length,
    holding: open.filter((e) => e.exceptionType === "HOLDING_QUANTITY_MISMATCH" || e.exceptionType === "HOLDING_VALUE_MISMATCH").length,
    trade: open.filter((e) => ["MISSING_TRADE", "DUPLICATE_TRADE", "TRADE_VALUE_MISMATCH"].includes(e.exceptionType)).length,
  };

  const opts = {
    status: uniq(exceptions.map((e) => e.status)),
    severity: uniq(exceptions.map((e) => e.severity)),
    type: uniq(exceptions.map((e) => e.exceptionType)),
    owner: uniq(exceptions.map((e) => e.accountOwner)),
    broker: uniq(exceptions.map((e) => e.brokerAccountId)),
    symbol: uniq(exceptions.map((e) => e.tradingSymbol)),
    fy: uniq(exceptions.map((e) => getFinancialYear(e.createdAt).key)),
  };

  const columns: DataTableColumn<ReconciliationException>[] = [
    { key: "severity", header: "Severity", render: (_v, r) => <Badge tone={severityTone[r.severity]} dot>{r.severity}</Badge> },
    { key: "status", header: "Status", render: (_v, r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
    { key: "exceptionType", header: "Type", render: (_v, r) => strong(typeLabel[r.exceptionType]) },
    { key: "accountOwner", header: "Owner", render: (_v, r) => muted(r.accountOwner ?? "—") },
    { key: "clientCode", header: "Client", render: (_v, r) => muted(r.clientCode ? maskClientCode(r.clientCode) : "—") },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.tradingSymbol ?? "—") },
    { key: "expectedValue", header: "Expected", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{fmtVal(r.expectedValue)}</span> },
    { key: "actualValue", header: "Actual", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{fmtVal(r.actualValue)}</span> },
    { key: "difference", header: "Diff", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{r.difference !== undefined ? formatNumber(r.difference, Number.isInteger(r.difference) ? 0 : 2) : "—"}</span> },
    { key: "suggestedAction", header: "Suggested Action", render: (_v, r) => muted(r.suggestedAction ?? "—") },
    { key: "assignedTo", header: "Assigned", render: (_v, r) => muted(r.assignedTo ?? "—") },
    { key: "detail", header: "", render: (_v, r) => <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>View</Button> },
  ];

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total Exceptions" value={formatNumber(summary.total)} icon={<Icon name="alert" size={18} />} />
        <MetricCard label="Critical" value={formatNumber(summary.critical)} tone={summary.critical > 0 ? "negative" : "default"} icon={<Icon name="alert" size={18} />} />
        <MetricCard label="High Priority" value={formatNumber(summary.high)} tone={summary.high > 0 ? "warning" : "default"} icon={<Icon name="shield" size={18} />} />
        <MetricCard label="Resolved" value={formatNumber(summary.resolved)} tone="positive" sublabel="This month" icon={<Icon name="check" size={18} />} />
        <MetricCard label="Holding Mismatches" value={formatNumber(summary.holding)} tone={summary.holding > 0 ? "warning" : "default"} icon={<Icon name="funds" size={18} />} />
        <MetricCard label="Trade Mismatches" value={formatNumber(summary.trade)} tone={summary.trade > 0 ? "warning" : "default"} icon={<Icon name="broker" size={18} />} />
      </div>

      {/* Run panel */}
      <Card
        title="Reconciliation Runs"
        description="Runs execute against mock broker data in this version. Live Angel data connects later."
        action={<span className="text-xs text-muted">Last run {formatDateTime(lastRunAt)}</span>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {runs.map((run) => (
            <div key={run.id} className="rounded-xl2 border border-line bg-slate-50/40 p-4">
              <div className="flex items-center gap-2 text-brand-blue">
                <Icon name={runMeta[run.type].icon} size={16} />
                <span className="text-sm font-medium text-ink">{runMeta[run.type].label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{run.exceptionCount}</p>
              <p className="text-xs text-muted">exception(s)</p>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>Re-run (mock)</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card title="Filters">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <Select label="Status" value={status} onChange={setStatus} options={opts.status} />
          <Select label="Severity" value={severity} onChange={setSeverity} options={opts.severity} />
          <Select label="Type" value={type} onChange={setType} options={opts.type} render={(v) => typeLabel[v as ReconExceptionType] ?? v} />
          <Select label="Family Member" value={owner} onChange={setOwner} options={opts.owner} />
          <Select label="Broker Account" value={broker} onChange={setBroker} options={opts.broker} />
          <Select label="Symbol" value={symbol} onChange={setSymbol} options={opts.symbol} />
          <Select label="Financial Year" value={fy} onChange={setFy} options={opts.fy} />
        </div>
      </Card>

      {/* Exception table */}
      <Card title="Exceptions" description={`${filtered.length} of ${exceptions.length} exception(s)`} padded={false}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} rows={filtered} />
        ) : (
          <div className="p-6">
            <EmptyState
              title="No open reconciliation exceptions."
              description={`Nothing matches the current filters. Last reconciliation run ${formatDateTime(lastRunAt)}.`}
              icon={<Icon name="check" size={22} />}
            />
          </div>
        )}
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-brand-navy/30" onClick={() => setSelected(null)} />
          <aside className="relative z-50 h-full w-full max-w-md overflow-y-auto border-l border-line bg-white shadow-xl">
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={severityTone[selected.severity]} dot>{selected.severity}</Badge>
                  <Badge tone={statusTone[selected.status]}>{selected.status}</Badge>
                </div>
                <h3 className="mt-2 text-base font-semibold text-ink">{typeLabel[selected.exceptionType]}</h3>
                <p className="text-xs text-muted">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Close">
                <Icon name="plus" size={18} className="rotate-45" />
              </button>
            </header>

            <div className="space-y-4 px-5 py-4 text-sm">
              <p className="text-ink">{selected.suggestedReason}</p>

              <div className="rounded-xl2 border border-line">
                {[
                  ["Owner", selected.accountOwner ?? "—"],
                  ["Client code", selected.clientCode ? maskClientCode(selected.clientCode) : "—"],
                  ["Broker account", selected.brokerAccountId ?? "—"],
                  ["Symbol", selected.tradingSymbol ?? "—"],
                  ["ISIN", selected.isin ?? "—"],
                  ["Expected", fmtVal(selected.expectedValue)],
                  ["Actual", fmtVal(selected.actualValue)],
                  ["Difference", selected.difference !== undefined ? formatNumber(selected.difference, Number.isInteger(selected.difference) ? 0 : 2) : "—"],
                  ["Suggested action", selected.suggestedAction ?? "—"],
                  ["Assigned to", selected.assignedTo ?? "Unassigned"],
                  ["Created", formatDateTime(selected.createdAt)],
                  ...(selected.resolvedAt ? [["Resolved", formatDateTime(selected.resolvedAt)] as [string, string]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-0">
                    <span className="text-muted">{label}</span>
                    <span className="font-medium text-ink">{value}</span>
                  </div>
                ))}
              </div>

              {selected.resolutionNote && (
                <div className="rounded-xl2 border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Resolution note</p>
                  <p className="mt-1 text-ink">{selected.resolutionNote}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Comment</p>
                <textarea
                  disabled
                  placeholder="Commenting arrives with the workflow service."
                  className="mt-1 h-20 w-full resize-none rounded-lg border border-line bg-slate-50/50 px-3 py-2 text-sm text-muted"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled>Update status</Button>
                <Button variant="ghost" size="sm" disabled>Assign to accountant</Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Cross-links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" href={ROUTES.brokerHub} leftIcon={<Icon name="broker" size={16} />}>Broker Hub</Button>
        <Button variant="outline" href={ROUTES.taxCentre} leftIcon={<Icon name="tax" size={16} />}>Tax Centre</Button>
        <Button variant="outline" href={ROUTES.taxImports} leftIcon={<Icon name="download" size={16} />}>Trade Import</Button>
      </div>
    </div>
  );
}
