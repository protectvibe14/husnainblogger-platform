/**
 * Tests for the Graphic Designer Rate Calculator pure logic (tool-072).
 *
 * Run: node --test app/tools/make-money/graphic-designer-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fixed benchmark tables in
 * logic.ts (base bands entry $30–50 / mid $60–95 / senior $110–150; factors
 * logo 1.0, brand 1.25, social 0.85, print 1.1), never copied from tool output.
 * Output ids are cross-checked against meta.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  BASE_HOURLY_BANDS,
  DELIVERABLE_FACTORS,
  EXPERIENCE_LEVELS,
  DELIVERABLES,
  CURRENCY,
} from "./logic.ts";

const EXPECTED_OUTPUT_IDS = [
  "hourlyRateLow",
  "hourlyRateHigh",
  "projectTotalLow",
  "projectTotalHigh",
  "deliverableNote",
];

describe("tool-072 happy paths", () => {
  it("entry + logo (factor 1.0), 10 hours → $30–$50/hr, $300–$500 total", () => {
    const r = runTool({ experienceLevel: "entry", deliverable: "logo", projectHours: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 30);
    assert.strictEqual(r.values!.hourlyRateHigh, 50);
    assert.strictEqual(r.values!.projectTotalLow, 300);
    assert.strictEqual(r.values!.projectTotalHigh, 500);
    assert.ok(r.values!.deliverableNote.includes("Logo design"));
    assert.ok(r.values!.deliverableNote.includes("no complexity adjustment"));
  });

  it("mid + brand (factor 1.25), 4 hours → $75–$118.75/hr, $300–$475 total", () => {
    // 60*1.25=75; 95*1.25=118.75; ×4h → 300 / 475
    const r = runTool({ experienceLevel: "mid", deliverable: "brand", projectHours: 4 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 75);
    assert.strictEqual(r.values!.hourlyRateHigh, 118.75);
    assert.strictEqual(r.values!.projectTotalLow, 300);
    assert.strictEqual(r.values!.projectTotalHigh, 475);
    assert.ok(r.values!.deliverableNote.includes("×1.25 complexity factor"));
  });

  it("senior + social (factor 0.85), 2 hours → $93.5–$127.5/hr, $187–$255 total", () => {
    // 110*0.85=93.5; 150*0.85=127.5; ×2h → 187 / 255
    const r = runTool({ experienceLevel: "senior", deliverable: "social", projectHours: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 93.5);
    assert.strictEqual(r.values!.hourlyRateHigh, 127.5);
    assert.strictEqual(r.values!.projectTotalLow, 187);
    assert.strictEqual(r.values!.projectTotalHigh, 255);
  });

  it("entry + print (factor 1.1), 5 hours → $33–$55/hr, $165–$275 total", () => {
    // 30*1.1=33; 50*1.1=55; ×5h → 165 / 275
    const r = runTool({ experienceLevel: "entry", deliverable: "print", projectHours: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 33);
    assert.strictEqual(r.values!.hourlyRateHigh, 55);
    assert.strictEqual(r.values!.projectTotalLow, 165);
    assert.strictEqual(r.values!.projectTotalHigh, 275);
  });

  it("accepts numeric strings for hours", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "logo", projectHours: "3" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectTotalLow, 180);
    assert.strictEqual(r.values!.projectTotalHigh, 285);
  });

  it("rounds fractional results half-up to 2 decimals", () => {
    // mid/social: 60*0.85=51; 95*0.85=80.75; ×1.5h → 76.5 / 121.125 → 121.13
    const r = runTool({ experienceLevel: "mid", deliverable: "social", projectHours: 1.5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectTotalLow, 76.5);
    assert.strictEqual(r.values!.projectTotalHigh, 121.13);
  });
});

describe("tool-072 validation errors", () => {
  it("rejects an unknown experience level", () => {
    const r = runTool({ experienceLevel: "guru", deliverable: "logo", projectHours: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a missing experience level", () => {
    const r = runTool({ deliverable: "logo", projectHours: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects an unknown deliverable", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "ui", projectHours: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a missing deliverable", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero project hours", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "logo", projectHours: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects negative project hours", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "logo", projectHours: -2 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects non-numeric project hours", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "logo", projectHours: "a lot" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects absurd project hours above the sanity cap", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "logo", projectHours: 500000 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
});

describe("tool-072 contract and determinism", () => {
  it("runs twice with identical results (deterministic)", () => {
    const args = { experienceLevel: "senior", deliverable: "brand", projectHours: 12.5 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returns exactly the output ids declared in meta.ts", () => {
    const r = runTool({ experienceLevel: "entry", deliverable: "print", projectHours: 2 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values!).sort(), [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("exports the benchmark tables used by the tool", () => {
    assert.strictEqual(CURRENCY, "USD");
    assert.deepStrictEqual([...EXPERIENCE_LEVELS], ["entry", "mid", "senior"]);
    assert.deepStrictEqual([...DELIVERABLES], ["logo", "brand", "social", "print"]);
    assert.deepStrictEqual(BASE_HOURLY_BANDS.entry, { low: 30, high: 50 });
    assert.deepStrictEqual(BASE_HOURLY_BANDS.senior, { low: 110, high: 150 });
    assert.strictEqual(DELIVERABLE_FACTORS.brand, 1.25);
    assert.strictEqual(DELIVERABLE_FACTORS.social, 0.85);
  });

  it("note labels the adjustment as an estimate, not a market quote", () => {
    const r = runTool({ experienceLevel: "mid", deliverable: "brand", projectHours: 3 });
    assert.ok(r.values!.deliverableNote.includes("estimate"));
    assert.ok(r.values!.deliverableNote.includes("not a market quote"));
  });
});
