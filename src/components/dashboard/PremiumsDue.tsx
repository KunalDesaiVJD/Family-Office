import { Badge } from "@/components/ui";
import { premiumsDueSoon } from "@/data/mockInsurance";
import { policyStatusTone, policyStatusLabel } from "@/lib/status";
import { formatINR, formatDate } from "@/lib/format";

/** Insurance premiums falling due within the dashboard window. */
export function PremiumsDue() {
  return (
    <ul className="divide-y divide-line">
      {premiumsDueSoon.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between gap-3 px-6 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {p.insuredName}
            </p>
            <p className="text-xs text-muted">
              {p.insurer} · due {formatDate(p.premiumDueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink tabular-nums">
              {formatINR(p.annualPremium)}
            </span>
            <span className="w-16 text-right">
              <Badge tone={policyStatusTone[p.status]} dot>
                {policyStatusLabel[p.status]}
              </Badge>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
