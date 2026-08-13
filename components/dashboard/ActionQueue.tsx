import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatInr } from "@/lib/format";
import type { Insight } from "@/lib/insights";

const tone = {
  critical: "danger" as const,
  warning: "warn" as const,
  info: "accent" as const,
};

export function ActionQueue({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Action queue</CardTitle>
          <p className="mt-1 text-xs text-ink-soft">
            Recommended actions ranked by priority.
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-ink-soft">No recommended actions in this period.</p>
        ) : (
          insights.map((insight, index) => (
            <Link
              key={insight.id}
              href={insight.href}
              className="block rounded-2xl border border-line bg-paper px-4 py-3 hover:border-ink/20"
            >
              <div className="flex items-center gap-2">
                <span className="tabular text-xs text-ink-soft">{index + 1}</span>
                <Badge tone={tone[insight.severity]}>{insight.verb}</Badge>
                {insight.count != null ? (
                  <span className="ml-auto text-xs tabular text-ink-soft">
                    {insight.count}
                    {insight.value != null ? ` · ${formatInr(insight.value)}` : ""}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium leading-snug">{insight.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft line-clamp-2">
                {insight.body}
              </p>
            </Link>
          ))
        )}
      </CardBody>
    </Card>
  );
}
