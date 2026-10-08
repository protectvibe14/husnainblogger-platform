/**
 * Tests for the Email Subject Line Generator pure logic (tool-402).
 *
 * Run: node --test app/tools/email-marketing/email-subject-line-generator/logic.test.ts
 *
 * Deterministic template library: identical inputs always give identical
 * output. Bank sizes are asserted from the documented comment in logic.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  PURPOSES,
  TONES,
  DEFAULT_COUNT,
  MAX_COUNT,
  MIN_COUNT,
  MAX_INPUT_CHARS,
  MOBILE_FIT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const META_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function expectOk(result: { ok: boolean; values?: Record<string, unknown>; error?: string }) {
  assert.strictEqual(result.ok, true, `expected ok, got error: ${result.error}`);
  assert.ok(result.values, "ok result must carry values");
  return result.values as Record<string, unknown>;
}

const BASE = { emailPurpose: "newsletter", topic: "SEO tips", audience: "bloggers" };

describe("runTool — validation", () => {
  it("rejects a missing emailPurpose", () => {
    const r = runTool({ topic: "x", audience: "y" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
    assert.strictEqual(r.values, undefined);
  });

  it("rejects an unknown emailPurpose", () => {
    const r = runTool({ ...BASE, emailPurpose: "birthday" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("newsletter"));
  });

  it("rejects a missing topic", () => {
    const r = runTool({ emailPurpose: "promo", audience: "shoppers" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("topic"));
  });

  it("rejects whitespace-only topic and audience", () => {
    assert.strictEqual(runTool({ ...BASE, topic: "   " }).ok, false);
    assert.strictEqual(runTool({ ...BASE, audience: "\t " }).ok, false);
  });

  it("rejects a non-string topic", () => {
    assert.strictEqual(runTool({ ...BASE, topic: 7 }).ok, false);
  });

  it("rejects an unknown tone", () => {
    const r = runTool({ ...BASE, tone: "angry" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("friendly"));
  });

  it("rejects count 0, 21, NaN, and non-integers", () => {
    for (const count of [0, 21, -3, 2.5, Number.NaN, "abc"]) {
      const r = runTool({ ...BASE, count });
      assert.strictEqual(r.ok, false, `count=${String(count)}`);
    }
  });

  it("accepts count at the documented bounds 1 and 20", () => {
    const one = expectOk(runTool({ ...BASE, count: 1 }));
    assert.strictEqual((one.subjectLines as unknown[]).length, 1);
    const twenty = expectOk(runTool({ ...BASE, count: 20 }));
    assert.strictEqual((twenty.subjectLines as unknown[]).length, 20);
  });
});

describe("runTool — happy path", () => {
  it("generates DEFAULT_COUNT lines by default", () => {
    const v = expectOk(runTool(BASE));
    assert.strictEqual((v.subjectLines as unknown[]).length, DEFAULT_COUNT);
    assert.strictEqual(v.notice, "");
  });

  it("fills topic and audience into every line", () => {
    const v = expectOk(runTool(BASE));
    const lines = v.subjectLines as { text: string }[];
    for (const l of lines) {
      assert.ok(
        l.text.includes("SEO tips") || l.text.includes("bloggers"),
        `line should use topic/audience: ${l.text}`,
      );
    }
  });

  it("returns charCount in code points and fitsMobile flag per line", () => {
    const v = expectOk(runTool(BASE));
    const lines = v.subjectLines as { text: string; charCount: number; fitsMobile: boolean }[];
    for (const l of lines) {
      assert.strictEqual(l.charCount, [...l.text].length);
      assert.strictEqual(typeof l.fitsMobile, "boolean");
      assert.strictEqual(l.fitsMobile, l.charCount <= MOBILE_FIT_CHARS);
    }
  });

  it("honors tone: urgent lines read urgent", () => {
    // Variant 0 is intentionally plain; urgent markers appear from variant 1
    // (slots 6+), so request enough lines to reach them.
    const v = expectOk(runTool({ ...BASE, tone: "urgent", count: 10 }));
    const lines = v.subjectLines as { text: string }[];
    const joined = lines.map((l) => l.text).join(" | ");
    assert.ok(/last chance|today only|don't miss/i.test(joined), joined);
  });

  it("honors tone: curious lines ask questions", () => {
    const v = expectOk(runTool({ ...BASE, tone: "curious", count: 4 }));
    const lines = v.subjectLines as { text: string }[];
    assert.ok(lines.some((l) => l.text.includes("?")), "curious tone should produce questions");
  });

  it("serves all five purposes without failing", () => {
    for (const purpose of PURPOSES) {
      const v = expectOk(runTool({ ...BASE, emailPurpose: purpose, count: 6 }));
      const lines = v.subjectLines as { text: string }[];
      assert.strictEqual(lines.length, 6, purpose);
      assert.ok(lines.every((l) => l.text.length > 0), purpose);
    }
  });

  it("serves all five tones without failing", () => {
    for (const tone of TONES) {
      const v = expectOk(runTool({ ...BASE, tone, count: 5 }));
      assert.strictEqual((v.subjectLines as unknown[]).length, 5, tone);
    }
  });
});

describe("runTool — edges", () => {
  it("never returns duplicate lines within one run", () => {
    const v = expectOk(runTool({ ...BASE, count: 20 }));
    const texts = (v.subjectLines as { text: string }[]).map((l) => l.text);
    assert.strictEqual(new Set(texts).size, texts.length);
  });

  it("truncates overlong topic with a visible notice", () => {
    const v = expectOk(runTool({ ...BASE, topic: "x".repeat(200) }));
    assert.ok((v.notice as string).includes("shortened"), "notice must be visible");
    const lines = v.subjectLines as { text: string }[];
    assert.ok(!lines.some((l) => l.text.includes("x".repeat(150))));
  });

  it("truncates overlong audience with a visible notice", () => {
    const v = expectOk(runTool({ ...BASE, audience: "y".repeat(200) }));
    assert.ok((v.notice as string).includes("Audience was shortened"));
  });

  it("strips HTML tags from user input", () => {
    const v = expectOk(runTool({ ...BASE, topic: "<b>SEO tips</b>" }));
    const lines = v.subjectLines as { text: string }[];
    assert.ok(!lines.some((l) => l.text.includes("<b>")), "no raw HTML in output");
    assert.ok(lines.some((l) => l.text.includes("SEO tips")));
  });

  it("handles unicode topics with code-point-safe counts", () => {
    const v = expectOk(runTool({ ...BASE, topic: "🚀 growth hacks" }));
    const lines = v.subjectLines as { text: string; charCount: number }[];
    for (const l of lines) {
      assert.strictEqual(l.charCount, [...l.text].length);
    }
  });

  it("is deterministic: same inputs -> identical outputs", () => {
    const input = { ...BASE, tone: "playful", count: 12 };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });

  it("output ids exactly match meta.ts outputs ids", () => {
    const v = expectOk(runTool(BASE));
    assert.deepStrictEqual(Object.keys(v).sort(), META_OUTPUT_IDS);
  });

  it("error case carries a human message and no values", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 10);
  });

  it("documents the advertised bank sizes", () => {
    assert.strictEqual(PURPOSES.length, 5);
    assert.strictEqual(TONES.length, 5);
    assert.strictEqual(DEFAULT_COUNT, 10);
    assert.strictEqual(MAX_COUNT, 20);
    assert.strictEqual(MIN_COUNT, 1);
    assert.strictEqual(MAX_INPUT_CHARS, 120);
    assert.strictEqual(MOBILE_FIT_CHARS, 41);
  });
});
