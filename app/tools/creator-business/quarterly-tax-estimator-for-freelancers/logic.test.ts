import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseMoney,
  parseRate,
  roundToCents,
  formatMoney,
  DISCLAIMER,
} from "./logic.ts";

type Values = {
  estimatedQuarterlyPayment: number;
  estimatedAnnualTax: number;
  rateBreakdown: string[];
};

function run(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Values;
}

describe("quarterly-tax-estimator-for-freelancers (tool-469)", () => {
  it("Mode A happy path: annual 100000 x 25% -> 25000 annual, 6250 quarterly", () => {
    const v = run({ annualNetProfitEstimate: 100000, effectiveTaxRatePct: 25 });
    assert.equal(v.estimatedAnnualTax, 25000);
    assert.equal(v.estimatedQuarterlyPayment, 6250);
  });

  it("Mode B happy path: annual 100000 x (22+15)% -> 37000 annual, 9250 quarterly", () => {
    const v = run({
      annualNetProfitEstimate: 100000,
      incomeTaxRatePct: 22,
      selfEmploymentTaxRatePct: 15,
    });
    assert.equal(v.estimatedAnnualTax, 37000);
    assert.equal(v.estimatedQuarterlyPayment, 9250);
  });

  it("returns exactly the 3 output keys", () => {
    const r = runTool({ annualNetProfitEstimate: 50000, effectiveTaxRatePct: 20 });
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), [
      "estimatedAnnualTax",
      "estimatedQuarterlyPayment",
      "rateBreakdown",
    ]);
  });

  it("no rates entered -> human error, never an assumed rate", () => {
    const r = runTool({ annualNetProfitEstimate: 50000 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("tax rate"));
  });

  it("only one split rate entered -> error asking for both", () => {
    const r = runTool({ annualNetProfitEstimate: 50000, incomeTaxRatePct: 20 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("BOTH"));
  });

  it("both split rates win over an effective rate, and it is reported", () => {
    const v = run({
      annualNetProfitEstimate: 100000,
      effectiveTaxRatePct: 10,
      incomeTaxRatePct: 20,
      selfEmploymentTaxRatePct: 10,
    });
    assert.equal(v.estimatedAnnualTax, 30000); // (20+10)%, not 10%
    assert.ok(v.rateBreakdown.some((l) => l.includes("ignored")));
  });

  it("rate above 100 is rejected", () => {
    const r = runTool({ annualNetProfitEstimate: 50000, effectiveTaxRatePct: 101 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("100"));
  });

  it("negative rate is rejected", () => {
    const r = runTool({ annualNetProfitEstimate: 50000, effectiveTaxRatePct: -5 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("negative profit is rejected", () => {
    const r = runTool({ annualNetProfitEstimate: -100, effectiveTaxRatePct: 20 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("negative"));
  });

  it("missing annual profit -> error", () => {
    const r = runTool({ effectiveTaxRatePct: 20 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("empty-string annual profit -> error", () => {
    const r = runTool({ annualNetProfitEstimate: "", effectiveTaxRatePct: 20 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("profit of 0 -> $0 estimate", () => {
    const v = run({ annualNetProfitEstimate: 0, effectiveTaxRatePct: 25 });
    assert.equal(v.estimatedAnnualTax, 0);
    assert.equal(v.estimatedQuarterlyPayment, 0);
  });

  it("explicitly entered 0% rate -> $0 with a 'rate provided by you' label", () => {
    const v = run({ annualNetProfitEstimate: 80000, effectiveTaxRatePct: 0 });
    assert.equal(v.estimatedAnnualTax, 0);
    assert.ok(v.rateBreakdown.some((l) => l.includes("entered by you")));
    assert.ok(v.rateBreakdown.some((l) => l.includes("0%")));
  });

  it("NaN and Infinity are rejected", () => {
    assert.ok(parseMoney("x", Number.NaN, { required: true }).error);
    assert.ok(parseMoney("x", Number.POSITIVE_INFINITY, { required: true }).error);
    assert.ok(parseRate("x", "abc").error);
  });

  it("non-numeric profit string is rejected", () => {
    const r = runTool({ annualNetProfitEstimate: "eighty thousand", effectiveTaxRatePct: 20 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("numeric strings are accepted", () => {
    const v = run({ annualNetProfitEstimate: "100000", effectiveTaxRatePct: "25" });
    assert.equal(v.estimatedQuarterlyPayment, 6250);
  });

  it("rateBreakdown always ends with the persistent disclaimer", () => {
    const v = run({ annualNetProfitEstimate: 60000, effectiveTaxRatePct: 18 });
    assert.equal(v.rateBreakdown[v.rateBreakdown.length - 1], DISCLAIMER);
    assert.ok(DISCLAIMER.toLowerCase().includes("not tax advice"));
  });

  it("quarterNetProfit is echoed for comparison; quarterly stays annual/4", () => {
    const v = run({
      annualNetProfitEstimate: 100000,
      effectiveTaxRatePct: 25,
      quarterNetProfit: 40000,
    });
    assert.equal(v.estimatedQuarterlyPayment, 6250);
    assert.ok(v.rateBreakdown.some((l) => l.includes("40,000.00")));
  });

  it("rounds to cents (half-up)", () => {
    assert.equal(roundToCents(10.005), 10.01);
    const v = run({ annualNetProfitEstimate: 100, effectiveTaxRatePct: 33.333 });
    assert.equal(v.estimatedAnnualTax, 33.33);
    assert.equal(v.estimatedQuarterlyPayment, 8.33);
  });

  it("formatMoney groups thousands", () => {
    assert.equal(formatMoney(1234567.8), "1,234,567.80");
  });

  it("Mode A breakdown labels the rate as user-entered", () => {
    const v = run({ annualNetProfitEstimate: 50000, effectiveTaxRatePct: 20 });
    assert.ok(v.rateBreakdown[0].includes("entered by you"));
  });

  it("Mode B breakdown shows both entered rates and the combined rate", () => {
    const v = run({
      annualNetProfitEstimate: 50000,
      incomeTaxRatePct: 12,
      selfEmploymentTaxRatePct: 8,
    });
    const joined = v.rateBreakdown.join(" ");
    assert.ok(joined.includes("12%"));
    assert.ok(joined.includes("8%"));
    assert.ok(joined.includes("20%"));
  });

  it("deterministic: same inputs, identical outputs", () => {
    const args = { annualNetProfitEstimate: 75000, effectiveTaxRatePct: 22.5 };
    assert.deepEqual(run(args), run(args));
  });
});
