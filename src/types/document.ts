// Document vault domain types.

export type DocumentCategory =
  | "statement"
  | "contract_note"
  | "policy"
  | "legal"
  | "tax"
  | "kyc";

export type DocumentStatus = "verified" | "pending" | "expiring";

export interface VaultDocument {
  id: string;
  tenantId: string;
  name: string;
  category: DocumentCategory;
  owner: string;
  sizeKb: number;
  uploadedAt: string;
  status: DocumentStatus;
}
