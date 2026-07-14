import type { Express } from "express";
import type { Env } from "../config/env";
import type { BrokerConnector } from "../connectors/types";
import { healthRouter } from "./health";
import { brokerRouter } from "./broker";
import { tenantContext } from "../middleware/tenant";
import { rateLimitPlaceholder } from "../middleware/rateLimit";

export function mountRoutes(
  app: Express,
  env: Env,
  connector: BrokerConnector,
  startedAt: number,
): void {
  // Public health check (no tenant required).
  app.use("/health", healthRouter(env, startedAt));

  // Tenant-aware, rate-limited broker API.
  app.use(
    "/api/v1/broker",
    tenantContext,
    rateLimitPlaceholder,
    brokerRouter(env, connector),
  );
}
