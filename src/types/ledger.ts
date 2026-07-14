// Tally / books-of-account ledger types.

export type VoucherType =
  | "sales"
  | "purchase"
  | "payment"
  | "receipt"
  | "journal"
  | "contra"
  | "debit_note"
  | "credit_note";

export interface LedgerEntry {
  id: string;
  tenantId: string;
  tallyCompanyId: string;
  entityId: string;
  date: string;
  ledgerName: string;
  voucherType: VoucherType;
  voucherNo: string;
  narration?: string;
  debit: number;
  credit: number;
  runningBalance?: number;
}
