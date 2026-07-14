// Central error handling — maps typed AppErrors to JSON and hides internals.

import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { logger } from "../lib/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error("request.error", {
        code: err.code,
        message: err.message,
        requestId: req.requestId,
      });
    }
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error("request.unhandled", {
    message: (err as Error)?.message,
    requestId: req.requestId,
  });
  res
    .status(500)
    .json({ error: { code: "INTERNAL", message: "Internal server error" } });
}
