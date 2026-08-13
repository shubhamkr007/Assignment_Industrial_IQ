import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import type { Dataset, Filters } from "../types";
import { lostWithoutContact, neverContacted } from "./leads";
import { getPeriod } from "./period";
import { computeKpis, uncontactedLostCount } from "./aggregates";
import { branchScorecards } from "./branches";
import { formatInr, maskPhone, cleanNote } from "../format";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const dataset = JSON.parse(
  readFileSync(join(root, "data/dealership_data.json"), "utf8"),
) as Dataset;

const allTime: Filters = {
  range: getPeriod("all"),
  branchId: null,
  source: null,
  model: null,
  view: "ceo",
};

describe("dataset constants", () => {
  it("has 510 leads, 160 deliveries, 5 branches, 30 reps", () => {
    assert.equal(dataset.leads.length, 510);
    assert.equal(dataset.deliveries.length, 160);
    assert.equal(dataset.branches.length, 5);
    assert.equal(dataset.sales_reps.length, 30);
  });

  it("gives Lakeside Toyota 6 delivered units all-time", () => {
    const lakeside = dataset.leads.filter(
      (lead) => lead.branch_id === "B3" && lead.status === "delivered",
    );
    assert.equal(lakeside.length, 6);
  });

  it("counts 114 never-contacted losses", () => {
    assert.equal(uncontactedLostCount(dataset.leads), 114);
  });

  it("keeps branch managers off the book", () => {
    const managers = dataset.sales_reps.filter(
      (rep) => rep.role === "branch_manager",
    );
    assert.equal(managers.length, 5);
    for (const manager of managers) {
      const book = dataset.leads.filter(
        (lead) => lead.assigned_to === manager.id,
      );
      assert.equal(book.length, 0);
    }
  });
});

describe("kpis and scorecards", () => {
  it("matches all-time retail to the delivery table", () => {
    const kpis = computeKpis(dataset, dataset.leads, allTime);
    assert.equal(kpis.retailUnits, 160);
    assert.equal(kpis.intake, 510);
  });

  it("flags Lakeside as at-risk branch", () => {
    const cards = branchScorecards(dataset, allTime);
    const lakeside = cards.find((card) => card.id === "B3");
    const downtown = cards.find((card) => card.id === "B1");
    assert.ok(lakeside);
    assert.ok(downtown);
    assert.equal(lakeside.health, "fire");
    assert.ok(lakeside.conversion < 0.1);
    assert.ok(downtown.conversion > 0.35);
  });

  it("treats never-contacted as lost without a contacted event", () => {
    const sample = dataset.leads.filter(lostWithoutContact);
    assert.ok(sample.every((lead) => lead.status === "lost"));
    assert.ok(sample.every(neverContacted));
  });
});

describe("formatters", () => {
  it("formats crores and lakhs", () => {
    assert.equal(formatInr(10_230_000), "₹1.02 Cr");
    assert.equal(formatInr(910_000), "₹9.10 L");
  });

  it("masks phones and cleans leftover placeholders", () => {
    assert.equal(maskPhone("9269820594"), "•••• 0594");
    assert.equal(
      cleanNote("Customer comparing with {} competitor"),
      "Customer comparing with a competitor",
    );
  });
});
