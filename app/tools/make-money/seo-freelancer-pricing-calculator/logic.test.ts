/**
 * Tests for the SEO Freelancer Pricing Calculator pure logic (tool-076).
 *
 * Run: node --test app/tools/make-money/seo-freelancer-pricing-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  computeRange,
  roundMoney,
  UNVERIFIED_AUDIT_BASE,
  UNVERIFIED_AUDIT_PER_PAGE,
  UNVERIFIED_RETAINER_HOURLY,
  UNVERIFIED_LINK_BUILDING_HOURLY,
} from "./logic.ts";
import { outputs } from "./meta.ts";

describe("seo-freelancer-pricing-calculator", () => {
  it("audit: hand-computed range from base + per-page add-on", () => {
    // 50 pages -> low = 400 + 3*50 = 550; high = 1200 + 9*50 = 1650
    const r = runTool({ serviceType: "audit", sitePages: 50, hoursPerMonth: 10 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 550);
    assert.equal(r.values!.highRate, 1650);
  });

  it("monthly_retainer: hourly band x hours", () => {
    // 20h -> low = 50*20 = 1000; high = 150*20 = 3000
    const r = runTool({ serviceType: "monthly_retainer", sitePages: 100, hoursPerMonth: 20 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 1000);
    assert.equal(r.values!.highRate, 3000);
  });

  it("link_building: hourly band x hours", () => {
    // 10h -> low = 40*10 = 400; high = 125*10 = 1250
    const r = runTool({ serviceType: "link_building", sitePages: 25, hoursPerMonth: 10 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 400);
    assert.equal(r.values!.highRate, 1250);
  });

  it("computeRange matches runTool for every service type", () => {
    for (const t of ["audit", "monthly_retainer", "link_building"] as const) {
      const expected = computeRange(t, 30, 12);
      const r = runTool({ serviceType: t, sitePages: 30, hoursPerMonth: 12 });
      assert.equal(r.ok, true);
      assert.deepEqual({ lowRate: r.values!.lowRate, highRate: r.values!.highRate }, expected);
    }
  });

  it("user overrides replace the whole band and relabel the basis", () => {
    const r = runTool({
      serviceType: "monthly_retainer",
      sitePages: 10,
      hoursPerMonth: 40,
      rateLowOverride: 2000,
      rateHighOverride: 4000,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 2000);
    assert.equal(r.values!.highRate, 4000);
    assert.match(r.values!.basis as string, /user-set/i);
  });

  it("single override (only low) is a validation error", () => {
    const r = runTool({ serviceType: "audit", sitePages: 10, hoursPerMonth: 5, rateLowOverride: 500 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /both/i);
  });

  it("override high < low is a validation error", () => {
    const r = runTool({
      serviceType: "audit",
      sitePages: 10,
      hoursPerMonth: 5,
      rateLowOverride: 900,
      rateHighOverride: 700,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than or equal/i);
  });

  it("non-positive override is a validation error", () => {
    const r = runTool({
      serviceType: "audit",
      sitePages: 10,
      hoursPerMonth: 5,
      rateLowOverride: 0,
      rateHighOverride: 700,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("invalid service type is a validation error", () => {
    const r = runTool({ serviceType: "copywriting", sitePages: 10, hoursPerMonth: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /service type/i);
  });

  it("missing service type is a validation error", () => {
    const r = runTool({ sitePages: 10, hoursPerMonth: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /service type/i);
  });

  it("sitePages 0 / negative / fractional are validation errors", () => {
    for (const v of [0, -5, 10.5, "abc", null]) {
      const r = runTool({ serviceType: "audit", sitePages: v, hoursPerMonth: 5 });
      assert.equal(r.ok, false, `sitePages=${String(v)}`);
      assert.match(r.error!, /Site pages/);
    }
  });

  it("hoursPerMonth 0 / negative / non-numeric are validation errors", () => {
    for (const v of [0, -2, "xyz", NaN, undefined]) {
      const r = runTool({ serviceType: "monthly_retainer", sitePages: 10, hoursPerMonth: v });
      assert.equal(r.ok, false, `hoursPerMonth=${String(v)}`);
      assert.match(r.error!, /Hours per month/);
    }
  });

  it("string numbers are accepted (form inputs arrive as strings)", () => {
    const r = runTool({ serviceType: "audit", sitePages: "20", hoursPerMonth: "8" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 400 + 3 * 20);
    assert.equal(r.values!.highRate, 1200 + 9 * 20);
  });

  it("default (non-override) basis labels the bands UNVERIFIED", () => {
    const r = runTool({ serviceType: "audit", sitePages: 20, hoursPerMonth: 8 });
    assert.equal(r.ok, true);
    assert.match(r.values!.basis as string, /UNVERIFIED/i);
  });

  it("fractional hours round half-up to 2 decimals", () => {
    // 2.6667h retainer -> low = 133.335 -> 133.34 ; high = 400.005 -> 400.01
    const r = runTool({ serviceType: "monthly_retainer", sitePages: 10, hoursPerMonth: 2.6667 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, roundMoney(2.6667 * UNVERIFIED_RETAINER_HOURLY.low));
    assert.equal(r.values!.highRate, roundMoney(2.6667 * UNVERIFIED_RETAINER_HOURLY.high));
    assert.equal(r.values!.lowRate, 133.34);
    assert.equal(r.values!.highRate, 400.01);
  });

  it("link building uses its own hourly band, not the retainer band", () => {
    const r = runTool({ serviceType: "link_building", sitePages: 10, hoursPerMonth: 1 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, UNVERIFIED_LINK_BUILDING_HOURLY.low);
    assert.equal(r.values!.highRate, UNVERIFIED_LINK_BUILDING_HOURLY.high);
  });

  it("audit ignores hoursPerMonth (project-based pricing)", () => {
    const a = runTool({ serviceType: "audit", sitePages: 40, hoursPerMonth: 1 });
    const b = runTool({ serviceType: "audit", sitePages: 40, hoursPerMonth: 999 });
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    assert.equal(a.values!.lowRate, b.values!.lowRate);
    assert.equal(a.values!.highRate, b.values!.highRate);
    assert.equal(a.values!.lowRate, UNVERIFIED_AUDIT_BASE.low + UNVERIFIED_AUDIT_PER_PAGE.low * 40);
  });

  it("determinism: identical inputs give identical outputs", () => {
    const v = { serviceType: "monthly_retainer", sitePages: 75, hoursPerMonth: 33.3 };
    assert.deepEqual(runTool(v), runTool(v));
    const o = { ...v, rateLowOverride: 1200, rateHighOverride: 2400 };
    assert.deepEqual(runTool(o), runTool(o));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ serviceType: "audit", sitePages: 10, hoursPerMonth: 5 });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });
});
