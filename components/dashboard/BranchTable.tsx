import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatInr, formatNumber, formatPercent } from "@/lib/format";
import type { BranchScorecard } from "@/lib/metrics/branches";

const healthTone = {
  playbook: "ok" as const,
  fire: "danger" as const,
  watch: "warn" as const,
  steady: "neutral" as const,
};

const healthLabel = {
  playbook: "Top performer",
  fire: "At risk",
  watch: "Monitor",
  steady: "Stable",
};

export function BranchTable({
  cards,
  query,
}: {
  cards: BranchScorecard[];
  query: string;
}) {
  const maxRetail = Math.max(...cards.map((card) => card.kpis.retailUnits), 1);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Branch comparison</CardTitle>
          <p className="mt-1 text-xs text-ink-soft">
            Ranked by Jun–Dec conversion. Retail column follows the selected period.
          </p>
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            <tr>
              <th className="pb-3 font-medium">Branch</th>
              <th className="pb-3 font-medium">Health</th>
              <th className="pb-3 font-medium text-right whitespace-nowrap">Retail</th>
              <th className="pb-3 font-medium text-right whitespace-nowrap">Conv.</th>
              <th className="pb-3 font-medium text-right whitespace-nowrap">Contact</th>
              <th className="pb-3 font-medium whitespace-nowrap">Throughput</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-t border-line">
                <td className="py-3 pr-3">
                  <Link href={`/branches/${card.id}${query}`} className="group">
                    <p className="font-medium group-hover:text-accent">
                      {card.name}
                    </p>
                    <p className="text-xs text-ink-soft">{card.city}</p>
                  </Link>
                </td>
                <td className="py-3">
                  <Badge tone={healthTone[card.health]}>
                    {healthLabel[card.health]}
                  </Badge>
                </td>
                <td className="py-3 text-right tabular">
                  <p>{formatNumber(card.kpis.retailUnits)}</p>
                  <p className="text-xs text-ink-soft">
                    {formatInr(card.kpis.retailRevenue)}
                  </p>
                </td>
                <td className="py-3 text-right tabular">
                  {formatPercent(card.conversion)}
                </td>
                <td className="py-3 text-right tabular">
                  {formatPercent(card.contactRate)}
                </td>
                <td className="py-3 w-[28%]">
                  <div className="h-2 rounded-full bg-paper-2">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{
                        width: `${(card.kpis.retailUnits / maxRetail) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    {card.neverContactedLost} never contacted · lost
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
