/**
 * Tests for the UGC Creator Pricing Calculator (tool-083).
 *
 * Run: node --test app/tools/make-money/ugc-creator-pricing-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the constants in logic.ts,
 * never copied from tool output. Benchmark bands are labeled estimates;
 * tests assert the math and honesty labels, not "real" market rates.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateUgcPrice,
  runTool,
  roundUgcRate,
  BASE_PER_VIDEO,
  USAGE_MULTIPLIERS,
  POSTING_ADDON_LOW,
  POSTING_ADDON_HIGH,
} from "./logic.ts";

const OUTPUT_IDS = ["rateLow", "rateHigh", "perVideoLow", "perVideoHigh", "currency", "note"];

describe("roundUgcRate", () => {
  it("rounds to the nearest $25", () => {
    assert.strictEqual(roundUgcRate(499), 500);
    assert.strictEqual(roundUgcRate(512), 500);
    assert.strictEqual(roundUgcRate(513), 525);
    assert.strictEqual(roundUgcRate(500), 500);
  });
});

describe("calculateUgcPrice — happy paths", () => {
  it("organic, no posting: videoCount × $500", () => {
    // 2 videos × 500 × 1.0 × 1.0 = 1000–1000; per-video 500–500.
    const r = calculateUgcPrice({ videoCount: 2, usageRights: "organic", postingRequired: false });
    assert.strictEqual(r.rateLow, 1000);
    assert.strictEqual(r.rateHigh, 1000);
    assert.strictEqual(r.perVideoLow, 500);
    assert.strictEqual(r.perVideoHigh, 500);
    assert.strictEqual(r.currency, "USD");
  });

  it("paid_ads, no posting: 1.5–2.5× multiplier", () => {
    // 1 video × 500 × 1.5 = 750; × 2.5 = 1250. Both already $25 multiples.
    const r = calculateUgcPrice({ videoCount: 1, usageRights: "paid_ads", postingRequired: false });
    assert.strictEqual(r.rateLow, 750);
    assert.strictEqual(r.rateHigh, 1250);
  });

  it("whitelisting, no posting: 2.0–3.0× multiplier", () => {
    // 3 videos × 500 × 2.0 = 3000; × 3.0 = 4500.
    const r = calculateUgcPrice({ videoCount: 3, usageRights: "whitelisting", postingRequired: false });
    assert.strictEqual(r.rateLow, 3000);
    assert.strictEqual(r.rateHigh, 4500);
    assert.strictEqual(r.perVideoLow, 1000);
    assert.strictEqual(r.perVideoHigh, 1500);
  });

  it("posting add-on: +25–50%", () => {
    // 1 video organic with posting: 500×1.25=625 -> 625; 500×1.5=750 -> 750.
    const r = calculateUgcPrice({ videoCount: 1, usageRights: "organic", postingRequired: true });
    assert.strictEqual(r.rateLow, 625);
    assert.strictEqual(r.rateHigh, 750);
  });

  it("paid_ads + posting: multipliers combine", () => {
    // 4 videos: low=4×500×1.5×1.25=3750; high=4×500×2.5×1.5=7500.
    const r = calculateUgcPrice({ videoCount: 4, usageRights: "paid_ads", postingRequired: true });
    assert.strictEqual(r.rateLow, 3750);
    assert.strictEqual(r.rateHigh, 7500);
    assert.strictEqual(r.perVideoLow, 950); // 500×1.5×1.25=937.5 -> 950
    assert.strictEqual(r.perVideoHigh, 1875); // 500×2.5×1.5=1875
  });

  it("rounding kicks in on odd multipliers", () => {
    // 1 video whitelisting with posting: low=500×2.0×1.25=1250; high=500×3.0×1.5=2250.
    const r = calculateUgcPrice({ videoCount: 1, usageRights: "whitelisting", postingRequired: true });
    assert.strictEqual(r.rateLow, 1250);
    assert.strictEqual(r.rateHigh, 2250);
    assert.strictEqual(r.rateLow % 25, 0, "low must be a $25 multiple");
    assert.strictEqual(r.rateHigh % 25, 0, "high must be a $25 multiple");
  });

  it("note names the base, multiplier, addon, and estimate labels", () => {
    const r = calculateUgcPrice({ videoCount: 2, usageRights: "paid_ads", postingRequired: true });
    assert.ok(r.note.includes("$500"), "note must name the base rate");
    assert.ok(r.note.includes("1.5–2.5"), "note must name the multiplier");
    assert.ok(r.note.includes("+25–50%"), "note must name the posting add-on");
    assert.ok(r.note.includes("labeled estimate"), "note must label estimates");
    assert.ok(r.note.includes("vary by niche"), "note must cite variance");
  });

  it("note says no posting required when postingRequired is false", () => {
    const r = calculateUgcPrice({ videoCount: 1, usageRights: "organic", postingRequired: false });
    assert.ok(r.note.includes("no posting required"));
    assert.ok(!r.note.includes("+25–50%"));
  });

  it("exposes the documented benchmark constants", () => {
    assert.strictEqual(BASE_PER_VIDEO, 500);
    assert.deepStrictEqual([USAGE_MULTIPLIERS.paid_ads.low, USAGE_MULTIPLIERS.paid_ads.high], [1.5, 2.5]);
    assert.deepStrictEqual([USAGE_MULTIPLIERS.whitelisting.low, USAGE_MULTIPLIERS.whitelisting.high], [2.0, 3.0]);
    assert.deepStrictEqual([USAGE_MULTIPLIERS.organic.low, USAGE_MULTIPLIERS.organic.high], [1.0, 1.0]);
    assert.deepStrictEqual([POSTING_ADDON_LOW, POSTING_ADDON_HIGH], [0.25, 0.5]);
  });
});

describe("calculateUgcPrice — invalid input", () => {
  it("rejects zero / negative / fractional videoCount", () => {
    assert.throws(() => calculateUgcPrice({ videoCount: 0, usageRights: "organic", postingRequired: false }), RangeError);
    assert.throws(() => calculateUgcPrice({ videoCount: -2, usageRights: "organic", postingRequired: false }), RangeError);
    assert.throws(() => calculateUgcPrice({ videoCount: 1.5, usageRights: "organic", postingRequired: false }), RangeError);
  });

  it("rejects non-numeric videoCount", () => {
    assert.throws(() => calculateUgcPrice({ videoCount: NaN, usageRights: "organic", postingRequired: false }), TypeError);
    assert.throws(() => calculateUgcPrice({ videoCount: "3" as unknown as number, usageRights: "organic", postingRequired: false }), TypeError);
  });

  it("rejects an unknown usage-rights tier", () => {
    assert.throws(
      () => calculateUgcPrice({ videoCount: 1, usageRights: "exclusive" as never, postingRequired: false }),
      TypeError,
    );
  });

  it("rejects non-boolean postingRequired", () => {
    assert.throws(
      () => calculateUgcPrice({ videoCount: 1, usageRights: "organic", postingRequired: "yes" as unknown as boolean }),
      TypeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => calculateUgcPrice(null as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("computes total and per-video ranges", () => {
    // 2 videos, organic, no posting: 1000–1000 total, 500–500 per video.
    const r = runTool({ videoCount: 2, usageRights: "organic", postingRequired: false });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values?.["rateLow"], 1000);
    assert.strictEqual(r.values?.["rateHigh"], 1000);
    assert.strictEqual(r.values?.["perVideoLow"], 500);
    assert.strictEqual(r.values?.["perVideoHigh"], 500);
  });

  it("errors on invalid inputs with human messages", () => {
    assert.strictEqual(runTool({}).ok, false);
    assert.ok((runTool({}).error ?? "").length > 0);
    assert.strictEqual(runTool({ videoCount: 0, usageRights: "organic", postingRequired: false }).ok, false);
    assert.strictEqual(runTool({ videoCount: 2.5, usageRights: "organic", postingRequired: false }).ok, false);
    assert.strictEqual(runTool({ videoCount: 2, usageRights: "tv", postingRequired: false }).ok, false);
    assert.strictEqual(runTool({ videoCount: 2, usageRights: "organic", postingRequired: "no" }).ok, false);
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });

  it("returns exactly the meta.ts output ids", () => {
    const r = runTool({ videoCount: 3, usageRights: "paid_ads", postingRequired: true });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values ?? {}).sort(), [...OUTPUT_IDS].sort());
  });

  it("is deterministic: two runs give identical results", () => {
    const a = runTool({ videoCount: 5, usageRights: "whitelisting", postingRequired: true });
    const b = runTool({ videoCount: 5, usageRights: "whitelisting", postingRequired: true });
    assert.deepStrictEqual(a, b);
  });
});
