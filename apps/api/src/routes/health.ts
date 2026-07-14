import { Router } from "express";
import type { Env } from "../config/env";
import { publicConfig } from "../config/env";

export function healthRouter(env: Env, startedAt: number): Router {
  const router = Router();
  router.get("/", (_req, res) => {
    res.json({
      status: "ok",
      service: "@family-wealth-os/api",
      version: "0.1.0",
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
      ...publicConfig(env),
    });
  });
  return router;
}
