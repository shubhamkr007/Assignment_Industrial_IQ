import { AS_OF, type DateRange } from "@/lib/types";

const endOfDay = (isoDate: string) => new Date(`${isoDate}T23:59:59.000Z`);
const startOfDay = (isoDate: string) => new Date(`${isoDate}T00:00:00.000Z`);

export const PERIODS: DateRange[] = [
  {
    key: "december",
    label: "December 2025",
    from: startOfDay("2025-12-01"),
    to: endOfDay("2025-12-31"),
  },
  {
    key: "q4",
    label: "Q4 2025",
    from: startOfDay("2025-10-01"),
    to: endOfDay("2025-12-31"),
  },
  {
    key: "q3",
    label: "Q3 2025",
    from: startOfDay("2025-07-01"),
    to: endOfDay("2025-09-30"),
  },
  {
    key: "last90",
    label: "Last 90 days",
    from: startOfDay("2025-10-03"),
    to: endOfDay("2025-12-31"),
  },
  {
    key: "all",
    label: "Jun–Dec 2025",
    from: startOfDay("2025-06-01"),
    to: endOfDay("2025-12-31"),
  },
];

export const DEFAULT_PERIOD = PERIODS[0];

export function getPeriod(key: string | null | undefined): DateRange {
  return PERIODS.find((period) => period.key === key) ?? DEFAULT_PERIOD;
}

export function monthsInRange(from: Date, to: Date): string[] {
  const months: string[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cursor.getTime() <= end.getTime()) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

export function isIncompleteCohort(range: DateRange): boolean {
  return range.to.getTime() >= AS_OF.getTime() && range.key !== "all";
}

export function previousPeriod(range: DateRange): DateRange | null {
  if (range.key === "december") {
    return {
      key: "november",
      label: "November 2025",
      from: startOfDay("2025-11-01"),
      to: endOfDay("2025-11-30"),
    };
  }
  if (range.key === "q4") {
    return PERIODS.find((item) => item.key === "q3") ?? null;
  }
  if (range.key === "q3") {
    return {
      key: "june",
      label: "June 2025",
      from: startOfDay("2025-06-01"),
      to: endOfDay("2025-06-30"),
    };
  }
  if (range.key === "last90") {
    return {
      key: "prior90",
      label: "Prior 90 days",
      from: startOfDay("2025-07-05"),
      to: endOfDay("2025-10-02"),
    };
  }
  return null;
}
