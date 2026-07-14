import type {
  ImportedTrade,
  NormalizedTrade,
  ProductType,
  TradeValidationError,
  TransactionType,
} from "./types";
import { round2 } from "./util";

function toProductType(value: string | undefined): ProductType {
  const v = (value ?? "DELIVERY").toUpperCase();
  if (v === "INTRADAY") return "INTRADAY";
  if (v === "MARGIN") return "MARGIN";
  if (v === "FNO" || v === "F&O" || v === "FUTURES" || v === "OPTIONS") return "FNO";
  if (v === "DELIVERY" || v === "CNC" || v === "DEL") return "DELIVERY";
  return "OTHER";
}

function toTransactionType(value: string): TransactionType {
  return value.trim().toUpperCase() === "SELL" ? "SELL" : "BUY";
}

function sumCharges(t: ImportedTrade): number {
  return (
    (t.brokerage ?? 0) +
    (t.stt ?? 0) +
    (t.gst ?? 0) +
    (t.stampDuty ?? 0) +
    (t.exchangeCharges ?? 0) +
    (t.sebiCharges ?? 0) +
    (t.otherCharges ?? 0)
  );
}

/** Stable key used for duplicate detection. */
export function duplicateKey(t: {
  tenantId: string;
  clientCode: string;
  orderId: string;
  tradeId: string;
  tradeDateTime: string;
}): string {
  return `${t.tenantId}|${t.clientCode}|${t.orderId}|${t.tradeId}|${t.tradeDateTime}`;
}

/** Returns the set of raw-row references that are duplicates (2nd+ occurrence). */
export function detectDuplicates(rows: ImportedTrade[]): Set<string> {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const r of rows) {
    const key = duplicateKey(r);
    const ref = r.rawRowReference ?? `${r.tradeId}`;
    if (seen.has(key)) dupes.add(ref);
    else seen.add(key);
  }
  return dupes;
}

/** Validation rules for an imported trade. Errors block import; warnings do not. */
export function validateImportedTrade(t: ImportedTrade): TradeValidationError[] {
  const ref = t.rawRowReference ?? t.tradeId ?? "row";
  const errors: TradeValidationError[] = [];
  const err = (field: string, code: string, message: string) =>
    errors.push({ rowReference: ref, field, code, message, severity: "error" });
  const warn = (field: string, code: string, message: string) =>
    errors.push({ rowReference: ref, field, code, message, severity: "warning" });

  if (!t.clientCode) err("clientCode", "REQUIRED", "clientCode is required.");
  if (!t.tradeDateTime) err("tradeDateTime", "REQUIRED", "tradeDateTime is required.");
  if (!t.orderId) err("orderId", "REQUIRED", "orderId is required.");
  if (!t.tradeId) err("tradeId", "REQUIRED", "tradeId is required.");
  if (!t.exchange) err("exchange", "REQUIRED", "exchange is required.");
  if (!t.tradingSymbol) err("tradingSymbol", "REQUIRED", "tradingSymbol is required.");
  if (!t.isin) warn("isin", "PREFERRED", "isin is strongly preferred for reliable matching.");

  const side = (t.buySell ?? "").trim().toUpperCase();
  if (side !== "BUY" && side !== "SELL") {
    err("buySell", "INVALID", "buySell must be BUY or SELL.");
  }
  if (!(Number(t.quantity) > 0)) err("quantity", "INVALID", "quantity must be positive.");
  if (!(Number(t.price) > 0)) err("price", "INVALID", "price must be positive.");

  const calculable = Number(t.quantity) > 0 && Number(t.price) > 0;
  if (t.netAmount === undefined && !calculable) {
    warn("netAmount", "MISSING", "netAmount should be available or calculable.");
  }
  return errors;
}

/**
 * Converts imported/API trades into standard NormalizedTrade format:
 * sorts by tradeDateTime, coerces numeric fields, computes totalCharges and
 * netAmount when absent. Does NOT mutate the input.
 */
export function normalizeTrades(raw: ImportedTrade[]): NormalizedTrade[] {
  const normalized = raw.map((t): NormalizedTrade => {
    const transactionType = toTransactionType(t.buySell);
    const productType = toProductType(t.productType);
    const quantity = Number(t.quantity) || 0;
    const price = Number(t.price) || 0;
    const grossAmount = t.grossAmount ?? round2(quantity * price);
    const totalCharges = round2(sumCharges(t));
    // BUY costs gross + charges; SELL nets gross - charges.
    const netAmount =
      t.netAmount ??
      round2(transactionType === "BUY" ? grossAmount + totalCharges : grossAmount - totalCharges);

    return {
      id: `${t.clientCode}-${t.tradeId}`,
      tenantId: t.tenantId,
      familyMemberId: t.familyMemberId,
      panId: t.panId,
      brokerAccountId: t.brokerAccountId,
      clientCode: t.clientCode,
      accountOwner: t.accountOwner,
      tradeDateTime: t.tradeDateTime,
      settlementDate: t.tradeDate,
      exchange: t.exchange,
      tradingSymbol: t.tradingSymbol,
      isin: t.isin ?? "",
      transactionType,
      productType,
      quantity,
      price,
      grossAmount,
      totalCharges,
      netAmount,
      brokerage: t.brokerage ?? 0,
      stt: t.stt ?? 0,
      gst: t.gst ?? 0,
      stampDuty: t.stampDuty ?? 0,
      exchangeCharges: t.exchangeCharges ?? 0,
      sebiCharges: t.sebiCharges ?? 0,
      orderId: t.orderId,
      tradeId: t.tradeId,
      contractNoteNumber: t.contractNoteNumber,
      source: t.source,
      // Assumption: without an import timestamp we use the trade time; deterministic.
      createdAt: t.tradeDateTime,
      updatedAt: t.tradeDateTime,
    };
  });

  return normalized.sort((a, b) => {
    if (a.tradeDateTime === b.tradeDateTime) return a.tradeId.localeCompare(b.tradeId);
    return a.tradeDateTime.localeCompare(b.tradeDateTime);
  });
}
