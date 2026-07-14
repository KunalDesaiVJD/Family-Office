import { TENANT_ID } from "./tenant";
import {
  detectDuplicates,
  validateImportedTrade,
} from "@/lib/portfolio/tradeNormalizer";
import type {
  ContractNoteLink,
  ImportedTrade,
  PriceMap,
  TradeImportBatch,
  TradeImportRow,
} from "@/lib/portfolio/types";

// ---------------------------------------------------------------------------
// MOCK ONLY. Illustrative trade history for the V J Desai Family. No real
// client codes, PANs, contract notes or amounts. Client codes are pre-masked
// (ANG****NNNN). Replaced by live Angel API / imported statements later.
// ---------------------------------------------------------------------------

/** Mock family accounts. accountOwner labels stay generic & SaaS-ready. */
export const MOCK_ACCOUNTS = {
  father: {
    familyMemberId: "mem_father",
    accountOwner: "Father",
    panId: "pan_father",
    brokerAccountId: "bacc_father",
    dematAccountId: "dmt_father",
    clientCode: "ANG****1234",
  },
  self: {
    familyMemberId: "mem_self",
    accountOwner: "Self",
    panId: "pan_self",
    brokerAccountId: "bacc_self",
    dematAccountId: "dmt_self",
    clientCode: "ANG****5678",
  },
  familyMember3: {
    familyMemberId: "mem_fm3",
    accountOwner: "Family Member 3",
    panId: "pan_fm3",
    brokerAccountId: "bacc_fm3",
    dematAccountId: "dmt_fm3",
    clientCode: "ANG****9012",
  },
} as const;

/** Illustrative ISINs for fake-but-realistic Indian listed equity. */
export const MOCK_ISINS = {
  RELIANCE: "INE002A01018",
  HDFCBANK: "INE040A01034",
  INFY: "INE009A01021",
  TCS: "INE467B01029",
  ICICIBANK: "INE090A01021",
  ITC: "INE154A01025",
  SUNPHARMA: "INE044A01036",
} as const;

type Acct = (typeof MOCK_ACCOUNTS)[keyof typeof MOCK_ACCOUNTS];

interface TradeSeed {
  acct: Acct;
  tradeId: string;
  orderId: string;
  dt: string;
  symbol: keyof typeof MOCK_ISINS;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  charges?: number;
  contractNoteNumber?: string;
}

function seedToImported(s: TradeSeed): ImportedTrade {
  const gross = s.qty * s.price;
  // Split a single "charges" figure across the statutory buckets, roughly the
  // shape of an Indian equity contract note. Mock only.
  const c = s.charges ?? Math.max(20, Math.round(gross * 0.0006));
  return {
    tenantId: TENANT_ID,
    familyMemberId: s.acct.familyMemberId,
    panId: s.acct.panId,
    brokerAccountId: s.acct.brokerAccountId,
    dematAccountId: s.acct.dematAccountId,
    clientCode: s.acct.clientCode,
    accountOwner: s.acct.accountOwner,
    tradeDateTime: s.dt,
    tradeDate: s.dt.slice(0, 10),
    orderId: s.orderId,
    tradeId: s.tradeId,
    exchange: "NSE",
    tradingSymbol: s.symbol,
    symbolToken: undefined,
    isin: MOCK_ISINS[s.symbol],
    buySell: s.side,
    productType: "DELIVERY",
    quantity: s.qty,
    price: s.price,
    grossAmount: gross,
    brokerage: Math.round(c * 0.5),
    stt: Math.round(c * 0.3),
    gst: Math.round(c * 0.1),
    stampDuty: Math.round(c * 0.05),
    exchangeCharges: Math.round(c * 0.04),
    sebiCharges: Math.round(c * 0.01),
    otherCharges: 0,
    settlementNumber: `2026${s.dt.slice(5, 7)}`,
    contractNoteNumber: s.contractNoteNumber,
    source: "mock",
    importBatchId: undefined,
    rawRowReference: s.tradeId,
  };
}

