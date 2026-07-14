// Rate limit PLACEHOLDER. A simple in-memory fixed-window counter per
// tenant/IP. Replace with a shared, Redis-backed limiter
// (e.g. rate-limiter-flexible) before production / multi-instance deploys.

import type { Request, Response, NextFunction } from "express";
import { RateLimitError } from "../errors";
import { logger } from "../lib/logger";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitPlaceholder(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const key = req.tenantId ?? req.ip ?? "anonymous";
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    logger.warn("ratelimit.exceeded", { key });
    next(new RateLimitError());
    return;
  }
  next();
}
