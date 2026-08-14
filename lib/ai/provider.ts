import type { SummaryContext } from "@/lib/ai/types";
import { parseAiDraft } from "@/lib/ai/validate";

const SYSTEM_PROMPT = `You write executive summaries for a Toyota dealership group dashboard.

Rules:
- Return valid JSON only: {"headline":"...","body":"..."}
- Professional, concise tone.
- Do NOT include any numbers, percentages, currency, dates, or counts in headline or body.
- Reference branch names only from the allowedBranchNames list.
- Headline: one clear priority for leadership (max 120 characters).
- Body: two or three sentences explaining what to focus on and why (max 350 characters).
- Do not invent facts. Use only themes present in candidates and branch health data.`;

export function buildUserPrompt(ctx: SummaryContext): string {
  return JSON.stringify(
    {
      period: ctx.period,
      asOf: ctx.asOf,
      scopeLabel: ctx.scopeLabel,
      branchHealth: ctx.branches.map((b) => ({
        name: b.name,
        health: b.health,
      })),
      themes: ctx.candidates.map((c) => ({
        id: c.id,
        severity: c.severity,
        title: c.title,
      })),
      primaryFunnelDrop: ctx.primaryFunnelDrop,
      allowedBranchNames: ctx.allowedBranchNames,
    },
    null,
    2,
  );
}

export async function requestAiSummary(
  ctx: SummaryContext,
): Promise<ReturnType<typeof parseAiDraft>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.AI_SUMMARY_MODEL ?? "gpt-4o-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Summarize this dashboard context:\n${buildUserPrompt(ctx)}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;

    return parseAiDraft(JSON.parse(content));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
