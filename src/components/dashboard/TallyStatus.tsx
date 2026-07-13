import { Badge } from "@/components/ui";
import { tallyCompanies } from "@/data/mockTally";
import { syncStateTone, syncStateLabel } from "@/lib/status";
import { formatCompactINR, formatDateTime } from "@/lib/format";

/** Per-company Tally sync status preview. */
export function TallyStatus() {
  return (
    <ul className="divide-y divide-line">
      {tallyCompanies.map((c) => (
        <li
          key={c.id}
          className="flex items-center justify-between gap-3 px-6 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {c.companyName}
            </p>
            <p className="text-xs text-muted">
              Last synced {formatDateTime(c.lastSyncedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink tabular-nums">
              {formatCompactINR(c.closingBalance)}
            </span>
            <span className="w-20 text-right">
              <Badge tone={syncStateTone[c.syncState]} dot>
                {syncStateLabel[c.syncState]}
              </Badge>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