// Canonical, clean trade set that feeds the FIFO ledger. Buys, sells, partial
// sells and a mix of holding periods that produce both STCG and LTCG.
const TRADE_SEEDS: TradeSeed[] = [
  // Father — RELIANCE: buy 100, partial sell 40 (LTCG), 60 remain open.
  { acct: MOCK_ACCOUNTS.father, tradeId: "TRD-F1", orderId: "ORD-F1", dt: "2024-05-10T09:30:00+05:30", symbol: "RELIANCE", side: "BUY", qty: 100, price: 2450, contractNoteNumber: "CN-F-2405" },
  { acct: MOCK_ACCOUNTS.father, tradeId: "TRD-F2", orderId: "ORD-F2", dt: "2026-06-20T10:15:00+05:30", symbol: "RELIANCE", side: "SELL", qty: 40, price: 2980, contractNoteNumber: "CN-F-2606" },
  // Father — HDFCBANK: two buy lots, sell 250 spans both (LTCG + STCG), 100 remain.
  { acct: MOCK_ACCOUNTS.father, tradeId: "TRD-F3", orderId: "ORD-F3", dt: "2025-01-15T11:00:00+05:30", symbol: "HDFCBANK", side: "BUY", qty: 200, price: 1520, contractNoteNumber: "CN-F-2501" },
  { acct: MOCK_ACCOUNTS.father, tradeId: "TRD-F4", orderId: "ORD-F4", dt: "2026-02-01T11:00:00+05:30", symbol: "HDFCBANK", side: "BUY", qty: 150, price: 1600, contractNoteNumber: "CN-F-2602" },
  { acct: MOCK_ACCOUNTS.father, tradeId: "TRD-F5", orderId: "ORD-F5", dt: "2026-06-25T14:00:00+05:30", symbol: "HDFCBANK", side: "SELL", qty: 250, price: 1685, contractNoteNumber: "CN-F-2606" },
  // Self — INFY: buy 300, sell 100 (STCG), 200 remain.
  { acct: MOCK_ACCOUNTS.self, tradeId: "TRD-S1", orderId: "ORD-S1", dt: "2026-01-05T09:45:00+05:30", symbol: "INFY", side: "BUY", qty: 300, price: 1310, contractNoteNumber: "CN-S-2601" },
  { acct: MOCK_ACCOUNTS.self, tradeId: "TRD-S2", orderId: "ORD-S2", dt: "2026-05-10T10:00:00+05:30", symbol: "INFY", side: "SELL", qty: 100, price: 1560, contractNoteNumber: "CN-S-2605" },
  // Self — TCS: buy 50, fully open.
  { acct: MOCK_ACCOUNTS.self, tradeId: "TRD-S3", orderId: "ORD-S3", dt: "2026-03-20T13:00:00+05:30", symbol: "TCS", side: "BUY", qty: 50, price: 3300, contractNoteNumber: "CN-S-2603" },
  // Family Member 3 — ICICIBANK: buy 400, sell 150 (STCG), 250 remain.
  { acct: MOCK_ACCOUNTS.familyMember3, tradeId: "TRD-M1", orderId: "ORD-M1", dt: "2025-08-01T10:30:00+05:30", symbol: "ICICIBANK", side: "BUY", qty: 400, price: 890, contractNoteNumber: "CN-M-2508" },
  { acct: MOCK_ACCOUNTS.familyMember3, tradeId: "TRD-M2", orderId: "ORD-M2", dt: "2026-07-01T11:00:00+05:30", symbol: "ICICIBANK", side: "SELL", qty: 150, price: 1180, contractNoteNumber: "CN-M-2607" },
  // Family Member 3 — ITC: buy 100, fully open, deliberately left unpriced.
  { acct: MOCK_ACCOUNTS.familyMember3, tradeId: "TRD-M3", orderId: "ORD-M3", dt: "2026-06-01T09:50:00+05:30", symbol: "ITC", side: "BUY", qty: 100, price: 410, contractNoteNumber: "CN-M-2606" },
];

