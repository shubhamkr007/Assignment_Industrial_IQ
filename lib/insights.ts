import type { Dataset, Filters } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { queryString } from "@/lib/metrics/filters";
import {
  computeKpis,
  newToLostCount,
  periodLeads,
  snapshotOpen,
  soldNotDelivered,
  sourceMix,
  staleOpenLeads,
  uncontactedLostCount,
} from "@/lib/metrics/aggregates";
import { branchScorecards } from "@/lib/metrics/branches";
import { idleDays, waitSinceOrder } from "@/lib/metrics/aggregates";
import { repScorecards } from "@/lib/metrics/reps";

export type InsightSeverity = "critical" | "warning" | "info";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  verb: string;
  title: string;
  body: string;
  count?: number;
  value?: number;
  href: string;
  cta: string;
}

export function buildInsights(
  dataset: Dataset,
  filters: Filters,
  searchParams: Record<string, string | string[] | undefined>,
): Insight[] {
  const insights: Insight[] = [];
  const cards = branchScorecards(dataset, filters);
  const ranked = [...cards].sort((a, b) => a.conversion - b.conversion);
  const worst = ranked[0];
  const best = ranked[ranked.length - 1];
  const scoped = dataset.leads.filter((lead) => {
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.model && lead.model_interested !== filters.model) return false;
    return true;
  });
  const created = periodLeads(scoped, filters);
  const kpis = computeKpis(dataset, scoped, filters);
  const qs = (patch: Record<string, string | null>) =>
    queryString(searchParams, patch);

  if (worst && best && worst.id !== best.id && worst.conversion < best.conversion) {
    const cohort = worst.leadCount || 1;
    const actual = worst.delivered;
    const ifConverted = Math.round(cohort * best.conversion);
    const lift = Math.max(ifConverted - actual, 0);
    const manager = dataset.sales_reps.find(
      (rep) => rep.branch_id === worst.id && rep.role === "branch_manager",
    );
    const officers = repScorecards(dataset, filters, worst.id);
    const allWeak = officers.every((officer) => officer.conversion < 0.12);
    const neverContacted = worst.neverContactedLost;

    insights.push({
      id: "roof-collapse",
      severity: "critical",
      verb: manager ? `Contact ${manager.name.split(" ")[0]}` : "Review branch",
      title: `${worst.name} has significantly lower conversion than ${best.name}.`,
      body: `${worst.name} converted ${formatPercent(worst.conversion)} of leads compared with ${formatPercent(best.conversion)} at ${best.name}. ${neverContacted} leads were lost without first contact.${allWeak ? " All sales officers at this branch are below 12% conversion." : ""} Matching ${best.name.split(" ")[0]}'s rate on the same ${cohort} leads would mean roughly ${ifConverted} deliveries instead of ${actual} — a ${lift}-unit difference.`,
      count: neverContacted,
      href: `/branches/${worst.id}${qs({ branch: worst.id })}`,
      cta: `View ${worst.name.split(" ")[0]}`,
    });
  }

  const uncontacted = uncontactedLostCount(scoped);
  const newToLost = newToLostCount(scoped);
  if (uncontacted >= 10) {
    insights.push({
      id: "house-rule",
      severity: "critical",
      verb: "Set contact policy",
      title: "Leads are being lost without first contact.",
      body: `${uncontacted} lost leads never reached the contacted stage. ${newToLost} journeys went directly from new to lost. Require a logged contact attempt before marking a lead as lost from the new stage.`,
      count: uncontacted,
      href: `/${qs({ period: "all" })}`,
      cta: "View uncontacted losses",
    });
  }

  const waiting = soldNotDelivered(scoped);
  if (waiting.length > 0) {
    const downtown = dataset.branches.find((branch) => branch.id === "B1");
    const downtownWaiting = waiting.filter((lead) => lead.branch_id === "B1");
    const longest = [...waiting].sort(
      (a, b) => (waitSinceOrder(b) ?? 0) - (waitSinceOrder(a) ?? 0),
    )[0];
    insights.push({
      id: "sold-waiting",
      severity: "warning",
      verb: "Review deliveries",
      title: `${waiting.length} customers have placed orders and are still waiting for delivery.`,
      body: `Median delivery time in this dataset is ${kpis.medianDaysToDeliver?.toFixed(0) ?? 17} days. ${downtown ? `${downtown.name} has the longest median wait.` : ""} Oldest open order: ${longest.customer_name} (${longest.model_interested}).`,
      count: waiting.length,
      value: waiting.reduce((sum, lead) => sum + lead.deal_value, 0),
      href: downtownWaiting.length
        ? `/branches/B1${qs({ branch: "B1" })}`
        : `/${qs({})}`,
      cta: "Review waiting orders",
    });
  }

  const sources = sourceMix(created.length > 0 ? created : scoped);
  const walkIn = sources.find((row) => row.source === "walk_in");
  const social = sources.find((row) => row.source === "social_media");
  if (walkIn && social && walkIn.conversion > social.conversion * 1.5) {
    insights.push({
      id: "channel-quality",
      severity: "warning",
      verb: "Review lead sources",
      title: "Walk-in leads convert better than social media.",
      body: `Walk-in converts at ${formatPercent(walkIn.conversion)} (${walkIn.leads} leads). Social media converts at ${formatPercent(social.conversion)} (${social.leads} leads). Consider adjusting staffing and follow-up by channel.`,
      href: `/${qs({ source: "social_media" })}`,
      cta: "Filter by social media",
    });
  }

  const stale = staleOpenLeads(scoped, 7);
  if (stale.length > 0) {
    insights.push({
      id: "aging",
      severity: stale.length >= 3 ? "warning" : "info",
      verb: "Follow up",
      title: `${stale.length} open lead${stale.length === 1 ? "" : "s"} idle 7+ days.`,
      body: stale
        .slice(0, 3)
        .map((lead) => {
          const rep = dataset.sales_reps.find((row) => row.id === lead.assigned_to);
          return `${lead.customer_name} (${Math.floor(idleDays(lead))}d, ${rep?.name ?? "unassigned"})`;
        })
        .join(" · "),
      count: stale.length,
      href: `/${qs({})}`,
      cta: "Open aging list",
    });
  }

  if (kpis.sla24HitRate !== null && kpis.sla24HitRate < 0.25) {
    insights.push({
      id: "sla",
      severity: "warning",
      verb: "Set 24-hour SLA",
      title: "Most leads are not contacted within 24 hours.",
      body: `Median first response is ${kpis.firstResponseMedianHours ? `${kpis.firstResponseMedianHours.toFixed(0)} hours` : "unknown"}. Only ${formatPercent(kpis.sla24HitRate)} of contacted leads were reached within 24 hours. Consider setting a first-response standard.`,
      href: `/${qs({})}`,
      cta: "See contact rate",
    });
  }

  const decemberFire = cards.find((card) => {
    const branchCreated = periodLeads(
      dataset.leads.filter((lead) => lead.branch_id === card.id),
      { ...filters, branchId: card.id },
    );
    if (filters.range.key !== "december") return false;
    if (branchCreated.length < 8) return false;
    const lost = branchCreated.filter((lead) => lead.status === "lost").length;
    return lost === branchCreated.length;
  });
  if (decemberFire) {
    insights.unshift({
      id: "december-wipeout",
      severity: "critical",
      verb: "Review December",
      title: `${decemberFire.name.split(" ")[0]} — December: ${decemberFire.kpis.intake} leads, ${decemberFire.kpis.intake} lost, 0 delivered.`,
      body: "All leads created in December at this branch were lost with no deliveries. Review branch performance for this period.",
      href: `/branches/${decemberFire.id}${qs({ period: "december", branch: decemberFire.id })}`,
      cta: "View branch",
    });
  }

  const open = snapshotOpen(scoped);
  if (open.length > 0 && kpis.bookings > 0) {
    insights.push({
      id: "pipeline-thin",
      severity: "info",
      verb: "Monitor pipeline",
      title: `Only ${open.length} active pre-order deal${open.length === 1 ? "" : "s"} in the pipeline.`,
      body: `${kpis.bookings} bookings in this period and ${kpis.soldWaiting} sold units awaiting delivery. Near-term retail depends on orders already placed rather than new enquiries.`,
      count: open.length,
      href: `/${qs({})}`,
      cta: "See snapshot",
    });
  }

  const order = ["december-wipeout", "roof-collapse", "house-rule", "sold-waiting", "sla", "channel-quality", "aging", "pipeline-thin"];
  return insights
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    .slice(0, 5);
}

export function heroCopy(insights: Insight[]): Insight | null {
  return insights[0] ?? null;
}

export function whatIfUnits(worstConversion: number, bestConversion: number, leads: number, actualDelivered: number): number {
  return Math.max(Math.round(leads * bestConversion) - actualDelivered, 0);
}
