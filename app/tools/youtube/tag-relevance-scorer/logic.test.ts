import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TAGS_HARD_LIMIT, extractKeywords, parseTags, scoreTags, runTool } from "./logic.ts";

describe("extractKeywords", () => {
  it("removes stopwords and dedupes", () => {
    assert.deepEqual(extractKeywords("How to Bake the Perfect Cake at Home"), ["bake", "perfect", "cake", "home"]);
  });
  it("handles unicode titles", () => {
    assert.deepEqual(extractKeywords("最好的 蛋糕 食谱"), ["最好的", "蛋糕", "食谱"]);
  });
  it("throws on non-string", () => {
    assert.throws(() => extractKeywords(5 as unknown as string), TypeError);
  });
});

describe("parseTags", () => {
  it("splits on commas and newlines, trims, drops empties", () => {
    assert.deepEqual(parseTags("a, b\nc ,,  d "), ["a", "b", "c", "d"]);
  });
  it("empty input -> empty array", () => {
    assert.deepEqual(parseTags(""), []);
    assert.deepEqual(parseTags(" , \n "), []);
  });
});

describe("scoreTags — normal cases", () => {
  it("strong tag set scores high", () => {
    const r = scoreTags(
      "How to Bake Sourdough Bread at Home",
      "how to bake sourdough bread at home, sourdough bread recipe, bake sourdough at home for beginners, sourdough, bread baking",
    );
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 80, `expected >=80, got ${r.score}`);
    assert.equal(r.grade, "Strong");
    assert.equal(r.keywordsMissing.length, 0);
    assert.equal(r.overBudget, false);
    const names = r.factors.map((f) => f.name);
    assert.deepEqual(names, ["Keyword coverage", "Exact-title tag", "Multi-word specificity", "Long-tail presence", "Budget discipline", "No waste"]);
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
  it("weak tag set scores low", () => {
    const r = scoreTags("Sourdough Bread Masterclass", "video, youtube, food, vlog");
    assert.ok(r.score < 40, `expected <40, got ${r.score}`);
    assert.equal(r.grade, "Weak");
    assert.ok(r.keywordsMissing.length > 0);
  });
  it("per-tag verdicts classify correctly", () => {
    const r = scoreTags("Sourdough Bread", "Sourdough Bread, sourdough, sourdough, x, bread recipe tips");
    const byTag: Record<string, string> = {};
    for (const e of r.perTag) byTag[e.tag] = e.verdict;
    assert.equal(byTag["Sourdough Bread"], "strong"); // exact title
    assert.equal(byTag["sourdough"], "wasted"); // duplicate
    assert.equal(byTag["x"], "wasted"); // too short
    assert.equal(byTag["bread recipe tips"], "strong"); // keyword match
  });
});

describe("scoreTags — boundaries", () => {
  it("over-budget tags flagged", () => {
    const big = "word ".repeat(130).trim(); // > 500 chars
    const r = scoreTags("Some Title Words", big);
    assert.equal(r.overBudget, true);
    assert.equal(r.budgetRemaining, 0);
    const budget = r.factors.find((f) => f.name === "Budget discipline")!;
    assert.equal(budget.points, 0);
  });
  it("exactly 500 chars is not over budget", () => {
    const tags = "a".repeat(248) + "," + "b".repeat(251); // 248+1+251 = 500
    const r = scoreTags("Alpha Beta", tags);
    assert.equal(r.totalChars, 500);
    assert.equal(r.overBudget, false);
  });
  it("single multi-word tag gets partial specificity credit", () => {
    const r = scoreTags("Cake Recipe", "cake recipe, xyz");
    const f = r.factors.find((x) => x.name === "Multi-word specificity")!;
    assert.equal(f.points, 8);
  });
});

describe("scoreTags — empty / invalid", () => {
  it("empty tag list -> score 0 with empty verdicts", () => {
    const r = scoreTags("Cake Recipe", "");
    assert.equal(r.score, 0);
    assert.equal(r.grade, "Weak");
    assert.deepEqual(r.perTag, []);
  });
  it("throws on empty title", () => {
    assert.throws(() => scoreTags("   ", "a, b"), /non-empty title/);
  });
  it("throws when title has no scorable keywords", () => {
    assert.throws(() => scoreTags("the and of", "a"), /no scorable keywords/);
  });
  it("throws TypeError on non-string inputs", () => {
    assert.throws(() => scoreTags(1 as unknown as string, "a"), TypeError);
    assert.throws(() => scoreTags("t", null as unknown as string), TypeError);
  });
});

describe("scoreTags — unicode", () => {
  it("CJK keywords matched case-insensitively", () => {
    const r = scoreTags("蛋糕 食谱", "蛋糕食谱, 蛋糕, 甜点");
    assert.ok(r.keywordsCovered.includes("蛋糕"));
  });
  it("emoji in tags does not crash and counts as weak/ok", () => {
    const r = scoreTags("Cake Recipe", "🎂 cake, recipe");
    assert.ok(r.perTag.length === 2);
  });
});

describe("constants", () => {
  it("TAGS_HARD_LIMIT matches platform rule", () => {
    assert.equal(TAGS_HARD_LIMIT, 500);
  });
});

describe("runTool adapter — happy path", () => {
  it("returns contract-shaped result for valid input", () => {
    const r = runTool({ title: "How to Bake Sourdough Bread", tags: "sourdough bread recipe, sourdough baking tips, bread" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    const values = r.values as Record<string, unknown>;
    assert.equal(typeof values.score, "number");
    assert.ok((values.score as number) >= 0 && (values.score as number) <= 100);
    assert.ok(["Strong", "Good", "Needs work", "Weak"].includes(values.grade as string));
    assert.ok(Array.isArray(values.perTagVerdicts));
    assert.equal((values.perTagVerdicts as string[]).length, 3);
    assert.ok((values.budgetUsage as string).includes(`${TAGS_HARD_LIMIT}`));
    assert.ok(Array.isArray(values.missingKeywords));
    assert.ok((values.heuristicNote as string).toLowerCase().includes("heuristic"));
  });
  it("per-tag verdict lines carry verdict, tag, and reason", () => {
    const r = runTool({ title: "Cake Recipe", tags: "cake recipe" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    const lines = (r.values as Record<string, unknown>).perTagVerdicts as string[];
    assert.match(lines[0], /STRONG — cake recipe \(.+\)/);
  });
});

describe("runTool adapter — validation errors", () => {
  it("empty title -> error", () => {
    const r = runTool({ title: "   ", tags: "a" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /title/i);
  });
  it("missing title -> error", () => {
    const r = runTool({ tags: "a" });
    assert.equal(r.ok, false);
  });
  it("empty tag list -> error (spec validation: at least 1 tag)", () => {
    const r = runTool({ title: "Cake Recipe", tags: "  , \n " });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /at least 1 tag/);
  });
  it("non-string tags -> error", () => {
    const r = runTool({ title: "Cake Recipe", tags: 5 });
    assert.equal(r.ok, false);
  });
  it("over-500-char tags -> error", () => {
    const big = "word,".repeat(120); // 600 chars incl. commas
    const r = runTool({ title: "Some Title Words", tags: big });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /500/);
  });
  it("title with no scorable keywords -> engine error surfaced", () => {
    const r = runTool({ title: "the and of", tags: "cake" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /scorable keywords/);
  });
});

describe("runTool adapter — determinism & output contract", () => {
  it("same input -> identical output (run twice)", () => {
    const v = { title: "Sourdough Bread Masterclass", tags: "sourdough, bread recipe, baking" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("values keys match meta outputs", () => {
    const r = runTool({ title: "Cake Recipe", tags: "cake, recipe" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(Object.keys(r.values as Record<string, unknown>).sort(), [
      "budgetUsage",
      "grade",
      "heuristicNote",
      "missingKeywords",
      "perTagVerdicts",
      "score",
    ]);
  });
});
