import { describe, it, expect } from "vitest";
import { getFinancialYear } from "@/lib/portfolio/financialYear";

describe("getFinancialYear", () => {
  it("31 March belongs to the FY ending that year", () => {
    const fy = getFinancialYear("2026-03-31T23:30:00+05:30");
    expect(fy.key).toBe("FY 2025-26");
    expect(fy.startYear).toBe(2025);
    expect(fy.endYear).toBe(2026);
    expect(fy.startDate).toBe("2025-04-01");
    expect(fy.endDate).toBe("2026-03-31");
  });

  it("1 April starts the new FY", () => {
    const fy = getFinancialYear("2026-04-01T00:30:00+05:30");
    expect(fy.key).toBe("FY 2026-27");
    expect(fy.startYear).toBe(2026);
    expect(fy.endYear).toBe(2027);
  });
});
