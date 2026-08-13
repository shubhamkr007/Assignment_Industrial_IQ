import type { Dataset, Filters, Lead } from "@/lib/types";
import { deliveriesInRange } from "@/lib/metrics/aggregates";

export interface DelayMixRow {
  reason: string;
  count: number;
}

export interface DeliveryOps {
  count: number;
  delayed: number;
  delayRate: number;
  medianDays: number | null;
  mix: DelayMixRow[];
}

export function deliveryOps(
  dataset: Dataset,
  filters: Filters,
): DeliveryOps {
  const leadById = new Map(dataset.leads.map((lead) => [lead.id, lead]));
  const rows = deliveriesInRange(dataset.deliveries, leadById, filters);
  const delayed = rows.filter((row) => row.delay_reason);
  const mixMap = new Map<string, number>();
  for (const row of delayed) {
    const reason = row.delay_reason || "Unspecified";
    mixMap.set(reason, (mixMap.get(reason) ?? 0) + 1);
  }
  const days = rows.map((row) => row.days_to_deliver).sort((a, b) => a - b);
  const median =
    days.length === 0
      ? null
      : days.length % 2 === 0
        ? (days[days.length / 2 - 1] + days[days.length / 2]) / 2
        : days[Math.floor(days.length / 2)];

  return {
    count: rows.length,
    delayed: delayed.length,
    delayRate: rows.length === 0 ? 0 : delayed.length / rows.length,
    medianDays: median,
    mix: [...mixMap.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export function waitingOrders(leads: Lead[]): Lead[] {
  return leads
    .filter((lead) => lead.status === "order_placed")
    .sort(
      (a, b) =>
        new Date(a.last_activity_at).getTime() -
        new Date(b.last_activity_at).getTime(),
    );
}
