// Angel One connector view types (frontend). These describe the read-only data
// the Broker Hub renders and the connector's health/status. Mock data only.

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
}

/** Whether the app is serving mock data or is bound to the live connector. */
export type ConnectorState = "mocked" | "live" | "live_unconfigured";

export interface ConnectorHealth {
  connector: string;
  mode: "mock" | "live";
  state: ConnectorState;
  /** Whether the live Angel One connector is configured (backend credentials). */
  configured: boolean;
  readOnly: boolean;
  tradingEnabled: boolean;
  baseUrlConfigured: boolean;
  lastCheckedAt: string;
  label: string;
  tone: BadgeTone;
  message: string;
}
