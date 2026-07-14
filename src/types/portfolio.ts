// Portfolio domain types: listed holdings, mutual funds, bank accounts, aggregates.

import type { ConnectionStatus } from "./broker";

export interface Holding {
  id: string;
  tenantId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  ltp: number;
  value: number;
  dayChangePct: number;
  sector: string;
}

/** Alias for a consolidated portfolio holding. */
export type PortfolioHolding = Holding;

export type FundCategory =
  | "equity"
  | "debt"
  | "hybrid"
  | "liquid"
  | "index"
  | "elss";

export interface MutualFundFolio {
  id: string;
  tenantId: string;
  memberId: string;
  ownerName: string;
  amc: string;
  scheme: string;
  folioNo: string;
  category: FundCategory;
  units: number;
  nav: number;
  invested: number;
  currentValue: number;
  xirr: number;
  /** Distribution platform / ARN holder the folio is transacted through. */
  distributor: string;
}

export type BankAccountType = "savings" | "current" | "fd" | "nre" | "nro";

export interface BankAccount {
  id: string;
  tenantId: string;
  entityId: string;
  holderName: string;
  bank: string;
  accountType: BankAccountType;
  maskedNumber: string;
  balance: number;
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string;
}

export interface NetWorthPoint {
  period: string;
  value: number;
}

export interface AllocationSlice {
  label: string;
  value: number;
  color: string;
}
