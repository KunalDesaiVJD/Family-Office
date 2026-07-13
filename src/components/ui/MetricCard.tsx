import type { ReactNode } from "react";
import Link from "next/link";

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
  /** Larger value + tone accent bar, for primary KPIs. */
  emphasis?: boolean;
  /** Renders the card as a link to a module. */
  href?: string;
  /** Optional footer content below a divider. */
  footer?: ReactNode;
}

const accentByTone: Record<MetricTone, string> = {
  default: "text-brand-blue bg-blue-50",
  positive: "text-emerald-600 bg-emerald-50",
  negative: "text-red-600 bg-red-50",
  warning: "text-amber-600 bg-amber-50",
};

const barByTone: Record<MetricTone, string> = {
  default: "bg-brand-blue",
  positive: "bg-emerald-500",
  negative: "bg-red-500",
  warning: "bg-amber-500",
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

/** Compact executive KPI card, with an optional emphasis treatment. */
export function MetricCard({
  label,
  value,
  sublabel,
  delta,
  tone = "default",
  icon,
  emphasis = false,
  href,
  footer,
}: MetricCardProps) {
  const interactive = href
    ? "transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-soft"
    : "";

  const content = (
    <div
      className={`relative h-full overflow-hidden rounded-xl2 border border-line bg-white p-5 shadow-card ${interactive}`}
    >
      {emphasis && (
        <span
          className={`absolute inset-x-0 top-0 h-1 ${barByTone[tone]}`}
          aria-hidden="true"
        />
      )}
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
      <p
        className={`mt-3 font-semibold tracking-tight text-ink ${
          emphasis ? "text-3xl" : "text-2xl"
        }`}
      >
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
      {footer && (
        <div className="mt-4 border-t border-line pt-3 text-xs text-muted">
          {footer}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
