/**
 * Tests for the TikTok Sponsorship Rate Calculator pure logic (tool-080).
 *
 * Run: node --test app/tools/make-money/tiktok-sponsorship-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, bandRange, viewBasedRange, roundTier, ESTIMATE_TIER_BANDS } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("tiktok-sponsorship-rate-calculator", () => {
  it("micro tier with strong views: view-based floor wins", () => {
    // 50k followers -> micro tier [10k,100k], t = 40000/90000 = 0.4444
    // band.low = 25 + (125-25)*0.4444 = 69.44 ; band.high = 125 + (1000-125)*0.4444 = 513.89
    // 100k avg views -> viewLow = 200, viewHigh = 600
    // low = max(69.44, 200) = 200 ; high = max(513.89, 600) = 600
    const r = runTool({ followerCount: 50000, avgViews: 100000 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 200);
    assert.equal(r.values!.highRate, 600);
  });

  it("band floor used when views are weak", () => {
    // 50k followers -> band 69.44 - 513.89 ; 5k avg views -> viewLow = 10, viewHigh = 30
    // low = 69.44 -> 70 ; high = 513.89 -> nearest 100 = 500
    const r = runTool({ followerCount: 50000, avgViews: 5000 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 70);
    assert.equal(r.values!.highRate, 500);
  });

  it("nano tier hand-computed", () => {
    // 5k followers -> nano tier [1k,10k], t = 4000/9000 = 0.4444
    // band.low = 5 + (25-5)*0.4444 = 13.89 ; band.high = 25 + (125-25)*0.4444 = 69.44
    // 2k avg views -> viewLow = 4, viewHigh = 12
    // low = max(13.89, 4) = 13.89 -> 15 ; high = max(69.44, 12) = 69.44 -> 70
    const r = runTool({ followerCount: 5000, avgViews: 2000 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 15);
    assert.equal(r.values!.highRate, 70);
  });

  it("mega open tier uses floor values with no extrapolation", () => {
    // 3M followers -> mega tier: 5000-25000 ; 500k views -> viewLow = 1000, viewHigh = 3000
    const r = runTool({ followerCount: 3000000, avgViews: 500000 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 5000);
    assert.equal(r.values!.highRate, 25000);
  });

  it("mega tier view floor can lift the range", () => {
    // 2M followers -> mega floor 5000-25000 ; 10M avg views -> viewLow = 20000, viewHigh = 60000
    const r = runTool({ followerCount: 2000000, avgViews: 10000000 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 20000);
    assert.equal(r.values!.highRate, 60000);
  });

  it("suggested low never exceeds suggested high", () => {
    const cases = [
      { followerCount: 1000, avgViews: 100 },
      { followerCount: 50000, avgViews: 5000 },
      { followerCount: 250000, avgViews: 1000000 },
      { followerCount: 2000000, avgViews: 10000000 },
    ];
    for (const c of cases) {
      const r = runTool(c);
      assert.equal(r.ok, true, JSON.stringify(c));
      assert.ok((r.values!.lowRate as number) <= (r.values!.highRate as number));
    }
  });

  it("rounding: nearest $5 below $500, nearest $100 at $500+", () => {
    assert.equal(roundTier(492), 490);
    assert.equal(roundTier(493), 495);
    assert.equal(roundTier(499), 500);
    assert.equal(roundTier(500), 500);
    assert.equal(roundTier(549), 500);
    assert.equal(roundTier(550), 600);
  });

  it("bandRange interpolates to the next tier at the boundary", () => {
    // at exactly 100000 (start of mid tier), t=0 -> mid-tier floors 125/1000
    const b = bandRange(100000);
    assert.deepEqual(b, { low: 125, high: 1000 });
  });

  it("follower count below the first tier clamps to nano", () => {
    const b = bandRange(500);
    assert.deepEqual(b, { low: 5, high: 25 });
  });

  it("viewBasedRange uses the $2-$6 estimate CPM band", () => {
    const v = viewBasedRange(10000);
    assert.deepEqual(v, { low: 20, high: 60 });
  });

  it("tier tables are ordered and non-overlapping", () => {
    for (let i = 1; i < ESTIMATE_TIER_BANDS.length; i++) {
      assert.equal(ESTIMATE_TIER_BANDS[i].minFollowers, ESTIMATE_TIER_BANDS[i - 1].maxFollowers);
      assert.ok(ESTIMATE_TIER_BANDS[i].low >= ESTIMATE_TIER_BANDS[i - 1].low);
    }
  });

  it("edge case: nano $5-$25 to mega $5k-$25k+ span is covered", () => {
    const nano = runTool({ followerCount: 1000, avgViews: 100 });
    assert.equal(nano.ok, true);
    assert.ok((nano.values!.lowRate as number) >= 5);
    assert.ok((nano.values!.highRate as number) <= 25);
    const mega = runTool({ followerCount: 5000000, avgViews: 1000 });
    assert.equal(mega.ok, true);
    assert.ok((mega.values!.lowRate as number) >= 5000);
    assert.ok((mega.values!.highRate as number) >= 25000);
  });

  it("followerCount 0 / negative / non-numeric are validation errors", () => {
    for (const v of [0, -500, "abc", undefined]) {
      const r = runTool({ followerCount: v, avgViews: 10000 });
      assert.equal(r.ok, false, `followerCount=${String(v)}`);
      assert.match(r.error!, /Follower count/);
    }
  });

  it("avgViews 0 / negative / missing are validation errors", () => {
    for (const v of [0, -10, "xyz", undefined]) {
      const r = runTool({ followerCount: 10000, avgViews: v });
      assert.equal(r.ok, false, `avgViews=${String(v)}`);
      assert.match(r.error!, /Average views/);
    }
  });

  it("string numbers are accepted (form inputs arrive as strings)", () => {
    const r = runTool({ followerCount: "50000", avgViews: "100000" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 200);
    assert.equal(r.values!.highRate, 600);
  });

  it("basis labels the result as a market estimate, not a guarantee", () => {
    const r = runTool({ followerCount: 75000, avgViews: 80000 });
    assert.equal(r.ok, true);
    assert.match(r.values!.basis as string, /estimate/i);
    assert.match(r.values!.basis as string, /vary by niche/);
  });

  it("determinism: identical inputs give identical outputs", () => {
    const v = { followerCount: 333333, avgViews: 777777 };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ followerCount: 10000, avgViews: 10000 });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });
});
