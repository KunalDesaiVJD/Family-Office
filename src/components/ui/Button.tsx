import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md";

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  className?: string;
}

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: string;
  };

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue text-white shadow-sm hover:bg-brand-royal active:bg-brand-navy",
  secondary:
    "bg-brand-navy text-white shadow-sm hover:bg-brand-navy/90",
  outline:
    "border border-line bg-white text-ink hover:bg-slate-50 hover:border-slate-300",
  ghost: "text-muted hover:bg-slate-100 hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

/** Presentational button. Renders a Link when `href` is provided. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  className = "",
  href,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {leftIcon}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {leftIcon}
      {children}
    </button>
  );
}
