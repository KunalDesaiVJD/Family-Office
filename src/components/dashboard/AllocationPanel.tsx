import { allocation } from "@/data/mockDashboard";
import { formatCompactINR } from "@/lib/format";

/** Stacked allocation bar + legend by asset class. */
export function AllocationPanel() {
  const total = allocation.reduce((s, slice) => s + slice.value, 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {allocation.map((slice) => (
          <div
            key={slice.label}
            style={{
              width: `${(slice.value / total) * 100}%`,
              backgroundColor: slice.color,
            }}
            title={`${slice.label} · ${formatCompactINR(slice.value)}`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {allocation.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-ink">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              {slice.label}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink tabular-nums">
                {formatCompactINR(slice.value)}
              </span>
              <span className="w-10 text-right text-xs text-muted tabular-nums">
                {((slice.value / total) * 100).toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
