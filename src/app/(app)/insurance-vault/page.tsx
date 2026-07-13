import type { Metadata } from "next";
import {
  PageHeader,
  MetricCard,
  Card,
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  type BadgeTone,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatCompactINR, formatDate } from "@/lib/format";
import { insurancePolicies, premiumsDueSoon } from "@/data/mockInsurance";
import type { InsurancePolicy } from "@/types/insurance";

export const metadata: Metadata = { title: "Insurance Vault" };

const TYPE_LABELS: Record<InsurancePolicy["type"], string> = {
  term: "Term",
  health: "Health",
  ulip: "ULIP",
  endowment: "Endowment",
  motor: "Motor",
  travel: "Travel",
  general: "General",
};

const STATUS_TONES: Record<InsurancePolicy["status"], BadgeTone> = {
  active: "success",
  grace: "warning",
  lapsed: "danger",
  matured: "neutral",
};

const STATUS_LABELS: Record<InsurancePolicy["status"], string> = {
  active: "Active",
  grace: "Grace",
  lapsed: "Lapsed",
  matured: "Matured",
};

const activeCount = insurancePolicies.filter((p) => p.status === "active").length;
const totalSumAssured = insurancePolicies.reduce((sum, p) => sum + p.sumAssured, 0);
const totalAnnualPremium = insurancePolicies.reduce((sum, p) => sum + p.annualPremium, 0);
const graceLapsedCount = insurancePolicies.filter(
  (p) => p.status === "grace" || p.status === "lapsed",
).length;
const premiumsDueCount = premiumsDueSoon.length;

const columns: DataTableColumn<InsurancePolicy>[] = [
  {
    key: "insuredName",
    header: "Insured",
    render: (_v, row) => <span className="font-medium text-ink">{row.insuredName}</span>,
  },
  {
    key: "insurer",
    header: "Insurer",
    render: (_v, row) => <span className="text-muted">{row.insurer}</span>,
  },
  {
    key: "type",
    header: "Type",
    render: (_v, row) => (
      <Badge tone="info">{TYPE_LABELS[row.type]}</Badge>
    ),
  },
  {
    key: "policyNo",
    header: "Policy No.",
    render: (_v, row) => <span className="tabular-nums text-muted">{row.policyNo}</span>,
  },
  {
    key: "sumAssured",
    header: "Sum Assured",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">{formatCompactINR(row.sumAssured)}</span>
    ),
  },
  {
    key: "annualPremium",
    header: "Annual Premium",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">{formatCompactINR(row.annualPremium)}</span>
    ),
  },
  {
    key: "premiumDueDate",
    header: "Premium Due",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">{formatDate(row.premiumDueDate)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <Badge tone={STATUS_TONES[row.status]} dot>
        {STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
];

export default function InsuranceVaultPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Wealth"
        title="Insurance Vault"
        description="Consolidated policy register tracking sum assured, premium schedules and nominee coverage across the family."
        actions={
          <Button variant="outline" size="md" leftIcon={<Icon name="download" size={16} />}>
            Export
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Active Policies"
          value={String(activeCount)}
          sublabel="In force"
          icon={<Icon name="insurance" size={18} />}
        />
        <MetricCard
          label="Total Sum Assured"
          value={formatCompactINR(totalSumAssured)}
          sublabel="Aggregate cover"
          tone="positive"
        />
        <MetricCard
          label="Annual Premium"
          value={formatCompactINR(totalAnnualPremium)}
          sublabel="Total outgo per year"
        />
        <MetricCard
          label="Premiums Due"
          value={String(premiumsDueCount)}
          sublabel="Next 45 days"
          tone="warning"
        />
        <MetricCard
          label="Grace / Lapsed"
          value={String(graceLapsedCount)}
          sublabel="Requires attention"
          tone="negative"
        />
      </div>

      <Card
        title="Policy Register"
        description="Every family insurance contract with sum assured, premium cadence and current standing."
        padded={false}
      >
        <DataTable columns={columns} rows={insurancePolicies} />
      </Card>

      <Card
        title="Renewals & Nominee Verification"
        description="Automated policy servicing workflow"
        action={<Badge tone="success" dot>Live</Badge>}
      >
        <div className="rounded-lg border border-dashed border-line p-6">
          <div className="flex items-start gap-3">
            <Icon name="insurance" size={18} />
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink">
                Upcoming renewals and nominee checks are monitored continuously
              </p>
              <p className="text-sm text-muted">
                {premiumsDueCount} premiums fall due within the next 45 days. The vault flags
                policies in grace, schedules renewal reminders and reconciles nominee records
                against family member profiles so coverage never lapses unnoticed.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