/** Canonical imported trades that build the internal FIFO ledger. */
export const mockImportedTrades: ImportedTrade[] = TRADE_SEEDS.map(seedToImported);

/**
 * Latest prices by ISIN. ITC is intentionally absent so the ledger shows a
 * pending-price status and the reconciliation surfaces a PRICE_MISSING item.
 */
export const mockPrices: PriceMap = {
  [MOCK_ISINS.RELIANCE]: 2980,
  [MOCK_ISINS.HDFCBANK]: 1685,
  [MOCK_ISINS.INFY]: 1560,
  [MOCK_ISINS.TCS]: 3890,
  [MOCK_ISINS.ICICIBANK]: 1180,
  // ITC (INE154A01025) omitted on purpose → pending price.
};

/** The single ISIN with no latest price (drives the PRICE_MISSING exception). */
export const UNPRICED_ISIN = MOCK_ISINS.ITC;

// --- Import batches (Trade Import UI) ---------------------------------------

function toImportRows(raws: ImportedTrade[]): TradeImportRow[] {
  const dupes = detectDuplicates(raws);
  return raws.map((raw, i): TradeImportRow => {
    const errors = validateImportedTrade(raw);
    const isDuplicate = dupes.has(raw.rawRowReference ?? raw.tradeId);
    const hasError = errors.some((e) => e.severity === "error");
    return {
      rowNumber: i + 1,
      raw,
      status: isDuplicate ? "duplicate" : hasError ? "invalid" : "valid",
      isDuplicate,
      errors,
    };
  });
}

// Batch 1 — clean successful CSV import (Father's book).
const batch1Rows = toImportRows(
  [TRADE_SEEDS[0], TRADE_SEEDS[1], TRADE_SEEDS[2], TRADE_SEEDS[3]].map(seedToImported),
);

// Batch 2 — validation errors (missing tradeId, zero quantity).
const batch2Raw: ImportedTrade[] = [
  seedToImported(TRADE_SEEDS[5]),
  { ...seedToImported(TRADE_SEEDS[6]), tradeId: "", rawRowReference: "row-2" },
  { ...seedToImported(TRADE_SEEDS[7]), quantity: 0, rawRowReference: "row-3" },
];
const batch2Rows = toImportRows(batch2Raw);

// Batch 3 — duplicate trades (TRD-M1 appears twice).
const batch3Raw: ImportedTrade[] = [
  seedToImported(TRADE_SEEDS[8]),
  { ...seedToImported(TRADE_SEEDS[8]), rawRowReference: "row-2-dup" },
  seedToImported(TRADE_SEEDS[9]),
];
const batch3Rows = toImportRows(batch3Raw);

// Batch 4 — contract-note PDF awaiting manual review (parsing is a placeholder).
const batch4Rows = toImportRows([seedToImported(TRADE_SEEDS[10])]);

const countBy = (rows: TradeImportRow[], status: TradeImportRow["status"]) =>
  rows.filter((r) => r.status === status).length;

