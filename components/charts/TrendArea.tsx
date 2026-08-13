"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartBox } from "@/components/charts/ChartBox";
import { cn, formatMonthLabel, formatNumber } from "@/lib/format";
import type { MonthlyPoint } from "@/lib/metrics/aggregates";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e4e7ec",
  borderRadius: 12,
  fontSize: 12,
};

type Tab = "overview" | "sales" | "revenue";

export function TrendArea({ monthly }: { monthly: MonthlyPoint[] }) {
  const [tab, setTab] = useState<Tab>("overview");
  const data = monthly.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month).replace(" 2025", ""),
    crores: Number((row.revenue / 10_000_000).toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Performance trends</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Monthly bookings and retail from June to December.
          </p>
        </div>
        <div className="flex rounded-lg bg-paper p-1 text-sm">
          {(["overview", "sales", "revenue"] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "rounded-md px-3 py-1 capitalize",
                tab === item ? "bg-white font-medium shadow-sm" : "text-ink-soft",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardBody>
        <ChartBox height={280} isEmpty={data.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="retailFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#465fff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#465fff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#12b76a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#12b76a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eaecf0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} allowDecimals={tab === "revenue"} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name === "crores") return [`₹${value} Cr`, "Revenue"];
                  if (name === "bookings") return [formatNumber(Number(value)), "Bookings"];
                  return [formatNumber(Number(value)), "Retail"];
                }}
              />
              {(tab === "overview" || tab === "sales") && (
                <Area type="monotone" dataKey="units" stroke="#465fff" fill="url(#retailFill)" strokeWidth={2} />
              )}
              {tab === "overview" && (
                <Area type="monotone" dataKey="bookings" stroke="#12b76a" fill="url(#bookFill)" strokeWidth={2} />
              )}
              {tab === "revenue" && (
                <Area type="monotone" dataKey="crores" stroke="#465fff" fill="url(#retailFill)" strokeWidth={2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>
      </CardBody>
    </Card>
  );
}
