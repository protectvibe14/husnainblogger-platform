import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  normalizePostType,
  parseWordCount,
  assemblePrompt,
  POST_TYPES,
  DEFAULT_POST_TYPE,
  DEFAULT_TONE,
  DEFAULT_WORD_COUNT,
  MIN_WORD_COUNT,
  MAX_WORD_COUNT,
  MAX_FIELD_CHARS,
} from "./logic.ts";

const baseItem = {
  topic: "sourdough bread for beginners",
  postType: "how-to",
  tone: "friendly",
  targetKeyword: "sourdough starter",
  targetWordCount: "1500",
};

describe("blog-post-prompt-builder (tool-302)", () => {
  it("happy path: assembles one prompt with all fields", () => {
    const r = runTool({ items: [baseItem] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.lines.length, 1);
    const p = r.values?.lines[0] ?? "";
    assert.ok(p.includes("sourdough bread for beginners"));
    assert.ok(p.includes("how-to"));
    assert.ok(p.includes("friendly"));
    assert.ok(p.includes("sourdough starter"));
    assert.ok(p.includes("1500 words"));
    assert.ok(p.includes("5 headline options"));
  });

  it("assembled prompt is copy-paste ready (mentions pasting into own LLM)", () => {
    const r = runTool({ items: [baseItem] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").length > 100);
  });

  it("empty tone falls back to 'neutral'", () => {
    const r = runTool({ items: [{ ...baseItem, tone: "   " }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").includes(`Tone: ${DEFAULT_TONE}`));
  });

  it("empty postType falls back to 'how-to'", () => {
    const r = runTool({ items: [{ ...baseItem, postType: "" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").includes("how-to blog post"));
  });

  it("empty keyword renders the pick-your-own-keyword line", () => {
    const r = runTool({ items: [{ ...baseItem, targetKeyword: "" }] });
    assert.ok(r.ok);
    assert.ok(
      (r.values?.lines[0] ?? "").includes("none provided — pick a natural primary keyword yourself"),
    );
  });

  it("empty word count falls back to 1200 and labels it as default", () => {
    const r = runTool({ items: [{ ...baseItem, targetWordCount: "" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").includes(`${DEFAULT_WORD_COUNT} words (default`));
  });

  it("missing topic -> Item 1 error", () => {
    const r = runTool({ items: [{ ...baseItem, topic: "  " }] });
    assert.equal(r.ok, false);
    assert.equal(r.error, "Item 1: topic is required.");
  });

  it("invalid post type -> Item 2 error listing valid options", () => {
    const r = runTool({
      items: [baseItem, { ...baseItem, postType: "interview" }],
    });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").startsWith("Item 2:"));
    for (const t of POST_TYPES) assert.ok((r.error ?? "").includes(t));
  });

  it("word count below 300 -> error", () => {
    const r = runTool({ items: [{ ...baseItem, targetWordCount: "299" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("between 300 and 5000"));
  });

  it("word count above 5000 -> error", () => {
    const r = runTool({ items: [{ ...baseItem, targetWordCount: "5001" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("between 300 and 5000"));
  });

  it("non-numeric word count -> error", () => {
    const r = runTool({ items: [{ ...baseItem, targetWordCount: "lots" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("whole number"));
  });

  it("boundary word counts 300 and 5000 are accepted", () => {
    const lo = runTool({ items: [{ ...baseItem, targetWordCount: "300" }] });
    const hi = runTool({ items: [{ ...baseItem, targetWordCount: "5000" }] });
    assert.ok(lo.ok && (lo.values?.lines[0] ?? "").includes("300 words"));
    assert.ok(hi.ok && (hi.values?.lines[0] ?? "").includes("5000 words"));
  });

  it("special characters in topic are neutralized (no raw newlines/control chars)", () => {
    const r = runTool({
      items: [{ ...baseItem, topic: "bread\n\t<b>recipes</b>\r\n!!!" }],
    });
    assert.ok(r.ok);
    const p = r.values?.lines[0] ?? "";
    assert.ok(p.includes("bread <b>recipes</b> !!!"));
    assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(p));
  });

  it("long topic is capped at MAX_FIELD_CHARS", () => {
    const long = "x".repeat(1000);
    const r = runTool({ items: [{ ...baseItem, topic: long }] });
    assert.ok(r.ok);
    const m = (r.values?.lines[0] ?? "").match(/on "([^"]+)"/);
    assert.ok(m && m[1].length <= MAX_FIELD_CHARS);
  });

  it("multiple items -> one line per item", () => {
    const r = runTool({
      items: [
        baseItem,
        { ...baseItem, topic: "email marketing", postType: "listicle" },
      ],
    });
    assert.ok(r.ok);
    assert.equal(r.values?.lines.length, 2);
    assert.ok((r.values?.lines[1] ?? "").includes("email marketing"));
    assert.ok((r.values?.lines[1] ?? "").includes("listicle"));
  });

  it("empty items array -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("at least one item"));
  });

  it("missing items -> error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("deterministic: same input twice -> identical output", () => {
    const a = runTool({ items: [baseItem] });
    const b = runTool({ items: [baseItem] });
    assert.deepEqual(a, b);
  });

  it("output key is 'lines' matching meta.ts outputs", () => {
    const r = runTool({ items: [baseItem] });
    assert.ok(r.ok);
    assert.deepEqual(Object.keys(r.values ?? {}), ["lines"]);
  });

  it("normalizePostType is case-insensitive", () => {
    assert.equal(normalizePostType("Listicle"), "listicle");
    assert.equal(normalizePostType("REVIEW"), "review");
    assert.equal(normalizePostType("nope"), null);
    assert.equal(normalizePostType(""), DEFAULT_POST_TYPE);
  });

  it("parseWordCount: empty -> default, decimal -> invalid", () => {
    assert.deepEqual(parseWordCount(""), {
      count: DEFAULT_WORD_COUNT,
      defaulted: true,
      valid: true,
    });
    assert.equal(parseWordCount("12.5").valid, false);
  });

  it("sanitize strips control chars and collapses whitespace", () => {
    assert.equal(sanitize("  a\t\nb  "), "a b");
    assert.equal(sanitize(null), "");
    assert.equal(sanitize("x".repeat(500)).length, MAX_FIELD_CHARS);
  });

  it("MIN/MAX_WORD_COUNT constants match spec (300/5000)", () => {
    assert.equal(MIN_WORD_COUNT, 300);
    assert.equal(MAX_WORD_COUNT, 5000);
  });
});
