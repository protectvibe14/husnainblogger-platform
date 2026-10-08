/**
 * Tests for the Sponsored Post Rate Calculator pure logic (tool-079).
 *
 * Run: node --test app/tools/make-money/sponsored-post-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  baseRange,
  engagementAdjustment,
  roundTier,
  ESTIMATE_TIER_BANDS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

describe("sponsored-post-rate-calculator", () => {
  it("instagram micro tier: hand-computed rate with reel premium + engagement lift", () => {
    // 20k followers -> tier 10k-50k (250-1000), t=0.25
    // base.low = 250 + (1000-250)*0.25 = 437.5 ; base.high = 1000 + (5000-1000)*0.25 = 2000
    // reel 1.4, engagement 3.0 vs benchmark 2.0 -> adj = 1.25
    // low = 437.5*1.4*1.25 = 765.625 -> 765 ; high = 2000*1.75 = 3500 -> 3500
    const r = runTool({
      platform: "instagram",
      followerCount: 20000,
      engagementRate: 3.0,
      contentFormat: "reel",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 765);
    assert.equal(r.values!.highRate, 3500);
    // per-follower = ((765+3500)/2)/20000 = 0.106625 -> 0.1066
    assert.equal(r.values!.perFollowerRate, 0.1066);
  });

  it("tiktok mid tier with video premium", () => {
    // 30k followers -> tier 10k-50k (150-600), t=0.5
    // base.low = 150 + (600-150)*0.5 = 375 ; base.high = 600 + (3000-600)*0.5 = 1800
    // video 1.6, engagement 5.0 vs benchmark 4.0 -> adj = 1.25
    // low = 750 ; high = 3600
    const r = runTool({
      platform: "tiktok",
      followerCount: 30000,
      engagementRate: 5.0,
      contentFormat: "video",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 750);
    assert.equal(r.values!.highRate, 3600);
  });

  it("youtube mega tier uses open-tier floor values (no extrapolation)", () => {
    // 2M subscribers -> open tier: base 25000-100000 ; post 1.0 ; engagement 3.0 = benchmark -> adj 1.0
    const r = runTool({
      platform: "youtube",
      followerCount: 2000000,
      engagementRate: 3.0,
      contentFormat: "post",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 25000);
    assert.equal(r.values!.highRate, 100000);
  });

  it("format premium ordering: video > reel > post for identical inputs", () => {
    const base = { platform: "instagram", followerCount: 20000, engagementRate: 2.0 };
    const post = runTool({ ...base, contentFormat: "post" });
    const reel = runTool({ ...base, contentFormat: "reel" });
    const video = runTool({ ...base, contentFormat: "video" });
    assert.ok(post.ok && reel.ok && video.ok);
    assert.ok((reel.values!.lowRate as number) > (post.values!.lowRate as number));
    assert.ok((video.values!.lowRate as number) > (reel.values!.lowRate as number));
    // reel/video multipliers sit inside the 1.3-1.6 estimate band vs post
    assert.equal((reel.values!.lowRate as number) / (post.values!.lowRate as number) >= 1.3, true);
    assert.equal((video.values!.lowRate as number) / (post.values!.lowRate as number) <= 1.6, true);
  });

  it("engagement above benchmark lifts the rate", () => {
    const low = runTool({ platform: "instagram", followerCount: 20000, engagementRate: 2.0, contentFormat: "post" });
    const high = runTool({ platform: "instagram", followerCount: 20000, engagementRate: 6.0, contentFormat: "post" });
    assert.ok(low.ok && high.ok);
    assert.ok((high.values!.lowRate as number) > (low.values!.lowRate as number));
  });

  it("engagement adjustment is clamped to [0.5, 2.0]", () => {
    // tiktok benchmark 4.0: engagement 1.0 -> 1 + (1-4)*0.25 = 0.25 -> clamped 0.5
    assert.equal(engagementAdjustment("tiktok", 1.0), 0.5);
    // engagement 10.0 -> 1 + (10-4)*0.25 = 2.5 -> clamped 2.0
    assert.equal(engagementAdjustment("tiktok", 10.0), 2.0);
    // benchmark engagement -> exactly 1.0
    assert.equal(engagementAdjustment("instagram", 2.0), 1.0);
  });

  it("rounding: nearest $5 below $1000, nearest $50 at $1000+", () => {
    assert.equal(roundTier(997), 995);
    assert.equal(roundTier(998), 1000);
    assert.equal(roundTier(1000), 1000);
    assert.equal(roundTier(1024), 1000);
    assert.equal(roundTier(1026), 1050);
  });

  it("follower count below the first tier clamps to tier 0", () => {
    const base = baseRange("instagram", 500);
    assert.deepEqual(base, { low: 25, high: 250 });
  });

  it("baseRange interpolates to the next tier at the boundary", () => {
    // at exactly 10000 (start of tier 2), t=0 -> tier-2 floors
    const base = baseRange("instagram", 10000);
    assert.deepEqual(base, { low: 250, high: 1000 });
  });

  it("tier tables are ordered and non-overlapping per platform", () => {
    for (const platform of Object.keys(ESTIMATE_TIER_BANDS) as (keyof typeof ESTIMATE_TIER_BANDS)[]) {
      const tiers = ESTIMATE_TIER_BANDS[platform];
      for (let i = 1; i < tiers.length; i++) {
        assert.equal(tiers[i].minFollowers, tiers[i - 1].maxFollowers, `${platform} tier ${i}`);
        assert.ok(tiers[i].low >= tiers[i - 1].low);
      }
    }
  });

  it("invalid platform is a validation error", () => {
    const r = runTool({ platform: "facebook", followerCount: 10000, engagementRate: 3, contentFormat: "post" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /platform/i);
  });

  it("missing platform is a validation error", () => {
    const r = runTool({ followerCount: 10000, engagementRate: 3, contentFormat: "post" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /platform/i);
  });

  it("followerCount 0 / negative / non-numeric are validation errors", () => {
    for (const v of [0, -100, "abc", undefined]) {
      const r = runTool({ platform: "instagram", followerCount: v, engagementRate: 3, contentFormat: "post" });
      assert.equal(r.ok, false, `followerCount=${String(v)}`);
      assert.match(r.error!, /Follower count/);
    }
  });

  it("engagementRate 0 / negative / missing are validation errors", () => {
    for (const v of [0, -2, undefined]) {
      const r = runTool({ platform: "instagram", followerCount: 10000, engagementRate: v, contentFormat: "post" });
      assert.equal(r.ok, false, `engagementRate=${String(v)}`);
      assert.match(r.error!, /Engagement rate/);
    }
  });

  it("invalid / missing content format is a validation error", () => {
    const r1 = runTool({ platform: "instagram", followerCount: 10000, engagementRate: 3, contentFormat: "story" });
    assert.equal(r1.ok, false);
    assert.match(r1.error!, /content format/i);
    const r2 = runTool({ platform: "instagram", followerCount: 10000, engagementRate: 3 });
    assert.equal(r2.ok, false);
    assert.match(r2.error!, /content format/i);
  });

  it("string numbers are accepted (form inputs arrive as strings)", () => {
    const r = runTool({ platform: "tiktok", followerCount: "30000", engagementRate: "5.0", contentFormat: "video" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.lowRate, 750);
    assert.equal(r.values!.highRate, 3600);
  });

  it("basis labels the result as a market estimate, not a guarantee", () => {
    const r = runTool({ platform: "youtube", followerCount: 60000, engagementRate: 3, contentFormat: "video" });
    assert.equal(r.ok, true);
    assert.match(r.values!.basis as string, /estimate/i);
    assert.match(r.values!.basis as string, /not guaranteed/i);
  });

  it("determinism: identical inputs give identical outputs", () => {
    const v = { platform: "instagram", followerCount: 123456, engagementRate: 4.2, contentFormat: "reel" };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ platform: "tiktok", followerCount: 10000, engagementRate: 4, contentFormat: "post" });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });
});
