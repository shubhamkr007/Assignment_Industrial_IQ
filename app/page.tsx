import { Box, Users } from "lucide-react";
import { ExecutiveSummaryBanner } from "@/components/dashboard/ExecutiveSummary";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BranchTable } from "@/components/dashboard/BranchTable";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { ActionQueue } from "@/components/dashboard/ActionQueue";
import { DelayPanel } from "@/components/dashboard/DelayPanel";
import { LeadExplorer } from "@/components/dashboard/LeadExplorer";
import { WhatIfChip } from "@/components/dashboard/WhatIfChip";
import { TargetGauge } from "@/components/charts/TargetGauge";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { TrendArea } from "@/components/charts/TrendArea";
import { ChannelDonut } from "@/components/charts/ChannelDonut";
import { LostReasonBars } from "@/components/charts/LostReasonBars";
import { BranchCompare } from "@/components/charts/BranchCompare";
import { buildDashboard } from "@/lib/dashboard";
import { getExecutiveSummary } from "@/lib/ai/summary";
import { queryFrom } from "@/lib/query";
import { peerFunnel } from "@/lib/metrics/branches";
import { isIncompleteCohort } from "@/lib/metrics/period";
import { formatNumber } from "@/lib/format";

type Search = Record<string, string | string[] | undefined>;

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const model = buildDashboard(params);
  const summary = await getExecutiveSummary(params);
  const query = queryFrom(params);
  const fire = [...model.cards].sort((a, b) => a.conversion - b.conversion)[0];
  const playbook = [...model.cards].sort((a, b) => b.conversion - a.conversion)[0];
  const uncontactedCaption = `${model.kpis.neverContactedLost} lost leads in this slice never reached contacted.`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-4 xl:col-span-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              label="Retail units"
              value={formatNumber(model.kpis.retailUnits)}
              current={model.kpis.retailUnits}
              previous={model.previousKpis?.retailUnits ?? null}
              icon={<Users className="h-5 w-5" />}
            />
            <KpiCard
              label="Bookings"
              value={formatNumber(model.kpis.bookings)}
              current={model.kpis.bookings}
              previous={model.previousKpis?.bookings ?? null}
              icon={<Box className="h-5 w-5" />}
            />
          </div>
          <MonthlyBars monthly={model.monthly} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <TargetGauge
            actual={model.kpis.retailUnits}
            target={model.kpis.targetUnits}
            revenue={model.kpis.retailRevenue}
            previousActual={model.previousKpis?.retailUnits ?? null}
            label={model.filters.range.label}
            caption={`${formatNumber(model.kpis.retailUnits)} units delivered in this period against a ${formatNumber(model.kpis.targetUnits)} target. Compare branches by conversion rate.`}
          />
        </div>
        <div className="col-span-12">
          <TrendArea monthly={model.monthly} />
        </div>
      </div>

      <ExecutiveSummaryBanner summary={summary} asOf={model.asOf} />

      <KpiStrip
        kpis={model.kpis}
        previous={model.previousKpis}
        previousLabel={model.previousLabel}
        filters={model.filters}
      />

      {isIncompleteCohort(model.filters.range) ? (
        <p className="text-xs text-warn">
          Late-window intake is still mid-journey. Median new → order is about 20 days, then ~17 to delivery.
        </p>
      ) : null}

      {fire && playbook && fire.id !== playbook.id ? (
        <WhatIfChip worst={fire} best={playbook} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <FunnelChart
          funnel={fire?.funnel ?? model.funnel}
          peer={fire ? peerFunnel(model.dataset, model.filters, fire.id) : null}
          caption={
            fire
              ? `${fire.name} compared with other branches. ${fire.neverContactedLost} leads lost without contact. Group-wide, ${model.kpis.neverContactedLost} leads never had first contact.`
              : uncontactedCaption
          }
          highlightDrop="contacted"
        />
        <BranchCompare cards={model.cards} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChannelDonut sources={model.sources} />
        <LostReasonBars reasons={model.lostReasons} />
      </div>

      <div id="action-queue" className="grid gap-4 xl:grid-cols-2">
        <ActionQueue insights={model.insights.slice(1)} />
        <DelayPanel ops={model.ops} waiting={model.waiting} />
      </div>

      <BranchTable cards={model.cards} query={query} />
      <LeadExplorer
        title="Active leads"
        hint="Open leads and those idle for 7+ days. Current snapshot — not filtered by period."
        leads={[...model.stale, ...model.open, ...model.waiting].filter(
          (lead, index, list) => list.findIndex((row) => row.id === lead.id) === index,
        )}
        reps={model.dataset.sales_reps}
        empty="No open or aging leads in this slice."
      />
    </div>
  );
}
