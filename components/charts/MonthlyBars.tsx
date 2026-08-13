"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartBox } from "@/components/charts/ChartBox";
import { formatMonthLabel, formatNumber } from "@/lib/format";
import type { MonthlyPoint } from "@/lib/metrics/aggregates";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e4e7ec",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 8px 16px rgba(16,24,40,0.08)",
};

export function MonthlyBars({ monthly }: { monthly: MonthlyPoint[] }) {
  const data = monthly.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month).replace(" 2025", ""),
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Monthly Sales</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">Retail units by delivery month</p>
        </div>
      </CardHeader>
      <CardBody>
        <ChartBox height={220} isEmpty={data.every((row) => row.units === 0)} empty="No deliveries in this window.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={28} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eaecf0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "#f2f4f7" }}
                contentStyle={tooltipStyle}
                formatter={(value) => [formatNumber(Number(value)), "Units"]}
              />
              <Bar dataKey="units" fill="#465fff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </CardBody>
    </Card>
  );
}
