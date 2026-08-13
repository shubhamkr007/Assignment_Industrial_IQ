import type { Dataset, Filters, Lead } from "@/lib/types";
import { historyHas, lostWithoutContact } from "@/lib/metrics/leads";
import {
  cohortFunnel,
  computeKpis,
  type FunnelStep,
  type KpiSet,
} from "@/lib/metrics/aggregates";

export type BranchHealth = "playbook" | "fire" | "watch" | "steady";

export interface BranchScorecard {
  id: string;
  name: string;
  city: string;
  kpis: KpiSet;
  funnel: FunnelStep[];
  conversion: number;
  contactRate: number;
  neverContactedLost: number;
  officerCount: number;
  leadCount: number;
  delivered: number;
  health: BranchHealth;
}

function conversionOf(leads: Lead[]): number {
  if (leads.length === 0) return 0;
  return leads.filter((lead) => lead.status === "delivered").length / leads.length;
}

export function branchScorecards(
  dataset: Dataset,
  filters: Filters,
): BranchScorecard[] {
  const cards = dataset.branches.map((branch) => {
    const branchFilters: Filters = { ...filters, branchId: branch.id };
    const scoped = dataset.leads.filter((lead) => {
      if (lead.branch_id !== branch.id) return false;
      if (filters.source && lead.source !== filters.source) return false;
      if (filters.model && lead.model_interested !== filters.model) return false;
      return true;
    });
    const kpis = computeKpis(dataset, scoped, branchFilters);
    const officers = dataset.sales_reps.filter(
      (rep) => rep.branch_id === branch.id && rep.role === "sales_officer",
    );
    const delivered = scoped.filter((lead) => lead.status === "delivered").length;

    return {
      id: branch.id,
      name: branch.name,
      city: branch.city,
      kpis,
      funnel: cohortFunnel(scoped),
      conversion: conversionOf(scoped),
      contactRate:
        scoped.filter((lead) => historyHas(lead, "contacted")).length /
        Math.max(scoped.length, 1),
      neverContactedLost: scoped.filter(lostWithoutContact).length,
      officerCount: officers.length,
      leadCount: scoped.length,
      delivered,
      health: "steady" as BranchHealth,
    };
  });

  const ranked = [...cards].sort((a, b) => b.conversion - a.conversion);
  const bestId = ranked[0]?.id;
  const worstId = ranked[ranked.length - 1]?.id;

  return cards.map((card) => {
    let health: BranchHealth = "steady";
    if (card.id === worstId || card.conversion < 0.12) health = "fire";
    else if (card.id === bestId) health = "playbook";
    else if (card.conversion < ranked[1]?.conversion - 0.02) health = "watch";
    return { ...card, health };
  });
}

export function peerFunnel(
  dataset: Dataset,
  filters: Filters,
  excludeBranchId: string,
): FunnelStep[] {
  const peers = dataset.leads.filter((lead) => {
    if (lead.branch_id === excludeBranchId) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.model && lead.model_interested !== filters.model) return false;
    return true;
  });
  return cohortFunnel(peers);
}
