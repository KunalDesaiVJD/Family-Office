import type { Metadata } from "next";

import {
  PageHeader,
  MetricCard,
  Card,
  Badge,
  Button,
  DataTable,
} from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  formatCompactINR,
  formatPercent,
  formatNumber,
} from "@/lib/format";
import { mutualFundFolios } from "@/data/mockMutualFunds";
import type { MutualFundFolio } from "@/types/portfolio";

export const metadata: Metadata = { title: "Mutual Funds" };

function humanizeCategory(category: MutualFundFolio["category"]): string {
  if (category === "elss") return "ELSS";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

const columns: DataTableColumn<MutualFundFolio>[] = [
  {
    key: "ownerName",
    header: "Owner",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.ownerName}</span>
    ),
  },
  {
    key: "amc",
    header: "AMC",
    render: (_v, row) => <span className="text-muted">{row.amc}</span>,
  },
  {
    key: "distributor",
    header: "Platform",
    render: () => <Badge tone="brand">SMC</Badge>,
  },
  {
    key: "scheme",
    header: "Scheme",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.scheme}</span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (_v, row) => (
      <Badge tone="info">{humanizeCategory(row.category)}</Badge>
    ),
  },
  {
    key: "folioNo",
    header: "Folio No.",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">{row.folioNo}</span>
    ),
  },
  {
    key: "invested",
    header: "Invested",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.invested)}
      </span>
    ),
  },
  {
    key: "currentValue",
    header: "Current Value",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.currentValue)}
      </span>
    ),
  },
  {
    key: "xirr",
    header: "XIRR",
    align: "right",
    render: (_v, row) => (
      <Badge tone={row.xirr >= 0 ? "success" : "danger"}>
        {formatPercent(row.xirr)}
      </Badge>
    ),
  },
];

export default function MutualFundsPage() {
  const folios = mutualFundFolios;

  const folioCount = folios.length;
  const totalCurrent = folios.reduce((sum, f) => sum + f.currentValue, 0);
  const totalInvested = folios.reduce((sum, f) => sum + f.invested, 0);
  const unrealisedGain = totalCurrent - totalInvested;
  const overallGainPct =
    totalInvested > 0 ? (unrealisedGain / totalInvested) * 100 : 0;
  const avgXirr =
    folioCount > 0
      ? folios.reduce((sum, f) => sum + f.xirr, 0) / folioCount
      : 0;

  const categoryTotals = folios.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + f.currentValue;
    return acc;
  }, {});

  const allocation = Object.entries(categoryTotals)
    .map(([category, value]) => ({
      category: humanizeCategory(category as MutualFundFolio["category"]),
      value,
      percent: totalCurrent > 0 ? (value / totalCurrent) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Wealth"
        title="Mutual Funds"
        description="Folio-level mutual fund holdings across AMCs, transacted through SMC Global Securities — invested capital, current value and XIRR for every family member."
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
          label="Folios"
          value={formatNumber(folioCount)}
          sublabel="Folios via SMC Global"
          icon={<Icon name="funds" size={18} />}
        />
        <MetricCard
          label="Current Value"
          value={formatCompactINR(totalCurrent)}
          sublabel="Consolidated market value"
          tone="positive"
        />
        <MetricCard
          label="Total Invested"
          value={formatCompactINR(totalInvested)}
          sublabel="Cost of acquisition"
        />
        <MetricCard
          label="Unrealised Gain"
          value={formatCompactINR(unrealisedGain)}
          sublabel="Current value less invested"
          tone="positive"
          delta={{ value: formatPercent(overallGainPct), direction: "up" }}
        />
        <MetricCard
          label="Avg XIRR"
          value={formatPercent(avgXirr)}
          sublabel="Simple average across folios"
          tone="positive"
        />
      </div>

      <Card
        title="Fund Folios"
        description="Holdings by owner and AMC, with invested capital, current value and XIRR."
        padded={false}
      >
        <DataTable
          columns={columns}
          rows={folios}
          emptyMessage="No mutual fund folios on record."
        />
      </Card>

      <Card
        title="Allocation by Category"
        description="Current value distribution across fund categories."
      >
        <ul className="space-y-4">
          {allocation.map((row) => (
            <li key={row.category} className="flex items-center gap-4">
              <div className="flex w-40 items-center gap-2">
                <Badge tone="info">{row.category}</Badge>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-blue"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
              <span className="w-24 text-right tabular-nums text-ink">
                {formatCompactINR(row.value)}
              </span>
              <span className="w-16 text-right tabular-nums text-muted">
                {formatPercent(row.percent, 1)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
