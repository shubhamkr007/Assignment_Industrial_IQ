import { unstable_cache } from "next/cache";
import { buildSummaryContext } from "@/lib/ai/context";
import {
  buildDeterministicSummary,
  mergeAiDraft,
} from "@/lib/ai/deterministic";
import { requestAiSummary } from "@/lib/ai/provider";
import type { ExecutiveSummary } from "@/lib/ai/types";
import { validateAiDraft } from "@/lib/ai/validate";
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

async function resolveSummary(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<ExecutiveSummary> {
  const model = buildDashboard(searchParams);
  const ctx = buildSummaryContext(model);
  const fallback = buildDeterministicSummary(ctx);

  if (process.env.AI_SUMMARY_ENABLED === "false") {
    return fallback;
  }

  const draft = await requestAiSummary(ctx);
  if (!draft || !validateAiDraft(draft, ctx)) {
    return fallback;
  }

  return mergeAiDraft(ctx, draft);
}

export async function getExecutiveSummary(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<ExecutiveSummary> {
  const key = cacheKeyFromParams(searchParams);

  const cached = unstable_cache(
    () => resolveSummary(searchParams),
    ["executive-summary", key],
    { revalidate: 3600, tags: [`executive-summary:${key}`] },
  );

  return cached();
}
