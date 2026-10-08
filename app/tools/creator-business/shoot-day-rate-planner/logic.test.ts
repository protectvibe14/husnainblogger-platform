import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, OUTPUT_IDS, roundToCents, formatUSD } from "./logic.ts";
import { outputs } from "./meta.ts";

function okRun(values: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const BASE = {
  annualIncomeTarget: 120000,
  shootDaysPerYear: 100,
  annualExpenses: 20000,
  assistantCostsPerShoot: 150,
  gearRentalPerShoot: 100,
};

describe("shoot-day-rate-planner", () => {
  it("happy path: computes the day rate with per-shoot costs on top", () => {
    const v = okRun({ ...BASE });
    // base = (120000 + 20000) / 100 = 1400; per-shoot = 250; total = 1650
    assert.equal(v.recommendedShootDayRate, 1650);
  });

  it("defaults optional costs to 0", () => {
    const v = okRun({ annualIncomeTarget: 60000, shootDaysPerYear: 120 });
    assert.equal(v.recommendedShootDayRate, 500);
  });

  it("perShootCostBreakdown is a table with 4 rows and a total row", () => {
    const v = okRun({ ...BASE });
    const table = v.perShootCostBreakdown as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Cost item", "Amount (USD)"]);
    assert.equal(table.rows.length, 4);
    assert.equal(table.rows[3][0], "Recommended shoot day rate (total)");
    assert.equal(table.rows[3][1], "$1650.00");
  });

  it("annualCapacityCheck text references the key numbers", () => {
    const v = okRun({ ...BASE });
    const text = v.annualCapacityCheck as string;
    assert.match(text, /\$1650\.00 per day/);
    assert.match(text, /100 shoot days/);
    assert.match(text, /\$165000\.00/); // 1650 * 100
    assert.match(text, /ESTIMATE/);
  });

  it("missing annualIncomeTarget fails", () => {
    const r = runTool({ shootDaysPerYear: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Annual income target is required/);
  });

  it("missing shootDaysPerYear fails", () => {
    const r = runTool({ annualIncomeTarget: 100000 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Shoot days per year is required/);
  });

  it("zero annualIncomeTarget fails", () => {
    const r = runTool({ annualIncomeTarget: 0, shootDaysPerYear: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /greater than 0/);
  });

  it("zero shootDaysPerYear fails", () => {
    const r = runTool({ annualIncomeTarget: 100000, shootDaysPerYear: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /greater than 0/);
  });

  it("negative annualExpenses fails", () => {
    const r = runTool({ ...BASE, annualExpenses: -50 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Annual expenses must be 0 or more/);
  });

  it("negative assistantCostsPerShoot fails", () => {
    const r = runTool({ ...BASE, assistantCostsPerShoot: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Assistant costs per shoot must be 0 or more/);
  });

  it("negative gearRentalPerShoot fails", () => {
    const r = runTool({ ...BASE, gearRentalPerShoot: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Gear rental per shoot must be 0 or more/);
  });

  it("NaN input fails", () => {
    const r = runTool({ annualIncomeTarget: NaN, shootDaysPerYear: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /NaN/);
  });

  it("Infinity input fails", () => {
    const r = runTool({ annualIncomeTarget: Infinity, shootDaysPerYear: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /finite/);
  });

  it("empty-string required input fails", () => {
    const r = runTool({ annualIncomeTarget: "", shootDaysPerYear: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Annual income target is required/);
  });

  it("non-number input fails", () => {
    const r = runTool({ annualIncomeTarget: "lots", shootDaysPerYear: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be a number/);
  });

  it("non-object input fails", () => {
    const r = runTool("nope" as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be an object/);
  });

  it("rounding: fractional cents round half-up", () => {
    // (100000 + 0) / 3 = 33333.333... -> 33333.33
    const v = okRun({ annualIncomeTarget: 100000, shootDaysPerYear: 3 });
    assert.equal(v.recommendedShootDayRate, 33333.33);
    assert.equal(roundToCents(0.005), 0.01);
  });

  it("edge: single shoot day per year", () => {
    const v = okRun({ annualIncomeTarget: 50000, shootDaysPerYear: 1 });
    assert.equal(v.recommendedShootDayRate, 50000);
  });

  it("deterministic: same inputs produce identical outputs", () => {
    const a = okRun({ ...BASE });
    const b = okRun({ ...BASE });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okRun({ ...BASE });
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(v).sort();
    assert.deepEqual(valueIds, metaIds);
    assert.deepEqual([...OUTPUT_IDS].sort(), metaIds);
  });

  it("formatUSD is locale-independent", () => {
    assert.equal(formatUSD(1650), "$1650.00");
    assert.equal(formatUSD(0), "$0.00");
  });
});
