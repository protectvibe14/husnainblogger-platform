import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const ITEMS = [
  { seriesTitle: "Tiny Kitchen Wins", episodeTopic: "5-minute mug cake" },
  { seriesTitle: "Tiny Kitchen Wins", episodeTopic: "one-pan pasta" },
  { seriesTitle: "Tiny Kitchen Wins", episodeTopic: "no-bake cheesecake" },
];
const OUTPUT_IDS = ["trailerScript", "teaseBeats", "montageCues", "subscribeCta", "episodeCount"];

function okValues(items: Record<string, unknown>[] = ITEMS) {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-series-trailer-script-builder", () => {
  it("happy path: script, beats per episode, 6 montage cues, CTA, count", () => {
    const v = okValues();
    const beats = v.teaseBeats as string[];
    assert.equal(beats.length, 3, "one beat per episode");
    assert.ok(beats.every((b) => !b.includes("{topic}") && !b.includes("{title}") && !b.includes("{n}")), "no unfilled placeholders");
    assert.equal((v.montageCues as string[]).length, 6);
    assert.equal(v.episodeCount, 3);
    assert.ok((v.trailerScript as string).includes("TINY KITCHEN WINS"), "series title in script");
    assert.ok((v.subscribeCta as string).includes("Tiny Kitchen Wins"));
    assert.ok((v.trailerScript as string).includes("5-minute mug cake"));
  });

  it("output keys exactly match meta.ts outputs", () => {
    const v = okValues();
    assert.deepEqual(Object.keys(v).sort(), OUTPUT_IDS.sort(), "keys match");
    assert.deepEqual(outputs.map((o) => o.id).sort(), OUTPUT_IDS.sort(), "meta ids match");
  });

  it("validation: no items / empty array errors", () => {
    for (const bad of [undefined, null, []]) {
      const r = runTool({ items: bad as never });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /2 to 20 episode items/);
    }
  });

  it("validation: fewer than 2 items errors", () => {
    const r = runTool({ items: [ITEMS[0]] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least 2 episodes/);
  });

  it("validation: more than 20 items errors", () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ seriesTitle: "S", episodeTopic: `topic ${i}` }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at most 20 episodes/);
  });

  it("validation: exactly 20 items passes", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ seriesTitle: "S", episodeTopic: `topic ${i}` }));
    const r = runTool({ items });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).episodeCount, 20);
  });

  it('item validation: "Item N:" messages for missing fields', () => {
    const r1 = runTool({ items: [ITEMS[0], { episodeTopic: "x" }] });
    assert.equal(r1.ok, false);
    assert.match(r1.error as string, /^Item 2: .*series title/i);

    const r2 = runTool({ items: [ITEMS[0], { seriesTitle: "S" }] });
    assert.equal(r2.ok, false);
    assert.match(r2.error as string, /^Item 2: .*episode topic/i);

    const r3 = runTool({ items: [{ seriesTitle: "", episodeTopic: "x" }, ITEMS[1]] });
    assert.equal(r3.ok, false);
    assert.match(r3.error as string, /^Item 1: .*series title/i);

    const r4 = runTool({ items: [ITEMS[0], null as never] });
    assert.equal(r4.ok, false);
    assert.match(r4.error as string, /^Item 2:/);
  });

  it("item validation: blank strings rejected", () => {
    const r = runTool({ items: [{ seriesTitle: "S", episodeTopic: "   " }, ITEMS[1]] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /^Item 1: .*episode topic/i);
  });

  it("item validation: overlong title/topic rejected with Item N label", () => {
    const r1 = runTool({ items: [{ seriesTitle: "x".repeat(81), episodeTopic: "t" }, ITEMS[1]] });
    assert.equal(r1.ok, false);
    assert.match(r1.error as string, /^Item 1:/);
    const r2 = runTool({ items: [{ seriesTitle: "S", episodeTopic: "x".repeat(121) }, ITEMS[1]] });
    assert.equal(r2.ok, false);
    assert.match(r2.error as string, /^Item 1:/);
  });

  it("edge case: spoiler-free default teases without revealing outcomes", () => {
    const v = okValues();
    const beats = v.teaseBeats as string[];
    assert.ok(beats.some((b) => /not spoiling|can't say more|watch until the end/i.test(b)), "mystery-style tease");
    assert.ok(!/dies|killed|wins \$|loses/.test(beats.join(" ")), "no invented outcomes");
  });

  it('edge case: allowSpoilers "yes" switches to payoff-promise wording', () => {
    const items = [
      { seriesTitle: "S", episodeTopic: "mug cake", allowSpoilers: "yes" },
      { seriesTitle: "S", episodeTopic: "pasta", allowSpoilers: "yes" },
    ];
    const v = okValues(items);
    const beats = v.teaseBeats as string[];
    assert.ok(beats.some((b) => /nothing held back|full result|no cliffhanger/i.test(b)), "payoff-style tease");
  });

  it('edge case: allowSpoilers "no"/blank keeps mystery teases', () => {
    const items = [
      { seriesTitle: "S", episodeTopic: "mug cake", allowSpoilers: "no" },
      { seriesTitle: "S", episodeTopic: "pasta" },
    ];
    const v = okValues(items);
    const beats = v.teaseBeats as string[];
    assert.ok(beats.every((b) => !/no cliffhanger|nothing held back/i.test(b)), "still mystery style");
  });

  it("episode order preserved in beats and script", () => {
    const v = okValues();
    const beats = v.teaseBeats as string[];
    assert.ok(beats[0].includes("5-minute mug cake"));
    assert.ok(beats[1].includes("one-pan pasta"));
    assert.ok(beats[2].includes("no-bake cheesecake"));
    const script = v.trailerScript as string;
    assert.ok(script.indexOf("mug cake") < script.indexOf("pasta"), "order preserved in script");
  });

  it("determinism: identical items give identical outputs", () => {
    assert.deepEqual(runTool({ items: ITEMS }), runTool({ items: ITEMS }));
  });

  it("trailer script structure: hook, beats, montage, CTA sections", () => {
    const script = okValues().trailerScript as string;
    assert.match(script, /HOOK/);
    assert.match(script, /TEASE BEATS/);
    assert.match(script, /MONTAGE CUES/);
    assert.match(script, /CTA/);
    assert.match(script, /Spoiler note/);
  });

  it("word-bank bounds: beats cycle through the 6-template banks deterministically", () => {
    const items = Array.from({ length: 7 }, (_, i) => ({ seriesTitle: "S", episodeTopic: `topic ${i}` }));
    const beats = okValues(items).teaseBeats as string[];
    assert.equal(beats.length, 7);
    assert.ok(new Set(beats).size >= 6, "uses distinct templates across episodes");
  });

  it("different series produce different scripts", () => {
    const a = okValues().trailerScript as string;
    const items = [
      { seriesTitle: "Garage Gym Diaries", episodeTopic: "deadlift day" },
      { seriesTitle: "Garage Gym Diaries", episodeTopic: "meal prep" },
    ];
    const b = okValues(items).trailerScript as string;
    assert.notEqual(a, b);
    assert.ok(b.includes("GARAGE GYM DIARIES"));
  });
});
