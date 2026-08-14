import type { DashboardModel } from "@/lib/dashboard";
import { formatInr, formatPercent } from "@/lib/format";
import type { SummaryContext, SummaryHighlight } from "@/lib/ai/types";

const HEALTH_LABEL: Record<string, string> = {
  fire: "at risk",
  playbook: "top performer",
  watch: "monitor",
  steady: "stable",
};

function buildScopeLabel(model: DashboardModel): string {
  const parts = [model.filters.range.label];
  if (model.filters.branchId) {
    const branch = model.dataset.branches.find((b) => b.id === model.filters.branchId);
    if (branch) parts.push(branch.name);
  }
  if (model.filters.source) parts.push(model.filters.source.replace(/_/g, " "));
  if (model.filters.model) parts.push(model.filters.model);
  return parts.join(" · ");
}

function primaryFunnelDrop(model: DashboardModel): string | null {
  const funnel = model.funnel;
  let worst: { stage: string; rate: number } | null = null;
  for (let i = 1; i < funnel.length; i++) {
    const step = funnel[i];
    const rate = step.conversionFromPrevious;
    if (rate == null) continue;
    if (!worst || rate < worst.rate) {
      worst = { stage: step.stage, rate };
    }
  }
  return worst?.stage ?? null;
}

function momChange(current: number, previous: number | null): number | null {
  if (previous == null || previous === 0) return null;
  return (current - previous) / previous;
}

export function buildSummaryContext(model: DashboardModel): SummaryContext {
  const ranked = [...model.cards].sort((a, b) => a.conversion - b.conversion);
  const branch = model.filters.branchId
    ? model.dataset.branches.find((b) => b.id === model.filters.branchId)
    : null;
  const retailUnits = model.kpis.retailUnits;
  const targetUnits = model.kpis.targetUnits;

  return {
    period: model.filters.range.label,
    asOf: model.asOf,
    scopeLabel: buildScopeLabel(model),
    branchId: model.filters.branchId,
    branchName: branch?.name ?? null,
    kpis: {
      retailUnits,
      targetUnits,
      bookings: model.kpis.bookings,
      neverContactedLost: model.kpis.neverContactedLost,
      soldWaiting: model.kpis.soldWaiting,
      sla24HitRate: model.kpis.sla24HitRate,
      firstResponseMedianHours: model.kpis.firstResponseMedianHours,
      contactRate: model.kpis.contactRate,
      retailRevenue: model.kpis.retailRevenue,
    },
    previousRetailUnits: model.previousKpis?.retailUnits ?? null,
    targetAttainment: targetUnits > 0 ? retailUnits / targetUnits : null,
    retailMomChange: momChange(retailUnits, model.previousKpis?.retailUnits ?? null),
    branches: ranked.map((card) => ({
      name: card.name,
      health: HEALTH_LABEL[card.health] ?? card.health,
      conversion: card.conversion,
      neverContactedLost: card.neverContactedLost,
    })),
    candidates: model.insights.map((insight) => ({
      id: insight.id,
      severity: insight.severity,
      title: insight.title,
      body: insight.body,
      verb: insight.verb,
      href: insight.href,
      cta: insight.cta,
      count: insight.count,
      value: insight.value,
    })),
    primaryFunnelDrop: primaryFunnelDrop(model),
  };
}

export function buildSummaryHighlights(ctx: SummaryContext): SummaryHighlight[] {
  const highlights: SummaryHighlight[] = [
    { label: "Retail units", value: String(ctx.kpis.retailUnits) },
    { label: "Target", value: String(ctx.kpis.targetUnits) },
    { label: "Never contacted", value: String(ctx.kpis.neverContactedLost) },
    { label: "Awaiting delivery", value: String(ctx.kpis.soldWaiting) },
  ];

  if (ctx.kpis.contactRate != null) {
    highlights.push({
      label: "Contact rate",
      value: formatPercent(ctx.kpis.contactRate),
    });
  }

  if (ctx.kpis.sla24HitRate != null) {
    highlights.push({
      label: "24h SLA",
      value: formatPercent(ctx.kpis.sla24HitRate),
    });
  }

  highlights.push({
    label: "Retail revenue",
    value: formatInr(ctx.kpis.retailRevenue),
  });

  return highlights;
}
