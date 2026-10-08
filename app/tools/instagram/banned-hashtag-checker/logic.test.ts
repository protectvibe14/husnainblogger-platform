/**
 * Tests for banned-hashtag-checker logic. Zero dependencies: node:test + node:assert only.
 * Run from the husnainblogger-platform root:
 *   node --test app/tools/instagram/banned-hashtag-checker/logic.test.ts
 * (Node >= 22 strips erasable TypeScript syntax natively; logic.ts uses only
 *  interfaces, type aliases, and annotations, so it imports directly.)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  extractHashtags,
  normalizeTag,
  checkHashtags,
  runTool,
  type BannedList,
} from "./logic.ts";

const dir = dirname(fileURLToPath(import.meta.url));
const bannedList = JSON.parse(readFileSync(join(dir, "banned-list.json"), "utf8"));

describe("extractHashtags", () => {
  it("extracts simple ascii hashtags without the #", () => {
    assert.deepEqual(extractHashtags("love #travel and #Food123"), ["travel", "Food123"]);
  });
  it("is unicode-aware (non-Latin scripts)", () => {
    const out = extractHashtags("#日本語 #путешествия #سفر");
    assert.deepEqual(out, ["日本語", "путешествия", "سفر"]);
  });
  it("allows underscores and numbers inside tags", () => {
    assert.deepEqual(extractHashtags("#my_tag_2"), ["my_tag_2"]);
  });
  it("ignores a lone # and #-followed-by-punctuation", () => {
    assert.deepEqual(extractHashtags("price # only and #!wow"), []);
  });
  it("returns [] for text with no hashtags", () => {
    assert.deepEqual(extractHashtags("just a caption"), []);
  });
  it("returns [] for non-string input", () => {
    assert.deepEqual(extractHashtags(undefined as unknown as string), []);
    assert.deepEqual(extractHashtags(42 as unknown as string), []);
  });
  it("handles empty string", () => {
    assert.deepEqual(extractHashtags(""), []);
  });
});

describe("normalizeTag", () => {
  it("lowercases and trims", () => {
    assert.equal(normalizeTag("  PushUps "), "pushups");
  });
});

describe("checkHashtags", () => {
  it("flags a known banned tag from the bundled list", () => {
    const r = checkHashtags("my workout #pushups routine", bannedList);
    assert.equal(r.summary.verdict, "flagged");
    assert.equal(r.summary.flaggedCount, 1);
    const t = r.tags.find((x) => x.normalizedTag === "pushups");
    assert.ok(t);
    assert.equal(t.status, "flagged");
    assert.equal(t.matchedEntry, "pushups");
  });
  it("is case-insensitive", () => {
    const r = checkHashtags("#PUSHUPS #PushUps #pushups", bannedList);
    assert.equal(r.summary.totalUniqueTags, 1);
    assert.equal(r.tags[0].occurrences, 3);
    assert.equal(r.tags[0].status, "flagged");
    assert.equal(r.tags[0].tag, "PUSHUPS"); // first-seen spelling preserved
  });
  it("marks unknown tags clear but keeps the disclaimer", () => {
    const r = checkHashtags("#mybrand2026 #sunset", bannedList);
    assert.equal(r.summary.verdict, "clear");
    assert.equal(r.summary.clearCount, 2);
    assert.ok(r.summary.disclaimer.length > 20, "disclaimer must be present");
    assert.equal(r.summary.listUpdated, bannedList.updated);
  });
  it("dedupes mixed-case duplicates and counts occurrences", () => {
    const r = checkHashtags("#Travel #travel #TRAVEL", bannedList);
    assert.equal(r.summary.totalUniqueTags, 1);
    assert.equal(r.tags[0].occurrences, 3);
  });
  it("handles unicode tags alongside flagged tags without crashing", () => {
    const r = checkHashtags("#日本語 #pushups", bannedList);
    assert.equal(r.summary.totalUniqueTags, 2);
    assert.equal(r.summary.flaggedCount, 1);
  });
  it("returns empty result set for text with no hashtags", () => {
    const r = checkHashtags("no tags here", bannedList);
    assert.deepEqual(r.tags, []);
    assert.equal(r.summary.totalUniqueTags, 0);
    assert.equal(r.summary.verdict, "clear");
  });
  it("throws TypeError on non-string text", () => {
    assert.throws(() => checkHashtags(123 as unknown as string, bannedList), TypeError);
  });
  it("throws TypeError on malformed banned list", () => {
    assert.throws(() => checkHashtags("#x", {} as unknown as BannedList), TypeError);
    assert.throws(() => checkHashtags("#x", { tags: "nope" } as unknown as BannedList), TypeError);
  });
  it("throws RangeError on oversized input", () => {
    assert.throws(() => checkHashtags("#x".padEnd(20001, "y"), bannedList), RangeError);
  });
  it("banned-list.json has the required schema fields", () => {
    assert.ok(Array.isArray(bannedList.tags) && bannedList.tags.length > 50);
    assert.ok(typeof bannedList.source === "string" && bannedList.source.length > 0);
    assert.ok(typeof bannedList.updated === "string" && bannedList.updated.length > 0);
    assert.ok(typeof bannedList.disclaimer === "string" && bannedList.disclaimer.length > 0);
  });
});

describe("runTool adapter (contract shape)", () => {
  it("returns perTagResults, summary, disclaimer on a flagged caption", () => {
    const r = runTool({ captionText: "love it #dogsofinstagram #travel" });
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values?.perTagResults));
    assert.ok((r.values?.perTagResults as string[]).some((s) => s.includes("FLAGGED")));
    assert.ok((r.values?.perTagResults as string[]).some((s) => s.includes("clear")));
    assert.ok(typeof r.values?.summary === "string");
    assert.ok(typeof r.values?.disclaimer === "string" && (r.values?.disclaimer as string).length > 0);
  });

  it("errors on missing or empty captionText", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ captionText: "   " }).ok, false);
    assert.equal(runTool({ captionText: 42 }).ok, false);
  });

  it("handles captions with no hashtags as a clear summary", () => {
    const r = runTool({ captionText: "just some words, no tags" });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values?.perTagResults, []);
    assert.match(r.values?.summary as string, /No hashtags found/i);
  });

  it("is deterministic (run twice -> identical)", () => {
    const a = runTool({ captionText: "#beach #BEACH #sunset" });
    const b = runTool({ captionText: "#beach #BEACH #sunset" });
    assert.deepEqual(a, b);
  });

  it("dedupes case-insensitively and reports occurrences", () => {
    const r = runTool({ captionText: "#beach #BEACH #Beach" });
    const list = r.values?.perTagResults as string[];
    assert.equal(list.length, 1);
    assert.ok(list[0].includes("×3"));
  });
});
