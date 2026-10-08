import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, STOP_WORDS } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  assert.deepEqual(Object.keys(r.values).sort(), OUTPUT_IDS);
  return r.values;
}

describe("slug-stop-word-remover", () => {
  it("happy path: removes stop words from a title", () => {
    const v = okValues({ titleOrSlug: "The Ultimate Guide to Making Money Online" });
    assert.equal(v["cleanSlug"], "ultimate-guide-making-money-online");
    assert.deepEqual(v["removedWords"], ["the", "to"]);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ titleOrSlug: "hello world" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), OUTPUT_IDS);
  });

  it("handles an already-hyphenated slug", () => {
    const v = okValues({ titleOrSlug: "the-best-way-to-save-money" });
    assert.equal(v["cleanSlug"], "best-way-save-money");
    assert.deepEqual(v["removedWords"], ["the", "to"]);
  });

  it("keepWords (string) protects listed stop words", () => {
    const v = okValues({ titleOrSlug: "The Best of the Best", keepWords: "the" });
    assert.equal(v["cleanSlug"], "the-best-the-best");
    assert.deepEqual(v["removedWords"], ["of"]);
  });

  it("keepWords (array) protects listed stop words", () => {
    const v = okValues({ titleOrSlug: "To Be or Not to Be", keepWords: ["to", "be"] });
    assert.equal(v["cleanSlug"], "to-be-to-be");
    assert.deepEqual(v["removedWords"], ["or", "not"]);
  });

  it("all stop words: keeps the first word so the slug is never empty", () => {
    const v = okValues({ titleOrSlug: "The And Of" });
    assert.equal(v["cleanSlug"], "the");
    assert.deepEqual(v["removedWords"], ["and", "of"]);
  });

  it("validation: empty input errors", () => {
    const r = runTool({ titleOrSlug: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /title or slug/i);
  });

  it("validation: input longer than 200 chars errors", () => {
    const r = runTool({ titleOrSlug: "a".repeat(201) });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /200/);
  });

  it("validation: input with no words errors", () => {
    const r = runTool({ titleOrSlug: "!!! ??? ---" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /no words/i);
  });

  it("unicode words pass through untouched", () => {
    const v = okValues({ titleOrSlug: "The café guide to SEO" });
    assert.equal(v["cleanSlug"], "café-guide-seo");
    assert.deepEqual(v["removedWords"], ["the", "to"]);
  });

  it("apostrophes are stripped before lookup (don't -> dont)", () => {
    const v = okValues({ titleOrSlug: "Why You Don't Need a Degree" });
    assert.equal(v["cleanSlug"], "need-degree");
    assert.deepEqual(v["removedWords"], ["why", "you", "dont", "a"]);
  });

  it("numbers are kept", () => {
    const v = okValues({ titleOrSlug: "Top 10 Tips for 2024" });
    assert.equal(v["cleanSlug"], "top-10-tips-2024");
  });

  it("no stop words present: slug is the normalized input", () => {
    const v = okValues({ titleOrSlug: "Blue Widget Review" });
    assert.equal(v["cleanSlug"], "blue-widget-review");
    assert.deepEqual(v["removedWords"], []);
  });

  it("removedWords preserves order of appearance", () => {
    const v = okValues({ titleOrSlug: "A Tale of Two Cities and a Dream" });
    assert.deepEqual(v["removedWords"], ["a", "of", "and", "a"]);
  });

  it("keepWords multi-word entries are split into words", () => {
    const v = okValues({ titleOrSlug: "In and Out", keepWords: "in out" });
    assert.equal(v["cleanSlug"], "in-out");
    assert.deepEqual(v["removedWords"], ["and"]);
  });

  it("determinism: same inputs produce identical results", () => {
    const input = { titleOrSlug: "The Quick Brown Fox Jumps Over the Lazy Dog", keepWords: "the" };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });

  it("word-bank bounds: 150+ words, no duplicates, all lowercase", () => {
    assert.ok(STOP_WORDS.length >= 150, `bank has ${STOP_WORDS.length} words`);
    assert.equal(new Set(STOP_WORDS).size, STOP_WORDS.length);
    for (const w of STOP_WORDS) {
      assert.ok(w.length > 0);
      assert.equal(w, w.toLowerCase());
    }
    // Common stop words every SEO list should include.
    for (const w of ["the", "a", "an", "and", "or", "of", "to", "in", "for", "with"]) {
      assert.ok(STOP_WORDS.includes(w), `missing ${w}`);
    }
  });
});
