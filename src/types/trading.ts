// Trading domain types. Defined for the SaaS-ready roadmap (future controlled
// trading). No trading is executed in this build.

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type OrderValidity = "day" | "ioc" | "gtc";
export type OrderStatus =
  | "draft"
  | "pending_approval"
  | "placed"
  | "partially_filled"
  | "executed"
  | "rejected"
  | "cancelled";

export interface Order {
  id: string;
  tenantId: string;
  brokerAccountId: string;
  memberId?: string;
  symbol: string;
  exchange?: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  limitPrice?: number;
  validity: OrderValidity;
  status: OrderStatus;
  placedAt: string;
  updatedAt?: string;
  /** Controlled trading requires an approval before an order is placed. */
  approvalId?: string;
}

export type TradeSide = OrderSide;

export interface Trade {
  id: string;
  tenantId: string;
  orderId: string;
  brokerAccountId: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  value: number;
  charges: number;
  tradedAt: string;
}
