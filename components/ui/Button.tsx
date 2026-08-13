import { cn } from "@/lib/format";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "copper" | "danger" | "quiet";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-[#165850] shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
  copper: "bg-copper text-white hover:bg-[#a84c1e]",
  danger: "bg-danger text-white hover:bg-[#7f2424]",
  ghost: "bg-transparent text-ink hover:bg-paper-2 border border-line",
  quiet: "bg-paper-raised text-ink-soft hover:text-ink hover:bg-paper-2 border border-line",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
