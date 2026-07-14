import type { Metadata } from "next";

import { Button, PageHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ROUTES } from "@/config/routes";
import { TaxCentreClient } from "@/components/tax/TaxCentreClient";
import { mockLedger, mockNormalizedTrades } from "@/data/mockPortfolio";
import { mockImportBatches } from "@/data/mockTrades";

export const metadata: Metadata = { title: "Tax Centre" };

export default function TaxCentrePage() {
  const pendingReview = mockImportBatches
    .filter((b) => b.status === "awaiting_review" || b.status === "validated")
    .reduce((sum, b) => sum + Math.max(b.invalidRows + b.duplicateRows, b.totalRows - b.importedRows), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="V J Desai Family · Operations"
        title="Tax Centre"
        description="FIFO capital-gains computation across every PAN and Angel account. Prepared for internal review and CA verification."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" href={ROUTES.taxImports} leftIcon={<Icon name="download" size={16} />}>
              Historical Trade Import
            </Button>
            <Button variant="outline" href={ROUTES.reconciliation} leftIcon={<Icon name="sync" size={16} />}>
              Reconciliation Centre
            </Button>
            <Button variant="ghost" href={ROUTES.documentVault} leftIcon={<Icon name="documents" size={16} />}>
              Document Vault
            </Button>
          </div>
        }
      />

      <TaxCentreClient
        closedLots={mockLedger.closedLots}
        openLots={mockLedger.openLots}
        holdings={mockLedger.accountHoldings}
        trades={mockNormalizedTrades}
        batches={mockImportBatches}
        pendingReview={pendingReview}
      />
    </div>
  );
}
