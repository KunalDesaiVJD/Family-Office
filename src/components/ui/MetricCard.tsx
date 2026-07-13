import type { ReactNode } from "react";

export type MetricTone = "default" | "positive" | "negative" | "warning";
export type DeltaDirection = "up" | "down" | "flat";

export interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  delta?: {
    value: string;
    direction: DeltaDirection;
  };
  tone?: MetricTone;
  icon?: ReactNode;
}

const accentByTone: Record<MetricTone, string> = {
  default: "text-brand-blue bg-blue-50",
  positive: "text-emerald-600 bg-emerald-50",
  negative: "text-red-600 bg-red-50",
  warning: "text-amber-600 bg-amber-50",
};

const deltaStyles: Record<DeltaDirection, string> = {
  up: "text-emerald-600",
  down: "text-red-600",
  flat: "text-muted",
};

const deltaGlyph: Record<DeltaDirection, string> = {
  up: "▲",
  down: "▼",
  flat: "•",
};

/** Compact executive KPI card. */
export function MetricCard({
  label,
  value,
  sublabel,
  delta,
  tone = "default",
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        {icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentByTone[tone]}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span
            className={`text-xs font-semibold ${deltaStyles[delta.direction]}`}
          >
            {deltaGlyph[delta.direction]} {delta.value}
          </span>
        )}
        {sublabel && <span className="text-xs text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
