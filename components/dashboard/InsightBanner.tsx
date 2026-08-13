import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Insight } from "@/lib/insights";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/format";

export function InsightBanner({ insight }: { insight: Insight | null }) {
  if (!insight) {
    return (
      <section className="rounded-2xl border border-line bg-paper-raised px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <p className="text-sm font-medium text-ok">All clear</p>
        <p className="mt-1 text-sm text-ink-soft">
          No items require action in this period.
        </p>
      </section>
    );
  }

  const tone =
    insight.severity === "critical"
      ? "border-danger/20 bg-danger-soft/40"
      : insight.severity === "warning"
        ? "border-warn/20 bg-warn-soft/50"
        : "border-accent/20 bg-accent-soft";

  return (
    <section
      className={cn(
        "rounded-2xl border px-5 py-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]",
        tone,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {insight.verb}
        </p>
        <Badge
          tone={
            insight.severity === "critical"
              ? "danger"
              : insight.severity === "warning"
                ? "warn"
                : "accent"
          }
        >
          {insight.severity}
        </Badge>
        {insight.count != null ? (
          <span className="text-xs tabular text-ink-soft">{insight.count}</span>
        ) : null}
        {insight.value != null ? (
          <span className="text-xs tabular text-ink-soft">{formatInr(insight.value)}</span>
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold leading-snug lg:text-2xl">{insight.title}</p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{insight.body}</p>
      <Link
        href={insight.href}
        className="mt-4 inline-flex rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white hover:bg-black"
      >
        {insight.cta}
      </Link>
    </section>
  );
}
