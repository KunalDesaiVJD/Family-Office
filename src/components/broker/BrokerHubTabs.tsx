"use client";

import { useState, type ReactNode } from "react";
import {
  Card,
  Badge,
  MetricCard,
  DataTable,
  type DataTableColumn,
  type BadgeTone,
} from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import {
  formatCompactINR,
  formatINR,
  formatNumber,
  formatPercent,
  formatDateTime,
  maskClientCode,
} from "@/lib/format";
import { AccountsTab, authBadge, syncBadge } from "./AccountsTab";
import type {
  AngelAccount,
  AngelHolding,
  AngelOrder,
  AngelTrade,
  AngelPosition,
  AngelLedgerEntry,
  AngelSyncRun,
  AngelFunds,
  SyncLogEntry,
  ConnectorHealth,
} from "@/types/angel";

interface Props {
  health: ConnectorHealth;
  accounts: AngelAccount[];
  holdings: AngelHolding[];
  orders: AngelOrder[];
  trades: AngelTrade[];
  positions: AngelPosition[];
  ledger: AngelLedgerEntry[];
  syncRun: AngelSyncRun;
  accountSyncLogs: SyncLogEntry[];
  funds: AngelFunds;
  lastSyncedAt: string;
}

const TABS: { key: string; label: string; icon: IconName }[] = [
  { key: "overview", label: "Overview", icon: "broker" },
  { key: "accounts", label: "Accounts", icon: "family" },
  { key: "holdings", label: "Holdings", icon: "funds" },
  { key: "funds", label: "Funds", icon: "bank" },
  { key: "orders", label: "Orders", icon: "documents" },
  { key: "trades", label: "Trades", icon: "check" },
  { key: "positions", label: "Positions", icon: "sparkle" },
  { key: "ledger", label: "Ledger", icon: "tally" },
  { key: "sync", label: "Sync Logs", icon: "sync" },
];

const sideBadge: Record<string, BadgeTone> = { BUY: "success", SELL: "danger" };
const orderStatusBadge: Record<string, BadgeTone> = {
  COMPLETE: "success",
  OPEN: "info",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELLED: "neutral",
};
const syncStatusBadge: Record<string, { tone: BadgeTone; label: string }> = {
  success: { tone: "success", label: "Success" },
  error: { tone: "danger", label: "Error" },
  running: { tone: "info", label: "Running" },
};

const strong = (v: string) => <span className="font-medium text-ink">{v}</span>;
const muted = (v: string) => <span className="text-muted">{v}</span>;
const numCell = (v: number) => <span className="tabular-nums">{formatNumber(v)}</span>;
const inr = (v: number) => <span className="tabular-nums text-ink">{formatINR(v)}</span>;
const cinr = (v: number) => <span className="tabular-nums text-ink">{formatCompactINR(v)}</span>;

