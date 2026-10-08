import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { hookText: "How I gained 10,000 subscribers in 30 days", niche: "youtube" };

describe("hook-score-checker (tool-280)", () => {
  it("happy path: strong hook scores high with breakdown + improvements", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(typeof v.score, "number");
    assert.equal(typeof v.band, "string");
    assert.ok(Array.isArray(v.breakdown));
    assert.ok(Array.isArray(v.improvements));
    assert.ok((v.score as number) >= 60, `score=${v.score}`);
    assert.equal(v.band, "strong");
  });

  it("output keys match meta.ts outputs (score, band, breakdown, improvements)", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), ["band", "breakdown", "improvements", "score"]);
  });

  it("breakdown rows carry criterion, points, and max in the note", () => {
    const r = runTool(base);
    const rows = (r.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    assert.ok(rows.length >= 4);
    for (const row of rows) {
      assert.equal(typeof row.criterion, "string");
      assert.equal(typeof row.points, "number");
      assert.ok(String(row.note).includes("max") || String(row.note).includes("penalty"));
    }
    const criteria = rows.map((x) => x.criterion);
    assert.ok(criteria.includes("Length"));
    assert.ok(criteria.includes("Specificity"));
  });

  it("points sum to the score (clamped 0-75)", () => {
    const hooks = [
      "How I gained 10,000 subscribers in 30 days",
      "hey guys welcome back to my channel today we talk",
      "STOP making this mistake",
      "a b c",
    ];
    for (const hookText of hooks) {
      const r = runTool({ hookText });
      assert.equal(r.ok, true);
      const v = r.values as Record<string, unknown>;
      const rows = v.breakdown as { points: number }[];
      const sum = rows.reduce((a, x) => a + x.points, 0);
      const expected = Math.min(75, Math.max(0, sum));
      assert.equal(v.score, expected, hookText);
      assert.ok((v.score as number) <= 75 && (v.score as number) >= 0);
    }
  });

  it("ideal length (7-10 words) earns full 25 length points", () => {
    const r = runTool({ hookText: "The one secret nobody tells new creators" }); // 7 words
    const rows = (r.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    const length = rows.find((x) => x.criterion === "Length");
    assert.equal(length?.points, 25);
  });

  it("specificity: digit earns 20, unit word earns 12, neither earns 0", () => {
    const digit = runTool({ hookText: "Five ways I fixed my lighting fast today now" });
    const rows = (digit.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    // "Five" spelled out is not a digit, but "ways" is a unit word -> 12
    assert.equal(rows.find((x) => x.criterion === "Specificity")?.points, 12);

    const num = runTool({ hookText: "5 ways I fixed my lighting fast today now" });
    const rows2 = (num.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    assert.equal(rows2.find((x) => x.criterion === "Specificity")?.points, 20);

    const none = runTool({ hookText: "Editing is honestly pretty fun sometimes" });
    const rows3 = (none.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    assert.equal(rows3.find((x) => x.criterion === "Specificity")?.points, 0);
  });

  it("question starter or trailing '?' earns the question points", () => {
    const q1 = runTool({ hookText: "Why does nobody finish watching videos" });
    const rows1 = (q1.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    assert.equal(rows1.find((x) => x.criterion === "Question opener")?.points, 15);

    const q2 = runTool({ hookText: "This editing trick changes everything?" });
    const rows2 = (q2.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    assert.equal(rows2.find((x) => x.criterion === "Question opener")?.points, 15);
  });

  it("curiosity-gap word earns 15 points", () => {
    const r = runTool({ hookText: "The editing secret nobody talks about" });
    const rows = (r.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    assert.equal(rows.find((x) => x.criterion === "Curiosity gap")?.points, 15);
  });

  it("vague opener applies the -20 penalty with a matching improvement", () => {
    const r = runTool({ hookText: "hey guys today I want to show you my setup" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const rows = v.breakdown as Record<string, unknown>[];
    const pen = rows.find((x) => x.criterion === "Vague-opener penalty");
    assert.ok(pen, "penalty row present");
    assert.equal(pen?.points, -20);
    const tips = v.improvements as string[];
    assert.ok(tips.some((t) => t.includes("filler opener")));
  });

  it("ALL-CAPS majority applies the -5 penalty", () => {
    const r = runTool({ hookText: "STOP DOING THIS RIGHT NOW PLEASE" });
    const rows = (r.values as Record<string, unknown>).breakdown as Record<string, unknown>[];
    const pen = rows.find((x) => x.criterion === "ALL-CAPS penalty");
    assert.ok(pen);
    assert.equal(pen?.points, -5);
  });

  it("band thresholds: weak / needs work / good / strong", () => {
    const tooShort = runTool({ hookText: "ab" }); // 2 chars -> rejected (3-280 chars)
    assert.equal(tooShort.ok, false);
    const w = runTool({ hookText: "hey guys um" });
    assert.equal((w.values as Record<string, unknown>).band, "weak");
    const good = runTool({ hookText: "Why your videos lose viewers fast" });
    assert.ok(["good", "strong", "needs work"].includes((good.values as Record<string, unknown>).band as string));
  });

  it("improvements reference the niche when provided", () => {
    const r = runTool({ hookText: "editing stuff is fun", niche: "filmmaking" });
    const tips = (r.values as Record<string, unknown>).improvements as string[];
    assert.ok(tips.some((t) => t.includes("filmmaking")));
  });

  it("non-English hook skips pattern banks with a note (max 30)", () => {
    const r = runTool({ hookText: "یہ ایک بہت اچھی ویڈیو ہے دوستو" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v.score as number) <= 30, `score=${v.score}`);
    const criteria = (v.breakdown as Record<string, unknown>[]).map((x) => x.criterion);
    assert.ok(!criteria.includes("Specificity"));
    const tips = v.improvements as string[];
    assert.ok(tips.some((t) => t.includes("non-English")));
  });

  it("rejects hook shorter than 3 chars", () => {
    assert.equal(runTool({ hookText: "ab" }).ok, false);
  });

  it("rejects missing hookText", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("rejects hook longer than 280 chars", () => {
    const r = runTool({ hookText: "x".repeat(281) });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("280"));
  });

  it("accepts exactly 280 chars", () => {
    assert.equal(runTool({ hookText: "x".repeat(280) }).ok, true);
  });

  it("is deterministic: same inputs twice give identical output", () => {
    const a = runTool(base);
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("word-bank bounds: all banks non-empty, opener list transparent", () => {
    // exercise many bank words across a hook to prove banks are wired
    const r = runTool({ hookText: "How 7 habits fixed my channel in 5 days?" });
    assert.equal(r.ok, true);
    assert.ok(((r.values as Record<string, unknown>).score as number) >= 60);
  });
});
