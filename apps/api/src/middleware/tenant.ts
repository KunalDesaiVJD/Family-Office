// Tenant-aware request structure: require an X-Tenant-Id header and stamp a
// request id onto every request.

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { BadRequestError } from "../errors";

export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  const tenantId = req.header("X-Tenant-Id");
  if (!tenantId) {
    next(new BadRequestError("Missing X-Tenant-Id header"));
    return;
  }
  req.tenantId = tenantId;
  next();
}
