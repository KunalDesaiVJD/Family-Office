import type { Metadata } from "next";
import {
  PageHeader,
  MetricCard,
  Card,
  Badge,
  Button,
  EmptyState,
  DataTable,
  type DataTableColumn,
  type BadgeTone,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import type { BankAccount, BankAccountType } from "@/types/portfolio";
import { TENANT_ID } from "@/data/mockDashboard";
import {
  formatCompactINR,
  formatINR,
  formatDateTime,
} from "@/lib/format";

export const metadata: Metadata = { title: "Bank Balances" };

/* ---------- Page-local mock data (SaaS-ready: tenant-scoped) ---------- */

const bankAccounts: BankAccount[] = [
  {
    id: "bank_01",
    tenantId: TENANT_ID,
    entityId: "ent_pvt",
    holderName: "Crown Global Ventures Pvt Ltd",
    bank: "HDFC Bank",
    accountType: "current",
    maskedNumber: "XXXX4821",
    balance: 41_800_000,
    connectionStatus: "connected",
    lastSyncedAt: "2026-07-13T08:42:00+05:30",
  },
  {
    id: "bank_02",
    tenantId: TENANT_ID,
    entityId: "ent_huf",
    holderName: "Rathore Family HUF",
    bank: "ICICI Bank",
    accountType: "savings",
    maskedNumber: "XXXX7364",
    balance: 18_600_000,
    connectionStatus: "connected",
    lastSyncedAt: "2026-07-13T08:15:00+05:30",
  },
  {
    id: "bank_03",
    tenantId: TENANT_ID,
    entityId: "ent_trust",
    holderName: "CrownGlobe Legacy Trust",
    bank: "State Bank of India",
    accountType: "fd",
    maskedNumber: "XXXX9052",
    balance: 38_400_000,
    connectionStatus: "syncing",
    lastSyncedAt: "2026-07-13T07:58:00+05:30",
  },
  {
    id: "bank_04",
    tenantId: TENANT_ID,
    entityId: "ent_llp",
    holderName: "Crown Advisory LLP",
    bank: "Kotak Mahindra",
    accountType: "current",
    maskedNumber: "XXXX2178",
    balance: 15_200_000,
    connectionStatus: "auth_required",
    lastSyncedAt: "2026-07-11T19:04:00+05:30",
  },
  {
    id: "bank_05",
    tenantId: TENANT_ID,
    entityId: "ent_pvt",
    holderName: "Crown Global Ventures Pvt Ltd",
    bank: "Axis Bank",
    accountType: "nre",
    maskedNumber: "XXXX6640",
    balance: 12_000_000,
    connectionStatus: "connected",
    lastSyncedAt: "2026-07-13T06:30:00+05:30",
  },
];

/* ---------- Aggregates (inline) ---------- */

const linkedAccounts = bankAccounts.length;
const totalBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
const connectedCount = bankAccounts.filter(
  (a) => a.connectionStatus === "connected",
).length;
const depositsFd = bankAccounts
  .filter((a) => a.accountType === "fd")
  .reduce((sum, a) => sum + a.balance, 0);

/* ---------- Badge mappings ---------- */

const accountTypeLabel: Record<BankAccountType, string> = {
  savings: "SAVINGS",
  current: "CURRENT",
  fd: "FD",
  nre: "NRE",
  nro: "NRO",
};

const connectionTone: Record<string, BadgeTone> = {
  connected: "success",
  syncing: "info",
  auth_required: "warning",
  error: "danger",
  disconnected: "neutral",
};

const connectionLabel: Record<string, string> = {
  connected: "Connected",
  syncing: "Syncing",
  auth_required: "Auth required",
  error: "Error",
  disconnected: "Disconnected",
};

/* ---------- Table config ---------- */

const columns: DataTableColumn<BankAccount>[] = [
  {
    key: "holderName",
    header: "Holder",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.holderName}</span>
    ),
  },
  {
    key: "bank",
    header: "Bank",
    render: (_v, row) => <span className="text-ink">{row.bank}</span>,
  },
  {
    key: "accountType",
    header: "Type",
    render: (_v, row) => (
      <Badge tone="neutral">{accountTypeLabel[row.accountType]}</Badge>
    ),
  },
  {
    key: "maskedNumber",
    header: "Account",
    render: (_v, row) => (
      <span className="text-muted tabular-nums">{row.maskedNumber}</span>
    ),
  },
  {
    key: "balance",
    header: "Balance",
    align: "right",
    render: (_v, row) => (
      <span className="font-medium text-ink tabular-nums">
        {formatCompactINR(row.balance)}
      </span>
    ),
  },
  {
    key: "connectionStatus",
    header: "Connection",
    render: (_v, row) => (
      <Badge tone={connectionTone[row.connectionStatus]} dot>
        {connectionLabel[row.connectionStatus]}
      </Badge>
    ),
  },
  {
    key: "lastSyncedAt",
    header: "Last synced",
    align: "right",
    render: (_v, row) => (
      <span className="text-muted tabular-nums">
        {formatDateTime(row.lastSyncedAt)}
      </span>
    ),
  },
];

/* ---------- Page ---------- */

export default function BankBalancesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Wealth"
        title="Bank Balances"
        description="Aggregated bank balances by entity across savings, current and deposit accounts, reconciled to the consolidated wealth view. Figures shown are illustrative mock data."
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Linked Accounts"
          value={String(linkedAccounts)}
          sublabel="Across 4 entities"
          icon={<Icon name="bank" size={18} />}
        />
        <MetricCard
          label="Total Balance"
          value={formatCompactINR(totalBalance)}
          sublabel={formatINR(totalBalance)}
          icon={<Icon name="sparkle" size={18} />}
        />
        <MetricCard
          label="Connected"
          value={String(connectedCount)}
          tone="positive"
          sublabel="Live connector feeds"
          icon={<Icon name="check" size={18} />}
        />
        <MetricCard
          label="Deposits / FD"
          value={formatCompactINR(depositsFd)}
          sublabel="Locked term deposits"
          icon={<Icon name="shield" size={18} />}
        />
      </div>

      <Card
        title="Bank Accounts"
        description="Entity-wise balances across the family's linked banking relationships."
        padded={false}
      >
        <DataTable
          columns={columns}
          rows={bankAccounts}
          emptyMessage="No bank accounts linked yet."
        />
      </Card>

      <Card padded={false} className="border-dashed">
        <EmptyState
          icon={<Icon name="bank" size={24} />}
          title="Account aggregation runs through a secure connector"
          description="Balances are refreshed automatically via an encrypted, read-only account aggregation connector — credentials are never stored on the platform. Multi-bank onboarding and scheduled intraday refresh are rolling out in beta."
          action={
            <div className="flex items-center gap-3">
              <Badge tone="info" dot>
                Beta
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name="plus" size={16} />}
              >
                Link a bank account
              </Button>
            </div>
          }
        />
      </Card>
    </div>
  );
}
