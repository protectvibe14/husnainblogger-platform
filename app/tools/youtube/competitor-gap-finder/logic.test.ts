import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ANGLE_BANK_SIZE,
  MAX_TOPICS,
  findGaps,
  parseTopicList,
  topicsMatch,
  runTool,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("finds gaps and marks coverage", () => {
    const r = runTool({
      competitorName: "Rival Channel",
      competitorTopics: "Best budget microphones\nHow to start a podcast\nTop 5 video ideas",
      ownTopics: "How to start a podcast\nMy gear tour",
    });
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.equal(v["uncoveredCount"], 2);
    assert.equal(v["coveredCount"], 1);
    assert.equal(v["coveragePercent"], 33);
    assert.deepEqual(v["uncoveredTopics"], ["Best budget microphones", "Top 5 video ideas"]);
    assert.equal((v["angleSuggestions"] as string[]).length, 2);
    assert.equal(v["isWorksheet"], true);
    assert.ok(String(v["honestyNote"]).includes("Manual worksheet"));
  });
  it("coverageMatrix has table shape with columns and rows", () => {
    const r = runTool({
      competitorTopics: "Topic A\nTopic B",
      ownTopics: "Topic A",
    });
    const m = r.values!["coverageMatrix"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(m.columns, ["Competitor topic", "You cover it?", "Suggestion"]);
    assert.equal(m.rows.length, 2);
    assert.deepEqual(m.rows[0][1], "Yes");
    assert.deepEqual(m.rows[1][1], "No");
  });
  it("empty own topics -> everything uncovered", () => {
    const r = runTool({ competitorTopics: "A\nB\nC" });
    assert.equal(r.values!["uncoveredCount"], 3);
    assert.equal(r.values!["coveragePercent"], 0);
  });
  it("containment matching counts as covered", () => {
    const r = runTool({
      competitorTopics: "The complete guide to sourdough bread baking",
      ownTopics: "Sourdough bread baking",
    });
    assert.equal(r.values!["coveredCount"], 1);
  });
  it("angle suggestions cycle the 12-template bank deterministically", () => {
    const topics = Array.from({ length: 14 }, (_, i) => `Competitor video topic number ${i}`);
    const r = runTool({ competitorTopics: topics.join("\n") });
    const s = r.values!["angleSuggestions"] as string[];
    assert.equal(s.length, 14);
    // cycle: suggestion 13 reuses template 1's text with a different topic
    assert.ok(s[0].includes("Competitor video topic number 0"));
    assert.ok(s[12].includes("Competitor video topic number 12"));
    const firstTemplateText = s[0].replace("Competitor video topic number 0", "X");
    const thirteenthTemplateText = s[12].replace("Competitor video topic number 12", "X");
    assert.equal(firstTemplateText, thirteenthTemplateText);
  });
  it("dedupes competitor topics case-insensitively", () => {
    const r = runTool({ competitorTopics: "Topic A\ntopic a\nTOPIC A" });
    const m = r.values!["coverageMatrix"] as { rows: string[][] };
    assert.equal(m.rows.length, 1);
  });
});

describe("runTool — validation errors", () => {
  it("missing competitor topics errors", () => {
    const r = runTool({ ownTopics: "My video" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("at least 1 competitor"));
  });
  it("blank-only competitor topics errors", () => {
    const r = runTool({ competitorTopics: "   \n  " });
    assert.equal(r.ok, false);
  });
  it("non-string competitor topics errors", () => {
    const r = runTool({ competitorTopics: 42 });
    assert.equal(r.ok, false);
  });
  it("overlong competitor name errors", () => {
    const r = runTool({ competitorName: "x".repeat(81), competitorTopics: "A" });
    assert.equal(r.ok, false);
  });
  it("competitor name is optional", () => {
    const r = runTool({ competitorTopics: "A" });
    assert.equal(r.ok, true);
  });
});

describe("helpers", () => {
  it("parseTopicList trims, drops empties, caps at MAX_TOPICS", () => {
    const big = Array.from({ length: 60 }, (_, i) => `t${i}`).join("\n");
    assert.equal(parseTopicList(big).length, MAX_TOPICS);
    assert.deepEqual(parseTopicList(" a \n\n b , c "), ["a", "b , c"]);
  });
  it("parseTopicList non-string -> []", () => {
    assert.deepEqual(parseTopicList(null), []);
  });
  it("topicsMatch exact (case-insensitive)", () => {
    assert.equal(topicsMatch("Best Microphones", "best microphones"), true);
  });
  it("topicsMatch rejects unrelated", () => {
    assert.equal(topicsMatch("Cooking pasta", "Car repair"), false);
  });
  it("topicsMatch ignores punctuation differences", () => {
    assert.equal(topicsMatch("Top 5 ideas!", "top 5 ideas"), true);
  });
  it("ANGLE_BANK_SIZE is 12", () => {
    assert.equal(ANGLE_BANK_SIZE, 12);
  });
});

describe("determinism + output ids", () => {
  it("same inputs -> identical outputs", () => {
    const args = { competitorTopics: "A\nB", ownTopics: "A" };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ competitorTopics: "A" });
    const ids = Object.keys(r.values!).sort();
    assert.deepEqual(ids, [
      "angleSuggestions",
      "coverageMatrix",
      "coveragePercent",
      "coveredCount",
      "honestyNote",
      "isWorksheet",
      "uncoveredCount",
      "uncoveredTopics",
    ]);
  });
  it("findGaps is pure", () => {
    const a = findGaps(["A", "B"], ["A"], "Rival");
    const b = findGaps(["A", "B"], ["A"], "Rival");
    assert.deepEqual(a, b);
    assert.equal(a.coveragePercent, 50);
  });
});