export const mockImportBatches: TradeImportBatch[] = [
  {
    id: "imp_batch_1",
    tenantId: TENANT_ID,
    source: "csv_upload",
    fileName: "Angel_Tradebook_FY26_Father.csv",
    uploadedBy: "Operations",
    uploadedAt: "2026-07-10T18:20:00+05:30",
    status: "imported",
    familyMemberId: MOCK_ACCOUNTS.father.familyMemberId,
    familyMemberName: "Father",
    brokerAccountId: MOCK_ACCOUNTS.father.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.father.clientCode,
    financialYear: "FY 2026-27",
    totalRows: batch1Rows.length,
    validRows: countBy(batch1Rows, "valid"),
    invalidRows: countBy(batch1Rows, "invalid"),
    duplicateRows: countBy(batch1Rows, "duplicate"),
    importedRows: countBy(batch1Rows, "valid"),
    rejectedRows: 0,
    rows: batch1Rows,
  },
  {
    id: "imp_batch_2",
    tenantId: TENANT_ID,
    source: "excel_upload",
    fileName: "Self_Trades_Q1_FY27.xlsx",
    uploadedBy: "Operations",
    uploadedAt: "2026-07-11T12:05:00+05:30",
    status: "validated",
    familyMemberId: MOCK_ACCOUNTS.self.familyMemberId,
    familyMemberName: "Self",
    brokerAccountId: MOCK_ACCOUNTS.self.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.self.clientCode,
    financialYear: "FY 2026-27",
    totalRows: batch2Rows.length,
    validRows: countBy(batch2Rows, "valid"),
    invalidRows: countBy(batch2Rows, "invalid"),
    duplicateRows: countBy(batch2Rows, "duplicate"),
    importedRows: 0,
    rejectedRows: countBy(batch2Rows, "invalid"),
    rows: batch2Rows,
  },
  {
    id: "imp_batch_3",
    tenantId: TENANT_ID,
    source: "csv_upload",
    fileName: "FM3_Tradebook_FY27.csv",
    uploadedBy: "Operations",
    uploadedAt: "2026-07-12T09:40:00+05:30",
    status: "awaiting_review",
    familyMemberId: MOCK_ACCOUNTS.familyMember3.familyMemberId,
    familyMemberName: "Family Member 3",
    brokerAccountId: MOCK_ACCOUNTS.familyMember3.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.familyMember3.clientCode,
    financialYear: "FY 2026-27",
    totalRows: batch3Rows.length,
    validRows: countBy(batch3Rows, "valid"),
    invalidRows: countBy(batch3Rows, "invalid"),
    duplicateRows: countBy(batch3Rows, "duplicate"),
    importedRows: 0,
    rejectedRows: 0,
    rows: batch3Rows,
  },
  {
    id: "imp_batch_4",
    tenantId: TENANT_ID,
    source: "contract_note_pdf",
    fileName: "Angel_ContractNotes_June26.pdf",
    uploadedBy: "Operations",
    uploadedAt: "2026-07-13T16:15:00+05:30",
    status: "awaiting_review",
    familyMemberId: MOCK_ACCOUNTS.familyMember3.familyMemberId,
    familyMemberName: "Family Member 3",
    brokerAccountId: MOCK_ACCOUNTS.familyMember3.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.familyMember3.clientCode,
    financialYear: "FY 2026-27",
    totalRows: batch4Rows.length,
    validRows: countBy(batch4Rows, "valid"),
    invalidRows: countBy(batch4Rows, "invalid"),
    duplicateRows: countBy(batch4Rows, "duplicate"),
    importedRows: 0,
    rejectedRows: 0,
    rows: batch4Rows,
  },
];

// --- Contract note links ----------------------------------------------------

export const mockContractNoteLinks: ContractNoteLink[] = [
  {
    id: "cnl_1",
    tenantId: TENANT_ID,
    contractNoteNumber: "CN-F-2606",
    brokerAccountId: MOCK_ACCOUNTS.father.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.father.clientCode,
    tradeDate: "2026-06-25",
    documentId: "doc_cn_f_2606",
    status: "linked",
    tradeIds: ["TRD-F2", "TRD-F5"],
  },
  {
    id: "cnl_2",
    tenantId: TENANT_ID,
    contractNoteNumber: "CN-M-2607",
    brokerAccountId: MOCK_ACCOUNTS.familyMember3.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.familyMember3.clientCode,
    tradeDate: "2026-07-01",
    status: "pending",
    tradeIds: ["TRD-M2"],
  },
  {
    id: "cnl_3",
    tenantId: TENANT_ID,
    contractNoteNumber: "CN-S-2605",
    brokerAccountId: MOCK_ACCOUNTS.self.brokerAccountId,
    clientCode: MOCK_ACCOUNTS.self.clientCode,
    tradeDate: "2026-05-10",
    status: "missing",
    tradeIds: ["TRD-S2"],
  },
];

export const MOCK_DISCLAIMER =
  "Mock data — illustrative only. No real client codes, PANs or amounts.";
