// Sync log structure. Records each connector sync attempt. In-memory for now —
// persist to the platform DB (a SyncLog table) when wired.

import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

export type SyncStatus = "running" | "success" | "error";

export interface SyncLogEntry {
  id: string;
  tenantId: string;
  connector: string;
  operation: string;
  status: SyncStatus;
  startedAt: string;
  finishedAt?: string;
  recordCount?: number;
  error?: string;
}

const entries: SyncLogEntry[] = [];

export const syncLog = {
  start(tenantId: string, connector: string, operation: string): SyncLogEntry {
    const entry: SyncLogEntry = {
      id: randomUUID(),
      tenantId,
      connector,
      operation,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    entries.push(entry);
    logger.info("sync.start", { syncId: entry.id, tenantId, connector, operation });
    return entry;
  },

  complete(entry: SyncLogEntry, recordCount?: number): void {
    entry.status = "success";
    entry.finishedAt = new Date().toISOString();
    entry.recordCount = recordCount;
    logger.info("sync.success", {
      syncId: entry.id,
      tenantId: entry.tenantId,
      operation: entry.operation,
      recordCount,
    });
  },

  fail(entry: SyncLogEntry, error: string): void {
    entry.status = "error";
    entry.finishedAt = new Date().toISOString();
    entry.error = error;
    logger.warn("sync.error", {
      syncId: entry.id,
      tenantId: entry.tenantId,
      operation: entry.operation,
      error,
    });
  },

  list(tenantId?: string): SyncLogEntry[] {
    return tenantId ? entries.filter((e) => e.tenantId === tenantId) : [...entries];
  },
};
