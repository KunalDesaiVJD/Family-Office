import Link from "next/link";
import { Badge, type BadgeTone } from "./Badge";
import { Icon } from "@/components/icons";

export type ModuleStatus = "live" | "beta" | "planned" | "syncing";

export interface ModuleCardProps {
  title: string;
  description: string;
  status: ModuleStatus;
  href?: string;
  meta?: string;
}

const statusConfig: Record<ModuleStatus, { tone: BadgeTone; label: string }> = {
  live: { tone: "success", label: "Live" },
  beta: { tone: "info", label: "Beta" },
  syncing: { tone: "warning", label: "Syncing" },
  planned: { tone: "neutral", label: "Planned" },
};

/** Card for the module-readiness grid on the dashboard and elsewhere. */
export function ModuleCard({
  title,
  description,
  status,
  href,
  meta,
}: ModuleCardProps) {
  const cfg = statusConfig[status];

  const inner = (
    <div className="group flex h-full flex-col rounded-xl2 border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <Badge tone={cfg.tone} dot>
          {cfg.label}
        </Badge>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {description}
      </p>
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
