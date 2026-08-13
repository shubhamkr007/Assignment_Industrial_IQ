"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartBox } from "@/components/charts/ChartBox";

export function LostReasonBars({
  reasons,
}: {
  reasons: { reason: string; count: number }[];
}) {
  const data = reasons.slice(0, 7).map((row) => ({
    name: row.reason.length > 28 ? `${row.reason.slice(0, 26)}…` : row.reason,
    count: row.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Lost deal reasons</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Most common reasons for closed-lost deals.
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <ChartBox height={260} isEmpty={data.length === 0} empty="No lost deals in this slice.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11, fill: "#344054" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e4e7ec",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#f79009" radius={[0, 8, 8, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </CardBody>
    </Card>
  );
}
