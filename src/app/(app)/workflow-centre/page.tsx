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
import { TENANT_ID } from "@/data/mockDashboard";
import type { AuditLogEntry } from "@/types/tenant";
import {
  formatCompactINR,
  formatDateTime,
  formatDate,
  formatNumber,
} from "@/lib/format";

export const metadata: Metadata = { title: "Workflow Centre" };

interface ApprovalRequest {
  id: string;
  tenantId: string;
  request: string;
  entity: string;
  requestedBy: string;
  amount: number;
  stage: "pending" | "awaiting_checker" | "approved" | "rejected";
  raisedAt: string;
}

const approvalRequests: ApprovalRequest[] = [
  {
    id: "apr_5001",
    tenantId: TENANT_ID,
    request: "Outbound remittance to custodian",
    entity: "CrownGlobe Ventures Pvt Ltd",
    requestedBy: "Kunal Desai",
    amount: 24_500_000,
    stage: "awaiting_checker",
    raisedAt: "2026-07-13",
  },
  {
    id: "apr_5002",
    tenantId: TENANT_ID,
    request: "New broker account onboarding",
    entity: "CrownGlobe Advisory LLP",
    requestedBy: "Neha Desai",
    amount: 0,
    stage: "pending",
    raisedAt: "2026-07-12",
  },
  {
    id: "apr_5003",
    tenantId: TENANT_ID,
    request: "Insurance premium disbursement",
    entity: "Desai Family HUF",
    requestedBy: "Lata Desai",
    amount: 1_860_000,
    stage: "pending",
    raisedAt: "2026-07-12",
  },
  {
    id: "apr_5004",
    tenantId: TENANT_ID,
    request: "Mutual fund redemption request",
    entity: "CrownGlobe Ventures Pvt Ltd",
    requestedBy: "Kunal Desai",
    amount: 12_000_000,
    stage: "approved",
    raisedAt: "2026-07-10",
  },
  {
    id: "apr_5005",
    tenantId: TENANT_ID,
    request: "Vendor payout above threshold",
    entity: "CrownGlobe Advisory LLP",
    requestedBy: "Neha Desai",
    amount: 3_400_000,
    stage: "rejected",
    raisedAt: "2026-07-09",
  },
];

const auditLog: AuditLogEntry[] = [
  {
    id: "aud_9001",
    tenantId: TENANT_ID,
    actor: "Kunal Desai",
    action: "Approval raised",
    entity: "CrownGlobe Ventures Pvt Ltd",
    detail: "Outbound remittance of ₹2.45 Cr submitted for checker review",
    timestamp: "2026-07-13T09:42:00+05:30",
    ipAddress: "103.21.58.14",
  },
  {
    id: "aud_9002",
    tenantId: TENANT_ID,
    actor: "Vijay Desai",
    action: "Approval approved",
    entity: "CrownGlobe Ventures Pvt Ltd",
    detail: "Mutual fund redemption approved under maker-checker control",
    timestamp: "2026-07-10T16:18:00+05:30",
    ipAddress: "103.21.58.09",
  },
  {
    id: "aud_9003",
    tenantId: TENANT_ID,
    actor: "Vijay Desai",
    action: "Approval rejected",
    entity: "CrownGlobe Advisory LLP",
    detail: "Vendor payout rejected pending revised invoice documentation",
    timestamp: "2026-07-09T11:05:00+05:30",
    ipAddress: "49.36.112.87",
  },
  {
    id: "aud_9004",
    tenantId: TENANT_ID,
    actor: "System",
    action: "Sync completed",
    entity: "Tally · CrownGlobe Ventures",
    detail: "Ledger sync completed with 842 accounts reconciled",
    timestamp: "2026-07-13T06:15:00+05:30",
  },
  {
    id: "aud_9005",
    tenantId: TENANT_ID,
    actor: "info@crownglobe.com",
    action: "Role updated",
    entity: "Tenant · CrownGlobe Family",
    detail: "Auditor role granted read-only access to workflow module",
    timestamp: "2026-07-08T14:30:00+05:30",
    ipAddress: "103.21.58.02",
  },
];

