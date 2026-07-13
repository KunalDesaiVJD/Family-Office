import type { Metadata } from "next";
import { PageHeader, MetricCard, ModuleCard, Card, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  NetWorthChart,
  AllocationPanel,
  AiDailyBrief,
  BrokerOverview,
  ExceptionsPreview,
  TallyStatus,
  PremiumsDue,
  DocumentsPreview,
} from "@/components/dashboard";
import { dashboardMetrics, moduleReadiness } from "@/data/mockDashboard";
import {
  formatCompactINR,
  formatINR,
  formatSignedCompactINR,
  formatPercent,
} from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const m = dashboardMetrics;

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const up = m.todaysMovement.amount >= 0;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="V J Desai Family · Command Centre"
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

      {/* Tier 1 — net worth hero + allocation */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Consolidated Net Worth
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
                {formatCompactINR(m.consolidatedNetWorth)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={up ? "success" : "danger"} dot>
                  {formatSignedCompactINR(m.todaysMovement.amount)} today
                </Badge>
                <span className={`text-sm font-medium ${up ? "text-emerald-600" : "text-red-600"}`}>
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
              <p className="mt-2 text-xs text-muted">As of 13 Jul 2026, 09:42 IST</p>
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

      {/* AI daily brief */}
      <AiDailyBrief />

      {/* Tier 2 — primary financial KPIs */}
      <section>
        <SectionHeading
          title="Financial Position"
          description="Consolidated across all members, entities and connected accounts."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard
            emphasis
            href="/broker-hub"
            label="Total Listed Equity"
            value={formatCompactINR(m.totalListedEquity)}
            delta={{ value: "1.24%", direction: "up" }}
            sublabel="6 broker accounts"
            icon={<Icon name="broker" size={18} />}
          />
          <MetricCard
            emphasis
            href="/mutual-funds"
            label="Mutual Fund Value"
            value={formatCompactINR(m.mutualFundValue)}
            delta={{ value: "0.62%", direction: "up" }}
            sublabel="7 folios via SMC"
            icon={<Icon name="funds" size={18} />}
          />
          <MetricCard
            emphasis
            href="/bank-balances"
            label="Bank Balance"
            value={formatCompactINR(m.bankBalance)}
            sublabel="5 accounts"
            icon={<Icon name="bank" size={18} />}
          />
          <MetricCard
            emphasis
            tone="positive"
            label="Broker Cash"
            value={formatCompactINR(m.brokerCash)}
            sublabel="Available margin"
            icon={<Icon name="sparkle" size={18} />}
          />
          <MetricCard
            emphasis
            href="/insurance-vault"
            label="Insurance Cover"
            value={formatCompactINR(m.insuranceCover)}
            sublabel="7 active policies"
            icon={<Icon name="insurance" size={18} />}
          />
        </div>
      </section>

      {/* Tier 3 — operations & alerts */}
      <section>
        <SectionHeading
          title="Operations & Alerts"
          description="Items awaiting review or action across the platform."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Open Exceptions"
            value={String(m.openExceptions)}
            tone="warning"
            sublabel="Across brokers, banks & Tally"
            delta={{ value: "2 high severity", direction: "down" }}
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
          <MetricCard
            label="Today's Movement"
            value={formatSignedCompactINR(m.todaysMovement.amount)}
            tone="positive"
            sublabel={`${formatPercent(m.todaysMovement.percent)} vs. previous close`}
            delta={{ value: formatPercent(m.todaysMovement.percent), direction: up ? "up" : "down" }}
            icon={<Icon name="funds" size={18} />}
          />
        </div>
      </section>

      {/* Module readiness */}
      <section>
        <SectionHeading
          title="Module Readiness"
          description="Operational status and build completeness of each Family Wealth OS module."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleReadiness.map((mod) => (
            <ModuleCard
              key={mod.key}
              title={mod.title}
              description={mod.description}
              status={mod.status}
              href={mod.href}
              meta={mod.meta}
              icon={mod.icon}
              progress={mod.progress}
            />
          ))}
        </div>
      </section>

      {/* Operational previews */}
      <section>
        <SectionHeading
          title="Operational Previews"
          description="Live snapshots that link through to each operating module."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Broker Account Overview"
            description="Equity value and connection health by account."
            action={
              <Button variant="ghost" size="sm" href="/broker-hub">
                Open Broker Hub
              </Button>
            }
            padded={false}
          >
            <BrokerOverview />
          </Card>

          <Card
            title="Reconciliation Exceptions"
            description="Highest-priority open items flagged for review."
            action={
              <Button variant="ghost" size="sm" href="/ai-desk">
                Open AI Desk
              </Button>
            }
            padded={false}
          >
            <ExceptionsPreview />
          </Card>

          <Card
            title="Tally Sync Status"
            description="Books of account reconciliation by entity."
            action={
              <Button variant="ghost" size="sm" href="/tally-sync">
                Open Tally Sync
              </Button>
            }
            padded={false}
          >
            <TallyStatus />
          </Card>

          <Card
            title="Insurance Premiums Due"
            description="Premiums falling due within the next 45 days."
            action={
              <Button variant="ghost" size="sm" href="/insurance-vault">
                Open Insurance Vault
              </Button>
            }
            padded={false}
          >
            <PremiumsDue />
          </Card>

          <Card
            title="Document Vault"
            description="Most recently added statements, notes and legal documents."
            action={
              <Button variant="ghost" size="sm" href="/document-vault">
                Open Document Vault
              </Button>
            }
            padded={false}
            className="lg:col-span-2"
          >
            <DocumentsPreview />
          </Card>
        </div>
      </section>
    </div>
  );
}
