/**
 * Tests for the Video Editor Rate Calculator pure logic (tool-071).
 *
 * Run: node --test app/tools/make-money/video-editor-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fixed benchmark table in
 * logic.ts (entry $15–40, mid $50–100, senior $100–250), never copied from
 * tool output. Output ids are cross-checked against meta.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, HOURLY_RATE_BANDS, EXPERIENCE_LEVELS, CURRENCY } from "./logic.ts";

const EXPECTED_OUTPUT_IDS = [
  "hourlyRateLow",
  "hourlyRateHigh",
  "projectTotalLow",
  "projectTotalHigh",
  "perFinishedMinuteNote",
];

describe("tool-071 happy paths", () => {
  it("entry level: $15–40/hr, 10 hours → $150–$400 project total", () => {
    const r = runTool({ experienceLevel: "entry", projectHours: 10, videoMinutes: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 15);
    assert.strictEqual(r.values!.hourlyRateHigh, 40);
    assert.strictEqual(r.values!.projectTotalLow, 150);
    assert.strictEqual(r.values!.projectTotalHigh, 400);
    // per finished minute: 150/10=15 → 400/10=40
    assert.ok(r.values!.perFinishedMinuteNote.includes("$15–$40 per finished minute"));
  });

  it("mid level: $50–100/hr, 6 hours → $300–$600 project total", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: 6, videoMinutes: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 50);
    assert.strictEqual(r.values!.hourlyRateHigh, 100);
    assert.strictEqual(r.values!.projectTotalLow, 300);
    assert.strictEqual(r.values!.projectTotalHigh, 600);
  });

  it("senior level: $100–$250/hr, 2 hours → $200–$500 project total", () => {
    const r = runTool({ experienceLevel: "senior", projectHours: 2, videoMinutes: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 100);
    assert.strictEqual(r.values!.hourlyRateHigh, 250);
    assert.strictEqual(r.values!.projectTotalLow, 200);
    assert.strictEqual(r.values!.projectTotalHigh, 500);
  });

  it("accepts numeric strings for hours and minutes", () => {
    const r = runTool({ experienceLevel: "entry", projectHours: "8", videoMinutes: "4" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectTotalLow, 120);
    assert.strictEqual(r.values!.projectTotalHigh, 320);
  });

  it("accepts level case-insensitively", () => {
    const r = runTool({ experienceLevel: "Senior", projectHours: 1, videoMinutes: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.hourlyRateLow, 100);
    assert.strictEqual(r.values!.hourlyRateHigh, 250);
  });

  it("rounds fractional hours half-up to 2 decimals", () => {
    // 15 * 1.037 = 15.555 → 15.56 ; 40 * 1.037 = 41.48
    const r = runTool({ experienceLevel: "entry", projectHours: 1.037, videoMinutes: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectTotalLow, 15.56);
    assert.strictEqual(r.values!.projectTotalHigh, 41.48);
  });
});

describe("tool-071 validation errors", () => {
  it("rejects an unknown experience level", () => {
    const r = runTool({ experienceLevel: "expert", projectHours: 5, videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("rejects a missing experience level", () => {
    const r = runTool({ projectHours: 5, videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero project hours", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: 0, videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects negative project hours", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: -3, videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects non-numeric project hours", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: "lots", videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects missing project hours", () => {
    const r = runTool({ experienceLevel: "mid", videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero video minutes", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: 5, videoMinutes: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects a missing video length", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects absurd project hours above the sanity cap", () => {
    const r = runTool({ experienceLevel: "mid", projectHours: 1000000, videoMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
});

describe("tool-071 contract and determinism", () => {
  it("runs twice with identical results (deterministic)", () => {
    const args = { experienceLevel: "mid", projectHours: 7.5, videoMinutes: 12 };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepStrictEqual(a, b);
  });

  it("returns exactly the output ids declared in meta.ts", () => {
    const r = runTool({ experienceLevel: "entry", projectHours: 4, videoMinutes: 2 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values!).sort(), [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("exports the benchmark constants used by the table", () => {
    assert.strictEqual(CURRENCY, "USD");
    assert.deepStrictEqual([...EXPERIENCE_LEVELS], ["entry", "mid", "senior"]);
    assert.deepStrictEqual(HOURLY_RATE_BANDS.entry, { low: 15, high: 40 });
    assert.deepStrictEqual(HOURLY_RATE_BANDS.mid, { low: 50, high: 100 });
    assert.deepStrictEqual(HOURLY_RATE_BANDS.senior, { low: 100, high: 250 });
  });

  it("note labels the figure as an estimate, not a market quote", () => {
    const r = runTool({ experienceLevel: "entry", projectHours: 10, videoMinutes: 10 });
    assert.ok(r.values!.perFinishedMinuteNote.includes("estimate"));
  });
});
