import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MOODS, MIN_COUNT, MAX_COUNT, BANK_SIZES, TIP_NOTE } from "./logic.ts";

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const BASE = { niche: "fitness", mood: "Upbeat", count: 3 };

describe("reels-audio-search-term-finder", () => {
  it("happy path: returns the requested number of terms", () => {
    const v = okRun({ ...BASE });
    const terms = v.searchTerms as string[];
    assert.equal(terms.length, 3);
    for (const t of terms) assert.ok(t.length > 0);
  });

  it("returns exactly the meta output ids", () => {
    const v = okRun({ ...BASE });
    assert.deepEqual(Object.keys(v).sort(), ["searchTerms", "tipNote"]);
  });

  it("every term names the mood; niche-bearing templates name the niche", () => {
    const v = okRun({ ...BASE, mood: "Dramatic", count: 5 });
    const terms = v.searchTerms as string[];
    assert.equal(terms.length, 5);
    for (const t of terms) assert.ok(t.includes("dramatic"), t);
    assert.ok(terms.some((t) => t.includes("fitness")));
  });

  it(`count ${MIN_COUNT} gives one term, count ${MAX_COUNT} gives ten terms`, () => {
    assert.equal((okRun({ ...BASE, count: 1 }).searchTerms as string[]).length, 1);
    assert.equal((okRun({ ...BASE, count: 10 }).searchTerms as string[]).length, 10);
  });

  it("terms are unique for count 10", () => {
    const terms = okRun({ ...BASE, count: 10 }).searchTerms as string[];
    assert.equal(new Set(terms).size, 10);
  });

  it("tipNote is honest: terms are search phrases, not live trending data", () => {
    const v = okRun({ ...BASE });
    assert.match(v.tipNote as string, /search phrases/i);
    assert.match(v.tipNote as string, /cannot fetch/i);
    assert.equal(v.tipNote, TIP_NOTE);
  });

  it("deterministic: same inputs give identical terms", () => {
    const a = JSON.stringify(runTool({ ...BASE, count: 7 }));
    const b = JSON.stringify(runTool({ ...BASE, count: 7 }));
    assert.equal(a, b);
  });

  it("niche is trimmed", () => {
    const v = okRun({ ...BASE, niche: "  fitness  " });
    const terms = v.searchTerms as string[];
    assert.ok(terms[0].includes("fitness"));
    assert.ok(!terms[0].includes("  fitness"));
  });

  it("missing niche fails", () => {
    const r = runTool({ mood: "Upbeat", count: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Niche is required/);
  });

  it("blank niche fails", () => {
    const r = runTool({ ...BASE, niche: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Niche is required/);
  });

  it("missing mood fails", () => {
    const r = runTool({ niche: "fitness", count: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Mood must be one of/);
  });

  it("unknown mood fails listing valid moods", () => {
    const r = runTool({ ...BASE, mood: "Angry" });
    assert.equal(r.ok, false);
    for (const m of MOODS) assert.ok((r.error as string).includes(m));
  });

  it("missing count fails", () => {
    const r = runTool({ niche: "fitness", mood: "Upbeat" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("count below 1 fails", () => {
    const r = runTool({ ...BASE, count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 1 and 10/);
  });

  it("count above 10 fails", () => {
    const r = runTool({ ...BASE, count: 11 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 1 and 10/);
  });

  it("non-integer count fails", () => {
    const r = runTool({ ...BASE, count: 2.5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("unicode niches pass through verbatim", () => {
    const v = okRun({ ...BASE, niche: "café culture", count: 2 });
    const terms = v.searchTerms as string[];
    assert.ok(terms.every((t) => t.includes("café culture")));
  });

  it("bank sizes are documented: 6 moods + 10 templates = 16", () => {
    assert.equal(BANK_SIZES.moods, 6);
    assert.equal(BANK_SIZES.termTemplates, 10);
    assert.equal(BANK_SIZES.total, 16);
  });
});
