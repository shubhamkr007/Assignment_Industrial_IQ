import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSummaryContext, buildSummaryHighlights } from "@/lib/ai/context";
import { buildExecutiveSummary } from "@/lib/ai/summarizer";
import { buildDashboard } from "@/lib/dashboard";

describe("summary engine context", () => {
  it("builds highlights from verified KPIs", () => {
    const model = buildDashboard({ period: "december" });
    const ctx = buildSummaryContext(model);
    const highlights = buildSummaryHighlights(ctx);

    assert.equal(ctx.kpis.retailUnits, model.kpis.retailUnits);
    assert.equal(
      highlights.find((h) => h.label === "Retail units")?.value,
      String(model.kpis.retailUnits),
    );
    assert.equal(
      highlights.find((h) => h.label === "Never contacted")?.value,
      String(model.kpis.neverContactedLost),
    );
  });

  it("computes target attainment from metrics", () => {
    const model = buildDashboard({ period: "december" });
    const ctx = buildSummaryContext(model);
    assert.equal(
      ctx.targetAttainment,
      model.kpis.retailUnits / model.kpis.targetUnits,
    );
  });
});

describe("summary engine", () => {
  it("includes accurate retail counts in the narrative", () => {
    const model = buildDashboard({ period: "december" });
    const ctx = buildSummaryContext(model);
    const summary = buildExecutiveSummary(ctx);

    assert.match(summary.body, new RegExp(`${ctx.kpis.retailUnits}`));
    assert.match(summary.body, new RegExp(`${ctx.kpis.targetUnits}`));
    assert.equal(summary.source, "engine");
    assert.ok(summary.highlights.length >= 4);
    assert.ok(summary.priorities.length >= 1);
  });

  it("prioritizes december wipeout in december period", () => {
    const model = buildDashboard({ period: "december" });
    const ctx = buildSummaryContext(model);
    const summary = buildExecutiveSummary(ctx);

    assert.match(summary.headline, /December|Lakeside/i);
    assert.equal(summary.severity, "critical");
  });

  it("surfaces branch gap when viewing the group", () => {
    const model = buildDashboard({ period: "all" });
    const ctx = buildSummaryContext(model);
    const summary = buildExecutiveSummary(ctx);

    assert.ok(
      summary.body.includes("Lakeside") ||
        summary.body.includes("Downtown") ||
        summary.priorities.some((p) => p.includes("Lakeside") || p.includes("Downtown")),
    );
  });
});
