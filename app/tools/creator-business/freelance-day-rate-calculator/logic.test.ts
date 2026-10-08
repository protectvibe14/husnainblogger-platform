/**
 * Tests for the Freelance Day Rate Calculator pure logic (tool-452).
 *
 * Run: node --test app/tools/creator-business/freelance-day-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateDayRate,
  roundToCents,
  DEFAULT_HOURS_PER_DAY,
  runTool,
} from "./logic.ts";

describe("calculateDayRate — normal cases", () => {
  it("computes 687.50 / 343.75 / 85.94 for 100k/200d/10k-exp/25%-tax", () => {
    // Hand-computed: revenue = 110000 * 1.25 = 137500;
    // day = 137500/200 = 687.50; half = 343.75; hourly = 687.50/8 = 85.9375 -> 85.94.
    const r = calculateDayRate({
      annualTargetIncome: 100000,
      billableDaysPerYear: 200,
      annualExpenses: 10000,
      taxBufferPct: 25,
    });
    assert.strictEqual(r.annualRevenueTarget, 137500);
    assert.strictEqual(r.dayRate, 687.5);
    assert.strictEqual(r.halfDayRate, 343.75);
    assert.strictEqual(r.hourlyEquivalent, 85.94);
    assert.strictEqual(r.hoursPerDay, 8);
    assert.ok(r.assumptions.length >= 4, "assumptions must be surfaced");
  });

  it("works with defaults (no expenses, no tax buffer, 8h day)", () => {
    // revenue = 60000; day = 60000/240 = 250; half = 125; hourly = 250/8 = 31.25.
    const r = calculateDayRate({
      annualTargetIncome: 60000,
      billableDaysPerYear: 240,
    });
    assert.strictEqual(r.annualRevenueTarget, 60000);
    assert.strictEqual(r.dayRate, 250);
    assert.strictEqual(r.halfDayRate, 125);
    assert.strictEqual(r.hourlyEquivalent, 31.25);
  });

  it("honors a custom hoursPerDay", () => {
    // day = 250; hourly = 250/6 = 41.666.. -> 41.67.
    const r = calculateDayRate({
      annualTargetIncome: 60000,
      billableDaysPerYear: 240,
      hoursPerDay: 6,
    });
    assert.strictEqual(r.hoursPerDay, 6);
    assert.strictEqual(r.hourlyEquivalent, 41.67);
  });

  it("accepts fractional billable days", () => {
    // revenue = 80000; day = 80000/187.5 = 426.666.. -> 426.67.
    const r = calculateDayRate({
      annualTargetIncome: 80000,
      billableDaysPerYear: 187.5,
    });
    assert.strictEqual(r.dayRate, 426.67);
  });
});

describe("calculateDayRate — rounding", () => {
  it("rounds half-up across all outputs", () => {
    // revenue = 100000; day = 100000/3 = 33333.333.. -> 33333.33;
    // half = 33333.33/2 = 16666.665 -> 16666.67;
    // hourly = 33333.33/8 = 4166.666.. -> 4166.67.
    const r = calculateDayRate({
      annualTargetIncome: 100000,
      billableDaysPerYear: 3,
    });
    assert.strictEqual(r.dayRate, 33333.33);
    assert.strictEqual(r.halfDayRate, 16666.67);
    assert.strictEqual(r.hourlyEquivalent, 4166.67);
  });

  it("handles a 100% tax buffer", () => {
    // revenue = 50000 * 2 = 100000; day = 100000/200 = 500.
    const r = calculateDayRate({
      annualTargetIncome: 50000,
      billableDaysPerYear: 200,
      taxBufferPct: 100,
    });
    assert.strictEqual(r.annualRevenueTarget, 100000);
    assert.strictEqual(r.dayRate, 500);
  });
});

describe("calculateDayRate — invalid input", () => {
  it("rejects non-positive income and billable days", () => {
    assert.throws(
      () => calculateDayRate({ annualTargetIncome: 0, billableDaysPerYear: 200 }),
      RangeError,
    );
    assert.throws(
      () => calculateDayRate({ annualTargetIncome: -5000, billableDaysPerYear: 200 }),
      RangeError,
    );
    assert.throws(
      () => calculateDayRate({ annualTargetIncome: 50000, billableDaysPerYear: 0 }),
      RangeError,
    );
    assert.throws(
      () => calculateDayRate({ annualTargetIncome: 50000, billableDaysPerYear: -10 }),
      RangeError,
    );
  });

  it("rejects negative expenses and out-of-range tax buffer", () => {
    assert.throws(
      () =>
        calculateDayRate({
          annualTargetIncome: 50000,
          billableDaysPerYear: 200,
          annualExpenses: -100,
        }),
      RangeError,
    );
    assert.throws(
      () =>
        calculateDayRate({
          annualTargetIncome: 50000,
          billableDaysPerYear: 200,
          taxBufferPct: -1,
        }),
      RangeError,
    );
    assert.throws(
      () =>
        calculateDayRate({
          annualTargetIncome: 50000,
          billableDaysPerYear: 200,
          taxBufferPct: 101,
        }),
      RangeError,
    );
  });

  it("rejects non-positive hoursPerDay", () => {
    assert.throws(
      () =>
        calculateDayRate({
          annualTargetIncome: 50000,
          billableDaysPerYear: 200,
          hoursPerDay: 0,
        }),
      RangeError,
    );
  });

  it("rejects non-numeric input (NaN, Infinity, strings, unicode)", () => {
    assert.throws(
      () => calculateDayRate({ annualTargetIncome: NaN, billableDaysPerYear: 200 }),
      TypeError,
    );
    assert.throws(
      () =>
        calculateDayRate({ annualTargetIncome: Infinity, billableDaysPerYear: 200 }),
      TypeError,
    );
    assert.throws(
      () =>
        calculateDayRate({
          annualTargetIncome: "60000" as unknown as number,
          billableDaysPerYear: 200,
        }),
      TypeError,
    );
    assert.throws(
      () =>
        calculateDayRate({
          annualTargetIncome: "６００００" as unknown as number,
          billableDaysPerYear: 200,
        }),
      TypeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => calculateDayRate(null as never), TypeError);
  });
});

describe("calculateDayRate — assumptions honesty", () => {
  it("states the output is user-input based, not market data", () => {
    const r = calculateDayRate({ annualTargetIncome: 50000, billableDaysPerYear: 200 });
    const joined = r.assumptions.join(" ");
    assert.ok(joined.includes("YOUR inputs"), "input basis stated");
    assert.ok(joined.includes("not market data"), "market-data disclaimer stated");
    assert.ok(joined.includes("ESTIMATE"), "estimate label present");
  });

  it("exposes the default 8-hour day constant", () => {
    assert.strictEqual(DEFAULT_HOURS_PER_DAY, 8);
  });
});

describe("roundToCents", () => {
  it("rounds half-up", () => {
    assert.strictEqual(roundToCents(85.9375), 85.94);
    assert.strictEqual(roundToCents(16666.665), 16666.67);
    assert.strictEqual(roundToCents(0.005), 0.01);
  });
});

describe("runTool — adapter", () => {
  it("maps flat inputs: 60000/12000-exp/260-20 days/8h -> day 300, half 150, hourly 37.50", () => {
    // billable = 260-20 = 240; revenue = 72000; day = 300; half = 150; hourly = 300/8 = 37.5.
    const out = runTool({
      annualIncomeTarget: 60000,
      annualBusinessExpenses: 12000,
      workingDaysPerYear: 260,
      nonBillableDays: 20,
      hoursPerDay: 8,
    });
    assert.strictEqual(out.ok, true);
    assert.deepStrictEqual(Object.keys(out.values!).sort(), [
      "assumptions",
      "billableDays",
      "dayRate",
      "halfDayRate",
      "hourlyRate",
    ]);
    assert.strictEqual(out.values!.dayRate, 300);
    assert.strictEqual(out.values!.halfDayRate, 150);
    assert.strictEqual(out.values!.hourlyRate, 37.5);
    assert.strictEqual(out.values!.billableDays, 240);
  });

  it("applies defaults: workingDays 260, nonBillable 0, hours 8", () => {
    // billable = 260; day = 60000/260 = 230.7692 -> 230.77; half = 115.385 -> 115.39.
    const out = runTool({ annualIncomeTarget: 60000, annualBusinessExpenses: 0 });
    assert.strictEqual(out.ok, true);
    assert.strictEqual(out.values!.billableDays, 260);
    assert.strictEqual(out.values!.dayRate, 230.77);
    assert.strictEqual(out.values!.halfDayRate, 115.39);
    assert.strictEqual(out.values!.hourlyRate, 28.85);
    assert.ok(
      (out.values!.assumptions as string[]).some((a) => a.includes("income target only")),
      "zero expenses noted",
    );
  });

  it("rejects nonBillableDays >= workingDaysPerYear with a human error", () => {
    const out = runTool({
      annualIncomeTarget: 50000,
      annualBusinessExpenses: 0,
      workingDaysPerYear: 200,
      nonBillableDays: 200,
    });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("nonBillableDays"), "names the conflicting field");
    assert.ok(!/^\s*at\s/m.test(out.error!), "no stack leakage");
  });

  it("rejects missing annualIncomeTarget with a human error", () => {
    const out = runTool({ annualBusinessExpenses: 5000 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("annualIncomeTarget"), "names the missing field");
  });

  it("rejects NaN income", () => {
    const out = runTool({ annualIncomeTarget: Number.NaN, annualBusinessExpenses: 0 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("annualIncomeTarget"), "names the bad field");
  });
});
