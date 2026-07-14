import { holdings } from "@/data/mockBrokerAccounts";
import { DATA_SOURCE } from "@/config/dataSource";
import {
  NotImplementedError,
  type Connector,
  type ConnectorHealth,
  type ConnectorMode,
} from "./base";

export interface Quote {
  symbol: string;
  ltp: number;
  changePct: number;
  asOf: string | null;
}

export interface MarketDataConnector extends Connector {
  getQuote(tenantId: string, symbol: string): Promise<Quote | null>;
  getQuotes(tenantId: string, symbols: string[]): Promise<Quote[]>;
}

class MockMarketDataConnector implements MarketDataConnector {
  readonly name = "marketData";
  readonly mode: ConnectorMode = "mock";

  private quoteFor(symbol: string): Quote | null {
    const h = holdings.find((x) => x.symbol === symbol);
    if (!h) return null;
    return { symbol: h.symbol, ltp: h.ltp, changePct: h.dayChangePct, asOf: null };
  }

  async getQuote(_tenantId: string, symbol: string): Promise<Quote | null> {
    return this.quoteFor(symbol);
  }

  async getQuotes(_tenantId: string, symbols: string[]): Promise<Quote[]> {
    return symbols
      .map((s) => this.quoteFor(s))
      .filter((q): q is Quote => q !== null);
  }

  async getHealth(tenantId: string): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: true,
      lastCheckedAt: null,
      message: `Serving mock market data for ${tenantId}`,
    };
  }
}

class LiveMarketDataConnector implements MarketDataConnector {
  readonly name = "marketData";
  readonly mode: ConnectorMode = "live";

  async getQuote(): Promise<Quote | null> {
    throw new NotImplementedError(this.name, "getQuote");
  }

  async getQuotes(): Promise<Quote[]> {
    throw new NotImplementedError(this.name, "getQuotes");
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: false,
      lastCheckedAt: null,
      message: "Live market data connector is not configured",
    };
  }
}

export function getMarketDataConnector(
  mode: ConnectorMode = DATA_SOURCE,
): MarketDataConnector {
  return mode === "live"
    ? new LiveMarketDataConnector()
    : new MockMarketDataConnector();
}
