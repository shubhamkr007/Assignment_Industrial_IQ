"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartBox } from "@/components/charts/ChartBox";
import type { BranchScorecard } from "@/lib/metrics/branches";

export function BranchCompare({ cards }: { cards: BranchScorecard[] }) {
  const data = cards.map((card) => ({
    name: card.name.replace(" Toyota", ""),
    conversion: Math.round(card.conversion * 1000) / 10,
    contact: Math.round(card.contactRate * 1000) / 10,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Branch comparison</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Conversion and contact rate by branch.
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <ChartBox height={260} isEmpty={data.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eaecf0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#667085" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e4e7ec",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value, name) => [`${value}%`, name === "conversion" ? "Conversion" : "Contact"]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="conversion" fill="#465fff" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar dataKey="contact" fill="#12b76a" radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </CardBody>
    </Card>
  );
}
