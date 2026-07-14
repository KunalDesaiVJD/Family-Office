// Angel One (SmartAPI) connector — READ-ONLY. Trading is disabled: placeOrder /
// modifyOrder / cancelOrder are placeholders that always throw.
//
// Security:
// - Never stores the login PIN/MPIN, OTP or TOTP secret. authenticate() takes
//   them transiently and discards them after the token exchange.
// - Only the resulting short-lived session tokens are returned to the caller
//   (held server-side in sessionStore) — never sent to the browser.
// - The API key is read from the environment and sent only to Angel.

import type { AngelConfig } from "../config/env";
import { httpJson } from "../lib/httpClient";
import {
  AppError,
  NotConfiguredError,
  SessionRequiredError,
  TradingDisabledError,
} from "../errors";
import type {
  AuthenticateInput,
  BrokerConnector,
  BrokerProfile,
  BrokerSession,
  FundsSnapshot,
  HoldingItem,
  LedgerItem,
  OrderItem,
  PositionItem,
  RefreshInput,
  RequestContext,
  SymbolMasterItem,
  TradeItem,
} from "./types";

// Angel requires these headers on every call. Local IP / MAC are placeholders
// accepted for read-only usage; a host may override them.
const ANGEL_HEADERS_BASE: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-UserType": "USER",
  "X-SourceID": "WEB",
  "X-ClientLocalIP": "127.0.0.1",
  "X-ClientPublicIP": "127.0.0.1",
  "X-MACAddress": "00:00:00:00:00:00",
};

