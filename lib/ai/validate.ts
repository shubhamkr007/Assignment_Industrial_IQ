import type { AiSummaryDraft, SummaryContext } from "@/lib/ai/types";

const MAX_HEADLINE = 140;
const MAX_BODY = 480;

/** Narrative must not invent metrics — digits and currency symbols are disallowed. */
const NUMERIC_PATTERN = /[\d%₹$€£]|(?:\bcr\b)|(?:\blakh)/i;

export function validateAiDraft(
  draft: AiSummaryDraft,
  _ctx: SummaryContext,
): boolean {
  const headline = draft.headline?.trim() ?? "";
  const body = draft.body?.trim() ?? "";

  if (!headline || !body) return false;
  if (headline.length > MAX_HEADLINE || body.length > MAX_BODY) return false;
  if (NUMERIC_PATTERN.test(headline) || NUMERIC_PATTERN.test(body)) return false;

  return true;
}

export function parseAiDraft(raw: unknown): AiSummaryDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.headline !== "string" || typeof record.body !== "string") {
    return null;
  }
  return { headline: record.headline, body: record.body };
}
