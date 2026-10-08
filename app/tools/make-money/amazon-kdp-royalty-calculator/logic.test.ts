/**
 * Tests for the KDP & eBook Royalty Calculator pure logic (tool-060).
 *
 * Run: node --test app/tools/make-money/amazon-kdp-royalty-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the inputs and the documented
 * defaults (never copied from tool output). Royalty figures are the EDITABLE
 * ESTIMATES the spec requires — tests assert the schedule math, not KDP's
 * official current terms.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  calculateKdpRoyalty,
  roundToCents,
  INK_RATES,
  DEFAULT_ROYALTY_70,
  DEFAULT_ROYALTY_35,
  DEFAULT_BAND_MIN,
  DEFAULT_BAND_MAX,
  DEFAULT_DELIVERY_PER_MB,
  DEFAULT_PAPERBACK_ROYALTY,
  DEFAULT_PRINT_FIXED,
  OUTPUT_IDS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("runTool — ebook inside the 70% band", () => {
  it("computes royalty minus the delivery fee", () => {
    // Hand-computed: rate=70; gross=4.99*0.70=3.493; delivery=2*0.15=0.30;
    // royalty=3.193->3.19; printing=0; no notice.
    const r = runTool({ format: "ebook", listPrice: 4.99, fileSizeMB: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyPerSale, 3.19);
    assert.strictEqual(r.values!.royaltyRateApplied, 70);
    assert.strictEqual(r.values!.printingCost, 0);
    assert.strictEqual(r.values!.notice, "");
  });

  it("applies the 70% band at the exact bounds", () => {
    // listPrice=2.99, fileSize 0: royalty=2.99*0.70=2.093->2.09.
    const low = runTool({ format: "ebook", listPrice: 2.99, fileSizeMB: 0 });
    assert.strictEqual(low.ok, true);
    assert.strictEqual(low.values!.royaltyRateApplied, 70);
    assert.strictEqual(low.values!.royaltyPerSale, 2.09);
    assert.strictEqual(low.values!.notice, "");

    // listPrice=9.99: royalty=9.99*0.70=6.993->6.99.
    const high = runTool({ format: "ebook", listPrice: 9.99, fileSizeMB: 0 });
    assert.strictEqual(high.ok, true);
    assert.strictEqual(high.values!.royaltyRateApplied, 70);
    assert.strictEqual(high.values!.royaltyPerSale, 6.99);
  });
});

describe("runTool — ebook outside the 70% band (auto 35%)", () => {
  it("auto-switches to 35% below the band with a notice", () => {
    // listPrice=1.99: 1.99*0.35=0.6965->0.70; no delivery in 35% tier.
    const r = runTool({ format: "ebook", listPrice: 1.99, fileSizeMB: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyRateApplied, 35);
    assert.strictEqual(r.values!.royaltyPerSale, 0.7);
    assert.ok((r.values!.notice as string).length > 0, "auto-switch must produce a notice");
    assert.ok(/35%/.test(r.values!.notice as string));
  });

  it("auto-switches to 35% above the band with a notice", () => {
    // listPrice=12.99: 12.99*0.35=4.5465->4.55.
    const r = runTool({ format: "ebook", listPrice: 12.99, fileSizeMB: 1 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyRateApplied, 35);
    assert.strictEqual(r.values!.royaltyPerSale, 4.55);
    assert.ok((r.values!.notice as string).length > 0);
  });

  it("floors the royalty at $0 when the delivery fee exceeds it", () => {
    // listPrice=2.99 (70% tier): gross=2.093; delivery=20*0.15=3.00;
    // 2.093-3.00=-0.907 -> floor 0 with a notice.
    const r = runTool({ format: "ebook", listPrice: 2.99, fileSizeMB: 20 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyPerSale, 0);
    assert.ok(/floor/i.test(r.values!.notice as string));
  });

  it("honors user-edited band bounds (claimed $12.99 ceiling)", () => {
    // bandMax=200: 12.99 falls in the band -> 70%: 12.99*0.70=9.093->9.09.
    const r = runTool({
      format: "ebook",
      listPrice: 12.99,
      fileSizeMB: 0,
      bandMax: 200,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyRateApplied, 70);
    assert.strictEqual(r.values!.royaltyPerSale, 9.09);
    assert.strictEqual(r.values!.notice, "");
  });
});

describe("runTool — paperback", () => {
  it("computes royalty minus print cost (B&W)", () => {
    // Hand-computed: print=1.00+200*0.012=3.40; royalty=14.99*0.60-3.40
    // =8.994-3.40=5.594->5.59; rate=60.
    const r = runTool({
      format: "paperback",
      listPrice: 14.99,
      pageCount: 200,
      inkType: "bw",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.printingCost, 3.4);
    assert.strictEqual(r.values!.royaltyPerSale, 5.59);
    assert.strictEqual(r.values!.royaltyRateApplied, 60);
    assert.strictEqual(r.values!.notice, "");
  });

  it("uses the standard-color per-page rate", () => {
    // print=1.00+100*0.0255=3.55; royalty=24.99*0.60-3.55=11.444->11.44.
    const r = runTool({
      format: "paperback",
      listPrice: 24.99,
      pageCount: 100,
      inkType: "standard",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.printingCost, 3.55);
    assert.strictEqual(r.values!.royaltyPerSale, 11.44);
  });

  it("uses the premium-color per-page rate", () => {
    // print=1.00+50*0.065=4.25; royalty=39.99*0.60-4.25=19.744->19.74.
    const r = runTool({
      format: "paperback",
      listPrice: 39.99,
      pageCount: 50,
      inkType: "premium",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.printingCost, 4.25);
    assert.strictEqual(r.values!.royaltyPerSale, 19.74);
  });

  it("honors a user-edited paperback royalty rate", () => {
    // rate=55: royalty=20*0.55-(1+100*0.012)=11-2.20=8.80.
    const r = runTool({
      format: "paperback",
      listPrice: 20,
      pageCount: 100,
      inkType: "bw",
      paperbackRoyaltyRate: 55,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyRateApplied, 55);
    assert.strictEqual(r.values!.royaltyPerSale, 8.8);
  });

  it("floors paperback royalty at $0 when print cost exceeds it", () => {
    // print=1+800*0.065=53; royalty=9.99*0.60-53 -> floor 0 with notice.
    const r = runTool({
      format: "paperback",
      listPrice: 9.99,
      pageCount: 800,
      inkType: "premium",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyPerSale, 0);
    assert.ok((r.values!.notice as string).length > 0);
  });
});

describe("runTool — validation errors", () => {
  it("rejects zero list price", () => {
    const r = runTool({ format: "ebook", listPrice: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(/greater than 0/.test(r.error!));
  });

  it("rejects negative list price", () => {
    const r = runTool({ format: "ebook", listPrice: -4.99 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects non-numeric list price", () => {
    const r = runTool({ format: "ebook", listPrice: "expensive" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects an unknown format", () => {
    const r = runTool({ format: "hardcover", listPrice: 20 });
    assert.strictEqual(r.ok, false);
    assert.ok(/Format/.test(r.error!));
  });

  it("rejects an unknown ink type", () => {
    const r = runTool({ format: "paperback", listPrice: 20, pageCount: 100, inkType: "neon" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects an unknown marketplace", () => {
    const r = runTool({ format: "ebook", listPrice: 5, marketplace: "JP" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects zero page count for paperback", () => {
    const r = runTool({ format: "paperback", listPrice: 15, pageCount: 0 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects fractional page count", () => {
    const r = runTool({ format: "paperback", listPrice: 15, pageCount: 100.5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a zero 70% royalty rate", () => {
    const r = runTool({ format: "ebook", listPrice: 5, royaltyRate70: 0 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a 35% royalty rate above 100", () => {
    const r = runTool({ format: "ebook", listPrice: 5, royaltyRate35: 150 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a 70% band where max < min", () => {
    const r = runTool({ format: "ebook", listPrice: 5, bandMin: 10, bandMax: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(/upper bound/.test(r.error!));
  });

  it("rejects negative file size", () => {
    const r = runTool({ format: "ebook", listPrice: 5, fileSizeMB: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative delivery fee per MB", () => {
    const r = runTool({ format: "ebook", listPrice: 5, deliveryFeePerMB: -0.1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative print fixed fee", () => {
    const r = runTool({ format: "paperback", listPrice: 15, pageCount: 100, printFixedFee: -1 });
    assert.strictEqual(r.ok, false);
  });
});

describe("runTool — determinism", () => {
  it("returns identical results for identical inputs", () => {
    const input = {
      format: "paperback",
      listPrice: 18.49,
      pageCount: 312,
      inkType: "standard",
      marketplace: "UK",
    };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });
});

describe("runTool — output ids match meta.ts outputs", () => {
  it("every runTool output key exists in meta outputs", () => {
    const r = runTool({ format: "ebook", listPrice: 5, fileSizeMB: 1 });
    assert.strictEqual(r.ok, true);
    const metaIds = new Set(metaOutputs.map((o) => o.id));
    for (const key of Object.keys(r.values!)) {
      assert.ok(metaIds.has(key), `output id "${key}" missing from meta.ts outputs`);
    }
  });

  it("logic.ts OUTPUT_IDS equals the ids meta.ts declares", () => {
    const logicIds = new Set<string>(OUTPUT_IDS);
    const metaIds = new Set(metaOutputs.map((o) => o.id));
    assert.deepStrictEqual([...logicIds].sort(), [...metaIds].sort());
  });
});

describe("constants and helpers", () => {
  it("defaults are the documented schedule values", () => {
    assert.strictEqual(DEFAULT_ROYALTY_70, 70);
    assert.strictEqual(DEFAULT_ROYALTY_35, 35);
    assert.strictEqual(DEFAULT_BAND_MIN, 2.99);
    assert.strictEqual(DEFAULT_BAND_MAX, 9.99);
    assert.strictEqual(DEFAULT_DELIVERY_PER_MB, 0.15);
    assert.strictEqual(DEFAULT_PAPERBACK_ROYALTY, 60);
    assert.strictEqual(DEFAULT_PRINT_FIXED, 1.0);
  });

  it("ink rates are the documented per-page values", () => {
    assert.deepStrictEqual(INK_RATES, { bw: 0.012, standard: 0.0255, premium: 0.065 });
  });

  it("roundToCents rounds half-up", () => {
    assert.strictEqual(roundToCents(2.345), 2.35);
    assert.strictEqual(roundToCents(2.344), 2.34);
  });

  it("assumptions disclose the unverified ceiling and disputed band", () => {
    const b = calculateKdpRoyalty({
      format: "ebook",
      listPrice: 5,
      royaltyRate70: DEFAULT_ROYALTY_70,
      royaltyRate35: DEFAULT_ROYALTY_35,
      bandMin: DEFAULT_BAND_MIN,
      bandMax: DEFAULT_BAND_MAX,
      fileSizeMB: 0,
      deliveryFeePerMB: DEFAULT_DELIVERY_PER_MB,
      pageCount: 0,
      inkType: "bw",
      paperbackRoyaltyRate: DEFAULT_PAPERBACK_ROYALTY,
      printFixedFee: DEFAULT_PRINT_FIXED,
      marketplace: "US",
    });
    assert.ok(
      b.assumptions.some((a) => /unverified/i.test(a)),
      "must disclose the unverified $12.99 ceiling claim",
    );
    assert.ok(
      b.assumptions.some((a) => /disputed/i.test(a)),
      "must disclose the disputed paperback band boundary",
    );
    assert.ok(b.assumptions.some((a) => /estimate/i.test(a)));
  });
});
