"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

export function ChartSkeleton({ className, height = 260 }: { className?: string; height?: number }) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-xl bg-[#f2f4f7]", className)}
      style={{ height }}
      aria-busy
      aria-label="Loading chart"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export function ChartBox({
  children,
  className,
  height = 260,
  empty,
  isEmpty,
}: {
  children: ReactNode;
  className?: string;
  height?: number;
  empty?: string;
  isEmpty?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(node.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (isEmpty) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-[#f2f4f7] text-sm text-ink-soft",
          className,
        )}
        style={{ height }}
      >
        {empty ?? "No data in this slice."}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative min-w-0", className)} style={{ height }}>
      {width < 8 ? (
        <ChartSkeleton height={height} />
      ) : (
        <div className="absolute inset-0">{children}</div>
      )}
    </div>
  );
}
