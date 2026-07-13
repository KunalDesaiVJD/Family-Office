// Insurance domain types.

export type PolicyType =
  | "term"
  | "health"
  | "endowment"
  | "ulip"
  | "motor"
  | "travel"
  | "general";

export type PolicyStatus = "active" | "lapsed" | "grace" | "matured";

export interface InsurancePolicy {
  id: string;
  tenantId: string;
  memberId: string;
  insuredName: string;
  insurer: string;
  policyNo: string;
  type: PolicyType;
  sumAssured: number;
  annualPremium: number;
  premiumDueDate: string;
  status: PolicyStatus;
  nominee: string;
}
