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
