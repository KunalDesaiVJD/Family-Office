import type { TaxFinancialYear } from "./types";

// Indian financial year: 1 April → 31 March. FY 2025-26 spans 2025-04-01 to
// 2026-03-31. Dates are resolved in the IST calendar so the boundary is
// deterministic regardless of the host timezone.

const IST = "Asia/Kolkata";

function istYearMonth(date: string | Date): { year: number; month: number } {
  const d = typeof date === "string" ? new Date(date) : date;
  // en-CA yields YYYY-MM-DD.
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

export function getFinancialYear(date: string | Date): TaxFinancialYear {
  const { year, month } = istYearMonth(date);
  // Jan(1)/Feb(2)/Mar(3) belong to the FY that started the previous April.
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  const label = `FY ${startYear}-${String(endYear).slice(-2)}`;
  return {
    key: label,
    label,
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
    startYear,
    endYear,
  };
}

/** List recent financial years, newest first (for filters). */
export function listFinancialYears(count: number, upToDate: string | Date): TaxFinancialYear[] {
  const current = getFinancialYear(upToDate);
  const out: TaxFinancialYear[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(getFinancialYear(`${current.startYear - i}-06-01`));
  }
  return out;
}
