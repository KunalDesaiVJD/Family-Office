import type {
  AngelAccount,
  AngelHolding,
  AngelOrder,
  AngelTrade,
  AngelPosition,
  AngelLedgerEntry,
  AngelSyncRun,
  SyncLogEntry,
} from "@/types/angel";
import { TENANT_ID } from "./tenant";

// Multi-account Angel One mock data for the V J Desai Family. Read-only, mock
// only — no live API, no credentials. Client codes are illustrative and are
// always masked on display.

export const angelAccounts: AngelAccount[] = [
  {
    id: "aac_father",
    tenantId: TENANT_ID,
    memberId: "mem_father",
    memberName: "Vijay Desai",
    relationship: "Father",
    clientCode: "A57231089",
    broker: "Angel One",
    authStatus: "authenticated",
    syncStatus: "synced",
    lastSyncedAt: "2026-07-13T09:42:00+05:30",
    summary: {
      holdingsCount: 6,
      holdingsValue: 182_000_000,
      dayChangePct: 0.62,
      availableCash: 9_000_000,
      net: 9_000_000,
      utilised: 120_000,
    },
  },
  {
    id: "aac_self",
    tenantId: TENANT_ID,
    memberId: "mem_self",
    memberName: "Kunal Desai",
    relationship: "Self",
    clientCode: "A57230144",
    broker: "Angel One",
    authStatus: "authenticated",
    syncStatus: "synced",
    lastSyncedAt: "2026-07-13T09:42:00+05:30",
    summary: {
      holdingsCount: 5,
      holdingsValue: 96_000_000,
      dayChangePct: 0.48,
      availableCash: 6_500_000,
      net: 6_500_000,
      utilised: 0,
    },
  },
  {
    // Other family account — currently in a failed / re-auth state (partial
    // failure scenario). Also stands in as the "other family" placeholder.
    id: "aac_huf",
    tenantId: TENANT_ID,
    memberId: "mem_huf",
    memberName: "Desai Family HUF",
    relationship: "HUF",
    clientCode: "A57235521",
    broker: "Angel One",
    authStatus: "auth_required",
    syncStatus: "error",
    lastSyncedAt: "2026-07-12T17:55:00+05:30",
    summary: {
      holdingsCount: 3,
      holdingsValue: 33_000_000,
      dayChangePct: 0,
      availableCash: 1_800_000,
      net: 1_800_000,
      utilised: 0,
    },
    error:
      "AB1004: Re-authentication required. The broker session expired — a fresh login is needed to resume sync.",
  },
];

export const angelHoldings: AngelHolding[] = [
  { account: "Vijay Desai", symbol: "RELIANCE", name: "Reliance Industries", quantity: 34_000, avgPrice: 2_450, ltp: 2_980, value: 101_320_000, dayChangePct: 0.82, sector: "Energy" },
  { account: "Vijay Desai", symbol: "HDFCBANK", name: "HDFC Bank", quantity: 42_000, avgPrice: 1_520, ltp: 1_685, value: 70_770_000, dayChangePct: 0.34, sector: "Financials" },
  { account: "Vijay Desai", symbol: "LT", name: "Larsen & Toubro", quantity: 13_500, avgPrice: 2_200, ltp: 3_560, value: 48_060_000, dayChangePct: 1.24, sector: "Industrials" },
  { account: "Kunal Desai", symbol: "INFY", name: "Infosys", quantity: 36_000, avgPrice: 1_310, ltp: 1_560, value: 56_160_000, dayChangePct: -0.45, sector: "Information Technology" },
  { account: "Kunal Desai", symbol: "TCS", name: "Tata Consultancy Services", quantity: 11_000, avgPrice: 3_300, ltp: 3_890, value: 42_790_000, dayChangePct: 0.12, sector: "Information Technology" },
  { account: "Kunal Desai", symbol: "RELIANCE", name: "Reliance Industries", quantity: 8_000, avgPrice: 2_600, ltp: 2_980, value: 23_840_000, dayChangePct: 0.82, sector: "Energy" },
  { account: "Desai Family HUF", symbol: "ICICIBANK", name: "ICICI Bank", quantity: 30_000, avgPrice: 890, ltp: 1_180, value: 35_400_000, dayChangePct: 0.98, sector: "Financials" },
  { account: "Desai Family HUF", symbol: "SUNPHARMA", name: "Sun Pharmaceutical", quantity: 16_000, avgPrice: 950, ltp: 1_620, value: 25_920_000, dayChangePct: 0.25, sector: "Healthcare" },
];

