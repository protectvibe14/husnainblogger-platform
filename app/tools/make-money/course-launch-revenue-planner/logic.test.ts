/**
 * Tests for the Course Launch Revenue Planner pure logic (tool-092).
 *
 * Run: node --test app/tools/make-money/course-launch-revenue-planner/logic.test.ts
 *
 * Expected values are hand-computed from the funnel formula
 * (buyers = list × open/100 × conv/100; gross = buyers × price;
 *  net = gross × (1 − refund/100)) — never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, round2, PROJECTION_LABEL } from "./logic.ts";

const GOOD = {
  emailListSize: 5000,
  openRate: 30,
  salesConversionRate: 2,
  coursePrice: 99,
  refundRate: 5,
};

describe("runTool — happy path", () => {
  it("projects 30 buyers, $2970 gross, $2821.50 net", () => {
    // Hand-computed: opened = 5000×0.30 = 1500; buyers = 1500×0.02 = 30;
    // gross = 30×99 = 2970; net = 2970×0.95 = 2821.5
    const r = runTool(GOOD);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectedBuyers, 30);
    assert.strictEqual(r.values!.grossRevenue, 2970);
    assert.strictEqual(r.values!.netRevenue, 2821.5);
    assert.strictEqual(r.values!.projectionLabel, PROJECTION_LABEL);
  });

  it("funnelSteps table shows every funnel stage in order", () => {
    const r = runTool(GOOD);
    const table = r.values!.funnelSteps as { columns: string[]; rows: string[][] };
    assert.deepStrictEqual(table.columns, ["Funnel stage", "Value"]);
    assert.deepStrictEqual(
      table.rows.map((row) => row[0]),
      ["Email list size", "Opened emails", "Projected buyers", "Gross revenue", "Refunds", "Net revenue"],
    );
    assert.deepStrictEqual(table.rows[1], ["Opened emails", "1500"]);
    assert.deepStrictEqual(table.rows[4], ["Refunds", "$148.50"]);
    assert.deepStrictEqual(table.rows[5], ["Net revenue", "$2821.50"]);
  });
});

describe("runTool — determinism", () => {
  it("same inputs produce identical outputs", () => {
    assert.deepStrictEqual(runTool(GOOD), runTool(GOOD));
  });
});

describe("runTool — validation errors", () => {
  it("missing emailListSize fails", () => {
    const { emailListSize: _omit, ...rest } = GOOD;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(/emailListSize/i.test(r.error!));
  });
  it("emailListSize = 0 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, emailListSize: 0 }).ok, false);
  });
  it("negative emailListSize fails", () => {
    assert.strictEqual(runTool({ ...GOOD, emailListSize: -10 }).ok, false);
  });
  it("non-integer emailListSize fails", () => {
    const r = runTool({ ...GOOD, emailListSize: 4.5 });
    assert.strictEqual(r.ok, false);
    assert.ok(/integer/i.test(r.error!));
  });
  it("openRate above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, openRate: 101 }).ok, false);
  });
  it("negative openRate fails", () => {
    assert.strictEqual(runTool({ ...GOOD, openRate: -1 }).ok, false);
  });
  it("salesConversionRate above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, salesConversionRate: 100.1 }).ok, false);
  });
  it("coursePrice = 0 fails", () => {
    const r = runTool({ ...GOOD, coursePrice: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(/coursePrice/i.test(r.error!));
  });
  it("refundRate above 100 fails", () => {
    assert.strictEqual(runTool({ ...GOOD, refundRate: 101 }).ok, false);
  });
  it("missing coursePrice fails", () => {
    const { coursePrice: _omit, ...rest } = GOOD;
    assert.strictEqual(runTool(rest).ok, false);
  });
});

describe("runTool — rate boundaries (edge cases)", () => {
  it("0% conversion projects zero buyers and zero revenue", () => {
    const r = runTool({ ...GOOD, salesConversionRate: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectedBuyers, 0);
    assert.strictEqual(r.values!.grossRevenue, 0);
    assert.strictEqual(r.values!.netRevenue, 0);
  });

  it("100% open + 100% conversion sells to the whole list", () => {
    const r = runTool({ ...GOOD, openRate: 100, salesConversionRate: 100 });
    assert.strictEqual(r.values!.projectedBuyers, 5000);
    assert.strictEqual(r.values!.grossRevenue, 495000);
  });

  it("100% refund rate nets zero", () => {
    const r = runTool({ ...GOOD, refundRate: 100 });
    assert.strictEqual(r.values!.netRevenue, 0);
    assert.strictEqual(r.values!.grossRevenue, 2970);
  });

  it("0% refund rate nets the full gross", () => {
    const r = runTool({ ...GOOD, refundRate: 0 });
    assert.strictEqual(r.values!.netRevenue, r.values!.grossRevenue);
  });

  it("projectedBuyers is always an integer", () => {
    const r = runTool({ ...GOOD, emailListSize: 777, openRate: 33, salesConversionRate: 1.7 });
    // 777×0.33 = 256.41 → 256; 256×0.017 = 4.352 → 4
    assert.strictEqual(r.values!.projectedBuyers, 4);
    assert.ok(Number.isInteger(r.values!.projectedBuyers as number));
  });

  it("projection label disclaims prediction/guarantee", () => {
    assert.ok(/not a prediction/i.test(PROJECTION_LABEL));
    assert.ok(/guarantee/i.test(PROJECTION_LABEL));
  });
});

describe("helpers", () => {
  it("round2 rounds half-up to cents", () => {
    assert.strictEqual(round2(2821.5), 2821.5);
    assert.strictEqual(round2(148.505), 148.51);
  });
});

describe("runTool — output ids", () => {
  it("returns exactly the output ids meta.ts declares", () => {
    const r = runTool(GOOD);
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      ["funnelSteps", "grossRevenue", "netRevenue", "projectedBuyers", "projectionLabel"],
    );
  });
});
