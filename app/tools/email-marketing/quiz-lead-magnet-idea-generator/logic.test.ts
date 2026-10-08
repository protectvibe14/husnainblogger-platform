/**
 * Tests for the Quiz Lead Magnet Idea Generator pure logic (tool-428).
 *
 * Run: node --test app/tools/email-marketing/quiz-lead-magnet-idea-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  QUIZ_TITLE_PATTERNS,
  SAMPLE_QUESTIONS,
  RESULT_TYPES,
  QUIZ_GOALS,
  QUIZ_GOAL_LABELS,
  QUIZZES_COLUMNS,
  IDEAS_PER_RUN,
  QUESTIONS_PER_IDEA,
  RESULTS_PER_IDEA,
  MAX_NICHE_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs, content as metaContent } from "./meta.ts";

const VALID = {
  niche: "email marketing",
  audience: "freelancers",
  quizGoal: "segment",
};

interface QuizzesTable {
  columns: string[];
  rows: string[][];
}

function quizzesOf(r: { ok: boolean; values?: Record<string, unknown> }): QuizzesTable {
  assert.strictEqual(r.ok, true);
  return r.values!["quizzes"] as QuizzesTable;
}

describe("runTool — happy path", () => {
  it("returns the fixed number of quiz ideas with full columns", () => {
    const t = quizzesOf(runTool({ ...VALID }));
    assert.deepStrictEqual(t.columns, [...QUIZZES_COLUMNS]);
    assert.strictEqual(t.rows.length, IDEAS_PER_RUN);
    for (const row of t.rows) {
      assert.strictEqual(row.length, 5);
      assert.ok(row[1].length > 0, "title non-empty");
      assert.ok(row[2].length > 0, "sample questions non-empty");
      assert.ok(row[3].length > 0, "result types non-empty");
      assert.strictEqual(row[4], "Segment");
    }
  });

  it("embeds the niche in titles and fills all placeholders", () => {
    const t = quizzesOf(runTool({ ...VALID }));
    const all = t.rows.map((r) => r.join(" ")).join(" ");
    assert.ok(all.includes("email marketing"));
    assert.ok(!all.includes("{niche}"), "no unfilled niche placeholder");
    assert.ok(!all.includes("{audience}"), "no unfilled audience placeholder");
  });

  it("fills the audience placeholder whenever a picked title uses it", () => {
    // The audience appears in 5 of 18 title patterns; across all three goals
    // at least one run must surface it, fully filled.
    let seen = false;
    for (const goal of QUIZ_GOALS) {
      const t = quizzesOf(runTool({ niche: "x", audience: "freelancers", quizGoal: goal }));
      const all = t.rows.map((r) => r[1]).join(" ");
      assert.ok(!all.includes("{audience}"));
      if (all.includes("freelancers")) seen = true;
    }
    assert.ok(seen, "audience rendered in at least one goal's titles");
  });

  it("shows exactly 3 sample questions and 3 result types per idea", () => {
    const t = quizzesOf(runTool({ ...VALID }));
    for (const row of t.rows) {
      assert.ok(row[2].includes("3)"), row[2]);
      const parts = row[3].split(" • ");
      assert.strictEqual(parts.length, RESULTS_PER_IDEA);
    }
  });

  it("labels each supported goal correctly", () => {
    for (const goal of QUIZ_GOALS) {
      const t = quizzesOf(runTool({ niche: "x", audience: "y", quizGoal: goal }));
      assert.strictEqual(t.rows.length, IDEAS_PER_RUN);
      for (const row of t.rows) {
        assert.strictEqual(row[4], QUIZ_GOAL_LABELS[goal]);
      }
    }
  });

  it("picks distinct titles within one run", () => {
    const t = quizzesOf(runTool({ ...VALID }));
    const titles = t.rows.map((r) => r[1]);
    assert.strictEqual(new Set(titles).size, titles.length);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing niche", () => {
    const r = runTool({ audience: "y", quizGoal: "segment" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("rejects whitespace-only niche", () => {
    const r = runTool({ niche: "  ", audience: "y", quizGoal: "segment" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects missing audience", () => {
    const r = runTool({ niche: "x", quizGoal: "segment" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /audience/i);
  });

  it("rejects missing quizGoal", () => {
    const r = runTool({ niche: "x", audience: "y" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /quiz goal/i);
  });

  it("rejects an unknown quizGoal value", () => {
    const r = runTool({ niche: "x", audience: "y", quizGoal: "convert" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /segment/);
  });

  it("rejects a non-string quizGoal", () => {
    const r = runTool({ niche: "x", audience: "y", quizGoal: 42 });
    assert.strictEqual(r.ok, false);
  });
});

describe("runTool — edge cases", () => {
  it("is deterministic: same inputs give identical output", () => {
    assert.deepStrictEqual(runTool({ ...VALID }), runTool({ ...VALID }));
  });

  it("different goals produce different sample questions", () => {
    const seg = quizzesOf(runTool({ ...VALID, quizGoal: "segment" }));
    const ent = quizzesOf(runTool({ ...VALID, quizGoal: "entertain" }));
    assert.notDeepStrictEqual(seg.rows.map((r) => r[2]), ent.rows.map((r) => r[2]));
  });

  it("truncates overlong niche with a visible notice", () => {
    const long = "z".repeat(MAX_NICHE_CHARS + 40);
    const t = quizzesOf(runTool({ niche: long, audience: "y", quizGoal: "qualify" }));
    assert.strictEqual(t.rows.length, IDEAS_PER_RUN + 1);
    assert.match(t.rows[t.rows.length - 1][1], new RegExp(`shortened from ${MAX_NICHE_CHARS + 40}`));
  });

  it("handles RTL / CJK input by code points without errors", () => {
    const r = runTool({ niche: "メール营销", audience: "フリーランサー", quizGoal: "qualify" });
    const t = quizzesOf(r);
    assert.strictEqual(t.rows.length, IDEAS_PER_RUN);
    assert.ok(t.rows[0][1].includes("メール营销"));
  });

  it("escapes HTML in user input", () => {
    const t = quizzesOf(runTool({ niche: "<img src=x>", audience: "y", quizGoal: "segment" }));
    for (const row of t.rows) {
      assert.ok(!row[1].includes("<img"), row[1]);
    }
  });

  it("result types are distinct within each idea", () => {
    const t = quizzesOf(runTool({ ...VALID }));
    for (const row of t.rows) {
      const parts = row[3].split(" • ");
      assert.strictEqual(new Set(parts).size, parts.length);
    }
  });
});

describe("bank bounds", () => {
  it("title bank has 18 non-empty patterns", () => {
    assert.strictEqual(QUIZ_TITLE_PATTERNS.length, 18);
    for (const p of QUIZ_TITLE_PATTERNS) {
      assert.ok(p.length > 0);
      assert.ok(p.includes("{niche}") || p.includes("{audience}"));
    }
  });

  it("question bank has 6 non-empty questions per goal", () => {
    assert.deepStrictEqual([...QUIZ_GOALS].sort(), ["entertain", "qualify", "segment"]);
    for (const g of QUIZ_GOALS) {
      assert.strictEqual(SAMPLE_QUESTIONS[g].length, 6, g);
      for (const q of SAMPLE_QUESTIONS[g]) assert.ok(q.length > 0);
    }
  });

  it("result-type bank has 12 non-empty patterns", () => {
    assert.strictEqual(RESULT_TYPES.length, 12);
    for (const r of RESULT_TYPES) assert.ok(r.length > 0);
    assert.ok(
      RESULT_TYPES.some((r) => r.includes("{niche}")),
      "at least one result type fills the niche",
    );
  });

  it("counts match documented constants", () => {
    assert.strictEqual(IDEAS_PER_RUN, 4);
    assert.strictEqual(QUESTIONS_PER_IDEA, 3);
    assert.strictEqual(RESULTS_PER_IDEA, 3);
  });
});

describe("meta contract", () => {
  it("output ids match meta outputs", () => {
    assert.deepStrictEqual(
      metaOutputs.map((o) => o.id),
      ["quizzes"],
    );
  });

  it("title is <= 60 chars and description is 140–160 chars", () => {
    assert.ok(metaContent.title.length <= 60, metaContent.title);
    assert.ok(
      metaContent.description.length >= 140 && metaContent.description.length <= 160,
      `${metaContent.description.length}: ${metaContent.description}`,
    );
  });

  it("jsonLd has SoftwareApplication, no FAQPage, correct breadcrumb", () => {
    const jsonLd = metaContent.jsonLd as Array<Record<string, unknown>>;
    const types = jsonLd.map((j) => j["@type"]);
    assert.ok(types.includes("SoftwareApplication"));
    assert.ok(!types.includes("FAQPage"));
    const bc = jsonLd.find((j) => j["@type"] === "BreadcrumbList") as {
      itemListElement: Array<{ position: number; name: string; item: string }>;
    };
    const crumb3 = bc.itemListElement.find((e) => e.position === 3);
    assert.strictEqual(crumb3!.name, "Email Marketing Tools");
    assert.strictEqual(crumb3!.item, "https://husnainblogger.com/tools/email-marketing/");
    const app = jsonLd.find((j) => j["@type"] === "SoftwareApplication") as { url: string };
    assert.strictEqual(
      app.url,
      "https://husnainblogger.com/tools/email-marketing/quiz-lead-magnet-idea-generator/",
    );
  });
});