const stageTone: Record<ApprovalRequest["stage"], BadgeTone> = {
  pending: "warning",
  awaiting_checker: "info",
  approved: "success",
  rejected: "danger",
};

const stageLabel: Record<ApprovalRequest["stage"], string> = {
  pending: "Pending",
  awaiting_checker: "Awaiting Checker",
  approved: "Approved",
  rejected: "Rejected",
};

const approvalColumns: DataTableColumn<ApprovalRequest>[] = [
  {
    key: "request",
    header: "Request",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.request}</span>
    ),
  },
  {
    key: "entity",
    header: "Entity",
    render: (_v, row) => <span className="text-muted">{row.entity}</span>,
  },
  {
    key: "requestedBy",
    header: "Requested By",
    render: (_v, row) => <span className="text-muted">{row.requestedBy}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {row.amount === 0 ? "—" : formatCompactINR(row.amount)}
      </span>
    ),
  },
  {
    key: "stage",
    header: "Stage",
    render: (_v, row) => (
      <Badge tone={stageTone[row.stage]} dot>
        {stageLabel[row.stage]}
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

const auditColumns: DataTableColumn<AuditLogEntry>[] = [
  {
    key: "actor",
    header: "Actor",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.actor}</span>
    ),
  },
  {
    key: "action",
    header: "Action",
    render: (_v, row) => (
      <span className="text-ink">{row.action}</span>
    ),
  },
  {
    key: "entity",
    header: "Entity",
    render: (_v, row) => <span className="text-muted">{row.entity}</span>,
  },
  {
    key: "detail",
    header: "Detail",
    render: (_v, row) => <span className="text-muted">{row.detail}</span>,
  },
  {
    key: "timestamp",
    header: "Timestamp",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">
        {formatDateTime(row.timestamp)}
      </span>
    ),
  },
];

export default function WorkflowCentrePage() {
  const pendingApprovals = approvalRequests.filter(
    (request) =>
      request.stage === "pending" || request.stage === "awaiting_checker"
  ).length;
  const auditEvents = auditLog.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Intelligence"
        title="Workflow Centre"
        description="Route maker-checker approvals and maintain a tamper-evident audit trail across the tenant."
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
          label="Pending Approvals"
          value={formatNumber(pendingApprovals)}
          sublabel="In the queue"
          tone="warning"
          icon={<Icon name="workflow" size={18} />}
        />
        <MetricCard
          label="Awaiting Me"
          value="2"
          sublabel="Assigned as checker"
          icon={<Icon name="check" size={18} />}
        />
        <MetricCard
          label="Approved"
          value="18"
          sublabel="30 days"
          tone="positive"
          icon={<Icon name="shield" size={18} />}
        />
        <MetricCard
          label="Audit Events"
          value={formatNumber(auditEvents)}
          sublabel="342 lifetime"
          icon={<Icon name="documents" size={18} />}
        />
        <MetricCard
          label="SLA Breaches"
          value="1"
          sublabel="Past due for review"
          tone="negative"
          icon={<Icon name="alert" size={18} />}
        />
      </div>

      <Card
        title="Approval Queue"
        description="Maker-checker requests awaiting review, sign-off or disbursement across the family's entities."
        padded={false}
      >
        <DataTable
          columns={approvalColumns}
          rows={approvalRequests}
          emptyMessage="No approvals in the queue."
        />
      </Card>

      <Card
        title="Audit Log"
        description="Chronological, tamper-evident record of privileged actions taken within the tenant."
        padded={false}
      >
        <DataTable
          columns={auditColumns}
          rows={auditLog}
          emptyMessage="No audit events recorded."
        />
      </Card>

      <Card className="border-dashed">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted">
              <Icon name="workflow" size={18} />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  Configurable approval engine
                </h3>
                <Badge tone="neutral" dot>
                  Planned
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted">
                Rule-based routing, threshold-driven maker-checker chains and
                immutable audit exports are on the roadmap. Approval policies
                will be configurable per entity and per role once the workflow
                engine goes live.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Request early access
          </Button>
        </div>
      </Card>
    </div>
  );
}
