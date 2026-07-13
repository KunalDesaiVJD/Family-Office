import type { Metadata } from "next";

import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  MetricCard,
  PageHeader,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { TENANT_ID } from "@/data/mockDashboard";
import { formatCompactINR, formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Tax Centre" };

interface TaxPosition {
  id: string;
  tenantId: string;
  entity: string;
  pan: string;
  stcg: number;
  ltcg: number;
  estLiability: number;
  advancePaid: number;
  filingStatus: "not_started" | "in_progress" | "filed";
  dueDate: string;
}

const taxPositions: TaxPosition[] = [
  {
    id: "tax_vijay",
    tenantId: TENANT_ID,
    entity: "Vijay Desai",
    pan: "ABCPV5678J",
    stcg: 18_400_000,
    ltcg: 62_500_000,
    estLiability: 21_800_000,
    advancePaid: 16_500_000,
    filingStatus: "in_progress",
    dueDate: "2026-07-31",
  },
  {
    id: "tax_kunal",
    tenantId: TENANT_ID,
    entity: "Kunal Desai",
    pan: "ABCPK1234D",
    stcg: 9_600_000,
    ltcg: 34_200_000,
    estLiability: 11_300_000,
    advancePaid: 11_300_000,
    filingStatus: "filed",
    dueDate: "2026-07-31",
  },
  {
    id: "tax_ventures",
    tenantId: TENANT_ID,
    entity: "CrownGlobe Ventures Pvt Ltd",
    pan: "AABCC1234D",
    stcg: 42_100_000,
    ltcg: 0,
    estLiability: 47_600_000,
    advancePaid: 30_000_000,
    filingStatus: "in_progress",
    dueDate: "2026-10-31",
  },
  {
    id: "tax_huf",
    tenantId: TENANT_ID,
    entity: "Desai Family HUF",
    pan: "AAAHD7890N",
    stcg: 6_200_000,
    ltcg: 15_800_000,
    estLiability: 6_900_000,
    advancePaid: 0,
    filingStatus: "not_started",
    dueDate: "2026-07-31",
  },
  {
    id: "tax_trust",
    tenantId: TENANT_ID,
    entity: "Desai Family Private Trust",
    pan: "AAATD3456N",
    stcg: 3_500_000,
    ltcg: 28_400_000,
    estLiability: 9_400_000,
    advancePaid: 4_500_000,
    filingStatus: "not_started",
    dueDate: "2026-07-31",
  },
];

const filingStatusTone: Record<TaxPosition["filingStatus"], BadgeTone> = {
  not_started: "neutral",
  in_progress: "warning",
  filed: "success",
};

const filingStatusLabel: Record<TaxPosition["filingStatus"], string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  filed: "Filed",
};

const positionColumns: DataTableColumn<TaxPosition>[] = [
  {
    key: "entity",
    header: "Entity",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.entity}</span>
    ),
  },
  {
    key: "pan",
    header: "PAN",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">{row.pan}</span>
    ),
  },
  {
    key: "stcg",
    header: "STCG",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.stcg)}
      </span>
    ),
  },
  {
    key: "ltcg",
    header: "LTCG",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.ltcg)}
      </span>
    ),
  },
  {
    key: "estLiability",
    header: "Est. Liability",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.estLiability)}
      </span>
    ),
  },
  {
    key: "advancePaid",
    header: "Advance Paid",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.advancePaid)}
      </span>
    ),
  },
  {
    key: "filingStatus",
    header: "Filing Status",
    render: (_v, row) => (
      <Badge tone={filingStatusTone[row.filingStatus]} dot>
        {filingStatusLabel[row.filingStatus]}
      </Badge>
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (_v, row) => (
      <span className="text-muted">{formatDate(row.dueDate)}</span>
    ),
  },
];

export default function TaxCentrePage() {
  const totalLiability = taxPositions.reduce(
    (sum, position) => sum + position.estLiability,
    0
  );
  const totalAdvancePaid = taxPositions.reduce(
    (sum, position) => sum + position.advancePaid,
    0
  );
  const totalLtcg = taxPositions.reduce(
    (sum, position) => sum + position.ltcg,
    0
  );
  const totalStcg = taxPositions.reduce(
    (sum, position) => sum + position.stcg,
    0
  );
  const filingsPending = taxPositions.filter(
    (position) => position.filingStatus !== "filed"
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Operations"
        title="Tax Centre"
        description="Track capital gains, advance tax and filing status across every PAN and entity for AY 2026-27."
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
          label="Est. Tax Liability"
          value={formatCompactINR(totalLiability)}
          sublabel="AY 2026-27"
          icon={<Icon name="tax" size={18} />}
        />
        <MetricCard
          label="Advance Tax Paid"
          value={formatCompactINR(totalAdvancePaid)}
          sublabel="Instalments deposited"
          tone="positive"
          icon={<Icon name="check" size={18} />}
        />
        <MetricCard
          label="LTCG Realised"
          value={formatCompactINR(totalLtcg)}
          sublabel="Long-term gains"
          icon={<Icon name="funds" size={18} />}
        />
        <MetricCard
          label="STCG Realised"
          value={formatCompactINR(totalStcg)}
          sublabel="Short-term gains"
          icon={<Icon name="broker" size={18} />}
        />
        <MetricCard
          label="Filings Pending"
          value={formatNumber(filingsPending)}
          sublabel="Returns not yet filed"
          tone="warning"
          icon={<Icon name="alert" size={18} />}
        />
      </div>

      <Card
        title="Tax Positions · AY 2026-27"
        description="Capital gains, estimated liability and filing status for each PAN and entity."
        padded={false}
      >
        <DataTable columns={positionColumns} rows={taxPositions} />
      </Card>

      <Card
        title="Automated Capital-Gains Engine"
        description="Straight-through computation from broker, fund and bank feeds is on the roadmap."
      >
        <EmptyState
          title="AY 2026-27 computation pending"
          description="The automated capital-gains engine is planned. It will reconcile contract notes, corporate actions and grandfathering to produce audit-ready STCG and LTCG schedules per PAN before the return is filed."
          icon={<Icon name="tax" size={22} />}
          action={
            <Badge tone="neutral" dot>
              Planned
            </Badge>
          }
        />
      </Card>
    </div>
  );
}
