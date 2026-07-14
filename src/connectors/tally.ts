import type { TallyCompany, ReconciliationException } from "@/types/tally";
import type { LedgerEntry } from "@/types/ledger";
import { tallyCompanies, reconciliationExceptions } from "@/data/mockTally";
import { ledgerEntries } from "@/data/mockLedger";
import { DATA_SOURCE } from "@/config/dataSource";
import {
  NotImplementedError,
  type Connector,
  type ConnectorHealth,
  type ConnectorMode,
} from "./base";

export interface TallyConnector extends Connector {
  listCompanies(tenantId: string): Promise<TallyCompany[]>;
  getLedgerEntries(tenantId: string, companyId?: string): Promise<LedgerEntry[]>;
  getExceptions(tenantId: string): Promise<ReconciliationException[]>;
}

class MockTallyConnector implements TallyConnector {
  readonly name = "tally";
  readonly mode: ConnectorMode = "mock";

  async listCompanies(tenantId: string): Promise<TallyCompany[]> {
    return tallyCompanies.filter((c) => c.tenantId === tenantId);
  }

  async getLedgerEntries(
    tenantId: string,
    companyId?: string,
  ): Promise<LedgerEntry[]> {
    return ledgerEntries.filter(
      (e) =>
        e.tenantId === tenantId &&
        (!companyId || e.tallyCompanyId === companyId),
    );
  }

  async getExceptions(tenantId: string): Promise<ReconciliationException[]> {
    return reconciliationExceptions.filter((e) => e.tenantId === tenantId);
  }

  async getHealth(tenantId: string): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: true,
      lastCheckedAt: null,
      message: `Serving mock Tally data for ${tenantId}`,
    };
  }
}

class LiveTallyConnector implements TallyConnector {
  readonly name = "tally";
  readonly mode: ConnectorMode = "live";

  async listCompanies(): Promise<TallyCompany[]> {
    throw new NotImplementedError(this.name, "listCompanies");
  }

  async getLedgerEntries(): Promise<LedgerEntry[]> {
    throw new NotImplementedError(this.name, "getLedgerEntries");
  }

  async getExceptions(): Promise<ReconciliationException[]> {
    throw new NotImplementedError(this.name, "getExceptions");
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: false,
      lastCheckedAt: null,
      message: "Live Tally connector is not configured",
    };
  }
}

export function getTallyConnector(
  mode: ConnectorMode = DATA_SOURCE,
): TallyConnector {
  return mode === "live" ? new LiveTallyConnector() : new MockTallyConnector();
}
