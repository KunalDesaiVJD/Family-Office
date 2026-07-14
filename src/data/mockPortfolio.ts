import { normalizeTrades } from "@/lib/portfolio/tradeNormalizer";
import { buildPortfolioLedger } from "@/lib/portfolio/holdingsLedger";
import { mockImportedTrades, mockPrices } from "./mockTrades";
import type { NormalizedTrade, PortfolioHoldingLedger } from "@/lib/portfolio/types";

// Shared, deterministic mock ledger. The engine runs once at module load on the
// canonical mock trades so the Tax Centre, Reconciliation Centre and Dashboard
// all read the same computed FIFO result. Pure — safe in server components.

export const mockNormalizedTrades: NormalizedTrade[] = normalizeTrades(mockImportedTrades);

export const mockLedger: PortfolioHoldingLedger = buildPortfolioLedger(
  mockNormalizedTrades,
  mockPrices,
);
