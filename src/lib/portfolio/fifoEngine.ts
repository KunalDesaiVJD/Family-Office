import type {
  ClosedLot,
  FifoException,
  FifoResult,
  NormalizedTrade,
  OpenLot,
} from "./types";
import { classifyGain } from "./capitalGains";
import { getFinancialYear } from "./financialYear";
import { daysBetween, round2 } from "./util";

// FIFO matching key: same tenant + broker account + client + ISIN + product.
function fifoKey(t: NormalizedTrade): string {
  return `${t.tenantId}|${t.brokerAccountId}|${t.clientCode}|${t.isin}|${t.productType}`;
}

// Aggregation key for internal open quantity (across products, per ISIN).
function qtyKey(t: {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  panId: string;
  isin: string;
}): string {
  return `${t.tenantId}|${t.brokerAccountId}|${t.clientCode}|${t.panId}|${t.isin}`;
}

function sortTrades(trades: NormalizedTrade[]): NormalizedTrade[] {
  // Clone so the input is never mutated; deterministic ordering.
  return [...trades].sort((a, b) => {
    if (a.tradeDateTime === b.tradeDateTime) return a.tradeId.localeCompare(b.tradeId);
    return a.tradeDateTime.localeCompare(b.tradeDateTime);
  });
}

/**
 * Builds FIFO buy lots, matches sells against the oldest open lots, and
 * produces open lots, closed lots and oversold exceptions. Pure & deterministic.
 */
export function buildFifoLots(trades: NormalizedTrade[]): FifoResult {
  const sorted = sortTrades(trades);
  const queues = new Map<string, OpenLot[]>();
  const closedLots: ClosedLot[] = [];
  const exceptions: FifoException[] = [];

  for (const t of sorted) {
    const key = fifoKey(t);
    if (!queues.has(key)) queues.set(key, []);
    const queue = queues.get(key)!;

    if (t.transactionType === "BUY") {
      queue.push({
        tenantId: t.tenantId,
        brokerAccountId: t.brokerAccountId,
        clientCode: t.clientCode,
        panId: t.panId,
        familyMemberId: t.familyMemberId,
        accountOwner: t.accountOwner,
        isin: t.isin,
        tradingSymbol: t.tradingSymbol,
        productType: t.productType,
        buyTradeId: t.tradeId,
        buyDate: t.tradeDateTime,
        buyPrice: t.price,
        originalQuantity: t.quantity,
        remainingQuantity: t.quantity,
        buyCharges: t.totalCharges,
        costValue: round2(t.quantity * t.price),
      });
      continue;
    }

    // SELL — match against oldest open lots.
    let sellRemaining = t.quantity;
    let matchIndex = 0;
    while (sellRemaining > 0 && queue.length > 0) {
      const lot = queue[0];
      const matchQty = Math.min(sellRemaining, lot.remainingQuantity);
      const costValue = round2(matchQty * lot.buyPrice);
      const sellValue = round2(matchQty * t.price);
      const allocatedBuyCharges = round2(
        lot.buyCharges * (matchQty / lot.originalQuantity),
      );
      const allocatedSellCharges = round2(t.totalCharges * (matchQty / t.quantity));
      const holdingDays = daysBetween(lot.buyDate, t.tradeDateTime);
      const realisedGainLoss = round2(
        sellValue - costValue - allocatedBuyCharges - allocatedSellCharges,
      );

      closedLots.push({
        id: `${t.tradeId}-${lot.buyTradeId}-${matchIndex}`,
        tenantId: t.tenantId,
        sellTradeId: t.tradeId,
        buyTradeId: lot.buyTradeId,
        isin: t.isin,
        tradingSymbol: t.tradingSymbol,
        quantitySold: matchQty,
        buyDate: lot.buyDate,
        sellDate: t.tradeDateTime,
        buyPrice: lot.buyPrice,
        sellPrice: t.price,
        costValue,
        sellValue,
        allocatedBuyCharges,
        allocatedSellCharges,
        realisedGainLoss,
        holdingDays,
        gainType: classifyGain(t.productType, holdingDays),
        financialYear: getFinancialYear(t.tradeDateTime).key,
        accountOwner: t.accountOwner,
        clientCode: t.clientCode,
        panId: t.panId,
        brokerAccountId: t.brokerAccountId,
        productType: t.productType,
      });

      lot.remainingQuantity -= matchQty;
      sellRemaining -= matchQty;
      matchIndex += 1;
      if (lot.remainingQuantity <= 0) queue.shift();
    }

    if (sellRemaining > 0) {
      exceptions.push({
        tenantId: t.tenantId,
        brokerAccountId: t.brokerAccountId,
        clientCode: t.clientCode,
        isin: t.isin,
        tradingSymbol: t.tradingSymbol,
        sellTradeId: t.tradeId,
        oversoldQuantity: sellRemaining,
        message: `Sell of ${t.quantity} ${t.tradingSymbol} exceeds available quantity by ${sellRemaining}. Possible missing buy trade or corporate action.`,
      });
    }
  }

  const openLots: OpenLot[] = [];
  for (const queue of queues.values()) {
    for (const lot of queue) {
      if (lot.remainingQuantity > 0) {
        openLots.push({ ...lot, costValue: round2(lot.remainingQuantity * lot.buyPrice) });
      }
    }
  }

  return { openLots, closedLots, exceptions };
}

export interface OpenQuantity {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  panId: string;
  isin: string;
  tradingSymbol: string;
  quantity: number;
}

/** Current internal open quantity by tenant/account/PAN/ISIN (via FIFO open lots). */
export function calculateOpenQuantity(trades: NormalizedTrade[]): OpenQuantity[] {
  const { openLots } = buildFifoLots(trades);
  const map = new Map<string, OpenQuantity>();
  for (const lot of openLots) {
    const key = qtyKey(lot);
    const existing = map.get(key);
    if (existing) {
      existing.quantity += lot.remainingQuantity;
    } else {
      map.set(key, {
        tenantId: lot.tenantId,
        brokerAccountId: lot.brokerAccountId,
        clientCode: lot.clientCode,
        panId: lot.panId,
        isin: lot.isin,
        tradingSymbol: lot.tradingSymbol,
        quantity: lot.remainingQuantity,
      });
    }
  }
  return [...map.values()];
}
