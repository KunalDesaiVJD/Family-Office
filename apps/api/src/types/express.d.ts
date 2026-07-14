// Augment Express Request with our per-request fields.
import "express";

declare module "express-serve-static-core" {
  interface Request {
    tenantId?: string;
    requestId?: string;
  }
}
