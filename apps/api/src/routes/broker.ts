// Read-only broker routes. All calls run server-side against the connector; the
// browser never talks to the broker directly. Trading routes are disabled.

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";
import type { Env } from "../config/env";
import type { BrokerConnector, RequestContext } from "../connectors/types";
import { sessionStore } from "../connectors/sessionStore";
import { syncLog } from "../services/syncLog";
import { auditLog } from "../services/auditLog";
import {
  BadRequestError,
  ForbiddenError,
  SessionRequiredError,
  TradingDisabledError,
} from "../errors";

/** Constant-time compare for the internal API key (blank expected = disabled). */
function internalKeyValid(provided: string | undefined, expected: string): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function brokerRouter(env: Env, connector: BrokerConnector): Router {
  const router = Router();

  // A read-only handler that wires session + sync log + audit log around a call.
  const readOp =
    (operation: string, run: (ctx: RequestContext) => Promise<unknown>) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const tenantId = req.tenantId as string;
      const requestId = req.requestId as string;
      const ctx: RequestContext = {
        tenantId,
        requestId,
        session: sessionStore.get(tenantId),
      };
      const entry = syncLog.start(tenantId, connector.name, operation);
      try {
        const data = await run(ctx);
        const count = Array.isArray(data) ? data.length : undefined;
        syncLog.complete(entry, count);
        auditLog.record({
          tenantId,
          actor: "backend",
          action: `READ_${operation.toUpperCase().replace(/-/g, "_")}`,
          entity: connector.name,
        });
        res.json({
          data,
          meta: { requestId, connector: connector.name, operation, count },
        });
      } catch (err) {
        syncLog.fail(entry, (err as Error).message);
        next(err);
      }
    };

  // --- read-only ---
  router.get("/profile", readOp("profile", (ctx) => connector.getProfile(ctx)));
  router.get("/holdings", readOp("holdings", (ctx) => connector.getHoldings(ctx)));
  router.get("/funds", readOp("funds", (ctx) => connector.getFunds(ctx)));
  router.get("/positions", readOp("positions", (ctx) => connector.getPositions(ctx)));
  router.get("/orders", readOp("orders", (ctx) => connector.getOrders(ctx)));
  router.get("/trades", readOp("trades", (ctx) => connector.getTrades(ctx)));
  router.get("/ledger", readOp("ledger", (ctx) => connector.getLedger(ctx)));
  router.get("/symbol-master", readOp("symbol-master", () => connector.getSymbolMaster()));

  // --- internal server-side session (never called from the browser) ---
  router.post("/session", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!internalKeyValid(req.header("X-Internal-Key"), env.internalApiKey)) {
        throw new ForbiddenError(
          "Internal session endpoint is disabled or the internal key is invalid",
        );
      }
      const tenantId = req.tenantId as string;
      const body = (req.body ?? {}) as {
        clientCode?: string;
        password?: string;
        totp?: string;
      };
      if (!body.clientCode || !body.password || !body.totp) {
        throw new BadRequestError("clientCode, password and totp are required");
      }
      // Credentials are transient — used to obtain tokens, then discarded.
      const session = await connector.authenticate({
        clientCode: body.clientCode,
        password: body.password,
        totp: body.totp,
      });
      sessionStore.set(tenantId, session);
      auditLog.record({
        tenantId,
        actor: "backend",
        action: "BROKER_AUTHENTICATED",
        entity: connector.name,
      });
      // Never return tokens to the caller.
      res.json({ authenticated: true, clientCode: session.clientCode });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId as string;
      const requestId = req.requestId as string;
      const session = sessionStore.get(tenantId);
      if (!session) throw new SessionRequiredError();
      await connector.logout({ tenantId, requestId, session });
      sessionStore.clear(tenantId);
      auditLog.record({
        tenantId,
        actor: "backend",
        action: "BROKER_LOGOUT",
        entity: connector.name,
      });
      res.json({ loggedOut: true });
    } catch (err) {
      next(err);
    }
  });

  // --- trading: explicitly DISABLED ---
  router.post(
    ["/orders", "/orders/modify", "/orders/cancel"],
    (_req: Request, _res: Response, next: NextFunction) => {
      next(new TradingDisabledError());
    },
  );

  return router;
}
