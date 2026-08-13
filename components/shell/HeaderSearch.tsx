"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Branch, SalesRep } from "@/lib/types";

export function HeaderSearch({
  branches,
  reps,
}: {
  branches: Branch[];
  reps: SalesRep[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const roofs = branches
      .filter((branch) =>
        `${branch.name} ${branch.city}`.toLowerCase().includes(q),
      )
      .map((branch) => ({
        href: `/branches/${branch.id}`,
        label: branch.name,
        hint: branch.city,
      }));
    const people = reps
      .filter((rep) => rep.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((rep) => ({
        href: `/reps/${rep.id}`,
        label: rep.name,
        hint: rep.role === "branch_manager" ? "Manager" : "Officer",
      }));
    return [...roofs, ...people].slice(0, 8);
  }, [query, branches, reps]);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && results[0]) {
            router.push(results[0].href);
            setQuery("");
            setOpen(false);
          }
        }}
        placeholder="Search or type command..."
        className="h-11 w-full rounded-lg border border-line bg-[#f2f4f7] pl-10 pr-16 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:bg-white"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-white px-1.5 py-0.5 text-[11px] text-ink-soft sm:block">
        ⌘K
      </kbd>
      {open && results.length > 0 ? (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
          {results.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#f2f4f7]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  router.push(item.href);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span>{item.label}</span>
                <span className="text-xs text-ink-soft">{item.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
