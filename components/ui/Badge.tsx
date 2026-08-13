import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "ok" | "warn" | "danger" | "accent" | "copper";

const tones: Record<Tone, string> = {
  neutral: "bg-paper-2 text-ink-soft",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
  copper: "bg-copper-soft text-copper",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
