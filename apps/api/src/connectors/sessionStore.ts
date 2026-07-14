// In-memory broker session cache, keyed by tenantId.
//
// PLACEHOLDER: replace with a server-side secure cache (e.g. Redis with TTL) in
// production. Sessions are held ONLY on the backend and are never returned to
// the browser. Only short-lived tokens live here — no PIN/OTP/TOTP.

import type { BrokerSession } from "./types";

const store = new Map<string, BrokerSession>();

export const sessionStore = {
  get(tenantId: string): BrokerSession | undefined {
    return store.get(tenantId);
  },
  set(tenantId: string, session: BrokerSession): void {
    store.set(tenantId, session);
  },
  clear(tenantId: string): void {
    store.delete(tenantId);
  },
  has(tenantId: string): boolean {
    return store.has(tenantId);
  },
};
