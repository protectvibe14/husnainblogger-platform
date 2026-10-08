/**
 * Tests for tool-373 X Post Formatter logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  cleanText,
  toBoldUnicode,
  weightedLength,
  POST_LIMIT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const META_IDS = metaOutputs.map((o) => o.id).sort();

function metaMatch(values: Record<string, unknown>): void {
  assert.deepEqual(Object.keys(values).sort(), META_IDS, "runTool keys must equal meta.ts output ids");
}

test("happy path: messy text is cleaned", () => {
  const r = runTool({ text: "Hello world   \n\n\n\nSecond line\twith tab.  \n" });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  metaMatch(r.values);
  const v = r.values as Record<string, unknown>;
  assert.equal(v.formattedText, "Hello world\n\nSecond line with tab.");
  assert.match(v.changeNote as string, /Cleaned up/);
});

test("already clean text returns unchanged with 'no changes needed'", () => {
  const r = runTool({ text: "Clean one-liner, nothing wrong." });
  assert.equal(r.ok, true);
  assert.equal((r.values as Record<string, unknown>).formattedText, "Clean one-liner, nothing wrong.");
  assert.match((r.values as Record<string, unknown>).changeNote as string, /No changes needed/);
});

test("empty text -> error", () => {
  const r = runTool({ text: "" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /paste/i);
});

test("whitespace-only text -> error", () => {
  const r = runTool({ text: "  \n\t  " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("missing text -> error", () => {
  const r = runTool({});
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("input over max chars -> error", () => {
  const r = runTool({ text: "x".repeat(MAX_INPUT_CHARS + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(String(MAX_INPUT_CHARS)));
});

test("budget meter: short text reports remaining, overBy 0", () => {
  const r = runTool({ text: "Hello" });
  assert.equal(r.ok, true);
  const v = r.values as Record<string, unknown>;
  assert.equal(v.weightedCount, 5);
  assert.equal(v.remaining, POST_LIMIT - 5);
  assert.equal(v.overBy, 0);
});

test("budget meter: URL counts as 23", () => {
  const r = runTool({ text: "Read https://example.com/very/long/article/path/here now" });
  assert.equal(r.ok, true);
  const v = r.values as Record<string, unknown>;
  // "Read " (5) + 23 + " now" (4) = 32
  assert.equal(v.weightedCount, 32);
});

test("budget meter: emoji counts 2 each", () => {
  assert.equal(weightedLength("🔥🔥"), 4);
  const r = runTool({ text: "Hot 🔥" });
  assert.equal(r.ok, true);
  assert.equal((r.values as Record<string, unknown>).weightedCount, 4 + 2);
});

test("over-budget text is flagged, not cut", () => {
  const long = "word ".repeat(80).trim(); // ~399 chars
  const r = runTool({ text: long });
  assert.equal(r.ok, true);
  const v = r.values as Record<string, unknown>;
  assert.ok((v.overBy as number) > 0);
  assert.equal(v.remaining, 0);
  assert.equal(v.formattedText, long, "must not silently cut text");
});

test("boldText: ASCII letters and digits become bold unicode", () => {
  const r = runTool({ text: "Hello 123" });
  assert.equal(r.ok, true);
  const bold = (r.values as Record<string, unknown>).boldText as string;
  assert.equal(bold, "𝐇𝐞𝐥𝐥𝐨 𝟏𝟐𝟑");
});

test("boldText: punctuation and spaces pass through", () => {
  assert.equal(toBoldUnicode("Hi! #tag"), "𝐇𝐢! #𝐭𝐚𝐠");
});

test("cleanText: tabs become spaces, 2+ spaces collapse", () => {
  const { cleaned } = cleanText("a\tb   c");
  assert.equal(cleaned, "a b c");
});

test("cleanText: leading/trailing blank lines stripped, triple blanks collapsed", () => {
  const { cleaned, extraBlankLines } = cleanText("\n\nline one\n\n\n\nline two\n\n");
  assert.equal(cleaned, "line one\n\nline two");
  assert.ok(extraBlankLines > 0);
});

test("cleanText: trailing spaces tallied per line", () => {
  const { cleaned, trailingSpaces } = cleanText("a  \nb   ");
  assert.equal(cleaned, "a\nb");
  assert.equal(trailingSpaces, 2);
});

test("multiline text keeps single blank-line paragraph breaks", () => {
  const r = runTool({ text: "Para one.\n\nPara two." });
  assert.equal(r.ok, true);
  assert.equal((r.values as Record<string, unknown>).formattedText, "Para one.\n\nPara two.");
});

test("deterministic: same input -> identical outputs", () => {
  const a = runTool({ text: "Hello   world\n\n\nTest  " });
  const b = runTool({ text: "Hello   world\n\n\nTest  " });
  assert.deepEqual(a, b);
});

test("unicode text is handled and counted double", () => {
  const r = runTool({ text: "日本語 テスト" });
  assert.equal(r.ok, true);
  const v = r.values as Record<string, unknown>;
  assert.ok((v.weightedCount as number) > (v.formattedText as string).length);
});
