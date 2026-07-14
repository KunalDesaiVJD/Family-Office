import type { Metadata } from "next";
import { PageHeader, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BrokerHubTabs } from "@/components/broker/BrokerHubTabs";
import { ConnectorStatusBanner } from "@/components/broker/ConnectorStatusBanner";
import { getConnectorHealth } from "@/lib/brokerStatus";
import { angelFunds, angelLastSyncedAt } from "@/data/mockAngel";
import {
  angelAccounts,
  angelHoldings,
  angelOrders,
  angelTrades,
  angelPositions,
  angelLedger,
  angelSyncRun,
  angelAccountSyncLogs,
} from "@/data/mockAngelAccounts";

export const metadata: Metadata = { title: "Broker Hub" };

export default function BrokerHubPage() {
  const health = getConnectorHealth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="V J Desai Family · Wealth"
        title="Broker Hub"
        description="Multi-account Angel One view — per-account holdings, funds, orders, trades, positions and ledger for every family member. Read-only — trading is disabled."
        actions={
          <Button
            variant="outline"
            size="md"
            leftIcon={<Icon name="download" size={16} />}
          >
            Export
          </Button>
        }
      />

      <ConnectorStatusBanner health={health} />

      <BrokerHubTabs
        health={health}
        accounts={angelAccounts}
        holdings={angelHoldings}
        orders={angelOrders}
        trades={angelTrades}
        positions={angelPositions}
        ledger={angelLedger}
        syncRun={angelSyncRun}
        accountSyncLogs={angelAccountSyncLogs}
        funds={angelFunds}
        lastSyncedAt={angelLastSyncedAt}
      />
    </div>
  );
}
