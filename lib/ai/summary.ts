import { unstable_cache } from "next/cache";
import { buildSummaryContext } from "@/lib/ai/context";
import { buildExecutiveSummary } from "@/lib/ai/summarizer";
import type { ExecutiveSummary } from "@/lib/ai/types";
import { buildDashboard } from "@/lib/dashboard";

function cacheKeyFromParams(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const entries = Object.entries(searchParams)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(entries);
}

function resolveSummary(
  searchParams: Record<string, string | string[] | undefined>,
): ExecutiveSummary {
  const model = buildDashboard(searchParams);
  const ctx = buildSummaryContext(model);
  return buildExecutiveSummary(ctx);
}

export async function getExecutiveSummary(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<ExecutiveSummary> {
  const key = cacheKeyFromParams(searchParams);

  const cached = unstable_cache(
    async () => resolveSummary(searchParams),
    ["executive-summary", key],
    { revalidate: 3600, tags: [`executive-summary:${key}`] },
  );

  return cached();
}
