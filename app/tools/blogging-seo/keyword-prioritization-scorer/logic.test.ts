import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, scoreKeyword, scoreBand, DEFAULT_WEIGHTS, MAX_KEYWORDS } from "./logic.ts";

function tableOf(result: { values?: Record<string, unknown> }): { columns: string[]; rows: string[][] } {
  return result.values!["rankedKeywords"] as { columns: string[]; rows: string[][] };
}

const TWO_KEYWORDS = "best espresso machine | 9 | 8 | 3 | 9\ncheap espresso machine | 7 | 9 | 7 | 6";

describe("keyword-prioritization-scorer", () => {
  it("happy path: keywords ranked by composite score, best first", () => {
    const r = runTool({ keywords: TWO_KEYWORDS });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.deepEqual(t.columns, ["#", "Keyword", "Relevance", "Volume", "Difficulty", "Commercial intent", "Score /100", "Priority"]);
    assert.equal(t.rows.length, 2);
    assert.equal(t.rows[0][1], "best espresso machine");
    assert.equal(t.rows[1][1], "cheap espresso machine");
    // score math check with default weights: (9 + 8 + (10-3) + 9) / 40 * 100 = 82.5
    assert.equal(t.rows[0][6], "82.5");
    // (7 + 9 + (10-7) + 6) / 40 * 100 = 62.5
    assert.equal(t.rows[1][6], "62.5");
    assert.equal(t.rows[0][7], "High priority — target first");
    assert.equal(t.rows[1][7], "Medium priority — schedule next");
    assert.ok((r.values!["topPick"] as string).startsWith("best espresso machine — 82.5/100"));
  });

  it("scoreKeyword formula is exact", () => {
    // perfect ratings: (10 + 10 + 10 + 10)/40*100 = 100
    assert.equal(scoreKeyword({ term: "x", relevance: 10, volume: 10, difficulty: 0, commercial: 10 }, DEFAULT_WEIGHTS), 100);
    // all zeros except max difficulty: (0+0+0+0)/40*100 = 0
    assert.equal(scoreKeyword({ term: "x", relevance: 0, volume: 0, difficulty: 10, commercial: 0 }, DEFAULT_WEIGHTS), 0);
    // lower difficulty raises the score
    const easy = scoreKeyword({ term: "x", relevance: 5, volume: 5, difficulty: 1, commercial: 5 }, DEFAULT_WEIGHTS);
    const hard = scoreKeyword({ term: "x", relevance: 5, volume: 5, difficulty: 9, commercial: 5 }, DEFAULT_WEIGHTS);
    assert.ok(easy > hard);
  });

  it("custom weights as string change the ranking", () => {
    // volume-only weights should prefer the high-volume keyword:
    // best: 8/10 -> 80.0 ; cheap: 9/10 -> 90.0
    const r = runTool({ keywords: TWO_KEYWORDS, weights: "0, 1, 0, 0" });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.equal(t.rows[0][1], "cheap espresso machine");
    assert.equal(t.rows[0][6], "90.0");
    assert.ok((r.values!["topPick"] as string).startsWith("cheap espresso machine"));
  });

  it("weights accepted as an object with defaults for missing keys", () => {
    // wVolume: 1, others default 0.25 (sum 1.75):
    // best: 14.25/17.5*100 = 81.4 ; cheap: 13.0/17.5*100 = 74.3
    const r = runTool({ keywords: TWO_KEYWORDS, weights: { wVolume: 1 } });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.equal(t.rows[0][1], "best espresso machine");
    assert.equal(t.rows[0][6], "81.4");
    assert.equal(t.rows[1][6], "74.3");
  });

  it("weights as object with all keys", () => {
    const r = runTool({
      keywords: TWO_KEYWORDS,
      weights: { wRelevance: 0.25, wVolume: 0.25, wDifficulty: 0.25, wCommercial: 0.25 },
    });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows[0][1], "best espresso machine");
  });

  it("keywords accepted as objects", () => {
    const r = runTool({
      keywords: [
        { term: "alpha", relevance: 8, volume: 5, difficulty: 2, commercialIntent: 7 },
        { term: "beta", relevance: 5, volume: 5, difficulty: 5, commercial: 5 },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows[0][1], "alpha");
  });

  it("missing keywords is rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /Keywords are required/);
  });

  it("blank keywords string is rejected", () => {
    const r = runTool({ keywords: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /required/);
  });

  it("line without 5 pipe-separated parts is rejected", () => {
    const r = runTool({ keywords: "best espresso machine | 9 | 8" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /5 parts/);
  });

  it("non-numeric rating is rejected", () => {
    const r = runTool({ keywords: "best espresso machine | 9 | high | 3 | 9" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /numbers/);
  });

  it("rating above 10 is rejected", () => {
    const r = runTool({ keywords: "best espresso machine | 11 | 8 | 3 | 9" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 10/);
  });

  it("negative rating is rejected", () => {
    const r = runTool({ keywords: "best espresso machine | 9 | -1 | 3 | 9" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 10/);
  });

  it("boundary ratings 0 and 10 are accepted", () => {
    const r = runTool({ keywords: "kw | 0 | 10 | 0 | 10" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows[0][6], "75.0"); // (0+10+10+10)/40*100
  });

  it("empty term is rejected", () => {
    const r = runTool({ keywords: "  | 9 | 8 | 3 | 9" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /non-empty term/);
  });

  it("weights all zero are rejected", () => {
    const r = runTool({ keywords: TWO_KEYWORDS, weights: "0, 0, 0, 0" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /more than 0/);
  });

  it("weight above 1 is rejected", () => {
    const r = runTool({ keywords: TWO_KEYWORDS, weights: "1.5, 0.25, 0.25, 0.25" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 to 1/);
  });

  it("weights string with wrong part count is rejected", () => {
    const r = runTool({ keywords: TWO_KEYWORDS, weights: "0.5, 0.5" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /4 numbers/);
  });

  it("edge case: all keywords score identically — input order kept, first is top pick", () => {
    const r = runTool({ keywords: "gamma | 5 | 5 | 5 | 5\nalpha | 5 | 5 | 5 | 5\nbeta | 5 | 5 | 5 | 5" });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.deepEqual(t.rows.map((row) => row[1]), ["gamma", "alpha", "beta"]);
    assert.ok((r.values!["topPick"] as string).startsWith("gamma"));
  });

  it("more than 200 keywords is rejected", () => {
    const many = Array.from({ length: MAX_KEYWORDS + 1 }, (_, i) => `kw${i} | 5 | 5 | 5 | 5`).join("\n");
    const r = runTool({ keywords: many });
    assert.equal(r.ok, false);
    assert.match(r.error!, /200/);
  });

  it("unicode term works", () => {
    const r = runTool({ keywords: "café au lait recipes | 8 | 6 | 4 | 7" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows[0][1], "café au lait recipes");
  });

  it("scoreBand boundaries: 70 high, 40 medium, below low", () => {
    assert.equal(scoreBand(70), "High priority — target first");
    assert.equal(scoreBand(69.9), "Medium priority — schedule next");
    assert.equal(scoreBand(40), "Medium priority — schedule next");
    assert.equal(scoreBand(39.9), "Low priority — revisit later");
    assert.equal(scoreBand(100), "High priority — target first");
  });

  it("topPick names strongest dimensions", () => {
    const r = runTool({ keywords: "kw | 9 | 2 | 8 | 9" });
    const pick = r.values!["topPick"] as string;
    assert.ok(pick.includes("relevance 9/10"));
    assert.ok(pick.includes("commercial intent 9/10"));
    assert.ok(pick.includes("heuristic"));
  });

  it("output ids match meta.ts (rankedKeywords, topPick)", () => {
    const r = runTool({ keywords: TWO_KEYWORDS });
    assert.deepEqual(Object.keys(r.values!).sort(), ["rankedKeywords", "topPick"]);
  });

  it("determinism: two runs produce identical output", () => {
    const a = runTool({ keywords: TWO_KEYWORDS, weights: "0.3, 0.2, 0.3, 0.2" });
    const b = runTool({ keywords: TWO_KEYWORDS, weights: "0.3, 0.2, 0.3, 0.2" });
    assert.deepEqual(a, b);
  });
});
