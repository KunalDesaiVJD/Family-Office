import type { BrokerAccount } from "@/types/broker";
import type { Holding } from "@/types/portfolio";
import { brokerAccounts, holdings } from "@/data/mockBrokerAccounts";
import { DATA_SOURCE } from "@/config/dataSource";
import {
  NotImplementedError,
  type Connector,
  type ConnectorHealth,
  type ConnectorMode,
} from "./base";

export interface BrokerConnector extends Connector {
  listAccounts(tenantId: string): Promise<BrokerAccount[]>;
  getHoldings(tenantId: string, accountId?: string): Promise<Holding[]>;
}

class MockBrokerConnector implements BrokerConnector {
  readonly name = "broker";
  readonly mode: ConnectorMode = "mock";

  async listAccounts(tenantId: string): Promise<BrokerAccount[]> {
    return brokerAccounts.filter((a) => a.tenantId === tenantId);
  }

  async getHoldings(tenantId: string): Promise<Holding[]> {
    return holdings.filter((h) => h.tenantId === tenantId);
  }

  async getHealth(tenantId: string): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: true,
      lastCheckedAt: null,
      message: `Serving mock broker data for ${tenantId}`,
    };
  }
}

class LiveBrokerConnector implements BrokerConnector {
  readonly name = "broker";
  readonly mode: ConnectorMode = "live";

  async listAccounts(): Promise<BrokerAccount[]> {
    throw new NotImplementedError(this.name, "listAccounts");
  }

  async getHoldings(): Promise<Holding[]> {
    throw new NotImplementedError(this.name, "getHoldings");
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: false,
      lastCheckedAt: null,
      message: "Live broker connector is not configured",
    };
  }
}

export function getBrokerConnector(
  mode: ConnectorMode = DATA_SOURCE,
): BrokerConnector {
  return mode === "live"
    ? new LiveBrokerConnector()
    : new MockBrokerConnector();
}
