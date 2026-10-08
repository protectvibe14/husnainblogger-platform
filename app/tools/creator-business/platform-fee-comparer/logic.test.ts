import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, parsePlatforms } from "./logic.ts";
import * as meta from "./meta.ts";

const PLATFORMS_TEXT = "Gumroad, 10, 0.30\nKo-fi, 5, 0\nEtsy, 6.5, 0.20";

describe("platform-fee-comparer", () => {
  it("computes ranked payouts from user-entered fees", () => {
    const r = runTool({ salePrice: 29.99, platforms: PLATFORMS_TEXT });
    assert.equal(r.ok, true);
    const v = r.values!;
    const table = v.netPayoutPerPlatform as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Platform", "Fee %", "Fixed fee", "Fees", "Net payout"]);
    assert.equal(table.rows.length, 3);
    // Ko-fi: 29.99*0.05 = 1.4995 -> fees 1.50, net 28.49
    assert.equal(table.rows[0][0], "Ko-fi");
    assert.equal(table.rows[0][3], "$1.50");
    assert.equal(table.rows[0][4], "$28.49");
    assert.equal(v.bestNetPayout, "Ko-fi — $28.49 net payout (highest, based on the fees you entered).");
    const list = v.feeBreakdownPerPlatform as string[];
    assert.equal(list.length, 3);
    assert.match(list[0], /Ko-fi/);
  });

  it("accepts platforms as an array of records", () => {
    const r = runTool({
      salePrice: 100,
      platforms: [
        { name: "A", feePct: 10, fixedFee: 0 },
        { name: "B", feePct: 5, fixedFee: 2 },
      ],
    });
    assert.equal(r.ok, true);
    const table = (r.values!.netPayoutPerPlatform as { rows: string[][] }).rows;
    assert.equal(table[0][0], "B"); // 7 fees -> 93 net beats A's 90 net
    assert.equal(table[0][4], "$93.00");
    assert.equal(table[1][4], "$90.00");
  });

  it("accepts sale price as a numeric string", () => {
    const r = runTool({ salePrice: "50", platforms: "A, 10, 0" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.netPayoutPerPlatform as { rows: string[][] }).rows[0][4], "$45.00");
  });

  it("reports a tie when top payouts are equal", () => {
    const r = runTool({ salePrice: 100, platforms: "A, 10, 0\nB, 10, 0\nC, 20, 0" });
    assert.equal(r.ok, true);
    assert.match(r.values!.bestNetPayout as string, /^Tie: A, B — \$90\.00 net payout each/);
  });

  it("floors net payout at zero when fees exceed the price", () => {
    const r = runTool({ salePrice: 5, platforms: "Expensive, 150, 10" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.netPayoutPerPlatform as { rows: string[][] }).rows[0][4], "$0.00");
  });

  it("handles a zero sale price", () => {
    const r = runTool({ salePrice: 0, platforms: "A, 10, 0.30" });
    assert.equal(r.ok, true);
    const table = (r.values!.netPayoutPerPlatform as { rows: string[][] }).rows;
    assert.equal(table[0][3], "$0.30");
    assert.equal(table[0][4], "$0.00");
  });

  it("rejects an empty sale price", () => {
    const r = runTool({ salePrice: "", platforms: "A, 10, 0" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /sale price/i);
  });

  it("rejects NaN sale price", () => {
    const r = runTool({ salePrice: NaN, platforms: "A, 10, 0" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /finite/);
  });

  it("rejects Infinity sale price", () => {
    const r = runTool({ salePrice: Infinity, platforms: "A, 10, 0" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /finite/);
  });

  it("rejects a negative sale price", () => {
    const r = runTool({ salePrice: -5, platforms: "A, 10, 0" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 or more/);
  });

  it("rejects missing platforms", () => {
    const r = runTool({ salePrice: 10, platforms: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one platform/);
  });

  it("rejects a malformed platform line", () => {
    const r = runTool({ salePrice: 10, platforms: "JustAName" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /line 1/i);
  });

  it("rejects a platform with an empty name", () => {
    const r = runTool({ salePrice: 10, platforms: ", 10, 0.30" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /name is required/);
  });

  it("rejects a non-numeric fee %", () => {
    const r = runTool({ salePrice: 10, platforms: "A, abc, 0.30" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /fee %/);
  });

  it("rejects a negative fixed fee", () => {
    const r = runTool({ salePrice: 10, platforms: "A, 10, -1" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /fixed fee/);
  });

  it("rejects NaN fixed fee in a record array", () => {
    const parsed = parsePlatforms([{ name: "A", feePct: 10, fixedFee: NaN }]);
    assert.equal(parsed.ok, false);
  });

  it("is deterministic: same inputs give identical outputs", () => {
    const args = { salePrice: 29.99, platforms: PLATFORMS_TEXT };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ salePrice: 29.99, platforms: PLATFORMS_TEXT });
    assert.equal(r.ok, true);
    const expected = meta.outputs.map((o) => o.id).sort();
    const actual = Object.keys(r.values!).sort();
    assert.deepEqual(actual, expected);
  });
});
