import type { InsightSeverity } from "@/lib/insights";

export type SummarySource = "ai" | "deterministic";

export interface SummaryHighlight {
  label: string;
  value: string;
}

export interface SummaryCandidate {
  id: string;
  severity: InsightSeverity;
  title: string;
  body: string;
  verb: string;
  href: string;
  cta: string;
}

export interface SummaryContext {
  period: string;
  asOf: string;
  scopeLabel: string;
  kpis: {
    retailUnits: number;
    targetUnits: number;
    bookings: number;
    neverContactedLost: number;
    soldWaiting: number;
    sla24HitRate: number | null;
    firstResponseMedianHours: number | null;
    contactRate: number | null;
    retailRevenue: number;
  };
  previousRetailUnits: number | null;
  branches: Array<{
    name: string;
    health: string;
    conversion: number;
    neverContactedLost: number;
  }>;
  candidates: SummaryCandidate[];
  primaryFunnelDrop: string | null;
  allowedBranchNames: string[];
}

export interface ExecutiveSummary {
  source: SummarySource;
  headline: string;
  body: string;
  severity: InsightSeverity;
  verb: string;
  href: string;
  cta: string;
  highlights: SummaryHighlight[];
}

export interface AiSummaryDraft {
  headline: string;
  body: string;
}
