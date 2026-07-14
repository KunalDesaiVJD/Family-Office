import type { MutualFundFolio } from "@/types/portfolio";
import { mutualFundFolios } from "@/data/mockMutualFunds";
import { DATA_SOURCE } from "@/config/dataSource";
import {
  NotImplementedError,
  type Connector,
  type ConnectorHealth,
  type ConnectorMode,
} from "./base";

export interface MutualFundConnector extends Connector {
  listFolios(tenantId: string): Promise<MutualFundFolio[]>;
}

class MockMutualFundConnector implements MutualFundConnector {
  readonly name = "mutualFund";
  readonly mode: ConnectorMode = "mock";

  async listFolios(tenantId: string): Promise<MutualFundFolio[]> {
    return mutualFundFolios.filter((f) => f.tenantId === tenantId);
  }

  async getHealth(tenantId: string): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: true,
      lastCheckedAt: null,
      message: `Serving mock mutual fund data for ${tenantId}`,
    };
  }
}

class LiveMutualFundConnector implements MutualFundConnector {
  readonly name = "mutualFund";
  readonly mode: ConnectorMode = "live";

  async listFolios(): Promise<MutualFundFolio[]> {
    throw new NotImplementedError(this.name, "listFolios");
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: false,
      lastCheckedAt: null,
      message: "Live mutual fund connector is not configured",
    };
  }
}

export function getMutualFundConnector(
  mode: ConnectorMode = DATA_SOURCE,
): MutualFundConnector {
  return mode === "live"
    ? new LiveMutualFundConnector()
    : new MockMutualFundConnector();
}
