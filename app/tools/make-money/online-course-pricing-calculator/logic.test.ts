/**
 * Tests for the Online Course Pricing Calculator pure logic (tool-091).
 *
 * Run: node --test app/tools/make-money/online-course-pricing-calculator/logic.test.ts
 *
 * Expected values are hand-computed from the band constants and formula
 * (hours^0.85 scaling, fee gross-up, round to nearest $10) — never copied
 * from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  roundToNearestTen,
  hoursFactor,
  HOURLY_BANDS,
  ESTIMATE_LABEL,
  HOURS_EXPONENT,
} from "./logic.ts";

const GOOD = {
  courseHours: 8,
  nicheValue: "medium",
  studentOutcome: "career",
  platformFeeRate: 5,
};

describe("runTool — happy path (8h, medium niche, career outcome, 5% fee)", () => {
  it("returns priceLow 250 / priceHigh 620 with label and band detail", () => {
    // Hand-computed: factor = 8^0.85 ≈ 5.85634; gross-up = 1/0.95 ≈ 1.05263.
    // low = 40 × 5.85634 × 1.05263 ≈ 246.58 → 250
    // high = 100 × 5.85634 × 1.05263 ≈ 616.46 → 620
    const r = runTool(GOOD);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.priceLow, 250);
    assert.strictEqual(r.values!.priceHigh, 620);
    assert.strictEqual(r.values!.estimateLabel, ESTIMATE_LABEL);
    assert.ok(String(r.values!.bandDetail).includes("$40–$100/hr"));
    assert.ok(String(r.values!.bandDetail).includes("8h"));
    assert.ok(String(r.values!.bandDetail).includes("platform fee"));
  });

  it("fee=0 gives 230/590 (no gross-up)", () => {
    // low = 40 × 5.85634 ≈ 234.25 → 230; high = 585.63 → 590
    const r = runTool({ ...GOOD, platformFeeRate: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.priceLow, 230);
    assert.strictEqual(r.values!.priceHigh, 590);
    assert.ok(!String(r.values!.bandDetail).includes("platform fee"));
  });

  it("defaults platformFeeRate to 0 when omitted", () => {
    const { platformFeeRate: _omit, ...rest } = GOOD;
    const r = runTool(rest);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.priceLow, 230);
  });

  it("a 50% fee doubles the price vs 0% (1h, high niche, business outcome)", () => {
    const base = { courseHours: 1, nicheValue: "high", studentOutcome: "business", platformFeeRate: 0 };
    const r0 = runTool(base);
    const r50 = runTool({ ...base, platformFeeRate: 50 });
    assert.strictEqual(r0.values!.priceLow, 100);
    assert.strictEqual(r50.values!.priceLow, 200);
    assert.strictEqual(r50.values!.priceHigh, 600);
  });
});

describe("runTool — determinism", () => {
  it("same inputs produce identical outputs", () => {
    const a = runTool(GOOD);
    const b = runTool(GOOD);
    assert.deepStrictEqual(a, b);
  });
});

describe("runTool — validation errors", () => {
  it("missing courseHours fails", () => {
    const { courseHours: _omit, ...rest } = GOOD;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(/courseHours/i.test(r.error!));
  });
  it("courseHours = 0 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, courseHours: 0 }).ok, false);
  });
  it("negative courseHours fails", () => {
    assert.strictEqual(runTool({ ...GOOD, courseHours: -3 }).ok, false);
  });
  it("non-numeric courseHours fails", () => {
    assert.strictEqual(runTool({ ...GOOD, courseHours: "abc" }).ok, false);
  });
  it("invalid nicheValue fails", () => {
    const r = runTool({ ...GOOD, nicheValue: "premium" });
    assert.strictEqual(r.ok, false);
    assert.ok(/nicheValue/i.test(r.error!));
  });
  it("invalid studentOutcome fails", () => {
    const r = runTool({ ...GOOD, studentOutcome: "hobby" });
    assert.strictEqual(r.ok, false);
    assert.ok(/studentOutcome/i.test(r.error!));
  });
  it("negative platformFeeRate fails", () => {
    assert.strictEqual(runTool({ ...GOOD, platformFeeRate: -5 }).ok, false);
  });
  it("platformFeeRate = 100 fails (division by zero)", () => {
    const r = runTool({ ...GOOD, platformFeeRate: 100 });
    assert.strictEqual(r.ok, false);
    assert.ok(/platformFeeRate/i.test(r.error!));
  });
  it("platformFeeRate > 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, platformFeeRate: 150 }).ok, false);
  });
});

describe("runTool — heuristic properties (edge cases)", () => {
  it("outputs are always rounded to the nearest $10", () => {
    const r = runTool({ courseHours: 3.7, nicheValue: "low", studentOutcome: "skill", platformFeeRate: 7 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual((r.values!.priceLow as number) % 10, 0);
    assert.strictEqual((r.values!.priceHigh as number) % 10, 0);
  });

  it("priceLow is never above priceHigh", () => {
    for (const niche of ["low", "medium", "high"] as const) {
      for (const outcome of ["skill", "career", "business"] as const) {
        const r = runTool({ courseHours: 5, nicheValue: niche, studentOutcome: outcome, platformFeeRate: 0 });
        const v = r.values as Record<string, number>;
        assert.ok(v.priceLow <= v.priceHigh, `${niche}/${outcome}`);
      }
    }
  });

  it("high-value business band prices above low-value skill band", () => {
    const hi = runTool({ courseHours: 8, nicheValue: "high", studentOutcome: "business", platformFeeRate: 0 });
    const lo = runTool({ courseHours: 8, nicheValue: "low", studentOutcome: "skill", platformFeeRate: 0 });
    const hv = hi.values as Record<string, number>;
    const lv = lo.values as Record<string, number>;
    assert.ok(hv.priceLow > lv.priceLow);
    assert.ok(hv.priceHigh > lv.priceHigh);
  });

  it("hours scale sub-linearly (doubling hours less than doubles price)", () => {
    // 8h medium/career/0% → 230/590; 16h → 420/1060 (hand-computed)
    const eight = runTool({ ...GOOD, platformFeeRate: 0 });
    const sixteen = runTool({ courseHours: 16, nicheValue: "medium", studentOutcome: "career", platformFeeRate: 0 });
    assert.strictEqual(sixteen.values!.priceLow, 420);
    assert.strictEqual(sixteen.values!.priceHigh, 1060);
    assert.ok((sixteen.values!.priceLow as number) < 2 * (eight.values!.priceLow as number));
  });

  it("estimate label warns the range is a heuristic, not researched pricing", () => {
    assert.ok(/heuristic/i.test(ESTIMATE_LABEL));
    assert.ok(/not researched/i.test(ESTIMATE_LABEL));
  });
});

describe("helpers — exported building blocks", () => {
  it("hoursFactor uses the documented 0.85 exponent", () => {
    assert.strictEqual(HOURS_EXPONENT, 0.85);
    assert.ok(Math.abs(hoursFactor(8) - 5.85634) < 0.001);
    assert.strictEqual(hoursFactor(1), 1);
  });

  it("roundToNearestTen rounds half-up", () => {
    assert.strictEqual(roundToNearestTen(246.58), 250);
    assert.strictEqual(roundToNearestTen(234.25), 230);
  });

  it("band table has all 3x3 heuristic bands, low < high", () => {
    for (const niche of ["low", "medium", "high"] as const) {
      for (const outcome of ["skill", "career", "business"] as const) {
        const [lo, hi] = HOURLY_BANDS[niche][outcome];
        assert.ok(lo > 0 && hi > lo, `${niche}/${outcome}`);
      }
    }
  });
});

describe("runTool — output ids", () => {
  it("returns exactly the output ids meta.ts declares", () => {
    const r = runTool(GOOD);
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      ["bandDetail", "estimateLabel", "priceHigh", "priceLow"],
    );
  });
});
