import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, normalizeKeyword, MAX_KEYWORDS_PER_LIST, MAX_LABEL_CHARS } from "./logic.ts";

const HAPPY = {
  yourKeywords: "seo tips\nblog seo\nkeyword research",
  competitorKeywords: "seo tips\ncontent marketing\nlink building",
};

function tableOf(result: { values?: Record<string, unknown> }): { columns: string[]; rows: string[][] } {
  return result.values!["gapTable"] as { columns: string[]; rows: string[][] };
}

describe("keyword-gap-worksheet", () => {
  it("happy path: classifies gaps, overlaps and your-only keywords", () => {
    const r = runTool(HAPPY);
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.deepEqual(t.columns, ["Keyword", "Your list", "Competitor", "Status"]);
    assert.equal(t.rows.length, 5);
    assert.equal(r.values!["overlapCount"], 1);
    const byKw = new Map(t.rows.map((row) => [row[0], row[3]]));
    assert.equal(byKw.get("content marketing"), "Gap — competitor targets it, you don't");
    assert.equal(byKw.get("link building"), "Gap — competitor targets it, you don't");
    assert.equal(byKw.get("seo tips"), "Overlap — both lists target it");
    assert.equal(byKw.get("blog seo"), "Only in your list");
    assert.equal(byKw.get("keyword research"), "Only in your list");
  });

  it("gaps sort before overlaps before your-only", () => {
    const r = runTool(HAPPY);
    const statuses = tableOf(r).rows.map((row) => row[3]);
    assert.deepEqual(statuses, [
      "Gap — competitor targets it, you don't",
      "Gap — competitor targets it, you don't",
      "Overlap — both lists target it",
      "Only in your list",
      "Only in your list",
    ]);
  });

  it("array inputs are accepted", () => {
    const r = runTool({
      yourKeywords: ["apple", "banana"],
      competitorKeywords: ["banana", "cherry"],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["overlapCount"], 1);
    assert.equal(tableOf(r).rows.length, 3);
  });

  it("case and whitespace are normalized before comparison", () => {
    const r = runTool({
      yourKeywords: "  SEO Tips\nblog   SEO ",
      competitorKeywords: "seo tips\nBLOG seo",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["overlapCount"], 2);
    assert.equal(tableOf(r).rows.length, 2);
    assert.ok(tableOf(r).rows.every((row) => row[3].startsWith("Overlap")));
  });

  it("duplicates inside one list are removed", () => {
    const r = runTool({
      yourKeywords: "apple\napple\nAPPLE\nbanana",
      competitorKeywords: "banana",
    });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 2);
  });

  it("identical lists produce zero gap rows", () => {
    const r = runTool({
      yourKeywords: "apple\nbanana\ncherry",
      competitorKeywords: "cherry\napple\nbanana",
    });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.equal(t.rows.length, 3);
    assert.ok(t.rows.every((row) => row[3] === "Overlap — both lists target it"));
    assert.equal(r.values!["overlapCount"], 3);
  });

  it("unicode keywords compare correctly", () => {
    const r = runTool({
      yourKeywords: "café recipes\nMünchen travel",
      competitorKeywords: "CAFÉ RECIPES\ntokyo food",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["overlapCount"], 1);
    assert.equal(tableOf(r).rows.length, 3);
  });

  it("competitor label is used in the table and CSV headers", () => {
    const r = runTool({ ...HAPPY, competitorLabel: "RivalBlog" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).columns[2], "Competitor (RivalBlog)");
    const csv = r.values!["worksheetCsv"] as string;
    assert.ok(csv.split("\n")[0].includes("competitor_RivalBlog"));
  });

  it("competitor label longer than 60 chars is rejected", () => {
    const r = runTool({ ...HAPPY, competitorLabel: "x".repeat(MAX_LABEL_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /60/);
  });

  it("competitor label of exactly 60 chars is accepted", () => {
    const r = runTool({ ...HAPPY, competitorLabel: "x".repeat(MAX_LABEL_CHARS) });
    assert.equal(r.ok, true);
  });

  it("missing yourKeywords is rejected", () => {
    const r = runTool({ competitorKeywords: "apple" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Your keywords is required/);
  });

  it("missing competitorKeywords is rejected", () => {
    const r = runTool({ yourKeywords: "apple" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Competitor keywords is required/);
  });

  it("blank-only lists are rejected", () => {
    const r = runTool({ yourKeywords: "   \n  ", competitorKeywords: "apple" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one keyword/);
  });

  it("more than 500 keywords in one list is rejected", () => {
    const big = Array.from({ length: MAX_KEYWORDS_PER_LIST + 1 }, (_, i) => `kw${i}`).join("\n");
    const r = runTool({ yourKeywords: big, competitorKeywords: "apple" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /500/);
  });

  it("exactly 500 keywords is accepted", () => {
    const big = Array.from({ length: MAX_KEYWORDS_PER_LIST }, (_, i) => `kw${i}`).join("\n");
    const r = runTool({ yourKeywords: big, competitorKeywords: "kw0" });
    assert.equal(r.ok, true);
    assert.equal(r.values!["overlapCount"], 1);
  });

  it("non-text keyword entries are rejected", () => {
    const r = runTool({ yourKeywords: ["apple", { nope: true }], competitorKeywords: "apple" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /text only/);
  });

  it("CSV output is quoted and escaped correctly", () => {
    const r = runTool({
      yourKeywords: 'say "hello", friend',
      competitorKeywords: 'say "hello", friend\nother',
    });
    assert.equal(r.ok, true);
    const csv = (r.values!["worksheetCsv"] as string).split("\n");
    assert.equal(csv[0], "keyword,your_list,competitor_list,status");
    assert.equal(csv.length, 3); // header + 2 rows
    const quotedRow = csv.find((line) => line.includes("say"));
    assert.ok(quotedRow !== undefined);
    assert.ok(quotedRow.startsWith('"say ""hello"", friend",Yes,Yes,'));
  });

  it("overlapCount is a number and table shape is stable", () => {
    const r = runTool(HAPPY);
    assert.equal(typeof r.values!["overlapCount"], "number");
    const t = tableOf(r);
    assert.ok(t.rows.every((row) => row.length === 4));
    assert.ok(typeof r.values!["worksheetCsv"] === "string");
  });

  it("output ids match meta.ts (gapTable, overlapCount, worksheetCsv)", () => {
    const r = runTool(HAPPY);
    assert.deepEqual(Object.keys(r.values!).sort(), ["gapTable", "overlapCount", "worksheetCsv"]);
  });

  it("determinism: two runs produce identical output", () => {
    const a = runTool(HAPPY);
    const b = runTool(HAPPY);
    assert.deepEqual(a, b);
  });

  it("normalizeKeyword helper: trims, lowercases, collapses spaces", () => {
    assert.equal(normalizeKeyword("  SEO   Tips "), "seo tips");
    assert.equal(normalizeKeyword("Café"), "café");
  });
});
