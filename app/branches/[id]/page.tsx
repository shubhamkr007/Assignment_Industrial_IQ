import { notFound } from "next/navigation";
import Link from "next/link";
import { InsightBanner } from "@/components/dashboard/InsightBanner";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { OfficerTable } from "@/components/dashboard/OfficerTable";
import { DelayPanel } from "@/components/dashboard/DelayPanel";
import { LeadExplorer } from "@/components/dashboard/LeadExplorer";
import { WhatIfChip } from "@/components/dashboard/WhatIfChip";
import { Badge } from "@/components/ui/Badge";
import { TargetGauge } from "@/components/charts/TargetGauge";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { ChannelDonut } from "@/components/charts/ChannelDonut";
import { LostReasonBars } from "@/components/charts/LostReasonBars";
import { buildDashboard } from "@/lib/dashboard";
import { queryFrom } from "@/lib/query";
import { getDataset } from "@/lib/data";
import { parseFilters } from "@/lib/metrics/filters";
import { branchScorecards } from "@/lib/metrics/branches";
import { periodLeads } from "@/lib/metrics/aggregates";

type Search = Record<string, string | string[] | undefined>;

export default async function BranchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const dataset = getDataset();
  const branch = dataset.branches.find((row) => row.id === id);
  if (!branch) notFound();

  const model = buildDashboard({ ...queryParams, branch: id });
  const query = queryFrom({ ...queryParams, branch: id });
  const allCards = branchScorecards(dataset, parseFilters(queryParams));
  const playbook = [...allCards].sort((a, b) => b.conversion - a.conversion)[0];
  const card = model.cards.find((row) => row.id === id);
  const manager = dataset.sales_reps.find(
    (rep) => rep.branch_id === id && rep.role === "branch_manager",
  );
  const created = periodLeads(
    dataset.leads.filter((lead) => lead.branch_id === id),
    model.filters,
  );
  const intervention = card?.health === "fire";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
            Branch review · {branch.city}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{branch.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {manager ? `GM ${manager.name}` : "No manager on file"} ·{" "}
            {card?.officerCount ?? 0} officers ·{" "}
            <Link href={`/${query}`} className="underline underline-offset-2">
              Back to group
            </Link>
          </p>
        </div>
        {card ? (
          <Badge
            tone={
              card.health === "fire"
                ? "danger"
                : card.health === "playbook"
                  ? "ok"
                  : card.health === "watch"
                    ? "warn"
                    : "neutral"
            }
          >
            {card.health === "fire"
              ? "Needs attention"
              : card.health === "playbook"
                ? "Top performer"
                : card.health === "watch"
                  ? "Monitor"
                  : "Stable"}
          </Badge>
        ) : null}
      </div>

      <InsightBanner insight={model.insights[0] ?? null} />
      <KpiStrip
        kpis={model.kpis}
        previous={model.previousKpis}
        previousLabel={model.previousLabel}
        filters={model.filters}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <TargetGauge
          actual={model.kpis.retailUnits}
          target={model.kpis.targetUnits}
          revenue={model.kpis.retailRevenue}
          previousActual={model.previousKpis?.retailUnits ?? null}
          label={branch.name}
          caption="OEM target for reference. Compare this branch with peer performance."
        />
        <MonthlyBars monthly={model.monthly} />
      </div>

      {intervention && card && playbook && playbook.id !== card.id ? (
        <WhatIfChip worst={card} best={playbook} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <FunnelChart
          funnel={model.funnel}
          peer={model.peer}
          highlightDrop="contacted"
          caption={
            intervention
              ? `${card?.neverContactedLost ?? 0} leads at this branch were lost without contact. Gray bars show the other four branches.`
              : "Gray bars show group average for comparison."
          }
        />
        <DelayPanel ops={model.ops} waiting={model.waiting} />
      </div>

      <OfficerTable
        officers={model.officers}
        query={query}
        empty="No sales officers assigned to this branch."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChannelDonut sources={model.sources} />
        <LostReasonBars reasons={model.lostReasons} />
      </div>
      <LeadExplorer
        title={`${branch.name.replace(" Toyota", "")} book`}
        hint={`${created.length} leads created in ${model.filters.range.label}.`}
        leads={created.length > 0 ? created : model.scoped}
        reps={dataset.sales_reps}
        empty="No leads in this slice."
      />
    </div>
  );
}
