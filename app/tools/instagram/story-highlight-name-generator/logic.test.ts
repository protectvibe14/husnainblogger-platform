import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateHighlightNames,
  HIGHLIGHT_TONES,
  BANK_SIZES,
  MIN_COUNT,
  MAX_COUNT,
  LONG_NAME_CHARS,
} from "./logic.ts";

describe("story-highlight-name-generator", () => {
  it("happy path: 5 playful names for a niche", () => {
    const r = runTool({ niche: "fitness", tone: "playful", count: 5 });
    assert.equal(r.ok, true);
    const names = r.values!.names as string[];
    assert.equal(names.length, 5);
    for (const n of names) assert.match(n, /fitness/);
    assert.equal(new Set(names).size, 5); // no repeats
  });

  it("output ids are names and note", () => {
    const r = runTool({ niche: "travel", tone: "minimal", count: 3 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["names", "note"]);
  });

  it("every tone pool holds 24 patterns (>= max count 20)", () => {
    assert.equal(BANK_SIZES.poolPerTone, 24);
    for (const tone of HIGHLIGHT_TONES) {
      const r = generateHighlightNames("x", tone, MAX_COUNT);
      assert.equal(r.names.length, MAX_COUNT);
      assert.equal(new Set(r.names).size, MAX_COUNT, `dupes in ${tone}`);
    }
  });

  it("count = 20 works, count = 1 works", () => {
    assert.equal((runTool({ niche: "food", tone: "bold", count: 20 }).values!.names as string[]).length, 20);
    assert.equal((runTool({ niche: "food", tone: "bold", count: 1 }).values!.names as string[]).length, 1);
  });

  it("missing niche -> error", () => {
    const r = runTool({ tone: "playful", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Niche is required/);
  });

  it("blank niche -> error", () => {
    const r = runTool({ niche: "   ", tone: "playful", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /required/);
  });

  it("count 0 -> error", () => {
    const r = runTool({ niche: "fitness", tone: "playful", count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /1 to 20/);
  });

  it("count 21 -> error", () => {
    const r = runTool({ niche: "fitness", tone: "playful", count: 21 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /1 to 20/);
  });

  it("non-numeric count -> error", () => {
    const r = runTool({ niche: "fitness", tone: "playful", count: "lots" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("invalid tone -> error listing supported tones", () => {
    const r = runTool({ niche: "fitness", tone: "sarcastic", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /playful, professional, minimal, bold/);
  });

  it("missing tone defaults to playful", () => {
    const r = runTool({ niche: "fitness", count: 5 });
    assert.equal(r.ok, true);
    assert.match(r.values!.note as string, /playful tone/);
  });

  it("niche whitespace is normalized", () => {
    const r = generateHighlightNames("  fitness   coaching  ", "minimal", 2);
    assert.equal(r.niche, "fitness coaching");
  });

  it("long names over 15 chars are flagged in the note", () => {
    const r = runTool({ niche: "homemade sourdough baking", tone: "professional", count: 10 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.names as string[]).some((n) => n.length > LONG_NAME_CHARS));
    assert.match(r.values!.note as string, /exceed 15 characters/);
  });

  it("short niche produces no long-name warning", () => {
    const r = runTool({ niche: "dogs", tone: "playful", count: 5 });
    assert.equal(r.ok, true);
    assert.doesNotMatch(r.values!.note as string, /Heads up/);
  });

  it("deterministic: same inputs twice -> identical names", () => {
    const a = runTool({ niche: "fitness", tone: "bold", count: 8 });
    const b = runTool({ niche: "fitness", tone: "bold", count: 8 });
    assert.deepEqual(a, b);
  });

  it("different niches pick different offsets (usually different names)", () => {
    const a = generateHighlightNames("fitness", "playful", 12);
    const b = generateHighlightNames("gardening", "playful", 12);
    assert.notDeepEqual(a.names, b.names);
  });

  it("BANK_SIZES documents 48 patterns honestly", () => {
    assert.equal(BANK_SIZES.patterns, 48);
    assert.equal(BANK_SIZES.tones, 4);
  });

  it("constants match the spec bounds", () => {
    assert.equal(MIN_COUNT, 1);
    assert.equal(MAX_COUNT, 20);
    assert.deepEqual(HIGHLIGHT_TONES, ["playful", "professional", "minimal", "bold"]);
  });

  it("result always carries isTemplateBased: true", () => {
    const r = generateHighlightNames("fitness", "minimal", 3);
    assert.equal(r.isTemplateBased, true);
  });
});