export const angelOrders: AngelOrder[] = [
  { id: "ord_1", account: "Vijay Desai", symbol: "RELIANCE", side: "BUY", orderType: "MARKET", quantity: 100, price: 2_980, status: "COMPLETE", time: "2026-07-13T09:20:00+05:30" },
  { id: "ord_2", account: "Kunal Desai", symbol: "INFY", side: "SELL", orderType: "LIMIT", quantity: 200, price: 1_560, status: "COMPLETE", time: "2026-07-13T09:24:00+05:30" },
  { id: "ord_3", account: "Vijay Desai", symbol: "LT", side: "BUY", orderType: "LIMIT", quantity: 50, price: 3_550, status: "OPEN", time: "2026-07-13T09:31:00+05:30" },
  { id: "ord_4", account: "Kunal Desai", symbol: "TCS", side: "BUY", orderType: "MARKET", quantity: 20, price: 3_890, status: "COMPLETE", time: "2026-07-13T09:35:00+05:30" },
  { id: "ord_5", account: "Desai Family HUF", symbol: "ICICIBANK", side: "BUY", orderType: "MARKET", quantity: 300, price: 1_180, status: "REJECTED", time: "2026-07-13T09:38:00+05:30" },
];

export const angelTrades: AngelTrade[] = [
  { id: "trd_1", account: "Vijay Desai", symbol: "RELIANCE", side: "BUY", quantity: 100, price: 2_980, value: 298_000, time: "2026-07-13T09:20:02+05:30" },
  { id: "trd_2", account: "Kunal Desai", symbol: "INFY", side: "SELL", quantity: 200, price: 1_560, value: 312_000, time: "2026-07-13T09:24:03+05:30" },
  { id: "trd_3", account: "Kunal Desai", symbol: "TCS", side: "BUY", quantity: 20, price: 3_890, value: 77_800, time: "2026-07-13T09:35:01+05:30" },
  { id: "trd_4", account: "Vijay Desai", symbol: "HDFCBANK", side: "BUY", quantity: 150, price: 1_685, value: 252_750, time: "2026-07-12T14:10:00+05:30" },
];

export const angelPositions: AngelPosition[] = [
  { account: "Vijay Desai", symbol: "RELIANCE", product: "DELIVERY", netQty: 34_000, avgPrice: 2_450, ltp: 2_980, pnl: 18_020_000 },
  { account: "Kunal Desai", symbol: "INFY", product: "DELIVERY", netQty: 36_000, avgPrice: 1_310, ltp: 1_560, pnl: 9_000_000 },
  { account: "Kunal Desai", symbol: "TCS", product: "INTRADAY", netQty: 500, avgPrice: 3_850, ltp: 3_890, pnl: 20_000 },
  { account: "Desai Family HUF", symbol: "ICICIBANK", product: "DELIVERY", netQty: 30_000, avgPrice: 890, ltp: 1_180, pnl: 8_700_000 },
];

export const angelLedger: AngelLedgerEntry[] = [
  { account: "Vijay Desai", date: "2026-06-30", particulars: "Dividend — Reliance Industries", voucher: "RECEIPT", debit: 0, credit: 250_000, balance: 9_000_000 },
  { account: "Vijay Desai", date: "2026-06-25", particulars: "Fund pay-in (UPI)", voucher: "RECEIPT", debit: 0, credit: 5_000_000, balance: 8_750_000 },
  { account: "Vijay Desai", date: "2026-06-15", particulars: "Securities transaction tax", voucher: "PAYMENT", debit: 4_200, credit: 0, balance: 3_750_000 },
  { account: "Kunal Desai", date: "2026-06-28", particulars: "Brokerage & statutory charges", voucher: "PAYMENT", debit: 12_000, credit: 0, balance: 6_500_000 },
  { account: "Kunal Desai", date: "2026-06-20", particulars: "Fund payout", voucher: "PAYMENT", debit: 2_000_000, credit: 0, balance: 6_512_000 },
  { account: "Desai Family HUF", date: "2026-06-18", particulars: "Dividend — ICICI Bank", voucher: "RECEIPT", debit: 0, credit: 90_000, balance: 1_800_000 },
];

/** Last multi-account sync run — a partial failure (2 of 3 succeeded). */
export const angelSyncRun: AngelSyncRun = {
  startedAt: "2026-07-13T09:42:00+05:30",
  finishedAt: "2026-07-13T09:42:19+05:30",
  total: 3,
  succeeded: 2,
  failed: 1,
  status: "partial",
};

/** Per-account sync log for the last run. */
export const angelAccountSyncLogs: SyncLogEntry[] = [
  { id: "asl_1", connector: "angelone", account: "Vijay Desai", operation: "full sync", status: "success", startedAt: "2026-07-13T09:42:00+05:30", finishedAt: "2026-07-13T09:42:02+05:30", recordCount: 14, durationMs: 620 },
  { id: "asl_2", connector: "angelone", account: "Kunal Desai", operation: "full sync", status: "success", startedAt: "2026-07-13T09:42:02+05:30", finishedAt: "2026-07-13T09:42:03+05:30", recordCount: 11, durationMs: 540 },
  { id: "asl_3", connector: "angelone", account: "Desai Family HUF", operation: "full sync", status: "error", startedAt: "2026-07-13T09:42:04+05:30", finishedAt: "2026-07-13T09:42:19+05:30", recordCount: 0, durationMs: 15000, error: "AB1004: Re-authentication required — the broker session expired." },
];
