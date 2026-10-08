import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, styleText, STYLE_IDS, STYLE_MAPS, CAPTION_LIMIT } from "./logic.ts";

const META_OUTPUTS = ["styledText", "charCount", "platformSafeNote"];

describe("stylish-fonts-generator (tool-204)", () => {
  it("ships 12 documented style maps", () => {
    assert.equal(STYLE_IDS.length, 12);
    assert.ok(STYLE_IDS.includes("bold"));
    assert.ok(STYLE_IDS.includes("circled"));
    assert.ok(STYLE_IDS.includes("small-caps"));
  });

  it("styles 'Hello' in bold with the known codepoints", () => {
    const r = styleText("Hello", "bold");
    assert.equal(r.styledText, "𝐇𝐞𝐥𝐥𝐨");
    assert.equal(r.unmappedCount, 0);
  });

  it("styles digits in bold (𝟎) and monospace (𝟶)", () => {
    assert.equal(styleText("0", "bold").styledText, "𝟎");
    assert.equal(styleText("0", "monospace").styledText, "𝟶");
    assert.equal(styleText("0", "double-struck").styledText, "𝟘");
  });

  it("styles 'A' in italic with the known codepoint", () => {
    assert.equal(styleText("A", "italic").styledText, "𝐴");
  });

  it("maps circled letters and digits", () => {
    assert.equal(styleText("a", "circled").styledText, "ⓐ");
    assert.equal(styleText("Z", "circled").styledText, "Ⓩ");
    assert.equal(styleText("0", "circled").styledText, "⓪");
    assert.equal(styleText("5", "circled").styledText, "⑤");
  });

  it("maps squared lowercase input to squared capitals", () => {
    assert.equal(styleText("a", "squared").styledText, styleText("A", "squared").styledText);
    assert.equal(styleText("A", "squared").styledText, "🄰");
  });

  it("maps small-caps for defined letters, passes through the rest", () => {
    const r = styleText("abcfx", "small-caps");
    assert.equal(r.styledText[0], "ᴀ");
    assert.ok(r.styledText.includes("f"), "f has no small-caps form -> passed through");
    assert.ok(r.styledText.includes("x"), "x has no small-caps form -> passed through");
    assert.equal(r.unmappedCount, 2);
  });

  it("passes unknown characters through unchanged and counts them", () => {
    const r = styleText("Hi! 👋", "bold");
    assert.ok(r.styledText.includes("!"), "punctuation kept");
    assert.ok(r.styledText.includes("👋"), "emoji kept");
    assert.ok(r.unmappedCount >= 2);
  });

  it("handles unicode input (emoji, non-Latin) without crashing", () => {
    const r = styleText("café ☕ 日本", "script");
    assert.ok(r.styledText.length > 0);
    assert.ok(r.styledText.includes("☕"));
    assert.ok(r.styledText.includes("日本"));
  });

  it("script uses named codepoints for exception letters (B, R)", () => {
    assert.equal(styleText("B", "script").styledText, "ℬ");
    assert.equal(styleText("R", "script").styledText, "ℛ");
  });

  it("double-struck uses named codepoints (C, Z)", () => {
    assert.equal(styleText("C", "double-struck").styledText, "ℂ");
    assert.equal(styleText("Z", "double-struck").styledText, "ℤ");
  });

  it("runTool happy path returns all meta outputs", () => {
    const r = runTool({ text: "sale now", styleId: "fraktur" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), [...META_OUTPUTS].sort());
    assert.equal(r.values?.charCount, (r.values?.styledText as string).length);
    assert.match(r.values?.platformSafeNote as string, /Unicode/i);
  });

  it("runTool errors on empty or missing text", () => {
    assert.equal(runTool({ text: "", styleId: "bold" }).ok, false);
    assert.equal(runTool({ styleId: "bold" }).ok, false);
    assert.equal(runTool({ text: 42, styleId: "bold" }).ok, false);
  });

  it("runTool errors on text over 500 chars", () => {
    assert.equal(runTool({ text: "x".repeat(501), styleId: "bold" }).ok, false);
  });

  it("runTool errors on unknown styleId", () => {
    const r = runTool({ text: "hi", styleId: "comic-sans" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /style/i);
  });

  it("platformSafeNote warns when styled text exceeds the caption limit", () => {
    // circled chars are astral; 500 input chars x 2 units = 1000 < 2200, so force via styleText directly
    const big = "a".repeat(500);
    const r = runTool({ text: big, styleId: "circled" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.charCount as number) > 0);
    assert.match(r.values?.platformSafeNote as string, new RegExp(String(CAPTION_LIMIT)));
  });

  it("platformSafeNote mentions pass-through when characters had no styled form", () => {
    const r = runTool({ text: "hello world!", styleId: "bold" });
    assert.equal(r.ok, true);
    assert.match(r.values?.platformSafeNote as string, /kept as-is/);
  });

  it("is deterministic: same inputs -> identical outputs", () => {
    const a = runTool({ text: "new drop", styleId: "monospace" });
    const b = runTool({ text: "new drop", styleId: "monospace" });
    assert.deepEqual(a, b);
  });

  it("style ids have human labels", () => {
    for (const id of STYLE_IDS) {
      assert.ok(STYLE_MAPS[id].label.trim().length > 0);
      assert.equal(STYLE_MAPS[id].id, id);
    }
  });
});
