import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDays, formatPercent } from "@/lib/format";
import type { DeliveryOps } from "@/lib/metrics/deliveries";
import type { Lead } from "@/lib/types";
import { waitSinceOrder } from "@/lib/metrics/aggregates";

export function DelayPanel({
  ops,
  waiting,
}: {
  ops: DeliveryOps;
  waiting: Lead[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Delivery ops</CardTitle>
          <p className="mt-1 text-xs text-ink-soft">
            Orders placed but not yet delivered. Median delivery time in this dataset is about 17 days.
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="Retail in period" value={`${ops.count}`} />
          <Stat
            label="Delayed"
            value={`${ops.delayed} · ${formatPercent(ops.delayRate, 0)}`}
          />
          <Stat
            label="Median days"
            value={ops.medianDays == null ? "—" : formatDays(ops.medianDays)}
          />
        </div>
        {ops.mix.length > 0 ? (
          <ul className="space-y-2">
            {ops.mix.slice(0, 6).map((row) => (
              <li key={row.reason} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-soft">{row.reason}</span>
                <span className="tabular">{row.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">No delay reasons in this slice.</p>
        )}
        {waiting.length > 0 ? (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
              Sold, not delivered
            </p>
            <ul className="mt-2 space-y-2">
              {waiting.slice(0, 5).map((lead) => (
                <li key={lead.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    {lead.customer_name}
                    <span className="text-ink-soft"> · {lead.model_interested}</span>
                  </span>
                  <span className="tabular text-ink-soft">
                    {formatDays(waitSinceOrder(lead) ?? 0)} waiting
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper-2/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 tabular font-medium">{value}</p>
    </div>
  );
}
