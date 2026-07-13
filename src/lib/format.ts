// Formatting helpers. The platform is INR-first (Indian family office) but
// currency is read from the tenant, keeping it SaaS-ready for other bases.

// Pin the display timezone so dates/times render identically regardless of the
// host's timezone — local dev (IST) vs. Vercel build/render servers (UTC).
// SaaS-ready: this can later be sourced per-tenant.
export const TIME_ZONE = "Asia/Kolkata";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_PRECISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

/** Full INR amount with Indian digit grouping, e.g. ₹1,23,45,678. */
export function formatINR(value: number): string {
  return INR.format(value);
}

/** Compact INR using crore / lakh, e.g. ₹12.35 Cr or ₹6.40 L. */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  }
  return INR.format(value);
}

/** Signed compact INR, e.g. +₹68.40 L / -₹1.20 Cr. */
export function formatSignedCompactINR(value: number): string {
  const formatted = formatCompactINR(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatPreciseINR(value: number): string {
  return INR_PRECISE.format(value);
}

export function formatPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Human date, e.g. 12 Jul 2026. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

/** Relative-ish label for sync timestamps, e.g. "12 Jul, 09:41". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  });
}
