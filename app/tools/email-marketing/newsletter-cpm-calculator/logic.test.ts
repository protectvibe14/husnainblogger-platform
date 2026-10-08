import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_SUBSCRIBERS,
  MAX_CPM,
  DEFAULT_ISSUES_PER_MONTH,
  MIN_ISSUES_PER_MONTH,
  MAX_ISSUES_PER_MONTH,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    subscribers: 10000,
    openRatePct: 40,
    cpm: 25,
    issuesPerMonth: 4,
  };
}

describe("newsletter-cpm-calculator", () => {
  it("happy path computes all four outputs", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    // 10000 * 40% = 4000 impressions; 4000/1000 * 25 = $100/issue;
    // $100 * 4 = $400/month; $400 / 10000 = $0.04 per subscriber/month
    assert.equal(r.values!.impressionsPerIssue, 4000);
    assert.equal(r.values!.revenuePerIssue, 100);
    assert.equal(r.values!.revenuePerMonth, 400);
    assert.equal(r.values!.revenuePerSubscriberPerMonth, 0.04);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [...OUTPUT_IDS].sort());
  });

  it("deterministic: same inputs produce identical output", () => {
    assert.deepEqual(runTool(happyValues()), runTool(happyValues()));
  });

  it("small list monthly example", () => {
    const r = runTool({
      subscribers: 1200,
      openRatePct: 55,
      cpm: 30,
      issuesPerMonth: 1,
    });
    assert.equal(r.ok, true);
    // 1200 * 55% = 660 impressions; 660/1000 * 30 = $19.80
    assert.equal(r.values!.impressionsPerIssue, 660);
    assert.equal(r.values!.revenuePerIssue, 19.8);
    assert.equal(r.values!.revenuePerMonth, 19.8);
    assert.equal(r.values!.revenuePerSubscriberPerMonth, 0.02);
  });

  it("issuesPerMonth defaults to 4 when omitted", () => {
    const { issuesPerMonth: _omit, ...rest } = happyValues();
    const r = runTool(rest);
    assert.equal(r.ok, true);
    assert.equal(r.values!.revenuePerMonth, 400);
  });

  it("zero subscribers gives zeros, no division by zero", () => {
    const r = runTool({ ...happyValues(), subscribers: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.impressionsPerIssue, 0);
    assert.equal(r.values!.revenuePerIssue, 0);
    assert.equal(r.values!.revenuePerMonth, 0);
    assert.equal(r.values!.revenuePerSubscriberPerMonth, 0);
  });

  it("zero open rate gives zero revenue", () => {
    const r = runTool({ ...happyValues(), openRatePct: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.impressionsPerIssue, 0);
    assert.equal(r.values!.revenuePerMonth, 0);
  });

  it("zero cpm gives zero revenue", () => {
    const r = runTool({ ...happyValues(), cpm: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.revenuePerIssue, 0);
    assert.equal(r.values!.revenuePerMonth, 0);
  });

  it("impressions are whole numbers (rounded)", () => {
    const r = runTool({ ...happyValues(), subscribers: 3333, openRatePct: 33.3 });
    assert.equal(r.ok, true);
    assert.ok(Number.isInteger(r.values!.impressionsPerIssue));
    assert.equal(r.values!.impressionsPerIssue, Math.round(3333 * 0.333));
  });

  it("currency values rounded to 2 decimals", () => {
    const r = runTool({ ...happyValues(), cpm: 33.333 });
    assert.equal(r.ok, true);
    for (const k of [
      "revenuePerIssue",
      "revenuePerMonth",
      "revenuePerSubscriberPerMonth",
    ]) {
      const v = r.values![k] as number;
      assert.equal(v, Math.round(v * 100) / 100);
    }
  });

  it("missing subscribers errors", () => {
    const r = runTool({ ...happyValues(), subscribers: undefined });
    assert.equal(r.ok, false);
  });

  it("subscribers NaN errors", () => {
    const r = runTool({ ...happyValues(), subscribers: NaN });
    assert.equal(r.ok, false);
  });

  it("subscribers Infinity errors", () => {
    const r = runTool({ ...happyValues(), subscribers: Infinity });
    assert.equal(r.ok, false);
  });

  it("fractional subscribers error", () => {
    const r = runTool({ ...happyValues(), subscribers: 100.5 });
    assert.equal(r.ok, false);
  });

  it("negative subscribers errors", () => {
    const r = runTool({ ...happyValues(), subscribers: -5 });
    assert.equal(r.ok, false);
  });

  it("unrealistically large subscribers errors", () => {
    const r = runTool({ ...happyValues(), subscribers: MAX_SUBSCRIBERS + 1 });
    assert.equal(r.ok, false);
  });

  it("openRatePct above 100 errors", () => {
    const r = runTool({ ...happyValues(), openRatePct: 100.1 });
    assert.equal(r.ok, false);
  });

  it("openRatePct below 0 errors", () => {
    const r = runTool({ ...happyValues(), openRatePct: -0.1 });
    assert.equal(r.ok, false);
  });

  it("openRatePct NaN errors", () => {
    const r = runTool({ ...happyValues(), openRatePct: NaN });
    assert.equal(r.ok, false);
  });

  it("negative cpm errors", () => {
    const r = runTool({ ...happyValues(), cpm: -1 });
    assert.equal(r.ok, false);
  });

  it("cpm above max errors", () => {
    const r = runTool({ ...happyValues(), cpm: MAX_CPM + 1 });
    assert.equal(r.ok, false);
  });

  it("cpm NaN errors", () => {
    const r = runTool({ ...happyValues(), cpm: NaN });
    assert.equal(r.ok, false);
  });

  it("issuesPerMonth 0 clamps to 1", () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.revenuePerMonth, 100);
  });

  it(`issuesPerMonth above ${MAX_ISSUES_PER_MONTH} clamps to max`, () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: 99 });
    assert.equal(r.ok, true);
    assert.equal(
      r.values!.revenuePerMonth,
      100 * MAX_ISSUES_PER_MONTH,
    );
  });

  it("issuesPerMonth NaN errors", () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: NaN });
    assert.equal(r.ok, false);
  });

  it("fractional issuesPerMonth is floored", () => {
    const r = runTool({ ...happyValues(), issuesPerMonth: 2.9 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.revenuePerMonth, 200);
  });

  it("null values object errors", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("defaults and bounds constants are sane", () => {
    assert.equal(DEFAULT_ISSUES_PER_MONTH, 4);
    assert.equal(MIN_ISSUES_PER_MONTH, 1);
    assert.ok(MAX_ISSUES_PER_MONTH >= 28);
  });
});
