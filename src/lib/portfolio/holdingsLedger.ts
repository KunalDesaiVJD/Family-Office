import type {
  HoldingRow,
  NormalizedTrade,
  OpenLot,
  PortfolioHoldingLedger,
  PriceMap,
} from "./types";
import { buildFifoLots } from "./fifoEngine";
import { calculateRealisedGain, calculateUnrealisedGain } from "./capitalGains";
import { round2 } from "./util";

function buildHoldings(
  openLots: OpenLot[],
  prices: PriceMap,
  keyFn: (l: OpenLot) => string,
  pick: (l: OpenLot) => Partial<HoldingRow>,
): HoldingRow[] {
  const map = new Map<string, HoldingRow>();
  for (const lot of openLots) {
    const key = keyFn(lot);
    let row = map.get(key);
    if (!row) {
      row = {
        tenantId: lot.tenantId,
        isin: lot.isin,
        tradingSymbol: lot.tradingSymbol,
        quantity: 0,
        avgCost: 0,
        investedValue: 0,
        priceStatus: "pending",
        ...pick(lot),
      };
      map.set(key, row);
    }
    row.quantity += lot.remainingQuantity;
    row.investedValue += lot.remainingQuantity * lot.buyPrice;
  }

  for (const row of map.values()) {
    row.investedValue = round2(row.investedValue);
    row.avgCost = row.quantity > 0 ? round2(row.investedValue / row.quantity) : 0;
    const price = prices[row.isin];
    if (price !== undefined) {
      row.latestPrice = price;
      row.marketValue = round2(row.quantity * price);
      row.unrealisedGain = round2(row.marketValue - row.investedValue);
      row.priceStatus = "priced";
    } else {
      row.priceStatus = "pending";
    }
  }

  return [...map.values()];
}

/**
 * Produces account-wise, PAN-wise and family-consolidated holdings, open/closed
 * lots and realised/unrealised gain from a set of normalised trades + prices.
 * Pure & deterministic.
 */
export function buildPortfolioLedger(
  trades: NormalizedTrade[],
  prices: PriceMap,
): PortfolioHoldingLedger {
  const tenantId = trades[0]?.tenantId ?? "";
  const { openLots, closedLots } = buildFifoLots(trades);

  const accountHoldings = buildHoldings(
    openLots,
    prices,
    (l) => `${l.brokerAccountId}|${l.clientCode}|${l.isin}`,
    (l) => ({
      brokerAccountId: l.brokerAccountId,
      clientCode: l.clientCode,
      panId: l.panId,
      accountOwner: l.accountOwner,
    }),
  );

  const panHoldings = buildHoldings(
    openLots,
    prices,
    (l) => `${l.panId}|${l.isin}`,
    (l) => ({ panId: l.panId, accountOwner: l.accountOwner }),
  );

  const familyHoldings = buildHoldings(
    openLots,
    prices,
    (l) => `${l.isin}`,
    () => ({}),
  );

  return {
    tenantId,
    accountHoldings,
    panHoldings,
    familyHoldings,
    openLots,
    closedLots,
    realisedGain: calculateRealisedGain(closedLots),
    unrealisedGain: calculateUnrealisedGain(openLots, prices),
  };
}
