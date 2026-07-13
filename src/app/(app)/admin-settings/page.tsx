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
import { tenant, TENANT_ID } from "@/data/mockDashboard";
import type { FeatureFlag, TenantUser } from "@/types/tenant";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Admin Settings" };

const users: TenantUser[] = [
  {
    id: "usr_001",
    tenantId: TENANT_ID,
    name: "Rajesh Malhotra",
    email: "rajesh@crownglobe.com",
    role: "owner",
    status: "active",
    lastActiveAt: "2026-07-13T09:42:00+05:30",
  },
  {
    id: "usr_002",
    tenantId: TENANT_ID,
    name: "Anaya Malhotra",
    email: "anaya@crownglobe.com",
    role: "admin",
    status: "active",
    lastActiveAt: "2026-07-13T08:15:00+05:30",
  },
  {
    id: "usr_003",
    tenantId: TENANT_ID,
    name: "Vikram Sethi",
    email: "vikram.sethi@advisory.co.in",
    role: "advisor",
    status: "active",
    lastActiveAt: "2026-07-12T18:30:00+05:30",
  },
  {
    id: "usr_004",
    tenantId: TENANT_ID,
    name: "Priya Nair",
    email: "priya.nair@crownglobe.com",
    role: "member",
    status: "invited",
    lastActiveAt: "2026-07-10T11:05:00+05:30",
  },
  {
    id: "usr_005",
    tenantId: TENANT_ID,
    name: "S. R. Iyer & Co.",
    email: "audit@sriyer.co.in",
    role: "auditor",
    status: "suspended",
    lastActiveAt: "2026-06-28T16:20:00+05:30",
  },
];

const featureFlags: FeatureFlag[] = [
  {
    key: "brokerHub",
    label: "Broker Hub",
    description:
      "Consolidated demat holdings and broker cash across trading accounts.",
    enabled: tenant.featureFlags.brokerHub ?? true,
    scope: "tenant",
  },
  {
    key: "tallySync",
    label: "Tally Sync",
    description:
      "Ledger reconciliation between books of account and holdings.",
    enabled: tenant.featureFlags.tallySync ?? true,
    scope: "tenant",
  },
  {
    key: "aiDesk",
    label: "AI Desk",
    description:
      "Automated exception summaries and narrative insights over consolidated data.",
    enabled: tenant.featureFlags.aiDesk ?? true,
    scope: "tenant",
  },
  {
    key: "controlledTrading",
    label: "Controlled Trading",
    description:
      "Maker-checker order placement with tenant-level approval limits.",
    enabled: tenant.featureFlags.controlledTrading ?? false,
    scope: "tenant",
  },
  {
    key: "billing",
    label: "Billing & Invoicing",
    description:
      "Subscription plans, usage metering and invoice generation.",
    enabled: tenant.featureFlags.billing ?? false,
    scope: "global",
  },
  {
    key: "ssoEnforcement",
    label: "SSO Enforcement",
    description:
      "Mandatory single sign-on for every member of the tenant.",
    enabled: false,
    scope: "global",
  },
];

const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const activeUsers = users.filter((user) => user.status === "active").length;
const distinctRoles = new Set(users.map((user) => user.role)).size;
const flagsOn = featureFlags.filter((flag) => flag.enabled).length;

const statusToneMap: Record<TenantUser["status"], BadgeTone> = {
  active: "success",
  invited: "info",
  suspended: "danger",
};

const userColumns: DataTableColumn<TenantUser>[] = [
  {
    key: "name",
    header: "User",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.name}</span>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (_v, row) => <span className="text-muted">{row.email}</span>,
  },
  {
    key: "role",
    header: "Role",
    render: (_v, row) => (
      <Badge tone="brand">{titleCase(row.role)}</Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <Badge tone={statusToneMap[row.status]} dot>
        {titleCase(row.status)}
      </Badge>
    ),
  },
  {
    key: "lastActiveAt",
    header: "Last Active",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">
        {formatDateTime(row.lastActiveAt)}
      </span>
    ),
  },
];

const profileFields: { label: string; value: string }[] = [
  { label: "Tenant Name", value: tenant.name },
  { label: "Slug", value: tenant.slug },
  { label: "Plan", value: titleCase(tenant.plan) },
  { label: "Base Currency", value: tenant.baseCurrency },
  { label: "Primary Contact", value: tenant.primaryContact },
  { label: "Onboarded", value: formatDate(tenant.onboardedAt) },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · System"
        title="Admin Settings"
        description="Tenant profile, users and roles, and feature flags for the family office control plane."
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Plan"
          value={titleCase(tenant.plan)}
          sublabel="Subscription tier"
          icon={<Icon name="admin" size={18} />}
        />
        <MetricCard
          label="Active Users"
          value={String(activeUsers)}
          sublabel={`${users.length} total seats`}
          tone="positive"
          icon={<Icon name="family" size={18} />}
        />
        <MetricCard
          label="Roles"
          value={String(distinctRoles)}
          sublabel="Distinct access roles"
          icon={<Icon name="shield" size={18} />}
        />
        <MetricCard
          label="Feature Flags On"
          value={String(flagsOn)}
          sublabel={`of ${featureFlags.length} configured`}
          icon={<Icon name="sparkle" size={18} />}
        />
      </div>

      <Card
        title="Tenant Profile"
        description="Core identity and billing configuration for this tenant."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {profileFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted">
                {field.label}
              </p>
              <p className="font-medium text-ink">{field.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Users & Roles"
        description="Directory of members, advisors and auditors with access to the tenant."
        padded={false}
      >
        <DataTable columns={userColumns} rows={users} />
      </Card>

      <Card
        title="Feature Flags"
        description="Module and platform toggles governing what this tenant can access."
      >
        <div className="space-y-3">
          {featureFlags.map((flag) => (
            <div
              key={flag.key}
              className="flex items-start justify-between gap-4 rounded-lg border border-line p-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-ink">{flag.label}</p>
                <p className="text-sm text-muted">{flag.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={flag.enabled ? "success" : "neutral"} dot>
                  {flag.enabled ? "On" : "Off"}
                </Badge>
                <Badge tone="info">{titleCase(flag.scope)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
