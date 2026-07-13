import type { Metadata } from "next";

import {
  Badge,
  Button,
  Card,
  DataTable,
  MetricCard,
  PageHeader,
} from "@/components/ui";
import type { BadgeTone, DataTableColumn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { brokerAccounts, holdings } from "@/data/mockBrokerAccounts";
import type { BrokerAccount } from "@/types/broker";
import type { Holding } from "@/types/portfolio";
import {
  formatCompactINR,
  formatDateTime,
  formatINR,
  formatNumber,
  formatPercent,
} from "@/lib/format";

export const metadata: Metadata = { title: "Broker Hub" };

const CONNECTION_LABELS: Record<BrokerAccount["connectionStatus"], string> = {
  connected: "Connected",
  syncing: "Syncing",
  auth_required: "Auth required",
  error: "Error",
  disconnected: "Disconnected",
};

const CONNECTION_TONES: Record<BrokerAccount["connectionStatus"], BadgeTone> = {
  connected: "success",
  syncing: "info",
  auth_required: "warning",
  error: "danger",
  disconnected: "neutral",
};

export default function BrokerHubPage() {
  const accountCount = brokerAccounts.length;
  const totalEquity = brokerAccounts.reduce(
    (sum, account) => sum + account.equityValue,
    0,
  );
  const totalCash = brokerAccounts.reduce(
    (sum, account) => sum + account.cashBalance,
    0,
  );
  const connectedCount = brokerAccounts.filter(
    (account) => account.connectionStatus === "connected",
  ).length;
  const pendingAuthCount = brokerAccounts.filter(
    (account) => account.pendingAuth === true,
  ).length;

  const accountColumns: DataTableColumn<BrokerAccount>[] = [
    {
      key: "ownerName",
      header: "Owner",
      render: (_v, row) => (
        <span className="font-medium text-ink">{row.ownerName}</span>
      ),
    },
    {
      key: "broker",
      header: "Broker",
      render: (_v, row) => <span className="text-ink">{row.broker}</span>,
    },
    {
      key: "clientCode",
      header: "Client Code",
      render: (_v, row) => (
        <span className="tabular-nums text-muted">{row.clientCode}</span>
      ),
    },
    {
      key: "depository",
      header: "Depository",
      render: (_v, row) => (
        <span className="text-muted">{row.demat.depository}</span>
      ),
    },
    {
      key: "equityValue",
      header: "Listed Equity",
      align: "right",
      render: (_v, row) => (
        <span className="tabular-nums text-ink">
          {formatCompactINR(row.equityValue)}
        </span>
      ),
    },
    {
      key: "cashBalance",
      header: "Cash",
      align: "right",
      render: (_v, row) => (
        <span className="tabular-nums text-ink">
          {formatCompactINR(row.cashBalance)}
        </span>
      ),
    },
    {
      key: "connectionStatus",
      header: "Connection",
      render: (_v, row) => (
        <Badge tone={CONNECTION_TONES[row.connectionStatus]} dot>
          {CONNECTION_LABELS[row.connectionStatus]}
        </Badge>
      ),
    },
    {
      key: "lastSyncedAt",
      header: "Last Synced",
      align: "right",
      render: (_v, row) => (
        <span className="tabular-nums text-muted">
          {formatDateTime(row.lastSyncedAt)}
        </span>
      ),
    },
  ];

  const holdingColumns: DataTableColumn<Holding>[] = [
    {
      key: "symbol",
      header: "Symbol",
      render: (_v, row) => (
        <span className="font-medium text-ink">{row.symbol}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (_v, row) => <span className="text-muted">{row.name}</span>,
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      render: (_v, row) => (
        <span className="tabular-nums text-ink">
          {formatNumber(row.quantity)}
        </span>
      ),
    },
    {
      key: "ltp",
      header: "LTP",
      align: "right",
      render: (_v, row) => (
        <span className="tabular-nums text-ink">{formatINR(row.ltp)}</span>
      ),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      render: (_v, row) => (
        <span className="tabular-nums text-ink">
          {formatCompactINR(row.value)}
        </span>
      ),
    },
    {
      key: "dayChangePct",
      header: "Day Change",
      align: "right",
      render: (_v, row) => (
        <Badge tone={row.dayChangePct >= 0 ? "success" : "danger"}>
          {formatPercent(row.dayChangePct)}
        </Badge>
      ),
    },
    {
      key: "sector",
      header: "Sector",
      render: (_v, row) => <span className="text-muted">{row.sector}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Wealth"
        title="Broker Hub"
        description="Consolidated demat and broker cash across the family's trading accounts."
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
          label="Broker Accounts"
          value={formatNumber(accountCount)}
          sublabel="Across family members"
          icon={<Icon name="broker" size={18} />}
        />
        <MetricCard
          label="Total Listed Equity"
          value={formatCompactINR(totalEquity)}
          sublabel="Market value of holdings"
          tone="positive"
        />
        <MetricCard
          label="Available Cash"
          value={formatCompactINR(totalCash)}
          sublabel="Settled broker balances"
        />
        <MetricCard
          label="Connected"
          value={formatNumber(connectedCount)}
          sublabel={`of ${formatNumber(accountCount)} accounts live`}
          tone="positive"
        />
        <MetricCard
          label="Pending Auth"
          value={formatNumber(pendingAuthCount)}
          sublabel="Re-authentication required"
          tone="warning"
        />
      </div>

      <Card
        title="Broker Accounts"
        description="Demat and cash positions by trading account, with live connection state."
        padded={false}
      >
        <DataTable columns={accountColumns} rows={brokerAccounts} />
      </Card>

      <Card
        title="Top Holdings"
        description="Consolidated listed equity positions across all broker accounts."
        padded={false}
      >
        <DataTable columns={holdingColumns} rows={holdings} />
      </Card>
    </div>
  );
}
