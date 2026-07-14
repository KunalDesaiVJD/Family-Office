// Angel One connector view types (frontend). Read-only, mock data only.

import type { BadgeTone } from "@/components/ui/Badge";

export interface AngelProfile {
  clientCode: string;
  name: string;
  email: string;
  broker: string;
  exchanges: string[];
  products: string[];
}

export interface AngelFunds {
  availableCash: number;
  net: number;
  utilised: number;
  collateral: number;
  payin: number;
}

export type SyncStatus = "success" | "error" | "running";

export interface SyncLogEntry {
  id: string;
  connector: string;
  operation: string;
  status: SyncStatus;
  startedAt: string;
  finishedAt?: string;
  recordCount?: number;
  durationMs?: number;
  error?: string;
  /** Owning account (member name) when the sync is per-account. */
  account?: string;
}

/** Whether the app is serving mock data or is bound to the live connector. */
export type ConnectorState = "mocked" | "live" | "live_unconfigured";

export interface ConnectorHealth {
  connector: string;
  mode: "mock" | "live";
  state: ConnectorState;
  configured: boolean;
  readOnly: boolean;
  tradingEnabled: boolean;
  baseUrlConfigured: boolean;
  lastCheckedAt: string;
  label: string;
  tone: BadgeTone;
  message: string;
}

// --- Multi-account -----------------------------------------------------------

export type AuthStatus =
  | "authenticated"
  | "auth_required"
  | "expired"
  | "not_linked";

export type AccountSyncStatus = "synced" | "syncing" | "error" | "never";

export interface AngelAccountSummary {
  holdingsCount: number;
  holdingsValue: number;
  dayChangePct: number;
  availableCash: number;
  net: number;
  utilised: number;
}

export interface AngelAccount {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  relationship: string;
  /** Full client code — always masked on display. */
  clientCode: string;
  broker: string;
  authStatus: AuthStatus;
  syncStatus: AccountSyncStatus;
  lastSyncedAt: string | null;
  summary: AngelAccountSummary;
  error?: string;
}

export interface AngelHolding {
  account: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  ltp: number;
  value: number;
  dayChangePct: number;
  sector: string;
}

export interface AngelOrder {
  id: string;
  account: string;
  symbol: string;
  side: string;
  orderType: string;
  quantity: number;
  price: number;
  status: string;
  time: string;
}

export interface AngelTrade {
  id: string;
  account: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  value: number;
  time: string;
}

export interface AngelPosition {
  account: string;
  symbol: string;
  product: string;
  netQty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
}

export interface AngelLedgerEntry {
  account: string;
  date: string;
  particulars: string;
  voucher: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AngelSyncRun {
  startedAt: string;
  finishedAt: string;
  total: number;
  succeeded: number;
  failed: number;
  status: "success" | "partial" | "failed";
}
