import { Badge } from "@/components/ui";
import { recentExceptions } from "@/data/mockDashboard";
import { severityTone, severityLabel } from "@/lib/status";
import { formatINR } from "@/lib/format";

const severityRank = { high: 0, medium: 1, low: 2 } as const;

/** Top open reconciliation exceptions, prioritised by severity then amount. */
export function ExceptionsPreview({ limit = 5 }: { limit?: number }) {
  const items = recentExceptions
    .filter((e) => e.status !== "resolved")
    .sort(
      (a, b) =>
        severityRank[a.severity] - severityRank[b.severity] ||
        b.amount - a.amount,
    )
    .slice(0, limit);

  return (
    <ul className="divide-y divide-line">
      {items.map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-3 px-6 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {e.description}
            </p>
            <p className="truncate text-xs text-muted">{e.source}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm text-ink tabular-nums">
              {e.amount === 0 ? "—" : formatINR(e.amount)}
            </span>
            <span className="w-16 text-right">
              <Badge tone={severityTone[e.severity]} dot>
                {severityLabel[e.severity]}
              </Badge>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
