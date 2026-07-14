import type { AngelProfile, AngelFunds, SyncLogEntry } from "@/types/angel";

// Mock Angel One read-only data used until live credentials are provisioned.

export const angelProfile: AngelProfile = {
  clientCode: "AO-VJD-001",
  name: "Vijay Desai",
  email: "vijay@vjdesai.com",
  broker: "Angel One",
  exchanges: ["NSE", "BSE", "MCX"],
  products: ["DELIVERY", "INTRADAY", "MARGIN"],
};

/** Aggregate Angel One RMS / funds snapshot (mock). */
export const angelFunds: AngelFunds = {
  availableCash: 19_500_000,
  net: 19_500_000,
  utilised: 250_000,
  collateral: 1_200_000,
  payin: 0,
};

/** When the connector last synced (mock). */
export const angelLastSyncedAt = "2026-07-13T09:42:00+05:30";

/**
 * Mock sync log — a mix of successful syncs and one failed sync, so the UI can
 * demonstrate both the success and error states.
 */
export const angelSyncLogs: SyncLogEntry[] = [
  {
    id: "sync_1001",
    connector: "angelone",
    operation: "profile",
    status: "success",
    startedAt: "2026-07-13T09:42:00+05:30",
    finishedAt: "2026-07-13T09:42:00+05:30",
    recordCount: 1,
    durationMs: 180,
  },
  {
    id: "sync_1002",
    connector: "angelone",
    operation: "holdings",
    status: "success",
    startedAt: "2026-07-13T09:42:01+05:30",
    finishedAt: "2026-07-13T09:42:02+05:30",
    recordCount: 8,
    durationMs: 420,
  },
  {
    id: "sync_1003",
    connector: "angelone",
    operation: "funds",
    status: "success",
    startedAt: "2026-07-13T09:42:02+05:30",
    finishedAt: "2026-07-13T09:42:02+05:30",
    recordCount: 1,
    durationMs: 160,
  },
  {
    id: "sync_1004",
    connector: "angelone",
    operation: "orders",
    status: "success",
    startedAt: "2026-07-13T09:42:03+05:30",
    finishedAt: "2026-07-13T09:42:03+05:30",
    recordCount: 3,
    durationMs: 210,
  },
  {
    id: "sync_1005",
    connector: "angelone",
    operation: "positions",
    status: "error",
    startedAt: "2026-07-13T09:42:04+05:30",
    finishedAt: "2026-07-13T09:42:19+05:30",
    recordCount: 0,
    durationMs: 15000,
    error:
      "AB1004: Re-authentication required for Desai Family HUF (AO-HUF-004). The broker session expired; a fresh login is needed to resume sync.",
  },
];
