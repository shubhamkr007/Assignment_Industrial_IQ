import { formatNumber, formatPercent } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/Card";
import type { BranchScorecard } from "@/lib/metrics/branches";

export function WhatIfChip({
  worst,
  best,
}: {
  worst: BranchScorecard;
  best: BranchScorecard;
}) {
  const leads = Math.max(worst.leadCount, 1);
  const actual = worst.delivered;
  const projected = Math.round(leads * best.conversion);
  const lift = Math.max(projected - actual, 0);

  return (
    <Card className="bg-accent-soft/60 border-accent/20">
      <CardBody className="pt-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
          Scenario analysis
        </p>
        <p className="mt-2 text-xl font-semibold leading-snug">
          If {worst.name.replace(" Toyota", "")} matched{" "}
          {best.name.replace(" Toyota", "")} conversion on the same{" "}
          {formatNumber(leads)} leads, projected deliveries would be {projected} instead of{" "}
          {actual}.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          A {lift}-unit difference. {formatPercent(worst.conversion)} vs{" "}
          {formatPercent(best.conversion)} conversion rate.
        </p>
      </CardBody>
    </Card>
  );
}
