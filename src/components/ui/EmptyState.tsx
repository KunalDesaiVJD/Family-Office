import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional custom icon; defaults to a neutral document glyph. */
  icon?: ReactNode;
  /** Optional action (button/link). */
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-slate-50/40 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-blue shadow-card">
        {icon ?? <Icon name="documents" size={22} />}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
