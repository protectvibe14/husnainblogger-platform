import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeCta, runTool } from "./logic.ts";

describe("analyzeCta — normal cases", () => {
  it("strong CTA scores high", () => {
    const r = analyzeCta("Get your free template now");
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 85, `expected >=85, got ${r.score}`);
    assert.equal(r.grade, "Excellent");
    assert.equal(r.actionVerb, "get");
    assert.ok(r.urgencyWords.includes("now"));
    assert.ok(r.benefitWords.includes("free"));
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
  it("weak CTA gets penalized", () => {
    const r = analyzeCta("Click here");
    assert.ok(r.score < 50, `expected <50, got ${r.score}`);
    assert.equal(r.actionVerb, null);
    assert.ok(r.weakPatterns.some((w) => w.includes("click here")));
    const f = r.factors.find((x) => x.name === "No weak patterns")!;
    assert.ok(f.points < 20);
  });
  it("submit alone is weakest", () => {
    const r = analyzeCta("Submit");
    assert.ok(r.weakPatterns.some((w) => w.includes("submit")));
    assert.equal(r.grade, "Poor");
  });
  it("long CTA loses clarity points", () => {
    const r = analyzeCta("Download our comprehensive free guide to doubling your email open rates today now");
    const f = r.factors.find((x) => x.name === "Clarity")!;
    assert.ok(f.points <= 12, `expected <=12, got ${f.points}`);
  });
  it("trailing ellipsis flagged", () => {
    const r = analyzeCta("Start your free trial...");
    assert.ok(r.weakPatterns.some((w) => w.includes("ellipsis")));
  });
  it("no verb at all flagged", () => {
    const r = analyzeCta("Amazing deals inside");
    assert.ok(r.weakPatterns.includes("no action verb at all"));
  });
});

describe("analyzeCta — boundaries", () => {
  it("exactly 8 words gets full clarity", () => {
    const r = analyzeCta("Get your free weekly creator guide now");
    assert.equal(r.wordCount, 7);
    assert.equal(r.factors.find((f) => f.name === "Clarity")!.points, 20);
  });
  it("9 words gets partial clarity", () => {
    const r = analyzeCta("Get your free weekly creator growth guide now today");
    assert.equal(r.wordCount, 9);
    assert.equal(r.factors.find((f) => f.name === "Clarity")!.points, 12);
  });
  it("verb matching is word-based not substring", () => {
    const r = analyzeCta("Forget everything you know");
    // "get" is a substring of "forget" but not a word — should NOT match
    assert.equal(r.actionVerb, null);
  });
  it("throws on empty / non-string", () => {
    assert.throws(() => analyzeCta(""), Error);
    assert.throws(() => analyzeCta("   "), Error);
    assert.throws(() => analyzeCta(5 as unknown as string), TypeError);
  });
});

describe("runTool — contract", () => {
  it("rejects empty CTA", () => {
    assert.equal(runTool({ cta: "" }).ok, false);
    assert.equal(runTool({}).ok, false);
  });
  it("returns score, grade, factors, summary, honesty note", () => {
    const r = runTool({ cta: "Start your free trial today" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values!.score === "number");
    assert.ok(Array.isArray(r.values!.factorResults));
    assert.ok((r.values!.summary as string).includes("words"));
    assert.ok((r.values!.heuristicNote as string).includes("Heuristic only"));
  });
});
