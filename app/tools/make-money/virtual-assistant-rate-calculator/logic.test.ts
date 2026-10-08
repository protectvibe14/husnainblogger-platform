/**
 * Tests for the Virtual Assistant Rate Calculator pure logic (tool-077).
 *
 * Run: node --test app/tools/make-money/virtual-assistant-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, ESTIMATE_RATE_TABLE } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("virtual-assistant-rate-calculator", () => {
  it("entry/basic: hand-computed hourly band and weekly cost", () => {
    // band 15–25/hr, 20h/week -> weekly 300–500
    const r = runTool({ experienceLevel: "entry", tasksComplexity: "basic", hoursPerWeek: 20 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.hourlyLow, 15);
    assert.equal(r.values!.hourlyHigh, 25);
    assert.equal(r.values!.weeklyLow, 300);
    assert.equal(r.values!.weeklyHigh, 500);
  });

  it("expert/specialized: top of the $15–$50 span", () => {
    // band 40–50/hr, 10h/week -> weekly 400–500
    const r = runTool({ experienceLevel: "expert", tasksComplexity: "specialized", hoursPerWeek: 10 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.hourlyLow, 40);
    assert.equal(r.values!.hourlyHigh, 50);
    assert.equal(r.values!.weeklyLow, 400);
    assert.equal(r.values!.weeklyHigh, 500);
  });

  it("intermediate/specialized: 30–40/hr", () => {
    const r = runTool({ experienceLevel: "intermediate", tasksComplexity: "specialized", hoursPerWeek: 15 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.hourlyLow, 30);
    assert.equal(r.values!.hourlyHigh, 40);
    assert.equal(r.values!.weeklyLow, 450);
    assert.equal(r.values!.weeklyHigh, 600);
  });

  it("every level x complexity combo matches the estimate table", () => {
    const levels = ["entry", "intermediate", "expert"] as const;
    const complexities = ["basic", "specialized"] as const;
    for (const level of levels) {
      for (const complexity of complexities) {
        const band = ESTIMATE_RATE_TABLE[level][complexity];
        const r = runTool({ experienceLevel: level, tasksComplexity: complexity, hoursPerWeek: 1 });
        assert.equal(r.ok, true, `${level}/${complexity}`);
        assert.equal(r.values!.hourlyLow, band.low);
        assert.equal(r.values!.hourlyHigh, band.high);
        assert.equal(r.values!.weeklyLow, band.low);
        assert.equal(r.values!.weeklyHigh, band.high);
      }
    }
  });

  it("whole table stays inside the $15–$50/hr edge-case span", () => {
    for (const level of Object.keys(ESTIMATE_RATE_TABLE) as (keyof typeof ESTIMATE_RATE_TABLE)[]) {
      for (const complexity of ["basic", "specialized"] as const) {
        const band = ESTIMATE_RATE_TABLE[level][complexity];
        assert.ok(band.low >= 15 && band.high <= 50, `${level}/${complexity}`);
        assert.ok(band.low < band.high, `${level}/${complexity}`);
      }
    }
  });

  it("user overrides replace the band and relabel the basis", () => {
    const r = runTool({
      experienceLevel: "entry",
      tasksComplexity: "basic",
      hoursPerWeek: 30,
      hourlyLowOverride: 12,
      hourlyHighOverride: 18,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.hourlyLow, 12);
    assert.equal(r.values!.hourlyHigh, 18);
    assert.equal(r.values!.weeklyLow, 360);
    assert.equal(r.values!.weeklyHigh, 540);
    assert.match(r.values!.basis as string, /user-set/i);
  });

  it("single override (only high) is a validation error", () => {
    const r = runTool({
      experienceLevel: "entry",
      tasksComplexity: "basic",
      hoursPerWeek: 10,
      hourlyHighOverride: 30,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /both/i);
  });

  it("override high < low is a validation error", () => {
    const r = runTool({
      experienceLevel: "entry",
      tasksComplexity: "basic",
      hoursPerWeek: 10,
      hourlyLowOverride: 30,
      hourlyHighOverride: 20,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than or equal/);
  });

  it("non-positive override is a validation error", () => {
    const r = runTool({
      experienceLevel: "entry",
      tasksComplexity: "basic",
      hoursPerWeek: 10,
      hourlyLowOverride: -5,
      hourlyHighOverride: 20,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("invalid experience level is a validation error", () => {
    const r = runTool({ experienceLevel: "senior", tasksComplexity: "basic", hoursPerWeek: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /experience level/i);
  });

  it("missing experience level is a validation error", () => {
    const r = runTool({ tasksComplexity: "basic", hoursPerWeek: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /experience level/i);
  });

  it("invalid task complexity is a validation error", () => {
    const r = runTool({ experienceLevel: "entry", tasksComplexity: "advanced", hoursPerWeek: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /task complexity/i);
  });

  it("hoursPerWeek 0 / negative / non-numeric are validation errors", () => {
    for (const v of [0, -4, "abc", NaN, undefined]) {
      const r = runTool({ experienceLevel: "entry", tasksComplexity: "basic", hoursPerWeek: v });
      assert.equal(r.ok, false, `hoursPerWeek=${String(v)}`);
      assert.match(r.error!, /Hours per week/);
    }
  });

  it("string numbers are accepted (form inputs arrive as strings)", () => {
    const r = runTool({ experienceLevel: "intermediate", tasksComplexity: "basic", hoursPerWeek: "25" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.weeklyLow, 625);
    assert.equal(r.values!.weeklyHigh, 875);
  });

  it("fractional hours round half-up to 2 decimals", () => {
    // 7.5h at 15–25/hr -> 112.50 / 187.50 exactly
    const r = runTool({ experienceLevel: "entry", tasksComplexity: "basic", hoursPerWeek: 7.5 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.weeklyLow, 112.5);
    assert.equal(r.values!.weeklyHigh, 187.5);
    // 3.333h -> low = 49.995 -> 50.00 ; high = 83.325 -> 83.33
    const r2 = runTool({ experienceLevel: "entry", tasksComplexity: "basic", hoursPerWeek: 3.333 });
    assert.equal(r2.values!.weeklyLow, 50);
    assert.equal(r2.values!.weeklyHigh, 83.33);
  });

  it("default basis labels the bands as estimates, not verified benchmarks", () => {
    const r = runTool({ experienceLevel: "expert", tasksComplexity: "basic", hoursPerWeek: 40 });
    assert.equal(r.ok, true);
    assert.match(r.values!.basis as string, /estimate/i);
    assert.match(r.values!.basis as string, /not a verified/i);
  });

  it("determinism: identical inputs give identical outputs", () => {
    const v = { experienceLevel: "intermediate", tasksComplexity: "specialized", hoursPerWeek: 22.5 };
    assert.deepEqual(runTool(v), runTool(v));
    const o = { ...v, hourlyLowOverride: 28, hourlyHighOverride: 38 };
    assert.deepEqual(runTool(o), runTool(o));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ experienceLevel: "entry", tasksComplexity: "basic", hoursPerWeek: 10 });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });
});
