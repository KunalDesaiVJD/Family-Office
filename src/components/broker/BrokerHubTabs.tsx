"use client";

import { useState, type ReactNode } from "react";
import {
  Card,
  Badge,
  MetricCard,
  DataTable,
  EmptyState,
  type DataTableColumn,
  type BadgeTone,
} from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { connectionTone, connectionLabel } from "@/lib/status";
import {
  formatCompactINR,
  formatINR,
  formatNumber,
  formatPercent,
  formatDateTime,
} from "@/lib/format";
import type { BrokerAccount } from "@/types/broker";
import type { Holding } from "@/types/portfolio";
import type {
  AngelProfile,
  AngelFunds,
  SyncLogEntry,
  ConnectorHealth,
} from "@/types/angel";

interface Props {
  health: ConnectorHealth;
  accounts: BrokerAccount[];
  holdings: Holding[];
  profile: AngelProfile;
  funds: AngelFunds;
  syncLogs: SyncLogEntry[];
  lastSyncedAt: string;
}

const TABS: { key: string; label: string; icon: IconName }[] = [
  { key: "overview", label: "Overview", icon: "broker" },
  { key: "holdings", label: "Holdings", icon: "funds" },
  { key: "funds", label: "Funds", icon: "bank" },
  { key: "sync", label: "Sync logs", icon: "sync" },
  { key: "health", label: "Connector health", icon: "shield" },
];

const syncStatusBadge: Record<string, { tone: BadgeTone; label: string }> = {
  success: { tone: "success", label: "Success" },
  error: { tone: "danger", label: "Error" },
  running: { tone: "info", label: "Running" },
};

/** Illustrative Angel SmartAPI response shapes (mock — no live call is made). */
const SAMPLE_SUCCESS = {
  status: true,
  message: "SUCCESS",
  errorcode: "",
  data: { tradingsymbol: "RELIANCE-EQ", quantity: 34000, averageprice: 2450, ltp: 2980 },
};
const SAMPLE_FAILURE = {
  status: false,
  message: "Re-authentication required",
  errorcode: "AB1004",
  data: null,
};

const accountColumns: DataTableColumn<BrokerAccount>[] = [
  { key: "ownerName", header: "Owner", render: (_v, r) => <span className="font-medium text-ink">{r.ownerName}</span> },
  { key: "broker", header: "Broker", render: (_v, r) => <span className="text-muted">{r.broker}</span> },
  { key: "clientCode", header: "Client Code", render: (_v, r) => <span className="tabular-nums text-muted">{r.clientCode}</span> },
  { key: "equityValue", header: "Equity", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{formatCompactINR(r.equityValue)}</span> },
  { key: "cashBalance", header: "Cash", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{formatCompactINR(r.cashBalance)}</span> },
  { key: "connectionStatus", header: "Connection", render: (_v, r) => <Badge tone={connectionTone[r.connectionStatus]} dot>{connectionLabel[r.connectionStatus]}</Badge> },
  { key: "lastSyncedAt", header: "Last synced", render: (_v, r) => <span className="text-muted">{formatDateTime(r.lastSyncedAt)}</span> },
];

