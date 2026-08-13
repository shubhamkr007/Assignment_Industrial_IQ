import { notFound } from "next/navigation";
import Link from "next/link";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { LeadExplorer } from "@/components/dashboard/LeadExplorer";
import { OfficerTable } from "@/components/dashboard/OfficerTable";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDataset } from "@/lib/data";
import { parseFilters } from "@/lib/metrics/filters";
import { cohortFunnel, periodLeads } from "@/lib/metrics/aggregates";
import {
  officersForManager,
  scoreRep,
  leadsForRep,
  repScorecards,
} from "@/lib/metrics/reps";
import { queryFrom } from "@/lib/query";
import { formatHours, formatInr, formatPercent } from "@/lib/format";

type Search = Record<string, string | string[] | undefined>;

export default async function RepPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const dataset = getDataset();
  const rep = dataset.sales_reps.find((row) => row.id === id);
  if (!rep) notFound();

  const branch = dataset.branches.find((row) => row.id === rep.branch_id);
  const filters = parseFilters({ ...queryParams, branch: rep.branch_id });
  const query = queryFrom({ ...queryParams, branch: rep.branch_id });

  if (rep.role === "branch_manager") {
    const officers = officersForManager(dataset, rep);
    const scorecards = repScorecards(dataset, filters, rep.branch_id);
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
            Branch manager · {branch?.city}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{rep.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Branch managers are not assigned individual leads in this dataset. Sales officers under this branch carry the pipeline.{" "}
            <Link
              href={`/branches/${rep.branch_id}${query}`}
              className="underline underline-offset-2"
            >
              Open {branch?.name}
            </Link>
            .
          </p>
        </div>
        <Card className="bg-paper-2/60">
          <CardBody className="pt-5">
            <p className="text-2xl font-semibold leading-snug">
              No assigned leads. {officers.length} officers to manage.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Focus on team process, first-response times, and lead closure policies.
            </p>
          </CardBody>
        </Card>
        <OfficerTable officers={scorecards} query={query} />
      </div>
    );
  }

  const allLeads = leadsForRep(dataset, rep.id);
  const created = periodLeads(allLeads, filters);
  const score = scoreRep(rep, allLeads);
  const branchLeads = dataset.leads.filter(
    (lead) => lead.branch_id === rep.branch_id,
  );
  const peerFunnel = cohortFunnel(branchLeads);
  const funnel = cohortFunnel(allLeads);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
            Coaching view · {branch?.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{rep.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Joined {new Date(rep.joined).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} ·{" "}
            <Link
              href={`/branches/${rep.branch_id}${query}`}
              className="underline underline-offset-2"
            >
              {branch?.name}
            </Link>
          </p>
        </div>
        <Badge tone={score.conversion < 0.12 ? "danger" : score.conversion > 0.35 ? "ok" : "neutral"}>
          {formatPercent(score.conversion)} conversion on {score.leads} leads
        </Badge>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini label="Delivered" value={`${score.delivered}`} hint={formatInr(score.revenue)} />
        <Mini
          label="Win rate"
          value={score.winRate == null ? "—" : formatPercent(score.winRate)}
          hint={`${score.lost} lost`}
        />
        <Mini
          label="Contact rate"
          value={formatPercent(score.contactRate)}
          hint={`${score.neverContactedLost} never contacted · lost`}
        />
        <Mini
          label="First response"
          value={
            score.firstResponseMedianHours == null
              ? "—"
              : formatHours(score.firstResponseMedianHours)
          }
          hint="Median among contacted leads"
        />
      </section>

      <FunnelChart
        funnel={funnel}
        peer={peerFunnel}
        caption="Gray bars show branch average. Similar patterns may indicate a branch-wide process issue."
      />

      <LeadExplorer
        title="Assigned leads"
        hint={`${allLeads.length} on the book. ${created.length} created in ${filters.range.label}.`}
        leads={allLeads}
        reps={dataset.sales_reps}
        empty="This officer has no leads in the selected window."
      />
    </div>
  );
}

function Mini({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-paper-raised px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="tabular mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
    </article>
  );
}
