import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  splitBudgets,
  TONES,
  SECTION_TEMPLATES,
  TONE_VOICE,
  codePoints,
  MAX_TOPIC_CHARS,
  MAX_CUSTOM_SECTIONS,
  MIN_TARGET_WORDS,
  MAX_TARGET_WORDS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    topic: "remote work productivity",
    targetWords: 800,
    tone: "professional",
  };
}

function sumBudgets(outline: { wordBudget: number }[]): number {
  return outline.reduce((a, s) => a + s.wordBudget, 0);
}

describe("newsletter-outline-generator", () => {
  it("happy path returns outline, totalWords, notices", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    const outline = r.values!.outline as {
      section: string;
      purpose: string;
      wordBudget: number;
    }[];
    assert.equal(outline.length, 8);
    for (const s of outline) {
      assert.ok(s.section.length > 0);
      assert.ok(s.purpose.length > 0);
      assert.ok(Number.isInteger(s.wordBudget) && s.wordBudget > 0);
    }
    assert.equal(r.values!.totalWords, 800);
    assert.ok(Array.isArray(r.values!.notices));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [...OUTPUT_IDS].sort());
  });

  it("word budgets always sum to exactly the target", () => {
    for (const target of [100, 333, 777, 1000, 2500, 10000]) {
      const r = runTool({ ...happyValues(), targetWords: target });
      assert.equal(r.ok, true);
      const outline = r.values!.outline as { wordBudget: number }[];
      assert.equal(sumBudgets(outline), target, `target ${target}`);
      assert.equal(r.values!.totalWords, target);
    }
  });

  it("deterministic: same inputs produce identical output", () => {
    assert.deepEqual(runTool(happyValues()), runTool(happyValues()));
  });

  it("missing topic errors", () => {
    const r = runTool({ ...happyValues(), topic: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic/i);
  });

  it("whitespace-only topic errors", () => {
    const r = runTool({ ...happyValues(), topic: "  " });
    assert.equal(r.ok, false);
  });

  it("invalid tone errors and lists valid tones", () => {
    const r = runTool({ ...happyValues(), tone: "formal" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /playful/);
  });

  it("missing targetWords errors", () => {
    const r = runTool({ ...happyValues(), targetWords: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error!, /word count/i);
  });

  it("targetWords NaN errors", () => {
    const r = runTool({ ...happyValues(), targetWords: NaN });
    assert.equal(r.ok, false);
  });

  it("targetWords Infinity errors", () => {
    const r = runTool({ ...happyValues(), targetWords: Infinity });
    assert.equal(r.ok, false);
  });

  it("targetWords below minimum clamps to 100", () => {
    const r = runTool({ ...happyValues(), targetWords: 10 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalWords, MIN_TARGET_WORDS);
  });

  it("targetWords above maximum clamps to 10000", () => {
    const r = runTool({ ...happyValues(), targetWords: 99999 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalWords, MAX_TARGET_WORDS);
  });

  it("fractional targetWords is floored", () => {
    const r = runTool({ ...happyValues(), targetWords: 850.9 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalWords, 850);
  });

  it("custom sections split the target equally", () => {
    const r = runTool({
      ...happyValues(),
      sections: "News, Deep dive, Tools",
      targetWords: 600,
    });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as {
      section: string;
      wordBudget: number;
    }[];
    assert.equal(outline.length, 3);
    assert.deepEqual(
      outline.map((s) => s.section),
      ["News", "Deep dive", "Tools"],
    );
    assert.equal(sumBudgets(outline), 600);
  });

  it("single custom section name errors", () => {
    const r = runTool({ ...happyValues(), sections: "Only one" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least two/i);
  });

  it("more than 12 custom sections are capped with a notice", () => {
    const many = Array.from({ length: 15 }, (_, i) => `Section ${i + 1}`).join(", ");
    const r = runTool({ ...happyValues(), sections: many, targetWords: 1200 });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as unknown[];
    assert.equal(outline.length, MAX_CUSTOM_SECTIONS);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes(String(MAX_CUSTOM_SECTIONS))));
    assert.equal(sumBudgets(outline as { wordBudget: number }[]), 1200);
  });

  it("non-string sections errors", () => {
    const r = runTool({ ...happyValues(), sections: 42 });
    assert.equal(r.ok, false);
  });

  it("overlong topic is truncated with a visible notice", () => {
    const r = runTool({ ...happyValues(), topic: "t".repeat(MAX_TOPIC_CHARS + 20) });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("shortened")));
    const outline = r.values!.outline as { purpose: string }[];
    for (const s of outline) {
      assert.ok(!s.purpose.includes("t".repeat(MAX_TOPIC_CHARS + 1)));
    }
  });

  it("emoji topic length measured in code points", () => {
    assert.equal(codePoints("📧📧"), 2);
    const r = runTool({ ...happyValues(), topic: "📧".repeat(MAX_TOPIC_CHARS) });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(!notices.some((n) => n.includes("shortened")));
  });

  it("tone voice guidance appears in every section purpose", () => {
    for (const tone of TONES) {
      const r = runTool({ ...happyValues(), tone });
      assert.equal(r.ok, true);
      const outline = r.values!.outline as { purpose: string }[];
      for (const s of outline) {
        assert.ok(s.purpose.includes(TONE_VOICE[tone]));
      }
    }
  });

  it("default template weights sum to 100", () => {
    const total = SECTION_TEMPLATES.reduce((a, t) => a + t.weight, 0);
    assert.equal(total, 100);
    assert.equal(SECTION_TEMPLATES.length, 8);
  });

  it("splitBudgets distributes exactly, even with rounding", () => {
    for (const target of [101, 333, 999, 1234]) {
      const weights = [8, 12, 34, 14, 10, 9, 6, 7];
      const budgets = splitBudgets(target, weights);
      assert.equal(
        budgets.reduce((a, b) => a + b, 0),
        target,
        `target ${target}`,
      );
      assert.ok(budgets.every((b) => Number.isInteger(b) && b > 0));
    }
  });

  it("topic HTML brackets are stripped", () => {
    const r = runTool({ ...happyValues(), topic: "<b>productivity</b>" });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as { purpose: string }[];
    for (const s of outline) {
      assert.ok(!s.purpose.includes("<") && !s.purpose.includes(">"));
    }
  });

  it("null values object errors", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
