/**
 * Tests for the Email CTA Button Text Generator pure logic (tool-405).
 *
 * Run: node --test app/tools/email-marketing/email-cta-button-text-generator/logic.test.ts
 *
 * Deterministic template library: 20 verb-first templates + 4 tones x 4
 * variants, up to 12 CTAs per run, word limit default 4 (range 1-8).
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  TONES,
  DEFAULT_MAX_WORDS,
  MIN_MAX_WORDS,
  MAX_MAX_WORDS,
  MAX_ACTION_CHARS,
  SERVE_LIMIT,
  TAP_WIDTH_WARN_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const META_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function expectOk(result: { ok: boolean; values?: Record<string, unknown>; error?: string }) {
  assert.strictEqual(result.ok, true, `expected ok, got error: ${result.error}`);
  assert.ok(result.values, "ok result must carry values");
  return result.values as Record<string, unknown>;
}

interface CtaTable {
  columns: string[];
  rows: string[][];
}

function ctas(v: Record<string, unknown>): { text: string; wordCount: number }[] {
  const table = v.ctaTexts as CtaTable;
  return table.rows.map((r) => ({ text: r[0], wordCount: Number(r[1]) }));
}

const BASE = { action: "free guide" };

describe("runTool — validation", () => {
  it("rejects a missing action", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 0);
  });

  it("rejects whitespace-only action", () => {
    assert.strictEqual(runTool({ action: "   " }).ok, false);
  });

  it("rejects a non-string audience", () => {
    assert.strictEqual(runTool({ ...BASE, audience: 5 }).ok, false);
  });

  it("rejects an unknown tone", () => {
    const r = runTool({ ...BASE, tone: "angry" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("direct"));
  });

  it("rejects maxWords 0, 9, NaN, and non-integers", () => {
    for (const maxWords of [0, 9, -1, 2.5, Number.NaN, "lots"]) {
      const r = runTool({ ...BASE, maxWords });
      assert.strictEqual(r.ok, false, `maxWords=${String(maxWords)}`);
    }
  });

  it("accepts maxWords at the documented bounds 1 and 8", () => {
    const oneWordAction = { action: "guide", maxWords: 8 };
    const v = expectOk(runTool(oneWordAction));
    assert.ok(ctas(v).length > 0);
  });

  it("returns an honest error when nothing fits the word limit", () => {
    // Every template is verb-first: minimum 2 words, so maxWords=1 fits nothing.
    const r = runTool({ action: "guide", maxWords: 1 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes('word limit'), r.error ?? 'failed');
  });
});

describe("runTool — happy path", () => {
  it("serves verb-first CTAs within the default 4-word limit", () => {
    const v = expectOk(runTool(BASE));
    const list = ctas(v);
    assert.ok(list.length > 0 && list.length <= SERVE_LIMIT);
    const table = v.ctaTexts as CtaTable;
    assert.deepStrictEqual(table.columns, ["Button text", "Words"]);
    for (const c of list) {
      assert.ok(c.wordCount >= 1 && c.wordCount <= DEFAULT_MAX_WORDS, c.text);
      assert.strictEqual(c.wordCount, c.text.split(/\s+/).length);
      assert.ok(c.text.toLowerCase().includes("free guide"), c.text);
    }
  });

  it("uses the audience in the audience template", () => {
    const v = expectOk(runTool({ ...BASE, audience: "bloggers", maxWords: 8 }));
    const texts = ctas(v).map((c) => c.text);
    assert.ok(
      texts.some((t) => t.includes("bloggers")),
      texts.join(" | "),
    );
  });

  it("honors tone: urgent adds urgency markers", () => {
    const v = expectOk(runTool({ ...BASE, tone: "urgent", maxWords: 8 }));
    const joined = ctas(v).map((c) => c.text).join(" | ");
    assert.ok(/!|don't wait|before it's gone/i.test(joined), joined);
  });

  it("honors tone: playful adds playful markers", () => {
    const v = expectOk(runTool({ ...BASE, tone: "playful", maxWords: 8 }));
    const joined = ctas(v).map((c) => c.text).join(" | ");
    assert.ok(/psst|yes please/i.test(joined), joined);
  });

  it("serves all four tones without failing", () => {
    for (const tone of TONES) {
      const v = expectOk(runTool({ ...BASE, tone }));
      assert.ok(ctas(v).length > 0, tone);
    }
  });

  it("respects a larger word limit with longer options", () => {
    const small = ctas(expectOk(runTool({ ...BASE, maxWords: 4 })));
    const large = ctas(expectOk(runTool({ ...BASE, maxWords: 8 })));
    assert.ok(large.length >= small.length);
    assert.ok(large.some((c) => c.wordCount > 4), "8-word limit should allow longer CTAs");
  });
});

describe("runTool — warnings, edges, determinism", () => {
  it("warns about mobile tap width for long labels", () => {
    const v = expectOk(
      runTool({ action: "premium annual membership plan", maxWords: 8 }),
    );
    const warnings = v.warnings as string[];
    assert.ok(
      warnings.some((w) => w.includes(String(TAP_WIDTH_WARN_CHARS))),
      warnings.join(" | "),
    );
  });

  it("emits no tap-width warning when all labels are short", () => {
    const v = expectOk(runTool({ action: "guide" }));
    assert.deepStrictEqual(v.warnings, []);
  });

  it("truncates overlong action with a visible notice", () => {
    const v = expectOk(runTool({ action: "x".repeat(100) }));
    assert.ok((v.notice as string).includes(String(MAX_ACTION_CHARS)));
    for (const c of ctas(v)) {
      assert.ok(!c.text.includes("x".repeat(70)));
    }
  });

  it("strips HTML from the action", () => {
    const v = expectOk(runTool({ action: "<b>free guide</b>" }));
    for (const c of ctas(v)) {
      assert.ok(!c.text.includes("<b>"), c.text);
    }
  });

  it("never returns duplicate CTAs within one run", () => {
    const v = expectOk(runTool({ ...BASE, maxWords: 8 }));
    const texts = ctas(v).map((c) => c.text);
    assert.strictEqual(new Set(texts).size, texts.length);
  });

  it("handles unicode actions with code-point-safe logic", () => {
    const v = expectOk(runTool({ action: "🎉 party kit" }));
    assert.ok(ctas(v).length > 0);
    for (const c of ctas(v)) {
      assert.ok(c.wordCount <= DEFAULT_MAX_WORDS);
    }
  });

  it("is deterministic: same inputs -> identical CTAs", () => {
    const input = { ...BASE, tone: "friendly", maxWords: 6, audience: "creators" };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });

  it("output ids exactly match meta.ts outputs ids", () => {
    const v = expectOk(runTool(BASE));
    assert.deepStrictEqual(Object.keys(v).sort(), META_OUTPUT_IDS);
  });

  it("error case carries a human message and no values", () => {
    const r = runTool({ action: "" });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 10);
  });

  it("documents the advertised bank sizes and limits", () => {
    assert.strictEqual(TONES.length, 4);
    assert.strictEqual(DEFAULT_MAX_WORDS, 4);
    assert.strictEqual(MIN_MAX_WORDS, 1);
    assert.strictEqual(MAX_MAX_WORDS, 8);
    assert.strictEqual(MAX_ACTION_CHARS, 60);
    assert.strictEqual(SERVE_LIMIT, 12);
    assert.strictEqual(TAP_WIDTH_WARN_CHARS, 24);
  });
});
