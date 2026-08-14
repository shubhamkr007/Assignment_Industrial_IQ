import type { InsightSeverity } from "@/lib/insights";

export type SummarySource = "engine";

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
  count?: number;
  value?: number;
}

export interface SummaryContext {
  period: string;
  asOf: string;
  scopeLabel: string;
  branchId: string | null;
  branchName: string | null;
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
  targetAttainment: number | null;
  retailMomChange: number | null;
  branches: Array<{
    name: string;
    health: string;
    conversion: number;
    neverContactedLost: number;
  }>;
  candidates: SummaryCandidate[];
  primaryFunnelDrop: string | null;
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
  priorities: string[];
}
