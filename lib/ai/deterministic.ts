import { buildSummaryHighlights } from "@/lib/ai/context";
import type { AiSummaryDraft, ExecutiveSummary, SummaryContext } from "@/lib/ai/types";

function topCandidate(ctx: SummaryContext) {
  return ctx.candidates[0] ?? null;
}

function branchContrast(ctx: SummaryContext): string | null {
  const worst = ctx.branches[0];
  const best = ctx.branches[ctx.branches.length - 1];
  if (!worst || !best || worst.name === best.name) return null;
  return `${worst.name} trails ${best.name} on conversion.`;
}

export function buildDeterministicSummary(ctx: SummaryContext): ExecutiveSummary {
  const top = topCandidate(ctx);
  const parts: string[] = [];

  parts.push(
    `For ${ctx.period}, retail was ${ctx.kpis.retailUnits} units against a ${ctx.kpis.targetUnits} unit target.`,
  );

  if (
    ctx.previousRetailUnits != null &&
    ctx.previousRetailUnits !== ctx.kpis.retailUnits
  ) {
    const direction =
      ctx.kpis.retailUnits > ctx.previousRetailUnits ? "up" : "down";
    parts.push(`Retail is ${direction} from the prior period.`);
  }

  const contrast = branchContrast(ctx);
  if (contrast) parts.push(contrast);

  if (ctx.kpis.neverContactedLost >= 10) {
    parts.push(
      "Leads lost without first contact remain the primary sales-process risk.",
    );
  }

  if (ctx.kpis.soldWaiting > 0) {
    parts.push(
      "Customers with placed orders are still waiting for delivery, which affects near-term satisfaction.",
    );
  }

  if (ctx.primaryFunnelDrop === "contacted") {
    parts.push("The largest funnel drop is between new leads and first contact.");
  }

  return {
    source: "deterministic",
    headline: top?.title ?? "Group performance summary",
    body: parts.join(" "),
    severity: top?.severity ?? "info",
    verb: top?.verb ?? "Review",
    href: top?.href ?? "/",
    cta: top?.cta ?? "View dashboard",
    highlights: buildSummaryHighlights(ctx),
  };
}

export function mergeAiDraft(
  ctx: SummaryContext,
  draft: AiSummaryDraft,
): ExecutiveSummary {
  const base = buildDeterministicSummary(ctx);
  const top = topCandidate(ctx);

  return {
    ...base,
    source: "ai",
    headline: draft.headline.trim() || base.headline,
    body: draft.body.trim() || base.body,
    severity: top?.severity ?? base.severity,
    verb: top?.verb ?? base.verb,
    href: top?.href ?? base.href,
    cta: top?.cta ?? base.cta,
  };
}
