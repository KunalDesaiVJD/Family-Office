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
import type { ReconciliationException } from "@/types/tally";
import { formatCompactINR, formatDate, formatINR, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "AI Desk" };

interface AiInsight {
  id: string;
  tenantId: string;
  headline: string;
  body: string;
}

const aiInsights: AiInsight[] = [
  {
    id: "ins_1001",
    tenantId: TENANT_ID,
    headline: "Re-authentication risk on Angel One",
    body: "The Angel One feed for the Desai Family HUF has stalled and needs re-authentication before sync can resume. Holdings for this account may be stale until the connection is restored.",
  },
  {
    id: "ins_1002",
    tenantId: TENANT_ID,
    headline: "Dividend not booked in Tally",
    body: "A dividend credit for CrownGlobe Ventures Pvt Ltd is missing from the books of account. Recording it will realign consolidated income with the ledger for FY 2025-26.",
  },
  {
    id: "ins_1003",
    tenantId: TENANT_ID,
    headline: "SMC SIP not yet reflected",
    body: "A monthly SIP transacted through SMC Global Securities has not posted to the consolidated view, leaving the mutual fund allocation understated until the transaction reconciles.",
  },
  {
    id: "ins_1004",
    tenantId: TENANT_ID,
    headline: "Two high-severity items concentrate the risk",
    body: "High-severity exceptions on ICICI Direct for Vijay Desai and Angel One for the Desai Family HUF account for the bulk of open risk. Clearing these two first would resolve most of the outstanding impact.",
  },
];

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

const statusTone: Record<ReconciliationException["status"], BadgeTone> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
};

const statusLabel: Record<ReconciliationException["status"], string> = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
};

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
      <Badge tone={statusTone[row.status]} dot>
        {statusLabel[row.status]}
      </Badge>
    ),
  },
  {
    key: "raisedAt",
    header: "Raised",
    render: (_v, row) => (
      <span className="text-muted">{formatDate(row.raisedAt)}</span>
    ),
  },
];

export default function AiDeskPage() {
  const openExceptions = recentExceptions.filter(
    (exception) => exception.status !== "resolved"
  ).length;
  const highSeverity = recentExceptions.filter(
    (exception) => exception.severity === "high"
  ).length;
  const estimatedImpact = recentExceptions.reduce(
    (sum, exception) => sum + exception.amount,
    0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Intelligence"
        title="AI Desk"
        description="AI-authored exception summaries and narrative insights over the family's consolidated financial data."
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
          label="Open Exceptions"
          value={formatNumber(openExceptions)}
          sublabel="Awaiting resolution"
          tone="warning"
          icon={<Icon name="alert" size={18} />}
        />
        <MetricCard
          label="High Severity"
          value={formatNumber(highSeverity)}
          sublabel="Priority items"
          tone="negative"
          icon={<Icon name="shield" size={18} />}
        />
        <MetricCard
          label="Auto-Summarised"
          value="24"
          sublabel="last 7 days"
          icon={<Icon name="sparkle" size={18} />}
        />
        <MetricCard
          label="Est. Impact"
          value={formatCompactINR(estimatedImpact)}
          sublabel="Across open items"
          icon={<Icon name="funds" size={18} />}
        />
        <MetricCard
          label="Resolved"
          value="12"
          sublabel="this week"
          tone="positive"
          icon={<Icon name="check" size={18} />}
        />
      </div>

      <Card
        title="AI Summary"
        description="Plain-English insights generated across brokers, banks and books of account."
        action={
          <Badge tone="brand" dot>
            Beta
          </Badge>
        }
      >
        <div className="space-y-3">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="flex gap-3 rounded-lg border border-line p-4"
            >
              <span className="mt-0.5 shrink-0 text-brand-blue">
                <Icon name="sparkle" size={18} />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-ink">
                  {insight.headline}
                </p>
                <p className="text-sm text-muted">{insight.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Flagged Exceptions"
        description="Reconciliation items surfaced by the AI Desk for review across the family's accounts."
        padded={false}
      >
        <DataTable
          columns={exceptionColumns}
          rows={recentExceptions}
          emptyMessage="No exceptions flagged by the AI Desk."
        />
      </Card>

      <Card
        title="Ask AI Desk"
        description="Query consolidated holdings, exceptions and books of account in natural language."
        action={
          <Badge tone="info" dot>
            Preview
          </Badge>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-line bg-slate-50 px-4 py-3">
            <span className="shrink-0 text-muted">
              <Icon name="ai" size={18} />
            </span>
            <span className="flex-1 truncate text-sm text-muted">
              Ask about exceptions, holdings or ledgers — e.g. &ldquo;What
              drove this week&rsquo;s high-severity items?&rdquo;
            </span>
            <Button variant="primary" size="sm">
              Ask
            </Button>
          </div>
          <p className="text-xs text-muted">
            Conversational querying is in beta and will be enabled for the
            CrownGlobe Family tenant in an upcoming release.
          </p>
        </div>
      </Card>
    </div>
  );
}
