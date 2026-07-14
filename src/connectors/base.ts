// Connector foundation. Each domain connector interface extends `Connector`
// and ships a mock implementation plus a not-yet-implemented live placeholder.

import type { DataSource } from "@/config/dataSource";

export type ConnectorMode = DataSource;

export interface ConnectorHealth {
  connector: string;
  mode: ConnectorMode;
  connected: boolean;
  lastCheckedAt: string | null;
  message?: string;
}

export class NotImplementedError extends Error {
  constructor(connector: string, method: string) {
    super(
      `${connector}.${method}() is not implemented for the live data source yet.`,
    );
    this.name = "NotImplementedError";
  }
}

export interface Connector {
  readonly name: string;
  readonly mode: ConnectorMode;
  getHealth(tenantId: string): Promise<ConnectorHealth>;
}
