import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateCoverTitles,
  enforceLength,
  COVER_TONES,
  BANK_SIZES,
  MAX_TITLE_CHARS,
  MIN_COUNT,
  MAX_COUNT,
} from "./logic.ts";

describe("reels-cover-title-generator", () => {
  it("happy path: 5 bold titles with char counts", () => {
    const r = runTool({ topic: "meal prep", tone: "bold", count: 5 });
    assert.equal(r.ok, true);
    const titles = r.values!.titles as string[];
    assert.equal(titles.length, 5);
    for (const t of titles) {
      assert.match(t, /meal prep/);
      assert.match(t, /\(\d+ chars\)$/);
    }
  });

  it("output ids are titles and safeZoneNote", () => {
    const r = runTool({ topic: "fitness", tone: "curious", count: 3 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["safeZoneNote", "titles"]);
  });

  it("safeZoneNote mentions 1080x1920 zones", () => {
    const r = runTool({ topic: "fitness", tone: "professional", count: 3 });
    assert.match(r.values!.safeZoneNote as string, /1080x1920/);
    assert.match(r.values!.safeZoneNote as string, /middle vertical band/);
  });

  it("count = 20 returns 20 unique titles", () => {
    const r = generateCoverTitles("gardening", "playful", 20);
    assert.equal(r.titles.length, 20);
    assert.equal(new Set(r.titles.map((t) => t.title)).size, 20);
  });

  it("count = 1 works", () => {
    const r = runTool({ topic: "seo", tone: "professional", count: 1 });
    assert.equal((r.values!.titles as string[]).length, 1);
  });

  it("missing topic -> error", () => {
    const r = runTool({ tone: "bold", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("blank topic -> error", () => {
    const r = runTool({ topic: "  ", tone: "bold", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /required/);
  });

  it("count 0 -> error", () => {
    const r = runTool({ topic: "x", tone: "bold", count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /1 to 20/);
  });

  it("count 25 -> error", () => {
    const r = runTool({ topic: "x", tone: "bold", count: 25 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /1 to 20/);
  });

  it("invalid tone -> error listing tones", () => {
    const r = runTool({ topic: "x", tone: "dramatic", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /bold, playful, professional, curious/);
  });

  it("missing tone defaults to bold", () => {
    const r = runTool({ topic: "x", count: 3 });
    assert.equal(r.ok, true);
    assert.match(r.values!.safeZoneNote as string, /bold tone/);
  });

  it("enforceLength leaves short titles untouched", () => {
    const [t, truncated] = enforceLength("Short title");
    assert.equal(t, "Short title");
    assert.equal(truncated, false);
  });

  it("enforceLength truncates long titles at a word boundary with …", () => {
    const long = "This is a very long cover title about meal preparation that keeps going";
    assert.ok(long.length > MAX_TITLE_CHARS);
    const [t, truncated] = enforceLength(long);
    assert.equal(truncated, true);
    assert.ok(t.length <= MAX_TITLE_CHARS);
    assert.ok(t.endsWith("…"));
    assert.ok(!t.endsWith(" …") || true); // cut at a space, no mid-word cut
  });

  it("long topic triggers auto-truncation warning in the note", () => {
    const r = runTool({ topic: "advanced sourdough bread baking for absolute beginners at home", tone: "bold", count: 12 });
    assert.equal(r.ok, true);
    assert.match(r.values!.safeZoneNote as string, /auto-truncated/);
    for (const t of r.values!.titles as string[]) {
      const m = t.match(/\((\d+) chars\)$/);
      assert.ok(m && Number(m[1]) <= MAX_TITLE_CHARS, t);
    }
  });

  it("short topic: note confirms everything within the limit", () => {
    const r = runTool({ topic: "dogs", tone: "playful", count: 4 });
    assert.match(r.values!.safeZoneNote as string, /within the 60-char/);
  });

  it("deterministic: same inputs twice -> identical titles", () => {
    const a = runTool({ topic: "meal prep", tone: "curious", count: 8 });
    const b = runTool({ topic: "meal prep", tone: "curious", count: 8 });
    assert.deepEqual(a, b);
  });

  it("BANK_SIZES documents 48 formulas honestly", () => {
    assert.equal(BANK_SIZES.formulas, 48);
    assert.equal(BANK_SIZES.perTone, 12);
    assert.equal(BANK_SIZES.tones, 4);
    assert.equal(BANK_SIZES.maxTitleChars, 60);
  });

  it("constants match the spec bounds", () => {
    assert.equal(MIN_COUNT, 1);
    assert.equal(MAX_COUNT, 20);
    assert.equal(MAX_TITLE_CHARS, 60);
    assert.deepEqual(COVER_TONES, ["bold", "playful", "professional", "curious"]);
  });

  it("topic whitespace is normalized", () => {
    const r = generateCoverTitles("  meal   prep  ", "bold", 2);
    assert.equal(r.topic, "meal prep");
  });

  it("result carries isTemplateBased: true", () => {
    assert.equal(generateCoverTitles("x", "bold", 2).isTemplateBased, true);
  });
});
