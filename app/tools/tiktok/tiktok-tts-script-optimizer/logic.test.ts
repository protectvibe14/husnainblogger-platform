import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  optimizeScript,
  ABBREVIATION_MAP,
  MAX_SENTENCE_WORDS,
  spellInteger,
  spellOrdinal,
  spellYear,
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
  const v = okValues({ scriptText: "Hello world." });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("validation: empty scriptText errors", () => {
  assert.strictEqual(runTool({ scriptText: "   " }).ok, false);
});

test("validation: missing scriptText errors", () => {
  assert.strictEqual(runTool({}).ok, false);
});

test("validation: non-string scriptText errors", () => {
  assert.strictEqual(runTool({ scriptText: 123 }).ok, false);
});

test("error message is human-readable", () => {
  const res = runTool({ scriptText: "" });
  assert.ok(res.error && res.error.length > 10);
});

test("happy path: abbreviations expanded", () => {
  const v = okValues({ scriptText: "This DIY tip is great. DM me ASAP." });
  const script = v["optimizedScript"] as string;
  assert.ok(script.includes("do it yourself"), script);
  assert.ok(script.includes("direct message"), script);
  assert.ok(script.includes("as soon as possible"), script);
});

test("happy path: currency and percent spelled out", () => {
  const v = okValues({ scriptText: "It costs $50 and saves 25% of your time." });
  const script = v["optimizedScript"] as string;
  assert.ok(script.includes("fifty dollars"), script);
  assert.ok(script.includes("twenty-five percent"), script);
});

test("happy path: year spelled out", () => {
  const v = okValues({ scriptText: "Trending in 2026." });
  assert.ok(
    (v["optimizedScript"] as string).includes("twenty twenty-six")
  );
});

test("happy path: ordinal spelled out", () => {
  const v = okValues({ scriptText: "This is my 1st viral video and my 21st post." });
  const script = v["optimizedScript"] as string;
  assert.ok(script.includes("first"), script);
  assert.ok(script.includes("twenty-oneth"), script);
});

test("happy path: decimal spelled out", () => {
  const v = okValues({ scriptText: "It grew 3.5 times." });
  assert.ok((v["optimizedScript"] as string).includes("three point five"));
});

test("happy path: long sentence split at 25-word limit", () => {
  const long =
    "This is a very long sentence that keeps going and going with many words, " +
    "adding more and more clauses, because it never seems to end, and the TTS " +
    "voice will run out of breath before it finishes the thought completely.";
  const v = okValues({ scriptText: long });
  const sentences = (v["optimizedScript"] as string)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  for (const s of sentences) {
    assert.ok(
      s.split(/\s+/).length <= MAX_SENTENCE_WORDS,
      `sentence too long: ${s}`
    );
  }
  assert.ok((v["changes"] as string[]).some((c) => c.includes("Split")));
});

test("happy path: punctuation warnings flag ellipsis and repeats", () => {
  const v = okValues({ scriptText: "Wait... this is amazing!! Really?!" });
  const warnings = v["warnings"] as string[];
  assert.ok(warnings.length >= 1);
  assert.ok(!(v["optimizedScript"] as string).includes("..."));
});

test("edge case: unknown acronym triggers brand-name warning", () => {
  const v = okValues({ scriptText: "I use ZYXQ software daily." });
  const warnings = v["warnings"] as string[];
  assert.ok(
    warnings.some((w) => w.includes("ZYXQ") && w.includes("does not invent")),
    JSON.stringify(warnings)
  );
});

test("edge case: clean script needs no changes", () => {
  const v = okValues({ scriptText: "Short and sweet. Easy to say." });
  const changes = v["changes"] as string[];
  assert.ok(changes.some((c) => c.includes("No changes needed")));
});

test("determinism: same input → identical output", () => {
  const input = { scriptText: "My DIY video got 1st place in 2026! DM me ASAP..." };
  const a = runTool(input);
  const b = runTool(input);
  assert.deepStrictEqual(a, b);
});

test("score is within 0–100 and labeled honestly", () => {
  const v = okValues({ scriptText: "Clean script here." });
  const score = v["readabilityScore"] as number;
  assert.ok(score >= 0 && score <= 100);
  const res = optimizeScript("Clean script here.");
  assert.ok(["Excellent for TTS", "Good for TTS", "Needs tweaks for TTS", "Hard to read aloud"].includes(res.scoreBand));
});

test("score drops with messy input (estimated heuristic)", () => {
  const clean = optimizeScript("Short script. Easy words.");
  const messy = optimizeScript("WAIT... this DIY costs $50!!! DM ASAP, 1st place 2026, w/ 3.5x ROI!!!");
  assert.ok(messy.readabilityScore < clean.readabilityScore);
});

test("word-bank size: abbreviation map has 47 entries", () => {
  assert.strictEqual(Object.keys(ABBREVIATION_MAP).length, 47);
});

test("spellInteger unit checks", () => {
  assert.strictEqual(spellInteger(0), "zero");
  assert.strictEqual(spellInteger(42), "forty-two");
  assert.strictEqual(spellInteger(100), "one hundred");
  assert.strictEqual(spellInteger(1150), "one thousand one hundred fifty");
});

test("spellOrdinal and spellYear unit checks", () => {
  assert.strictEqual(spellOrdinal("2nd"), "second");
  assert.strictEqual(spellYear(1999), "nineteen ninety-nine");
  assert.strictEqual(spellYear(2005), "twenty oh five");
});

test("sentence with no terminator still processed", () => {
  const v = okValues({ scriptText: "just a fragment with no period" });
  assert.strictEqual(v["optimizedScript"], "just a fragment with no period");
});
