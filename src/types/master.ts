// Master-data domain types that are cross-cutting (not owned by one module).

/** A PAN (Permanent Account Number) value. */
export type Pan = string;

export type PanHolderType = "individual" | "entity";
export type PanStatus = "active" | "inactive";

export interface PanRecord {
  id: string;
  tenantId: string;
  pan: string;
  holderName: string;
  holderType: PanHolderType;
  /** Relationship (for individuals) or entity type (for entities). */
  subtype: string;
  /** Governance role (individuals) or jurisdiction (entities). */
  linkedTo: string;
  status: PanStatus;
}

export type DocumentCategoryStatus = "active" | "draft" | "archived";

export interface DocumentCategoryRecord {
  id: string;
  tenantId: string;
  code: string;
  label: string;
  description: string;
  documentCount: number;
  retentionMonths: number;
  status: DocumentCategoryStatus;
}
