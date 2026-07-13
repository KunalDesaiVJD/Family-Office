import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "brand";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  /** Show a small leading status dot. */
  dot?: boolean;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-blue-50 text-brand-blue ring-blue-100",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  danger: "bg-red-50 text-red-600 ring-red-100",
  brand: "bg-brand-navy/5 text-brand-navy ring-brand-navy/10",
};

const dotStyles: Record<BadgeTone, string> = {
  neutral: "bg-slate-400",
  info: "bg-brand-blue",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  brand: "bg-brand-navy",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneStyles[tone]} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[tone]}`} />
      )}
      {children}
    </span>
  );
}