const SYMBOL_MASTER_URL =
  "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export class AngelOneConnector implements BrokerConnector {
  readonly name = "angelone";
  readonly readOnly: boolean;
  readonly tradingEnabled = false;

  constructor(private readonly config: AngelConfig) {
    this.readOnly = config.readOnlyMode;
  }

  // --- helpers -----------------------------------------------------------

  private assertConfigured(): void {
    if (!this.config.configured) {
      throw new NotConfiguredError(
        "Angel One connector is not configured (set ANGEL_API_BASE_URL, ANGEL_API_KEY, ANGEL_CLIENT_CODE).",
      );
    }
  }

  private requireSession(ctx: RequestContext): BrokerSession {
    if (!ctx.session) throw new SessionRequiredError();
    return ctx.session;
  }

  private baseHeaders(): Record<string, string> {
    return { ...ANGEL_HEADERS_BASE, "X-PrivateKey": this.config.apiKey };
  }

  private securedHeaders(session: BrokerSession): Record<string, string> {
    return {
      ...this.baseHeaders(),
      Authorization: `Bearer ${session.jwtToken}`,
    };
  }

  private url(path: string): string {
    return `${this.config.baseUrl.replace(/\/$/, "")}${path}`;
  }

  // --- session -----------------------------------------------------------

  async authenticate(input: AuthenticateInput): Promise<BrokerSession> {
    this.assertConfigured();
    const res = await httpJson<{ data?: Record<string, string> }>(
      this.url("/rest/auth/angelbroking/user/v1/loginByPassword"),
      {
        method: "POST",
        headers: this.baseHeaders(),
        // password (MPIN) and totp are transient — used here and never stored.
        body: JSON.stringify({
          clientcode: input.clientCode,
          password: input.password,
          totp: input.totp,
        }),
      },
    );
    const data = res.data ?? {};
    return {
      clientCode: input.clientCode,
      jwtToken: data.jwtToken ?? "",
      refreshToken: data.refreshToken ?? "",
      feedToken: data.feedToken,
      issuedAt: new Date().toISOString(),
    };
  }

  async refreshSession(input: RefreshInput): Promise<BrokerSession> {
    this.assertConfigured();
    const res = await httpJson<{ data?: Record<string, string> }>(
      this.url("/rest/auth/angelbroking/jwt/v1/generateTokens"),
      {
        method: "POST",
        headers: this.baseHeaders(),
        body: JSON.stringify({ refreshToken: input.refreshToken }),
      },
    );
    const data = res.data ?? {};
    return {
      clientCode: this.config.clientCode,
      jwtToken: data.jwtToken ?? "",
      refreshToken: data.refreshToken ?? input.refreshToken,
      feedToken: data.feedToken,
      issuedAt: new Date().toISOString(),
    };
  }

  async logout(ctx: RequestContext): Promise<void> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    await httpJson(this.url("/rest/secure/angelbroking/user/v1/logout"), {
      method: "POST",
      headers: this.securedHeaders(session),
      body: JSON.stringify({ clientcode: this.config.clientCode }),
    });
  }

  // --- read-only ---------------------------------------------------------

  async getProfile(ctx: RequestContext): Promise<BrokerProfile> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    const res = await httpJson<{ data?: Record<string, string> }>(
      this.url("/rest/secure/angelbroking/user/v1/getProfile"),
      { method: "GET", headers: this.securedHeaders(session) },
    );
    const data = res.data ?? {};
    return {
      clientCode: data.clientcode ?? this.config.clientCode,
      name: data.name,
      email: data.email,
      broker: "Angel One",
    };
  }

  async getFunds(ctx: RequestContext): Promise<FundsSnapshot> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    const res = await httpJson<{ data?: Record<string, unknown> }>(
      this.url("/rest/secure/angelbroking/user/v1/getRMS"),
      { method: "GET", headers: this.securedHeaders(session) },
    );
    const data = res.data ?? {};
    return {
      availableCash: num(data.availablecash),
      net: num(data.net),
    };
  }

  async getHoldings(ctx: RequestContext): Promise<HoldingItem[]> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    const res = await httpJson<{ data?: unknown }>(
      this.url("/rest/secure/angelbroking/portfolio/v1/getAllHolding"),
      { method: "GET", headers: this.securedHeaders(session) },
    );
    const rows = normaliseRows(res.data);
    return rows.map((h) => ({
      symbol: String(h.tradingsymbol ?? h.symbol ?? ""),
      isin: h.isin ? String(h.isin) : undefined,
      quantity: num(h.quantity),
      avgPrice: num(h.averageprice),
      ltp: num(h.ltp),
      value: num(h.quantity) * num(h.ltp),
    }));
  }

  async getPositions(ctx: RequestContext): Promise<PositionItem[]> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    const res = await httpJson<{ data?: unknown }>(
      this.url("/rest/secure/angelbroking/order/v1/getPosition"),
      { method: "GET", headers: this.securedHeaders(session) },
    );
    const rows = normaliseRows(res.data);
    return rows.map((p) => ({
      symbol: String(p.tradingsymbol ?? ""),
      netQty: num(p.netqty),
      avgPrice: num(p.avgnetprice ?? p.netprice),
      ltp: num(p.ltp),
      pnl: num(p.pnl),
    }));
  }

  async getOrders(ctx: RequestContext): Promise<OrderItem[]> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    const res = await httpJson<{ data?: unknown }>(
      this.url("/rest/secure/angelbroking/order/v1/getOrderBook"),
      { method: "GET", headers: this.securedHeaders(session) },
    );
    const rows = normaliseRows(res.data);
    return rows.map((o) => ({
      orderId: String(o.orderid ?? ""),
      symbol: String(o.tradingsymbol ?? ""),
      side: String(o.transactiontype ?? ""),
      status: String(o.status ?? o.orderstatus ?? ""),
      quantity: num(o.quantity),
      price: num(o.price),
    }));
  }

  async getTrades(ctx: RequestContext): Promise<TradeItem[]> {
    this.assertConfigured();
    const session = this.requireSession(ctx);
    const res = await httpJson<{ data?: unknown }>(
      this.url("/rest/secure/angelbroking/order/v1/getTradeBook"),
      { method: "GET", headers: this.securedHeaders(session) },
    );
    const rows = normaliseRows(res.data);
    return rows.map((t) => ({
      tradeId: String(t.fillid ?? t.tradeid ?? ""),
      orderId: String(t.orderid ?? ""),
      symbol: String(t.tradingsymbol ?? ""),
      side: String(t.transactiontype ?? ""),
      quantity: num(t.fillsize ?? t.quantity),
      price: num(t.fillprice ?? t.price),
      tradedAt: t.filltime ? String(t.filltime) : undefined,
    }));
  }

  async getLedger(_ctx: RequestContext): Promise<LedgerItem[]> {
    this.assertConfigured();
    // The Angel One SmartAPI does not expose a ledger/statement endpoint in the
    // read-only tier. Wire this to a statement source when one is available.
    throw new AppError(
      "NOT_SUPPORTED",
      "Ledger data is not available via the Angel One SmartAPI read-only endpoints.",
      501,
    );
  }

  async getSymbolMaster(): Promise<SymbolMasterItem[]> {
    // Public reference data — no session required.
    const rows = normaliseRows(await httpJson<unknown>(SYMBOL_MASTER_URL));
    return rows.map((s) => ({
      token: String(s.token ?? ""),
      symbol: String(s.symbol ?? ""),
      name: String(s.name ?? ""),
      exchange: String(s.exch_seg ?? ""),
    }));
  }

  // --- trading: DISABLED -------------------------------------------------

  async placeOrder(_ctx: RequestContext, _input: unknown): Promise<never> {
    throw new TradingDisabledError();
  }

  async modifyOrder(_ctx: RequestContext, _input: unknown): Promise<never> {
    throw new TradingDisabledError();
  }

  async cancelOrder(_ctx: RequestContext, _input: unknown): Promise<never> {
    throw new TradingDisabledError();
  }
}

function normaliseRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  return [];
}
