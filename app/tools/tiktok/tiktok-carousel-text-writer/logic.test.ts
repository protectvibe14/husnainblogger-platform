import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  writeSlides,
  hashString,
  HOOK_BANK,
  VALUE_BANK,
  CTA_BANK,
  MAX_SLIDES,
  MIN_SLIDES,
  MAX_WORDS_PER_SLIDE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values as Record<string, unknown>;
}

function slideWords(s: string): number {
  const text = s.replace(/^Slide \d+( \(cover\)| \(CTA\))?: /, "");
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

test("output ids match meta.ts outputs", () => {
  const v = okValues({ carouselTopic: "meal prep", slideCount: 5 });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("validation: empty carouselTopic errors", () => {
  assert.strictEqual(
    runTool({ carouselTopic: "   ", slideCount: 5 }).ok,
    false
  );
});

test("validation: missing carouselTopic errors", () => {
  assert.strictEqual(runTool({ slideCount: 5 }).ok, false);
});

test("validation: slideCount below 2 errors", () => {
  const res = runTool({ carouselTopic: "meal prep", slideCount: 1 });
  assert.strictEqual(res.ok, false);
  assert.ok(res.error && res.error.includes("2"));
});

test("validation: non-integer slideCount errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x", slideCount: 3.7 }).ok, false);
});

test("validation: non-numeric slideCount errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x", slideCount: "lots" }).ok, false);
});

test("validation: missing slideCount errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x" }).ok, false);
});

test("error message is human-readable", () => {
  const res = runTool({ carouselTopic: "", slideCount: 5 });
  assert.ok(res.error && res.error.length > 10);
});

test("happy path: correct slide count, cover first, CTA last", () => {
  const v = okValues({ carouselTopic: "home workouts", slideCount: 5 });
  const slides = v["slides"] as string[];
  assert.strictEqual(slides.length, 5);
  assert.ok(slides[0].includes("(cover)"), slides[0]);
  assert.ok(slides[4].includes("(CTA)"), slides[4]);
});

test("happy path: minimum 2 slides", () => {
  const v = okValues({ carouselTopic: "x", slideCount: 2 });
  const slides = v["slides"] as string[];
  assert.strictEqual(slides.length, 2);
  assert.ok(slides[0].includes("(cover)") && slides[1].includes("(CTA)"));
});

test("happy path: topic appears in every slide", () => {
  const v = okValues({ carouselTopic: "budget travel", slideCount: 6 });
  for (const s of v["slides"] as string[]) {
    assert.ok(s.includes("budget travel"), s);
  }
});

test("happy path: every slide ≤ 50 words", () => {
  const v = okValues({ carouselTopic: "photography", slideCount: 35 });
  for (const s of v["slides"] as string[]) {
    assert.ok(slideWords(s) <= MAX_WORDS_PER_SLIDE, `${slideWords(s)} words: ${s}`);
  }
});

test("edge case: slideCount > 35 clamps with honesty note", () => {
  const v = okValues({ carouselTopic: "travel", slideCount: 60 });
  const slides = v["slides"] as string[];
  assert.strictEqual(slides.length, MAX_SLIDES);
  const note = v["note"] as string;
  assert.ok(note.includes("clamped to 35") && note.includes("60"), note);
});

test("edge case: exactly 35 slides, no clamp note", () => {
  const v = okValues({ carouselTopic: "travel", slideCount: 35 });
  assert.strictEqual((v["slides"] as string[]).length, 35);
  assert.ok(!(v["note"] as string).includes("clamped"));
});

test("determinism: same input → identical output", () => {
  const input = { carouselTopic: "gardening", slideCount: 7 };
  assert.deepStrictEqual(runTool(input), runTool(input));
});

test("word-bank bounds: sizes as documented", () => {
  assert.strictEqual(HOOK_BANK.length, 10);
  assert.strictEqual(VALUE_BANK.length, 12);
  assert.strictEqual(CTA_BANK.length, 5);
});

test("word-bank bounds: no empty picks, no unfilled placeholders", () => {
  for (const s of writeSlides("niche", 20)) {
    const text = s.replace(/^Slide \d+( \(cover\)| \(CTA\))?: /, "");
    assert.ok(text.trim().length > 0);
    assert.ok(!s.includes("{topic}"), s);
    assert.ok(!s.includes("{n}"), s);
  }
});

test("hashString is deterministic", () => {
  assert.strictEqual(hashString("topic"), hashString("topic"));
  assert.ok(hashString("topic") >= 0);
});

test("constants: 2–35 range, 50-word guidance", () => {
  assert.strictEqual(MIN_SLIDES, 2);
  assert.strictEqual(MAX_SLIDES, 35);
  assert.strictEqual(MAX_WORDS_PER_SLIDE, 50);
});

test("string slideCount coerced to number", () => {
  const v = okValues({ carouselTopic: "x", slideCount: "4" });
  assert.strictEqual((v["slides"] as string[]).length, 4);
});
