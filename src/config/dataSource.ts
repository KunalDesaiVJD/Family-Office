// Mock / live data-source switch. Connectors read this to decide whether to
// serve mock data or route to (not-yet-implemented) live integrations.

export type DataSource = "mock" | "live";

/**
 * Active data source. Defaults to "mock". Set NEXT_PUBLIC_DATA_SOURCE=live to
 * switch connectors to their live placeholders (which are not implemented yet).
 */
export const DATA_SOURCE: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "live" ? "live" : "mock";

export const isMockDataSource = (): boolean => DATA_SOURCE === "mock";
export const isLiveDataSource = (): boolean => DATA_SOURCE === "live";
