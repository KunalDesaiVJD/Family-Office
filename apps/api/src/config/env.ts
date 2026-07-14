// Secure environment configuration. Secrets live only in the environment and
// are NEVER logged or returned to the frontend.

export interface AngelConfig {
  baseUrl: string;
  apiKey: string;
  clientCode: string;
  readOnlyMode: boolean;
  /** True only when base URL + API key + client code are all present. */
  configured: boolean;
}

export interface Env {
  nodeEnv: string;
  port: number;
  frontendUrls: string[];
  internalApiKey: string;
  angel: AngelConfig;
}

function parseOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadEnv(): Env {
  const baseUrl = process.env.ANGEL_API_BASE_URL ?? "";
  const apiKey = process.env.ANGEL_API_KEY ?? "";
  const clientCode = process.env.ANGEL_CLIENT_CODE ?? "";
  // Read-only by default; only an explicit "false" disables it.
  const readOnlyMode =
    (process.env.ANGEL_READ_ONLY_MODE ?? "true").toLowerCase() !== "false";

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 8080),
    frontendUrls: parseOrigins(
      process.env.FRONTEND_URL ?? "http://localhost:3000",
    ),
    internalApiKey: process.env.INTERNAL_API_KEY ?? "",
    angel: {
      baseUrl,
      apiKey,
      clientCode,
      readOnlyMode,
      configured: Boolean(baseUrl && apiKey && clientCode),
    },
  };
}

/** A frontend-safe view of config. NEVER includes secrets. */
export function publicConfig(env: Env) {
  return {
    readOnlyMode: env.angel.readOnlyMode,
    angelConfigured: env.angel.configured,
    tradingEnabled: false,
  };
}
