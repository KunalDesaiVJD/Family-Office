// CORS locked to the configured frontend origin(s) only.

import cors from "cors";
import type { RequestHandler } from "express";
import type { Env } from "../config/env";

export function corsMiddleware(env: Env): RequestHandler {
  const allowed = new Set(env.frontendUrls);
  return cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin requests (no Origin header) and the
      // whitelisted frontend origin(s) only.
      if (!origin || allowed.has(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id", "X-Internal-Key"],
    credentials: true,
  });
}
