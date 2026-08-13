import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPercent, sourceLabel } from "@/lib/format";

export function MixLists({
  sources,
  lostReasons,
}: {
  sources: { source: string; leads: number; delivered: number; conversion: number }[];
  lostReasons: { reason: string; count: number }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Channel performance</CardTitle>
            <p className="mt-1 text-xs text-ink-soft">
              Lead volume and conversion by source.
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          {sources.map((row) => (
            <div key={row.source} className="flex items-baseline justify-between gap-3 text-sm">
              <span>{sourceLabel(row.source)}</span>
              <span className="tabular text-ink-soft">
                {row.leads} leads · {formatPercent(row.conversion)}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Lost deal reasons</CardTitle>
            <p className="mt-1 text-xs text-ink-soft">
              Reasons recorded on closed-lost deals.
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          {lostReasons.length === 0 ? (
            <p className="text-sm text-ink-soft">No lost deals in this slice.</p>
          ) : (
            lostReasons.slice(0, 8).map((row) => (
              <div key={row.reason} className="flex items-baseline justify-between gap-3 text-sm">
                <span>{row.reason}</span>
                <span className="tabular text-ink-soft">{row.count}</span>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
