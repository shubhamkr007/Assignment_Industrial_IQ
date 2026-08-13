import type { Lead, LeadStatus, StatusEvent } from "@/lib/types";

export function historyHas(lead: Lead, status: LeadStatus): boolean {
  return lead.status_history.some((event) => event.status === status);
}

export function firstEvent(lead: Lead, status: LeadStatus): StatusEvent | null {
  return lead.status_history.find((event) => event.status === status) ?? null;
}

export function eventTime(lead: Lead, status: LeadStatus): Date | null {
  const event = firstEvent(lead, status);
  return event ? new Date(event.timestamp) : null;
}

export function neverContacted(lead: Lead): boolean {
  return !historyHas(lead, "contacted");
}

export function lostWithoutContact(lead: Lead): boolean {
  return lead.status === "lost" && neverContacted(lead);
}

export function isNewToLost(lead: Lead): boolean {
  if (lead.status !== "lost") return false;
  const statuses = lead.status_history.map((event) => event.status);
  return (
    statuses.length === 2 &&
    statuses[0] === "new" &&
    statuses[1] === "lost"
  );
}

export function firstResponseHours(lead: Lead): number | null {
  const contacted = eventTime(lead, "contacted");
  if (!contacted) return null;
  return (contacted.getTime() - new Date(lead.created_at).getTime()) / 3_600_000;
}

export function lostAfterHours(lead: Lead): number | null {
  const lost = eventTime(lead, "lost");
  if (!lost) return null;
  return (lost.getTime() - new Date(lead.created_at).getTime()) / 3_600_000;
}

export function inRange(date: Date, from: Date, to: Date): boolean {
  return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
}

export function createdInRange(lead: Lead, from: Date, to: Date): boolean {
  return inRange(new Date(lead.created_at), from, to);
}

export function closedInRange(lead: Lead, from: Date, to: Date): boolean {
  if (lead.status === "delivered") {
    const delivered = eventTime(lead, "delivered");
    return delivered ? inRange(delivered, from, to) : false;
  }
  if (lead.status === "lost") {
    const lost = eventTime(lead, "lost");
    return lost ? inRange(lost, from, to) : false;
  }
  return false;
}

export function bookedInRange(lead: Lead, from: Date, to: Date): boolean {
  const ordered = eventTime(lead, "order_placed");
  return ordered ? inRange(ordered, from, to) : false;
}

export function dwellHours(
  lead: Lead,
  fromStatus: LeadStatus,
  toStatus: LeadStatus,
): number | null {
  const from = eventTime(lead, fromStatus);
  const to = eventTime(lead, toStatus);
  if (!from || !to) return null;
  return (to.getTime() - from.getTime()) / 3_600_000;
}
