"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartBox } from "@/components/charts/ChartBox";
import { formatPercent, sourceLabel } from "@/lib/format";

const COLORS = ["#465fff", "#12b76a", "#f79009", "#ee46bc", "#7a5af8", "#0ba5ec"];

export function ChannelDonut({
  sources,
}: {
  sources: { source: string; leads: number; delivered: number; conversion: number }[];
}) {
  const data = sources.map((row) => ({
    name: sourceLabel(row.source),
    value: row.leads,
    conversion: row.conversion,
  }));
  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Channel mix</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Lead volume by source.
          </p>
        </div>
      </CardHeader>
      <CardBody className="grid gap-4 sm:grid-cols-[180px_1fr] items-center">
        <ChartBox height={180} isEmpty={total === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
              >
                {data.map((row, index) => (
                  <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e4e7ec",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
        <ul className="space-y-2 text-sm">
          {data.map((row, index) => (
            <li key={row.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                {row.name}
              </span>
              <span className="tabular text-ink-soft">
                {row.value} · {formatPercent(row.conversion)} win
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
