import type { Metadata } from "next";
import { PageHeader, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BrokerHubTabs } from "@/components/broker/BrokerHubTabs";
import { ConnectorStatusBanner } from "@/components/broker/ConnectorStatusBanner";
import { getConnectorHealth } from "@/lib/brokerStatus";
import { brokerAccounts, holdings } from "@/data/mockBrokerAccounts";
import {
  angelProfile,
  angelFunds,
  angelSyncLogs,
  angelLastSyncedAt,
} from "@/data/mockAngel";

export const metadata: Metadata = { title: "Broker Hub" };

export default function BrokerHubPage() {
  const health = getConnectorHealth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="V J Desai Family · Wealth"
        title="Broker Hub"
        description="Consolidated demat holdings, funds and connector health across the family's Angel One and other broker accounts. Read-only — trading is disabled."
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
        accounts={brokerAccounts}
        holdings={holdings}
        profile={angelProfile}
        funds={angelFunds}
        syncLogs={angelSyncLogs}
        lastSyncedAt={angelLastSyncedAt}
      />
    </div>
  );
}
