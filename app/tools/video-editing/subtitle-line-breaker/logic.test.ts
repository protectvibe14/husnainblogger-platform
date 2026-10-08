import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  subtitleText: "Hello, world! This is a test of the subtitle line breaking logic",
  maxCharsPerLine: 20,
  maxLines: 3,
  breakPreference: "punctuation",
};

describe("subtitle-line-breaker (tool-255)", () => {
  it("happy path: punctuation mode breaks after punctuation first", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const lines = v.brokenLines as string[];
    assert.equal(lines[0], "Hello, world!");
    assert.ok(lines.every((l) => l.length <= 20));
    assert.deepEqual(
      v.charsPerLine,
      lines.map((l) => l.length)
    );
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "brokenLines",
      "charsPerLine",
      "warnings",
    ]);
  });

  it("balanced mode evens out line lengths", () => {
    const r = runTool({
      subtitleText: "aaa bbb ccc ddd eee fff",
      maxCharsPerLine: 12,
      maxLines: 3,
      breakPreference: "balanced",
    });
    assert.equal(r.ok, true);
    assert.deepEqual((r.values as Record<string, unknown>).brokenLines, [
      "aaa bbb ccc",
      "ddd eee fff",
    ]);
  });

  it("balanced mode prefers breaking after punctuation", () => {
    const r = runTool({
      subtitleText: "First part here. Second part goes here now",
      maxCharsPerLine: 18,
      maxLines: 3,
      breakPreference: "balanced",
    });
    const lines = (r.values as Record<string, unknown>).brokenLines as string[];
    assert.equal(lines[0], "First part here.");
  });

  it("text already within limits returns a single line with no warnings", () => {
    const r = runTool({
      subtitleText: "Short line",
      maxCharsPerLine: 42,
      maxLines: 2,
      breakPreference: "punctuation",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.deepEqual(v.brokenLines, ["Short line"]);
    assert.deepEqual(v.warnings, []);
  });

  it("single word longer than max is hard-broken with a warning", () => {
    const r = runTool({
      subtitleText: "pneumonoultramicroscopicsilicovolcanoconiosis test",
      maxCharsPerLine: 20,
      maxLines: 3,
      breakPreference: "punctuation",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const lines = v.brokenLines as string[];
    assert.ok(lines.every((l) => l.length <= 20));
    assert.ok((v.warnings as string[]).some((w) => w.includes("exceeds the 20-char limit")));
  });

  it("CJK text switches to 16 chars/line with a guidance warning", () => {
    const r = runTool({
      subtitleText: "这是一个很长的中文字幕测试句子需要正确换行处理",
      maxCharsPerLine: 42,
      maxLines: 3,
      breakPreference: "punctuation",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const lines = v.brokenLines as string[];
    assert.ok(lines.every((l) => l.length <= 16));
    assert.ok((v.warnings as string[]).some((w) => w.includes("16 chars/line")));
  });

  it("exceeding maxLines keeps the lines but warns", () => {
    const r = runTool({ ...base, maxLines: 1 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v.brokenLines as string[]).length > 1);
    assert.ok((v.warnings as string[]).some((w) => w.includes("max is 1")));
  });

  it("breaks before conjunctions when no punctuation fits", () => {
    const r = runTool({
      subtitleText: "alpha beta gamma delta and epsilon zeta eta",
      maxCharsPerLine: 22,
      maxLines: 3,
      breakPreference: "punctuation",
    });
    const lines = (r.values as Record<string, unknown>).brokenLines as string[];
    // "alpha beta gamma delta" = 21 chars; next word "and" is a conjunction -> break before it
    assert.equal(lines[0], "alpha beta gamma delta");
  });

  it("defaults: maxCharsPerLine 42, maxLines 2, preference punctuation", () => {
    const r = runTool({ subtitleText: "word ".repeat(30).trim() });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v.brokenLines as string[]).every((l) => l.length <= 42));
  });

  it("validation: empty text errors", () => {
    const r = runTool({ ...base, subtitleText: "   " });
    assert.equal(r.ok, false);
  });

  it("validation: maxCharsPerLine outside 10-60 errors", () => {
    for (const maxCharsPerLine of [5, 100, "wide"]) {
      const r = runTool({ ...base, maxCharsPerLine });
      assert.equal(r.ok, false, String(maxCharsPerLine));
    }
  });

  it("validation: maxLines outside 1-3 errors", () => {
    for (const maxLines of [0, 5, "many"]) {
      const r = runTool({ ...base, maxLines });
      assert.equal(r.ok, false, String(maxLines));
    }
  });

  it("validation: unknown break preference errors", () => {
    const r = runTool({ ...base, breakPreference: "smart" });
    assert.equal(r.ok, false);
  });

  it("deterministic: two runs produce identical output", () => {
    assert.deepEqual(runTool(base), runTool(base));
    assert.deepEqual(
      runTool({ ...base, breakPreference: "balanced" }),
      runTool({ ...base, breakPreference: "balanced" })
    );
  });

  it("charsPerLine always matches brokenLines lengths", () => {
    for (const breakPreference of ["punctuation", "balanced"]) {
      const r = runTool({ ...base, breakPreference });
      const v = r.values as Record<string, unknown>;
      const lines = v.brokenLines as string[];
      assert.deepEqual(v.charsPerLine, lines.map((l) => l.length));
    }
  });
});
