import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  X_POST_LIMIT,
  xWeightedLength,
  scoreSpecificity,
  scoreCuriosityGap,
  scoreClarity,
  scoreContrarianEdge,
  verdictFor,
  scoreHook,
  buildSuggestions,
  buildNotes,
  runTool,
} from "./logic.ts";

describe("xWeightedLength — X counting rules", () => {
  it("plain text counts 1 per char", () => {
    assert.equal(xWeightedLength("hello"), 5);
  });
  it("URL counts as 23 chars regardless of length", () => {
    assert.equal(xWeightedLength("https://example.com/a/very/long/path?x=1"), 23);
  });
  it("emoji counts as 2 chars", () => {
    assert.equal(xWeightedLength("🔥"), 2);
    assert.equal(xWeightedLength("a🔥b"), 4);
  });
  it("CJK characters count as 2 chars", () => {
    assert.equal(xWeightedLength("蛋糕"), 4);
  });
  it("throws TypeError on non-string", () => {
    assert.throws(() => xWeightedLength(42 as unknown as string), TypeError);
  });
  it("X_POST_LIMIT matches the platform rule", () => {
    assert.equal(X_POST_LIMIT, 280);
  });
});

describe("dimension scorers", () => {
  it("specificity rewards numbers, timeframes, money, quantity words", () => {
    const s = scoreSpecificity("I made $1,000 in 30 days with these 7 steps");
    assert.equal(s, 8); // digit + timeframe + money + quantity
  });
  it("specificity floors at 0 signals", () => {
    assert.equal(scoreSpecificity("this is nice"), 0);
  });
  it("specificity caps at 10", () => {
    assert.ok(scoreSpecificity("5 ways to save $100 in 7 days: 3 steps, 10x results") <= 10);
  });
  it("curiosity gap rewards questions and open loops", () => {
    const s = scoreCuriosityGap("What happens when you quit sugar for 30 days? The secret nobody talks about…");
    assert.ok(s >= 6, `expected >=6, got ${s}`);
  });
  it("curiosity gap penalizes hooks that answer themselves", () => {
    const plain = scoreCuriosityGap("What is a good hook because it has numbers");
    const answered = scoreCuriosityGap("What is a good hook because it has numbers and it works so that you win");
    assert.ok(answered < plain, `expected ${answered} < ${plain}`);
  });
  it("clarity starts at 10 and deducts clutter", () => {
    assert.equal(scoreClarity("Simple clear hook."), 10);
    const cluttered = scoreClarity("BUY NOW!!! #a #b #c #d Wow. So great. Amazing. 😀😃😄😁😆🤣");
    assert.ok(cluttered < 10, `expected <10, got ${cluttered}`);
  });
  it("clarity floors at 0", () => {
    assert.ok(scoreClarity("AAAA #a #b #c #d #e. x. y. z. 😀😃😄😁😆🤣😇") >= 0);
  });
  it("contrarian edge rewards stance signals", () => {
    assert.ok(scoreContrarianEdge("Stop doing this. Unpopular opinion: it's a myth.") >= 6);
    assert.equal(scoreContrarianEdge("have a nice day"), 0);
  });
});

describe("verdictFor", () => {
  it("thresholds: strong >= 7, okay >= 4.5, weak < 4.5", () => {
    assert.equal(verdictFor(7), "strong");
    assert.equal(verdictFor(9.2), "strong");
    assert.equal(verdictFor(4.5), "okay");
    assert.equal(verdictFor(6.9), "okay");
    assert.equal(verdictFor(4.4), "weak");
    assert.equal(verdictFor(0), "weak");
  });
});

