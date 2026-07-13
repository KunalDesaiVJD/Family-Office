// Family member & legal entity domain types.

export type EntityType =
  | "individual"
  | "huf"
  | "private_limited"
  | "llp"
  | "partnership"
  | "trust";

export interface LegalEntity {
  id: string;
  tenantId: string;
  name: string;
  type: EntityType;
  pan: string;
  jurisdiction: string;
  incorporatedOn?: string;
}

export type Relationship =
  | "self"
  | "spouse"
  | "son"
  | "daughter"
  | "father"
  | "mother"
  | "huf"
  | "entity";

export type MemberStatus = "active" | "onboarding" | "inactive";

export interface FamilyMember {
  id: string;
  tenantId: string;
  name: string;
  relationship: Relationship;
  pan: string;
  /** Legal entities this member is linked to (owner / director / partner). */
  entityIds: string[];
  governanceRole: string;
  netWorth: number;
  status: MemberStatus;
  joinedAt: string;
}
