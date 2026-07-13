// Tally sync & reconciliation domain types.

export type SyncState = "synced" | "pending" | "error" | "never";

export interface TallyCompany {
  id: string;
  tenantId: string;
  entityId: string;
  companyName: string;
  gstin: string;
  financialYear: string;
  lastSyncedAt: string;
  syncState: SyncState;
  ledgerCount: number;
  closingBalance: number;
}

export type ExceptionSeverity = "low" | "medium" | "high";
export type ExceptionStatus = "open" | "in_review" | "resolved";

export interface ReconciliationException {
  id: string;
  tenantId: string;
  source: string;
  description: string;
  severity: ExceptionSeverity;
  amount: number;
  status: ExceptionStatus;
  raisedAt: string;
}
