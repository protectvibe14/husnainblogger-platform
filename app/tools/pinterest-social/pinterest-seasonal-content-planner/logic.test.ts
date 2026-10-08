/**
 * Tests for tool-363 Pinterest Seasonal Content Planner logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  SEASONAL_EVENTS,
  DATASET_SIZE,
  DATASET_REVIEWED,
  LEAD_TIME_FLAG_WEEKS,
  EVERGREEN_NICHE_HINTS,
  EVERGREEN_ANGLES,
  QUARTER_MONTHS,
  MONTH_NAMES,
  isEvergreenNiche,
} from "./logic.ts";

test("happy path: niche + month 12 -> Christmas/Holiday in angles", () => {
  const r = runTool({ niche: "home decor", month: 12 });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.ok(r.values!.eventCount > 0);
  const text = JSON.stringify(r.values!.seasonalAngles.rows).toLowerCase();
  assert.ok(text.includes("christmas"));
  assert.ok(text.includes("home decor"));
  assert.ok(r.values!.periodUsed.includes("December"));
});

test("month 2 -> Valentine's Day angle with niche filled in", () => {
  const r = runTool({ niche: "baking", month: 2 });
  assert.equal(r.ok, true);
  const text = JSON.stringify(r.values!.seasonalAngles.rows);
  assert.ok(text.includes("Valentine's Day"));
  assert.ok(text.includes("baking"));
  assert.ok(!text.includes("{niche}"), "placeholder leaked");
});

test("quarter Q4 -> covers Oct/Nov/Dec events incl. Halloween + Thanksgiving", () => {
  const r = runTool({ niche: "recipes", quarter: "Q4" });
  assert.equal(r.ok, true);
  const text = JSON.stringify(r.values!.seasonalAngles.rows).toLowerCase();
  assert.ok(text.includes("halloween"));
  assert.ok(text.includes("thanksgiving"));
  assert.ok(r.values!.periodUsed.includes("Q4"));
});

test("quarter lowercase accepted", () => {
  const r = runTool({ niche: "recipes", quarter: "q1" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.periodUsed.includes("Q1"));
});

test("month + quarter combined: months merged", () => {
  const r = runTool({ niche: "recipes", month: 12, quarter: "Q1" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.periodUsed.includes("December"));
  assert.ok(r.values!.periodUsed.includes("January"));
});

test("lead time >=4 weeks flagged in planning note", () => {
  const r = runTool({ niche: "decor", month: 11 });
  assert.equal(r.ok, true);
  assert.ok(r.values!.planningNote.includes(`${LEAD_TIME_FLAG_WEEKS}+ weeks`));
  assert.ok(/christmas/i.test(r.values!.planningNote));
});

test("planning note cites dataset size + review date", () => {
  const r = runTool({ niche: "decor", month: 11 });
  assert.equal(r.ok, true);
  assert.ok(r.values!.planningNote.includes(String(DATASET_SIZE)));
  assert.ok(r.values!.planningNote.includes(DATASET_REVIEWED));
});

test("edge case: evergreen B2B niche -> evergreen angles + honest note", () => {
  const r = runTool({ niche: "B2B SaaS marketing", month: 11 });
  assert.equal(r.ok, true);
  const text = JSON.stringify(r.values!.seasonalAngles.rows);
  assert.ok(!/christmas/i.test(text), "seasonal event leaked into evergreen output");
  assert.ok(text.includes("B2B SaaS marketing"));
  assert.ok(/weak seasonal hooks|evergreen niche/i.test(r.values!.planningNote));
  assert.equal(r.values!.eventCount, EVERGREEN_ANGLES.length);
});

test("isEvergreenNiche detects hints", () => {
  assert.equal(isEvergreenNiche("consulting firm"), true);
  assert.equal(isEvergreenNiche("home decor"), false);
  assert.ok(EVERGREEN_NICHE_HINTS.length > 0);
});

test("validation: missing niche -> error", () => {
  const r = runTool({ month: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error && /niche/i.test(r.error));
});

test("validation: blank niche -> error", () => {
  const r = runTool({ niche: "  ", month: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: neither month nor quarter -> error", () => {
  const r = runTool({ niche: "decor" });
  assert.equal(r.ok, false);
  assert.ok(r.error && /month|quarter/i.test(r.error));
});

test("validation: month 13 -> error", () => {
  const r = runTool({ niche: "decor", month: 13 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: month 0 -> error", () => {
  const r = runTool({ niche: "decor", month: 0 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: non-integer month -> error", () => {
  const r = runTool({ niche: "decor", month: 5.5 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: bad quarter -> error", () => {
  const r = runTool({ niche: "decor", quarter: "Q5" });
  assert.equal(r.ok, false);
  assert.ok(r.error && /quarter/i.test(r.error));
});

test("dataset: 24 events, every month 1-12 covered, all lead times positive", () => {
  assert.equal(SEASONAL_EVENTS.length, DATASET_SIZE);
  assert.equal(DATASET_SIZE, 24);
  const covered = new Set<number>();
  for (const e of SEASONAL_EVENTS) {
    for (const m of e.months) covered.add(m);
    assert.ok(e.leadTimeWeeks >= 1);
    assert.ok(e.name.length > 3);
    assert.ok(e.keywordSeeds.length >= 2);
  }
  for (let m = 1; m <= 12; m++) assert.ok(covered.has(m), `month ${m} uncovered`);
  assert.equal(MONTH_NAMES.length, 13);
  assert.deepEqual(Object.keys(QUARTER_MONTHS).sort(), ["Q1", "Q2", "Q3", "Q4"]);
});

test("determinism: same inputs twice give identical outputs", () => {
  const a = runTool({ niche: "fashion", quarter: "Q3" });
  const b = runTool({ niche: "fashion", quarter: "Q3" });
  assert.deepEqual(a, b);
});

test("output ids match meta.ts: seasonalAngles, planningNote, eventCount, periodUsed", () => {
  const r = runTool({ niche: "decor", month: 3 });
  assert.equal(r.ok, true);
  const keys = Object.keys(r.values!).sort();
  assert.deepEqual(keys, ["eventCount", "periodUsed", "planningNote", "seasonalAngles"]);
});
