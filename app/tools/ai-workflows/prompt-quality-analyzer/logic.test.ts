import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MIN_PROMPT_LENGTH,
  ANALYSIS_WINDOW,
  IMPERATIVE_VERBS,
  bandFor,
  analyzePrompt,
  runTool,
} from "./logic.ts";

const EXCELLENT_PROMPT =
  "Write a comprehensive beginner's guide to email list building in markdown format with a comparison table and bullet points. " +
  "Do not use technical jargon. Avoid hype and keep the tone friendly and encouraging throughout. " +
  "You are an experienced email marketer writing for small business owners who are starting from zero. " +
  "For example, show how to place a signup form on a homepage and how to write a welcome email. " +
  "Must include exactly three sections with at least two bullet points each. " +
  "The guide should be no more than 400 words. Only recommend free tools. " +
  "Structure the answer with clear headings and finish with a short checklist that readers can follow step by step " +
  "without skipping any important details or repeating advice that has already been covered above in the previous " +
  "sections of this guide for beginners who want to grow their audience steadily over time.";

const WEAK_PROMPT = "Give me ideas for my blog about cooking healthy family meals tonight please";

describe("analyzePrompt — criterion behavior", () => {
  it("perfect prompt scores 100 (Excellent)", () => {
    const r = analyzePrompt(EXCELLENT_PROMPT);
    assert.equal(r.totalScore, 100);
    assert.equal(r.band, "Excellent");
    assert.deepEqual(r.suggestions, []);
    assert.deepEqual(r.criteria.map((c) => [c.score, c.max]), [
      [25, 25],
      [20, 20],
      [20, 20],
      [20, 20],
      [15, 15],
    ]);
  });

  it("weak prompt scores 29 (Needs work)", () => {
    const r = analyzePrompt(WEAK_PROMPT);
    assert.equal(r.totalScore, 29);
    assert.equal(r.band, "Needs work");
    assert.equal(r.suggestions.length, 4);
  });

  it("imperative verbs not at the start score 18 for task clarity", () => {
    const r = analyzePrompt("Please explain and summarize this article for beginners simply");
    assert.equal(r.criteria[0].score, 18);
  });

  it("a single buried imperative scores 10 for task clarity", () => {
    const r = analyzePrompt("I need you to draft a quick note for my team members today");
    assert.equal(r.criteria[0].score, 10);
  });

  it("no imperative verbs scores 5 for task clarity", () => {
    const r = analyzePrompt("Something about cats and dogs and the weather is quite nice today");
    assert.equal(r.criteria[0].score, 5);
  });

  it("context uses word-count tiers: 30–59 words scores 8", () => {
    const words = Array.from({ length: 40 }, () => "filler").join(" ");
    const r = analyzePrompt(`Write ${words}.`);
    assert.equal(r.criteria[1].score, 8);
  });

  it("format cues present -> 20; absent -> 0", () => {
    const withFormat = analyzePrompt("Write a markdown table comparing two email tools with bullet points");
    const withoutFormat = analyzePrompt("Write something about email tools for my newsletter readers today");
    assert.equal(withFormat.criteria[2].score, 20);
    assert.equal(withoutFormat.criteria[2].score, 0);
  });

  it("exactly one constraint cue scores 12", () => {
    const r = analyzePrompt("Write a short poem about rain. Do not use the word blue ever again in this poem.");
    assert.equal(r.criteria[3].score, 12);
  });

  it("no constraint cues scores 0", () => {
    const r = analyzePrompt("Write a short poem about rain for the school assembly program today");
    assert.equal(r.criteria[3].score, 0);
  });

  it("example/role/tone cues present -> 15; absent -> 0", () => {
    const withCue = analyzePrompt("Write a product description. For example: our handmade soap smells fresh.");
    const withoutCue = analyzePrompt("Write a product description for the new catalog that we plan to print");
    assert.equal(withCue.criteria[4].score, 15);
    assert.equal(withoutCue.criteria[4].score, 0);
  });

  it("imperative verb bank is documented (26 verbs)", () => {
    assert.equal(IMPERATIVE_VERBS.length, 26);
  });
});

describe("bandFor", () => {
  it("maps boundaries: 85 Excellent, 70 Good, 50 Fair, 49 Needs work", () => {
    assert.equal(bandFor(85), "Excellent");
    assert.equal(bandFor(84), "Good");
    assert.equal(bandFor(70), "Good");
    assert.equal(bandFor(69), "Fair");
    assert.equal(bandFor(50), "Fair");
    assert.equal(bandFor(49), "Needs work");
    assert.equal(bandFor(100), "Excellent");
    assert.equal(bandFor(0), "Needs work");
  });
});

describe("analyzePrompt — edges", () => {
  it("scores only the first 5000 characters (truncation edge case)", () => {
    const long = EXCELLENT_PROMPT + " filler ".repeat(2000); // well over 5000 chars
    assert.ok(long.length > ANALYSIS_WINDOW);
    const a = analyzePrompt(long);
    const b = analyzePrompt(long.slice(0, ANALYSIS_WINDOW));
    assert.equal(a.totalScore, b.totalScore);
    assert.deepEqual(a.criteria.map((c) => c.score), b.criteria.map((c) => c.score));
  });

  it("suggestions come from the rubric (fixed strings, one per missed criterion)", () => {
    const r = analyzePrompt(WEAK_PROMPT);
    for (const s of r.suggestions) {
      assert.ok(typeof s === "string" && s.length > 20);
    }
  });
});

describe("runTool — validation", () => {
  it("rejects a missing promptText", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects an empty promptText", () => {
    const res = runTool({ promptText: "   " });
    assert.equal(res.ok, false);
  });

  it("rejects a prompt under 20 characters", () => {
    const res = runTool({ promptText: "x".repeat(MIN_PROMPT_LENGTH - 1) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes(String(MIN_PROMPT_LENGTH)));
  });

  it("rejects a non-string promptText", () => {
    const res = runTool({ promptText: 123 });
    assert.equal(res.ok, false);
  });

  it("accepts exactly 20 characters", () => {
    const res = runTool({ promptText: "x".repeat(MIN_PROMPT_LENGTH) });
    assert.equal(res.ok, true);
  });
});

describe("runTool — output contract and determinism", () => {
  it("returns totalScore, scoreBand, criteriaScores, suggestions", () => {
    const res = runTool({ promptText: EXCELLENT_PROMPT });
    assert.equal(res.ok, true);
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "criteriaScores",
      "scoreBand",
      "suggestions",
      "totalScore",
    ]);
    assert.equal(res.values!.totalScore, 100);
    assert.equal(res.values!.scoreBand, "Excellent");
  });

  it("criteriaScores is a table with 5 rows and the documented columns", () => {
    const res = runTool({ promptText: WEAK_PROMPT });
    const table = res.values!.criteriaScores as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Criterion", "Score", "Max", "Note"]);
    assert.equal(table.rows.length, 5);
    assert.deepEqual(table.rows.map((r) => r.slice(0, 3)), [
      ["Task clarity", "25", "25"],
      ["Context & background", "4", "20"],
      ["Output format specified", "0", "20"],
      ["Constraints & boundaries", "0", "20"],
      ["Examples, role, or tone", "0", "15"],
    ]);
  });

  it("same prompt -> identical output (deep equal)", () => {
    assert.deepEqual(runTool({ promptText: WEAK_PROMPT }), runTool({ promptText: WEAK_PROMPT }));
  });
});
