import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Optional section title rendered in a header row. */
  title?: string;
  description?: string;
  /** Optional right-aligned header content (buttons, badges, links). */
  action?: ReactNode;
  /** Toggle inner padding (default true). Set false for flush tables. */
  padded?: boolean;
}

/** White rounded surface with soft enterprise shadow. */
export function Card({
  children,
  className = "",
  title,
  description,
  action,
  padded = true,
}: CardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <section
      className={`rounded-xl2 border border-line bg-white shadow-card ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-ink">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-muted">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padded ? "p-6" : ""}>{children}</div>
    </section>
  );
}
