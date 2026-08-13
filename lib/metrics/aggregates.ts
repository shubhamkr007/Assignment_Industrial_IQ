import type { Dataset, Delivery, Filters, Lead, Target } from "@/lib/types";
import { AS_OF, FUNNEL_STAGES, OPEN_PRE_ORDER_STATUSES } from "@/lib/types";
import { daysBetween, median, monthKey } from "@/lib/format";
import {
  bookedInRange,
  createdInRange,
  eventTime,
  firstResponseHours,
  historyHas,
  lostWithoutContact,
  neverContacted,
} from "@/lib/metrics/leads";
import { monthsInRange } from "@/lib/metrics/period";

export interface FunnelStep {
  stage: (typeof FUNNEL_STAGES)[number];
  reached: number;
  conversionFromPrevious: number | null;
  conversionFromStart: number;
}

export function cohortFunnel(leads: Lead[]): FunnelStep[] {
  const total = leads.length;
  return FUNNEL_STAGES.map((stage, index) => {
    const reached = leads.filter((lead) => historyHas(lead, stage)).length;
    const previous =
      index === 0
        ? total
        : leads.filter((lead) => historyHas(lead, FUNNEL_STAGES[index - 1])).length;
    return {
      stage,
      reached,
      conversionFromPrevious: previous === 0 ? null : reached / previous,
      conversionFromStart: total === 0 ? 0 : reached / total,
    };
  });
}

export function periodLeads(leads: Lead[], filters: Filters): Lead[] {
  return leads.filter((lead) =>
    createdInRange(lead, filters.range.from, filters.range.to),
  );
}

export function snapshotOpen(leads: Lead[]): Lead[] {
  return leads.filter((lead) => OPEN_PRE_ORDER_STATUSES.includes(lead.status));
}

export function soldNotDelivered(leads: Lead[]): Lead[] {
  return leads.filter((lead) => lead.status === "order_placed");
}

export function idleDays(lead: Lead): number {
  return daysBetween(new Date(lead.last_activity_at), AS_OF);
}

export function waitSinceOrder(lead: Lead): number | null {
  const ordered = eventTime(lead, "order_placed");
  if (!ordered) return null;
  return daysBetween(ordered, AS_OF);
}

export function deliveriesInRange(
  deliveries: Delivery[],
  leadById: Map<string, Lead>,
  filters: Filters,
): Delivery[] {
  return deliveries.filter((delivery) => {
    const date = new Date(`${delivery.delivery_date}T12:00:00.000Z`);
    if (date < filters.range.from || date > filters.range.to) return false;
    const lead = leadById.get(delivery.lead_id);
    if (!lead) return false;
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.model && lead.model_interested !== filters.model) return false;
    return true;
  });
}

export function targetsFor(
  targets: Target[],
  filters: Filters,
): { units: number; revenue: number } {
  const months = new Set(monthsInRange(filters.range.from, filters.range.to));
  const rows = targets.filter((target) => {
    if (!months.has(target.month)) return false;
    if (filters.branchId && target.branch_id !== filters.branchId) return false;
    return true;
  });
  return {
    units: rows.reduce((sum, row) => sum + row.target_units, 0),
    revenue: rows.reduce((sum, row) => sum + row.target_revenue, 0),
  };
}

export interface KpiSet {
  retailUnits: number;
  retailRevenue: number;
  targetUnits: number;
  targetRevenue: number;
  bookings: number;
  bookingValue: number;
  intake: number;
  closedWon: number;
  closedLost: number;
  winRate: number | null;
  contactRate: number | null;
  firstResponseMedianHours: number | null;
  sla24HitRate: number | null;
  testDriveRate: number | null;
  openPipeline: number;
  soldWaiting: number;
  neverContactedLost: number;
  delayedDeliveries: number;
  medianDaysToDeliver: number | null;
}

