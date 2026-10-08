import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, round2, round1, formatMoney, DEFAULT_WORK_WEEKS, MAX_WEEKS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { annualIncomeGoal: 60000, annualExpenses: 12000, avgClientValue: 1500, workWeeksPerYear: 48 };

describe("happy path", () => {
  it("computes all four outputs from the spec example", () => {
    const res = runTool(BASE);
    assert.equal(res.ok, true);
    assert.deepEqual(res.values, {
      requiredMonthlyRevenue: 6000,
      clientsNeededPerMonth: 4,
      weeklyTarget: 1500,
      gapVsCurrent: "Enter your current annual income above to see the gap vs your goal.",
    });
  });

  it("computes the gap when current income is given", () => {
    const res = runTool({ ...BASE, currentIncomeAnnual: 48000 });
    assert.equal(res.ok, true);
    assert.equal(
      res.values?.gapVsCurrent,
      "Gap: $24,000.00 per year ($2,000.00 per month) between your current income and your gross target — based on your own targets, not market data.",
    );
  });

  it("congratulates when current income already meets the target", () => {
    const res = runTool({ ...BASE, currentIncomeAnnual: 90000 });
    assert.equal(res.ok, true);
    assert.ok(res.values?.gapVsCurrent.startsWith("You already hit it:"));
    assert.ok(res.values?.gapVsCurrent.includes("$90,000.00"));
  });

  it("defaults expenses to 0 and work weeks to 48", () => {
    const res = runTool({ annualIncomeGoal: 48000, avgClientValue: 2000 });
    assert.equal(res.ok, true);
    assert.equal(res.values?.requiredMonthlyRevenue, 4000);
    assert.equal(res.values?.weeklyTarget, 1000);
  });

  it("coerces numeric strings and strips $/commas", () => {
    const res = runTool({ annualIncomeGoal: "$60,000", annualExpenses: "12,000", avgClientValue: "1500" });
    assert.equal(res.ok, true);
    assert.equal(res.values?.requiredMonthlyRevenue, 6000);
  });

  it("rounds clients per month to 1 decimal", () => {
    const res = runTool({ annualIncomeGoal: 60000, annualExpenses: 0, avgClientValue: 7000 });
    assert.equal(res.ok, true);
    assert.equal(res.values?.clientsNeededPerMonth, 0.7);
  });
});

describe("validation errors", () => {
  it("errors when annual income goal is missing", () => {
    assert.deepEqual(runTool({ avgClientValue: 1000 }), {
      ok: false,
      error: "Annual income goal must be a number of 0 or more.",
    });
  });

  it("errors on NaN / Infinity / empty goal", () => {
    for (const bad of [NaN, Infinity, "", "abc", null]) {
      const res = runTool({ annualIncomeGoal: bad, avgClientValue: 1000 });
      assert.equal(res.ok, false, `should reject ${String(bad)}`);
      assert.equal(res.error, "Annual income goal must be a number of 0 or more.");
    }
  });

  it("errors on a negative goal", () => {
    assert.equal(runTool({ annualIncomeGoal: -5, avgClientValue: 1000 }).error, "Annual income goal must be a number of 0 or more.");
  });

  it("errors when average client value is missing or zero", () => {
    assert.equal(runTool({ annualIncomeGoal: 60000 }).error, "Average client value must be a number greater than 0.");
    assert.equal(runTool({ annualIncomeGoal: 60000, avgClientValue: 0 }).error, "Average client value must be a number greater than 0.");
  });

  it("errors on negative average client value", () => {
    assert.equal(
      runTool({ annualIncomeGoal: 60000, avgClientValue: -100 }).error,
      "Average client value must be a number greater than 0.",
    );
  });

  it("errors on negative annual expenses", () => {
    assert.equal(
      runTool({ annualIncomeGoal: 60000, annualExpenses: -1, avgClientValue: 1000 }).error,
      "Annual expenses must be a number of 0 or more.",
    );
  });

  it("errors on out-of-range or fractional work weeks", () => {
    for (const bad of [0, 53, 47.5, "abc"]) {
      const res = runTool({ ...BASE, workWeeksPerYear: bad });
      assert.equal(res.ok, false, `should reject ${String(bad)}`);
      assert.equal(res.error, `Work weeks per year must be a whole number between 1 and ${MAX_WEEKS}.`);
    }
  });

  it("errors on negative current income", () => {
    assert.equal(
      runTool({ ...BASE, currentIncomeAnnual: -10 }).error,
      "Current annual income must be a number of 0 or more.",
    );
  });

  it("errors when no inputs object is given", () => {
    assert.deepEqual(runTool(null as never), { ok: false, error: "No inputs were provided." });
  });
});

describe("edge cases", () => {
  it("handles a zero goal (all zeros plan)", () => {
    const res = runTool({ annualIncomeGoal: 0, annualExpenses: 0, avgClientValue: 500 });
    assert.equal(res.ok, true);
    assert.deepEqual([res.values?.requiredMonthlyRevenue, res.values?.clientsNeededPerMonth, res.values?.weeklyTarget], [0, 0, 0]);
  });

  it("gap of exactly zero counts as already hit", () => {
    const res = runTool({ annualIncomeGoal: 72000, annualExpenses: 0, avgClientValue: 1500, currentIncomeAnnual: 72000 });
    assert.ok(res.values?.gapVsCurrent.startsWith("You already hit it:"));
  });

  it("is deterministic: identical inputs give identical outputs", () => {
    assert.deepEqual(runTool({ ...BASE, currentIncomeAnnual: 40000 }), runTool({ ...BASE, currentIncomeAnnual: 40000 }));
  });

  it("helpers: rounding and money formatting are locale-independent", () => {
    assert.equal(round2(1234.567), 1234.57);
    assert.equal(round1(2.25), 2.3);
    assert.equal(formatMoney(72000), "$72,000.00");
    assert.equal(formatMoney(999.5), "$999.50");
    assert.equal(DEFAULT_WORK_WEEKS, 48);
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(
      outputs.map((o) => o.id).sort(),
      ["clientsNeededPerMonth", "gapVsCurrent", "requiredMonthlyRevenue", "weeklyTarget"].sort(),
    );
  });
});
