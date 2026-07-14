// Shared status → badge tone / label maps, reused across the dashboard
// previews and the module pages so treatments stay consistent.

import type { BadgeTone } from "@/components/ui/Badge";
import type { ConnectionStatus } from "@/types/broker";
import type {
  SyncState,
  ExceptionSeverity,
  ExceptionStatus,
} from "@/types/tally";
import type { PolicyStatus } from "@/types/insurance";
import type { DocumentCategory } from "@/types/document";

export const connectionTone: Record<ConnectionStatus, BadgeTone> = {
  connected: "success",
  syncing: "info",
  auth_required: "warning",
  error: "danger",
  disconnected: "neutral",
};

export const connectionLabel: Record<ConnectionStatus, string> = {
  connected: "Connected",
  syncing: "Syncing",
  auth_required: "Auth required",
  error: "Error",
  disconnected: "Disconnected",
};

export const syncStateTone: Record<SyncState, BadgeTone> = {
  synced: "success",
  pending: "warning",
  error: "danger",
  never: "neutral",
};

export const syncStateLabel: Record<SyncState, string> = {
  synced: "Synced",
  pending: "Pending",
  error: "Error",
  never: "Never",
};

export const severityTone: Record<ExceptionSeverity, BadgeTone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export const severityLabel: Record<ExceptionSeverity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const exceptionStatusTone: Record<ExceptionStatus, BadgeTone> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
};

export const exceptionStatusLabel: Record<ExceptionStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
};

export const policyStatusTone: Record<PolicyStatus, BadgeTone> = {
  active: "success",
  grace: "warning",
  lapsed: "danger",
  matured: "neutral",
};

export const policyStatusLabel: Record<PolicyStatus, string> = {
  active: "Active",
  grace: "Grace",
  lapsed: "Lapsed",
  matured: "Matured",
};

/** Visible document categories. No bank-statement category by design. */
export const documentCategoryLabel: Record<DocumentCategory, string> = {
  angel_contract_note: "Angel Contract Note",
  angel_ledger: "Angel Ledger",
  angel_trade_report: "Angel Trade Report",
  angel_holding_report: "Angel Holding Report",
  cas_statement: "CAS Statement",
  mutual_fund_statement: "Mutual Fund Statement",
  insurance_policy: "Insurance Policy",
  tally_export: "Tally Export",
  tax_report: "Tax Report",
  other: "Other",
};
