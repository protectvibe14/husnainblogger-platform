/**
 * Tests for the YouTube Sponsorship Rate Calculator (tool-081).
 *
 * Run: node --test app/tools/make-money/youtube-sponsorship-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the tier table in logic.ts,
 * never copied from tool output. Benchmark bands are estimates; tests
 * assert the math and the honesty labels, not "real" market rates.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateYouTubeRate,
  runTool,
  roundSponsorship,
  tierIndexFor,
  CREATOR_TIERS,
  INTEGRATION_MULTIPLIER_LOW,
  INTEGRATION_MULTIPLIER_HIGH,
} from "./logic.ts";

const OUTPUT_IDS = ["rateLow", "rateHigh", "currency", "tier", "tierDrivenBy", "note"];

describe("roundSponsorship", () => {
  it("rounds values under $1,000 to the nearest $10", () => {
    // 0.3*200=60 -> 60; 0.3*1000=300 -> 300; 234 -> 230.
    assert.strictEqual(roundSponsorship(234), 230);
    assert.strictEqual(roundSponsorship(236), 240);
  });

  it("rounds values of $1,000+ to the nearest $500", () => {
    // 1200 -> 1000; 1400 -> 1500.
    assert.strictEqual(roundSponsorship(1200), 1000);
    assert.strictEqual(roundSponsorship(1400), 1500);
  });
});

describe("tierIndexFor", () => {
  it("maps boundary counts to the right tiers", () => {
    assert.strictEqual(tierIndexFor(9999), 0); // nano
    assert.strictEqual(tierIndexFor(10000), 1); // micro
    assert.strictEqual(tierIndexFor(999999), 2); // mid
    assert.strictEqual(tierIndexFor(1000000), 3); // macro
    assert.strictEqual(tierIndexFor(10000000), 4); // mega
    assert.strictEqual(tierIndexFor(1), 0);
  });
});

describe("calculateYouTubeRate — happy paths", () => {
  it("nano dedicated: $20–$200 (micro tier not triggered)", () => {
    // subs=5000 -> nano; views=3000 -> nano; dedicated x1.0; no rounding change.
    const r = calculateYouTubeRate({ subscriberCount: 5000, avgViews: 3000, integrationType: "dedicated" });
    assert.strictEqual(r.rateLow, 20);
    assert.strictEqual(r.rateHigh, 200);
    assert.strictEqual(r.currency, "USD");
    assert.strictEqual(r.tier, CREATOR_TIERS[0].label);
    assert.strictEqual(r.tierDrivenBy, "subscribers");
  });

  it("micro integration: band × 0.3–0.5", () => {
    // micro band 200–1000; low=200*0.3=60 -> 60; high=1000*0.5=500 -> 500.
    const r = calculateYouTubeRate({ subscriberCount: 50000, avgViews: 40000, integrationType: "integration" });
    assert.strictEqual(r.rateLow, 60);
    assert.strictEqual(r.rateHigh, 500);
    assert.strictEqual(r.tier, CREATOR_TIERS[1].label);
  });

  it("mega dedicated: $50,000–$300,000", () => {
    const r = calculateYouTubeRate({ subscriberCount: 15000000, avgViews: 2000000, integrationType: "dedicated" });
    assert.strictEqual(r.rateLow, 50000);
    assert.strictEqual(r.rateHigh, 300000);
    assert.strictEqual(r.tier, CREATOR_TIERS[4].label);
  });

  it("mid-tier integration rounds to nearest $500", () => {
    // mid band 1000–10000; low=1000*0.3=300 -> 300; high=10000*0.5=5000 -> 5000.
    const r = calculateYouTubeRate({ subscriberCount: 400000, avgViews: 150000, integrationType: "integration" });
    assert.strictEqual(r.rateLow, 300);
    assert.strictEqual(r.rateHigh, 5000);
  });

  it("outsized views raise the tier (views-driven)", () => {
    // subs=5000 (nano) but views=500000 (mid) -> mid tier, driven by views.
    // mid band 1000–10000 dedicated -> 1000–10000.
    const r = calculateYouTubeRate({ subscriberCount: 5000, avgViews: 500000, integrationType: "dedicated" });
    assert.strictEqual(r.tier, CREATOR_TIERS[2].label);
    assert.strictEqual(r.tierDrivenBy, "views");
    assert.strictEqual(r.rateLow, 1000);
    assert.strictEqual(r.rateHigh, 10000);
  });

  it("labels estimate honesty in the note", () => {
    const r = calculateYouTubeRate({ subscriberCount: 20000, avgViews: 15000, integrationType: "integration" });
    const n = r.note;
    assert.ok(n.includes("estimate"), "note must say estimate");
    assert.ok(n.includes("0.3–0.5"), "note must cite the integration multiplier");
    assert.ok(n.includes("not guarantees"), "note must deny guarantees");
    assert.ok(n.includes("vary by niche"), "note must cite variance factors");
  });

  it("dedicated note does not mention the integration multiplier", () => {
    const r = calculateYouTubeRate({ subscriberCount: 20000, avgViews: 15000, integrationType: "dedicated" });
    assert.ok(!r.note.includes("0.3–0.5"), "dedicated note must not cite the integration multiplier");
    assert.ok(r.note.includes("estimate"), "still an estimate");
  });
});

describe("calculateYouTubeRate — invalid input", () => {
  it("rejects zero and negative subscriberCount / avgViews", () => {
    assert.throws(() => calculateYouTubeRate({ subscriberCount: 0, avgViews: 100, integrationType: "dedicated" }), RangeError);
    assert.throws(() => calculateYouTubeRate({ subscriberCount: -5, avgViews: 100, integrationType: "dedicated" }), RangeError);
    assert.throws(() => calculateYouTubeRate({ subscriberCount: 100, avgViews: 0, integrationType: "dedicated" }), RangeError);
  });

  it("rejects non-numeric / non-finite input", () => {
    assert.throws(() => calculateYouTubeRate({ subscriberCount: NaN, avgViews: 100, integrationType: "dedicated" }), TypeError);
    assert.throws(() => calculateYouTubeRate({ subscriberCount: Infinity, avgViews: 100, integrationType: "dedicated" }), TypeError);
    assert.throws(() => calculateYouTubeRate({ subscriberCount: "5000" as unknown as number, avgViews: 100, integrationType: "dedicated" }), TypeError);
  });

  it("rejects an unknown integration type", () => {
    assert.throws(
      () => calculateYouTubeRate({ subscriberCount: 5000, avgViews: 100, integrationType: "shoutout" as never }),
      TypeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => calculateYouTubeRate(null as never), TypeError);
  });

  it("rejects unrealistically large counts", () => {
    assert.throws(() => calculateYouTubeRate({ subscriberCount: 1e13, avgViews: 100, integrationType: "dedicated" }), RangeError);
  });
});

describe("runTool adapter", () => {
  it("computes a range for valid values", () => {
    // subs=20000, views=15000 -> micro dedicated -> 200–1000.
    const r = runTool({ subscriberCount: 20000, avgViews: 15000, integrationType: "dedicated" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values?.["rateLow"], 200);
    assert.strictEqual(r.values?.["rateHigh"], 1000);
    assert.strictEqual(r.values?.["currency"], "USD");
  });

  it("errors on missing / invalid inputs with human messages", () => {
    assert.strictEqual(runTool({}).ok, false);
    assert.ok((runTool({}).error ?? "").length > 0);
    assert.strictEqual(runTool({ subscriberCount: 0, avgViews: 100, integrationType: "dedicated" }).ok, false);
    assert.strictEqual(runTool({ subscriberCount: 100, avgViews: -1, integrationType: "dedicated" }).ok, false);
    assert.strictEqual(runTool({ subscriberCount: 100, avgViews: 50, integrationType: "pre-roll" }).ok, false);
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });

  it("returns exactly the meta.ts output ids", () => {
    const r = runTool({ subscriberCount: 3000, avgViews: 2000, integrationType: "integration" });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values ?? {}).sort(), [...OUTPUT_IDS].sort());
  });

  it("is deterministic: two runs give identical results", () => {
    const a = runTool({ subscriberCount: 75000, avgViews: 60000, integrationType: "integration" });
    const b = runTool({ subscriberCount: 75000, avgViews: 60000, integrationType: "integration" });
    assert.deepStrictEqual(a, b);
  });

  it("exposes the integration multiplier constants as 0.3 / 0.5", () => {
    assert.strictEqual(INTEGRATION_MULTIPLIER_LOW, 0.3);
    assert.strictEqual(INTEGRATION_MULTIPLIER_HIGH, 0.5);
  });
});
