import type { Dataset, Filters, Lead } from "@/lib/types";
import { getPeriod } from "@/lib/metrics/period";

export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): Filters {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const view = read("view") || "ceo";
  const requestedBranch = read("branch") || null;
  const branchId =
    view !== "ceo" && !requestedBranch ? view : requestedBranch;

  return {
    range: getPeriod(read("period")),
    branchId: branchId && branchId !== "ceo" ? branchId : null,
    source: read("source") || null,
    model: read("model") || null,
    view,
  };
}

export function filterLeads(leads: Lead[], filters: Filters): Lead[] {
  return leads.filter((lead) => {
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.model && lead.model_interested !== filters.model) return false;
    return true;
  });
}

export function uniqueSources(dataset: Dataset): string[] {
  return [...new Set(dataset.leads.map((lead) => lead.source))].sort();
}

export function uniqueModels(dataset: Dataset): string[] {
  return [...new Set(dataset.leads.map((lead) => lead.model_interested))].sort();
}

export function queryString(
  current: Record<string, string | string[] | undefined>,
  patch: Record<string, string | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    const resolved = Array.isArray(value) ? value[0] : value;
    if (resolved) params.set(key, resolved);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (!value) params.delete(key);
    else params.set(key, value);
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}
