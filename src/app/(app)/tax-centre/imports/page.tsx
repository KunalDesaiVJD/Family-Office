import type { Metadata } from "next";

import { Button, PageHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ROUTES } from "@/config/routes";
import { TradeImportClient } from "@/components/tax/TradeImportClient";
import { mockImportBatches } from "@/data/mockTrades";

export const metadata: Metadata = { title: "Historical Trade Import" };

export default function TradeImportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="V J Desai Family · Operations"
        title="Historical Trade Import"
        description="Import broker trade books and contract notes to build the FIFO portfolio ledger. Mock data only — no files are processed and no credentials are stored."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" href={ROUTES.taxCentre} leftIcon={<Icon name="tax" size={16} />}>
              Tax Centre
            </Button>
            <Button variant="outline" href={ROUTES.reconciliation} leftIcon={<Icon name="sync" size={16} />}>
              Reconciliation Centre
            </Button>
            <Button variant="ghost" href={ROUTES.brokerHub} leftIcon={<Icon name="broker" size={16} />}>
              Broker Hub
            </Button>
          </div>
        }
      />

      <TradeImportClient batches={mockImportBatches} />
    </div>
  );
}
