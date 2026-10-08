/**
 * Tests for the Fiverr Profit Calculator pure logic (tool-067).
 *
 * Run: node --test app/tools/make-money/fiverr-profit-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the 20% commission constant,
 * never copied from tool output. One test cross-checks the constant against
 * data/platform-rules/fiverr.json.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  calculateFiverrProfit,
  roundToCents,
  FIVERR_SELLER_COMMISSION_RATE,
  FIVERR_CURRENCY,
  MAX_ORDER_VALUE,
  runTool,
  FIVERR_DEFAULT_SERVICE_FEE_RATE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

describe("calculateFiverrProfit — normal orders", () => {
  it("computes gross 130 / commission 26 / net 104 for 100+20+10", () => {
    // Hand-computed: gross=130.00; commission=130*0.20=26.00;
    // withdrawal=0; net=104.00; takeHome=104/130*100=80%.
    const r = calculateFiverrProfit({
      orderValue: 100,
      extrasValue: 20,
      tipsValue: 10,
    });
    assert.strictEqual(r.currency, "USD");
    assert.strictEqual(r.grossEarnings, 130);
    assert.strictEqual(r.commission, 26);
    assert.strictEqual(r.commissionRate, 0.2);
    assert.strictEqual(r.withdrawalFee, 0);
    assert.strictEqual(r.netPayout, 104);
    assert.strictEqual(r.effectiveTakeHomePct, 80);
    assert.ok(r.assumptions.length >= 5, "assumptions must be surfaced");
  });

  it("works with base order value only (defaults extras/tips/withdrawal to 0)", () => {
    // gross=50; commission=10; net=40; takeHome=80%.
    const r = calculateFiverrProfit({ orderValue: 50 });
    assert.strictEqual(r.grossEarnings, 50);
    assert.strictEqual(r.commission, 10);
    assert.strictEqual(r.netPayout, 40);
    assert.strictEqual(r.effectiveTakeHomePct, 80);
  });

  it("charges commission on tips too (tips are part of the base)", () => {
    // gross=200; commission=40; net=160.
    const r = calculateFiverrProfit({ orderValue: 100, tipsValue: 100 });
    assert.strictEqual(r.grossEarnings, 200);
    assert.strictEqual(r.commission, 40);
    assert.strictEqual(r.netPayout, 160);
  });

  it("subtracts a user-provided withdrawal fee from the payout", () => {
    // gross=100; commission=20; withdrawal=3; net=77; takeHome=77%.
    const r = calculateFiverrProfit({ orderValue: 100, withdrawalFee: 3 });
    assert.strictEqual(r.withdrawalFee, 3);
    assert.strictEqual(r.netPayout, 77);
    assert.strictEqual(r.effectiveTakeHomePct, 77);
  });
});

describe("calculateFiverrProfit — seller level is informational", () => {
  it("applies the same 20% for every seller level", () => {
    const base = calculateFiverrProfit({ orderValue: 200 });
    for (const level of ["Level 1", "Level 2", "Top Rated Seller"] as const) {
      const r = calculateFiverrProfit({ orderValue: 200, sellerLevel: level });
      assert.strictEqual(r.commission, base.commission);
      assert.strictEqual(r.netPayout, base.netPayout);
    }
  });

  it("rejects an unknown seller level", () => {
    assert.throws(
      () => calculateFiverrProfit({ orderValue: 50, sellerLevel: "Pro" as never }),
      TypeError,
    );
  });
});

describe("calculateFiverrProfit — rounding and caps", () => {
  it("rounds fractional-cent inputs half-up and notes it", () => {
    // 10.005 -> 10.01; commission=round(2.002)=2.00; net=8.01.
    const r = calculateFiverrProfit({ orderValue: 10.005 });
    assert.strictEqual(r.grossEarnings, 10.01);
    assert.strictEqual(r.commission, 2);
    assert.strictEqual(r.netPayout, 8.01);
    assert.ok(
      r.assumptions.some((a) => a.includes("rounded to the nearest cent")),
      "rounding assumption must be surfaced",
    );
  });

  it("rounds the commission line half-up (33.33 -> 6.67)", () => {
    // commission=33.33*0.2=6.666 -> 6.67; net=26.66.
    const r = calculateFiverrProfit({ orderValue: 33.33 });
    assert.strictEqual(r.commission, 6.67);
    assert.strictEqual(r.netPayout, 26.66);
  });

  it("accepts the sanity cap value but rejects above it", () => {
    const ok = calculateFiverrProfit({ orderValue: MAX_ORDER_VALUE });
    assert.ok(Number.isFinite(ok.netPayout));
    assert.throws(
      () => calculateFiverrProfit({ orderValue: MAX_ORDER_VALUE * 2 }),
      RangeError,
    );
  });
});

describe("calculateFiverrProfit — invalid input", () => {
  it("rejects zero and negative order values", () => {
    assert.throws(() => calculateFiverrProfit({ orderValue: 0 }), RangeError);
    assert.throws(() => calculateFiverrProfit({ orderValue: -50 }), RangeError);
  });

  it("rejects negative extras, tips, and withdrawal fees", () => {
    assert.throws(
      () => calculateFiverrProfit({ orderValue: 50, extrasValue: -1 }),
      RangeError,
    );
    assert.throws(
      () => calculateFiverrProfit({ orderValue: 50, tipsValue: -1 }),
      RangeError,
    );
    assert.throws(
      () => calculateFiverrProfit({ orderValue: 50, withdrawalFee: -2 }),
      RangeError,
    );
  });

  it("rejects non-numeric input (NaN, Infinity, strings, unicode)", () => {
    assert.throws(() => calculateFiverrProfit({ orderValue: NaN }), TypeError);
    assert.throws(
      () => calculateFiverrProfit({ orderValue: Infinity }),
      TypeError,
    );
    assert.throws(
      () => calculateFiverrProfit({ orderValue: "100" as unknown as number }),
      TypeError,
    );
    assert.throws(
      () => calculateFiverrProfit({ orderValue: "１００" as unknown as number }),
      TypeError,
    );
    assert.throws(
      () => calculateFiverrProfit({ orderValue: undefined as unknown as number }),
      TypeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => calculateFiverrProfit(null as never), TypeError);
  });
});

describe("calculateFiverrProfit — assumptions honesty", () => {
  it("labels the result an estimate and states the flat-rate facts", () => {
    const r = calculateFiverrProfit({ orderValue: 80 });
    const joined = r.assumptions.join(" ");
    assert.ok(joined.includes("20%"), "commission rate stated");
    assert.ok(joined.includes("ESTIMATE"), "estimate label present");
    assert.ok(joined.includes("USD"), "currency stated");
    assert.ok(
      joined.includes("buyer service fee"),
      "buyer-paid fee disclosed",
    );
  });

  it("warns about missing withdrawal fee vs user-provided fee", () => {
    const without = calculateFiverrProfit({ orderValue: 80 });
    assert.ok(
      without.assumptions.some((a) => a.includes("No withdrawal fee was entered")),
    );
    const withFee = calculateFiverrProfit({ orderValue: 80, withdrawalFee: 1.5 });
    assert.ok(
      withFee.assumptions.some((a) => a.includes("user-provided value")),
    );
  });

  it("exposes the USD currency constant", () => {
    assert.strictEqual(FIVERR_CURRENCY, "USD");
  });
});

describe("roundToCents", () => {
  it("rounds half-up", () => {
    assert.strictEqual(roundToCents(6.666), 6.67);
    assert.strictEqual(roundToCents(2.002), 2);
    assert.strictEqual(roundToCents(0.005), 0.01);
  });
});

describe("constant matches data/platform-rules/fiverr.json", () => {
  it("the 20% commission in logic.ts equals the verified rule value", () => {
    const rulesPath = fileURLToPath(
      new URL("../../../../data/platform-rules/fiverr.json", import.meta.url),
    );
    const raw = JSON.parse(readFileSync(rulesPath, "utf8")) as {
      rules: Array<{ ruleId: string; value: string; status: string }>;
    };
    const rule = raw.rules.find((r) => r.ruleId === "fiverr-seller-commission");
    assert.ok(rule, "rule fiverr-seller-commission must exist");
    assert.strictEqual(rule.status, "verified");
    const pct = Number(String(rule.value).match(/([\d.]+)%/)?.[1]);
    assert.strictEqual(pct / 100, FIVERR_SELLER_COMMISSION_RATE);
    assert.ok(
      String(rule.value).toLowerCase().includes("tip"),
      "rule covers tips",
    );
  });
});

describe("runTool adapter — happy paths (default 20% via tested fee logic)", () => {
  it("computes $20 fee / $80 net for a $100 order with no extras", () => {
    const r = runTool({ orderValue: 100 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fiverrFee, 20);
    assert.strictEqual(r.values!.netEarnings, 80);
    assert.strictEqual(r.values!.effectiveHourly, null);
  });

  it("applies the 20% fee to tips as well ($100 + $20 tips → $24 fee)", () => {
    // gross = 120; fee = 24; net = 96.
    const r = runTool({ orderValue: 100, tipsValue: 20 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fiverrFee, 24);
    assert.strictEqual(r.values!.netEarnings, 96);
  });

  it("subtracts delivery cost: $100 + $20 tips − $24 fee − $15 cost = $81", () => {
    const r = runTool({ orderValue: 100, tipsValue: 20, deliveryCost: 15 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netEarnings, 81);
  });

  it("computes effective hourly when hoursWorked is given ($81 / 3h = $27)", () => {
    const r = runTool({ orderValue: 100, tipsValue: 20, deliveryCost: 15, hoursWorked: 3 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.effectiveHourly, 27);
  });

  it("honors a user-edited 10% rate (fee = 12 on $120 gross)", () => {
    const r = runTool({ orderValue: 100, tipsValue: 20, serviceFeeRate: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fiverrFee, 12);
    assert.strictEqual(r.values!.netEarnings, 108);
    assert.match(r.values!.note as string, /overridden to 10%/);
  });

  it("labels results as estimates in the note", () => {
    const r = runTool({ orderValue: 50 });
    assert.strictEqual(r.ok, true);
    assert.match(r.values!.note as string, /ESTIMATE/);
    assert.match(r.values!.note as string, /buyer service fee/);
  });

  it("accepts revisionRounds as informational without changing the math", () => {
    const withRev = runTool({ orderValue: 100, revisionRounds: 3 });
    const withoutRev = runTool({ orderValue: 100 });
    assert.strictEqual(withRev.ok, true);
    assert.strictEqual(withRev.values!.fiverrFee, withoutRev.values!.fiverrFee);
    assert.strictEqual(withRev.values!.netEarnings, withoutRev.values!.netEarnings);
    assert.match(withRev.values!.note as string, /informational/);
  });

  it("exposes the documented 20% default rate constant", () => {
    assert.strictEqual(FIVERR_DEFAULT_SERVICE_FEE_RATE, 20);
  });

  it("rounds fractional-cent results to cents", () => {
    // fee = 33.33 × 0.20 = 6.666 → 6.67; net = 33.33 − 6.67 = 26.66.
    const r = runTool({ orderValue: 33.33 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fiverrFee, 6.67);
    assert.strictEqual(r.values!.netEarnings, 26.66);
  });
});

describe("runTool adapter — validation errors", () => {
  it("rejects missing orderValue", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Order value/i);
  });

  it("rejects zero orderValue", () => {
    assert.strictEqual(runTool({ orderValue: 0 }).ok, false);
  });

  it("rejects negative orderValue", () => {
    assert.strictEqual(runTool({ orderValue: -10 }).ok, false);
  });

  it("rejects non-numeric orderValue", () => {
    assert.strictEqual(runTool({ orderValue: "abc" }).ok, false);
  });

  it("rejects negative tips", () => {
    assert.strictEqual(runTool({ orderValue: 100, tipsValue: -5 }).ok, false);
  });

  it("rejects negative deliveryCost", () => {
    assert.strictEqual(runTool({ orderValue: 100, deliveryCost: -1 }).ok, false);
  });

  it("rejects zero hoursWorked", () => {
    assert.strictEqual(runTool({ orderValue: 100, hoursWorked: 0 }).ok, false);
  });

  it("rejects negative hoursWorked", () => {
    assert.strictEqual(runTool({ orderValue: 100, hoursWorked: -2 }).ok, false);
  });

  it("rejects serviceFeeRate above 100%", () => {
    assert.strictEqual(runTool({ orderValue: 100, serviceFeeRate: 101 }).ok, false);
  });

  it("rejects negative serviceFeeRate", () => {
    assert.strictEqual(runTool({ orderValue: 100, serviceFeeRate: -5 }).ok, false);
  });

  it("rejects fractional revisionRounds", () => {
    const r = runTool({ orderValue: 100, revisionRounds: 1.5 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("rejects negative revisionRounds", () => {
    assert.strictEqual(runTool({ orderValue: 100, revisionRounds: -1 }).ok, false);
  });

  it("rejects a non-object values argument", () => {
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool adapter — contract & determinism", () => {
  it("is deterministic: two runs with the same inputs are identical", () => {
    const args = { orderValue: 249.99, tipsValue: 12, deliveryCost: 7.5, hoursWorked: 4, revisionRounds: 2 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returned output ids exactly match meta.ts outputs", () => {
    const r = runTool({ orderValue: 100, hoursWorked: 2 });
    assert.strictEqual(r.ok, true);
    const expected = outputs.map((o) => o.id).sort();
    assert.deepStrictEqual(Object.keys(r.values!).sort(), expected);
  });
});
