/**
 * Tests for affiliate-epc-calculator logic (tool-098).
 * node:test + node:assert only. Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/affiliate-epc-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NOTE_TEXT, calculateAffiliateEpc, runTool } from "./logic.ts";

const EXPECTED_OUTPUT_IDS = ["conversionRate", "earningsPerConversion", "epc", "note"].sort();

describe("calculateAffiliateEpc — happy path", () => {
  it("1000 clicks, 25 conversions, $300 -> EPC $30, CR 2.5%, $12/conversion", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 1000,
      totalConversions: 25,
      totalCommission: 300,
    });
    assert.equal(r.epc, 30);
    assert.equal(r.conversionRate, 2.5);
    assert.equal(r.earningsPerConversion, 12);
    assert.equal(r.note, NOTE_TEXT);
  });

  it("follows the EPC = commission/clicks x 100 convention", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 250,
      totalConversions: 5,
      totalCommission: 87.5,
    });
    assert.equal(r.epc, 35); // 87.5/250*100
    assert.equal(r.conversionRate, 2);
    assert.equal(r.earningsPerConversion, 17.5);
  });

  it("zero conversions -> EPC $0, CR 0%, earnings-per-conversion $0", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 500,
      totalConversions: 0,
      totalCommission: 0,
    });
    assert.equal(r.epc, 0);
    assert.equal(r.conversionRate, 0);
    assert.equal(r.earningsPerConversion, 0);
  });

  it("zero conversions with positive commission still yields EPC $0 (spec edge)", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 500,
      totalConversions: 0,
      totalCommission: 100,
    });
    assert.equal(r.epc, 0);
    assert.equal(r.earningsPerConversion, 0);
  });

  it("single click converts: EPC equals commission x 100", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 1,
      totalConversions: 1,
      totalCommission: 4.99,
    });
    assert.equal(r.epc, 499);
    assert.equal(r.conversionRate, 100);
    assert.equal(r.earningsPerConversion, 4.99);
  });

  it("100% conversion rate works", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 40,
      totalConversions: 40,
      totalCommission: 200,
    });
    assert.equal(r.conversionRate, 100);
    assert.equal(r.epc, 500);
    assert.equal(r.earningsPerConversion, 5);
  });

  it("rounds to 2 decimals", () => {
    const r = calculateAffiliateEpc({
      totalClicks: 3,
      totalConversions: 1,
      totalCommission: 10,
    });
    // epc = 10/3*100 = 333.333... -> 333.33
    assert.equal(r.epc, 333.33);
    // conversionRate = 1/3*100 = 33.333... -> 33.33
    assert.equal(r.conversionRate, 33.33);
    assert.equal(r.earningsPerConversion, 10);
  });
});

describe("calculateAffiliateEpc — validation errors", () => {
  const good = { totalClicks: 1000, totalConversions: 10, totalCommission: 50 };

  it("totalClicks = 0 throws RangeError", () => {
    assert.throws(() => calculateAffiliateEpc({ ...good, totalClicks: 0 }), RangeError);
  });

  it("totalClicks negative throws RangeError", () => {
    assert.throws(() => calculateAffiliateEpc({ ...good, totalClicks: -7 }), RangeError);
  });

  it("totalClicks non-integer throws RangeError", () => {
    assert.throws(() => calculateAffiliateEpc({ ...good, totalClicks: 2.5 }), RangeError);
  });

  it("totalConversions negative throws RangeError", () => {
    assert.throws(() => calculateAffiliateEpc({ ...good, totalConversions: -1 }), RangeError);
  });

  it("totalConversions non-integer throws RangeError", () => {
    assert.throws(() => calculateAffiliateEpc({ ...good, totalConversions: 1.5 }), RangeError);
  });

  it("totalCommission negative throws RangeError", () => {
    assert.throws(() => calculateAffiliateEpc({ ...good, totalCommission: -5 }), RangeError);
  });

  it("totalClicks NaN throws TypeError", () => {
    assert.throws(
      () => calculateAffiliateEpc({ ...good, totalClicks: Number.NaN }),
      TypeError,
    );
  });

  it("totalCommission Infinity throws TypeError", () => {
    assert.throws(
      () => calculateAffiliateEpc({ ...good, totalCommission: Number.POSITIVE_INFINITY }),
      TypeError,
    );
  });

  it("non-object input throws TypeError", () => {
    assert.throws(() => calculateAffiliateEpc(null as unknown as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("happy path returns ok:true with the meta output ids", () => {
    const r = runTool({ totalClicks: 1000, totalConversions: 25, totalCommission: 300 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), EXPECTED_OUTPUT_IDS);
    assert.equal(r.values?.["epc"], 30);
  });

  it("zero clicks returns ok:false", () => {
    const r = runTool({ totalClicks: 0, totalConversions: 0, totalCommission: 0 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("negative commission returns ok:false", () => {
    const r = runTool({ totalClicks: 100, totalConversions: 5, totalCommission: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /commission/i);
  });

  it("missing inputs return ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("is deterministic: two runs give identical results", () => {
    const input = { totalClicks: 777, totalConversions: 13, totalCommission: 91.5 };
    assert.deepEqual(runTool(input), runTool(input));
  });
});
