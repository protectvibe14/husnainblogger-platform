import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  scoreCaption,
  countSyllables,
  asciiWordRatio,
  TIKTOK_CAPTION_LIMIT,
  LONG_SENTENCE_WORDS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values as Record<string, unknown>;
}

test("output ids match meta.ts outputs", () => {
  const v = okValues({ captionText: "A simple caption." });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("validation: empty captionText errors", () => {
  assert.strictEqual(runTool({ captionText: "   " }).ok, false);
});

test("validation: missing captionText errors", () => {
  assert.strictEqual(runTool({}).ok, false);
});

test("validation: non-string captionText errors", () => {
  assert.strictEqual(runTool({ captionText: 42 }).ok, false);
});

test("error message is human-readable", () => {
  const res = runTool({ captionText: "" });
  assert.ok(res.error && res.error.length > 10);
});

test("happy path: simple caption scores high", () => {
  const v = okValues({
    captionText: "Day one of learning to bake bread. It finally worked!",
  });
  assert.ok((v["fleschScore"] as number) > 60, String(v["fleschScore"]));
  assert.ok((v["gradeLevel"] as string).startsWith("Grade "));
});

test("happy path: complex caption scores lower", () => {
  const simple = scoreCaption("I love baking bread. It is fun.");
  const complex = scoreCaption(
    "The unprecedented institutionalization of bureaucratization fundamentally characterizes contemporary administrative paradigms."
  );
  assert.ok(complex.fleschScore < simple.fleschScore);
  assert.ok(complex.gradeNumeric > simple.gradeNumeric);
});

test("happy path: long sentences flagged", () => {
  const caption =
    "This is one extremely long sentence that goes on and on without any break at all, " +
    "piling clause upon clause, because the writer never learned to use a period properly. Short one.";
  const v = okValues({ captionText: caption });
  const flagged = v["longSentences"] as string[];
  assert.strictEqual(flagged.length, 1);
  assert.ok(
    (v["suggestions"] as string[]).some((s) => s.includes("Split this long sentence"))
  );
});

test("edge case: over-2200 chars warns, does not error", () => {
  const long = "word ".repeat(600); // 3000 chars
  const v = okValues({ captionText: long });
  const notes = v["notes"] as string[];
  assert.ok(
    notes.some((n) => n.includes("over TikTok's 2200-character caption limit")),
    JSON.stringify(notes)
  );
  assert.ok((v["fleschScore"] as number) >= 0);
});

test("edge case: non-English caption labeled English-model only", () => {
  const v = okValues({
    captionText: "یہ ایک اردو کیپشن ہے جو انگریزی نہیں ہے اور کافی لمبا بھی ہے",
  });
  const notes = v["notes"] as string[];
  assert.ok(
    notes.some((n) => n.includes("English-model only")),
    JSON.stringify(notes)
  );
});

test("edge case: hashtag density suggestion", () => {
  const v = okValues({
    captionText: "Great day #one #two #three #four #five #six #seven",
  });
  assert.ok(
    (v["suggestions"] as string[]).some((s) => s.includes("7 hashtags"))
  );
});

test("edge case: all-caps words flagged", () => {
  const v = okValues({ captionText: "This is AMAZING and totally FREE stuff." });
  assert.ok(
    (v["suggestions"] as string[]).some((s) => s.includes("ALL-CAPS"))
  );
});

test("determinism: same input → identical output", () => {
  const input = { captionText: "My morning routine. Coffee first, always!" };
  assert.deepStrictEqual(runTool(input), runTool(input));
});

test("countSyllables unit checks", () => {
  assert.strictEqual(countSyllables("hello"), 2);
  assert.strictEqual(countSyllables("the"), 1);
  assert.strictEqual(countSyllables("readability"), 5);
  assert.strictEqual(countSyllables("TikTok"), 2);
  assert.strictEqual(countSyllables(""), 0);
});

test("asciiWordRatio unit checks", () => {
  assert.strictEqual(asciiWordRatio("hello world"), 1);
  assert.ok(asciiWordRatio("یہ اردو ہے") < 0.6);
});

test("constants: limit is 2200, long sentence is 20 words", () => {
  assert.strictEqual(TIKTOK_CAPTION_LIMIT, 2200);
  assert.strictEqual(LONG_SENTENCE_WORDS, 20);
});

test("single word caption still scores", () => {
  const v = okValues({ captionText: "Hello" });
  assert.ok(typeof v["fleschScore"] === "number");
  assert.ok((v["notes"] as string[]).length >= 1);
});

test("clean caption gets the no-issues suggestion", () => {
  const v = okValues({ captionText: "Fresh bread day. Smells great." });
  assert.ok(
    (v["suggestions"] as string[]).some((s) => s.includes("No issues found"))
  );
});

test("complex words named in suggestion", () => {
  const v = okValues({
    captionText: "The institutionalization of bureaucratization is unprecedented.",
  });
  assert.ok(
    (v["suggestions"] as string[]).some((s) => s.includes("Consider simpler words"))
  );
});

test("caption with only emojis does not crash", () => {
  const v = okValues({ captionText: "🔥🔥🔥" });
  assert.ok(typeof v["fleschScore"] === "number");
});
