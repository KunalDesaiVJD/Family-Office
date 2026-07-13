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
import { formatCompactINR } from "@/lib/format";
import { familyMembers, legalEntities } from "@/data/mockFamily";
import type {
  EntityType,
  FamilyMember,
  LegalEntity,
  MemberStatus,
} from "@/types/family";

export const metadata: Metadata = { title: "Family Members" };

const memberStatusTone: Record<MemberStatus, BadgeTone> = {
  active: "success",
  onboarding: "warning",
  inactive: "neutral",
};

const memberStatusLabel: Record<MemberStatus, string> = {
  active: "Active",
  onboarding: "Onboarding",
  inactive: "Inactive",
};

const entityTypeLabel: Record<EntityType, string> = {
  individual: "Individual",
  huf: "HUF",
  private_limited: "Private Limited",
  llp: "LLP",
  partnership: "Partnership",
  trust: "Trust",
};

function toTitleCase(value: string): string {
  return value
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const combinedNetWorth = familyMembers.reduce(
  (sum, member) => sum + member.netWorth,
  0,
);
const activePans = new Set(familyMembers.map((member) => member.pan)).size;
const onboardingCount = familyMembers.filter(
  (member) => member.status === "onboarding",
).length;

const memberColumns: DataTableColumn<FamilyMember>[] = [
  {
    key: "name",
    header: "Member",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.name}</span>
    ),
  },
  {
    key: "relationship",
    header: "Relationship",
    render: (_v, row) => (
      <span className="text-muted">{toTitleCase(row.relationship)}</span>
    ),
  },
  {
    key: "governanceRole",
    header: "Governance Role",
    render: (_v, row) => <span className="text-ink">{row.governanceRole}</span>,
  },
  {
    key: "pan",
    header: "PAN",
    render: (_v, row) => (
      <span className="tabular-nums text-muted">{row.pan}</span>
    ),
  },
  {
    key: "netWorth",
    header: "Net Worth",
    align: "right",
    render: (_v, row) => (
      <span className="tabular-nums text-ink">
        {formatCompactINR(row.netWorth)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <Badge tone={memberStatusTone[row.status]} dot>
        {memberStatusLabel[row.status]}
      </Badge>
    ),
  },
];

const entityColumns: DataTableColumn<LegalEntity>[] = [
  {
    key: "name",
    header: "Entity",
    render: (_v, row) => (
      <span className="font-medium text-ink">{row.name}</span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (_v, row) => (
      <Badge tone="brand">{entityTypeLabel[row.type]}</Badge>
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
    key: "jurisdiction",
    header: "Jurisdiction",
    render: (_v, row) => <span className="text-muted">{row.jurisdiction}</span>,
  },
];

export default function FamilyPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CrownGlobe Family · Wealth"
        title="Family Members"
        description="Governance register of family members, linked legal entities, PANs and consolidated net worth across the household."
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
          label="Family Members"
          value={String(familyMembers.length)}
          sublabel="Registered in governance"
          icon={<Icon name="family" size={18} />}
        />
        <MetricCard
          label="Legal Entities"
          value={String(legalEntities.length)}
          sublabel="Linked structures"
          icon={<Icon name="shield" size={18} />}
        />
        <MetricCard
          label="Combined Net Worth"
          value={formatCompactINR(combinedNetWorth)}
          sublabel="Across all members"
          tone="positive"
        />
        <MetricCard
          label="Active PANs"
          value={String(activePans)}
          sublabel="Distinct tax identities"
        />
        <MetricCard
          label="Onboarding"
          value={String(onboardingCount)}
          sublabel="Pending activation"
          tone={onboardingCount > 0 ? "warning" : "default"}
        />
      </div>

      <Card
        title="Family Members"
        description="Members, relationships, governance roles and net worth contribution."
        padded={false}
      >
        <DataTable columns={memberColumns} rows={familyMembers} />
      </Card>

      <Card
        title="Legal Entities"
        description="Structures owned or controlled by the family, with tax and jurisdiction registration."
        padded={false}
      >
        <DataTable columns={entityColumns} rows={legalEntities} />
      </Card>
    </div>
  );
}
