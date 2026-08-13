import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatHours, formatInr, formatNumber, formatPercent } from "@/lib/format";
import type { RepScorecard } from "@/lib/metrics/reps";

export function OfficerTable({
  officers,
  query,
  empty,
}: {
  officers: RepScorecard[];
  query: string;
  empty?: string;
}) {
  if (officers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Officers</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-soft">{empty ?? "No officers in this slice."}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Officers</CardTitle>
          <p className="mt-1 text-xs text-ink-soft">
            Conversion and workload by officer.
          </p>
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            <tr>
              <th className="pb-3 font-medium">Rep</th>
              <th className="pb-3 font-medium text-right">Leads</th>
              <th className="pb-3 font-medium text-right">Delivered</th>
              <th className="pb-3 font-medium text-right">Conv.</th>
              <th className="pb-3 font-medium text-right">Contact</th>
              <th className="pb-3 font-medium text-right">Never contacted</th>
              <th className="pb-3 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((officer) => (
              <tr key={officer.rep.id} className="border-t border-line">
                <td className="py-3 pr-3">
                  <Link
                    href={`/reps/${officer.rep.id}${query}`}
                    className="font-medium hover:text-accent"
                  >
                    {officer.rep.name}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {officer.firstResponseMedianHours != null
                      ? `Median reply ${formatHours(officer.firstResponseMedianHours)}`
                      : "No contact logged"}
                  </p>
                </td>
                <td className="py-3 text-right tabular">{formatNumber(officer.leads)}</td>
                <td className="py-3 text-right tabular">{officer.delivered}</td>
                <td className="py-3 text-right tabular">
                  {formatPercent(officer.conversion)}
                </td>
                <td className="py-3 text-right tabular">
                  {formatPercent(officer.contactRate)}
                </td>
                <td className="py-3 text-right tabular text-danger">
                  {officer.neverContactedLost}
                </td>
                <td className="py-3 text-right tabular">
                  {formatInr(officer.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
