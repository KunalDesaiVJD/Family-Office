import type {
  CapitalGainConfig,
  CapitalGainResult,
  ClosedLot,
  GainType,
  OpenLot,
  PriceMap,
  ProductType,
  UnrealisedGainResult,
} from "./types";
import { round2 } from "./util";

// Configurable because tax rules change. For listed-equity DELIVERY, a holding
// period of MORE than 12 months (365 days) is long-term (LTCG); otherwise
// short-term (STCG). Intraday and F&O are tracked separately (not STCG/LTCG) and
// are NOT final tax advice — outputs require CA verification.
export const DEFAULT_CAPITAL_GAIN_CONFIG: CapitalGainConfig = {
  ltcgThresholdDays: 365,
};

export function classifyGain(
  productType: ProductType,
  holdingDays: number,
  config: CapitalGainConfig = DEFAULT_CAPITAL_GAIN_CONFIG,
): GainType {
  if (productType === "INTRADAY") return "INTRADAY";
  if (productType === "FNO") return "FNO";
  if (productType === "DELIVERY") {
    return holdingDays > config.ltcgThresholdDays ? "LTCG" : "STCG";
  }
  return "UNKNOWN";
}

/** Re-classify closed lots with a (possibly updated) config. Pure. */
export function classifyCapitalGain(
  closedLots: ClosedLot[],
  config: CapitalGainConfig = DEFAULT_CAPITAL_GAIN_CONFIG,
): ClosedLot[] {
  return closedLots.map((l) => ({
    ...l,
    gainType: classifyGain(l.productType, l.holdingDays, config),
  }));
}

export function calculateRealisedGain(
  closedLots: ClosedLot[],
  financialYear?: string,
): CapitalGainResult {
  const lots = financialYear
    ? closedLots.filter((l) => l.financialYear === financialYear)
    : closedLots;
  const tenantId = lots[0]?.tenantId ?? "";
  let realisedGain = 0;
  let stcg = 0;
  let ltcg = 0;
  let intraday = 0;
  let fno = 0;
  let totalCharges = 0;

  for (const l of lots) {
    realisedGain += l.realisedGainLoss;
    totalCharges += l.allocatedBuyCharges + l.allocatedSellCharges;
    if (l.gainType === "STCG") stcg += l.realisedGainLoss;
    else if (l.gainType === "LTCG") ltcg += l.realisedGainLoss;
    else if (l.gainType === "INTRADAY") intraday += l.realisedGainLoss;
    else if (l.gainType === "FNO") fno += l.realisedGainLoss;
  }

  return {
    tenantId,
    financialYear,
    realisedGain: round2(realisedGain),
    stcg: round2(stcg),
    ltcg: round2(ltcg),
    intraday: round2(intraday),
    fno: round2(fno),
    totalCharges: round2(totalCharges),
    closedLotCount: lots.length,
  };
}

export function calculateUnrealisedGain(
  openLots: OpenLot[],
  prices: PriceMap,
): UnrealisedGainResult {
  let total = 0;
  let priced = 0;
  let pending = 0;

  for (const lot of openLots) {
    const price = prices[lot.isin];
    if (price === undefined) {
      pending += 1;
      continue;
    }
    priced += 1;
    total += lot.remainingQuantity * price - lot.remainingQuantity * lot.buyPrice;
  }

  return { total: round2(total), pricedCount: priced, pendingCount: pending };
}
