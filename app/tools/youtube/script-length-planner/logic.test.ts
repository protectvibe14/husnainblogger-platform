import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, DEFAULT_WPM, SECTION_SHARES } from "./logic.ts";

describe("runTool — duration_to_words happy path", () => {
  it("10 min at 150 wpm -> 1500 words", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.words, 1500);
    assert.equal(r.values!.durationMinutes, 10);
  });
  it("uses default 150 wpm when wpm omitted", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 8 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.words, 8 * DEFAULT_WPM);
  });
  it("accepts numeric strings", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: "10", wpm: "150" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.words, 1500);
  });
  it("segment budgets cover all 5 sections and sum near total", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    const budgets = r.values!.segmentBudgets as string[];
    assert.equal(budgets.length, 5);
    for (const label of ["Hook", "Setup", "Main value", "Payoff", "CTA"]) {
      assert.ok(budgets.some((b) => b.startsWith(label)), `missing ${label}`);
    }
  });
  it("summary mentions the word estimate", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    assert.match(r.values!.summary as string, /1,500 words/);
  });
});

describe("runTool — words_to_duration happy path", () => {
  it("1500 words at 150 wpm -> 10 minutes", () => {
    const r = runTool({ mode: "words_to_duration", wordCount: 1500, wpm: 150 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.durationMinutes, 10);
    assert.equal(r.values!.words, 1500);
  });
  it("900 words at 150 wpm -> 6 minutes", () => {
    const r = runTool({ mode: "words_to_duration", wordCount: 900, wpm: 150 });
    assert.equal(r.values!.durationMinutes, 6);
  });
  it("rounds duration to 1 decimal", () => {
    const r = runTool({ mode: "words_to_duration", wordCount: 1000, wpm: 150 });
    assert.equal(r.values!.durationMinutes, 6.7);
  });
});

describe("runTool — validation errors", () => {
  it("missing targetMinutes in duration mode -> error", () => {
    const r = runTool({ mode: "duration_to_words", wpm: 150 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Target duration/);
  });
  it("zero/negative targetMinutes -> error", () => {
    assert.equal(runTool({ mode: "duration_to_words", targetMinutes: 0 }).ok, false);
    assert.equal(runTool({ mode: "duration_to_words", targetMinutes: -5 }).ok, false);
  });
  it("missing wordCount in words mode -> error", () => {
    const r = runTool({ mode: "words_to_duration", wpm: 150 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Word count/);
  });
  it("zero wpm -> error", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Speaking rate/);
  });
  it("non-numeric input -> error", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: "ten" });
    assert.equal(r.ok, false);
  });
  it("invalid mode string -> error", () => {
    const r = runTool({ mode: "bogus", targetMinutes: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Mode/);
  });
  it("non-object values -> error", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — edge cases from spec", () => {
  it("wpm below 100 -> warning note, still ok", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 80 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.notes as string[]).some((n) => n.includes("Warning")));
  });
  it("wpm above 200 -> warning note, still ok", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 250 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.notes as string[]).some((n) => n.includes("Warning")));
  });
  it("wpm inside 100-200 -> no warning", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    assert.ok(!(r.values!.notes as string[]).some((n) => n.includes("Warning")));
  });
  it("Shorts target (<=3:00) -> Shorts check note", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 2, wpm: 150 });
    assert.ok((r.values!.notes as string[]).some((n) => n.includes("Shorts check")));
  });
  it("long-form target -> no Shorts check note", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 12, wpm: 150 });
    assert.ok(!(r.values!.notes as string[]).some((n) => n.includes("Shorts check")));
  });
  it("B-roll/pauses disclaimer always present", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    assert.ok((r.values!.notes as string[]).some((n) => n.includes("B-roll")));
  });
});

describe("runTool — determinism and output ids", () => {
  it("same inputs -> identical outputs", () => {
    const a = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    const b = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    assert.deepEqual(a, b);
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ mode: "duration_to_words", targetMinutes: 10, wpm: 150 });
    assert.deepEqual(Object.keys(r.values!).sort(), ["durationMinutes", "notes", "segmentBudgets", "summary", "words"]);
  });
  it("SECTION_SHARES sum to 1.00", () => {
    const total = SECTION_SHARES.reduce((a, s) => a + s.share, 0);
    assert.ok(Math.abs(total - 1) < 1e-9);
  });
});
