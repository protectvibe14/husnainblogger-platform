/**
 * Tests for the Preheader Text Generator pure logic (tool-404).
 *
 * Run: node --test app/tools/email-marketing/preheader-text-generator/logic.test.ts
 *
 * Deterministic template library: 18 base templates + 5 tone extenders,
 * 6 variants per run, every variant 40-100 code-point characters, never
 * repeating the subject.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  TONES,
  VARIANT_COUNT,
  MIN_PREHEADER_CHARS,
  MAX_PREHEADER_CHARS,
  MIN_SUMMARY_CHARS,
  MAX_SUMMARY_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const META_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function expectOk(result: { ok: boolean; values?: Record<string, unknown>; error?: string }) {
  assert.strictEqual(result.ok, true, `expected ok, got error: ${result.error}`);
  assert.ok(result.values, "ok result must carry values");
  return result.values as Record<string, unknown>;
}

interface OptionsTable {
  columns: string[];
  rows: string[][];
}

function variants(v: Record<string, unknown>): { text: string; charCount: number }[] {
  const table = v.preheaderOptions as OptionsTable;
  return table.rows.map((r) => ({ text: r[0], charCount: Number(r[1]) }));
}

const BASE = { emailSummary: "Our new email course launches next week with five practical lessons" };

describe("runTool — validation", () => {
  it("rejects a missing emailSummary", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 0);
  });

  it("rejects whitespace-only and too-short summaries", () => {
    assert.strictEqual(runTool({ emailSummary: "   " }).ok, false);
    assert.strictEqual(runTool({ emailSummary: "tiny" }).ok, false);
  });

  it("rejects a non-string subjectLine", () => {
    assert.strictEqual(runTool({ ...BASE, subjectLine: 42 }).ok, false);
  });

  it("rejects an unknown tone", () => {
    const r = runTool({ ...BASE, tone: "mysterious" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("friendly"));
  });
});

describe("runTool — happy path", () => {
  it("returns VARIANT_COUNT variants with text and charCount", () => {
    const v = expectOk(runTool(BASE));
    const list = variants(v);
    assert.strictEqual(list.length, VARIANT_COUNT);
    const table = v.preheaderOptions as OptionsTable;
    assert.deepStrictEqual(table.columns, ["Preheader", "Characters"]);
    for (const o of list) {
      assert.ok(o.text.length > 0);
      assert.strictEqual(o.charCount, [...o.text].length);
    }
  });

  it("keeps every variant within 40-100 characters", () => {
    for (const tone of TONES) {
      const v = expectOk(runTool({ ...BASE, tone }));
      for (const o of variants(v)) {
        assert.ok(
          o.charCount >= MIN_PREHEADER_CHARS && o.charCount <= MAX_PREHEADER_CHARS,
          `tone=${tone} len=${o.charCount}: ${o.text}`,
        );
      }
    }
  });

  it("pads short summaries up to the 40-char minimum", () => {
    const v = expectOk(runTool({ emailSummary: "Sale starts now!" }));
    for (const o of variants(v)) {
      assert.ok(o.charCount >= MIN_PREHEADER_CHARS, o.text);
    }
  });

  it("trims long variants at a word boundary, never mid-word", () => {
    const v = expectOk(
      runTool({
        emailSummary:
          "Antidisestablishmentarianism supercalifragilisticexpialidocious pneumonoultramicroscopicsilicovolcanoconiosis",
      }),
    );
    for (const o of variants(v)) {
      assert.ok(o.charCount <= MAX_PREHEADER_CHARS, o.text);
      assert.ok(!/\S$/.test(o.text) || o.text.endsWith(o.text.trim()), "no trailing space");
    }
  });

  it("uses the summary content in every variant", () => {
    const v = expectOk(runTool(BASE));
    for (const o of variants(v)) {
      assert.ok(
        o.text.toLowerCase().includes("email course"),
        `variant should use the summary: ${o.text}`,
      );
    }
  });
});

describe("runTool — never repeats the subject", () => {
  it("skips variants that restate the subject", () => {
    const v = expectOk(
      runTool({
        subjectLine: "Our new email course launches next week with five practical lessons",
        ...BASE,
      }),
    );
    const list = variants(v);
    // With the subject restated, fewer templates qualify — but none of the
    // survivors may equal the subject.
    for (const o of list) {
      assert.notStrictEqual(
        o.text.toLowerCase(),
        "our new email course launches next week with five practical lessons",
      );
    }
  });

  it("keeps variants distinct from a short subject", () => {
    const v = expectOk(runTool({ ...BASE, subjectLine: "Course launch" }));
    const texts = variants(v).map((o) => o.text);
    assert.strictEqual(new Set(texts).size, texts.length);
    assert.ok(!texts.includes("Course launch"));
  });
});

describe("runTool — honesty and edges", () => {
  it("carries the Apple Mail iOS 18.2+ AI-summary notice", () => {
    const v = expectOk(runTool(BASE));
    assert.ok((v.notice as string).includes("iOS 18.2"), v.notice as string);
  });

  it("truncates overlong summaries with a visible notice", () => {
    const v = expectOk(
      runTool({
        emailSummary: "This is a fairly long summary sentence about our launch. ".repeat(20),
      }),
    );
    assert.ok((v.notice as string).includes(String(MAX_SUMMARY_CHARS)));
    for (const o of variants(v)) {
      assert.ok(o.charCount <= MAX_PREHEADER_CHARS);
    }
  });

  it("strips HTML from the summary", () => {
    const v = expectOk(runTool({ emailSummary: "<b>Big sale</b> on all email courses this week only" }));
    for (const o of variants(v)) {
      assert.ok(!o.text.includes("<b>"), o.text);
      assert.ok(o.text.includes("Big sale"));
    }
  });

  it("handles unicode summaries with code-point-safe counts", () => {
    const v = expectOk(runTool({ emailSummary: "🎉 大セール: メール講座が今週だけ特別価格です" }));
    for (const o of variants(v)) {
      assert.strictEqual(o.charCount, [...o.text].length);
      assert.ok(o.charCount >= MIN_PREHEADER_CHARS && o.charCount <= MAX_PREHEADER_CHARS);
    }
  });

  it("is deterministic: same inputs -> identical variants", () => {
    const input = { ...BASE, subjectLine: "Launch day", tone: "curious" };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });

  it("output ids exactly match meta.ts outputs ids", () => {
    const v = expectOk(runTool(BASE));
    assert.deepStrictEqual(Object.keys(v).sort(), META_OUTPUT_IDS);
  });

  it("error case carries a human message and no values", () => {
    const r = runTool({ emailSummary: "" });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 10);
  });

  it("documents the advertised bank sizes", () => {
    assert.strictEqual(VARIANT_COUNT, 6);
    assert.strictEqual(TONES.length, 5);
    assert.strictEqual(MIN_PREHEADER_CHARS, 40);
    assert.strictEqual(MAX_PREHEADER_CHARS, 100);
    assert.strictEqual(MIN_SUMMARY_CHARS, 10);
    assert.strictEqual(MAX_SUMMARY_CHARS, 300);
  });
});
