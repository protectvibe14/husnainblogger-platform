import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SMALL_WORDS,
  TITLE_HARD_LIMIT,
  TITLE_DISPLAY_LIMIT,
  formatTitle,
  charCountGraphemes,
  checkTitle,
  isPreservedWord,
  runTool,
} from "./logic.ts";

describe("formatTitle — title style", () => {
  it("capitalizes first/lowercases small words mid-title", () => {
    assert.equal(formatTitle("how to bake the perfect cake"), "How to Bake the Perfect Cake");
  });
  it("always capitalizes first and last word even if small words", () => {
    assert.equal(formatTitle("the end of the"), "The End of The");
  });
  it("preserves acronyms", () => {
    assert.equal(formatTitle("best AI tools for DIY projects"), "Best AI Tools for DIY Projects");
  });
  it("preserves internal-cap brands and digit tokens", () => {
    assert.equal(formatTitle("my iPhone haul in 4K"), "My iPhone Haul in 4K");
    assert.equal(formatTitle("eBay finds 1080p"), "eBay Finds 1080p");
  });
  it("cannot infer brand casing from all-lowercase input (documented)", () => {
    assert.equal(formatTitle("iphone 15 vs 4k cameras"), "Iphone 15 vs 4k Cameras");
  });
  it("capitalizes hyphenated compound parts", () => {
    assert.equal(formatTitle("a state-of-the-art setup"), "A State-of-the-Art Setup");
  });
  it("handles single word and already-formatted input", () => {
    assert.equal(formatTitle("hello"), "Hello");
    assert.equal(formatTitle("Already Fine"), "Already Fine");
  });
  it("keeps punctuation/whitespace structure", () => {
    assert.equal(formatTitle("  why? because!  "), "Why? Because!");
  });
});

describe("formatTitle — other styles", () => {
  it("sentence case", () => {
    assert.equal(formatTitle("how to bake the cake", "sentence"), "How to bake the cake");
    assert.equal(formatTitle("how to bake the CAKE", "sentence"), "How to bake the CAKE"); // CAKE preserved as acronym
  });
  it("sentence case treats all-caps words as acronyms (preserved)", () => {
    assert.equal(formatTitle("HOW to Bake THE Cake", "sentence"), "HOW To bake THE cake");
  });
  it("fully-shouted titles are normalized (known acronyms restored)", () => {
    assert.equal(formatTitle("HOW TO BAKE A CAKE", "title"), "How to Bake a Cake");
    assert.equal(formatTitle("BEST AI CAMERAS 2026", "title"), "Best AI Cameras 2026");
    assert.equal(formatTitle("HOW TO BAKE THE CAKE", "sentence"), "How to bake the cake");
  });
  it("sentence case preserves acronyms", () => {
    assert.equal(formatTitle("best AI tools", "sentence"), "Best AI tools");
  });
  it("upper and lower styles", () => {
    assert.equal(formatTitle("Hello World", "upper"), "HELLO WORLD");
    assert.equal(formatTitle("Hello World", "lower"), "hello world");
  });
});

describe("unicode safety", () => {
  it("counts emoji as one grapheme (ZWJ family)", () => {
    assert.equal(charCountGraphemes("👨‍👩‍👧‍👦"), 1);
  });
  it("emoji survives formatting untouched", () => {
    assert.equal(formatTitle("🔥 best deals today 🔥"), "🔥 Best Deals Today 🔥");
  });
  it("CJK text is unchanged by title case", () => {
    assert.equal(formatTitle("最好的蛋糕食谱"), "最好的蛋糕食谱");
  });
  it("accented latin capitalizes correctly", () => {
    assert.equal(formatTitle("café au lait guide"), "Café Au Lait Guide");
  });
});

describe("empty / invalid input", () => {
  it("empty or whitespace-only returns empty string", () => {
    assert.equal(formatTitle(""), "");
    assert.equal(formatTitle("   "), "");
  });
  it("throws TypeError for non-string input", () => {
    assert.throws(() => formatTitle(123 as unknown as string), TypeError);
    assert.throws(() => checkTitle(null as unknown as string), TypeError);
  });
});

