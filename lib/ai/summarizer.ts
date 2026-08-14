import { buildSummaryHighlights } from "@/lib/ai/context";
import { formatInr, formatPercent } from "@/lib/format";
import type {
  ExecutiveSummary,
  SummaryCandidate,
  SummaryContext,
} from "@/lib/ai/types";

const SEVERITY_SCORE = {
  critical: 100,
  warning: 60,
  info: 30,
} as const;

const FUNNEL_LABEL: Record<string, string> = {
  contacted: "first contact",
  test_drive: "test drive",
  negotiation: "negotiation",
  order_placed: "order placement",
};

function shortBranch(name: string): string {
  return name.replace(" Toyota", "");
}

function rankCandidates(ctx: SummaryContext): SummaryCandidate[] {
  return [...ctx.candidates]
    .map((candidate) => {
      let score = SEVERITY_SCORE[candidate.severity];

      if (candidate.id === "december-wipeout" && ctx.period.toLowerCase().includes("december")) {
        score += 40;
      }
      if (candidate.id === "house-rule" && ctx.kpis.neverContactedLost >= 50) {
        score += 25;
      }
      if (candidate.id === "sold-waiting" && ctx.kpis.soldWaiting >= 20) {
        score += 20;
      }
      if (candidate.id === "roof-collapse" && ctx.branchId) {
        score += 15;
      }
      if (candidate.value != null) {
        score += Math.min(15, Math.floor(candidate.value / 5_000_000));
      }

      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((row) => row.candidate);
}

function performanceSentence(ctx: SummaryContext): string {
  const { retailUnits, targetUnits } = ctx.kpis;
  const scope = ctx.branchName ?? "the group";
  const attainment =
    ctx.targetAttainment != null
      ? ` (${formatPercent(ctx.targetAttainment)} of the ${targetUnits}-unit target)`
      : "";

  let sentence = `${scope} delivered ${retailUnits} retail units in ${ctx.period}${attainment}.`;

  if (ctx.retailMomChange != null && ctx.previousRetailUnits != null) {
    const direction = ctx.retailMomChange >= 0 ? "up" : "down";
    sentence += ` That is ${direction} ${formatPercent(Math.abs(ctx.retailMomChange))} from the prior period (${ctx.previousRetailUnits} units).`;
  }

  return sentence;
}

function branchGapSentence(ctx: SummaryContext): string | null {
  if (ctx.branchId || ctx.branches.length < 2) return null;

  const worst = ctx.branches[0];
  const best = ctx.branches[ctx.branches.length - 1];
  if (!worst || !best || worst.name === best.name) return null;

  return `${shortBranch(worst.name)} is ${worst.health} at ${formatPercent(worst.conversion)} conversion, while ${shortBranch(best.name)} leads at ${formatPercent(best.conversion)}.`;
}

function funnelSentence(ctx: SummaryContext): string | null {
  if (!ctx.primaryFunnelDrop) return null;
  const label = FUNNEL_LABEL[ctx.primaryFunnelDrop] ?? ctx.primaryFunnelDrop.replace(/_/g, " ");
  return `The steepest funnel drop is at ${label}.`;
}

function themePriorityLine(candidate: SummaryCandidate): string {
  return `${candidate.verb}: ${candidate.title}`;
}

function themeDetailSentence(ctx: SummaryContext, candidate: SummaryCandidate): string {
  switch (candidate.id) {
    case "december-wipeout":
      return candidate.body;
    case "roof-collapse":
      return candidate.body;
    case "house-rule":
      return `${ctx.kpis.neverContactedLost} lost leads never reached first contact. Enforce a contact attempt before closing leads from the new stage.`;
    case "sold-waiting":
      return `${ctx.kpis.soldWaiting} customers are waiting for delivery${candidate.value != null ? ` (${formatInr(candidate.value)} in booked revenue)` : ""}. Review allocation and registration bottlenecks.`;
    case "sla":
      return ctx.kpis.firstResponseMedianHours != null
        ? `Median first response is ${ctx.kpis.firstResponseMedianHours.toFixed(0)} hours; only ${formatPercent(ctx.kpis.sla24HitRate ?? 0)} of contacted leads meet a 24-hour standard.`
        : candidate.body;
    case "channel-quality":
      return candidate.body;
    case "aging":
      return candidate.body;
    case "pipeline-thin":
      return candidate.body;
    default:
      return candidate.body;
  }
}

function buildHeadline(ctx: SummaryContext, primary: SummaryCandidate | null): string {
  if (!primary) {
    return ctx.branchName
      ? `${shortBranch(ctx.branchName)} performance summary`
      : "Group performance summary";
  }

  if (primary.id === "december-wipeout") {
    return primary.title;
  }

  if (primary.id === "roof-collapse" && ctx.branchName) {
    return `${ctx.branchName} needs a process review`;
  }

  return primary.title;
}

function buildBody(
  ctx: SummaryContext,
  ranked: SummaryCandidate[],
): string {
  const parts: string[] = [performanceSentence(ctx)];

  const primary = ranked[0];
  if (primary) {
    parts.push(themeDetailSentence(ctx, primary));
  }

  const secondary = ranked.find((c) => c.id !== primary?.id);
  if (secondary && secondary.severity !== "info") {
    parts.push(themeDetailSentence(ctx, secondary));
  } else {
    const gap = branchGapSentence(ctx);
    if (gap) parts.push(gap);
    else {
      const funnel = funnelSentence(ctx);
      if (funnel) parts.push(funnel);
    }
  }

  return parts.join(" ");
}

function buildPriorities(ranked: SummaryCandidate[]): string[] {
  return ranked.slice(0, 3).map(themePriorityLine);
}

export function buildExecutiveSummary(ctx: SummaryContext): ExecutiveSummary {
  const ranked = rankCandidates(ctx);
  const primary = ranked[0] ?? null;

  return {
    source: "engine",
    headline: buildHeadline(ctx, primary),
    body: buildBody(ctx, ranked),
    severity: primary?.severity ?? "info",
    verb: primary?.verb ?? "Review",
    href: primary?.href ?? "/",
    cta: primary?.cta ?? "View dashboard",
    highlights: buildSummaryHighlights(ctx),
    priorities: buildPriorities(ranked),
  };
}

/** @deprecated Use buildExecutiveSummary */
export const buildDeterministicSummary = buildExecutiveSummary;
