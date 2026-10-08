import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  analyzeLength,
  TEMPLATE_COUNT,
  MIN_TOPIC_CHARS,
  MAX_TOPIC_CHARS,
  MAX_KEYWORD_CHARS,
  MAX_DRAFT_CHARS,
  MIN_RECOMMENDED_CHARS,
  MAX_RECOMMENDED_CHARS,
} from "./logic.ts";

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("meta-description-generator", () => {
  it("happy path: suggestions from topic + keyword", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing tips" });
    const suggestions = v.suggestions as string[];
    assert.equal(suggestions.length, TEMPLATE_COUNT);
    for (const s of suggestions) {
      assert.ok(s.length > 0);
      assert.ok(!s.includes("{keyword}") && !s.includes("{topic}"));
      assert.match(s.toLowerCase(), /email marketing tips/);
    }
  });

  it("keyword falls back to topic when omitted", () => {
    const v = okRun({ topic: "sourdough baking" });
    const suggestions = v.suggestions as string[];
    assert.match(suggestions[0].toLowerCase(), /sourdough baking/);
    assert.equal(v.keywordPresent, false); // no keyword supplied
  });

  it("missing topic fails", () => {
    const r = runTool({ targetKeyword: "x" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Topic is required/);
  });

  it("single-char topic fails", () => {
    const r = runTool({ topic: "a" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Topic is required/);
    assert.equal(MIN_TOPIC_CHARS, 2);
  });

  it("over-long topic fails", () => {
    const r = runTool({ topic: "t".repeat(MAX_TOPIC_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /200 characters or fewer/);
  });

  it("over-long keyword fails", () => {
    const r = runTool({ topic: "email marketing", targetKeyword: "k".repeat(MAX_KEYWORD_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /100 characters or fewer/);
  });

  it("over-long draft fails", () => {
    const r = runTool({ topic: "email marketing", draft: "d".repeat(MAX_DRAFT_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /500 characters or fewer/);
  });

  it("edge: draft is analyzed when provided", () => {
    const draft = "A short draft about email marketing tips for beginners.";
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing tips", draft });
    const la = v.lengthAnalysis as { analyzed: string; charCount: number; status: string };
    assert.equal(la.analyzed, "draft");
    assert.equal(la.charCount, [...draft].length);
    assert.equal(la.status, "too short");
    assert.equal(v.keywordPresent, true);
  });

  it("edge: draft with keyword missing is flagged", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "automation", draft: "A guide to email marketing basics." });
    assert.equal(v.keywordPresent, false);
  });

  it("edge: without draft, the first suggestion is analyzed", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing" });
    const la = v.lengthAnalysis as { analyzed: string };
    assert.equal(la.analyzed, "suggestion");
  });

  it("edge: unicode draft counts code points, not UTF-16 units", () => {
    const draft = "🥗".repeat(150); // 150 code points, 300 UTF-16 units
    const la = analyzeLength(draft, "draft");
    assert.equal(la.charCount, 150);
    assert.equal(la.withinRange, true);
    assert.equal(la.status, "within recommended range");
  });

  it("analysis exposes the 140-160 convention and honesty note", () => {
    const la = analyzeLength("x".repeat(150), "draft");
    assert.equal(la.minRecommended, MIN_RECOMMENDED_CHARS);
    assert.equal(la.maxRecommended, MAX_RECOMMENDED_CHARS);
    assert.match(la.note, /not a guarantee/);
  });

  it("too-long status for very long drafts", () => {
    const la = analyzeLength("x".repeat(200), "draft");
    assert.equal(la.status, "too long");
    assert.equal(la.withinRange, false);
  });

  it("keyword matching is case-insensitive", () => {
    const v = okRun({
      topic: "email marketing",
      targetKeyword: "EMAIL Marketing Tips",
      draft: "Learn email marketing tips the easy way.",
    });
    assert.equal(v.keywordPresent, true);
  });

  it("template bank size is documented and honored", () => {
    assert.equal(TEMPLATE_COUNT, 5);
    const v = okRun({ topic: "blogging" });
    assert.equal((v.suggestions as string[]).length, 5);
    assert.equal(new Set(v.suggestions as string[]).size, 5);
  });

  it("deterministic: same inputs give identical outputs", () => {
    const input = { topic: "email marketing", targetKeyword: "email marketing tips", draft: "Some draft." };
    assert.deepEqual(okRun(input), okRun(input));
  });

  it("output ids match contract: suggestions, lengthAnalysis, keywordPresent", () => {
    const v = okRun({ topic: "email marketing" });
    assert.deepEqual(Object.keys(v).sort(), ["keywordPresent", "lengthAnalysis", "suggestions"]);
    assert.equal(typeof v.keywordPresent, "boolean");
    assert.ok(Array.isArray(v.suggestions));
  });

  it("non-object input fails gracefully", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });
});
