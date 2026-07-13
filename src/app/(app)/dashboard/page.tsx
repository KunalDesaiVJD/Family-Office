import type { Metadata } from "next";
import {
  PageHeader,
  MetricCard,
  ModuleCard,
  Card,
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  type BadgeTone,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import type { ReconciliationException } from "@/types/tally";
import {
  dashboardMetrics,
  netWorthTrend,
  allocation,
  moduleReadiness,
  recentExceptions,
} from "@/data/mockDashboard";
import {
  formatCompactINR,
  formatINR,
  formatSignedCompactINR,
  formatPercent,
  formatDate,
} from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const m = dashboardMetrics;

/* ---------- Net worth trend (inline SVG, no chart dependency) ---------- */

function NetWorthChart() {
  const w = 560;
  const h = 150;
  const pad = { top: 12, right: 6, bottom: 20, left: 6 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const values = netWorthTrend.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = netWorthTrend.map((p, i) => {
    const x = pad.left + (i / (netWorthTrend.length - 1)) * innerW;
    const y = pad.top + innerH - ((p.value - min) / range) * innerH;
    return { x, y, label: p.period };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.left},${pad.top + innerH} ${line} ${pad.left + innerW},${
    pad.top + innerH
  }`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-40 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Consolidated net worth trend, last 8 months"
    >
      <defs>
        <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#nwFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="4" fill="#2563eb" />
      <circle cx={last.x} cy={last.y} r="7" fill="#2563eb" fillOpacity="0.15" />
      {points.map((p) => (
        <text
          key={p.label}
          x={p.x}
          y={h - 4}
          textAnchor="middle"
          className="fill-muted"
          fontSize="10"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

/* ---------- Allocation bar ---------- */

function AllocationPanel() {
  const total = allocation.reduce((sum, s) => sum + s.value, 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {allocation.map((slice) => (
          <div
            key={slice.label}
            style={{
              width: `${(slice.value / total) * 100}%`,
              backgroundColor: slice.color,
            }}
            title={`${slice.label} · ${formatCompactINR(slice.value)}`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {allocation.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-ink">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              {slice.label}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink tabular-nums">
                {formatCompactINR(slice.value)}
              </span>
              <span className="w-10 text-right text-xs text-muted tabular-nums">
                {((slice.value / total) * 100).toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Exceptions table config ---------- */

const severityTone: Record<string, BadgeTone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

const statusTone: Record<string, BadgeTone> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
};

const exceptionColumns: DataTableColumn<ReconciliationException>[] = [
  {
    key: "source",
    header: "Source",
    render: (v) => <span className="font-medium text-ink">{String(v)}</span>,
  },
  { key: "description", header: "Exception" },
  {
    key: "severity",
    header: "Severity",
    render: (v) => (
      <Badge tone={severityTone[String(v)]} dot>
        {String(v).charAt(0).toUpperCase() + String(v).slice(1)}
      </Badge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (v) => (
      <span className="tabular-nums">
        {Number(v) > 0 ? formatINR(Number(v)) : "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (v) => (
      <Badge tone={statusTone[String(v)]}>{statusLabel[String(v)]}</Badge>
    ),
  },
  {
    key: "raisedAt",
    header: "Raised",
    align: "right",
    render: (v) => <span className="text-muted">{formatDate(String(v))}</span>,
  },
];

/* ---------- Page ---------- */

export default function DashboardPage() {
  const movementDirection = m.todaysMovement.amount >= 0 ? "up" : "down";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Command Centre"
        title="Consolidated Dashboard"
        description="A single, bank-grade view of the family's wealth across brokers, funds, banks, Tally, insurance and operations. Figures shown are illustrative mock data."
        actions={
          <>
            <Button variant="outline" size="md" leftIcon={<Icon name="download" size={16} />}>
              Export
            </Button>
            <Button variant="primary" size="md" leftIcon={<Icon name="sync" size={16} />}>
              Sync all
            </Button>
          </>
        }
      />

      {/* Hero: net worth + allocation */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Consolidated Net Worth
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
                {formatCompactINR(m.consolidatedNetWorth)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={movementDirection === "up" ? "success" : "danger"} dot>
                  {formatSignedCompactINR(m.todaysMovement.amount)} today
                </Badge>
                <span className="text-sm font-medium text-emerald-600">
                  {formatPercent(m.todaysMovement.percent)}
                </span>
                <span className="text-sm text-muted">vs. previous close</span>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs text-muted">Full amount</p>
              <p className="mt-1 text-sm font-medium text-ink tabular-nums">
                {formatINR(m.consolidatedNetWorth)}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-4">
            <NetWorthChart />
          </div>
        </Card>

        <Card title="Asset Allocation" description="By asset class">
          <AllocationPanel />
        </Card>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Total Listed Equity"
          value={formatCompactINR(m.totalListedEquity)}
          delta={{ value: "1.24%", direction: "up" }}
          sublabel="5 broker accounts"
          icon={<Icon name="broker" size={18} />}
        />
        <MetricCard
          label="Mutual Fund Value"
          value={formatCompactINR(m.mutualFundValue)}
          delta={{ value: "0.62%", direction: "up" }}
          sublabel="7 folios"
          icon={<Icon name="funds" size={18} />}
        />
        <MetricCard
          label="Bank Balance"
          value={formatCompactINR(m.bankBalance)}
          sublabel="4 accounts"
          icon={<Icon name="bank" size={18} />}
        />
        <MetricCard
          label="Broker Cash"
          value={formatCompactINR(m.brokerCash)}
          sublabel="Available margin"
          icon={<Icon name="sparkle" size={18} />}
        />
        <MetricCard
          label="Insurance Cover"
          value={formatCompactINR(m.insuranceCover)}
          sublabel="7 active policies"
          icon={<Icon name="insurance" size={18} />}
        />
      </div>

      {/* Operational alerts */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Open Reconciliation Exceptions"
          value={String(m.openExceptions)}
          tone="warning"
          sublabel="Across brokers, banks & Tally"
          delta={{ value: "2 new", direction: "down" }}
          icon={<Icon name="alert" size={18} />}
        />
        <MetricCard
          label="Pending Authentications"
          value={String(m.pendingAuthentications)}
          tone="negative"
          sublabel="Re-auth required to sync"
          icon={<Icon name="shield" size={18} />}
        />
        <MetricCard
          label="Premiums Due"
          value={`${m.premiumsDue.count} · ${formatCompactINR(m.premiumsDue.amount)}`}
          tone="warning"
          sublabel="Next 45 days"
          icon={<Icon name="insurance" size={18} />}
        />
      </div>

      {/* Module readiness */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Module Readiness</h2>
            <p className="text-sm text-muted">
              Operational status of each Family Wealth OS module.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleReadiness.map((mod) => (
            <ModuleCard
              key={mod.title}
              title={mod.title}
              description={mod.description}
              status={mod.status}
              href={mod.href}
              meta={mod.meta}
            />
          ))}
        </div>
      </div>

      {/* Recent exceptions */}
      <Card
        title="Recent Exceptions"
        description="Latest items flagged for review by the reconciliation engine."
        action={
          <Button variant="ghost" size="sm" href="/ai-desk">
            View all in AI Desk
          </Button>
        }
        padded={false}
      >
        <DataTable columns={exceptionColumns} rows={recentExceptions} />
      </Card>
    </div>
  );
}
