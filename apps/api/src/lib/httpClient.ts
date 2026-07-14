// Thin fetch wrapper with a timeout and consistent error mapping. Uses the Node
// global fetch (Node 18+).

import { ConnectorError } from "../errors";

export interface HttpOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export async function httpJson<T = unknown>(
  url: string,
  options: HttpOptions = {},
): Promise<T> {
  const { method = "GET", headers = {}, body, timeoutMs = 15000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }
    if (!res.ok) {
      throw new ConnectorError(`Upstream request failed (${res.status})`, {
        status: res.status,
        body: parsed,
      });
    }
    return parsed as T;
  } catch (err) {
    if (err instanceof ConnectorError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ConnectorError("Upstream request timed out", { url });
    }
    throw new ConnectorError("Upstream request error", {
      message: (err as Error).message,
    });
  } finally {
    clearTimeout(timer);
  }
}
