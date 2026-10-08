import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, BANK_SIZES, ASSUMPTIONS } from "./logic.ts";

describe("story-quiz-generator", () => {
  it("happy path: table + copyAll + quizCount with correct shape", () => {
    const r = runTool({ topic: "email marketing", count: 2 });
    assert.equal(r.ok, true);
    assert.ok(r.values);
    const table = r.values["quizzes"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Question", "Options (A–D)", "Correct answer", "Why"]);
    assert.equal(table.rows.length, 2);
    assert.equal(r.values["quizCount"], 2);
    assert.ok(typeof r.values["copyAll"] === "string");
  });

  it("defaults to 3 quizzes when count is omitted", () => {
    const r = runTool({ topic: "yoga" });
    assert.equal(r.ok, true);
    const table = r.values!["quizzes"] as { rows: string[][] };
    assert.equal(table.rows.length, 3);
    assert.equal(r.values!["quizCount"], 3);
  });

  it("count accepts a numeric string", () => {
    const r = runTool({ topic: "yoga", count: "5" });
    assert.equal(r.ok, true);
    assert.equal(r.values!["quizCount"], 5);
  });

  it("each quiz row has 4 labeled options and a valid correct answer", () => {
    const r = runTool({ topic: "coding", count: 5 });
    assert.equal(r.ok, true);
    const table = r.values!["quizzes"] as { rows: string[][] };
    for (const row of table.rows) {
      for (const label of ["A)", "B)", "C)", "D)"]) {
        assert.ok(row[1].includes(label), row[1]);
      }
      assert.match(row[2], /^[A-D]\)/);
      assert.ok(row[3].length > 10, "explanation present");
    }
  });

  it("correct answer matches one of the four options", () => {
    const r = runTool({ topic: "coding", count: 5 });
    const table = r.values!["quizzes"] as { rows: string[][] };
    for (const row of table.rows) {
      const answerText = row[2].replace(/^[A-D]\) /, "");
      assert.ok(row[1].includes(answerText), answerText);
    }
  });

  it("topic inserted, no leftover placeholders", () => {
    const r = runTool({ topic: "sourdough baking", count: 5 });
    const table = r.values!["quizzes"] as { rows: string[][] };
    for (const row of table.rows) {
      for (const cell of row) assert.ok(!cell.includes("{topic}"), cell);
      assert.ok(row[0].includes("sourdough baking"), row[0]);
    }
  });

  it("topic is trimmed", () => {
    const r = runTool({ topic: "  fitness  ", count: 1 });
    const table = r.values!["quizzes"] as { rows: string[][] };
    assert.ok(table.rows[0][0].includes("fitness"));
    assert.ok(!table.rows[0][0].includes("  fitness"));
  });

  it("errors on missing topic", () => {
    const r = runTool({ count: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("errors on empty topic", () => {
    const r = runTool({ topic: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("topic"));
  });

  it("errors on non-string topic", () => {
    const r = runTool({ topic: null });
    assert.equal(r.ok, false);
  });

  it("errors when count is 0", () => {
    const r = runTool({ topic: "x", count: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("1") && r.error!.includes("5"));
  });

  it("errors when count exceeds 5", () => {
    const r = runTool({ topic: "x", count: 6 });
    assert.equal(r.ok, false);
  });

  it("errors on fractional count", () => {
    const r = runTool({ topic: "x", count: 2.5 });
    assert.equal(r.ok, false);
  });

  it("errors on non-numeric count", () => {
    const r = runTool({ topic: "x", count: "lots" });
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs give identical output", () => {
    const a = runTool({ topic: "guitar", count: 4 });
    const b = runTool({ topic: "guitar", count: 4 });
    assert.deepEqual(a, b);
  });

  it("count=5 never repeats a quiz (bank has 8)", () => {
    const r = runTool({ topic: "x", count: 5 });
    const table = r.values!["quizzes"] as { rows: string[][] };
    const questions = table.rows.map((row) => row[0]);
    assert.equal(new Set(questions).size, 5);
  });

  it("bank sizes documented and consistent", () => {
    assert.equal(BANK_SIZES.quizTemplates, 8);
    assert.equal(BANK_SIZES.optionsPerQuiz, 4);
    assert.ok(BANK_SIZES.quizTemplates >= BANK_SIZES.maxCount);
  });

  it("assumptions warn that answers are common-sense defaults, not facts", () => {
    assert.ok(ASSUMPTIONS.length >= 1);
    assert.ok(ASSUMPTIONS.some((a) => a.toLowerCase().includes("not verified facts")));
  });

  it("copyAll includes every question, options and correct answer", () => {
    const r = runTool({ topic: "chess", count: 3 });
    const table = r.values!["quizzes"] as { rows: string[][] };
    const copy = r.values!["copyAll"] as string;
    for (const row of table.rows) {
      assert.ok(copy.includes(row[0]));
      assert.ok(copy.includes("Correct:"));
    }
  });

  it("output ids are the contract ids: quizzes, copyAll, quizCount", () => {
    const r = runTool({ topic: "x", count: 1 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "quizCount", "quizzes"]);
  });
});
