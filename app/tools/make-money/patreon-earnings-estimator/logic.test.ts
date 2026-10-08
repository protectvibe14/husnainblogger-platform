/**
 * Tests for Patreon Earnings Estimator logic (tool-086).
 * Zero dependencies: node:test + node:assert only.
 * Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/patreon-earnings-estimator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  calculatePatreonEarnings,
  perPledgeProcessingFee,
  roundToCents,
  PATREON_PLAN_OPTIONS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const STANDARD = "Standard 10% (new pages)";

describe("patreon-earnings-estimator", () => {
  it("happy path: 100 patrons x $5 on Standard 10%", () => {
    const r = runTool({ patrons: 100, avgPledge: 5, planType: STANDARD });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossEarnings, 500);
    assert.equal(r.values!.platformFee, 50);
    assert.equal(r.values!.processingFees, 44.5); // 100 * (5*0.029 + 0.30)
    assert.equal(r.values!.estimatedNetMonthly, 405.5);
  });

  it("legacy_lite applies 5% platform fee", () => {
    const r = runTool({ patrons: 200, avgPledge: 10, planType: "Legacy Lite 5%" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossEarnings, 2000);
    assert.equal(r.values!.platformFee, 100);
    assert.equal(r.values!.processingFees, 118); // 200 * (10*0.029 + 0.30)
    assert.equal(r.values!.estimatedNetMonthly, 1782);
  });

  it("legacy_premium applies 12% platform fee", () => {
    const r = runTool({ patrons: 10, avgPledge: 20, planType: "Legacy Premium 12%" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossEarnings, 200);
    assert.equal(r.values!.platformFee, 24);
    assert.equal(r.values!.processingFees, 8.8); // 10 * (20*0.029 + 0.30)
    assert.equal(r.values!.estimatedNetMonthly, 167.2);
  });

  it("edge: pledges under $3 use the 5% + $0.10 tier", () => {
    const r = runTool({ patrons: 50, avgPledge: 2, planType: "Legacy Pro 8%" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossEarnings, 100);
    assert.equal(r.values!.platformFee, 8);
    assert.equal(r.values!.processingFees, 10); // 50 * (2*0.05 + 0.10)
    assert.equal(r.values!.estimatedNetMonthly, 82);
  });

  it("edge: exactly $3 uses the under-$3 tier (not over)", () => {
    assert.equal(perPledgeProcessingFee(3), 0.25); // 3*0.05 + 0.10
    const r = runTool({ patrons: 10, avgPledge: 3, planType: STANDARD });
    assert.equal(r.ok, true);
    assert.equal(r.values!.processingFees, 2.5);
  });

  it("edge: just over $3 switches to the 2.9% + $0.30 tier", () => {
    assert.equal(roundToCents(perPledgeProcessingFee(3.01)), 0.39); // 0.38729
  });

  it("rounding: fractional cents round half-up", () => {
    const r = runTool({ patrons: 1, avgPledge: 1.235, planType: STANDARD });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossEarnings, 1.24);
    assert.equal(r.values!.platformFee, 0.12);
    assert.equal(r.values!.processingFees, 0.16);
    assert.equal(r.values!.estimatedNetMonthly, 0.96); // 1.24 - 0.12 - 0.16
  });

  it("validation: missing patrons fails", () => {
    const r = runTool({ avgPledge: 5, planType: STANDARD });
    assert.equal(r.ok, false);
    assert.match(r.error!, /patrons/i);
  });

  it("validation: patrons = 0 fails", () => {
    const r = runTool({ patrons: 0, avgPledge: 5, planType: STANDARD });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("validation: fractional patrons fails (must be whole)", () => {
    const r = runTool({ patrons: 2.5, avgPledge: 5, planType: STANDARD });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("validation: negative patrons fails", () => {
    const r = runTool({ patrons: -10, avgPledge: 5, planType: STANDARD });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });

  it("validation: avgPledge = 0 fails", () => {
    const r = runTool({ patrons: 10, avgPledge: 0, planType: STANDARD });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("validation: non-numeric avgPledge fails", () => {
    const r = runTool({ patrons: 10, avgPledge: "abc", planType: STANDARD });
    assert.equal(r.ok, false);
    assert.match(r.error!, /number/);
  });

  it("validation: missing planType fails", () => {
    const r = runTool({ patrons: 10, avgPledge: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /plan/i);
  });

  it("validation: unknown planType fails and lists valid options", () => {
    const r = runTool({ patrons: 10, avgPledge: 5, planType: "10%" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Legacy Lite 5%/);
  });

  it("validation: non-object input fails gracefully", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("accepts numeric strings for numeric inputs", () => {
    const r = runTool({ patrons: "100", avgPledge: "5", planType: STANDARD });
    assert.equal(r.ok, true);
    assert.equal(r.values!.estimatedNetMonthly, 405.5);
  });

  it("large input stays finite", () => {
    const r = runTool({ patrons: 1000000, avgPledge: 100, planType: STANDARD });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossEarnings, 100000000);
    assert.ok(Number.isFinite(r.values!.estimatedNetMonthly as number));
  });

  it("determinism: same inputs -> identical outputs", () => {
    const a = runTool({ patrons: 137, avgPledge: 4.75, planType: "Legacy Pro 8%" });
    const b = runTool({ patrons: 137, avgPledge: 4.75, planType: "Legacy Pro 8%" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ patrons: 10, avgPledge: 5, planType: STANDARD });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("plan options cover all four fee tiers", () => {
    assert.equal(PATREON_PLAN_OPTIONS.length, 4);
    const rates = Object.fromEntries(PATREON_PLAN_OPTIONS.map((p) => [p.label, p.rate]));
    assert.deepEqual(rates, {
      "Standard 10% (new pages)": 0.1,
      "Legacy Lite 5%": 0.05,
      "Legacy Pro 8%": 0.08,
      "Legacy Premium 12%": 0.12,
    });
  });

  it("calculatePatreonEarnings throws a human error on bad input", () => {
    assert.throws(
      () => calculatePatreonEarnings({ patrons: 0, avgPledge: 5, planType: STANDARD }),
      /whole number greater than 0/,
    );
  });
});
