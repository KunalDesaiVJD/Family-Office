// Environment-based connector status. Reads DATA_SOURCE (NEXT_PUBLIC_DATA_SOURCE)
// and reports whether the app is serving mock data or is bound to the live
// Angel One connector. No live API is called and no credentials are read here.

import { DATA_SOURCE } from "@/config/dataSource";
import { angelLastSyncedAt } from "@/data/mockAngel";
import type { ConnectorHealth } from "@/types/angel";

/**
 * The live Angel One connector requires backend credentials that are NOT yet
 * provisioned, so it is treated as "not configured" in this build. When the
 * backend is wired up this will be derived from the backend /health response.
 */
export const ANGEL_LIVE_CONFIGURED = false;

export function getConnectorHealth(): ConnectorHealth {
  const mode = DATA_SOURCE; // "mock" | "live"
  const configured = ANGEL_LIVE_CONFIGURED;
  const base = {
    connector: "Angel One",
    mode,
    configured,
    readOnly: true,
    tradingEnabled: false,
    baseUrlConfigured: configured,
    lastCheckedAt: angelLastSyncedAt,
  } as const;

  if (mode === "live" && !configured) {
    return {
      ...base,
      state: "live_unconfigured",
      label: "Live · not configured",
      tone: "warning",
      message:
        "The live Angel One connector is selected but not configured. Sample data is shown until backend credentials are provisioned.",
    };
  }

  if (mode === "live") {
    return {
      ...base,
      state: "live",
      label: "Live",
      tone: "success",
      message: "Connected to the live Angel One connector (read-only).",
    };
  }

  return {
    ...base,
    state: "mocked",
    label: "Mock data",
    tone: "info",
    message:
      "Serving mock data. The live Angel One connector is not configured yet.",
  };
}

/** True when a professional "not configured" warning should be surfaced. */
export function isLiveUnconfigured(health: ConnectorHealth): boolean {
  return health.state === "live_unconfigured";
}
