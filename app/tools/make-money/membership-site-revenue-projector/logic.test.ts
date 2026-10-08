/**
 * Tests for Membership Site Revenue Projector logic (tool-088).
 * Zero dependencies: node:test + node:assert only.
 * Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/membership-site-revenue-projector/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, calculateMembershipProjection, MAX_MONTHS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = {
  monthlyVisitors: 10000,
  conversionRate: 2,
  monthlyPrice: 20,
  churnRate: 5,
  months: 12,
};

describe("membership-site-revenue-projector", () => {
  it("happy path: month-1 values match the formula", () => {
    const r = runTool({ ...BASE, months: 1 });
    assert.equal(r.ok, true);
    // new_1 = 10000 * 0.02 = 200; members_1 = 200; mrr_1 = 4000
    assert.equal(r.values!.projectedMembers, 200);
    assert.equal(r.values!.projectedMRR, 4000);
    assert.equal(r.values!.annualProjection, 4000);
  });

  it("happy path: 12-month projection compounds", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    // members_12 = 200 * (1 - 0.95^12) / 0.05 -> 1838.56 -> 1839 members
    assert.equal(r.values!.projectedMembers, 1839);
    assert.equal(r.values!.projectedMRR, 36771.19);
    // annual = sum of rounded monthly mrr
    const rows = r.values!.monthlyTable as Array<{ mrr: number }>;
    const sum = Math.round(rows.reduce((s, row) => s + row.mrr, 0) * 100) / 100;
    assert.equal(r.values!.annualProjection, sum);
  });

  it("edge: churn compounds — growth decelerates, never a flat line", () => {
    const r = runTool({ ...BASE, churnRate: 50 });
    assert.equal(r.ok, true);
    const rows = r.values!.monthlyTable as Array<{ mrr: number }>;
    // mrr_1 = 4000, mrr_2 = 6000 < 2 * mrr_1 (would be 8000 without churn)
    assert.equal(rows[0].mrr, 4000);
    assert.equal(rows[1].mrr, 6000);
    assert.ok(rows[1].mrr < 2 * rows[0].mrr);
    // month-over-month gain shrinks (decay toward ceiling)
    const gain1 = rows[1].mrr - rows[0].mrr;
    const gain11 = rows[11].mrr - rows[10].mrr;
    assert.ok(gain11 < gain1);
  });

  it("edge: 100% churn -> no retained members, no compounding", () => {
    const r = runTool({ ...BASE, churnRate: 100, months: 3 });
    assert.equal(r.ok, true);
    const rows = r.values!.monthlyTable as Array<{ totalMembers: number; newMembers: number }>;
    // every month total = just that month's new signups (200); retained cohort = 0
    for (const row of rows) {
      assert.equal(row.totalMembers, 200);
      assert.equal(row.newMembers, 200);
    }
    assert.equal(r.values!.projectedMembers, 200);
  });

  it("edge: 0% churn accumulates linearly", () => {
    const r = runTool({ ...BASE, churnRate: 0, months: 3 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.projectedMembers, 600);
    assert.equal(r.values!.projectedMRR, 12000);
    assert.equal(r.values!.annualProjection, 24000); // 4000 + 8000 + 12000
  });

  it("edge: 0% conversion -> everything is $0", () => {
    const r = runTool({ ...BASE, conversionRate: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.projectedMembers, 0);
    assert.equal(r.values!.projectedMRR, 0);
    assert.equal(r.values!.annualProjection, 0);
  });

  it("monthlyTable has one row per month with the right shape", () => {
    const r = runTool({ ...BASE, months: 6 });
    assert.equal(r.ok, true);
    const rows = r.values!.monthlyTable as Array<Record<string, unknown>>;
    assert.equal(rows.length, 6);
    for (let i = 0; i < rows.length; i++) {
      assert.equal(rows[i].month, i + 1);
      assert.ok(Number.isInteger(rows[i].newMembers));
      assert.ok(Number.isInteger(rows[i].totalMembers));
      assert.ok(typeof rows[i].mrr === "number");
    }
  });

  it("validation: visitors = 0 fails", () => {
    const r = runTool({ ...BASE, monthlyVisitors: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /visitors/i);
  });

  it("validation: negative visitors fails", () => {
    const r = runTool({ ...BASE, monthlyVisitors: -100 });
    assert.equal(r.ok, false);
  });

  it("validation: conversion above 100 fails", () => {
    const r = runTool({ ...BASE, conversionRate: 101 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 100/);
  });

  it("validation: negative conversion fails", () => {
    const r = runTool({ ...BASE, conversionRate: -1 });
    assert.equal(r.ok, false);
  });

  it("validation: churn above 100 fails", () => {
    const r = runTool({ ...BASE, churnRate: 150 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 100/);
  });

  it("validation: price = 0 fails", () => {
    const r = runTool({ ...BASE, monthlyPrice: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("validation: months = 0 fails", () => {
    const r = runTool({ ...BASE, months: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least 1/);
  });

  it("validation: fractional months fails", () => {
    const r = runTool({ ...BASE, months: 6.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("validation: months beyond the cap fails", () => {
    const r = runTool({ ...BASE, months: MAX_MONTHS + 1 });
    assert.equal(r.ok, false);
    assert.match(r.error!, new RegExp(String(MAX_MONTHS)));
  });

  it("validation: non-numeric churn fails", () => {
    const r = runTool({ ...BASE, churnRate: "high" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /number/);
  });

  it("validation: non-object input fails gracefully", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("determinism: same inputs -> identical outputs", () => {
    const a = runTool({ ...BASE, churnRate: 7.5, months: 24 });
    const b = runTool({ ...BASE, churnRate: 7.5, months: 24 });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("calculateMembershipProjection throws a human error on bad input", () => {
    assert.throws(
      () => calculateMembershipProjection({ ...BASE, monthlyPrice: -5 }),
      /greater than 0 USD/,
    );
  });
});
