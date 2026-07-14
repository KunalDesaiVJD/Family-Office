import express from "express";
import type { Express } from "express";
import type { Env } from "./config/env";
import type { BrokerConnector } from "./connectors/types";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { mountRoutes } from "./routes";
import { logger } from "./lib/logger";

export function createServer(env: Env, connector: BrokerConnector): Express {
  const app = express();
  const startedAt = Date.now();

  app.disable("x-powered-by");

  // Minimal security headers.
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  app.use(corsMiddleware(env));
  app.use(express.json({ limit: "1mb" }));

  mountRoutes(app, env, connector, startedAt);

  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info("server.configured", {
    readOnlyMode: env.angel.readOnlyMode,
    angelConfigured: env.angel.configured,
    tradingEnabled: false,
    allowedOrigins: env.frontendUrls,
  });

  return app;
}
