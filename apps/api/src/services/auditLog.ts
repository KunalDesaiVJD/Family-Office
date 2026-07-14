// Audit log event creation. In-memory for now — persist to the platform DB
// (Prisma AuditLog) when wired. Never records secrets.

import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

export interface AuditEventInput {
  tenantId: string;
  actor: string;
  action: string;
  entity: string;
  detail?: string;
  ipAddress?: string;
}

export interface AuditEvent extends AuditEventInput {
  id: string;
  timestamp: string;
}

const events: AuditEvent[] = [];

export const auditLog = {
  record(input: AuditEventInput): AuditEvent {
    const event: AuditEvent = {
      ...input,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    events.push(event);
    logger.info("audit", {
      id: event.id,
      tenantId: event.tenantId,
      actor: event.actor,
      action: event.action,
      entity: event.entity,
    });
    return event;
  },

  list(tenantId?: string): AuditEvent[] {
    return tenantId ? events.filter((e) => e.tenantId === tenantId) : [...events];
  },
};
