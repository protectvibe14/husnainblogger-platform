import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildCaption,
  TIKTOK_CAPTION_LIMIT,
  MIN_BANK_SIZE,
  MAX_BANK_SIZE,
  DEFAULT_BANK_SIZE,
  MAX_SEED_LENGTH,
  SPIN_SLOT,
  POV_OPENERS,
  SCENARIO_TEMPLATES,
  EMOTIONS,
  HASHTAG_SETS,
  TONE_KEYS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["captions", "count", "trimmedCount"];

function okValues(items: Record<string, unknown>[]): Record<string, unknown> {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

const SEED_ITEM = { seed: "monday gym grind", niche: "fitness", tone: "funny", bankSize: 10 };

describe("tiktok-pov-caption-bank-builder", () => {
  it("happy path: one item builds bankSize captions", () => {
    const v = okValues([SEED_ITEM]);
    const captions = v.captions as string[];
    assert.equal(captions.length, 10);
    assert.equal(v.count, 10);
    assert.equal(v.trimmedCount, 0);
    assert.ok(captions[0].includes("monday gym grind"));
    assert.ok(captions[0].includes(SPIN_SLOT));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues([SEED_ITEM]);
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual(metaIds, [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("default bank size is 10 when bankSize omitted", () => {
    const v = okValues([{ seed: "exam week" }]);
    assert.equal(v.count, DEFAULT_BANK_SIZE);
  });

  it("empty items array errors", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /empty/i);
  });

  it("missing items errors", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("missing seed errors with item number", () => {
    const r = runTool({ items: [{}] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1/);
    assert.match(r.error!, /Seed/i);
  });

  it("blank seed errors", () => {
    const r = runTool({ items: [{ seed: "   " }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1/);
  });

  it("second bad item reports Item 2", () => {
    const r = runTool({ items: [SEED_ITEM, { seed: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("seed over the length limit errors", () => {
    const r = runTool({ items: [{ seed: "x".repeat(MAX_SEED_LENGTH + 1) }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /too long/);
  });

  it("bankSize below 5 errors", () => {
    const r = runTool({ items: [{ seed: "a", bankSize: 4 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*[Bb]ank size/);
  });

  it("bankSize above 50 errors", () => {
    const r = runTool({ items: [{ seed: "a", bankSize: 51 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1/);
  });

  it("non-numeric bankSize errors", () => {
    const r = runTool({ items: [{ seed: "a", bankSize: "lots" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1/);
  });

  it("numeric-string bankSize is accepted", () => {
    const v = okValues([{ seed: "a", bankSize: "7" }]);
    assert.equal(v.count, 7);
  });

  it("unknown tone falls back to generic banks (no error)", () => {
    const v = okValues([{ seed: "road trip", tone: "existential" }]);
    assert.equal(v.count, DEFAULT_BANK_SIZE);
    assert.ok((v.captions as string[])[0].includes("road trip"));
  });

  it("unknown niche falls back to generic tag sets (no error)", () => {
    const v = okValues([{ seed: "road trip", niche: "quantum baking" }]);
    assert.equal(v.count, DEFAULT_BANK_SIZE);
  });

  it("known tones use their own tag sets", () => {
    for (const tone of TONE_KEYS) {
      const v = okValues([{ seed: "s", tone, bankSize: 5 }]);
      assert.equal(v.count, 5);
    }
  });

  it("buildCaption trims hashtags first when the limit would be exceeded", () => {
    // Direct unit test with a synthetic long seed (bypasses runTool's seed cap):
    // hashtags must be dropped before the caption body is touched.
    const longSeed = "x".repeat(2150);
    const { caption, trimmed } = buildCaption(longSeed, "funny", "salt1");
    assert.ok([...caption].length <= TIKTOK_CAPTION_LIMIT);
    assert.equal(trimmed, true);
    assert.ok(caption.includes(longSeed.slice(0, 100)), "body seed preserved");
  });

  it("buildCaption hard-caps a body that alone exceeds the limit", () => {
    const hugeSeed = "y".repeat(2300);
    const { caption, trimmed } = buildCaption(hugeSeed, "funny", "salt2");
    assert.ok([...caption].length <= TIKTOK_CAPTION_LIMIT);
    assert.equal(trimmed, true);
  });

  it("every caption stays within the 2200-char limit", () => {
    const v = okValues([
      { seed: "x".repeat(500), tone: "funny", bankSize: 5 },
      { seed: "normal seed", tone: "warm", bankSize: 5 },
    ]);
    for (const c of v.captions as string[]) {
      assert.ok([...c].length <= TIKTOK_CAPTION_LIMIT, `over limit: ${[...c].length}`);
    }
  });

  it("max-length seed through runTool needs no trimming and fits", () => {
    const v = okValues([{ seed: "x".repeat(MAX_SEED_LENGTH), tone: "funny", bankSize: 5 }]);
    for (const c of v.captions as string[]) {
      assert.ok([...c].length <= TIKTOK_CAPTION_LIMIT);
    }
  });

  it("every caption has the [YOUR SPIN] placeholder slot", () => {
    const v = okValues([{ seed: "s", bankSize: 8 }]);
    for (const c of v.captions as string[]) {
      assert.ok(c.includes(SPIN_SLOT), `missing slot: ${c}`);
    }
  });

  it("word-bank sizes match the documented contract", () => {
    assert.equal(POV_OPENERS.length, 10);
    assert.equal(SCENARIO_TEMPLATES.length, 12);
    assert.equal(EMOTIONS.length, 10);
    assert.equal(Object.keys(HASHTAG_SETS).length, 5);
    for (const k of Object.keys(HASHTAG_SETS)) {
      assert.equal(HASHTAG_SETS[k].length, 3, `tag sets for ${k}`);
      for (const set of HASHTAG_SETS[k]) {
        assert.ok(set.length >= 3 && set.length <= 5, `set size for ${k}`);
      }
    }
    assert.equal(TONE_KEYS.length, 4);
  });

  it("banks contain no empty entries", () => {
    for (const b of POV_OPENERS) assert.ok(b.trim().length > 0);
    for (const b of SCENARIO_TEMPLATES) {
      assert.ok(b.includes("[SEED]"), `scenario missing [SEED]: ${b}`);
    }
    for (const b of EMOTIONS) assert.ok(b.trim().length > 0);
  });

  it("multiple items each build their own bank", () => {
    const v = okValues([
      { seed: "gym", bankSize: 5 },
      { seed: "study", bankSize: 6 },
    ]);
    assert.equal(v.count, 11);
    const captions = v.captions as string[];
    assert.ok(captions.some((c) => c.includes("gym")));
    assert.ok(captions.some((c) => c.includes("study")));
  });

  it("captions vary within a bank (rotation, not one template)", () => {
    const v = okValues([{ seed: "gym", bankSize: 20 }]);
    const unique = new Set(v.captions as string[]);
    assert.ok(unique.size > 5, `expected variety, got ${unique.size} unique`);
  });

  it("determinism: same items -> identical captions", () => {
    const items = [{ seed: "gym", tone: "sassy", bankSize: 12 }];
    const a = okValues(items);
    const b = okValues(items);
    assert.deepEqual(a, b);
  });

  it("different seeds produce different banks", () => {
    const a = okValues([{ seed: "gym", bankSize: 10 }]);
    const b = okValues([{ seed: "study", bankSize: 10 }]);
    assert.notDeepEqual(a.captions, b.captions);
  });

  it("constants match the spec contract", () => {
    assert.equal(TIKTOK_CAPTION_LIMIT, 2200);
    assert.equal(MIN_BANK_SIZE, 5);
    assert.equal(MAX_BANK_SIZE, 50);
  });
});
