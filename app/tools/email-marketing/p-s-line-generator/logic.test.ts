import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generatePsLines,
  hasRepeatedWords,
  PS_PATTERNS,
  PS_TONES,
  PS_LINE_COUNT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  emailGoal: "book a demo call",
  offer: "the free email audit",
  tone: "friendly",
};

describe("p-s-line-generator (tool-407)", () => {
  it("happy path: returns 6 P.S. lines", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const lines = r.values?.psLines as string[];
    assert.equal(lines.length, PS_LINE_COUNT);
    for (const l of lines) {
      assert.equal(typeof l, "string");
      assert.ok(l.length > 0);
      assert.ok(l.startsWith("P.S."), `line must start with P.S.: ${l}`);
    }
  });

  it("pattern bank sizes are as documented (4 tones x 6 = 24)", () => {
    assert.equal(PS_TONES.length, 4);
    assert.equal(Object.keys(PS_PATTERNS).length, 4);
    for (const t of PS_TONES) {
      assert.equal(PS_PATTERNS[t].length, 6, `tone ${t} must have 6 patterns`);
    }
  });

  it("each tone produces distinct lines", () => {
    const sets = PS_TONES.map(
      (t) => new Set((runTool({ ...baseValues, tone: t }).values?.psLines as string[]) ?? []),
    );
    const all = new Set<string>();
    for (const s of sets) for (const l of s) all.add(l);
    assert.ok(all.size > PS_LINE_COUNT, "tones must produce distinct copy");
  });

  it("offer and goal are interpolated, no unfilled placeholders", () => {
    const r = runTool(baseValues);
    const lines = r.values?.psLines as string[];
    assert.ok(lines.some((l) => l.includes("the free email audit")));
    assert.ok(lines.some((l) => l.includes("book a demo call")));
    for (const l of lines) {
      assert.ok(!l.includes("{offer}"), "no unfilled {offer}");
      assert.ok(!l.includes("{goal}"), "no unfilled {goal}");
    }
  });

  it("no line contains repeated adjacent words", () => {
    for (const t of PS_TONES) {
      const lines = runTool({ ...baseValues, tone: t }).values?.psLines as string[];
      for (const l of lines) {
        assert.equal(hasRepeatedWords(l), false, `repeated words in: ${l}`);
      }
    }
  });

  it("hasRepeatedWords detects duplicates", () => {
    assert.equal(hasRepeatedWords("P.S. this this is great"), true);
    assert.equal(hasRepeatedWords("P.S. This is great"), false);
    assert.equal(hasRepeatedWords("P.S. THE the end"), true);
  });

  it("rejects missing emailGoal", () => {
    const r = runTool({ offer: "x", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("rejects whitespace-only emailGoal", () => {
    const r = runTool({ ...baseValues, emailGoal: "   " });
    assert.equal(r.ok, false);
  });

  it("rejects missing offer", () => {
    const r = runTool({ emailGoal: "x", tone: "friendly" });
    assert.equal(r.ok, false);
  });

  it("rejects whitespace-only offer", () => {
    const r = runTool({ ...baseValues, offer: "\t\n " });
    assert.equal(r.ok, false);
  });

  it("rejects missing tone", () => {
    const r = runTool({ emailGoal: "x", offer: "y" });
    assert.equal(r.ok, false);
  });

  it("rejects invalid tone value", () => {
    const r = runTool({ ...baseValues, tone: "sarcastic" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("tone"));
  });

  it("generatePsLines throws TypeError-free RangeError on bad tone", () => {
    assert.throws(() => generatePsLines("g", "o", "nope"), RangeError);
  });

  it("generatePsLines throws on empty goal", () => {
    assert.throws(() => generatePsLines("  ", "o", "friendly"), RangeError);
  });

  it("overlong input is trimmed with a visible notice, not dropped silently", () => {
    const long = "a".repeat(MAX_INPUT_CHARS + 50);
    const r = runTool({ ...baseValues, offer: long });
    assert.equal(r.ok, true);
    const lines = r.values?.psLines as string[];
    assert.equal(lines.length, PS_LINE_COUNT + 1);
    assert.ok(lines[lines.length - 1].includes("trimmed to 200 characters"));
    assert.ok(lines.some((l) => l.includes("a".repeat(MAX_INPUT_CHARS).slice(0, 20))));
  });

  it("no notice when inputs are within limits", () => {
    const r = runTool(baseValues);
    const lines = r.values?.psLines as string[];
    assert.equal(lines.length, PS_LINE_COUNT);
  });

  it("CJK/emoji-safe handling of inputs", () => {
    const r = runTool({ emailGoal: "新年大促销 🎉", offer: "免费试用 🚀", tone: "playful" });
    assert.equal(r.ok, true);
    const lines = r.values?.psLines as string[];
    assert.ok(lines.some((l) => l.includes("新年大促销")));
  });

  it("deterministic: same input twice gives identical output", () => {
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), outputs.map((o) => o.id).sort());
  });
});
