import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

describe("runTool — happy path (substring mode)", () => {
  it("detects front position", () => {
    const r = runTool({ keyword: "sourdough", title: "Sourdough Bread Masterclass" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "Yes");
    assert.equal(r.values.position, "front");
    assert.match(r.values.matchDetails, /character 1 /);
    assert.ok(r.values.recommendation.toLowerCase().includes("front-loaded"));
  });
  it("detects middle position", () => {
    const r = runTool({ keyword: "sourdough", title: "How to bake sourdough at home" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.position, "middle");
    assert.ok(r.values.recommendation.toLowerCase().includes("middle"));
  });
  it("detects end position", () => {
    const r = runTool({ keyword: "beginners", title: "Cake decorating for beginners" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.position, "end");
    assert.ok(r.values.recommendation.toLowerCase().includes("buried"));
  });
  it("reports no match honestly", () => {
    const r = runTool({ keyword: "sourdough", title: "Cake decorating for beginners" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "No");
    assert.equal(r.values.position, "not found");
    assert.ok(r.values.recommendation.toLowerCase().includes("does not contain"));
  });
  it("is case-insensitive", () => {
    const r = runTool({ keyword: "SOURDOUGH", title: "sourdough bread guide" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "Yes");
    assert.equal(r.values.position, "front");
  });
  it("matches multi-word phrases", () => {
    const r = runTool({ keyword: "how to bake", title: "How to Bake Bread at Home" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "Yes");
    assert.equal(r.values.position, "front");
  });
});

describe("runTool — word-boundary mode", () => {
  it("rejects partial-word match", () => {
    const r = runTool({ keyword: "cat", title: "How to concatenate strings", wordBoundary: true });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "No");
    assert.equal(r.values.position, "not found");
    assert.ok(r.values.matchDetails.includes("whole word"));
  });
  it("accepts whole-word match", () => {
    const r = runTool({ keyword: "cat", title: "My cat learns tricks", wordBoundary: true });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "Yes");
    assert.equal(r.values.position, "middle");
    assert.ok(r.values.matchDetails.includes("word 2 of 4"));
  });
  it("matches multi-word phrase as token sequence", () => {
    const r = runTool({
      keyword: "sourdough bread",
      title: "Sourdough Bread: the complete guide",
      wordBoundary: true,
    });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "Yes");
    assert.equal(r.values.position, "front");
  });
  it("phrase spanning words out of order does not match", () => {
    const r = runTool({
      keyword: "bread sourdough",
      title: "Sourdough bread guide",
      wordBoundary: true,
    });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "No");
  });
});

describe("runTool — validation errors", () => {
  it("empty keyword -> error", () => {
    const r = runTool({ keyword: "   ", title: "Some title" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /keyword/i);
  });
  it("missing keyword -> error", () => {
    const r = runTool({ title: "Some title" });
    assert.equal(r.ok, false);
  });
  it("empty title -> error", () => {
    const r = runTool({ keyword: "cake", title: "" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /title/i);
  });
  it("non-string inputs -> error", () => {
    const r = runTool({ keyword: 42, title: "Some title" });
    assert.equal(r.ok, false);
  });
});

describe("runTool — unicode & edge cases", () => {
  it("unicode case folding works (CAFÉ vs café)", () => {
    const r = runTool({ keyword: "café", title: "Best CAFÉ recipes" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "Yes");
  });
  it("keyword longer than title -> no match", () => {
    const r = runTool({ keyword: "a very long keyword phrase", title: "short" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.match, "No");
  });
  it("single-word title equal to keyword -> front", () => {
    const r = runTool({ keyword: "vlog", title: "Vlog" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.position, "front");
  });
  it("keyword at very end in word-boundary mode -> end", () => {
    const r = runTool({ keyword: "tips", title: "Editing tips", wordBoundary: true });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.position, "end");
  });
  it("leading/trailing spaces in title are trimmed", () => {
    const r = runTool({ keyword: "cake", title: "   Cake recipe  " });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.position, "front");
  });
});

describe("runTool — determinism & output contract", () => {
  it("same input -> identical output (run twice)", () => {
    const v = { keyword: "sourdough", title: "Bake sourdough at home", wordBoundary: true };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("values keys match meta outputs", () => {
    const r = runTool({ keyword: "a", title: "a b c" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(Object.keys(r.values).sort(), [
      "match",
      "matchDetails",
      "position",
      "recommendation",
    ]);
  });
});
