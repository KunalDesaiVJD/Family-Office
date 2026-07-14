import type { Metadata } from "next";
import {
  MasterDataManager,
  type MasterColumn,
  type MasterFilter,
  type MasterDetailField,
  type MasterBadgeSpec,
} from "@/components/master/MasterDataManager";
import { insurancePolicies } from "@/data/mockInsurance";

export const metadata: Metadata = { title: "Insurance Policies" };

const typeBadge: Record<string, MasterBadgeSpec> = {
  term: { tone: "info", label: "Term" },
  health: { tone: "info", label: "Health" },
  endowment: { tone: "info", label: "Endowment" },
  ulip: { tone: "info", label: "ULIP" },
  motor: { tone: "info", label: "Motor" },
  travel: { tone: "info", label: "Travel" },
  general: { tone: "info", label: "General" },
};

const statusBadge: Record<string, MasterBadgeSpec> = {
  active: { tone: "success", label: "Active" },
  grace: { tone: "warning", label: "Grace" },
  lapsed: { tone: "danger", label: "Lapsed" },
  matured: { tone: "neutral", label: "Matured" },
};

const rows = insurancePolicies.map((p) => ({
  id: p.id,
  tenantId: p.tenantId,
  insuredName: p.insuredName,
  insurer: p.insurer,
  policyNo: p.policyNo,
  type: p.type,
  sumAssured: p.sumAssured,
  annualPremium: p.annualPremium,
  premiumDueDate: p.premiumDueDate,
  status: p.status,
  nominee: p.nominee,
}));

const columns: MasterColumn[] = [
  { key: "insuredName", header: "Insured", type: "strong" },
  { key: "insurer", header: "Insurer", type: "muted" },
  { key: "type", header: "Type", type: "badge", badgeMap: typeBadge },
  { key: "policyNo", header: "Policy No.", type: "mono" },
  {
    key: "sumAssured",
    header: "Sum Assured",
    type: "compactCurrency",
    align: "right",
  },
  { key: "premiumDueDate", header: "Premium Due", type: "date" },
  { key: "status", header: "Status", type: "badge", badgeMap: statusBadge },
];

const filters: MasterFilter[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { value: "term", label: "Term" },
      { value: "health", label: "Health" },
      { value: "endowment", label: "Endowment" },
      { value: "ulip", label: "ULIP" },
      { value: "motor", label: "Motor" },
      { value: "travel", label: "Travel" },
      { value: "general", label: "General" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "grace", label: "Grace" },
      { value: "lapsed", label: "Lapsed" },
      { value: "matured", label: "Matured" },
    ],
  },
];

const detailFields: MasterDetailField[] = [
  { key: "insuredName", label: "Insured", type: "strong" },
  { key: "insurer", label: "Insurer", type: "muted" },
  { key: "type", label: "Type", type: "badge", badgeMap: typeBadge },
  { key: "policyNo", label: "Policy No.", type: "mono" },
  { key: "sumAssured", label: "Sum Assured", type: "compactCurrency" },
  { key: "annualPremium", label: "Annual Premium", type: "currency" },
  { key: "premiumDueDate", label: "Premium Due", type: "date" },
  { key: "status", label: "Status", type: "badge", badgeMap: statusBadge },
  { key: "nominee", label: "Nominee", type: "text" },
];

export default function InsurancePoliciesMasterPage() {
  return (
    <MasterDataManager
      eyebrow="V J Desai Family · Master Data"
      title="Insurance Policies"
      description="Master register of insurance policies — sum assured, premium schedule and nominees."
      rows={rows}
      columns={columns}
      filters={filters}
      searchKeys={["insuredName", "insurer", "policyNo"]}
      titleKey="insuredName"
      subtitleKey="insurer"
      detailFields={detailFields}
      addLabel="Add policy"
      entityLabel="policy"
    />
  );
}
