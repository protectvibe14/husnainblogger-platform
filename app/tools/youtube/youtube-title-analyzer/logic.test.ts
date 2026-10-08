import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeTitle, runTool } from "./logic.ts";

describe("analyzeTitle — strong title", () => {
  it("scores 80+ for a well-crafted title", () => {
    const r = analyzeTitle("7 Proven YouTube Title Hacks: How I Tripled My Views", "youtube title");
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 80, `expected >=80, got ${r.score}`);
    assert.equal(r.grade, "Excellent");
    assert.equal(r.hasNumber, true);
    assert.ok(r.powerWordsFound.length >= 1);
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
});

describe("analyzeTitle — weak title", () => {
  it("scores low for a short generic title", () => {
    const r = analyzeTitle("My vlog", "");
    assert.ok(r.score < 40, `expected <40, got ${r.score}`);
    assert.equal(r.grade, "Weak");
    assert.ok(r.tips.length > 0);
  });

  it("penalizes ALL CAPS and repeated punctuation", () => {
    const r = analyzeTitle("AMAZING VIDEO YOU MUST WATCH!!!", "");
    const fmt = r.factors.find((f) => f.name === "Clean formatting");
    assert.equal(fmt?.points, 0);
  });
});

describe("analyzeTitle — keyword placement", () => {
  it("awards full points when keyword starts the title", () => {
    const r = analyzeTitle("Sourdough Bread: 5 Beginner Mistakes to Avoid", "sourdough bread");
    const kw = r.factors.find((f) => f.name === "Keyword placement");
    assert.equal(kw?.points, 15);
  });

  it("awards partial points when keyword is present but not first", () => {
    const r = analyzeTitle("5 Beginner Mistakes with Sourdough Bread", "sourdough bread");
    const kw = r.factors.find((f) => f.name === "Keyword placement");
    assert.equal(kw?.points, 8);
  });
});

describe("analyzeTitle — length bands", () => {
  it("40-60 chars earns full length points", () => {
    const r = analyzeTitle("How I Edit YouTube Videos in Under 30 Minutes", "");
    const len = r.factors.find((f) => f.name === "Length sweet spot");
    assert.equal(len?.points, 25);
  });
});

describe("analyzeTitle — errors", () => {
  it("throws on empty title", () => {
    assert.throws(() => analyzeTitle("   ", ""), /non-empty/);
  });
  it("throws on non-string", () => {
    assert.throws(() => analyzeTitle(5 as unknown as string, ""), TypeError);
  });
});

describe("runTool contract", () => {
  it("returns ok with all output keys", () => {
    const r = runTool({ title: "7 Proven YouTube Title Hacks", keyword: "" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values?.score === "number");
    assert.ok(typeof r.values?.grade === "string");
    assert.ok(Array.isArray(r.values?.factorBreakdown));
    assert.ok(Array.isArray(r.values?.tips));
    assert.match(String(r.values?.heuristicNote), /Heuristic/);
  });

  it("rejects empty title", () => {
    const r = runTool({ title: "  ", keyword: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /title/i);
  });
});
