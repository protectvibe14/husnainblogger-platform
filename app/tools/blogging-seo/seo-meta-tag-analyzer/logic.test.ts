import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeMetaTags, runTool, TITLE_IDEAL_MIN, TITLE_IDEAL_MAX, DESC_IDEAL_MIN, DESC_IDEAL_MAX } from "./logic.ts";

const BASE = {
  title: "Best Sourdough Bread Recipe for Beginners at Home Today",
  description: "Learn how to bake the best sourdough bread recipe for beginners with this step-by-step home guide, tips, and timing for perfect loaves.",
  keyword: "sourdough bread recipe",
  ogTitle: true,
  ogDescription: true,
  ogImage: true,
};

describe("analyzeMetaTags — normal cases", () => {
  it("ideal tags score high", () => {
    const r = analyzeMetaTags(BASE);
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 85, `expected >=85, got ${r.score}`);
    assert.equal(r.grade, "Excellent");
    assert.equal(r.keywordInTitle, true);
    assert.equal(r.keywordInDescription, true);
    assert.equal(r.checks.reduce((a, c) => a + c.max, 0), 100);
  });
  it("missing description fails that check", () => {
    const r = analyzeMetaTags({ ...BASE, description: "" });
    const c = r.checks.find((x) => x.name === "Meta description length")!;
    assert.equal(c.verdict, "fail");
    assert.equal(c.points, 0);
  });
  it("keyword missing from title fails that check", () => {
    const r = analyzeMetaTags({ ...BASE, keyword: "keto pancakes" });
    const c = r.checks.find((x) => x.name === "Keyword in title")!;
    assert.equal(c.verdict, "fail");
    assert.equal(r.keywordInTitle, false);
  });
  it("missing OG tags flagged", () => {
    const r = analyzeMetaTags({ ...BASE, ogTitle: false, ogDescription: false, ogImage: false });
    const c = r.checks.find((x) => x.name === "Open Graph tags")!;
    assert.equal(c.verdict, "fail");
    assert.equal(c.points, 0);
  });
  it("ALL-CAPS title penalized", () => {
    const r = analyzeMetaTags({ ...BASE, title: "BEST SOURDOUGH BREAD RECIPE FOR BEGINNERS AT HOME" });
    const c = r.checks.find((x) => x.name === "Uniqueness signals")!;
    assert.ok(c.points < 15, `expected <15, got ${c.points}`);
  });
  it("keyword stuffing penalized", () => {
    const r = analyzeMetaTags({
      ...BASE,
      title: "Sourdough Bread Recipe — Best Sourdough Bread Recipe Ever",
      description: "Sourdough bread recipe guide. This sourdough bread recipe is the best sourdough bread recipe.",
      keyword: "sourdough bread recipe",
    });
    const c = r.checks.find((x) => x.name === "Uniqueness signals")!;
    assert.ok(c.points < 15);
    assert.ok(c.detail.includes("stuffing"));
  });
});

describe("analyzeMetaTags — boundaries", () => {
  it("title length bands", () => {
    const mk = (len: number) => analyzeMetaTags({ ...BASE, title: "x".repeat(len), keyword: "" });
    assert.equal(mk(55).checks.find((c) => c.name === "Title length")!.points, 20);
    assert.equal(mk(45).checks.find((c) => c.name === "Title length")!.points, 12);
    assert.equal(mk(75).checks.find((c) => c.name === "Title length")!.points, 5);
    assert.equal(mk(50).checks.find((c) => c.name === "Title length")!.points, 20);
    assert.equal(mk(60).checks.find((c) => c.name === "Title length")!.points, 20);
  });
  it("description length bands", () => {
    const mk = (len: number) => analyzeMetaTags({ ...BASE, description: "x".repeat(len), keyword: "" });
    assert.equal(mk(150).checks.find((c) => c.name === "Meta description length")!.points, 20);
    assert.equal(mk(130).checks.find((c) => c.name === "Meta description length")!.points, 12);
    assert.equal(mk(200).checks.find((c) => c.name === "Meta description length")!.points, 5);
  });
  it("standards constants are real SEO guidelines", () => {
    assert.equal(TITLE_IDEAL_MIN, 50);
    assert.equal(TITLE_IDEAL_MAX, 60);
    assert.equal(DESC_IDEAL_MIN, 140);
    assert.equal(DESC_IDEAL_MAX, 155);
  });
  it("throws on non-string", () => {
    assert.throws(() => analyzeMetaTags({ ...BASE, title: 5 as unknown as string }), TypeError);
  });
  it("empty keyword -> warn verdicts not crashes", () => {
    const r = analyzeMetaTags({ ...BASE, keyword: "" });
    assert.equal(r.checks.find((c) => c.name === "Keyword in title")!.verdict, "warn");
  });
});

describe("runTool — contract", () => {
  it("rejects empty title", () => {
    const r = runTool({ title: "", description: "x" });
    assert.equal(r.ok, false);
  });
  it("accepts empty description (scores as missing)", () => {
    const r = runTool({ title: "Some Title Here", description: "", keyword: "" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values!.score === "number");
  });
  it("returns checks, lengths, honesty note", () => {
    const r = runTool({ ...BASE });
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values!.checkResults));
    assert.ok((r.values!.lengths as string).includes("Title:"));
    assert.ok((r.values!.heuristicNote as string).includes("Rule-based"));
  });
});
