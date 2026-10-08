/**
 * Tests for the Walk-Away Rate Calculator pure logic (tool-460).
 *
 * Run: node --test app/tools/creator-business/walk-away-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the spec formula J-WALK-AWAY,
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateWalkAwayRate, runTool } from "./logic.ts";

describe("calculateWalkAwayRate — normal cases", () => {
  it("$4,000 costs / 80 hrs / 25% buffer with current rate $70", () => {
    // floor = 4000/80 = 50; walk-away = 50 * 1.25 = 62.50; gap = 62.50 - 70 = -7.50.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 4000,
      billableHoursPerMonth: 80,
      bufferPct: 25,
      currentRate: 70,
    });
    assert.strictEqual(r.floorRate, 50);
    assert.strictEqual(r.walkAwayRate, 62.5);
    assert.strictEqual(r.gapVsCurrentRate, -7.5);
    assert.ok(r.notes.some((n) => n.includes("headroom")));
  });

  it("gap is positive when current rate is below walk-away", () => {
    // floor = 2000/100 = 20; walk-away = 20 * 1.5 = 30; gap = 30 - 25 = 5.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 2000,
      billableHoursPerMonth: 100,
      bufferPct: 50,
      currentRate: 25,
    });
    assert.strictEqual(r.floorRate, 20);
    assert.strictEqual(r.walkAwayRate, 30);
    assert.strictEqual(r.gapVsCurrentRate, 5);
    assert.ok(r.notes.some((n) => n.includes("raise your rate by $5.00/hr")));
  });

  it("current rate exactly at walk-away gives a zero gap", () => {
    // floor = 3000/100 = 30; walk-away = 30 * 1.2 = 36; gap = 0.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 3000,
      billableHoursPerMonth: 100,
      bufferPct: 20,
      currentRate: 36,
    });
    assert.strictEqual(r.gapVsCurrentRate, 0);
    assert.ok(r.notes.some((n) => n.includes("exactly matches")));
  });

  it("gap is null when currentRate is not provided", () => {
    // floor = 5000/125 = 40; walk-away = 40 * 1.1 = 44.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 5000,
      billableHoursPerMonth: 125,
      bufferPct: 10,
    });
    assert.strictEqual(r.floorRate, 40);
    assert.strictEqual(r.walkAwayRate, 44);
    assert.strictEqual(r.gapVsCurrentRate, null);
  });

  it("buffer = 0: walk-away equals floor, flagged as survival rate", () => {
    // floor = 2400/120 = 20; walk-away = 20 * 1 = 20.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 2400,
      billableHoursPerMonth: 120,
      bufferPct: 0,
    });
    assert.strictEqual(r.floorRate, 20);
    assert.strictEqual(r.walkAwayRate, 20);
    assert.ok(r.notes.some((n) => n.includes("survival rate")));
  });

  it("costs = 0: floor is $0, flagged as incomplete input", () => {
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 0,
      billableHoursPerMonth: 100,
      bufferPct: 20,
    });
    assert.strictEqual(r.floorRate, 0);
    assert.strictEqual(r.walkAwayRate, 0);
    assert.ok(r.notes.some((n) => n.includes("costs are incomplete")));
  });

  it("rounds fractional rates to cents", () => {
    // floor = 1000/60 = 16.6666... -> 16.67; walk-away = 16.67 * 1.15 = 19.1705 -> 19.17.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 1000,
      billableHoursPerMonth: 60,
      bufferPct: 15,
    });
    assert.strictEqual(r.floorRate, 16.67);
    assert.strictEqual(r.walkAwayRate, 19.17);
  });

  it("100% buffer doubles the floor rate", () => {
    // floor = 6000/150 = 40; walk-away = 40 * 2 = 80.
    const r = calculateWalkAwayRate({
      monthlyBusinessCosts: 6000,
      billableHoursPerMonth: 150,
      bufferPct: 100,
    });
    assert.strictEqual(r.walkAwayRate, 80);
  });
});

describe("calculateWalkAwayRate — validation throws", () => {
  const base = { monthlyBusinessCosts: 3000, billableHoursPerMonth: 100, bufferPct: 20 };

  it("billableHoursPerMonth of 0 or negative throws", () => {
    assert.throws(
      () => calculateWalkAwayRate({ ...base, billableHoursPerMonth: 0 }),
      /billableHoursPerMonth must be greater than 0/,
    );
    assert.throws(
      () => calculateWalkAwayRate({ ...base, billableHoursPerMonth: -10 }),
      RangeError,
    );
  });

  it("bufferPct above 100 throws", () => {
    assert.throws(
      () => calculateWalkAwayRate({ ...base, bufferPct: 101 }),
      /bufferPct must be between 0 and 100/,
    );
  });

  it("negative costs throw", () => {
    assert.throws(
      () => calculateWalkAwayRate({ ...base, monthlyBusinessCosts: -1 }),
      /monthlyBusinessCosts must be >= 0/,
    );
  });

  it("NaN / Infinity / non-number throw TypeError", () => {
    assert.throws(() => calculateWalkAwayRate({ ...base, bufferPct: NaN }), TypeError);
    assert.throws(() => calculateWalkAwayRate({ ...base, monthlyBusinessCosts: Infinity }), TypeError);
    assert.throws(
      () => calculateWalkAwayRate({ ...base, currentRate: "50" as unknown as number }),
      TypeError,
    );
  });

  it("negative currentRate throws", () => {
    assert.throws(
      () => calculateWalkAwayRate({ ...base, currentRate: -5 }),
      /currentRate must be >= 0/,
    );
  });
});

describe("runTool — shape and validation", () => {
  function good() {
    return {
      monthlyBusinessCosts: 4000,
      billableHoursPerMonth: 80,
      bufferPct: 25,
      currentRate: 70,
    };
  }

  it("returns ok:true with the four spec output keys", () => {
    const res = runTool(good());
    assert.strictEqual(res.ok, true);
    assert.deepStrictEqual(Object.keys(res.values!).sort(), [
      "floorRate",
      "gapVsCurrentRate",
      "notes",
      "walkAwayRate",
    ]);
    assert.strictEqual(res.values!.floorRate, 50);
    assert.strictEqual(res.values!.walkAwayRate, 62.5);
    assert.strictEqual(res.values!.gapVsCurrentRate, -7.5);
  });

  it("works without the optional currentRate", () => {
    const res = runTool({
      monthlyBusinessCosts: 4000,
      billableHoursPerMonth: 80,
      bufferPct: 25,
    });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.values!.gapVsCurrentRate, null);
  });

  it("missing required keys return human errors", () => {
    assert.strictEqual(runTool({ ...good(), bufferPct: undefined }).error, "bufferPct is required.");
    assert.strictEqual(runTool({ ...good(), billableHoursPerMonth: "" }).error, "billableHoursPerMonth is required.");
  });

  it("zero hours and out-of-range buffer return human errors", () => {
    assert.strictEqual(
      runTool({ ...good(), billableHoursPerMonth: 0 }).error,
      "billableHoursPerMonth must be greater than 0.",
    );
    assert.strictEqual(
      runTool({ ...good(), bufferPct: 150 }).error,
      "bufferPct must be between 0 and 100.",
    );
  });

  it("negative costs return a human error", () => {
    assert.strictEqual(
      runTool({ ...good(), monthlyBusinessCosts: -10 }).error,
      "monthlyBusinessCosts must be >= 0.",
    );
  });

  it("non-object input returns a human error", () => {
    assert.strictEqual(runTool(null as never).error, "Input must be an object.");
  });
});
