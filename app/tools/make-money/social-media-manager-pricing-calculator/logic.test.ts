/**
 * Tests for the Social Media Manager Pricing Calculator pure logic (tool-074).
 *
 * Run: node --test app/tools/make-money/social-media-manager-pricing-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fixed benchmark tables in
 * logic.ts (tier bands basic $500–1200 / standard $1200–2500 / premium
 * $2500–4000; workload +25%/account, +5%/post above 8; service factors
 * ×1.2/×1.25/×1.1), never copied from tool output. Output ids are
 * cross-checked against meta.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  TIER_BASE_BANDS,
  SERVICE_FACTORS,
  PACKAGE_TIERS,
  CURRENCY,
} from "./logic.ts";

const EXPECTED_OUTPUT_IDS = [
  "monthlyRetainerLow",
  "monthlyRetainerHigh",
  "pricingBreakdown",
];

describe("tool-074 happy paths", () => {
  it("basic, 1 account, 8 posts, no services → $500–$1,200/mo", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: 1, postsPerWeek: 8 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerLow, 500);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 1200);
    assert.ok(r.values!.pricingBreakdown.includes("No extra services selected."));
    assert.ok(r.values!.pricingBreakdown.includes("Workload ×1 (1 account, 8 posts/week)"));
  });

  it("standard, 2 accounts, 12 posts, community → $2,100–$4,350/mo", () => {
    // workload = 1 + 0.25 + 0.05*4 = 1.45; ×1.2 = 1.74
    // 1200×1.74=2088→2100 ; 2500×1.74=4350
    const r = runTool({
      packageTier: "standard",
      accountsManaged: 2,
      postsPerWeek: 12,
      serviceCommunity: true,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerLow, 2100);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 4350);
    assert.ok(r.values!.pricingBreakdown.includes("community management +20%"));
    assert.ok(r.values!.pricingBreakdown.includes("Workload ×1.45"));
  });

  it("premium, 3 accounts, 16 posts, ads+reporting → $6,550–$10,450/mo", () => {
    // workload = 1 + 0.5 + 0.05*8 = 1.9; services 1.25×1.1 = 1.375; total 2.6125
    // 2500×2.6125=6531.25→6550 ; 4000×2.6125=10450
    const r = runTool({
      packageTier: "premium",
      accountsManaged: 3,
      postsPerWeek: 16,
      serviceAds: true,
      serviceReporting: true,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerLow, 6550);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 10450);
    assert.ok(r.values!.pricingBreakdown.includes("paid ads management +25%"));
    assert.ok(r.values!.pricingBreakdown.includes("monthly reporting +10%"));
  });

  it("all three services stack multiplicatively: basic → $850–$2,000/mo", () => {
    // 1.2×1.25×1.1 = 1.65 ; 500×1.65=825→850 ; 1200×1.65=1980→2000
    const r = runTool({
      packageTier: "basic",
      accountsManaged: 1,
      postsPerWeek: 8,
      serviceCommunity: true,
      serviceAds: true,
      serviceReporting: true,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerLow, 850);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 2000);
  });

  it("accepts string 'true' for service toggles", () => {
    const r = runTool({
      packageTier: "basic",
      accountsManaged: 1,
      postsPerWeek: 8,
      serviceReporting: "true",
    });
    assert.strictEqual(r.ok, true);
    // 500×1.1=550 ; 1200×1.1=1320→1300
    assert.strictEqual(r.values!.monthlyRetainerLow, 550);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 1300);
  });

  it("accepts numeric strings for accounts and posts", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: "1", postsPerWeek: "8" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerLow, 500);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 1200);
  });

  it("rounds half-up to the nearest $50", () => {
    // standard, 1 account, 9 posts, no services: 1 + 0.05 = 1.05
    // 1200×1.05=1260→1250 ; 2500×1.05=2625→2650 (2625/50=52.5→53)
    const r = runTool({ packageTier: "standard", accountsManaged: 1, postsPerWeek: 9 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerLow, 1250);
    assert.strictEqual(r.values!.monthlyRetainerHigh, 2650);
  });
});

describe("tool-074 validation errors", () => {
  it("rejects an unknown package tier", () => {
    const r = runTool({ packageTier: "ultra", accountsManaged: 1, postsPerWeek: 8 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a missing package tier", () => {
    const r = runTool({ accountsManaged: 1, postsPerWeek: 8 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero accounts", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: 0, postsPerWeek: 8 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects fractional accounts", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: 1.5, postsPerWeek: 8 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("whole number"));
  });

  it("rejects zero posts per week", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: 1, postsPerWeek: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects non-numeric posts per week", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: 1, postsPerWeek: "many" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects accounts above the sanity cap", () => {
    const r = runTool({ packageTier: "basic", accountsManaged: 50000, postsPerWeek: 8 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
});

describe("tool-074 contract and determinism", () => {
  it("runs twice with identical results (deterministic)", () => {
    const args = {
      packageTier: "standard",
      accountsManaged: 2,
      postsPerWeek: 10,
      serviceCommunity: true,
    };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returns exactly the output ids declared in meta.ts", () => {
    const r = runTool({ packageTier: "premium", accountsManaged: 1, postsPerWeek: 5 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values!).sort(), [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("exports the benchmark tables used by the tool", () => {
    assert.strictEqual(CURRENCY, "USD");
    assert.deepStrictEqual([...PACKAGE_TIERS], ["basic", "standard", "premium"]);
    assert.deepStrictEqual(TIER_BASE_BANDS.basic, { low: 500, high: 1200 });
    assert.deepStrictEqual(TIER_BASE_BANDS.premium, { low: 2500, high: 4000 });
    assert.strictEqual(SERVICE_FACTORS.serviceCommunity, 1.2);
    assert.strictEqual(SERVICE_FACTORS.serviceAds, 1.25);
    assert.strictEqual(SERVICE_FACTORS.serviceReporting, 1.1);
  });

  it("breakdown labels the band a survey estimate", () => {
    const r = runTool({ packageTier: "standard", accountsManaged: 2, postsPerWeek: 10 });
    assert.ok(r.values!.pricingBreakdown.includes("survey estimate"));
    assert.ok(r.values!.pricingBreakdown.includes("Wide survey band"));
  });
});
