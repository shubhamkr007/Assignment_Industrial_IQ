import type { Dataset, Filters, Lead } from "@/lib/types";
import { AS_OF_LABEL } from "@/lib/types";
import { getDataset } from "@/lib/data";
import { parseFilters, uniqueModels, uniqueSources } from "@/lib/metrics/filters";
import { monthsInRange, previousPeriod } from "@/lib/metrics/period";
import {
  computeKpis,
  lostReasonMix,
  monthlySeries,
  periodLeads,
  snapshotOpen,
  sourceMix,
  staleOpenLeads,
  type KpiSet,
  type MonthlyPoint,
} from "@/lib/metrics/aggregates";
import {
  branchScorecards,
  peerFunnel,
  type BranchScorecard,
} from "@/lib/metrics/branches";
import { cohortFunnel, type FunnelStep } from "@/lib/metrics/aggregates";
import { deliveryOps, waitingOrders, type DeliveryOps } from "@/lib/metrics/deliveries";
import { buildInsights, type Insight } from "@/lib/insights";
import { repScorecards, type RepScorecard } from "@/lib/metrics/reps";

export interface DashboardModel {
  dataset: Dataset;
  filters: Filters;
  asOf: string;
  kpis: KpiSet;
  previousKpis: KpiSet | null;
  previousLabel: string | null;
  cards: BranchScorecard[];
  funnel: FunnelStep[];
  peer: FunnelStep[] | null;
  insights: Insight[];
  monthly: MonthlyPoint[];
  sources: ReturnType<typeof sourceMix>;
  lostReasons: ReturnType<typeof lostReasonMix>;
  ops: DeliveryOps;
  waiting: Lead[];
  stale: Lead[];
  open: Lead[];
  officers: RepScorecard[];
  sourceOptions: string[];
  modelOptions: string[];
  created: Lead[];
  scoped: Lead[];
}

export function buildDashboard(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardModel {
  const dataset = getDataset();
  const filters = parseFilters(searchParams);
  const scoped = dataset.leads.filter((lead) => {
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.model && lead.model_interested !== filters.model) return false;
    return true;
  });
  const created = periodLeads(scoped, filters);
  const funnelSource = created.length > 0 ? created : scoped;
  const cards = branchScorecards(dataset, filters);
  const prior = previousPeriod(filters.range);
  const previousKpis = prior
    ? computeKpis(dataset, scoped, { ...filters, range: prior })
    : null;
  const months = monthsInRange(
    filters.range.key === "december" || filters.range.key === "all"
      ? new Date("2025-06-01T00:00:00.000Z")
      : filters.range.from,
    filters.range.to,
  );

  return {
    dataset,
    filters,
    asOf: AS_OF_LABEL,
    kpis: computeKpis(dataset, scoped, filters),
    previousKpis,
    previousLabel: prior?.label ?? null,
    cards,
    funnel: cohortFunnel(scoped),
    peer: filters.branchId ? peerFunnel(dataset, filters, filters.branchId) : null,
    insights: buildInsights(dataset, filters, searchParams),
    monthly: monthlySeries(dataset, scoped, months),
    sources: sourceMix(funnelSource),
    lostReasons: lostReasonMix(funnelSource),
    ops: deliveryOps(dataset, filters),
    waiting: waitingOrders(scoped),
    stale: staleOpenLeads(scoped, 7),
    open: snapshotOpen(scoped),
    officers: repScorecards(dataset, filters, filters.branchId),
    sourceOptions: uniqueSources(dataset),
    modelOptions: uniqueModels(dataset),
    created,
    scoped,
  };
}
