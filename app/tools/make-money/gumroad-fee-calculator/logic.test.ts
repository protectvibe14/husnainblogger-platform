/**
 * Tests for the Gumroad Fee Calculator (tool-065).
 *
 * Run: node --test app/tools/make-money/gumroad-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the documented fee schedule in
 * logic.ts, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  CHANNEL_IDS,
  DIRECT_PLATFORM_RATE,
  DIRECT_PLATFORM_FIXED,
  DIRECT_PROCESSING_RATE,
  DIRECT_PROCESSING_FIXED,
  DISCOVER_FLAT_RATE,
  OUTPUT_IDS,
  MAX_AMOUNT,
  MAX_QUANTITY,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("happy path — direct sales stack platform fee + processing", () => {
  it("direct $30 x2: platform 7.00, processing 2.34, total 9.34, net 50.66", () => {
    // platform/unit = 30*0.10+0.50 = 3.50; processing/unit = 30*0.029+0.30 = 1.17
    const r = runTool({ salePrice: 30, saleChannel: "direct", quantity: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 7);
    assert.strictEqual(r.values!.processingFee, 2.34);
    assert.strictEqual(r.values!.totalFees, 9.34);
    assert.strictEqual(r.values!.netPayout, 50.66);
  });

  it("direct $30 x1: 3.50 + 1.17 = 4.67 fees, net 25.33", () => {
    const r = runTool({ salePrice: 30, saleChannel: "direct", quantity: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 3.5);
    assert.strictEqual(r.values!.processingFee, 1.17);
    assert.strictEqual(r.values!.totalFees, 4.67);
    assert.strictEqual(r.values!.netPayout, 25.33);
  });

  it("quantity defaults to 1 when omitted", () => {
    const a = runTool({ salePrice: 30, saleChannel: "direct" });
    const b = runTool({ salePrice: 30, saleChannel: "direct", quantity: 1 });
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.ok, true);
  });
});

describe("happy path — discover: 30% flat, processing included", () => {
  it("discover $30 x2: flat 18.00, processing 0, net 42.00", () => {
    // unit fee = 30*0.30 = 9.00; never adds 2.9%+$0.30
    const r = runTool({ salePrice: 30, saleChannel: "discover", quantity: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 18);
    assert.strictEqual(r.values!.processingFee, 0);
    assert.strictEqual(r.values!.totalFees, 18);
    assert.strictEqual(r.values!.netPayout, 42);
  });

  it("discover $15 x1: 4.50 fees, net 10.50", () => {
    const r = runTool({ salePrice: 15, saleChannel: "discover", quantity: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 4.5);
    assert.strictEqual(r.values!.processingFee, 0);
    assert.strictEqual(r.values!.totalFees, 4.5);
    assert.strictEqual(r.values!.netPayout, 10.5);
  });

  it("discover NEVER adds card processing, even at high prices", () => {
    // 100*0.30 = 30 flat; a direct sale would stack 2.9%+$0.30 on top
    const r = runTool({ salePrice: 100, saleChannel: "discover", quantity: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 30);
    assert.strictEqual(r.values!.processingFee, 0);
    assert.strictEqual(r.values!.totalFees, 30);
  });

  it("fee schedule constants match the documented estimates", () => {
    assert.strictEqual(DIRECT_PLATFORM_RATE, 0.1);
    assert.strictEqual(DIRECT_PLATFORM_FIXED, 0.5);
    assert.strictEqual(DIRECT_PROCESSING_RATE, 0.029);
    assert.strictEqual(DIRECT_PROCESSING_FIXED, 0.3);
    assert.strictEqual(DISCOVER_FLAT_RATE, 0.3);
    assert.deepStrictEqual([...CHANNEL_IDS].sort(), ["direct", "discover"]);
  });
});

describe("edge cases", () => {
  it("channel ids are case-insensitive", () => {
    const r = runTool({ salePrice: 30, saleChannel: "Direct", quantity: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 3.5);
  });

  it("large quantity multiplies the rounded per-unit fees", () => {
    // direct $10: platform/unit = 1.50, processing/unit = 0.59; x1000
    const r = runTool({ salePrice: 10, saleChannel: "direct", quantity: 1000 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gumroadFee, 1500);
    assert.strictEqual(r.values!.processingFee, 590);
    assert.strictEqual(r.values!.totalFees, 2090);
    assert.strictEqual(r.values!.netPayout, 7910);
  });

  it("rejects a sale price above the sanity cap", () => {
    const r = runTool({ salePrice: MAX_AMOUNT * 10, saleChannel: "direct" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a quantity above the sanity cap", () => {
    const r = runTool({ salePrice: 10, saleChannel: "direct", quantity: MAX_QUANTITY + 1 });
    assert.strictEqual(r.ok, false);
  });
});

describe("validation errors", () => {
  it("missing saleChannel -> error (channel determines the fee stack)", () => {
    const r = runTool({ salePrice: 30, quantity: 1 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("channel"));
  });

  it("unknown saleChannel -> error", () => {
    const r = runTool({ salePrice: 30, saleChannel: "affiliate" });
    assert.strictEqual(r.ok, false);
  });

  it("missing salePrice -> error", () => {
    const r = runTool({ saleChannel: "direct" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("sale price"));
  });

  it("salePrice of 0 -> error", () => {
    const r = runTool({ salePrice: 0, saleChannel: "direct" });
    assert.strictEqual(r.ok, false);
  });

  it("negative salePrice -> error", () => {
    const r = runTool({ salePrice: -5, saleChannel: "direct" });
    assert.strictEqual(r.ok, false);
  });

  it("NaN salePrice -> error", () => {
    const r = runTool({ salePrice: NaN, saleChannel: "direct" });
    assert.strictEqual(r.ok, false);
  });

  it("quantity of 0 -> error", () => {
    const r = runTool({ salePrice: 30, saleChannel: "direct", quantity: 0 });
    assert.strictEqual(r.ok, false);
  });

  it("fractional quantity -> error", () => {
    const r = runTool({ salePrice: 30, saleChannel: "direct", quantity: 1.5 });
    assert.strictEqual(r.ok, false);
  });
});

describe("determinism", () => {
  it("run twice with identical inputs -> identical outputs", () => {
    const input = { salePrice: 47.99, saleChannel: "direct", quantity: 7 };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.ok, true);
  });
});

describe("contract — outputs match meta.ts", () => {
  it("runTool output ids equal the meta.ts output ids", () => {
    const r = runTool({ salePrice: 30, saleChannel: "direct", quantity: 2 });
    assert.strictEqual(r.ok, true);
    const runIds = Object.keys(r.values!).sort();
    const metaIds = metaOutputs.map((o) => o.id).sort();
    assert.deepStrictEqual(runIds, metaIds);
    assert.deepStrictEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