export function computeKpis(
  dataset: Dataset,
  scopedLeads: Lead[],
  filters: Filters,
): KpiSet {
  const leadById = new Map(dataset.leads.map((lead) => [lead.id, lead]));
  const retail = deliveriesInRange(dataset.deliveries, leadById, filters);
  const retailRevenue = retail.reduce((sum, delivery) => {
    return sum + (leadById.get(delivery.lead_id)?.deal_value ?? 0);
  }, 0);
  const created = periodLeads(scopedLeads, filters);
  const booked = scopedLeads.filter((lead) =>
    bookedInRange(lead, filters.range.from, filters.range.to),
  );
  const won = created.filter((lead) => lead.status === "delivered");
  const lost = created.filter((lead) => lead.status === "lost");
  const closed = won.length + lost.length;
  const contacted = created.filter((lead) => historyHas(lead, "contacted"));
  const testDrives = created.filter((lead) => historyHas(lead, "test_drive"));
  const responses = contacted
    .map(firstResponseHours)
    .filter((hours): hours is number => hours !== null);
  const slaHits = responses.filter((hours) => hours <= 24).length;
  const delayed = retail.filter((delivery) => delivery.delay_reason).length;
  const days = retail.map((delivery) => delivery.days_to_deliver);
  const target = targetsFor(dataset.targets, filters);

  return {
    retailUnits: retail.length,
    retailRevenue,
    targetUnits: target.units,
    targetRevenue: target.revenue,
    bookings: booked.length,
    bookingValue: booked.reduce((sum, lead) => sum + lead.deal_value, 0),
    intake: created.length,
    closedWon: won.length,
    closedLost: lost.length,
    winRate: closed === 0 ? null : won.length / closed,
    contactRate: created.length === 0 ? null : contacted.length / created.length,
    firstResponseMedianHours: median(responses),
    sla24HitRate: responses.length === 0 ? null : slaHits / responses.length,
    testDriveRate:
      contacted.length === 0 ? null : testDrives.length / contacted.length,
    openPipeline: snapshotOpen(scopedLeads).length,
    soldWaiting: soldNotDelivered(scopedLeads).length,
    neverContactedLost: scopedLeads.filter(lostWithoutContact).length,
    delayedDeliveries: delayed,
    medianDaysToDeliver: median(days),
  };
}

export function monthlyRetail(
  dataset: Dataset,
  scopedLeads: Lead[],
): { month: string; units: number; revenue: number }[] {
  const allowed = new Set(scopedLeads.map((lead) => lead.id));
  const leadById = new Map(dataset.leads.map((lead) => [lead.id, lead]));
  const buckets = new Map<string, { units: number; revenue: number }>();

  for (const delivery of dataset.deliveries) {
    if (!allowed.has(delivery.lead_id)) continue;
    const key = monthKey(new Date(`${delivery.delivery_date}T12:00:00.000Z`));
    const current = buckets.get(key) ?? { units: 0, revenue: 0 };
    current.units += 1;
    current.revenue += leadById.get(delivery.lead_id)?.deal_value ?? 0;
    buckets.set(key, current);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, ...value }));
}

export interface MonthlyPoint {
  month: string;
  units: number;
  revenue: number;
  bookings: number;
}

export function monthlySeries(
  dataset: Dataset,
  scopedLeads: Lead[],
  months: string[],
): MonthlyPoint[] {
  const allowed = new Set(scopedLeads.map((lead) => lead.id));
  const leadById = new Map(dataset.leads.map((lead) => [lead.id, lead]));
  const retail = new Map<string, { units: number; revenue: number }>();
  const bookings = new Map<string, number>();

  for (const delivery of dataset.deliveries) {
    if (!allowed.has(delivery.lead_id)) continue;
    const key = monthKey(new Date(`${delivery.delivery_date}T12:00:00.000Z`));
    const current = retail.get(key) ?? { units: 0, revenue: 0 };
    current.units += 1;
    current.revenue += leadById.get(delivery.lead_id)?.deal_value ?? 0;
    retail.set(key, current);
  }

  for (const lead of scopedLeads) {
    const ordered = eventTime(lead, "order_placed");
    if (!ordered) continue;
    const key = monthKey(ordered);
    bookings.set(key, (bookings.get(key) ?? 0) + 1);
  }

  return months.map((month) => ({
    month,
    units: retail.get(month)?.units ?? 0,
    revenue: retail.get(month)?.revenue ?? 0,
    bookings: bookings.get(month) ?? 0,
  }));
}

export function lostReasonMix(leads: Lead[]): { reason: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const lead of leads.filter((item) => item.status === "lost")) {
    const reason = lead.lost_reason || "Unspecified";
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function sourceMix(leads: Lead[]): {
  source: string;
  leads: number;
  delivered: number;
  conversion: number;
}[] {
  const groups = new Map<string, { leads: number; delivered: number }>();
  for (const lead of leads) {
    const current = groups.get(lead.source) ?? { leads: 0, delivered: 0 };
    current.leads += 1;
    if (lead.status === "delivered") current.delivered += 1;
    groups.set(lead.source, current);
  }
  return [...groups.entries()]
    .map(([source, value]) => ({
      source,
      leads: value.leads,
      delivered: value.delivered,
      conversion: value.leads === 0 ? 0 : value.delivered / value.leads,
    }))
    .sort((a, b) => b.leads - a.leads);
}

export function uncontactedLostCount(leads: Lead[]): number {
  return leads.filter(lostWithoutContact).length;
}

export function newToLostCount(leads: Lead[]): number {
  return leads.filter((lead) => {
    if (lead.status !== "lost") return false;
    const statuses = lead.status_history.map((event) => event.status);
    return statuses.length === 2 && statuses[0] === "new" && statuses[1] === "lost";
  }).length;
}

export function staleOpenLeads(leads: Lead[], minDays = 7): Lead[] {
  return snapshotOpen(leads).filter((lead) => idleDays(lead) >= minDays);
}

export function neverContactedOpen(leads: Lead[]): Lead[] {
  return snapshotOpen(leads).filter(neverContacted);
}
