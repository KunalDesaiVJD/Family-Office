import type { InsurancePolicy } from "@/types/insurance";
import { insurancePolicies } from "@/data/mockInsurance";
import { DATA_SOURCE } from "@/config/dataSource";
import {
  NotImplementedError,
  type Connector,
  type ConnectorHealth,
  type ConnectorMode,
} from "./base";

export interface InsuranceConnector extends Connector {
  listPolicies(tenantId: string): Promise<InsurancePolicy[]>;
}

class MockInsuranceConnector implements InsuranceConnector {
  readonly name = "insurance";
  readonly mode: ConnectorMode = "mock";

  async listPolicies(tenantId: string): Promise<InsurancePolicy[]> {
    return insurancePolicies.filter((p) => p.tenantId === tenantId);
  }

  async getHealth(tenantId: string): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: true,
      lastCheckedAt: null,
      message: `Serving mock insurance data for ${tenantId}`,
    };
  }
}

class LiveInsuranceConnector implements InsuranceConnector {
  readonly name = "insurance";
  readonly mode: ConnectorMode = "live";

  async listPolicies(): Promise<InsurancePolicy[]> {
    throw new NotImplementedError(this.name, "listPolicies");
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: false,
      lastCheckedAt: null,
      message: "Live insurance connector is not configured",
    };
  }
}

export function getInsuranceConnector(
  mode: ConnectorMode = DATA_SOURCE,
): InsuranceConnector {
  return mode === "live"
    ? new LiveInsuranceConnector()
    : new MockInsuranceConnector();
}