const holdingCols: DataTableColumn<AngelHolding>[] = [
  { key: "account", header: "Account", render: (_v, r) => strong(r.account) },
  { key: "symbol", header: "Symbol", render: (_v, r) => strong(r.symbol) },
  { key: "quantity", header: "Qty", align: "right", render: (_v, r) => numCell(r.quantity) },
  { key: "ltp", header: "LTP", align: "right", render: (_v, r) => inr(r.ltp) },
  { key: "value", header: "Value", align: "right", render: (_v, r) => cinr(r.value) },
  { key: "dayChangePct", header: "Day", align: "right", render: (_v, r) => <span className={`tabular-nums font-medium ${r.dayChangePct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatPercent(r.dayChangePct)}</span> },
  { key: "sector", header: "Sector", render: (_v, r) => muted(r.sector) },
];

const orderCols: DataTableColumn<AngelOrder>[] = [
  { key: "account", header: "Account", render: (_v, r) => strong(r.account) },
  { key: "symbol", header: "Symbol", render: (_v, r) => strong(r.symbol) },
  { key: "side", header: "Side", render: (_v, r) => <Badge tone={sideBadge[r.side] ?? "neutral"}>{r.side}</Badge> },
  { key: "orderType", header: "Type", render: (_v, r) => muted(r.orderType) },
  { key: "quantity", header: "Qty", align: "right", render: (_v, r) => numCell(r.quantity) },
  { key: "price", header: "Price", align: "right", render: (_v, r) => inr(r.price) },
  { key: "status", header: "Status", render: (_v, r) => <Badge tone={orderStatusBadge[r.status] ?? "neutral"} dot>{r.status}</Badge> },
  { key: "time", header: "Time", render: (_v, r) => muted(formatDateTime(r.time)) },
];

const tradeCols: DataTableColumn<AngelTrade>[] = [
  { key: "account", header: "Account", render: (_v, r) => strong(r.account) },
  { key: "symbol", header: "Symbol", render: (_v, r) => strong(r.symbol) },
  { key: "side", header: "Side", render: (_v, r) => <Badge tone={sideBadge[r.side] ?? "neutral"}>{r.side}</Badge> },
  { key: "quantity", header: "Qty", align: "right", render: (_v, r) => numCell(r.quantity) },
  { key: "price", header: "Price", align: "right", render: (_v, r) => inr(r.price) },
  { key: "value", header: "Value", align: "right", render: (_v, r) => inr(r.value) },
  { key: "time", header: "Time", render: (_v, r) => muted(formatDateTime(r.time)) },
];

const positionCols: DataTableColumn<AngelPosition>[] = [
  { key: "account", header: "Account", render: (_v, r) => strong(r.account) },
  { key: "symbol", header: "Symbol", render: (_v, r) => strong(r.symbol) },
  { key: "product", header: "Product", render: (_v, r) => <Badge tone="neutral">{r.product}</Badge> },
  { key: "netQty", header: "Net Qty", align: "right", render: (_v, r) => numCell(r.netQty) },
  { key: "avgPrice", header: "Avg", align: "right", render: (_v, r) => inr(r.avgPrice) },
  { key: "ltp", header: "LTP", align: "right", render: (_v, r) => inr(r.ltp) },
  { key: "pnl", header: "P&L", align: "right", render: (_v, r) => <span className={`tabular-nums font-medium ${r.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCompactINR(r.pnl)}</span> },
];

const ledgerCols: DataTableColumn<AngelLedgerEntry>[] = [
  { key: "account", header: "Account", render: (_v, r) => strong(r.account) },
  { key: "date", header: "Date", render: (_v, r) => muted(r.date) },
  { key: "particulars", header: "Particulars", render: (_v, r) => <span className="text-ink">{r.particulars}</span> },
  { key: "voucher", header: "Voucher", render: (_v, r) => <Badge tone="neutral">{r.voucher}</Badge> },
  { key: "debit", header: "Debit", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{r.debit ? formatINR(r.debit) : "—"}</span> },
  { key: "credit", header: "Credit", align: "right", render: (_v, r) => <span className="tabular-nums text-ink">{r.credit ? formatINR(r.credit) : "—"}</span> },
  { key: "balance", header: "Balance", align: "right", render: (_v, r) => cinr(r.balance) },
];

const syncLogCols: DataTableColumn<SyncLogEntry>[] = [
  { key: "account", header: "Account", render: (_v, r) => strong(r.account ?? "—") },
  { key: "operation", header: "Operation", render: (_v, r) => muted(r.operation) },
  { key: "status", header: "Status", render: (_v, r) => <Badge tone={syncStatusBadge[r.status].tone} dot>{syncStatusBadge[r.status].label}</Badge> },
  { key: "recordCount", header: "Records", align: "right", render: (_v, r) => numCell(r.recordCount ?? 0) },
  { key: "durationMs", header: "Duration", align: "right", render: (_v, r) => muted(r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : "—") },
  { key: "error", header: "Detail", render: (_v, r) => (r.error ? <span className="text-red-600">{r.error}</span> : muted("—")) },
];

const overviewAccountCols: DataTableColumn<AngelAccount>[] = [
  { key: "memberName", header: "Member", render: (_v, r) => strong(r.memberName) },
  { key: "relationship", header: "Relationship", render: (_v, r) => muted(r.relationship) },
  { key: "clientCode", header: "Client Code", render: (_v, r) => <span className="tabular-nums text-muted">{maskClientCode(r.clientCode)}</span> },
  { key: "authStatus", header: "Auth", render: (_v, r) => <Badge tone={authBadge[r.authStatus].tone} dot>{authBadge[r.authStatus].label}</Badge> },
  { key: "syncStatus", header: "Sync", render: (_v, r) => <Badge tone={syncBadge[r.syncStatus].tone} dot>{syncBadge[r.syncStatus].label}</Badge> },
  { key: "holdingsValue", header: "Value", align: "right", render: (_v, r) => cinr(r.summary.holdingsValue) },
];

const fundsAccountCols: DataTableColumn<AngelAccount>[] = [
  { key: "memberName", header: "Account", render: (_v, r) => strong(r.memberName) },
  { key: "availableCash", header: "Available Cash", align: "right", render: (_v, r) => inr(r.summary.availableCash) },
  { key: "net", header: "Net", align: "right", render: (_v, r) => inr(r.summary.net) },
  { key: "utilised", header: "Utilised", align: "right", render: (_v, r) => inr(r.summary.utilised) },
];

function DefRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

export function BrokerHubTabs(props: Props) {
  const { health, accounts, holdings, orders, trades, positions, ledger, syncRun, accountSyncLogs, funds, lastSyncedAt } = props;
  const [tab, setTab] = useState("overview");
  const [accountFilter, setAccountFilter] = useState("all");

  const filt = <T extends { account: string }>(rows: T[]): T[] =>
    accountFilter === "all" ? rows : rows.filter((r) => r.account === accountFilter);

  const authed = accounts.filter((a) => a.authStatus === "authenticated").length;
  const failed = accounts.filter((a) => a.syncStatus === "error").length;
  const totalEquity = accounts.reduce((s, a) => s + a.summary.holdingsValue, 0);
  const totalCash = accounts.reduce((s, a) => s + a.summary.availableCash, 0);
  const totalNet = accounts.reduce((s, a) => s + a.summary.net, 0);
  const totalUtilised = accounts.reduce((s, a) => s + a.summary.utilised, 0);

  const filterBar = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">Account</span>
      <select
        value={accountFilter}
        onChange={(e) => setAccountFilter(e.target.value)}
        className="h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand-blue/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20"
        aria-label="Filter by account"
      >
        <option value="all">All accounts</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.memberName}>
            {a.memberName}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "border-brand-blue text-brand-blue" : "border-transparent text-muted hover:text-ink"
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
            <MetricCard label="Angel Accounts" value={formatNumber(accounts.length)} sublabel="Configured" icon={<Icon name="family" size={18} />} />
            <MetricCard label="Authenticated" value={formatNumber(authed)} tone="positive" sublabel="Live sessions" icon={<Icon name="check" size={18} />} />
            <MetricCard label="Total Equity" value={formatCompactINR(totalEquity)} tone="positive" sublabel="Across accounts" />
            <MetricCard label="Available Cash" value={formatCompactINR(totalCash)} sublabel="Broker cash" icon={<Icon name="bank" size={18} />} />
            <MetricCard label="Failed Syncs" value={formatNumber(failed)} tone={failed > 0 ? "negative" : "default"} sublabel="Need attention" icon={<Icon name="alert" size={18} />} />
          </div>
          <Card title="Accounts at a glance" description="Family member → Angel client-code mapping with auth and sync status." padded={false}>
            <DataTable columns={overviewAccountCols} rows={accounts} rowKey="id" />
          </Card>
          <Card title="Connector Health" description="Read-only Angel One connector.">
            <div className="px-1">
              <DefRow label="Data source"><span className="uppercase">{health.mode}</span></DefRow>
              <DefRow label="Configured"><Badge tone={health.configured ? "success" : "danger"}>{health.configured ? "Yes" : "No"}</Badge></DefRow>
              <DefRow label="Read-only"><Badge tone="success">Yes</Badge></DefRow>
              <DefRow label="Trading"><Badge tone="neutral">Disabled</Badge></DefRow>
              <DefRow label="Last checked">{formatDateTime(health.lastCheckedAt)}</DefRow>
            </div>
            <p className="mt-3 text-sm text-muted">{health.message}</p>
          </Card>
        </div>
      )}

      {/* Accounts */}
      {tab === "accounts" && <AccountsTab accounts={accounts} syncRun={syncRun} />}

      {/* Holdings */}
      {tab === "holdings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{filt(holdings).length} holdings</p>
            {filterBar}
          </div>
          <Card padded={false}>
            <DataTable columns={holdingCols} rows={filt(holdings)} emptyMessage="No holdings for this account." />
          </Card>
        </div>
      )}

      {/* Funds */}
      {tab === "funds" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Available Cash" value={formatCompactINR(totalCash)} tone="positive" sublabel="All accounts" icon={<Icon name="bank" size={18} />} />
            <MetricCard label="Net" value={formatCompactINR(totalNet)} sublabel="Aggregate" />
            <MetricCard label="Utilised" value={formatCompactINR(totalUtilised)} tone="warning" sublabel="Margin used" />
            <MetricCard label="Collateral" value={formatCompactINR(funds.collateral)} sublabel="Pledged" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Funds by Account" description="Available cash and margin by Angel account." padded={false}>
              <DataTable columns={fundsAccountCols} rows={accounts} rowKey="id" />
            </Card>
            <Card title="Angel One RMS Snapshot" description="Aggregate risk / funds (mock).">
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

      {/* Orders */}
      {tab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="neutral" dot>Read-only order book · trading disabled</Badge>
            {filterBar}
          </div>
          <Card padded={false}>
            <DataTable columns={orderCols} rows={filt(orders)} emptyMessage="No orders for this account." />
          </Card>
        </div>
      )}

      {/* Trades */}
      {tab === "trades" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{filt(trades).length} trades</p>
            {filterBar}
          </div>
          <Card padded={false}>
            <DataTable columns={tradeCols} rows={filt(trades)} emptyMessage="No trades for this account." />
          </Card>
        </div>
      )}

      {/* Positions */}
      {tab === "positions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{filt(positions).length} positions</p>
            {filterBar}
          </div>
          <Card padded={false}>
            <DataTable columns={positionCols} rows={filt(positions)} emptyMessage="No positions for this account." />
          </Card>
        </div>
      )}

      {/* Ledger */}
      {tab === "ledger" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{filt(ledger).length} ledger entries</p>
            {filterBar}
          </div>
          <Card padded={false}>
            <DataTable columns={ledgerCols} rows={filt(ledger)} emptyMessage="No ledger entries for this account." />
          </Card>
        </div>
      )}

      {/* Sync Logs */}
      {tab === "sync" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Last Sync" value={formatDateTime(syncRun.finishedAt)} sublabel="Angel One" icon={<Icon name="sync" size={18} />} />
            <MetricCard label="Accounts" value={formatNumber(syncRun.total)} sublabel="In last run" />
            <MetricCard label="Succeeded" value={formatNumber(syncRun.succeeded)} tone="positive" icon={<Icon name="check" size={18} />} />
            <MetricCard label="Failed" value={formatNumber(syncRun.failed)} tone={syncRun.failed > 0 ? "negative" : "default"} icon={<Icon name="alert" size={18} />} />
          </div>

          {syncRun.status === "partial" && (
            <div className="flex items-start gap-3 rounded-xl2 border border-amber-200 bg-amber-50/70 px-4 py-3">
              <span className="mt-0.5 shrink-0 text-amber-600"><Icon name="alert" size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-ink">Partial sync — {syncRun.succeeded} of {syncRun.total} accounts succeeded</p>
                <p className="mt-1 text-sm text-muted">
                  {accountSyncLogs.find((l) => l.status === "error")?.error}
                </p>
              </div>
            </div>
          )}

          <Card title="Per-account Sync Log" description="Status of each account in the last sync run." padded={false}>
            <DataTable columns={syncLogCols} rows={accountSyncLogs} emptyMessage="No sync activity yet." />
          </Card>
        </div>
      )}
    </div>
  );
}
