import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MIN_EPISODES,
  MAX_EPISODES,
  MAX_TITLE_LENGTH,
  MAX_NICHE_LENGTH,
  RECAP_EVERY,
  EPISODE_HOOKS,
  SETUP_BEATS,
  VALUE_BEATS,
  TWIST_BEATS,
  PAYOFF_BEATS,
  CTAS,
  RECAP_BEAT,
  FINALE_CTA,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["episodes", "arcSummary", "postingOrder"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-series-episode-planner", () => {
  it("happy path: 8 episodes with opener, twist, finale", () => {
    const v = okValues({
      seriesTitle: "30 Days of Sourdough",
      niche: "baking",
      episodeCount: 8,
    });
    const episodes = v.episodes as string[];
    assert.equal(episodes.length, 8);
    assert.ok(episodes[0].includes("OPENER"));
    assert.ok(episodes[6].includes("TWIST")); // episode 7 = N-1
    assert.ok(episodes[7].includes("FINALE"));
    assert.ok(episodes[0].includes("30 Days of Sourdough"));
    assert.ok((v.arcSummary as string).includes("8-episode arc"));
    assert.ok((v.postingOrder as string).includes("1 \u2192 8"));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ seriesTitle: "My Series", episodeCount: 5 });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual(metaIds, [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("missing title errors", () => {
    const r = runTool({ episodeCount: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title/i);
  });

  it("blank title errors", () => {
    const r = runTool({ seriesTitle: "  ", episodeCount: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title/i);
  });

  it("title over the length limit errors", () => {
    const r = runTool({ seriesTitle: "t".repeat(MAX_TITLE_LENGTH + 1), episodeCount: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /too long/);
  });

  it("missing episode count errors", () => {
    const r = runTool({ seriesTitle: "My Series" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /[Ee]pisode count/);
  });

  it("episode count 0 errors", () => {
    const r = runTool({ seriesTitle: "My Series", episodeCount: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 50/);
  });

  it("episode count 51 errors", () => {
    const r = runTool({ seriesTitle: "My Series", episodeCount: 51 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 50/);
  });

  it("non-numeric episode count errors", () => {
    const r = runTool({ seriesTitle: "My Series", episodeCount: "many" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /[Ee]pisode count/);
  });

  it("numeric-string episode count is accepted", () => {
    const v = okValues({ seriesTitle: "My Series", episodeCount: "6" });
    assert.equal((v.episodes as string[]).length, 6);
  });

  it("fractional count is floored", () => {
    const v = okValues({ seriesTitle: "My Series", episodeCount: 5.9 });
    assert.equal((v.episodes as string[]).length, 5);
  });

  it("niche too long errors", () => {
    const r = runTool({
      seriesTitle: "My Series",
      niche: "n".repeat(MAX_NICHE_LENGTH + 1),
      episodeCount: 5,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Niche/i);
  });

  it("single episode becomes a standalone plan", () => {
    const v = okValues({ seriesTitle: "One-Off", episodeCount: 1 });
    const episodes = v.episodes as string[];
    assert.equal(episodes.length, 1);
    assert.ok(episodes[0].includes("STANDALONE"));
    assert.match(v.arcSummary as string, /single-episode/);
  });

  it("two episodes: opener + finale, no twist", () => {
    const v = okValues({ seriesTitle: "Duo", episodeCount: 2 });
    const episodes = v.episodes as string[];
    assert.ok(episodes[0].includes("OPENER"));
    assert.ok(episodes[1].includes("FINALE"));
    assert.ok(!episodes.some((e) => e.includes("TWIST")));
  });

  it("every 5th episode is a recap with the Previously-on beat", () => {
    const v = okValues({ seriesTitle: "Long Run", episodeCount: 12 });
    const episodes = v.episodes as string[];
    const ep5 = episodes[4];
    const ep10 = episodes[9];
    assert.ok(ep5.includes("RECAP"), `ep5: ${ep5}`);
    assert.ok(ep10.includes("RECAP"), `ep10: ${ep10}`);
    assert.ok(ep5.includes("Previously on"));
    assert.ok(ep10.includes("Previously on"));
    assert.match(v.arcSummary as string, /entry point/);
    assert.equal(RECAP_EVERY, 5);
  });

  it("no unfilled slots remain in any episode", () => {
    const v = okValues({ seriesTitle: "Fixer Upper", niche: "DIY", episodeCount: 10 });
    const episodes = v.episodes as string[];
    for (const e of episodes) {
      for (const slot of ["[TITLE]", "[NICHE]", "[N]", "[NEXT]", "[N-1]"]) {
        assert.ok(!e.includes(slot), `unfilled ${slot} in: ${e}`);
      }
    }
    // the series title is referenced across the plan and in the summary
    assert.ok(episodes.some((e) => e.includes("Fixer Upper")));
    assert.ok((v.arcSummary as string).includes("Fixer Upper"));
  });

  it("finale CTA closes the series; others point to the next part", () => {
    const v = okValues({ seriesTitle: "S", episodeCount: 4 });
    const episodes = v.episodes as string[];
    assert.ok(episodes[3].includes("wraps here"));
    assert.ok(episodes[0].includes("part 2") || episodes[0].includes("Part 2") || /part 2/i.test(episodes[0]));
    assert.ok(!/part 5/i.test(episodes[3]));
  });

  it("arc summary always carries the long-form eligibility note", () => {
    const v = okValues({ seriesTitle: "S", episodeCount: 6 });
    assert.match(v.arcSummary as string, /600-second/);
    assert.match(v.arcSummary as string, /eligibility/i);
  });

  it("posting order numbers every caption part n/N", () => {
    const v = okValues({ seriesTitle: "S", episodeCount: 7 });
    assert.match(v.postingOrder as string, /Part n\/7/);
    assert.match(v.postingOrder as string, /Pin episode 1/);
  });

  it("word-bank sizes match the documented contract", () => {
    assert.equal(EPISODE_HOOKS.length, 10);
    assert.equal(SETUP_BEATS.length, 6);
    assert.equal(VALUE_BEATS.length, 10);
    assert.equal(TWIST_BEATS.length, 6);
    assert.equal(PAYOFF_BEATS.length, 4);
    assert.equal(CTAS.length, 6);
    assert.ok(RECAP_BEAT.includes("[TITLE]"));
    assert.ok(FINALE_CTA.includes("[NICHE]"));
  });

  it("determinism: same inputs -> identical plan", () => {
    const input = { seriesTitle: "30 Days of Sourdough", niche: "baking", episodeCount: 8 };
    const a = okValues(input);
    const b = okValues(input);
    assert.deepEqual(a, b);
  });

  it("different titles produce different plans", () => {
    const a = okValues({ seriesTitle: "Sourdough Days", episodeCount: 5 });
    const b = okValues({ seriesTitle: "Pasta Nights", episodeCount: 5 });
    assert.notDeepEqual(a.episodes, b.episodes);
  });

  it("empty niche is allowed and fills as 'your niche'", () => {
    const v = okValues({ seriesTitle: "S", episodeCount: 3 });
    for (const e of v.episodes as string[]) {
      assert.ok(!e.includes("[NICHE]"));
    }
  });

  it("constants match the spec contract", () => {
    assert.equal(MIN_EPISODES, 1);
    assert.equal(MAX_EPISODES, 50);
    assert.equal(MAX_TITLE_LENGTH, 120);
    assert.equal(MAX_NICHE_LENGTH, 60);
  });

  it("50-episode plan builds without error and recaps every 5th", () => {
    const v = okValues({ seriesTitle: "Mega", episodeCount: 50 });
    const episodes = v.episodes as string[];
    assert.equal(episodes.length, 50);
    const recaps = episodes.filter((e) => e.includes("RECAP"));
    assert.ok(recaps.length >= 8, `expected ~9 recaps, got ${recaps.length}`);
  });
});
