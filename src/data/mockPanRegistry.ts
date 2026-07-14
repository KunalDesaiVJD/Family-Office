import type { PanRecord } from "@/types/master";
import { TENANT_ID } from "./tenant";
import { familyMembers, legalEntities } from "./mockFamily";

// A unified PAN registry derived from family members (individuals) and legal
// entities. HUF/companies/trusts come from the entity list so each PAN appears
// once, keeping the mapping authoritative.
const individuals: PanRecord[] = familyMembers
  .filter((m) => m.relationship !== "huf")
  .map((m) => ({
    id: `pan_${m.id}`,
    tenantId: TENANT_ID,
    pan: m.pan,
    holderName: m.name,
    holderType: "individual",
    subtype: m.relationship,
    linkedTo: m.governanceRole,
    status: m.status === "inactive" ? "inactive" : "active",
  }));

const entities: PanRecord[] = legalEntities.map((e) => ({
  id: `pan_${e.id}`,
  tenantId: TENANT_ID,
  pan: e.pan,
  holderName: e.name,
  holderType: "entity",
  subtype: e.type,
  linkedTo: e.jurisdiction,
  status: "active",
}));

export const panRecords: PanRecord[] = [...individuals, ...entities];
