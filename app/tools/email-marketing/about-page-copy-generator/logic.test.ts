import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateAboutCopy,
  hasRepeatedWords,
  hashString,
  stripTags,
  takeCodePoints,
  ABOUT_TEMPLATES,
  ABOUT_TONES,
  ABOUT_LENGTHS,
  HEADLINE_TEMPLATES,
  HEADLINE_COUNT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  name: "Ayesha Khan",
  role: "email marketing consultant",
  credentials: "a certified email marketer with 8 years of experience",
  tone: "professional",
  length: "medium",
};

describe("about-page-copy-generator (tool-442)", () => {
  it("happy path: returns aboutCopy and 8 headline options", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const copy = r.values?.aboutCopy as string;
    const headlines = r.values?.headlineOptions as string[];
    assert.ok(copy.length > 100);
    assert.ok(copy.includes("Ayesha Khan"));
    assert.ok(copy.includes("email marketing consultant"));
    assert.equal(headlines.length, HEADLINE_COUNT);
    for (const h of headlines) assert.ok(h.length > 0);
  });

  it("template bank sizes are as documented (4 tones x 3 lengths = 12, 10 headlines)", () => {
    assert.equal(ABOUT_TONES.length, 4);
    assert.equal(ABOUT_LENGTHS.length, 3);
    assert.equal(Object.keys(ABOUT_TEMPLATES).length, 4);
    for (const t of ABOUT_TONES) {
      assert.equal(Object.keys(ABOUT_TEMPLATES[t]).length, 3, `tone ${t} needs 3 lengths`);
    }
    assert.equal(HEADLINE_TEMPLATES.length, 10);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const metaIds = new Set((outputs as { id: string }[]).map((o) => o.id));
    assert.deepEqual(new Set(Object.keys(r.values ?? {})), metaIds);
  });

  it("determinism: same inputs produce identical outputs", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("rejects missing name", () => {
    const r = runTool({ ...baseValues, name: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /name/i);
  });

  it("rejects whitespace-only name", () => {
    const r = runTool({ ...baseValues, name: "   " });
    assert.equal(r.ok, false);
  });

  it("rejects missing role", () => {
    const r = runTool({ ...baseValues, role: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /role/i);
  });

  it("rejects invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "angry" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("rejects invalid length", () => {
    const r = runTool({ ...baseValues, length: "huge" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /length/i);
  });

  it("credentials are optional: fallback phrase fills the slot, no empty placeholder", () => {
    const r = runTool({ ...baseValues, credentials: "" });
    assert.equal(r.ok, true);
    const copy = r.values?.aboutCopy as string;
    assert.ok(!copy.includes("{credSentence}") && !copy.includes("{credPhrase}"));
    assert.ok(copy.includes("My background:"));
  });

  it("no unfilled slots remain in copy or headlines", () => {
    const r = runTool(baseValues);
    const copy = r.values?.aboutCopy as string;
    const headlines = r.values?.headlineOptions as string[];
    for (const s of [copy, ...headlines]) {
      assert.ok(!/\{(name|firstName|role|roleLower|credSentence|credPhrase)\}/.test(s));
    }
  });

  it("tones produce distinct copy", () => {
    const pro = (runTool({ ...baseValues, tone: "professional" }).values?.aboutCopy as string);
    const playful = (runTool({ ...baseValues, tone: "playful" }).values?.aboutCopy as string);
    assert.notEqual(pro, playful);
  });

  it("lengths produce different copy sizes (short < medium < long)", () => {
    const words = (t: string) =>
      (runTool({ ...baseValues, tone: t, length: "short" }).values?.aboutCopy as string).split(/\s+/).length;
    const wordsMed = (t: string) =>
      (runTool({ ...baseValues, tone: t, length: "medium" }).values?.aboutCopy as string).split(/\s+/).length;
    const wordsLong = (t: string) =>
      (runTool({ ...baseValues, tone: t, length: "long" }).values?.aboutCopy as string).split(/\s+/).length;
    for (const t of ABOUT_TONES) {
      assert.ok(words(t) < wordsMed(t), `short < medium for ${t}`);
      assert.ok(wordsMed(t) < wordsLong(t), `medium < long for ${t}`);
    }
  });

  it("word counts land in documented bands (short 40-90, medium 90-180, long 160-320)", () => {
    const words = (length: string) =>
      (runTool({ ...baseValues, length }).values?.aboutCopy as string).split(/\s+/).length;
    assert.ok(words("short") >= 40 && words("short") <= 90, `short=${words("short")}`);
    assert.ok(words("medium") >= 90 && words("medium") <= 180, `medium=${words("medium")}`);
    assert.ok(words("long") >= 160 && words("long") <= 320, `long=${words("long")}`);
  });

  it("overlong input is trimmed with a visible notice, never silently dropped", () => {
    const longName = "A".repeat(MAX_INPUT_CHARS + 50);
    const r = runTool({ ...baseValues, name: longName });
    assert.equal(r.ok, true);
    const copy = r.values?.aboutCopy as string;
    assert.ok(copy.includes("trimmed"), "notice must be visible");
    assert.ok(!copy.includes("A".repeat(MAX_INPUT_CHARS + 50)));
  });

  it("HTML tags are stripped from inputs (sanitized output)", () => {
    const r = runTool({ ...baseValues, name: "Ayesha <b>Khan</b>" });
    assert.equal(r.ok, true);
    const copy = r.values?.aboutCopy as string;
    assert.ok(!copy.includes("<b>") && !copy.includes("</b>"));
    assert.ok(copy.includes("Ayesha Khan"));
  });

  it("stripTags removes script tags too", () => {
    assert.equal(stripTags('x<script>alert(1)</script>y'), "xalert(1)y");
  });

  it("non-Latin input works: Arabic name is interpolated and counted in code points", () => {
    const r = runTool({ ...baseValues, name: "أحمد حسن", role: "مدون" });
    assert.equal(r.ok, true);
    const copy = r.values?.aboutCopy as string;
    assert.ok(copy.includes("أحمد حسن"));
  });

  it("takeCodePoints does not split emoji mid-surrogate", () => {
    const s = "a".repeat(5) + "🎉".repeat(10);
    const taken = takeCodePoints(s, 6);
    assert.equal([...taken].length, 6);
    assert.ok(taken.endsWith("🎉"), "emoji kept whole");
  });

  it("hasRepeatedWords flags accidental duplicate words", () => {
    assert.equal(hasRepeatedWords("the the cat"), true);
    assert.equal(hasRepeatedWords("The THE cat"), true);
    assert.equal(hasRepeatedWords("a normal sentence"), false);
  });

  it("duplicate-word guard: repeated word in input triggers review flag", () => {
    const r = runTool({ ...baseValues, name: "Khan Khan" });
    assert.equal(r.ok, true);
    const copy = r.values?.aboutCopy as string;
    assert.ok(copy.includes("Review flag"));
  });

  it("headline rotation is deterministic per name but varies across names", () => {
    const a = (runTool(baseValues).values?.headlineOptions as string[]);
    const b = (runTool({ ...baseValues, name: "Bilal Ahmed" }).values?.headlineOptions as string[]);
    assert.notDeepEqual(a, b);
    assert.deepEqual(a, runTool(baseValues).values?.headlineOptions);
  });

  it("hashString is deterministic and spreads values", () => {
    assert.equal(hashString("abc"), hashString("abc"));
    assert.notEqual(hashString("abc"), hashString("abd"));
  });

  it("generateAboutCopy throws RangeError on empty role", () => {
    assert.throws(() => generateAboutCopy("A", "   ", "", "professional", "short"), RangeError);
  });

  it("non-string values object entries are rejected gracefully", () => {
    const r = runTool({ ...baseValues, tone: 42 });
    assert.equal(r.ok, false);
  });
});
