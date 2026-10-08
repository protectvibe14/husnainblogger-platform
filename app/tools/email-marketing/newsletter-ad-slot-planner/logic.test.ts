import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, parseSlotsText, MAX_SLOTS } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues(): Record<string, unknown> {
  return {
    issuesPerMonth: 4,
    slots: "Top banner | 200 | 80\nSidebar ad | 100 | 50",
  };
}

describe("newsletter-ad-slot-planner", () => {
  it("happy path returns all outputs", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossMonthlyRevenue, 1200);
    // net: (200*0.8 + 100*0.5) * 4 = (160+50)*4 = 840
    assert.equal(r.values!.netRevenueAtFill, 840);
    // utilization: 840/1200 = 70
    assert.equal(r.values!.utilizationPct, 70);
    const table = r.values!.slotTable as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Slot", "Price / issue", "Fill rate %", "Expected revenue / issue"]);
    assert.equal(table.rows.length, 2);
    assert.equal(typeof r.values!.notice, "string");
  });

  it("gross is an upper-bound estimate: all slots sold every issue", () => {
    const r = runTool({ issuesPerMonth: 2, slots: "A | 150 | 100" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossMonthlyRevenue, 300);
    assert.equal(r.values!.netRevenueAtFill, 300);
    assert.equal(r.values!.utilizationPct, 100);
  });

  it("zero fill rate contributes zero to net but keeps gross", () => {
    const r = runTool({ issuesPerMonth: 4, slots: "A | 200 | 0" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossMonthlyRevenue, 800);
    assert.equal(r.values!.netRevenueAtFill, 0);
    assert.equal(r.values!.utilizationPct, 0);
  });

  it("zero prices: gross 0, utilization 0 (no division by zero)", () => {
    const r = runTool({ issuesPerMonth: 4, slots: "Free slot | 0 | 100" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossMonthlyRevenue, 0);
    assert.equal(r.values!.netRevenueAtFill, 0);
    assert.equal(r.values!.utilizationPct, 0);
  });

  it("blank fill rate defaults to 100 with a visible notice", () => {
    const r = runTool({ issuesPerMonth: 4, slots: "A | 200\nB | 100 | 50" });
    assert.equal(r.ok, true);
    assert.match(r.values!.notice as string, /assumed 100%/);
    // net: (200*1 + 100*0.5) * 4 = 1000
    assert.equal(r.values!.netRevenueAtFill, 1000);
  });

  it("money rounds to 2 decimals", () => {
    const r = runTool({ issuesPerMonth: 3, slots: "A | 99.999 | 33.333" });
    assert.equal(r.ok, true);
    // net: 99.999*0.33333 = 33.33333... -> *3 = 100.0 -> 100
    assert.equal(r.values!.netRevenueAtFill, 100);
    const rows = (r.values!.slotTable as { rows: string[][] }).rows;
    assert.match(rows[0][3], /^\d+\.\d{2}$/);
  });

  it("accepts a pre-parsed array of slot objects", () => {
    const r = runTool({
      issuesPerMonth: 4,
      slots: [{ name: "Top", pricePerIssue: 200, expectedFillRatePct: 80 }],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossMonthlyRevenue, 800);
    assert.equal(r.values!.netRevenueAtFill, 640);
  });

  it("missing issuesPerMonth -> error", () => {
    const v = happyValues();
    delete v.issuesPerMonth;
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /issues per month/i);
  });

  it("issuesPerMonth 0 -> error", () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: 0 });
    assert.equal(r.ok, false);
  });

  it("issuesPerMonth 32 -> error", () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: 32 });
    assert.equal(r.ok, false);
  });

  it("non-integer issuesPerMonth -> error", () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: 2.5 });
    assert.equal(r.ok, false);
  });

  it("NaN / Infinity issues rejected", () => {
    assert.equal(runTool({ ...happyValues(), issuesPerMonth: NaN }).ok, false);
    assert.equal(runTool({ ...happyValues(), issuesPerMonth: Infinity }).ok, false);
  });

  it("missing slots -> error", () => {
    const v = happyValues();
    delete v.slots;
    assert.equal(runTool(v).ok, false);
  });

  it("empty slots text -> error", () => {
    const r = runTool({ ...happyValues(), slots: "   \n  " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one ad slot/i);
  });

  it("line without price -> error naming the line", () => {
    const r = runTool({ ...happyValues(), slots: "Top banner" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Line 1/);
  });

  it("non-numeric price -> error naming the line", () => {
    const r = runTool({ ...happyValues(), slots: "Top banner | abc | 50" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Line 1/);
  });

  it("negative price -> error", () => {
    const r = runTool({ ...happyValues(), slots: "Top banner | -10 | 50" });
    assert.equal(r.ok, false);
  });

  it("fill rate above 100 -> error", () => {
    const r = runTool({ ...happyValues(), slots: "Top banner | 100 | 120" });
    assert.equal(r.ok, false);
  });

  it("duplicate slot names -> error", () => {
    const r = runTool({ ...happyValues(), slots: "A | 100 | 50\nA | 200 | 80" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /unique/i);
  });

  it(`more than ${MAX_SLOTS} slots -> error`, () => {
    const many = Array.from({ length: MAX_SLOTS + 1 }, (_, i) => `S${i} | 10 | 100`).join("\n");
    const r = runTool({ ...happyValues(), slots: many });
    assert.equal(r.ok, false);
    assert.match(r.error!, /max/i);
  });

  it("unrealistic price -> error", () => {
    const r = runTool({ ...happyValues(), slots: "A | 99999999999 | 50" });
    assert.equal(r.ok, false);
  });

  it("parseSlotsText: skips blank lines, trims fields", () => {
    const slots = parseSlotsText("\n  Top banner  |  200  |  80  \n\n");
    assert.equal(slots.length, 1);
    assert.deepEqual(slots[0], {
      name: "Top banner",
      pricePerIssue: 200,
      expectedFillRatePct: 80,
    });
  });

  it("HTML stripped from slot names", () => {
    const r = runTool({ ...happyValues(), slots: "<b>Top</b> | 100 | 50" });
    assert.equal(r.ok, true);
    const rows = (r.values!.slotTable as { rows: string[][] }).rows;
    assert.ok(!rows[0][0].includes("<b>"));
  });

  it("notice always labels results as estimates from user input", () => {
    const r = runTool(happyValues());
    assert.match(r.values!.notice as string, /Estimates only/i);
    assert.match(r.values!.notice as string, /YOUR prices/i);
  });

  it("no market-rate benchmarks are presented as facts", () => {
    const r = runTool(happyValues());
    const text = JSON.stringify(r.values);
    assert.ok(!/market rate/i.test(text));
    assert.ok(!/CPM/i.test(text));
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(happyValues()), runTool(happyValues()));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });
});
