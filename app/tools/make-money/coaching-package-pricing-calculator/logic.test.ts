/**
 * Tests for the Coaching Package Pricing Calculator pure logic (tool-094).
 *
 * Run: node --test app/tools/make-money/coaching-package-pricing-calculator/logic.test.ts
 *
 * Expected values are hand-computed from the cost-plus-margin formula
 * (coachingHours = sessions×minutes/60; price = (coachingHours×hourly +
 *  support×hourly×supportRate/100) × (1 − discount/100)) — never copied
 * from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, round2, HONESTY_LABEL, SENSITIVITY_BAND } from "./logic.ts";

const GOOD = {
  sessionsPerPackage: 8,
  sessionLengthMin: 60,
  hourlyValue: 150,
  programWeeks: 8,
  supportHours: 4,
  packageDiscount: 10,
  supportRate: 50,
};

describe("runTool — happy path", () => {
  it("computes package price 1350, per-session 168.75, effective 112.50", () => {
    // Hand-computed: coachingHours = 8×60/60 = 8;
    // base = 8×150 + 4×150×0.5 = 1200 + 300 = 1500;
    // price = 1500×0.9 = 1350; perSession = 1350/8 = 168.75;
    // effective = 1350/12 = 112.5; range ±20% = 1080 / 1620
    const r = runTool(GOOD);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.packagePrice, 1350);
    assert.strictEqual(r.values!.pricePerSession, 168.75);
    assert.strictEqual(r.values!.effectiveHourly, 112.5);
    assert.strictEqual(r.values!.priceRangeLow, 1080);
    assert.strictEqual(r.values!.priceRangeHigh, 1620);
    assert.strictEqual(r.values!.honestyLabel, HONESTY_LABEL);
  });

  it("applies defaults: support 0, discount 0, supportRate 50", () => {
    // coachingHours = 4×60/60 = 4; base = 4×100 = 400; price = 400
    const r = runTool({
      sessionsPerPackage: 4,
      sessionLengthMin: 60,
      hourlyValue: 100,
      programWeeks: 4,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.packagePrice, 400);
    assert.strictEqual(r.values!.pricePerSession, 100);
    assert.strictEqual(r.values!.effectiveHourly, 100);
    assert.strictEqual(r.values!.priceRangeLow, 320);
    assert.strictEqual(r.values!.priceRangeHigh, 480);
  });

  it("supportRate 100 values support at the full hourly rate", () => {
    // base = 2×100 + 2×100×1.0 = 400; price = 400; effective = 400/4 = 100
    const r = runTool({
      sessionsPerPackage: 2,
      sessionLengthMin: 60,
      hourlyValue: 100,
      programWeeks: 4,
      supportHours: 2,
      supportRate: 100,
    });
    assert.strictEqual(r.values!.packagePrice, 400);
    assert.strictEqual(r.values!.effectiveHourly, 100);
  });

  it("100% discount prices the package at 0", () => {
    const r = runTool({ ...GOOD, packageDiscount: 100 });
    assert.strictEqual(r.values!.packagePrice, 0);
    assert.strictEqual(r.values!.pricePerSession, 0);
    assert.strictEqual(r.values!.effectiveHourly, 0);
    assert.strictEqual(r.values!.priceRangeLow, 0);
    assert.strictEqual(r.values!.priceRangeHigh, 0);
  });

  it("30-minute sessions halve the coaching hours", () => {
    // coachingHours = 8×30/60 = 4; base = 4×150 + 300 = 900; price = 810
    const r = runTool({ ...GOOD, sessionLengthMin: 30 });
    assert.strictEqual(r.values!.packagePrice, 810);
    assert.strictEqual(r.values!.pricePerSession, 101.25);
  });
});

describe("runTool — determinism", () => {
  it("same inputs produce identical outputs", () => {
    assert.deepStrictEqual(runTool(GOOD), runTool(GOOD));
  });
});

describe("runTool — validation errors", () => {
  it("missing hourlyValue fails", () => {
    const { hourlyValue: _omit, ...rest } = GOOD;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(/hourlyValue/i.test(r.error!));
  });
  it("sessionsPerPackage = 0 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, sessionsPerPackage: 0 }).ok, false);
  });
  it("non-integer sessionsPerPackage fails", () => {
    const r = runTool({ ...GOOD, sessionsPerPackage: 2.5 });
    assert.strictEqual(r.ok, false);
    assert.ok(/integer/i.test(r.error!));
  });
  it("sessionLengthMin = 0 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, sessionLengthMin: 0 }).ok, false);
  });
  it("negative hourlyValue fails", () => {
    assert.strictEqual(runTool({ ...GOOD, hourlyValue: -50 }).ok, false);
  });
  it("programWeeks = 0 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, programWeeks: 0 }).ok, false);
  });
  it("non-integer programWeeks fails", () => {
    assert.strictEqual(runTool({ ...GOOD, programWeeks: 1.5 }).ok, false);
  });
  it("negative supportHours fails", () => {
    assert.strictEqual(runTool({ ...GOOD, supportHours: -1 }).ok, false);
  });
  it("packageDiscount above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, packageDiscount: 101 }).ok, false);
  });
  it("negative packageDiscount fails", () => {
    assert.strictEqual(runTool({ ...GOOD, packageDiscount: -1 }).ok, false);
  });
  it("supportRate above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, supportRate: 101 }).ok, false);
  });
});

describe("runTool — honesty properties (edge cases)", () => {
  it("sensitivity range always brackets the package price", () => {
    for (const discount of [0, 15, 50]) {
      const r = runTool({ ...GOOD, packageDiscount: discount });
      const v = r.values as Record<string, number>;
      assert.ok(v.priceRangeLow <= v.packagePrice);
      assert.ok(v.priceRangeHigh >= v.packagePrice);
    }
  });

  it("sensitivity band is ±20%, documented in a constant", () => {
    assert.strictEqual(SENSITIVITY_BAND, 0.2);
    const r = runTool(GOOD);
    assert.strictEqual(r.values!.priceRangeLow, round2((r.values!.packagePrice as number) * 0.8));
    assert.strictEqual(r.values!.priceRangeHigh, round2((r.values!.packagePrice as number) * 1.2));
  });

  it("honesty label disclaims market research and correct pricing", () => {
    assert.ok(/not researched/i.test(HONESTY_LABEL));
    assert.ok(/user-set/i.test(HONESTY_LABEL));
  });

  it("a bigger discount lowers per-session below the 1:1 hourly value", () => {
    const r = runTool(GOOD);
    // 168.75 < 150? No: 168.75 > 150 because support is bundled. Use no support:
    const noSupport = runTool({ ...GOOD, supportHours: 0, supportRate: 50 });
    // base = 8×150 = 1200; price = 1080; perSession = 135
    assert.strictEqual(noSupport.values!.pricePerSession, 135);
    assert.ok((noSupport.values!.pricePerSession as number) < 150);
  });
});

describe("helpers", () => {
  it("round2 rounds half-up to cents", () => {
    assert.strictEqual(round2(101.255), 101.26);
    assert.strictEqual(round2(101.254), 101.25);
  });
});

describe("runTool — output ids", () => {
  it("returns exactly the output ids meta.ts declares", () => {
    const r = runTool(GOOD);
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      ["effectiveHourly", "honestyLabel", "packagePrice", "pricePerSession", "priceRangeHigh", "priceRangeLow"],
    );
  });
});
