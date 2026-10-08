/**
 * Tests for the Retainer vs Hourly Comparator pure logic (tool-458).
 *
 * Run: node --test app/tools/creator-business/retainer-vs-hourly-comparator/logic.test.ts
 *
 * All expected values are hand-computed from the spec formula J-RETAINER-COMPARE,
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareRetainerVsHourly, runTool } from "./logic.ts";

describe("compareRetainerVsHourly — normal cases", () => {
  it("retainer cheaper when hours sit inside included hours", () => {
    // hourly = 100*20 = 2000; retainer = 1500 + max(0,20-40)*80 = 1500.
    // H1 = 1500/100 = 15 <= 40 -> break-even 15.
    const r = compareRetainerVsHourly({
      hourlyRate: 100,
      estimatedHoursPerMonth: 20,
      retainerFee: 1500,
      retainerIncludedHours: 40,
      overageHourlyRate: 80,
    });
    assert.strictEqual(r.hourlyModelMonthlyCost, 2000);
    assert.strictEqual(r.retainerModelMonthlyCost, 1500);
    assert.strictEqual(r.breakEvenHours, 15);
    assert.strictEqual(r.cheaperOption, "retainer");
    assert.strictEqual(r.savingsDifference, 500);
    assert.strictEqual(r.overageRateUsed, 80);
  });

  it("hourly cheaper when hours far exceed included hours", () => {
    // hourly = 100*200 = 20000; retainer = 3000 + (200-40)*150 = 27000.
    // H1 = 30 <= 40 -> break-even 30.
    const r = compareRetainerVsHourly({
      hourlyRate: 100,
      estimatedHoursPerMonth: 200,
      retainerFee: 3000,
      retainerIncludedHours: 40,
      overageHourlyRate: 150,
    });
    assert.strictEqual(r.hourlyModelMonthlyCost, 20000);
    assert.strictEqual(r.retainerModelMonthlyCost, 27000);
    assert.strictEqual(r.breakEvenHours, 30);
    assert.strictEqual(r.cheaperOption, "hourly");
    assert.strictEqual(r.savingsDifference, 7000);
  });

  it("exact tie reports 'tie' with zero savings", () => {
    // hourly = 100*100 = 10000; retainer = 4000 + (100-40)*100 = 10000.
    // H1 = 40 <= 40 -> break-even 40.
    const r = compareRetainerVsHourly({
      hourlyRate: 100,
      estimatedHoursPerMonth: 100,
      retainerFee: 4000,
      retainerIncludedHours: 40,
      overageHourlyRate: 100,
    });
    assert.strictEqual(r.cheaperOption, "tie");
    assert.strictEqual(r.savingsDifference, 0);
    assert.strictEqual(r.breakEvenHours, 40);
  });

  it("break-even solved beyond included hours when overage < hourly rate", () => {
    // hourly = 100*200 = 20000; retainer = 15000 + (200-100)*50 = 20000 (tie).
    // H1 = 150 > 100; H2 = (15000 - 100*50)/(100-50) = 10000/50 = 200.
    const r = compareRetainerVsHourly({
      hourlyRate: 100,
      estimatedHoursPerMonth: 200,
      retainerFee: 15000,
      retainerIncludedHours: 100,
      overageHourlyRate: 50,
    });
    assert.strictEqual(r.hourlyModelMonthlyCost, 20000);
    assert.strictEqual(r.retainerModelMonthlyCost, 20000);
    assert.strictEqual(r.breakEvenHours, 200);
    assert.strictEqual(r.cheaperOption, "tie");
  });

  it("defaults overage to hourlyRate with a note", () => {
    // overage defaults to 75: retainer = 1200 + (50-30)*75 = 2700; hourly = 75*50 = 3750.
    // H1 = 1200/75 = 16 <= 30 -> break-even 16.
    const r = compareRetainerVsHourly({
      hourlyRate: 75,
      estimatedHoursPerMonth: 50,
      retainerFee: 1200,
      retainerIncludedHours: 30,
    });
    assert.strictEqual(r.overageRateUsed, 75);
    assert.strictEqual(r.retainerModelMonthlyCost, 2700);
    assert.strictEqual(r.hourlyModelMonthlyCost, 3750);
    assert.strictEqual(r.cheaperOption, "retainer");
    assert.strictEqual(r.breakEvenHours, 16);
    assert.ok(r.notes.some((n) => n.includes("defaults to your hourly rate")));
  });

  it("no break-even when retainer line is parallel and always above hourly", () => {
    // hourly = 100*H; retainer = 15000 flat-ish (overage == hourly): at H=100, 10000 vs 15000.
    // H1 = 150 > 100, denom = 0 -> null.
    const r = compareRetainerVsHourly({
      hourlyRate: 100,
      estimatedHoursPerMonth: 120,
      retainerFee: 15000,
      retainerIncludedHours: 100,
      overageHourlyRate: 100,
    });
    assert.strictEqual(r.breakEvenHours, null);
    assert.strictEqual(r.cheaperOption, "hourly");
  });

  it("zero hourly rate with positive retainer fee: hourly always cheaper, no break-even", () => {
    const r = compareRetainerVsHourly({
      hourlyRate: 0,
      estimatedHoursPerMonth: 10,
      retainerFee: 500,
      retainerIncludedHours: 10,
    });
    assert.strictEqual(r.hourlyModelMonthlyCost, 0);
    assert.strictEqual(r.retainerModelMonthlyCost, 500);
    assert.strictEqual(r.breakEvenHours, null);
    assert.strictEqual(r.cheaperOption, "hourly");
  });

  it("zero everything: tie with break-even at 0", () => {
    const r = compareRetainerVsHourly({
      hourlyRate: 0,
      estimatedHoursPerMonth: 0,
      retainerFee: 0,
      retainerIncludedHours: 0,
    });
    assert.strictEqual(r.cheaperOption, "tie");
    assert.strictEqual(r.breakEvenHours, 0);
    assert.strictEqual(r.savingsDifference, 0);
  });

  it("retainer cheaper at zero estimated hours", () => {
    // hourly = 0; retainer = 800. H1 = 8 <= 20 -> break-even 8.
    const r = compareRetainerVsHourly({
      hourlyRate: 100,
      estimatedHoursPerMonth: 0,
      retainerFee: 800,
      retainerIncludedHours: 20,
      overageHourlyRate: 120,
    });
    assert.strictEqual(r.hourlyModelMonthlyCost, 0);
    assert.strictEqual(r.retainerModelMonthlyCost, 800);
    assert.strictEqual(r.cheaperOption, "hourly");
    assert.strictEqual(r.breakEvenHours, 8);
  });

  it("rounds money to cents", () => {
    // hourly = 33.333*3 = 99.999 -> 100.00; retainer = 49.995 -> 50.00; diff = 50 -> retainer cheaper.
    const r = compareRetainerVsHourly({
      hourlyRate: 33.333,
      estimatedHoursPerMonth: 3,
      retainerFee: 49.995,
      retainerIncludedHours: 10,
    });
    assert.strictEqual(r.hourlyModelMonthlyCost, 100);
    assert.strictEqual(r.retainerModelMonthlyCost, 50);
    assert.strictEqual(r.savingsDifference, 50);
  });
});

describe("compareRetainerVsHourly — validation throws", () => {
  it("negative hourlyRate throws RangeError", () => {
    assert.throws(
      () =>
        compareRetainerVsHourly({
          hourlyRate: -10,
          estimatedHoursPerMonth: 20,
          retainerFee: 500,
          retainerIncludedHours: 10,
        }),
      /hourlyRate must be >= 0/,
    );
  });

  it("NaN, Infinity, and non-number inputs throw TypeError", () => {
    const base = {
      hourlyRate: 100,
      estimatedHoursPerMonth: 20,
      retainerFee: 500,
      retainerIncludedHours: 10,
    };
    assert.throws(() => compareRetainerVsHourly({ ...base, estimatedHoursPerMonth: NaN }), TypeError);
    assert.throws(
      () => compareRetainerVsHourly({ ...base, retainerFee: Infinity }),
      /must be finite/,
    );
    assert.throws(
      () => compareRetainerVsHourly({ ...base, hourlyRate: "100" as unknown as number }),
      TypeError,
    );
  });

  it("non-object input throws", () => {
    assert.throws(() => compareRetainerVsHourly(null as never), TypeError);
  });
});

describe("runTool — shape and validation", () => {
  function good() {
    return {
      hourlyRate: 100,
      estimatedHoursPerMonth: 20,
      retainerFee: 1500,
      retainerIncludedHours: 40,
      overageHourlyRate: 80,
    };
  }

  it("returns ok:true with the six spec output keys", () => {
    const res = runTool(good());
    assert.strictEqual(res.ok, true);
    assert.deepStrictEqual(Object.keys(res.values!).sort(), [
      "breakEvenHours",
      "cheaperOption",
      "hourlyModelMonthlyCost",
      "notes",
      "retainerModelMonthlyCost",
      "savingsDifference",
    ]);
    assert.strictEqual(res.values!.cheaperOption, "retainer");
  });

  it("missing required key returns a human error", () => {
    const v = good();
    delete (v as Record<string, unknown>).retainerFee;
    const res = runTool(v);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, "retainerFee is required.");
  });

  it("empty string is treated as missing", () => {
    const res = runTool({ ...good(), hourlyRate: "" });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, "hourlyRate is required.");
  });

  it("NaN / Infinity / negative map to human errors", () => {
    assert.strictEqual(runTool({ ...good(), hourlyRate: NaN }).error, "hourlyRate must be a number.");
    assert.strictEqual(
      runTool({ ...good(), retainerIncludedHours: Infinity }).error,
      "retainerIncludedHours must be finite (no Infinity).",
    );
    assert.strictEqual(
      runTool({ ...good(), overageHourlyRate: -5 }).error,
      "overageHourlyRate must be >= 0.",
    );
  });

  it("non-object values return a human error", () => {
    assert.strictEqual(runTool(null as never).ok, false);
    assert.strictEqual(runTool("x" as never).error, "Input must be an object.");
  });

  it("blank overageHourlyRate defaults instead of erroring", () => {
    const res = runTool({ ...good(), overageHourlyRate: "" });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.values!.retainerModelMonthlyCost, 1500);
  });
});
