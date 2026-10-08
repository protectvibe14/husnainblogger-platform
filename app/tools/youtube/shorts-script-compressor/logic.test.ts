import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  compressScript,
  splitSentences,
  countWords,
  deriveKeywords,
  wordBudget,
  CTA_TEMPLATE,
  CTA_WORDS,
  KEYWORD_COUNT,
  DEFAULT_SECONDS,
  MIN_SECONDS,
  MAX_SECONDS,
  MIN_WPM,
  MAX_WPM,
  STOPWORDS,
} from "./logic.ts";

const LONG_TEXT =
  "Most beginners waste money on camera gear. " +
  "The truth is that lighting matters more than your camera. " +
  "Good lighting makes a cheap camera look expensive. " +
  "Start with a window and a cheap LED panel for lighting. " +
  "Your camera sensor loves light, so feed it light. " +
  "Stop buying gear and start buying lighting knowledge today. " +
  "Lighting is the cheapest upgrade in all of videography. " +
  "A fifty dollar light beats a five hundred dollar lens upgrade. " +
  "Place your key light at forty five degrees for flattering lighting. " +
  "Soft lighting hides skin imperfections and looks professional. " +
  "Hard lighting creates drama but punishes every wrinkle. " +
  "Learn three point lighting before you buy anything else. " +
  "Your audience forgives bad cameras but never bad lighting. " +
  "Test your lighting on camera before every single shoot. " +
  "Great lighting turns a bedroom into a studio overnight.";

const BASE = { scriptText: LONG_TEXT, targetSeconds: 45, wpm: 150 };

// ---------- happy path ----------

test("happy path: compresses a long script within the word budget", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const budget = wordBudget(45, 150); // 112
  assert.ok((r.values!.wordCount as number) <= budget);
  assert.ok(String(r.values!.compressedScript).endsWith(CTA_TEMPLATE));
});

test("happy path: hook (first sentence) is always kept", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(
    String(r.values!.compressedScript).startsWith(
      "Most beginners waste money on camera gear.",
    ),
  );
});

test("happy path: word count and estimated seconds are consistent", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const words = r.values!.wordCount as number;
  const seconds = r.values!.estimatedSeconds as number;
  assert.equal(words, countWords(String(r.values!.compressedScript)));
  assert.equal(seconds, Math.round((words / 150) * 60 * 10) / 10);
});

test("happy path: cut list explains every sentence kept/dropped", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const cutList = r.values!.cutList as string[];
  assert.equal(cutList.length, 15);
  assert.ok(cutList[0].startsWith("KEEP"));
  assert.ok(cutList[0].includes("hook"));
  const dropped = cutList.filter((l) => l.startsWith("DROP"));
  assert.ok(dropped.length > 0);
  assert.ok(dropped[0].includes("over word budget"));
});

test("happy path: keyword-heavy sentences are preferred", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const out = String(r.values!.compressedScript).toLowerCase();
  // "lighting" is the dominant topic keyword and must appear in the output.
  assert.ok(out.includes("lighting"));
});

test("happy path: note carries the rule-based extraction label", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(String(r.values!.note).includes("Rule-based extraction"));
  assert.ok(String(r.values!.note).includes("not AI summarization"));
});

test("happy path: defaults apply when seconds/wpm omitted", () => {
  const r = runTool({ scriptText: LONG_TEXT });
  assert.equal(r.ok, true);
  assert.ok((r.values!.wordCount as number) <= wordBudget(DEFAULT_SECONDS, 150));
});

// ---------- validation errors ----------

test("validation: empty script text fails", () => {
  const r = runTool({ ...BASE, scriptText: "   " });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /script/i);
});

test("validation: missing script text fails", () => {
  const r = runTool({ targetSeconds: 45 });
  assert.equal(r.ok, false);
  assert.equal(r.values, undefined);
});

test("validation: target seconds below minimum fails", () => {
  const r = runTool({ ...BASE, targetSeconds: 4 });
  assert.equal(r.ok, false);
  assert.match(String(r.error), new RegExp(`${MIN_SECONDS}.*${MAX_SECONDS}`));
});

test("validation: target seconds above maximum fails", () => {
  const r = runTool({ ...BASE, targetSeconds: 181 });
  assert.equal(r.ok, false);
});

test("validation: wpm below minimum fails", () => {
  const r = runTool({ ...BASE, wpm: 79 });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /WPM/i);
});

test("validation: wpm above maximum fails", () => {
  const r = runTool({ ...BASE, wpm: 221 });
  assert.equal(r.ok, false);
});

// ---------- edge cases from spec ----------

test("edge: input already short -> returned as-is with note", () => {
  const short = "Drink more water every single day.";
  const r = runTool({ scriptText: short, targetSeconds: 45, wpm: 150 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.compressedScript, short);
  assert.ok(String(r.values!.note).includes("Already fits"));
  const cutList = r.values!.cutList as string[];
  assert.ok(cutList.every((l) => l.startsWith("KEEP")));
});

test("edge: single sentence with no terminator treated as one sentence", () => {
  const r = runTool({
    scriptText: "just a fragment with no period at all",
    targetSeconds: 45,
    wpm: 150,
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.compressedScript, "just a fragment with no period at all");
});

test("edge: hook longer than budget still returns hook + CTA with over-budget note", () => {
  const huge =
    "This is an extremely long opening sentence that keeps going and going with many filler words padding it out beyond any reasonable short-form word budget imaginable today.";
  const r = runTool({ scriptText: huge + " Second sentence here.", targetSeconds: 5, wpm: 80 });
  assert.equal(r.ok, true);
  assert.ok(String(r.values!.note).includes("Over budget"));
  assert.ok(String(r.values!.compressedScript).endsWith(CTA_TEMPLATE));
});

// ---------- determinism / contract ----------

test("determinism: same inputs -> identical output", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.values!).sort(), [
    "compressedScript",
    "cutList",
    "estimatedSeconds",
    "note",
    "wordCount",
  ]);
});

test("helpers: splitSentences handles multiple terminators", () => {
  assert.deepEqual(splitSentences("Wow! Really? Yes."), ["Wow!", "Really?", "Yes."]);
  assert.deepEqual(splitSentences("no terminator"), ["no terminator"]);
  assert.deepEqual(splitSentences("   "), []);
});

test("helpers: countWords and wordBudget math", () => {
  assert.equal(countWords("one two  three"), 3);
  assert.equal(wordBudget(45, 150), 112);
  assert.equal(wordBudget(60, 150), 150);
});

test("helpers: deriveKeywords picks frequent content words, skips stopwords", () => {
  const kw = deriveKeywords(splitSentences(LONG_TEXT));
  assert.ok(kw.length <= KEYWORD_COUNT);
  assert.ok(kw.includes("lighting"));
  for (const sw of STOPWORDS) {
    assert.ok(!kw.includes(sw), `stopword leaked: ${sw}`);
  }
});

test("helpers: CTA template constants are consistent", () => {
  assert.equal(CTA_WORDS, countWords(CTA_TEMPLATE));
  assert.equal(CTA_TEMPLATE, "Follow for more.");
});
