/**
 * Tests for the eBook Pricing & Royalty Calculator pure logic (tool-093).
 *
 * Run: node --test app/tools/make-money/ebook-pricing-royalty-calculator/logic.test.ts
 *
 * Expected values are hand-computed from the KDP schedule in the spec
 * (eBook: 70% of price − $0.15/MB in $2.99–$9.99, else 35% floored at $0;
 *  paperback: 60% of price − ($1.00 + pages × ink rate)) — never copied
 * from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  round2,
  EBOOK_ROYALTY_70_MIN,
  EBOOK_ROYALTY_70_MAX,
  EBOOK_DELIVERY_FEE_PER_MB,
  PAPERBACK_ROYALTY_RATE,
  PRINT_RATES_PER_PAGE,
} from "./logic.ts";

describe("runTool — eBook happy path (in the 70% band)", () => {
  it("9.99 price, 5MB file → 6.24 royalty at 70%", () => {
    // Hand-computed: 9.99×0.70 − 5×0.15 = 6.993 − 0.75 = 6.243 → 6.24
    const r = runTool({ format: "kindle_ebook", listPrice: 9.99, fileSizeMB: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyPerSale, 6.24);
    assert.strictEqual(r.values!.royaltyRate, 70);
    assert.strictEqual(r.values!.printCost, 0);
    assert.ok(/70%/.test(r.values!.note as string));
  });

  it("defaults fileSizeMB to 0 when omitted", () => {
    const r = runTool({ format: "kindle_ebook", listPrice: 4.99 });
    // 4.99×0.7 = 3.493 → 3.49
    assert.strictEqual(r.values!.royaltyPerSale, 3.49);
    assert.strictEqual(r.values!.royaltyRate, 70);
  });
});

describe("runTool — eBook 35% band (outside $2.99–$9.99)", () => {
  it("14.99 price → 5.25 at 35%", () => {
    // 14.99×0.35 = 5.2465 → 5.25
    const r = runTool({ format: "kindle_ebook", listPrice: 14.99, fileSizeMB: 3 });
    assert.strictEqual(r.values!.royaltyPerSale, 5.25);
    assert.strictEqual(r.values!.royaltyRate, 35);
  });

  it("0.99 price → 0.35 at 35%", () => {
    // 0.99×0.35 = 0.3465 → 0.35
    const r = runTool({ format: "kindle_ebook", listPrice: 0.99 });
    assert.strictEqual(r.values!.royaltyPerSale, 0.35);
    assert.strictEqual(r.values!.royaltyRate, 35);
  });

  it("band boundary 2.99 qualifies for 70%", () => {
    // 2.99×0.7 = 2.093 → 2.09
    const r = runTool({ format: "kindle_ebook", listPrice: 2.99, fileSizeMB: 0 });
    assert.strictEqual(r.values!.royaltyRate, 70);
    assert.strictEqual(r.values!.royaltyPerSale, 2.09);
  });

  it("band boundary 9.99 qualifies for 70%", () => {
    // 9.99×0.7 = 6.993 → 6.99
    const r = runTool({ format: "kindle_ebook", listPrice: 9.99, fileSizeMB: 0 });
    assert.strictEqual(r.values!.royaltyRate, 70);
    assert.strictEqual(r.values!.royaltyPerSale, 6.99);
  });

  it("2.98 falls to 35% (1.04)", () => {
    // 2.98×0.35 = 1.043 → 1.04
    const r = runTool({ format: "kindle_ebook", listPrice: 2.98 });
    assert.strictEqual(r.values!.royaltyRate, 35);
    assert.strictEqual(r.values!.royaltyPerSale, 1.04);
  });

  it("10.00 falls to 35%", () => {
    const r = runTool({ format: "kindle_ebook", listPrice: 10 });
    assert.strictEqual(r.values!.royaltyRate, 35);
  });
});

describe("runTool — paperback happy path", () => {
  it("19.99, 200 pages, B&W → 3.40 print cost, 8.59 royalty", () => {
    // Hand-computed: print = 1.00 + 200×0.012 = 3.40;
    // royalty = 19.99×0.6 − 3.40 = 11.994 − 3.40 = 8.594 → 8.59
    // effective rate = 8.59/19.99×100 = 42.971… → 42.97
    const r = runTool({ format: "paperback", listPrice: 19.99, pageCount: 200, inkType: "bw" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.printCost, 3.4);
    assert.strictEqual(r.values!.royaltyPerSale, 8.59);
    assert.strictEqual(r.values!.royaltyRate, 42.97);
    assert.ok(/60%/.test(r.values!.note as string));
  });

  it("premium color ink raises the print cost", () => {
    // print = 1.00 + 100×0.065 = 7.50; royalty = 24.99×0.6 − 7.50 = 7.494 → 7.49
    const r = runTool({ format: "paperback", listPrice: 24.99, pageCount: 100, inkType: "premium" });
    assert.strictEqual(r.values!.printCost, 7.5);
    assert.strictEqual(r.values!.royaltyPerSale, 7.49);
  });

  it("standard color uses the 0.0255 rate", () => {
    // Hand-computed: print = 1.00 + 150×0.0255 = 4.825; binary float
    // represents 4.825×100 as 482.4999…, so half-up rounding gives 4.82;
    // royalty = 14.99×0.6 − 4.82 = 4.174 → 4.17; rate = 4.17/14.99×100 → 27.82
    const r = runTool({ format: "paperback", listPrice: 14.99, pageCount: 150, inkType: "standard" });
    assert.strictEqual(r.values!.printCost, 4.82);
    assert.strictEqual(r.values!.royaltyPerSale, 4.17);
    assert.strictEqual(r.values!.royaltyRate, 27.82);
  });

  it("defaults inkType to bw when omitted", () => {
    const a = runTool({ format: "paperback", listPrice: 19.99, pageCount: 200 });
    const b = runTool({ format: "paperback", listPrice: 19.99, pageCount: 200, inkType: "bw" });
    assert.deepStrictEqual(a, b);
  });
});

describe("runTool — paperback edge cases", () => {
  it("negative royalty is floored at 0 with a not-viable warning", () => {
    // print = 1.00 + 300×0.065 = 20.50; raw = 9.99×0.6 − 20.50 = −14.51
    const r = runTool({ format: "paperback", listPrice: 9.99, pageCount: 300, inkType: "premium" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.royaltyPerSale, 0);
    assert.ok(/not viable/i.test(r.values!.note as string));
  });

  it("paperback requires pageCount", () => {
    const r = runTool({ format: "paperback", listPrice: 19.99 });
    assert.strictEqual(r.ok, false);
    assert.ok(/pageCount/i.test(r.error!));
  });

  it("eBook ignores inkType (same result with or without it)", () => {
    const a = runTool({ format: "kindle_ebook", listPrice: 9.99, fileSizeMB: 5 });
    const b = runTool({ format: "kindle_ebook", listPrice: 9.99, fileSizeMB: 5, inkType: "premium" });
    assert.strictEqual(b.values!.royaltyPerSale, a.values!.royaltyPerSale);
  });

  it("every note reminds the user to verify the schedule with the retailer", () => {
    const ebook = runTool({ format: "kindle_ebook", listPrice: 9.99 });
    const paper = runTool({ format: "paperback", listPrice: 19.99, pageCount: 200 });
    assert.ok(/verify the current/i.test(ebook.values!.note as string));
    assert.ok(/verify the current/i.test(paper.values!.note as string));
  });
});

describe("runTool — determinism", () => {
  it("same inputs produce identical outputs", () => {
    const v = { format: "paperback", listPrice: 19.99, pageCount: 200, inkType: "bw" };
    assert.deepStrictEqual(runTool(v), runTool(v));
  });
});

describe("runTool — validation errors", () => {
  it("missing listPrice fails", () => {
    const r = runTool({ format: "kindle_ebook" });
    assert.strictEqual(r.ok, false);
    assert.ok(/listPrice/i.test(r.error!));
  });
  it("listPrice = 0 fails", () => {
    assert.strictEqual(runTool({ format: "kindle_ebook", listPrice: 0 }).ok, false);
  });
  it("negative listPrice fails", () => {
    assert.strictEqual(runTool({ format: "kindle_ebook", listPrice: -4.99 }).ok, false);
  });
  it("invalid format fails", () => {
    const r = runTool({ format: "audiobook", listPrice: 9.99 });
    assert.strictEqual(r.ok, false);
    assert.ok(/format/i.test(r.error!));
  });
  it("invalid inkType fails", () => {
    const r = runTool({ format: "paperback", listPrice: 19.99, pageCount: 200, inkType: "glossy" });
    assert.strictEqual(r.ok, false);
    assert.ok(/inkType/i.test(r.error!));
  });
  it("paperback pageCount = 0 fails", () => {
    assert.strictEqual(runTool({ format: "paperback", listPrice: 19.99, pageCount: 0 }).ok, false);
  });
  it("paperback non-integer pageCount fails", () => {
    assert.strictEqual(runTool({ format: "paperback", listPrice: 19.99, pageCount: 2.5 }).ok, false);
  });
  it("negative fileSizeMB fails", () => {
    assert.strictEqual(runTool({ format: "kindle_ebook", listPrice: 9.99, fileSizeMB: -1 }).ok, false);
  });
});

describe("constants match the spec schedule", () => {
  it("70% band is $2.99–$9.99 with a $0.15/MB delivery fee", () => {
    assert.strictEqual(EBOOK_ROYALTY_70_MIN, 2.99);
    assert.strictEqual(EBOOK_ROYALTY_70_MAX, 9.99);
    assert.strictEqual(EBOOK_DELIVERY_FEE_PER_MB, 0.15);
  });
  it("paperback rate is 60% with the three documented print rates", () => {
    assert.strictEqual(PAPERBACK_ROYALTY_RATE, 0.6);
    assert.deepStrictEqual(PRINT_RATES_PER_PAGE, { bw: 0.012, standard: 0.0255, premium: 0.065 });
  });
  it("round2 rounds half-up to cents", () => {
    assert.strictEqual(round2(6.243), 6.24);
    assert.strictEqual(round2(5.2465), 5.25);
  });
});

describe("runTool — output ids", () => {
  it("returns exactly the output ids meta.ts declares", () => {
    const r = runTool({ format: "kindle_ebook", listPrice: 9.99 });
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      ["note", "printCost", "royaltyPerSale", "royaltyRate"],
    );
  });
});
