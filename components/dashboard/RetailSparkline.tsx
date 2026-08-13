"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatMonthLabel } from "@/lib/format";

export function RetailSparkline({
  monthly,
}: {
  monthly: { month: string; units: number; revenue: number }[];
}) {
  const data = monthly.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
  }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Retail by month</CardTitle>
          <p className="mt-1 text-xs text-ink-soft">
            Units by delivery date. December peak is allocation lag after festive bookings.
          </p>
        </div>
      </CardHeader>
      <CardBody className="h-40">
        {data.length === 0 ? (
          <p className="text-sm text-ink-soft">No deliveries in this slice.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#faf7f1",
                  border: "1px solid #d8d0c2",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} units`, "Retail"]}
              />
              <Area
                type="monotone"
                dataKey="units"
                stroke="#1b6b62"
                fill="#d7ebe7"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
