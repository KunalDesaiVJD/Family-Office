import { Badge } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import type { ConnectorHealth } from "@/types/angel";

const container: Record<string, string> = {
  info: "border-blue-100 bg-blue-50/60 text-brand-blue",
  warning: "border-amber-200 bg-amber-50/70 text-amber-700",
  success: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
  neutral: "border-line bg-slate-50 text-muted",
  danger: "border-red-100 bg-red-50/60 text-red-700",
  brand: "border-brand-navy/10 bg-brand-navy/5 text-brand-navy",
};

/**
 * A professional banner communicating the Angel One connector status — including
 * a clear message when the live connector is selected but not configured.
 */
export function ConnectorStatusBanner({ health }: { health: ConnectorHealth }) {
  const iconName: IconName =
    health.state === "live_unconfigured" ? "alert" : "sparkle";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl2 border px-4 py-3 ${
        container[health.tone] ?? container.neutral
      }`}
    >
      <span className="mt-0.5 shrink-0">
        <Icon name={iconName} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            Angel One connector · {health.label}
          </span>
          <Badge tone="neutral" dot>
            Read-only
          </Badge>
          <Badge tone="neutral">Trading disabled</Badge>
        </div>
        <p className="mt-1 text-sm text-muted">{health.message}</p>
      </div>
    </div>
  );
}
