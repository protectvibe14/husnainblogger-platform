/**
 * Tests for the Podcast Sponsorship Rate Calculator (tool-082).
 *
 * Run: node --test app/tools/make-money/podcast-sponsorship-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the CPM bands in logic.ts,
 * never copied from tool output. CPM bands are labeled estimates; tests
 * assert the math and honesty labels, not "real" market rates.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculatePodcastRate,
  runTool,
  roundMoney,
  CPM_BANDS,
  CPM_FLOOR_DOWNLOADS,
  FLAT_FEE_LOW,
  FLAT_FEE_HIGH,
} from "./logic.ts";

const OUTPUT_IDS = [
  "ratePerEpisodeLow",
  "ratePerEpisodeHigh",
  "monthlyValueLow",
  "monthlyValueHigh",
  "currency",
  "flatFeeGuidance",
  "note",
];

describe("roundMoney", () => {
  it("rounds half-up to 2 decimals", () => {
    // 10 * 18 = 180.0 ; 2.345 -> 2.35.
    assert.strictEqual(roundMoney(2.345), 2.35);
    assert.strictEqual(roundMoney(2.344), 2.34);
    assert.strictEqual(roundMoney(180), 180);
  });
});

describe("calculatePodcastRate — happy paths", () => {
  it("mid-roll 60s: $24–$26 CPM math", () => {
    // 10,000 downloads -> 10k; low=10*24=240; high=10*26=260;
    // episodes=4 -> monthly 960–1040.
    const r = calculatePodcastRate({ downloadsPerEpisode: 10000, adFormat: "mid_roll_60", episodesPerMonth: 4 });
    assert.strictEqual(r.ratePerEpisodeLow, 240);
    assert.strictEqual(r.ratePerEpisodeHigh, 260);
    assert.strictEqual(r.monthlyValueLow, 960);
    assert.strictEqual(r.monthlyValueHigh, 1040);
    assert.strictEqual(r.currency, "USD");
    assert.strictEqual(r.flatFeeGuidance, false);
  });

  it("pre-roll 30s: $18–$22 CPM math", () => {
    // 5,000 downloads -> 5k; low=5*18=90; high=5*22=110; episodes=2 -> 180–220.
    const r = calculatePodcastRate({ downloadsPerEpisode: 5000, adFormat: "pre_roll_30", episodesPerMonth: 2 });
    assert.strictEqual(r.ratePerEpisodeLow, 90);
    assert.strictEqual(r.ratePerEpisodeHigh, 110);
    assert.strictEqual(r.monthlyValueLow, 180);
    assert.strictEqual(r.monthlyValueHigh, 220);
  });

  it("post-roll uses the 30s benchmark band ($18–$22)", () => {
    // 2,000 downloads -> 2k; low=2*18=36; high=2*22=44; episodes=1 -> 36–44.
    const r = calculatePodcastRate({ downloadsPerEpisode: 2000, adFormat: "post_roll", episodesPerMonth: 1 });
    assert.strictEqual(r.ratePerEpisodeLow, 36);
    assert.strictEqual(r.ratePerEpisodeHigh, 44);
    assert.strictEqual(r.monthlyValueLow, 36);
    assert.strictEqual(r.monthlyValueHigh, 44);
  });

  it("exactly 1,000 downloads still uses CPM math (floor is exclusive)", () => {
    // 1k downloads -> 1k; mid-roll 24–26 -> 24–26; episodes=1.
    const r = calculatePodcastRate({ downloadsPerEpisode: 1000, adFormat: "mid_roll_60", episodesPerMonth: 1 });
    assert.strictEqual(r.flatFeeGuidance, false);
    assert.strictEqual(r.ratePerEpisodeLow, 24);
    assert.strictEqual(r.ratePerEpisodeHigh, 26);
  });

  it("under 1,000 downloads -> flat-fee guidance $300–$500/ep", () => {
    // 500 downloads, 4 eps -> per-ep 300–500; monthly 1200–2000.
    const r = calculatePodcastRate({ downloadsPerEpisode: 500, adFormat: "mid_roll_60", episodesPerMonth: 4 });
    assert.strictEqual(r.flatFeeGuidance, true);
    assert.strictEqual(r.ratePerEpisodeLow, FLAT_FEE_LOW);
    assert.strictEqual(r.ratePerEpisodeHigh, FLAT_FEE_HIGH);
    assert.strictEqual(r.monthlyValueLow, 1200);
    assert.strictEqual(r.monthlyValueHigh, 2000);
    assert.ok(r.note.includes("flat-fee"), "note must name the flat-fee fallback");
  });

  it("rounds fractional CPM results to cents", () => {
    // 12,345 downloads -> 12.345k; mid-roll low=12.345*24=296.28; high=12.345*26=320.97.
    const r = calculatePodcastRate({ downloadsPerEpisode: 12345, adFormat: "mid_roll_60", episodesPerMonth: 1 });
    assert.strictEqual(r.ratePerEpisodeLow, 296.28);
    assert.strictEqual(r.ratePerEpisodeHigh, 320.97);
  });

  it("labels estimates in the note", () => {
    const r = calculatePodcastRate({ downloadsPerEpisode: 8000, adFormat: "pre_roll_30", episodesPerMonth: 4 });
    assert.ok(r.note.includes("estimate"), "note must say estimate");
    assert.ok(r.note.includes("$18–$22 CPM"), "note must cite the band");
    assert.ok(r.note.includes("vary by niche"), "note must cite variance");
  });

  it("exposes the documented CPM constants", () => {
    assert.deepStrictEqual([CPM_BANDS.mid_roll_60.low, CPM_BANDS.mid_roll_60.high], [24, 26]);
    assert.deepStrictEqual([CPM_BANDS.pre_roll_30.low, CPM_BANDS.pre_roll_30.high], [18, 22]);
    assert.deepStrictEqual([CPM_BANDS.post_roll.low, CPM_BANDS.post_roll.high], [18, 22]);
    assert.strictEqual(CPM_FLOOR_DOWNLOADS, 1000);
    assert.deepStrictEqual([FLAT_FEE_LOW, FLAT_FEE_HIGH], [300, 500]);
  });
});

describe("calculatePodcastRate — invalid input", () => {
  it("rejects zero / negative downloads", () => {
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: 0, adFormat: "pre_roll_30", episodesPerMonth: 4 }), RangeError);
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: -100, adFormat: "pre_roll_30", episodesPerMonth: 4 }), RangeError);
  });

  it("rejects non-numeric downloads", () => {
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: NaN, adFormat: "pre_roll_30", episodesPerMonth: 4 }), TypeError);
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: "5000" as unknown as number, adFormat: "pre_roll_30", episodesPerMonth: 4 }), TypeError);
  });

  it("rejects non-integer or non-positive episodes per month", () => {
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: 5000, adFormat: "pre_roll_30", episodesPerMonth: 2.5 }), RangeError);
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: 5000, adFormat: "pre_roll_30", episodesPerMonth: 0 }), RangeError);
    assert.throws(() => calculatePodcastRate({ downloadsPerEpisode: 5000, adFormat: "pre_roll_30", episodesPerMonth: -2 }), RangeError);
  });

  it("rejects an unknown ad format", () => {
    assert.throws(
      () => calculatePodcastRate({ downloadsPerEpisode: 5000, adFormat: "video" as never, episodesPerMonth: 4 }),
      TypeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => calculatePodcastRate(null as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("computes per-episode and monthly ranges", () => {
    // 10k downloads, pre-roll 30s, 4 eps: per-ep 180–220; monthly 720–880.
    const r = runTool({ downloadsPerEpisode: 10000, adFormat: "pre_roll_30", episodesPerMonth: 4 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values?.["ratePerEpisodeLow"], 180);
    assert.strictEqual(r.values?.["ratePerEpisodeHigh"], 220);
    assert.strictEqual(r.values?.["monthlyValueLow"], 720);
    assert.strictEqual(r.values?.["monthlyValueHigh"], 880);
    assert.strictEqual(r.values?.["flatFeeGuidance"], false);
  });

  it("flags flat-fee guidance through the adapter", () => {
    const r = runTool({ downloadsPerEpisode: 400, adFormat: "pre_roll_30", episodesPerMonth: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values?.["flatFeeGuidance"], true);
    assert.strictEqual(r.values?.["ratePerEpisodeLow"], 300);
  });

  it("errors on invalid inputs with human messages", () => {
    assert.strictEqual(runTool({}).ok, false);
    assert.ok((runTool({}).error ?? "").length > 0);
    assert.strictEqual(runTool({ downloadsPerEpisode: 0, adFormat: "pre_roll_30", episodesPerMonth: 4 }).ok, false);
    assert.strictEqual(runTool({ downloadsPerEpisode: 5000, adFormat: "banner", episodesPerMonth: 4 }).ok, false);
    assert.strictEqual(runTool({ downloadsPerEpisode: 5000, adFormat: "pre_roll_30", episodesPerMonth: 1.5 }).ok, false);
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });

  it("returns exactly the meta.ts output ids", () => {
    const r = runTool({ downloadsPerEpisode: 6000, adFormat: "mid_roll_60", episodesPerMonth: 3 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values ?? {}).sort(), [...OUTPUT_IDS].sort());
  });

  it("is deterministic: two runs give identical results", () => {
    const a = runTool({ downloadsPerEpisode: 7500, adFormat: "mid_roll_60", episodesPerMonth: 2 });
    const b = runTool({ downloadsPerEpisode: 7500, adFormat: "mid_roll_60", episodesPerMonth: 2 });
    assert.deepStrictEqual(a, b);
  });
});
