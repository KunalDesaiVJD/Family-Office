// Broker connector interface + shared domain types. Implemented by
// AngelOneConnector. Read-only; trading methods are disabled placeholders.

/** Short-lived broker session tokens. Held server-side only, never sent to the
 * browser. The login PIN/MPIN, OTP and TOTP secret are NOT part of this. */
export interface BrokerSession {
  clientCode: string;
  jwtToken: string;
  refreshToken: string;
  feedToken?: string;
  issuedAt: string;
}

/** Per-request context threaded through every connector call. */
export interface RequestContext {
  tenantId: string;
  requestId: string;
  session?: BrokerSession;
}

/** Transient credentials for authenticate() — never stored or logged. */
export interface AuthenticateInput {
  clientCode: string;
  /** MPIN / password — transient. */
  password: string;
  /** One-time TOTP code — transient. */
  totp: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface BrokerProfile {
  clientCode: string;
  name?: string;
  email?: string;
  broker: string;
}

export interface HoldingItem {
  symbol: string;
  isin?: string;
  quantity: number;
  avgPrice: number;
  ltp: number;
  value: number;
}

export interface FundsSnapshot {
  availableCash: number;
  net: number;
}

export interface PositionItem {
  symbol: string;
  netQty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
}

export interface OrderItem {
  orderId: string;
  symbol: string;
  side: string;
  status: string;
  quantity: number;
  price: number;
}

export interface TradeItem {
  tradeId: string;
  orderId: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  tradedAt?: string;
}

export interface LedgerItem {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface SymbolMasterItem {
  token: string;
  symbol: string;
  name: string;
  exchange: string;
}

export interface BrokerConnector {
  readonly name: string;
  readonly readOnly: boolean;
  readonly tradingEnabled: boolean;

  // --- Session ---
  authenticate(input: AuthenticateInput): Promise<BrokerSession>;
  refreshSession(input: RefreshInput): Promise<BrokerSession>;
  logout(ctx: RequestContext): Promise<void>;

  // --- Read-only ---
  getProfile(ctx: RequestContext): Promise<BrokerProfile>;
  getHoldings(ctx: RequestContext): Promise<HoldingItem[]>;
  getFunds(ctx: RequestContext): Promise<FundsSnapshot>;
  getPositions(ctx: RequestContext): Promise<PositionItem[]>;
  getOrders(ctx: RequestContext): Promise<OrderItem[]>;
  getTrades(ctx: RequestContext): Promise<TradeItem[]>;
  getLedger(ctx: RequestContext): Promise<LedgerItem[]>;
  getSymbolMaster(): Promise<SymbolMasterItem[]>;

  // --- Trading: DISABLED placeholders (always error) ---
  placeOrder(ctx: RequestContext, input: unknown): Promise<never>;
  modifyOrder(ctx: RequestContext, input: unknown): Promise<never>;
  cancelOrder(ctx: RequestContext, input: unknown): Promise<never>;
}
