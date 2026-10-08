/**
 * Tests for the Webinar Revenue Estimator pure logic (tool-095).
 *
 * Run: node --test app/tools/make-money/webinar-revenue-estimator/logic.test.ts
 *
 * Expected values are hand-computed from the funnel formula
 * (attendees = registrants × showUp/100; buyers = attendees × conv/100;
 *  revenue = buyers × price) — never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, round2, PROJECTION_LABEL } from "./logic.ts";

const GOOD = {
  registrants: 2000,
  showUpRate: 25,
  offerConversionRate: 3,
  offerPrice: 497,
};

describe("runTool — happy path", () => {
  it("projects 500 attendees, 15 buyers, $7455 revenue", () => {
    // Hand-computed: attendees = 2000×0.25 = 500; buyers = 500×0.03 = 15;
    // revenue = 15×497 = 7455
    const r = runTool(GOOD);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.attendees, 500);
    assert.strictEqual(r.values!.buyers, 15);
    assert.strictEqual(r.values!.estimatedRevenue, 7455);
    assert.strictEqual(r.values!.projectionLabel, PROJECTION_LABEL);
  });

  it("funnelSteps table shows every funnel stage in order", () => {
    const r = runTool(GOOD);
    const table = r.values!.funnelSteps as { columns: string[]; rows: string[][] };
    assert.deepStrictEqual(table.columns, ["Funnel stage", "Value"]);
    assert.deepStrictEqual(
      table.rows.map((row) => row[0]),
      ["Registrants", "Attendees", "Buyers", "Estimated revenue"],
    );
    assert.deepStrictEqual(table.rows[1], ["Attendees", "500"]);
    assert.deepStrictEqual(table.rows[3], ["Estimated revenue", "$7455.00"]);
  });
});

describe("runTool — determinism", () => {
  it("same inputs produce identical outputs", () => {
    assert.deepStrictEqual(runTool(GOOD), runTool(GOOD));
  });
});

describe("runTool — validation errors", () => {
  it("missing registrants fails", () => {
    const { registrants: _omit, ...rest } = GOOD;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(/registrants/i.test(r.error!));
  });
  it("registrants = 0 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, registrants: 0 }).ok, false);
  });
  it("non-integer registrants fails", () => {
    const r = runTool({ ...GOOD, registrants: 2.5 });
    assert.strictEqual(r.ok, false);
    assert.ok(/integer/i.test(r.error!));
  });
  it("negative registrants fails", () => {
    assert.strictEqual(runTool({ ...GOOD, registrants: -5 }).ok, false);
  });
  it("showUpRate above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, showUpRate: 101 }).ok, false);
  });
  it("negative showUpRate fails", () => {
    assert.strictEqual(runTool({ ...GOOD, showUpRate: -5 }).ok, false);
  });
  it("offerConversionRate above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, offerConversionRate: 100.1 }).ok, false);
  });
  it("offerPrice = 0 fails", () => {
    const r = runTool({ ...GOOD, offerPrice: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(/offerPrice/i.test(r.error!));
  });
  it("negative offerPrice fails", () => {
    assert.strictEqual(runTool({ ...GOOD, offerPrice: -10 }).ok, false);
  });
  it("missing offerPrice fails", () => {
    const { offerPrice: _omit, ...rest } = GOOD;
    assert.strictEqual(runTool(rest).ok, false);
  });
});

describe("runTool — rate boundaries (edge cases)", () => {
  it("0% show-up rate projects zero attendees, buyers, revenue", () => {
    const r = runTool({ ...GOOD, showUpRate: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.attendees, 0);
    assert.strictEqual(r.values!.buyers, 0);
    assert.strictEqual(r.values!.estimatedRevenue, 0);
  });

  it("0% conversion projects zero buyers but keeps attendees", () => {
    const r = runTool({ ...GOOD, offerConversionRate: 0 });
    assert.strictEqual(r.values!.attendees, 500);
    assert.strictEqual(r.values!.buyers, 0);
    assert.strictEqual(r.values!.estimatedRevenue, 0);
  });

  it("100% show-up and 100% conversion converts every registrant", () => {
    const r = runTool({ registrants: 100, showUpRate: 100, offerConversionRate: 100, offerPrice: 10 });
    assert.strictEqual(r.values!.attendees, 100);
    assert.strictEqual(r.values!.buyers, 100);
    assert.strictEqual(r.values!.estimatedRevenue, 1000);
  });

  it("attendees and buyers are always integers", () => {
    const r = runTool({ registrants: 333, showUpRate: 33, offerConversionRate: 7, offerPrice: 99 });
    // attendees = 333×0.33 = 109.89 → 110; buyers = 110×0.07 = 7.7 → 8
    assert.strictEqual(r.values!.attendees, 110);
    assert.strictEqual(r.values!.buyers, 8);
    assert.ok(Number.isInteger(r.values!.attendees as number));
    assert.ok(Number.isInteger(r.values!.buyers as number));
  });

  it("projection label disclaims benchmarks and guarantees", () => {
    assert.ok(/user-entered/i.test(PROJECTION_LABEL));
    assert.ok(/not.*benchmark|benchmark/i.test(PROJECTION_LABEL));
    assert.ok(/guarantee/i.test(PROJECTION_LABEL));
  });
});

describe("helpers", () => {
  it("round2 rounds half-up to cents", () => {
    assert.strictEqual(round2(7455), 7455);
    assert.strictEqual(round2(99.995), 100);
  });
});

describe("runTool — output ids", () => {
  it("returns exactly the output ids meta.ts declares", () => {
    const r = runTool(GOOD);
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      ["attendees", "buyers", "estimatedRevenue", "funnelSteps", "projectionLabel"],
    );
  });
});
