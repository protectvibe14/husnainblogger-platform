import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  generateConcepts,
  hashString,
  HOOK_BANK,
  ASSET_BANK,
  BEAT_BANK,
  CONCEPT_TITLES,
  BACKGROUND_TYPES,
  IDEA_COUNT,
  COPYRIGHT_NOTE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values as Record<string, unknown>;
}

test("output ids match meta.ts outputs", () => {
  const v = okValues({ niche: "fitness", backgroundType: "article" });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("validation: empty niche errors", () => {
  assert.strictEqual(
    runTool({ niche: "  ", backgroundType: "article" }).ok,
    false
  );
});

test("validation: missing niche errors", () => {
  assert.strictEqual(runTool({ backgroundType: "article" }).ok, false);
});

test("validation: non-string niche errors", () => {
  assert.strictEqual(runTool({ niche: 7, backgroundType: "article" }).ok, false);
});

test("validation: invalid backgroundType errors", () => {
  const res = runTool({ niche: "fitness", backgroundType: "video" });
  assert.strictEqual(res.ok, false);
  assert.ok(res.error && res.error.includes("article"));
});

test("validation: missing backgroundType errors", () => {
  assert.strictEqual(runTool({ niche: "fitness" }).ok, false);
});

test("error message is human-readable", () => {
  const res = runTool({ niche: "", backgroundType: "article" });
  assert.ok(res.error && res.error.length > 10);
});

test("happy path: returns exactly 5 concepts", () => {
  const v = okValues({ niche: "meal prep", backgroundType: "chart" });
  const concepts = v["concepts"] as string[];
  assert.strictEqual(concepts.length, 5);
});

test("happy path: niche appears in every concept", () => {
  const v = okValues({ niche: "meal prep", backgroundType: "map" });
  const concepts = v["concepts"] as string[];
  for (const c of concepts) {
    assert.ok(c.includes("meal prep"), c);
  }
});

test("happy path: each concept has hook, background, and 4 beats", () => {
  const v = okValues({ niche: "skincare", backgroundType: "screenshot" });
  const concepts = v["concepts"] as string[];
  for (const c of concepts) {
    assert.ok(c.includes("Hook:"), c);
    assert.ok(c.includes("Background:"), c);
    assert.ok(c.includes("Script beats:"), c);
    assert.strictEqual((c.match(/^  \d\./gm) || []).length, 4, c);
  }
});

test("happy path: all 4 background types work", () => {
  for (const t of BACKGROUND_TYPES) {
    const v = okValues({ niche: "travel", backgroundType: t });
    assert.strictEqual((v["concepts"] as string[]).length, 5);
  }
});

test("edge case: copyright note always present", () => {
  const v = okValues({ niche: "finance", backgroundType: "article" });
  assert.strictEqual(v["copyrightNote"], COPYRIGHT_NOTE);
  assert.ok(
    (v["copyrightNote"] as string).includes("licensed images")
  );
});

test("determinism: same input → identical output", () => {
  const input = { niche: "photography", backgroundType: "map" };
  assert.deepStrictEqual(runTool(input), runTool(input));
});

test("determinism: different niche → different offsets (usually)", () => {
  const a = generateConcepts("cats", "article");
  const b = generateConcepts("dogs", "article");
  assert.notDeepStrictEqual(a, b);
});

test("word-bank bounds: sizes as documented", () => {
  assert.strictEqual(HOOK_BANK.length, 10);
  assert.strictEqual(Object.keys(ASSET_BANK).length, 4);
  for (const k of Object.keys(ASSET_BANK)) {
    assert.strictEqual(ASSET_BANK[k].length, 2);
  }
  assert.strictEqual(BEAT_BANK.length, 6);
  assert.strictEqual(CONCEPT_TITLES.length, 5);
  assert.strictEqual(IDEA_COUNT, 5);
});

test("word-bank bounds: no empty picks", () => {
  for (const t of BACKGROUND_TYPES) {
    for (const c of generateConcepts("niche", t)) {
      assert.ok(c.hook.trim().length > 0);
      assert.ok(c.background.trim().length > 0);
      assert.ok(c.beats.every((b) => b.trim().length > 0));
    }
  }
});

test("hashString is deterministic and non-negative", () => {
  assert.strictEqual(hashString("abc"), hashString("abc"));
  assert.ok(hashString("abc") >= 0);
  assert.ok(hashString("") >= 0);
});

test("no unfilled template placeholders in output", () => {
  for (const t of BACKGROUND_TYPES) {
    const v = okValues({ niche: "gaming", backgroundType: t });
    for (const c of v["concepts"] as string[]) {
      assert.ok(!c.includes("{niche}"), c);
      assert.ok(!c.includes("{asset}"), c);
    }
  }
});

test("trims whitespace in niche", () => {
  const v = okValues({ niche: "  running  ", backgroundType: "chart" });
  for (const c of v["concepts"] as string[]) {
    assert.ok(c.includes("running"));
    assert.ok(!c.includes("  running  "));
  }
});
