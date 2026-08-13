"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  cleanNote,
  formatDays,
  formatInr,
  maskPhone,
  sourceLabel,
  statusLabel,
} from "@/lib/format";
import { idleDays } from "@/lib/metrics/aggregates";
import type { Lead, SalesRep } from "@/lib/types";
import { cn } from "@/lib/format";

export function LeadExplorer({
  title,
  hint,
  leads,
  reps,
  empty,
}: {
  title: string;
  hint?: string;
  leads: Lead[];
  reps: SalesRep[];
  empty: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const repById = useMemo(
    () => new Map(reps.map((rep) => [rep.id, rep])),
    [reps],
  );
  const filtered =
    status === "all" ? leads : leads.filter((lead) => lead.status === status);
  const selected = leads.find((lead) => lead.id === selectedId) ?? null;

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{title}</CardTitle>
            {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-line bg-paper px-2 py-1 text-xs"
          >
            <option value="all">All statuses</option>
            {[
              "new",
              "contacted",
              "test_drive",
              "negotiation",
              "order_placed",
              "delivered",
              "lost",
            ].map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-soft">{empty}</p>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.slice(0, 40).map((lead) => {
                const rep = repById.get(lead.assigned_to);
                return (
                  <li key={lead.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(lead.id)}
                      className="flex w-full items-start justify-between gap-3 py-3 text-left hover:bg-paper-2/60 rounded-lg px-1"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lead.customer_name}</p>
                        <p className="truncate text-xs text-ink-soft">
                          {lead.model_interested} · {sourceLabel(lead.source)} ·{" "}
                          {rep?.name ?? "Unassigned"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          tone={
                            lead.status === "lost"
                              ? "danger"
                              : lead.status === "delivered"
                                ? "ok"
                                : lead.status === "order_placed"
                                  ? "copper"
                                  : "neutral"
                          }
                        >
                          {statusLabel(lead.status)}
                        </Badge>
                        <p className="mt-1 text-xs tabular text-ink-soft">
                          {formatInr(lead.deal_value)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {filtered.length > 40 ? (
            <p className="pt-2 text-xs text-ink-soft">
              Showing 40 of {filtered.length}. Open a row for the journey.
            </p>
          ) : null}
        </CardBody>
      </Card>
      {selected ? (
        <LeadDrawer
          lead={selected}
          rep={repById.get(selected.assigned_to) ?? null}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </>
  );
}

function LeadDrawer({
  lead,
  rep,
  onClose,
}: {
  lead: Lead;
  rep: SalesRep | null;
  onClose: () => void;
}) {
  const nextStep =
    lead.status === "lost"
      ? "Review before reopening. Log contact attempts and reason for loss."
      : lead.status === "order_placed"
        ? "Follow up on allocation, registration, or financing."
        : lead.status === "new"
          ? "Contact within 24 hours per SLA."
          : "Advance to the next stage or log a reason for delay.";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/30"
        aria-label="Close lead"
        onClick={onClose}
      />
      <aside className="relative h-full w-full max-w-md overflow-y-auto bg-paper-raised shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              {lead.id}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{lead.customer_name}</h2>
            <p className="text-sm text-ink-soft">
              {maskPhone(lead.phone)} · {lead.model_interested}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-xs"
          >
            Close
          </button>
        </div>
        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Meta label="Value" value={formatInr(lead.deal_value, false)} />
            <Meta label="Source" value={sourceLabel(lead.source)} />
            <Meta label="Officer" value={rep?.name ?? "Unassigned"} />
            <Meta label="Idle" value={formatDays(idleDays(lead))} />
          </div>
          {lead.lost_reason ? (
            <p className="rounded-2xl bg-danger-soft px-3 py-2 text-sm text-danger">
              Lost reason: {lead.lost_reason}
            </p>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              Next step
            </p>
            <p className="mt-1 text-sm">{nextStep}</p>
          </div>
          <ol className="space-y-4">
            {lead.status_history.map((event, index) => (
              <li key={`${event.status}-${event.timestamp}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-1 h-2.5 w-2.5 rounded-full",
                      event.status === "lost" ? "bg-danger" : "bg-accent",
                    )}
                  />
                  {index < lead.status_history.length - 1 ? (
                    <span className="w-px flex-1 bg-line" />
                  ) : null}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium">{statusLabel(event.status)}</p>
                  <p className="text-xs text-ink-soft">
                    {new Date(event.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {cleanNote(event.note)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
