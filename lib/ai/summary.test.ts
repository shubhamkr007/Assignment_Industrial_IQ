import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSummaryContext, buildSummaryHighlights } from "@/lib/ai/context";
import { buildDeterministicSummary } from "@/lib/ai/deterministic";
import { parseAiDraft, validateAiDraft } from "@/lib/ai/validate";
import { buildDashboard } from "@/lib/dashboard";

describe("AI summary context", () => {
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

  it("deterministic summary includes accurate retail counts", () => {
    const model = buildDashboard({ period: "december" });
    const ctx = buildSummaryContext(model);
    const summary = buildDeterministicSummary(ctx);

    assert.match(summary.body, new RegExp(`${ctx.kpis.retailUnits}`));
    assert.match(summary.body, new RegExp(`${ctx.kpis.targetUnits}`));
    assert.equal(summary.source, "deterministic");
    assert.ok(summary.highlights.length >= 4);
  });
});

describe("AI summary validation", () => {
  const ctx = buildSummaryContext(buildDashboard({ period: "december" }));

  it("rejects drafts that invent numbers", () => {
    assert.equal(
      validateAiDraft(
        {
          headline: "Lakeside needs attention",
          body: "Conversion is 7.6% and 33 leads were lost.",
        },
        ctx,
      ),
      false,
    );
  });

  it("accepts qualitative drafts without metrics", () => {
    assert.equal(
      validateAiDraft(
        {
          headline: "Prioritize first-contact discipline at Lakeside Toyota",
          body: "Branch performance diverges from peers. Focus on contact policy and delivery backlog before month-end reviews.",
        },
        ctx,
      ),
      true,
    );
  });

  it("parses valid JSON drafts", () => {
    const draft = parseAiDraft({
      headline: "Review branch execution",
      body: "Address contact gaps and delivery delays.",
    });
    assert.ok(draft);
    assert.equal(draft?.headline, "Review branch execution");
  });
});
