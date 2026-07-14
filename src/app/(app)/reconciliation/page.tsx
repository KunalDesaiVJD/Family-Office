import type { Metadata } from "next";

import { PageHeader } from "@/components/ui";
import { ReconciliationClient } from "@/components/reconciliation/ReconciliationClient";
import {
  mockLastReconciliationAt,
  mockReconciliationExceptions,
  mockReconciliationRuns,
} from "@/data/mockReconciliation";

export const metadata: Metadata = { title: "Reconciliation Centre" };

export default function ReconciliationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="V J Desai Family · Operations"
        title="Reconciliation Centre"
        description="Investment reconciliation across Angel holdings, broker funds, trade book and contract notes, matched against the internal FIFO ledger."
      />

      <ReconciliationClient
        exceptions={mockReconciliationExceptions}
        runs={mockReconciliationRuns}
        lastRunAt={mockLastReconciliationAt}
      />
    </div>
  );
}
