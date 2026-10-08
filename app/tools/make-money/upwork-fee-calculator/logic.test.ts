/**
 * Tests for the Upwork Fee Calculator pure logic (tool-066).
 *
 * Run: node --test app/tools/make-money/upwork-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the documented formula
 * (fee = amount × rate; net = amount − fee; connects = count × $0.15),
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("runTool — happy paths", () => {
  it("computes $50 fee / $450 net for $500 at the 10% default", () => {
    const r = runTool({ contractAmount: 500 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(r.values, {
      serviceFee: 50,
      netPayout: 450,
      connectsCost: null,
      note: r.values!.note,
    });
    assert.match(r.values!.note as string, /ESTIMATE/);
  });

  it("honors an explicit 10% rate and adds a $2.40 connects line for 16 connects", () => {
    // 1200 × 0.10 = 120; net = 1080; connects = 16 × 0.15 = 2.40.
    const r = runTool({ contractAmount: 1200, serviceFeeRate: 10, connectsUsed: 16 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.serviceFee, 120);
    assert.strictEqual(r.values!.netPayout, 1080);
    assert.strictEqual(r.values!.connectsCost, 2.4);
  });

  it("0% rate leaves the full payout (bring-your-own-client)", () => {
    const r = runTool({ contractAmount: 800, serviceFeeRate: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.serviceFee, 0);
    assert.strictEqual(r.values!.netPayout, 800);
  });

  it("15% rate boundary computes correctly", () => {
    // 500 × 0.15 = 75; net = 425.
    const r = runTool({ contractAmount: 500, serviceFeeRate: 15 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.serviceFee, 75);
    assert.strictEqual(r.values!.netPayout, 425);
  });

  it("rounds fee and net to cents (333.33 @ 10%)", () => {
    // 333.33 × 0.10 = 33.333 → 33.33; net = 333.33 − 33.33 = 300.00.
    const r = runTool({ contractAmount: 333.33, serviceFeeRate: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.serviceFee, 33.33);
    assert.strictEqual(r.values!.netPayout, 300);
  });

  it("accepts numeric strings for inputs", () => {
    const r = runTool({ contractAmount: "500", serviceFeeRate: "10" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netPayout, 450);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing contractAmount", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Contract amount/i);
  });

  it("rejects zero contractAmount", () => {
    assert.strictEqual(runTool({ contractAmount: 0 }).ok, false);
  });

  it("rejects negative contractAmount", () => {
    const r = runTool({ contractAmount: -50 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least/);
  });

  it("rejects NaN contractAmount", () => {
    assert.strictEqual(runTool({ contractAmount: NaN }).ok, false);
  });

  it("rejects non-numeric string contractAmount", () => {
    const r = runTool({ contractAmount: "abc" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /must be a number/);
  });

  it("rejects infinite contractAmount", () => {
    assert.strictEqual(runTool({ contractAmount: Infinity }).ok, false);
  });

  it("rejects rate above 15%", () => {
    const r = runTool({ contractAmount: 500, serviceFeeRate: 16 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at most 15/);
  });

  it("rejects negative rate", () => {
    assert.strictEqual(runTool({ contractAmount: 500, serviceFeeRate: -1 }).ok, false);
  });

  it("rejects fractional connectsUsed", () => {
    const r = runTool({ contractAmount: 500, connectsUsed: 2.5 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("rejects negative connectsUsed", () => {
    assert.strictEqual(runTool({ contractAmount: 500, connectsUsed: -1 }).ok, false);
  });

  it("rejects contractAmount above the sanity cap", () => {
    assert.strictEqual(runTool({ contractAmount: 1e12 }).ok, false);
  });

  it("rejects a non-object values argument", () => {
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — contract & determinism", () => {
  it("is deterministic: two runs with the same inputs are identical", () => {
    const args = { contractAmount: 777.77, serviceFeeRate: 12.5, connectsUsed: 8 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returned output ids exactly match meta.ts outputs", () => {
    const r = runTool({ contractAmount: 500, serviceFeeRate: 10, connectsUsed: 4 });
    assert.strictEqual(r.ok, true);
    const expected = outputs.map((o) => o.id).sort();
    assert.deepStrictEqual(Object.keys(r.values!).sort(), expected);
  });
});
