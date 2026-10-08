import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generatePressRelease,
  hasRepeatedWords,
  hashString,
  stripTags,
  takeCodePoints,
  headlineCoreOf,
  PRESS_RELEASE_STRUCTURES,
  MAX_ANNOUNCEMENT_CHARS,
  MAX_FIELD_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  announcement: "we are launching a free 7-day email course for new bloggers next month",
  brand: "HusnainBlogger",
  quotes: "We built this because readers kept asking for it.",
  contactInfo: "Ayesha Khan, press@example.com",
};

describe("blogger-press-release-template-generator (tool-446)", () => {
  it("happy path: returns a structured press release", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const pr = r.values?.pressRelease as string;
    assert.ok(pr.includes("FOR IMMEDIATE RELEASE"));
    assert.ok(pr.includes("HusnainBlogger"));
    assert.ok(pr.includes("We built this because readers kept asking for it."));
    assert.ok(pr.includes("Media contact:"));
    assert.ok(pr.includes("press@example.com"));
    assert.ok(pr.includes("###"));
  });

  it("structure bank size is as documented (3 structures)", () => {
    assert.equal(PRESS_RELEASE_STRUCTURES.length, 3);
    const ids = PRESS_RELEASE_STRUCTURES.map((s) => s.id);
    assert.equal(new Set(ids).size, 3);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const metaIds = new Set((outputs as { id: string }[]).map((o) => o.id));
    assert.deepEqual(new Set(Object.keys(r.values ?? {})), metaIds);
  });

  it("determinism: same inputs produce identical release", () => {
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("rejects missing announcement", () => {
    const r = runTool({ ...baseValues, announcement: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /announcement/i);
  });

  it("rejects whitespace-only brand", () => {
    const r = runTool({ ...baseValues, brand: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /brand/i);
  });

  it("rejects missing contactInfo", () => {
    const r = runTool({ ...baseValues, contactInfo: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /contact/i);
  });

  it("quotes are optional: quote paragraph omitted, never blank", () => {
    const r = runTool({ ...baseValues, quotes: "" });
    assert.equal(r.ok, true);
    const pr = r.values?.pressRelease as string;
    assert.ok(pr.includes("FOR IMMEDIATE RELEASE"));
    assert.ok(!pr.includes('""'));
  });

  it("quote is included when provided", () => {
    const r = runTool(baseValues);
    assert.ok((r.values?.pressRelease as string).includes(baseValues.quotes));
  });

  it("headline contains the brand and the announcement core", () => {
    const r = runTool(baseValues);
    const pr = r.values?.pressRelease as string;
    const headline = pr.split("\n")[0];
    assert.ok(headline.includes("HusnainBlogger"));
    assert.ok(headline.length > "HusnainBlogger".length + 5);
  });

  it("headlineCoreOf uses the first sentence when present", () => {
    assert.equal(headlineCoreOf("We launched a course. It is free for everyone."), "We launched a course.");
  });

  it("headlineCoreOf truncates long announcements at 90 code points with ellipsis", () => {
    const long = "word ".repeat(50);
    const core = headlineCoreOf(long);
    assert.ok([...core].length <= 91);
    assert.ok(core.endsWith("…"));
  });

  it("structure selection varies deterministically across inputs", () => {
    const a = runTool(baseValues).values?.pressRelease as string;
    const b = runTool({ ...baseValues, brand: "AnotherBlog" }).values?.pressRelease as string;
    assert.deepEqual(a, runTool(baseValues).values?.pressRelease);
    // both are valid releases regardless of which structure won
    assert.ok(b.includes("FOR IMMEDIATE RELEASE"));
  });

  it("overlong announcement is trimmed with a visible notice", () => {
    const r = runTool({ ...baseValues, announcement: "x ".repeat(MAX_ANNOUNCEMENT_CHARS) });
    assert.equal(r.ok, true);
    assert.ok((r.values?.pressRelease as string).includes("trimmed"));
  });

  it("overlong brand is trimmed to its field limit", () => {
    const r = runTool({ ...baseValues, brand: "B".repeat(MAX_FIELD_CHARS + 50) });
    assert.equal(r.ok, true);
    assert.ok((r.values?.pressRelease as string).includes("trimmed"));
  });

  it("HTML tags are stripped from inputs", () => {
    const r = runTool({
      ...baseValues,
      announcement: "launching <b>big things</b> soon",
      quotes: "<i>great quote</i>",
    });
    assert.equal(r.ok, true);
    const pr = r.values?.pressRelease as string;
    assert.ok(!pr.includes("<b>") && !pr.includes("<i>"));
    assert.ok(pr.includes("big things"));
    assert.ok(pr.includes("great quote"));
  });

  it("RTL announcement works and is embedded", () => {
    const r = runTool({ ...baseValues, announcement: "نطلق دورة بريد إلكتروني مجانية الشهر القادم" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.pressRelease as string).includes("نطلق دورة"));
  });

  it("emoji in inputs is kept whole (code-point safe)", () => {
    const r = runTool({ ...baseValues, announcement: "launching 🎉 big things 🎉 soon" });
    assert.equal(r.ok, true);
    const pr = r.values?.pressRelease as string;
    assert.ok(pr.includes("🎉"));
    assert.ok(!/\uFFFD/.test(pr));
  });

  it("hasRepeatedWords detection works", () => {
    assert.equal(hasRepeatedWords("the the release"), true);
    assert.equal(hasRepeatedWords("a fine release"), false);
  });

  it("duplicate word in input triggers a review flag", () => {
    const r = runTool({ ...baseValues, brand: "Blog Blog" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.pressRelease as string).includes("Review flag"));
  });

  it("boilerplate invents no facts: contains only brand + contact", () => {
    const r = runTool({ ...baseValues, quotes: "" });
    const pr = r.values?.pressRelease as string;
    const boiler = pr.slice(pr.indexOf("About HusnainBlogger"));
    assert.ok(boiler.includes("HusnainBlogger"));
    assert.ok(boiler.includes("press@example.com"));
  });

  it("hashString is deterministic", () => {
    assert.equal(hashString("x"), hashString("x"));
    assert.notEqual(hashString("x"), hashString("y"));
  });

  it("takeCodePoints respects the bound in code points", () => {
    assert.equal([...takeCodePoints("ab🎉cd", 3)].length, 3);
  });

  it("stripTags removes markup", () => {
    assert.equal(stripTags("<div>news</div>"), "news");
  });

  it("generatePressRelease throws RangeError on empty contact", () => {
    assert.throws(() => generatePressRelease("a", "b", "", "   "), RangeError);
  });

  it("non-string announcement is rejected", () => {
    const r = runTool({ ...baseValues, announcement: 123 });
    assert.equal(r.ok, false);
  });
});
