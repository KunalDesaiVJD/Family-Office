import type { Metadata } from "next";

import {
  Badge,
  Button,
  Card,
  DataTable,
  MetricCard,
  PageHeader,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { TENANT_ID, recentExceptions } from "@/data/mockDashboard";
import type {
  ReconciliationException,
  TallyCompany,
} from "@/types/tally";
import {
  formatCompactINR,
  formatDateTime,
  formatINR,
  formatNumber,
} from "@/lib/format";

export const metadata: Metadata = { title: "Tally Sync" };

const tallyCompanies: TallyCompany[] = [
  {
    id: "tly_ven",
    tenantId: TENANT_ID,
    entityId: "ent_crown_ventures",
    companyName: "Crown Global Ventures Pvt Ltd",
    gstin: "27AABCC1234D1Z5",
    financialYear: "2025-26",
    lastSyncedAt: "2026-07-13T06:15:00+05:30",
    syncState: "synced",
    ledgerCount: 842,
    closingBalance: 486_200_000,
  },
  {
    id: "tly_adv",
    tenantId: TENANT_ID,
    entityId: "ent_crownglobe_advisory",
    companyName: "CrownGlobe Advisory LLP",
    gstin: "27AABFC5678E1Z2",
    financialYear: "2025-26",
    lastSyncedAt: "2026-07-12T21:40:00+05:30",
    syncState: "pending",
    ledgerCount: 517,
    closingBalance: 128_600_000,
  },
  {
    id: "tly_huf",
    tenantId: TENANT_ID,
    entityId: "ent_mehta_huf",
    companyName: "Mehta Family HUF",
    gstin: "27AACHM9012F1Z9",
    financialYear: "2025-26",
    lastSyncedAt: "2026-07-11T18:05:00+05:30",
    syncState: "error",
    ledgerCount: 264,
    closingBalance: 74_300_000,
  },
];

const syncStateTone: Record<TallyCompany["syncState"], BadgeTone> = {
  synced: "success",
  pending: "warning",
  error: "danger",
  never: "neutral",
};

const syncStateLabel: Record<TallyCompany["syncState"], string> = {
  synced: "Synced",
  pending: "Pending",
  error: "Error",
  never: "Never",
};

const severityTone: Record<ReconciliationException["severity"], BadgeTone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

const severityLabel: Record<ReconciliationException["severity"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const exceptionStatusTone: Record<ReconciliationException["status"], BadgeTone> =
  {
    open: "warning",
    in_review: "info",
    resolved: "success",
  };

const exceptionStatusLabel: Record<ReconciliationException["status"], string> = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
};

const companyColumns: DataTableColumn<TallyCompany>[] = [
  {
    key: "companyName",
    header: "Company",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.companyName}</span>
    ),
  },
  {
    key: "gstin",
    header: "GSTIN",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">{row.gstin}</span>
    ),
  },
  {
    key: "financialYear",
    header: "FY",
    render: (_v, row) => <span className="text-muted">{row.financialYear}</span>,
  },
  {
    key: "ledgerCount",
    header: "Ledgers",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatNumber(row.ledgerCount)}
      </span>
    ),
  },
  {
    key: "closingBalance",
    header: "Closing Balance",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.closingBalance)}
      </span>
    ),
  },
  {
    key: "syncState",
    header: "Sync State",
    render: (_v, row) => (
      <Badge tone={syncStateTone[row.syncState]} dot>
        {syncStateLabel[row.syncState]}
      </Badge>
    ),
  },
  {
    key: "lastSyncedAt",
    header: "Last Synced",
    render: (_v, row) => (
      <span className="text-muted">{formatDateTime(row.lastSyncedAt)}</span>
    ),
  },
];

const exceptionColumns: DataTableColumn<ReconciliationException>[] = [
  {
    key: "source",
    header: "Source",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.source}</span>
    ),
  },
  {
    key: "description",
    header: "Description",
    render: (_v, row) => <span className="text-muted">{row.description}</span>,
  },
  {
    key: "severity",
    header: "Severity",
    render: (_v, row) => (
      <Badge tone={severityTone[row.severity]} dot>
        {severityLabel[row.severity]}
      </Badge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {row.amount === 0 ? "—" : formatINR(row.amount)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <Badge tone={exceptionStatusTone[row.status]} dot>
        {exceptionStatusLabel[row.status]}
      </Badge>
    ),
  },
];

export default function TallySyncPage() {
  const companyCount = tallyCompanies.length;
  const syncedCount = tallyCompanies.filter(
    (company) => company.syncState === "synced"
  ).length;
  const notSyncedCount = tallyCompanies.filter(
    (company) => company.syncState !== "synced"
  ).length;
  const totalLedgers = tallyCompanies.reduce(
    (sum, company) => sum + company.ledgerCount,
    0
  );
  const openExceptions = recentExceptions.filter(
    (exception) => exception.status !== "resolved"
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Operations"
        title="Tally Sync"
        description="Reconcile Tally books of account against consolidated holdings across the family's operating entities."
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
          label="Companies"
          value={formatNumber(companyCount)}
          sublabel="FY 2025-26"
          icon={<Icon name="tally" size={18} />}
        />
        <MetricCard
          label="Synced"
          value={formatNumber(syncedCount)}
          sublabel="Books reconciled"
          tone="positive"
          icon={<Icon name="check" size={18} />}
        />
        <MetricCard
          label="Pending / Error"
          value={formatNumber(notSyncedCount)}
          sublabel="Require attention"
          tone="warning"
          icon={<Icon name="sync" size={18} />}
        />
        <MetricCard
          label="Total Ledgers"
          value={formatNumber(totalLedgers)}
          sublabel="Across all companies"
          icon={<Icon name="documents" size={18} />}
        />
        <MetricCard
          label="Open Exceptions"
          value={formatNumber(openExceptions)}
          sublabel="Unresolved items"
          tone="warning"
          icon={<Icon name="alert" size={18} />}
        />
      </div>

      <Card
        title="Tally Companies"
        description="Sync status and closing balances for each entity's books of account."
        padded={false}
      >
        <DataTable columns={companyColumns} rows={tallyCompanies} />
      </Card>

      <Card
        title="Reconciliation Exceptions"
        description="Discrepancies flagged between books of account and consolidated holdings."
        padded={false}
      >
        <DataTable
          columns={exceptionColumns}
          rows={recentExceptions}
          emptyMessage="No reconciliation exceptions outstanding."
        />
      </Card>
    </div>
  );
}