const holdingColumns: DataTableColumn<Holding>[] = [
  { key: "symbol", header: "Symbol", render: (_v, r) => <span className="font-medium text-ink">{r.symbol}</span> },
  { key: "name", header: "Name", render: (_v, r) => <span className="text-muted">{r.name}</span> },
  { key: "quantity", header: "Qty", align: "right", render: (_v, r) => <span className="tabular-nums">{formatNumber(r.quantity)}</span> },
  { key: "ltp", header: "LTP", align: "right", render: (_v, r) => <span className="tabular-nums">{formatINR(r.ltp)}</span> },
  { key: "value", header: "Value", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{formatCompactINR(r.value)}</span> },
  { key: "dayChangePct", header: "Day", align: "right", render: (_v, r) => <span className={`tabular-nums font-medium ${r.dayChangePct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatPercent(r.dayChangePct)}</span> },
  { key: "sector", header: "Sector", render: (_v, r) => <span className="text-muted">{r.sector}</span> },
];

const fundsAccountColumns: DataTableColumn<BrokerAccount>[] = [
  { key: "ownerName", header: "Owner", render: (_v, r) => <span className="font-medium text-ink">{r.ownerName}</span> },
  { key: "broker", header: "Broker", render: (_v, r) => <span className="text-muted">{r.broker}</span> },
  { key: "cashBalance", header: "Available Cash", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{formatINR(r.cashBalance)}</span> },
];

const syncColumns: DataTableColumn<SyncLogEntry>[] = [
  { key: "operation", header: "Operation", render: (_v, r) => <span className="font-medium text-ink">{r.operation}</span> },
  { key: "status", header: "Status", render: (_v, r) => <Badge tone={syncStatusBadge[r.status].tone} dot>{syncStatusBadge[r.status].label}</Badge> },
  { key: "recordCount", header: "Records", align: "right", render: (_v, r) => <span className="tabular-nums text-muted">{formatNumber(r.recordCount ?? 0)}</span> },
  { key: "durationMs", header: "Duration", align: "right", render: (_v, r) => <span className="tabular-nums text-muted">{r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : "—"}</span> },
  { key: "startedAt", header: "Started", render: (_v, r) => <span className="text-muted">{formatDateTime(r.startedAt)}</span> },
  { key: "error", header: "Detail", render: (_v, r) => (r.error ? <span className="text-red-600">{r.error}</span> : <span className="text-muted">—</span>) },
];

function DefRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

export function BrokerHubTabs({ health, accounts, holdings, profile, funds, syncLogs, lastSyncedAt }: Props) {
  const [tab, setTab] = useState("overview");

  const totalEquity = accounts.reduce((s, a) => s + a.equityValue, 0);
  const totalCash = accounts.reduce((s, a) => s + a.cashBalance, 0);
  const connected = accounts.filter((a) => a.connectionStatus === "connected").length;
  const pendingAuth = accounts.filter((a) => a.pendingAuth).length;
  const holdingsValue = holdings.reduce((s, h) => s + h.value, 0);
  const successSyncs = syncLogs.filter((l) => l.status === "success").length;
  const failedSyncs = syncLogs.filter((l) => l.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={health.tone} dot>{health.label}</Badge>
            <Badge tone="neutral">Read-only</Badge>
            <Badge tone="neutral">Trading disabled</Badge>
            <span className="text-xs text-muted">Last synced {formatDateTime(lastSyncedAt)}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <MetricCard label="Broker Accounts" value={formatNumber(accounts.length)} sublabel="Linked" icon={<Icon name="broker" size={18} />} />
            <MetricCard label="Listed Equity" value={formatCompactINR(totalEquity)} tone="positive" sublabel="Across broker accounts" />
            <MetricCard label="Available Cash" value={formatCompactINR(totalCash)} sublabel="Broker cash" icon={<Icon name="bank" size={18} />} />
            <MetricCard label="Connected" value={formatNumber(connected)} tone="positive" sublabel="Live feeds" icon={<Icon name="check" size={18} />} />
            <MetricCard label="Pending Auth" value={formatNumber(pendingAuth)} tone="warning" sublabel="Re-auth needed" icon={<Icon name="shield" size={18} />} />
          </div>
          <Card title="Broker Accounts" description="Demat & broker accounts consolidated by owner." padded={false}>
            <DataTable columns={accountColumns} rows={accounts} />
          </Card>
        </div>
      )}

      {/* Holdings */}
      {tab === "holdings" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Holdings" value={formatNumber(holdings.length)} sublabel="Instruments" icon={<Icon name="funds" size={18} />} />
            <MetricCard label="Total Value" value={formatCompactINR(holdingsValue)} tone="positive" sublabel="At LTP" />
            <MetricCard label="Sectors" value={formatNumber(new Set(holdings.map((h) => h.sector)).size)} sublabel="Distinct" />
          </div>
          <Card title="Consolidated Holdings" description="Top holdings across broker accounts (mock)." padded={false}>
            <DataTable columns={holdingColumns} rows={holdings} emptyMessage="No holdings synced." />
          </Card>
        </div>
      )}

      {/* Funds */}
      {tab === "funds" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Available Cash" value={formatCompactINR(totalCash)} tone="positive" sublabel="All brokers" icon={<Icon name="bank" size={18} />} />
            <MetricCard label="Angel RMS Cash" value={formatCompactINR(funds.availableCash)} sublabel="Read-only snapshot" />
            <MetricCard label="Collateral" value={formatCompactINR(funds.collateral)} sublabel="Pledged" />
            <MetricCard label="Utilised" value={formatCompactINR(funds.utilised)} tone="warning" sublabel="Margin used" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Funds by Account" description="Available cash by broker account." padded={false}>
              <DataTable columns={fundsAccountColumns} rows={accounts} />
            </Card>
            <Card title="Angel One RMS Snapshot" description="Risk management / funds (mock).">
              <div className="px-1">
                <DefRow label="Available cash">{formatINR(funds.availableCash)}</DefRow>
                <DefRow label="Net">{formatINR(funds.net)}</DefRow>
                <DefRow label="Utilised">{formatINR(funds.utilised)}</DefRow>
                <DefRow label="Collateral">{formatINR(funds.collateral)}</DefRow>
                <DefRow label="Pay-in">{formatINR(funds.payin)}</DefRow>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Sync logs */}
      {tab === "sync" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Last Synced" value={formatDateTime(lastSyncedAt)} sublabel="Angel One" icon={<Icon name="sync" size={18} />} />
            <MetricCard label="Operations" value={formatNumber(syncLogs.length)} sublabel="This run" />
            <MetricCard label="Succeeded" value={formatNumber(successSyncs)} tone="positive" icon={<Icon name="check" size={18} />} />
            <MetricCard label="Failed" value={formatNumber(failedSyncs)} tone={failedSyncs > 0 ? "negative" : "default"} icon={<Icon name="alert" size={18} />} />
          </div>

          {failedSyncs > 0 && (
            <div className="flex items-start gap-3 rounded-xl2 border border-red-100 bg-red-50/60 px-4 py-3">
              <span className="mt-0.5 shrink-0 text-red-600"><Icon name="alert" size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-ink">{failedSyncs} sync operation failed</p>
                <p className="mt-1 text-sm text-muted">
                  {syncLogs.find((l) => l.status === "error")?.error}
                </p>
              </div>
            </div>
          )}

          <Card title="Sync Log" description="Per-operation sync status for the last run." padded={false}>
            <DataTable columns={syncColumns} rows={syncLogs} emptyMessage="No sync activity yet." />
          </Card>

          <Card title="Sample Connector Responses" description="Illustrative Angel SmartAPI response shapes (mock).">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="success" dot>Success</Badge>
                  <span className="text-xs text-muted">GET /holdings</span>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-line bg-slate-50 p-3 text-xs text-ink">
{JSON.stringify(SAMPLE_SUCCESS, null, 2)}
                </pre>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="danger" dot>Failed</Badge>
                  <span className="text-xs text-muted">GET /positions</span>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-line bg-slate-50 p-3 text-xs text-ink">
{JSON.stringify(SAMPLE_FAILURE, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Connector health */}
      {tab === "health" && (
        <div className="space-y-6">
          {health.state === "live_unconfigured" && (
            <div className="flex items-start gap-3 rounded-xl2 border border-amber-200 bg-amber-50/70 px-4 py-3">
              <span className="mt-0.5 shrink-0 text-amber-600"><Icon name="alert" size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-ink">Live connector not configured</p>
                <p className="mt-1 text-sm text-muted">{health.message}</p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Angel One Connector" description="Read-only connector health." action={<Badge tone={health.tone} dot>{health.label}</Badge>}>
              <div className="px-1">
                <DefRow label="Data source"><span className="uppercase">{health.mode}</span></DefRow>
                <DefRow label="Configured"><Badge tone={health.configured ? "success" : "danger"}>{health.configured ? "Yes" : "No"}</Badge></DefRow>
                <DefRow label="Read-only"><Badge tone="success">Yes</Badge></DefRow>
                <DefRow label="Trading"><Badge tone="neutral">Disabled</Badge></DefRow>
                <DefRow label="Base URL">{health.baseUrlConfigured ? "Configured" : "Not set"}</DefRow>
                <DefRow label="Last checked">{formatDateTime(health.lastCheckedAt)}</DefRow>
              </div>
              <p className="mt-3 text-sm text-muted">{health.message}</p>
            </Card>

            <Card title="Broker Profile" description="Angel One account profile (mock).">
              <div className="px-1">
                <DefRow label="Client code"><span className="tabular-nums">{profile.clientCode}</span></DefRow>
                <DefRow label="Name">{profile.name}</DefRow>
                <DefRow label="Email">{profile.email}</DefRow>
                <DefRow label="Broker">{profile.broker}</DefRow>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Exchanges</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.exchanges.map((e) => <Badge key={e} tone="info">{e}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Products</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.products.map((p) => <Badge key={p} tone="neutral">{p}</Badge>)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {holdings.length === 0 && (
            <EmptyState title="No data" description="Nothing to display." />
          )}
        </div>
      )}
    </div>
  );
}