describe("checkTitle limits", () => {
  it("normal title passes", () => {
    const r = checkTitle("How to Bake a Cake");
    assert.equal(r.overHardLimit, false);
    assert.equal(r.truncatedInSearch, false);
    assert.equal(r.charCount, 18);
    assert.equal(r.note, "OK");
  });
  it("flags search truncation above 70 chars", () => {
    const r = checkTitle("a".repeat(75));
    assert.equal(r.truncatedInSearch, true);
    assert.equal(r.overHardLimit, false);
    assert.ok(r.note.includes("truncate"));
  });
  it("exactly 100 chars is allowed", () => {
    const r = checkTitle("a".repeat(100));
    assert.equal(r.overHardLimit, false);
    assert.equal(r.charsOver, 0);
  });
  it("101 chars is over the hard limit", () => {
    const r = checkTitle("a".repeat(101));
    assert.equal(r.overHardLimit, true);
    assert.equal(r.charsOver, 1);
    assert.ok(r.note.includes("100-character"));
  });
  it("constants match platform rules", () => {
    assert.equal(TITLE_HARD_LIMIT, 100);
    assert.equal(TITLE_DISPLAY_LIMIT, 70);
  });
});

describe("isPreservedWord", () => {
  it("detects acronyms", () => assert.equal(isPreservedWord("AI"), true));
  it("single capital letter is not an acronym but single-letter words pass through", () => {
    assert.equal(isPreservedWord("I"), false);
    assert.equal(formatTitle("i am"), "I Am");
  });
  it("empty string returns true (passthrough)", () => assert.equal(isPreservedWord(""), true));
});

describe("SMALL_WORDS", () => {
  it("contains core articles/conjunctions/prepositions", () => {
    for (const w of ["a", "an", "the", "and", "but", "or", "of", "to", "in"]) {
      assert.ok(SMALL_WORDS.has(w), w);
    }
  });
});

describe("runTool — formatter template adapter", () => {
  it("formats a title with the selected style label", () => {
    const r = runTool({ title: "how to bake the perfect cake", style: "Title Case" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.formatted, "How to Bake the Perfect Cake");
    assert.equal(r.values!.charCount, 28);
  });
  it("maps all four style labels to the engine", () => {
    assert.equal(runTool({ title: "hello world", style: "Sentence case" }).values!.formatted, "Hello world");
    assert.equal(runTool({ title: "hello world", style: "ALL CAPS" }).values!.formatted, "HELLO WORLD");
    assert.equal(runTool({ title: "Hello World", style: "lowercase" }).values!.formatted, "hello world");
  });
  it("rejects an empty title", () => {
    const r = runTool({ title: "   ", style: "Title Case" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title field is empty/);
  });
  it("rejects a missing title", () => {
    const r = runTool({ style: "Title Case" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Enter a title/);
  });
  it("rejects a non-string title", () => {
    assert.equal(runTool({ title: 123, style: "Title Case" }).ok, false);
  });
  it("rejects an unknown style", () => {
    const r = runTool({ title: "hello", style: "Fancy" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Pick a style/);
  });
  it("rejects a missing style", () => {
    assert.equal(runTool({ title: "hello" }).ok, false);
  });
  it("rejects titles over the 100-grapheme hard limit", () => {
    const r = runTool({ title: "a".repeat(101), style: "Title Case" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /100/);
  });
  it("accepts exactly 100 graphemes and warns about search truncation", () => {
    const r = runTool({ title: "a".repeat(100), style: "Title Case" });
    assert.equal(r.ok, true);
    assert.match(String(r.values!.warning), /truncate in search/);
  });
  it("gives an OK warning for short titles", () => {
    const r = runTool({ title: "hello", style: "Title Case" });
    assert.equal(r.ok, true);
    assert.match(String(r.values!.warning), /OK/);
  });
  it("preserves acronyms through the adapter", () => {
    const r = runTool({ title: "best AI tools for DIY", style: "Title Case" });
    assert.equal(r.values!.formatted, "Best AI Tools for DIY");
  });
  it("counts emoji as one grapheme, not UTF-16 units", () => {
    const r = runTool({ title: "🔥 hot take", style: "lowercase" });
    assert.equal(r.values!.charCount, 10);
  });
  it("is deterministic across runs", () => {
    const v = { title: "MY BEST VIDEO EVER AI", style: "Title Case" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output keys match the meta outputs contract (formatted, charCount, warning)", () => {
    const r = runTool({ title: "hello", style: "Title Case" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["charCount", "formatted", "warning"]);
  });
});
