import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TITLE_HARD_LIMIT,
  TITLE_DISPLAY_LIMIT,
  FRONT_LOAD_THRESHOLD,
  charCountGraphemes,
  firstContentWord,
  checkTitleLength,
  runTool,
} from "./logic.ts";

describe("charCountGraphemes", () => {
  it("counts plain ASCII by characters", () => {
    assert.equal(charCountGraphemes("hello"), 5);
  });
  it("counts a single emoji as one grapheme, not UTF-16 units", () => {
    assert.equal(charCountGraphemes("🔥"), 1);
    assert.equal("🔥".length, 2); // sanity: UTF-16 units differ
  });
  it("counts a ZWJ emoji sequence as one grapheme", () => {
    assert.equal(charCountGraphemes("👨‍👩‍👧‍👦"), 1);
    assert.ok("👨‍👩‍👧‍👦".length > 1); // sanity: UTF-16 units differ
  });
  it("counts CJK characters as one each", () => {
    assert.equal(charCountGraphemes("你好世界"), 4);
  });
  it("throws on non-string input", () => {
    assert.throws(() => charCountGraphemes(42 as unknown as string), TypeError);
  });
});

describe("firstContentWord — front-load heuristic", () => {
  it("finds the first 4+ letter non-small word and its grapheme index", () => {
    const hit = firstContentWord("how to bake the perfect cake");
    assert.deepEqual(hit, { word: "bake", graphemeIndex: 7 });
  });
  it("skips small words at the start", () => {
    const hit = firstContentWord("the end");
    assert.equal(hit, null); // "end" is only 3 letters
  });
  it("returns null when no content word exists", () => {
    assert.equal(firstContentWord("a of to"), null);
    assert.equal(firstContentWord("... !!!"), null);
  });
  it("handles emoji before the keyword in the index", () => {
    const hit = firstContentWord("🔥 new camera review");
    assert.equal(hit!.word, "camera");
    assert.equal(hit!.graphemeIndex, 6); // 🔥(1) + space(1) + "new "(4)
  });
});

describe("checkTitleLength — statuses", () => {
  it("returns ok for a short title", () => {
    const c = checkTitleLength("my vlog");
    assert.equal(c.status, "ok");
    assert.equal(c.truncatedInSearch, false);
    assert.equal(c.charsRemaining, TITLE_HARD_LIMIT - 7);
  });
  it("returns truncated-in-search at 71 characters", () => {
    const c = checkTitleLength("a".repeat(71));
    assert.equal(c.status, "truncated-in-search");
    assert.equal(c.truncatedInSearch, true);
  });
  it("returns ok at exactly 70 characters", () => {
    assert.equal(checkTitleLength("a".repeat(TITLE_DISPLAY_LIMIT)).status, "ok");
  });
  it("allows exactly 100 (reports truncated-in-search, not over-hard-limit)", () => {
    const c = checkTitleLength("a".repeat(TITLE_HARD_LIMIT));
    assert.equal(c.status, "truncated-in-search");
    assert.equal(c.charsRemaining, 0);
  });
  it("returns over-hard-limit at 101 characters", () => {
    const c = checkTitleLength("a".repeat(101));
    assert.equal(c.status, "over-hard-limit");
    assert.equal(c.charsRemaining, 0);
    assert.match(c.guidance, /Over YouTube's 100-character hard limit by 1/);
  });
  it("always includes the unit-difference note", () => {
    const c = checkTitleLength("hello");
    assert.match(c.unitNote, /UTF-16/);
  });
  it("throws on empty input", () => {
    assert.throws(() => checkTitleLength("   "), /Empty title/);
  });
  it("throws TypeError on non-string input", () => {
    assert.throws(() => checkTitleLength(9 as unknown as string), TypeError);
  });
});

describe("checkTitleLength — front-load guidance", () => {
  it("warns when the first content word starts late", () => {
    const late = "a ".repeat(25) + "camera"; // content word starts at grapheme 50
    const c = checkTitleLength(late);
    assert.match(c.guidance, /Front-load it into the first 40 characters/);
  });
  it("praises early keyword placement within the ok band", () => {
    const c = checkTitleLength("camera buying guide for beginners");
    assert.match(c.guidance, /good front-loading/);
  });
  it("mentions truncation risk when keyword is early but title is long", () => {
    const c = checkTitleLength("camera " + "a ".repeat(40));
    assert.equal(c.status, "truncated-in-search");
    assert.match(c.guidance, /tail past ~70 characters will be cut off/);
  });
});

describe("runTool — checker template adapter", () => {
  it("returns count, status, guidance for a valid title", () => {
    const r = runTool({ title: "best camera for youtube 2026" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.charCount, 28);
    assert.equal(r.values!.status, "ok");
    assert.match(String(r.values!.guidance), /good front-loading/);
  });
  it("rejects an empty title with a human message", () => {
    const r = runTool({ title: "  " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title field is empty/);
  });
  it("rejects a missing title", () => {
    assert.equal(runTool({}).ok, false);
  });
  it("rejects a non-string title", () => {
    assert.equal(runTool({ title: null }).ok, false);
  });
  it("does NOT error on 101 chars — reports over-hard-limit status", () => {
    const r = runTool({ title: "a".repeat(101) });
    assert.equal(r.ok, true);
    assert.equal(r.values!.status, "over-hard-limit");
  });
  it("includes the UTF-16 unit note in guidance", () => {
    const r = runTool({ title: "hello" });
    assert.match(String(r.values!.guidance), /UTF-16/);
  });
  it("is deterministic across runs", () => {
    const v = { title: "🔥 top 10 AI tools for creators" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output keys match the meta outputs contract (charCount, status, guidance)", () => {
    const r = runTool({ title: "hello world" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["charCount", "guidance", "status"]);
  });
});
