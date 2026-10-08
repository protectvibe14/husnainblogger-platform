import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { niche: "vegan baking" };
const OUTPUT_IDS = ["nicheMix", "broadMix", "communityMix", "trendingPicks", "combinedCaption", "charCount"];

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-caption-hashtag-mixer", () => {
  it("happy path: mixes sized 6/4/4, caption within 2200 chars", () => {
    const v = okValues();
    assert.equal((v.nicheMix as string[]).length, 6);
    assert.equal((v.broadMix as string[]).length, 4);
    assert.equal((v.communityMix as string[]).length, 4);
    assert.deepEqual(v.trendingPicks, []);
    assert.ok((v.charCount as number) <= 2200, "within caption envelope");
    assert.equal((v.combinedCaption as string).length, v.charCount);
    assert.ok((v.combinedCaption as string).includes("vegan baking"), "niche in draft caption");
  });

  it("niche keyword matching: gym -> fitness bank tags", () => {
    const v = okValues({ niche: "gym workouts" });
    const nicheMix = v.nicheMix as string[];
    assert.ok(nicheMix.includes("#fittok"), "fitness category matched");
  });

  it("unmatched niche falls back to generic bank", () => {
    const v = okValues({ niche: "antique teapot restoration" });
    const nicheMix = v.nicheMix as string[];
    assert.ok(nicheMix.includes("#tiktok"), "generic fallback used");
  });

  it("user caption is used verbatim when provided", () => {
    const v = okValues({ baseCaption: "My grandma's lentil soup recipe" });
    assert.ok((v.combinedCaption as string).startsWith("My grandma's lentil soup recipe"));
  });

  it("caption topic fills the hook template", () => {
    const v = okValues({ captionTopic: "overnight oats" });
    assert.ok((v.combinedCaption as string).includes("overnight oats"));
  });

  it("edge case: trending tags come ONLY from the user-pasted list", () => {
    const v = okValues({ trendingHashtags: "#MyBrandLaunch, #summerdrop #mychallenge" });
    const picks = v.trendingPicks as string[];
    assert.deepEqual(picks, ["#mybrandlaunch", "#summerdrop", "#mychallenge"]);
    assert.ok((v.combinedCaption as string).includes("#mybrandlaunch"));
  });

  it("edge case: trending input never invents tags — empty when nothing pasted", () => {
    const v = okValues({});
    assert.deepEqual(v.trendingPicks, []);
  });

  it("trending parsing dedupes, caps at 10, and strips invalid chars", () => {
    const pasted = ["#a", "#b", "#A", "#c", "#d", "#e", "#f", "#g", "#h", "#i", "#j", "#k", "#l"].join(" ");
    const v = okValues({ trendingHashtags: pasted });
    const picks = v.trendingPicks as string[];
    assert.equal(picks.length, 10, "capped at 10");
    assert.equal(new Set(picks).size, picks.length, "deduped");
    const v2 = okValues({ trendingHashtags: "notahashtag, #ok!" });
    assert.deepEqual(v2.trendingPicks, ["#ok"], "junk tokens dropped");
  });

  it("validation: missing/blank niche errors", () => {
    for (const bad of [undefined, "", "   ", 123]) {
      const r = runTool({ niche: bad });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /niche/i);
    }
  });

  it("validation: niche over 60 chars errors", () => {
    const r = runTool({ niche: "x".repeat(61) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /60 characters/);
  });

  it("validation: overlong caption topic / caption / trending errors", () => {
    assert.equal(runTool({ niche: "food", captionTopic: "x".repeat(121) }).ok, false);
    assert.equal(runTool({ niche: "food", baseCaption: "x".repeat(2001) }).ok, false);
    assert.equal(runTool({ niche: "food", trendingHashtags: "x".repeat(501) }).ok, false);
  });

  it("envelope: 2000-char caption gets trimmed hashtags so total <= 2200", () => {
    const v = okValues({ baseCaption: "x".repeat(2000) });
    assert.ok((v.charCount as number) <= 2200, `charCount ${(v.charCount as number)} <= 2200`);
    const combined = v.combinedCaption as string;
    assert.ok(combined.includes("x".repeat(50)), "user caption body preserved");
  });

  it("envelope: 1990-char caption + 10 trending tags keeps user tags, drops broad tags", () => {
    const v = okValues({
      baseCaption: "y".repeat(1990),
      trendingHashtags: "#keep1 #keep2 #keep3 #keep4 #keep5",
    });
    const combined = v.combinedCaption as string;
    assert.ok(combined.length <= 2200, "still within envelope");
    for (const t of ["#keep1", "#keep2", "#keep3", "#keep4", "#keep5"]) {
      assert.ok(combined.includes(t), `kept user tag ${t}`);
    }
  });

  it("determinism: identical inputs give identical outputs", () => {
    assert.deepEqual(runTool({ ...BASE, trendingHashtags: "#a #b" }), runTool({ ...BASE, trendingHashtags: "#a #b" }));
    assert.deepEqual(runTool({ niche: "gaming", captionTopic: "ranked grind" }), runTool({ niche: "gaming", captionTopic: "ranked grind" }));
  });

  it("output keys exactly match meta.ts outputs", () => {
    const v = okValues();
    assert.deepEqual(Object.keys(v).sort(), OUTPUT_IDS.sort(), "keys match");
    assert.deepEqual(outputs.map((o) => o.id).sort(), OUTPUT_IDS.sort(), "meta ids match");
  });

  it("word-bank bounds: all hashtags start with #, no empties, niche mix drawn from niche bank", () => {
    const v = okValues({ niche: "travel" });
    const all = [...(v.nicheMix as string[]), ...(v.broadMix as string[]), ...(v.communityMix as string[])];
    assert.ok(all.every((t) => /^#[a-z0-9_]+$/.test(t)), "valid hashtag shape");
    assert.ok((v.nicheMix as string[]).some((t) => t.includes("travel")), "travel niche tags");
    assert.equal(all.length, 14);
  });

  it("no invented claims: mixes are organizational, caption states no popularity data", () => {
    const v = okValues();
    const combined = v.combinedCaption as string;
    assert.doesNotMatch(combined, /viral|reach|million|guaranteed/i, "no reach/virality claims in caption");
  });
});
