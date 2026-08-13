import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPercent, statusLabel } from "@/lib/format";
import type { FunnelStep } from "@/lib/metrics/aggregates";
import { cn } from "@/lib/format";

export function FunnelChart({
  funnel,
  peer,
  caption,
  highlightDrop,
}: {
  funnel: FunnelStep[];
  peer?: FunnelStep[] | null;
  caption?: string;
  highlightDrop?: string;
}) {
  const max = Math.max(...funnel.map((step) => step.reached), 1);
  const useShare = Boolean(peer);

  if (funnel.length === 0 || funnel[0]?.reached === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Diagnostic funnel</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-soft">No leads in this slice to funnel.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Diagnostic funnel</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Stage drop-off by lead count. Gray bars show peer branch average.
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {funnel.map((step, index) => {
          const peerStep = peer?.find((row) => row.stage === step.stage);
          const isDrop =
            highlightDrop === step.stage ||
            (step.conversionFromPrevious !== null &&
              step.conversionFromPrevious < 0.7 &&
              index > 0);
          return (
            <div key={step.stage}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{statusLabel(step.stage)}</span>
                <span className="tabular text-ink-soft">
                  {step.reached}
                  {step.conversionFromPrevious != null ? (
                    <span className={cn(isDrop ? "text-danger" : "text-ink-soft")}>
                      {" "}
                      · {formatPercent(step.conversionFromPrevious, 0)}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="relative h-3.5 rounded-full bg-paper-2">
                {peerStep ? (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-line"
                    style={{
                      width: `${(useShare ? peerStep.conversionFromStart : peerStep.reached / max) * 100}%`,
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    isDrop ? "bg-danger" : "bg-accent",
                  )}
                  style={{
                    width: `${(useShare ? step.conversionFromStart : step.reached / max) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
        {caption ? (
          <p className="pt-2 text-sm leading-relaxed text-ink-soft">{caption}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}
