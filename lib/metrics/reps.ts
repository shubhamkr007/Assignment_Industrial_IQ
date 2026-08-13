import type { Dataset, Filters, Lead, SalesRep } from "@/lib/types";
import { median } from "@/lib/format";
import {
  firstResponseHours,
  historyHas,
  lostWithoutContact,
} from "@/lib/metrics/leads";

export interface RepScorecard {
  rep: SalesRep;
  leads: number;
  delivered: number;
  lost: number;
  conversion: number;
  winRate: number | null;
  contactRate: number;
  neverContactedLost: number;
  firstResponseMedianHours: number | null;
  revenue: number;
}

export function repScorecards(
  dataset: Dataset,
  filters: Filters,
  branchId?: string | null,
): RepScorecard[] {
  const roof = branchId ?? filters.branchId;
  const officers = dataset.sales_reps.filter((rep) => {
    if (rep.role !== "sales_officer") return false;
    if (roof && rep.branch_id !== roof) return false;
    return true;
  });

  return officers
    .map((rep) => {
      const all = dataset.leads.filter((lead) => lead.assigned_to === rep.id);
      const scoped =
        filters.source || filters.model
          ? all.filter((lead) => {
              if (filters.source && lead.source !== filters.source) return false;
              if (filters.model && lead.model_interested !== filters.model)
                return false;
              return true;
            })
          : all;
      return scoreRep(rep, scoped);
    })
    .sort((a, b) => b.conversion - a.conversion);
}

export function scoreRep(rep: SalesRep, leads: Lead[]): RepScorecard {
  const delivered = leads.filter((lead) => lead.status === "delivered");
  const lost = leads.filter((lead) => lead.status === "lost");
  const closed = delivered.length + lost.length;
  const contacted = leads.filter((lead) => historyHas(lead, "contacted"));
  const responses = contacted
    .map(firstResponseHours)
    .filter((hours): hours is number => hours !== null);

  return {
    rep,
    leads: leads.length,
    delivered: delivered.length,
    lost: lost.length,
    conversion: leads.length === 0 ? 0 : delivered.length / leads.length,
    winRate: closed === 0 ? null : delivered.length / closed,
    contactRate: leads.length === 0 ? 0 : contacted.length / leads.length,
    neverContactedLost: leads.filter(lostWithoutContact).length,
    firstResponseMedianHours: median(responses),
    revenue: delivered.reduce((sum, lead) => sum + lead.deal_value, 0),
  };
}

export function officersForManager(
  dataset: Dataset,
  manager: SalesRep,
): SalesRep[] {
  return dataset.sales_reps.filter(
    (rep) =>
      rep.branch_id === manager.branch_id && rep.role === "sales_officer",
  );
}

export function leadsForRep(dataset: Dataset, repId: string): Lead[] {
  return dataset.leads.filter((lead) => lead.assigned_to === repId);
}
