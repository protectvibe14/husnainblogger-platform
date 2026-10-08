/**
 * Tests for saas-affiliate-recurring-revenue-calculator logic (tool-097).
 * node:test + node:assert only. Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/saas-affiliate-recurring-revenue-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DISCLAIMER_TEXT, calculateSaasAffiliate, runTool } from "./logic.ts";

const EXPECTED_OUTPUT_IDS = [
  "disclaimer",
  "monthlyRecurringCommission",
  "projectedAnnual",
  "totalCommission",
].sort();

describe("calculateSaasAffiliate — happy path", () => {
  it("zero churn stacks linearly: 10 refs x $100 x 20%, 3-month cap", () => {
    const r = calculateSaasAffiliate({
      referralsPerMonth: 10,
      avgPlanPrice: 100,
      commissionRate: 20,
      recurringMonths: 3,
      churnRate: 0,
    });
    // base = 200; months: 200, 400, 600 -> total 1200;
    // annual = 1200 + 9*600 = 6600; monthly (month 12) = 600
    assert.equal(r.totalCommission, 1200);
    assert.equal(r.projectedAnnual, 6600);
    assert.equal(r.monthlyRecurringCommission, 600);
    assert.equal(r.disclaimer, DISCLAIMER_TEXT);
  });

  it("50% churn decays each cohort: 1 ref x $100 x 100%, 2-month cap", () => {
    const r = calculateSaasAffiliate({
      referralsPerMonth: 1,
      avgPlanPrice: 100,
      commissionRate: 100,
      recurringMonths: 2,
      churnRate: 50,
    });
    // months: 100, 150 -> total 250; annual = 250 + 10*150 = 1750; monthly = 150
    assert.equal(r.totalCommission, 250);
    assert.equal(r.projectedAnnual, 1750);
    assert.equal(r.monthlyRecurringCommission, 150);
  });

  it("100% churn: only the fresh cohort pays each month", () => {
    const r = calculateSaasAffiliate({
      referralsPerMonth: 5,
      avgPlanPrice: 50,
      commissionRate: 10,
      recurringMonths: 6,
      churnRate: 100,
    });
    // base = 25; every month pays exactly 25
    assert.equal(r.totalCommission, 150);
    assert.equal(r.projectedAnnual, 300);
    assert.equal(r.monthlyRecurringCommission, 25);
  });

  it("0% commission rate yields zeros", () => {
    const r = calculateSaasAffiliate({
      referralsPerMonth: 10,
      avgPlanPrice: 100,
      commissionRate: 0,
      recurringMonths: 12,
      churnRate: 5,
    });
    assert.equal(r.totalCommission, 0);
    assert.equal(r.projectedAnnual, 0);
    assert.equal(r.monthlyRecurringCommission, 0);
  });

  it("24-month cap: total covers 24 months, annual covers 12", () => {
    const r = calculateSaasAffiliate({
      referralsPerMonth: 2,
      avgPlanPrice: 200,
      commissionRate: 25,
      recurringMonths: 24,
      churnRate: 0,
    });
    // base = 100; no churn -> month m pays 100*m (capped at 24 cohorts)
    const total = 100 * ((24 * 25) / 2); // 100 * 300 = 30000
    const annual = 100 * ((12 * 13) / 2); // 100 * 78 = 7800
    assert.equal(r.totalCommission, total);
    assert.equal(r.projectedAnnual, annual);
    assert.equal(r.monthlyRecurringCommission, 2400);
  });

  it("rounds currency half-up to 2 decimals", () => {
    const r = calculateSaasAffiliate({
      referralsPerMonth: 3,
      avgPlanPrice: 29.99,
      commissionRate: 15,
      recurringMonths: 1,
      churnRate: 0,
    });
    // base = 3*29.99*0.15 = 13.4955 -> 13.5; cap = 1 month, but new
    // referrals arrive every month, so: total = month 1 only (13.5),
    // annual = 12 * 13.4955 = 161.95, monthly (month 12) = 13.5
    assert.equal(r.totalCommission, 13.5);
    assert.equal(r.projectedAnnual, 161.95);
    assert.equal(r.monthlyRecurringCommission, 13.5);
  });
});

describe("calculateSaasAffiliate — validation errors", () => {
  const good = {
    referralsPerMonth: 10,
    avgPlanPrice: 100,
    commissionRate: 20,
    recurringMonths: 12,
    churnRate: 5,
  };

  it("referralsPerMonth = 0 throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, referralsPerMonth: 0 }), RangeError);
  });

  it("referralsPerMonth non-integer throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, referralsPerMonth: 2.5 }), RangeError);
  });

  it("avgPlanPrice = 0 throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, avgPlanPrice: 0 }), RangeError);
  });

  it("commissionRate = 101 throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, commissionRate: 101 }), RangeError);
  });

  it("commissionRate negative throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, commissionRate: -1 }), RangeError);
  });

  it("recurringMonths = 0 throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, recurringMonths: 0 }), RangeError);
  });

  it("recurringMonths non-integer throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, recurringMonths: 6.5 }), RangeError);
  });

  it("churnRate = 101 throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, churnRate: 101 }), RangeError);
  });

  it("churnRate negative throws RangeError", () => {
    assert.throws(() => calculateSaasAffiliate({ ...good, churnRate: -0.1 }), RangeError);
  });

  it("non-numeric referralsPerMonth throws TypeError", () => {
    assert.throws(
      () => calculateSaasAffiliate({ ...good, referralsPerMonth: "10" as unknown as number }),
      TypeError,
    );
  });

  it("Infinity avgPlanPrice throws TypeError", () => {
    assert.throws(
      () => calculateSaasAffiliate({ ...good, avgPlanPrice: Number.POSITIVE_INFINITY }),
      TypeError,
    );
  });

  it("non-object input throws TypeError", () => {
    assert.throws(() => calculateSaasAffiliate(null as unknown as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("happy path returns ok:true with the meta output ids", () => {
    const r = runTool({
      referralsPerMonth: 10,
      avgPlanPrice: 100,
      commissionRate: 20,
      recurringMonths: 3,
      churnRate: 0,
    });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), EXPECTED_OUTPUT_IDS);
    assert.equal(r.values?.["totalCommission"], 1200);
  });

  it("zero referrals returns ok:false", () => {
    const r = runTool({
      referralsPerMonth: 0,
      avgPlanPrice: 100,
      commissionRate: 20,
      recurringMonths: 3,
      churnRate: 0,
    });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("rate above 100 returns ok:false", () => {
    const r = runTool({
      referralsPerMonth: 10,
      avgPlanPrice: 100,
      commissionRate: 120,
      recurringMonths: 3,
      churnRate: 0,
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /commission/i);
  });

  it("missing inputs return ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("is deterministic: two runs give identical results", () => {
    const input = {
      referralsPerMonth: 7,
      avgPlanPrice: 49,
      commissionRate: 22,
      recurringMonths: 9,
      churnRate: 3.5,
    };
    assert.deepEqual(runTool(input), runTool(input));
  });
});
