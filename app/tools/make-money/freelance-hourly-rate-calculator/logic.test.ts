/**
 * Tests for the Freelance Hourly Rate Calculator pure logic (tool-068).
 *
 * Run: node --test app/tools/make-money/freelance-hourly-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the documented backwards
 * formula (rate = (target + expenses) / hours; buffer = rate / (1 − tax)),
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, MAX_HOURS_PER_YEAR } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("runTool — happy paths", () => {
  it("computes $60/hour for a $60k target over 1,000 billable hours", () => {
    const r = runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 1000 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.requiredHourlyRate, 60);
    assert.strictEqual(r.values!.rateWithTaxBuffer, 60);
  });

  it("adds expenses to the numerator ($65/hour with $5k expenses)", () => {
    // (60000 + 5000) / 1000 = 65.
    const r = runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 1000, businessExpenses: 5000 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.requiredHourlyRate, 65);
  });

  it("pre-funds a 25% tax rate ($65 / 0.75 = $86.67)", () => {
    const r = runTool({
      annualIncomeTarget: 60000,
      billableHoursPerYear: 1000,
      businessExpenses: 5000,
      taxRate: 25,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.requiredHourlyRate, 65);
    assert.strictEqual(r.values!.rateWithTaxBuffer, 86.67);
  });

  it("handles a 0% tax rate explicitly (buffer equals base rate)", () => {
    const r = runTool({ annualIncomeTarget: 48000, billableHoursPerYear: 1200, taxRate: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.requiredHourlyRate, 40);
    assert.strictEqual(r.values!.rateWithTaxBuffer, 40);
  });

  it("rounds to cents (1000 target / 3 hours = 333.33; 10% tax buffer = 370.37)", () => {
    const r = runTool({ annualIncomeTarget: 1000, billableHoursPerYear: 3, taxRate: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.requiredHourlyRate, 333.33);
    // 333.33 / 0.9 = 370.3666… → 370.37.
    assert.strictEqual(r.values!.rateWithTaxBuffer, 370.37);
  });

  it("accepts the full-year boundary of 8760 hours", () => {
    const r = runTool({ annualIncomeTarget: 87600, billableHoursPerYear: MAX_HOURS_PER_YEAR });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.requiredHourlyRate, 10);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing annualIncomeTarget", () => {
    const r = runTool({ billableHoursPerYear: 1000 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Annual income target/i);
  });

  it("rejects zero income target", () => {
    assert.strictEqual(runTool({ annualIncomeTarget: 0, billableHoursPerYear: 1000 }).ok, false);
  });

  it("rejects negative income target", () => {
    assert.strictEqual(runTool({ annualIncomeTarget: -100, billableHoursPerYear: 1000 }).ok, false);
  });

  it("rejects missing billableHoursPerYear", () => {
    const r = runTool({ annualIncomeTarget: 60000 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Billable hours/i);
  });

  it("rejects zero billable hours (division-by-zero guard)", () => {
    assert.strictEqual(runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 0 }).ok, false);
  });

  it("rejects billable hours above 8760", () => {
    const r = runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 8761 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at most 8760/);
  });

  it("rejects a 100% tax rate (infinite-rate guard)", () => {
    const r = runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 1000, taxRate: 100 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /infinite/i);
  });

  it("rejects a tax rate above 100%", () => {
    assert.strictEqual(
      runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 1000, taxRate: 101 }).ok,
      false,
    );
  });

  it("rejects negative business expenses", () => {
    assert.strictEqual(
      runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 1000, businessExpenses: -1 }).ok,
      false,
    );
  });

  it("rejects NaN and non-numeric inputs", () => {
    assert.strictEqual(runTool({ annualIncomeTarget: NaN, billableHoursPerYear: 1000 }).ok, false);
    assert.strictEqual(
      runTool({ annualIncomeTarget: "sixty" as never, billableHoursPerYear: 1000 }).ok,
      false,
    );
  });

  it("rejects infinite inputs", () => {
    assert.strictEqual(
      runTool({ annualIncomeTarget: Infinity, billableHoursPerYear: 1000 }).ok,
      false,
    );
  });

  it("rejects a non-object values argument", () => {
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — contract & determinism", () => {
  it("is deterministic: two runs with the same inputs are identical", () => {
    const args = { annualIncomeTarget: 87345.55, billableHoursPerYear: 1234, businessExpenses: 4321, taxRate: 22.5 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returned output ids exactly match meta.ts outputs", () => {
    const r = runTool({ annualIncomeTarget: 60000, billableHoursPerYear: 1000, taxRate: 25 });
    assert.strictEqual(r.ok, true);
    const expected = outputs.map((o) => o.id).sort();
    assert.deepStrictEqual(Object.keys(r.values!).sort(), expected);
  });
});
