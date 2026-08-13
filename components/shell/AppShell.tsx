"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  LayoutDashboard,
  Moon,
} from "lucide-react";
import type { Branch, SalesRep } from "@/lib/types";
import { AS_OF_LABEL } from "@/lib/types";
import { PERIODS } from "@/lib/metrics/period";
import { cn, sourceLabel } from "@/lib/format";
import { HeaderSearch } from "@/components/shell/HeaderSearch";

function currentQuery(searchParams: URLSearchParams) {
  return new URLSearchParams(searchParams.toString());
}

export function AppShell({
  branches,
  managers,
  reps,
  sources,
  models,
  children,
}: {
  branches: Branch[];
  managers: SalesRep[];
  reps: SalesRep[];
  sources: string[];
  models: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const period = searchParams.get("period") ?? "december";
  const view = searchParams.get("view") ?? "ceo";
  const source = searchParams.get("source") ?? "";
  const model = searchParams.get("model") ?? "";
  const viewer =
    view === "ceo"
      ? { name: "CEO", role: "Group" }
      : (() => {
          const manager = managers.find((row) => row.branch_id === view);
          const branch = branches.find((row) => row.id === view);
          return {
            name: manager?.name.split(" ")[0] ?? "Manager",
            role: branch?.name.replace(" Toyota", "") ?? "Branch",
          };
        })();

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  const push = (patch: Record<string, string | null>) => {
    const next = currentQuery(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname);
  };

  const href = (path: string) => {
    const qs = searchParams.toString();
    return qs ? `${path}?${qs}` : path;
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder^="Search"]')?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectClass =
    "h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[290px_1fr]">
      {pending ? (
        <div className="fixed left-0 right-0 top-0 z-50 h-1 overflow-hidden bg-accent-soft">
          <div className="pending-bar h-full w-1/3 rounded-full bg-accent" />
        </div>
      ) : null}

      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <BarChart3 className="h-5 w-5" />
          </span>
          <p className="text-xl font-semibold">DealerPulse</p>
        </div>
        <p className="hidden px-6 pb-2 text-xs font-medium uppercase tracking-wider text-ink-soft lg:block">
          Menu
        </p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-4">
          <NavItem href={href("/")} active={pathname === "/"} onNavigate={navigate}>
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </NavItem>
          {branches.map((branch) => (
            <NavItem
              key={branch.id}
              href={href(`/branches/${branch.id}`)}
              active={pathname === `/branches/${branch.id}`}
              onNavigate={navigate}
            >
              <Building2 className="h-5 w-5" />
              <span className="truncate">{branch.name.replace(" Toyota", "")}</span>
            </NavItem>
          ))}
        </nav>
        <p className="hidden px-6 pt-6 text-xs font-medium uppercase tracking-wider text-ink-soft lg:block">
          Support
        </p>
        <p className="hidden px-6 pt-2 text-xs leading-relaxed text-ink-soft lg:block">
          Frozen as of {AS_OF_LABEL}. Sample dataset for demonstration.
        </p>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-white">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <HeaderSearch branches={branches} reps={reps} />
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-label="Theme"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-[#f2f4f7]"
              >
                <Moon className="h-5 w-5" />
              </button>
              <a
                href="#action-queue"
                aria-label="Alerts"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-[#f2f4f7]"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
              </a>
              <div className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {viewer.name.slice(0, 1)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{viewer.name}</span>
                  <span className="block text-xs text-ink-soft">{viewer.role}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5 lg:px-8">
            {PERIODS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => push({ period: item.key })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  period === item.key
                    ? "bg-accent text-white"
                    : "text-ink-soft hover:bg-[#f2f4f7]",
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="text-xs text-ink-soft">As of {AS_OF_LABEL}</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select
                value={view}
                aria-label="Viewing as"
                onChange={(event) => {
                  const nextView = event.target.value;
                  const next = currentQuery(searchParams);
                  if (nextView === "ceo") {
                    next.delete("view");
                    next.delete("branch");
                    const qs = next.toString();
                    navigate(qs ? `/?${qs}` : "/");
                    return;
                  }
                  next.set("view", nextView);
                  next.set("branch", nextView);
                  const qs = next.toString();
                  navigate(`/branches/${nextView}${qs ? `?${qs}` : ""}`);
                }}
                className={selectClass}
              >
                <option value="ceo">Viewing as CEO</option>
                {managers.map((manager) => {
                  const branch = branches.find((row) => row.id === manager.branch_id);
                  return (
                    <option key={manager.id} value={manager.branch_id}>
                      {manager.name} · {branch?.name.replace(" Toyota", "")}
                    </option>
                  );
                })}
              </select>
              <select
                value={source}
                aria-label="Source"
                onChange={(event) => push({ source: event.target.value || null })}
                className={selectClass}
              >
                <option value="">All sources</option>
                {sources.map((item) => (
                  <option key={item} value={item}>
                    {sourceLabel(item)}
                  </option>
                ))}
              </select>
              <select
                value={model}
                aria-label="Model"
                onChange={(event) => push({ model: event.target.value || null })}
                className={cn(selectClass, "max-w-[160px]")}
              >
                <option value="">All models</option>
                {models.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>
        <main
          className={cn(
            "px-4 py-6 transition-opacity lg:px-8 lg:py-8",
            pending && "pointer-events-none opacity-60",
          )}
        >
          {pending ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              Updating view…
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: (href: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
      }}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-ink-soft hover:bg-[#f2f4f7] hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
