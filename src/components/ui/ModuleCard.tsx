import Link from "next/link";
import { Badge, type BadgeTone } from "./Badge";
import { Icon, type IconName } from "@/components/icons";

export type ModuleStatus = "live" | "beta" | "planned" | "syncing";

export interface ModuleCardProps {
  title: string;
  description: string;
  status: ModuleStatus;
  href?: string;
  meta?: string;
  /** Optional leading icon chip. */
  icon?: IconName;
  /** Optional build-completeness bar, 0–100. */
  progress?: number;
}

const statusConfig: Record<ModuleStatus, { tone: BadgeTone; label: string }> = {
  live: { tone: "success", label: "Live" },
  beta: { tone: "info", label: "Beta" },
  syncing: { tone: "warning", label: "Syncing" },
  planned: { tone: "neutral", label: "Planned" },
};

const barByStatus: Record<ModuleStatus, string> = {
  live: "bg-emerald-500",
  beta: "bg-brand-blue",
  syncing: "bg-amber-500",
  planned: "bg-slate-300",
};

/** Card for the module-readiness grid. */
export function ModuleCard({
  title,
  description,
  status,
  href,
  meta,
  icon,
  progress,
}: ModuleCardProps) {
  const cfg = statusConfig[status];

  const inner = (
    <div className="group flex h-full flex-col rounded-xl2 border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
              <Icon name={icon} size={18} />
            </span>
          )}
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
        </div>
        <Badge tone={cfg.tone} dot>
          {cfg.label}
        </Badge>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {description}
      </p>

      {typeof progress === "number" && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">Build readiness</span>
            <span className="font-medium text-ink tabular-nums">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${barByStatus[status]}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-muted">{meta ?? ""}</span>
        {href && (
          <span className="flex items-center gap-1 text-xs font-medium text-brand-blue transition-colors group-hover:text-brand-royal">
            Open
            <Icon name="chevronRight" size={14} />
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
