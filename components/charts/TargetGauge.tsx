import { ArrowDown, ArrowUp } from "lucide-react";
import { formatInr, formatNumber, formatPercent, deltaRatio } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/format";

export function TargetGauge({
  actual,
  target,
  revenue,
  previousActual,
  label,
  caption,
}: {
  actual: number;
  target: number;
  revenue: number;
  previousActual?: number | null;
  label: string;
  caption: string;
}) {
  const over = target === 0 ? 0 : actual / target;
  const shown = Math.min(Math.max(over, 0), 1);
  const r = 90;
  const c = Math.PI * r;
  const dash = c * shown;
  const mom = deltaRatio(actual, previousActual ?? null);

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h2 className="text-base font-semibold">Monthly Target</h2>
          <p className="mt-1 text-sm text-ink-soft">{label}</p>
        </div>
      </div>
      <CardBody className="flex flex-1 flex-col items-center justify-center pt-2">
        <div className="relative w-full max-w-[320px]">
          <svg viewBox="0 0 220 128" className="w-full">
            <path
              d="M20 118 A90 90 0 0 1 200 118"
              fill="none"
              stroke="#e4e7ec"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M20 118 A90 90 0 0 1 200 118"
              fill="none"
              stroke="#465fff"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <p className="tabular text-[36px] font-bold leading-none">{formatPercent(over, 2)}</p>
            {mom != null ? (
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-0.5 text-sm font-medium",
                  mom >= 0 ? "text-ok" : "text-danger",
                )}
              >
                {mom >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {mom >= 0 ? "+" : ""}
                {formatPercent(mom, 0)}
              </span>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">of unit target</p>
            )}
          </div>
        </div>
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-ink-soft">
          {caption}
        </p>
        <div className="mt-6 grid w-full grid-cols-3 gap-2 border-t border-line pt-5 text-center">
          <Mini
            label="Target"
            value={formatNumber(target)}
            down
          />
          <Mini label="Revenue" value={formatInr(revenue)} up={actual > 0} />
          <Mini
            label="Retail"
            value={formatNumber(actual)}
            up={mom != null ? mom >= 0 : actual > 0}
            down={mom != null ? mom < 0 : false}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function Mini({
  label,
  value,
  up,
  down,
}: {
  label: string;
  value: string;
  up?: boolean;
  down?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="tabular mt-1 flex items-center justify-center gap-1 text-base font-semibold">
        {value}
        {up ? <ArrowUp className="h-3.5 w-3.5 text-ok" /> : null}
        {down && !up ? <ArrowDown className="h-3.5 w-3.5 text-danger" /> : null}
      </p>
    </div>
  );
}
