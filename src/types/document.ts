// Document vault domain types.
// The category list is investment-first. There is intentionally NO bank
// statement category — bank documents are out of scope for this version.

export type DocumentCategory =
  | "angel_contract_note"
  | "angel_ledger"
  | "angel_trade_report"
  | "angel_holding_report"
  | "cas_statement"
  | "mutual_fund_statement"
  | "insurance_policy"
  | "tally_export"
  | "tax_report"
  | "other";

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
