import { Car, Phone, IndianRupee, Package } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatInr, formatNumber, formatPercent } from "@/lib/format";
import { isIncompleteCohort } from "@/lib/metrics/period";
import type { Filters } from "@/lib/types";
import type { KpiSet } from "@/lib/metrics/aggregates";

export function KpiStrip({
  kpis,
  previous,
  previousLabel,
  filters,
}: {
  kpis: KpiSet;
  previous: KpiSet | null;
  previousLabel: string | null;
  filters: Filters;
}) {
  const incomplete = isIncompleteCohort(filters.range);
  const vs = previousLabel ? `vs ${previousLabel}` : "No prior window";

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <KpiCard
        label="Retail revenue"
        value={formatInr(kpis.retailRevenue)}
        current={kpis.retailRevenue}
        previous={previous?.retailRevenue ?? null}
        hint={vs}
        icon={<IndianRupee className="h-5 w-5" />}
      />
      <KpiCard
        label="Contact rate"
        value={kpis.contactRate == null ? "—" : formatPercent(kpis.contactRate)}
        current={kpis.contactRate ?? undefined}
        previous={previous?.contactRate ?? null}
        hint="Ever reached contacted"
        icon={<Phone className="h-5 w-5" />}
      />
      <KpiCard
        label="Win rate"
        value={kpis.winRate == null ? "—" : formatPercent(kpis.winRate)}
        current={kpis.winRate ?? undefined}
        previous={previous?.winRate ?? null}
        hint={
          incomplete
            ? `${kpis.closedWon} won / ${kpis.closedLost} lost · incomplete cohort`
            : `${kpis.closedWon} won / ${kpis.closedLost} lost`
        }
        warn={incomplete}
        icon={<Car className="h-5 w-5" />}
      />
      <KpiCard
        label="Open now"
        value={formatNumber(kpis.openPipeline)}
        hint={`${kpis.soldWaiting} sold, waiting for a vehicle`}
        icon={<Package className="h-5 w-5" />}
      />
    </section>
  );
}
