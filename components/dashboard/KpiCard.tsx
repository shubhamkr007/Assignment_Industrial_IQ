"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn, deltaRatio, formatPercent } from "@/lib/format";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  current,
  previous,
  icon,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  current?: number;
  previous?: number | null;
  icon?: ReactNode;
  warn?: boolean;
}) {
  const delta = current != null ? deltaRatio(current, previous ?? null) : null;

  return (
    <article className="rounded-[16px] border border-line bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)] md:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        {icon ? (
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="tabular mt-5 text-[30px] font-bold leading-none tracking-tight text-ink">
        {value}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {delta != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium",
              delta >= 0 ? "text-ok" : "text-danger",
            )}
          >
            {delta >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {delta >= 0 ? "+" : "-"}
            {formatPercent(Math.abs(delta), 2)}
          </span>
        ) : null}
        {hint ? (
          <span className={cn("text-sm text-ink-soft", warn && "text-warn")}>{hint}</span>
        ) : null}
      </div>
    </article>
  );
}
