import type { Metadata } from "next";
import { PageHeader, MetricCard, ModuleCard, Card, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  NetWorthChart,
  AllocationPanel,
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
  formatDate,
  formatDateTime,
} from "@/lib/format";
import { getConnectorHealth } from "@/lib/brokerStatus";
import { ConnectorStatusBanner } from "@/components/broker/ConnectorStatusBanner";
import { angelLastSyncedAt } from "@/data/mockAngel";
import { ROUTES } from "@/config/routes";
import { mockLedger } from "@/data/mockPortfolio";
import { mockImportBatches } from "@/data/mockTrades";
import { mockLastReconciliationAt, mockReconciliationExceptions } from "@/data/mockReconciliation";

const importStatusLabel: Record<string, string> = {
  uploaded: "Uploaded",
  validating: "Validating",
  validated: "Validated",
  awaiting_review: "Awaiting Review",
  imported: "Imported",
  partially_imported: "Partially Imported",
  rejected: "Rejected",
  failed: "Failed",
};

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
  const health = getConnectorHealth();

  // Investment-ledger figures computed from the internal FIFO engine.
  const ledgerEquity = mockLedger.accountHoldings.reduce(
    (sum, h) => sum + (h.marketValue ?? h.investedValue),
    0,
  );
  const realisedGain = mockLedger.realisedGain.realisedGain;
  const unrealisedGain = mockLedger.unrealisedGain.total;
  const openReconExceptions = mockReconciliationExceptions.filter(
    (e) => e.status !== "Resolved" && e.status !== "Ignored",
  ).length;
  const lastImport = [...mockImportBatches].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  )[0];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="V J Desai Family · Command Centre"
        title="Consolidated Dashboard"
        description="A single, institution-grade view of the family's wealth across brokers, funds, Tally, insurance and operations. Figures shown are illustrative mock data."
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

      <ConnectorStatusBanner health={health} />

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
            tone="positive"
            href={ROUTES.brokerHub}
            label="Broker Cash"
            value={formatCompactINR(m.brokerCash)}
            sublabel="Angel funds / RMS"
            icon={<Icon name="cash" size={18} />}
          />
          <MetricCard
            emphasis
            href={ROUTES.reconciliation}
            label="Open Exceptions"
            value={String(openReconExceptions)}
            tone={openReconExceptions > 0 ? "warning" : "default"}
            sublabel="Investment reconciliation"
            icon={<Icon name="alert" size={18} />}
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

      {/* Investment ledger — internal FIFO engine */}
      <section>
        <SectionHeading
          title="Investment Ledger"
          description="Computed live from the internal FIFO engine over imported and mock trades."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            href={ROUTES.taxCentre}
            label="Listed Equity (Ledger)"
            value={formatCompactINR(ledgerEquity)}
            sublabel="Internal holdings"
            icon={<Icon name="broker" size={18} />}
          />
          <MetricCard
            href={ROUTES.taxCentre}
            label="Realised Gain"
            value={formatCompactINR(realisedGain)}
            tone={realisedGain >= 0 ? "positive" : "negative"}
            sublabel="FIFO closed lots"
            icon={<Icon name="funds" size={18} />}
          />
          <MetricCard
            href={ROUTES.taxCentre}
            label="Unrealised Gain"
            value={formatCompactINR(unrealisedGain)}
            tone={unrealisedGain >= 0 ? "positive" : "negative"}
            sublabel={`${mockLedger.unrealisedGain.pricedCount} priced · ${mockLedger.unrealisedGain.pendingCount} pending`}
            icon={<Icon name="sparkle" size={18} />}
          />
          <MetricCard
            href={ROUTES.reconciliation}
            label="Open Recon Exceptions"
            value={String(openReconExceptions)}
            tone={openReconExceptions > 0 ? "warning" : "default"}
            sublabel="Investment reconciliation"
            icon={<Icon name="alert" size={18} />}
          />
          <MetricCard
            href={ROUTES.taxImports}
            label="Last Trade Import"
            value={importStatusLabel[lastImport.status] ?? lastImport.status}
            sublabel={formatDate(lastImport.uploadedAt)}
            icon={<Icon name="download" size={18} />}
          />
          <MetricCard
            href={ROUTES.reconciliation}
            label="Last Reconciliation"
            value={formatDate(mockLastReconciliationAt)}
            sublabel="Investment recon run"
            icon={<Icon name="sync" size={18} />}
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
            label="Operational Exceptions"
            value={String(m.openExceptions)}
            tone="warning"
            sublabel="Across brokers, funds & Tally"
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
            description={`Equity value and connection health · Last synced ${formatDateTime(angelLastSyncedAt)}`}
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
            title="Operational Exceptions"
            description="Highest-priority open items flagged for review."
            action={
              <Button variant="ghost" size="sm" href={ROUTES.reconciliation}>
                Open Reconciliation Centre
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
