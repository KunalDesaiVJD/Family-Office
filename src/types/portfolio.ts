// Portfolio domain types: listed holdings, mutual funds, aggregates.
// There is intentionally no BankAccount type — bank aggregation is out of scope.

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

export interface NetWorthPoint {
  period: string;
  value: number;
}

export interface AllocationSlice {
  label: string;
  value: number;
  color: string;
}
