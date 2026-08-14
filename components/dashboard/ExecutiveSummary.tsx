import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/format";
import type { ExecutiveSummary } from "@/lib/ai/types";

export function ExecutiveSummaryBanner({
  summary,
  asOf,
}: {
  summary: ExecutiveSummary;
  asOf: string;
}) {
  const tone =
    summary.severity === "critical"
      ? "border-danger/20 bg-danger-soft/40"
      : summary.severity === "warning"
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
          Executive summary
        </p>
        <Badge
          tone={
            summary.severity === "critical"
              ? "danger"
              : summary.severity === "warning"
                ? "warn"
                : "accent"
          }
        >
          {summary.severity}
        </Badge>
        <Badge tone="neutral">Rule-based engine</Badge>
        <span className="text-xs text-ink-soft">As of {asOf}</span>
      </div>

      <p className="mt-2 text-xl font-semibold leading-snug lg:text-2xl">
        {summary.headline}
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
        {summary.body}
      </p>

      {summary.priorities.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {summary.priorities.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-xs leading-relaxed text-ink-soft"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {summary.highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-line/60 bg-white/60 px-3 py-2"
          >
            <dt className="text-[10px] uppercase tracking-wide text-ink-soft">
              {item.label}
            </dt>
            <dd className="tabular mt-0.5 text-sm font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {summary.verb}
        </p>
        <Link
          href={summary.href}
          className="inline-flex rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white hover:bg-black"
        >
          {summary.cta}
        </Link>
      </div>
    </section>
  );
}
