/**
 * Tests for the Voiceover Rate Calculator pure logic (tool-075).
 *
 * Run: node --test app/tools/make-money/voiceover-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fixed benchmark tables in
 * logic.ts (narration 6 tiers; e-learning $300–600/hr; audiobook PFH
 * $200–400/hr; commercial flat $350–1000; IVR $100–300/min), never copied
 * from tool output. Output ids are cross-checked against meta.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  NARRATION_TIERS,
  ELEARNING_PER_HOUR,
  AUDIOBOOK_PER_HOUR,
  COMMERCIAL_FLAT,
  IVR_PER_MINUTE,
  PROJECT_TYPES,
  CURRENCY,
} from "./logic.ts";

const EXPECTED_OUTPUT_IDS = ["projectFeeLow", "projectFeeHigh", "pricingNote"];

describe("tool-075 happy paths", () => {
  it("narration 2 min → $350–$500 tier", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 350);
    assert.strictEqual(r.values!.projectFeeHigh, 500);
    assert.ok(r.values!.pricingNote.includes("Narration"));
  });

  it("narration 5 min → $500–$750 tier", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 500);
    assert.strictEqual(r.values!.projectFeeHigh, 750);
  });

  it("narration 30 min → $1,250–$1,750 tier (40-min cap band)", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 30 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 1250);
    assert.strictEqual(r.values!.projectFeeHigh, 1750);
  });

  it("narration 60 min → $1,500–$2,200 long-form tier", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 60 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 1500);
    assert.strictEqual(r.values!.projectFeeHigh, 2200);
  });

  it("e-learning 90 min → $450–$900 (1.5h × $300–$600/hr)", () => {
    const r = runTool({ projectType: "elearning", finishedMinutes: 90 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 450);
    assert.strictEqual(r.values!.projectFeeHigh, 900);
    assert.ok(r.values!.pricingNote.includes("per finished hour"));
  });

  it("audiobook 120 min → $400–$800 (2 finished hours × PFH $200–$400)", () => {
    const r = runTool({ projectType: "audiobook", finishedMinutes: 120 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 400);
    assert.strictEqual(r.values!.projectFeeHigh, 800);
    assert.ok(r.values!.pricingNote.includes("PFH"));
  });

  it("commercial → flat $350–$1,000 with buyout disclaimer", () => {
    const r = runTool({ projectType: "commercial", finishedMinutes: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 350);
    assert.strictEqual(r.values!.projectFeeHigh, 1000);
    assert.ok(r.values!.pricingNote.includes("buyout/usage tiers not modeled"));
  });

  it("IVR 3 min → $300–$900 (3 × $100–$300/min)", () => {
    const r = runTool({ projectType: "ivr", finishedMinutes: 3 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 300);
    assert.strictEqual(r.values!.projectFeeHigh, 900);
  });

  it("word count adds a pace note (750 words / 5 min → ~150 wpm)", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 5, wordCount: 750 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 500);
    assert.strictEqual(r.values!.projectFeeHigh, 750);
    assert.ok(r.values!.pricingNote.includes("150 words/minute"));
  });

  it("accepts numeric strings for minutes and word count", () => {
    const r = runTool({ projectType: "elearning", finishedMinutes: "60", wordCount: "9000" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 300);
    assert.strictEqual(r.values!.projectFeeHigh, 600);
    assert.ok(r.values!.pricingNote.includes("150 words/minute"));
  });

  it("ignores a blank word count (treated as not provided)", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 2, wordCount: "" });
    assert.strictEqual(r.ok, true);
    assert.ok(!r.values!.pricingNote.includes("words/minute"));
  });

  it("rounds to the nearest $25 (IVR 2.3 min → $225–$700)", () => {
    // 2.3×100=230→225 ; 2.3×300=690→700
    const r = runTool({ projectType: "ivr", finishedMinutes: 2.3 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectFeeLow, 225);
    assert.strictEqual(r.values!.projectFeeHigh, 700);
  });
});

describe("tool-075 validation errors", () => {
  it("rejects an unknown project type", () => {
    const r = runTool({ projectType: "podcast", finishedMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a missing project type", () => {
    const r = runTool({ finishedMinutes: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero finished minutes", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects a missing finished-minutes value", () => {
    const r = runTool({ projectType: "narration" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects non-numeric finished minutes", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: "long" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a zero word count when provided", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 5, wordCount: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects a non-numeric word count when provided", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 5, wordCount: "lots" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects minutes above the sanity cap", () => {
    const r = runTool({ projectType: "narration", finishedMinutes: 500000 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
});

describe("tool-075 contract and determinism", () => {
  it("runs twice with identical results (deterministic)", () => {
    const args = { projectType: "audiobook", finishedMinutes: 77, wordCount: 11550 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returns exactly the output ids declared in meta.ts", () => {
    const r = runTool({ projectType: "ivr", finishedMinutes: 4 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values!).sort(), [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("exports the benchmark tables used by the tool", () => {
    assert.strictEqual(CURRENCY, "USD");
    assert.deepStrictEqual([...PROJECT_TYPES], [
      "narration",
      "elearning",
      "commercial",
      "audiobook",
      "ivr",
    ]);
    assert.strictEqual(NARRATION_TIERS.length, 6);
    assert.deepStrictEqual(
      { low: NARRATION_TIERS[0].low, high: NARRATION_TIERS[0].high },
      { low: 350, high: 500 },
    );
    assert.deepStrictEqual(
      { low: NARRATION_TIERS[4].low, high: NARRATION_TIERS[4].high },
      { low: 1250, high: 1750 },
    );
    assert.deepStrictEqual(ELEARNING_PER_HOUR, { low: 300, high: 600 });
    assert.deepStrictEqual(AUDIOBOOK_PER_HOUR, { low: 200, high: 400 });
    assert.deepStrictEqual(COMMERCIAL_FLAT, { low: 350, high: 1000 });
    assert.deepStrictEqual(IVR_PER_MINUTE, { low: 100, high: 300 });
  });

  it("note labels the figures a GVAA-derived estimate, not official rates", () => {
    const r = runTool({ projectType: "elearning", finishedMinutes: 30 });
    assert.ok(r.values!.pricingNote.includes("GVAA-derived survey estimate"));
    assert.ok(r.values!.pricingNote.includes("not an official union/guild rate"));
  });
});