describe("scoreHook", () => {
  it("strong hook scores high with strong verdict", () => {
    const r = scoreHook("Why does nobody mention the real secret behind $10k months? Stop guessing — I did it in 90 days with 3 steps.");
    assert.ok(r.total >= 7, `expected >=7, got ${r.total}`);
    assert.equal(r.verdict, "strong");
    assert.equal(r.overLimit, false);
  });
  it("weak hook scores low with weak verdict", () => {
    const r = scoreHook("have a nice day everyone");
    assert.ok(r.total < 4.5, `expected <4.5, got ${r.total}`);
    assert.equal(r.verdict, "weak");
  });
  it("dimensions have fixed documented weights summing to 100%", () => {
    const r = scoreHook("Why I quit social media for 30 days");
    const weights = r.dimensions.map((d) => d.weight);
    assert.deepEqual(weights, ["30%", "30%", "20%", "20%"]);
  });
  it("weighted total matches documented formula", () => {
    const r = scoreHook("7 mistakes that cost me $5,000 in 60 days");
    const expected = Math.round((0.3 * r.specificity + 0.3 * r.curiosityGap + 0.2 * r.clarity + 0.2 * r.contrarianEdge) * 10) / 10;
    assert.equal(r.total, expected);
  });
  it("over-280 weighted chars flags overLimit", () => {
    const r = scoreHook("a".repeat(300));
    assert.equal(r.overLimit, true);
    assert.ok(r.weightedChars > 280);
  });
  it("throws on empty / non-string input", () => {
    assert.throws(() => scoreHook("   "), /non-empty hook/);
    assert.throws(() => scoreHook(7 as unknown as string), TypeError);
  });
});

describe("buildSuggestions / buildNotes", () => {
  it("weak dimensions produce targeted suggestions", () => {
    const r = scoreHook("have a nice day everyone");
    const s = buildSuggestions(r, "have a nice day everyone");
    assert.ok(s.length >= 2);
    assert.ok(s.some((x) => x.includes("number")));
  });
  it("strong hook gets the test-as-is suggestion", () => {
    const r = scoreHook("Stop posting at random. I gained 10k followers in 90 days with this 3-step system — here's why nobody talks about it?");
    const s = buildSuggestions(r, "hook");
    assert.ok(s.length >= 1);
  });
  it("notes always carry the heuristic label", () => {
    const r = scoreHook("Why I quit social media for 30 days");
    const notes = buildNotes(r, "Why I quit social media for 30 days");
    assert.ok(notes[0].includes("not a virality prediction"));
  });
  it("over-limit hooks get an over-limit warning note", () => {
    const hook = "b".repeat(300);
    const r = scoreHook(hook);
    const notes = buildNotes(r, hook);
    assert.ok(notes.some((n) => n.includes("280-character limit")));
  });
  it("non-English hooks get a limited-coverage note", () => {
    const hook = "蛋糕很好吃";
    const r = scoreHook(hook);
    const notes = buildNotes(r, hook);
    assert.ok(notes.some((n) => n.includes("Limited heuristic coverage")));
  });
});

describe("runTool", () => {
  it("happy path returns all documented output ids", () => {
    const res = runTool({ hookText: "Why I quit social media for 30 days — the results shocked me" });
    assert.equal(res.ok, true);
    const keys = Object.keys(res.values ?? {}).sort();
    assert.deepEqual(keys, ["notes", "scores", "suggestions", "totalScore", "verdict"]);
  });
  it("verdict is one of strong|okay|weak", () => {
    const res = runTool({ hookText: "7 mistakes that cost me $5,000" });
    assert.ok(["strong", "okay", "weak"].includes(res.values?.verdict as string));
  });
  it("scores table has the four rubric dimensions", () => {
    const res = runTool({ hookText: "7 mistakes that cost me $5,000" });
    const table = res.values?.scores as { columns: string[]; rows: unknown[][] };
    assert.deepEqual(table.columns, ["Dimension", "Score (0–10)", "Weight", "What it measures"]);
    assert.deepEqual(table.rows.map((r) => r[0]), ["Specificity", "Curiosity gap", "Clarity", "Contrarian edge"]);
  });
  it("over-limit hook still analyzes with a warning (no error)", () => {
    const res = runTool({ hookText: "c".repeat(300) });
    assert.equal(res.ok, true);
    const notes = res.values?.notes as string[];
    assert.ok(notes.some((n) => n.includes("280-character limit")));
  });
  it("missing hookText -> validation error", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /hook text/i);
  });
  it("empty hookText -> validation error", () => {
    const res = runTool({ hookText: "   " });
    assert.equal(res.ok, false);
  });
  it("non-string hookText -> validation error", () => {
    const res = runTool({ hookText: 123 });
    assert.equal(res.ok, false);
  });
  it("deterministic: same input -> identical output", () => {
    const hook = "Stop doing cardio. I lost 10kg in 60 days with this?";
    const a = runTool({ hookText: hook });
    const b = runTool({ hookText: hook });
    assert.deepEqual(a, b);
  });
});
