/**
 * Tests for blog-niche-profitability-calculator logic (tool-100).
 * node:test + node:assert only. Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/blog-niche-profitability-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CAPTURE_RATE,
  DISCLAIMER_TEXT,
  NICHE_OPTIONS,
  WEIGHT_COMPETITION,
  WEIGHT_MONETIZATION,
  WEIGHT_RPM,
  WEIGHT_TRAFFIC,
  calculateNicheProfitability,
  runTool,
} from "./logic.ts";

const EXPECTED_OUTPUT_IDS = [
  "disclaimer",
  "estimatedMonthlyPotential",
  "methodBreakdown",
  "profitabilityScore",
].sort();

function approxEqual(actual: number, expected: number, tol = 1e-9): void {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected}`,
  );
}

describe("published rubric constants", () => {
  it("weights are equal and sum to 1", () => {
    assert.equal(WEIGHT_TRAFFIC, 0.25);
    assert.equal(WEIGHT_COMPETITION, 0.25);
    assert.equal(WEIGHT_MONETIZATION, 0.25);
    assert.equal(WEIGHT_RPM, 0.25);
    assert.equal(
      WEIGHT_TRAFFIC + WEIGHT_COMPETITION + WEIGHT_MONETIZATION + WEIGHT_RPM,
      1,
    );
  });

  it("capture rate heuristic is the documented 5%", () => {
    assert.equal(CAPTURE_RATE, 0.05);
  });

  it("niche list is non-empty", () => {
    assert.ok(NICHE_OPTIONS.length >= 10);
    assert.ok(NICHE_OPTIONS.includes("Technology"));
  });
});

describe("calculateNicheProfitability — happy path", () => {
  it("perfect inputs score 100: 10M volume, low competition, 4 methods, $50 RPM", () => {
    const r = calculateNicheProfitability({
      niche: "Technology",
      monthlySearchVolume: 10_000_000,
      competitionLevel: "low",
      monetAds: true,
      monetAffiliate: true,
      monetProducts: true,
      monetSponsored: true,
      avgRpm: 50,
    });
    // T=1, (1-C)=1, M=1, R=1 -> 25*4 = 100
    assert.equal(r.profitabilityScore, 100);
    // potential = 1e7 * 0.05 * 50 / 1000 = 25000
    assert.equal(r.estimatedMonthlyPotential, 25000);
    assert.equal(r.methodBreakdown.length, 4);
    assert.ok(r.methodBreakdown[0].includes("Display ads"));
    assert.ok(r.methodBreakdown[0].includes("$6250.00/mo"));
    assert.ok(r.methodBreakdown[0].includes("25%"));
    assert.equal(r.disclaimer, DISCLAIMER_TEXT);
  });

  it("weak inputs score low: volume 100, high competition, 1 method, $5 RPM", () => {
    const r = calculateNicheProfitability({
      niche: "Pets",
      monthlySearchVolume: 100,
      competitionLevel: "high",
      monetAds: true,
      avgRpm: 5,
    });
    // T = log10(100)/7 = 2/7; (1-C)=0; M=0.25; R=0.1
    // 25 * (0.285714 + 0 + 0.25 + 0.1) = 15.892... -> 16
    assert.equal(r.profitabilityScore, 16);
    // 100 * 0.05 * 5 / 1000 = 0.025 -> rounds half-up to $0.03
    assert.equal(r.estimatedMonthlyPotential, 0.03);
    assert.equal(r.methodBreakdown.length, 1);
  });

  it("medium competition halves the competition term", () => {
    const a = calculateNicheProfitability({
      niche: "Travel",
      monthlySearchVolume: 10_000_000,
      competitionLevel: "low",
      avgRpm: 50,
    });
    const b = calculateNicheProfitability({
      niche: "Travel",
      monthlySearchVolume: 10_000_000,
      competitionLevel: "medium",
      avgRpm: 50,
    });
    // a: 25*(1+1+0+1) = 75; b: 25*(1+0.5+0+1) = 62.5 -> 63 (round half-up)
    assert.equal(a.profitabilityScore, 75);
    assert.equal(b.profitabilityScore, 63);
  });

  it("volume above 10M clamps the traffic factor at 1", () => {
    const r = calculateNicheProfitability({
      niche: "Travel",
      monthlySearchVolume: 500_000_000,
      competitionLevel: "low",
      avgRpm: 50,
    });
    assert.equal(r.profitabilityScore, 75); // same as 10M case above
  });

  it("RPM above $50 clamps the RPM factor at 1", () => {
    const r = calculateNicheProfitability({
      niche: "Travel",
      monthlySearchVolume: 10_000_000,
      competitionLevel: "low",
      avgRpm: 200,
    });
    assert.equal(r.profitabilityScore, 75);
  });

  it("no methods selected: monetization scores 0 with an explanatory breakdown", () => {
    const r = calculateNicheProfitability({
      niche: "Food & Recipes",
      monthlySearchVolume: 1_000_000,
      competitionLevel: "medium",
      avgRpm: 20,
    });
    assert.equal(r.methodBreakdown.length, 1);
    assert.match(r.methodBreakdown[0], /no monetization methods/i);
    // T=log10(1e6)/7≈0.857; (1-C)=0.5; M=0; R=0.4 -> 25*1.757=43.93 -> 44
    assert.equal(r.profitabilityScore, 44);
  });

  it("score is an integer in 0..100 across a sweep", () => {
    for (const volume of [1, 500, 100_000, 50_000_000]) {
      for (const competitionLevel of ["low", "medium", "high"]) {
        for (const rpm of [1, 25, 100]) {
          const r = calculateNicheProfitability({
            niche: "Other",
            monthlySearchVolume: volume,
            competitionLevel,
            monetAffiliate: true,
            avgRpm: rpm,
          });
          assert.ok(Number.isInteger(r.profitabilityScore));
          assert.ok(r.profitabilityScore >= 0 && r.profitabilityScore <= 100);
        }
      }
    }
  });
});

describe("calculateNicheProfitability — validation errors", () => {
  const good = {
    niche: "Technology",
    monthlySearchVolume: 100_000,
    competitionLevel: "medium",
    monetAds: true,
    avgRpm: 20,
  };

  it("unknown niche throws TypeError", () => {
    assert.throws(
      () => calculateNicheProfitability({ ...good, niche: "Spaceships" }),
      TypeError,
    );
  });

  it("unknown competition level throws TypeError", () => {
    assert.throws(
      () => calculateNicheProfitability({ ...good, competitionLevel: "extreme" }),
      TypeError,
    );
  });

  it("volume 0 throws RangeError", () => {
    assert.throws(
      () => calculateNicheProfitability({ ...good, monthlySearchVolume: 0 }),
      RangeError,
    );
  });

  it("volume negative throws RangeError", () => {
    assert.throws(
      () => calculateNicheProfitability({ ...good, monthlySearchVolume: -50 }),
      RangeError,
    );
  });

  it("avgRpm 0 throws RangeError", () => {
    assert.throws(
      () => calculateNicheProfitability({ ...good, avgRpm: 0 }),
      RangeError,
    );
  });

  it("avgRpm NaN throws TypeError", () => {
    assert.throws(
      () => calculateNicheProfitability({ ...good, avgRpm: Number.NaN }),
      TypeError,
    );
  });

  it("non-boolean monetAds throws TypeError", () => {
    assert.throws(
      () =>
        calculateNicheProfitability({
          ...good,
          monetAds: "yes" as unknown as boolean,
        }),
      TypeError,
    );
  });

  it("non-object input throws TypeError", () => {
    assert.throws(() => calculateNicheProfitability(null as unknown as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("happy path returns ok:true with the meta output ids", () => {
    const r = runTool({
      niche: "Technology",
      monthlySearchVolume: 10_000_000,
      competitionLevel: "low",
      monetAds: true,
      monetAffiliate: true,
      monetProducts: true,
      monetSponsored: true,
      avgRpm: 50,
    });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), EXPECTED_OUTPUT_IDS);
    assert.equal(r.values?.["profitabilityScore"], 100);
  });

  it("zero volume returns ok:false", () => {
    const r = runTool({
      niche: "Travel",
      monthlySearchVolume: 0,
      competitionLevel: "low",
      avgRpm: 20,
    });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("bad competition level returns ok:false", () => {
    const r = runTool({
      niche: "Travel",
      monthlySearchVolume: 1000,
      competitionLevel: "none",
      avgRpm: 20,
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /competition/i);
  });

  it("missing inputs return ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("is deterministic: two runs give identical results", () => {
    const input = {
      niche: "Health & Fitness",
      monthlySearchVolume: 750_000,
      competitionLevel: "medium",
      monetAds: true,
      monetProducts: true,
      avgRpm: 18.5,
    };
    assert.deepEqual(runTool(input), runTool(input));
  });
});
