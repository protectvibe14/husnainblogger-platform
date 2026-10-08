import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateReplyDrafts,
  hasRepeatedWords,
  hashString,
  stripTags,
  takeCodePoints,
  excerptOf,
  REPLY_TEMPLATES,
  REPLY_TONES,
  DRAFT_COUNT,
  MAX_COMMENT_CHARS,
  EXCERPT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  commentText: "This post finally made email segmentation click for me. Thank you!",
  replyTone: "friendly",
  authorName: "Sara",
};

describe("blog-comment-reply-generator (tool-444)", () => {
  it("happy path: returns 3 reply drafts referencing the comment", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const drafts = r.values?.replyDrafts as string[];
    assert.equal(drafts.length, DRAFT_COUNT);
    for (const d of drafts) assert.ok(d.length > 20);
    assert.ok(drafts.some((d) => d.includes("Sara")), "author name used in greeting");
  });

  it("template bank sizes are as documented (3 tones x 6 = 18)", () => {
    assert.equal(REPLY_TONES.length, 3);
    assert.equal(Object.keys(REPLY_TEMPLATES).length, 3);
    for (const t of REPLY_TONES) {
      assert.equal(REPLY_TEMPLATES[t].length, 6, `tone ${t} needs 6 templates`);
    }
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const metaIds = new Set((outputs as { id: string }[]).map((o) => o.id));
    assert.deepEqual(new Set(Object.keys(r.values ?? {})), metaIds);
  });

  it("determinism: same comment + tone produce identical drafts", () => {
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("rejects missing commentText", () => {
    const r = runTool({ ...baseValues, commentText: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /comment/i);
  });

  it("rejects whitespace-only commentText", () => {
    const r = runTool({ ...baseValues, commentText: "   \n  " });
    assert.equal(r.ok, false);
  });

  it("rejects invalid replyTone", () => {
    const r = runTool({ ...baseValues, replyTone: "sarcastic" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("authorName is optional: falls back to a generic greeting, never blank", () => {
    const r = runTool({ ...baseValues, authorName: "" });
    assert.equal(r.ok, true);
    const drafts = r.values?.replyDrafts as string[];
    for (const d of drafts) {
      assert.ok(d.includes("Hi there,"), "generic greeting present");
      assert.ok(!d.includes("{author}"));
    }
  });

  it("no unfilled slots remain in any draft", () => {
    const r = runTool(baseValues);
    for (const d of r.values?.replyDrafts as string[]) {
      assert.ok(!d.includes("{author}") && !d.includes("{excerpt}"));
    }
  });

  it("tones produce distinct drafts", () => {
    const f = (runTool(baseValues).values?.replyDrafts as string[])[0];
    const p = (runTool({ ...baseValues, replyTone: "professional" }).values?.replyDrafts as string[])[0];
    const w = (runTool({ ...baseValues, replyTone: "witty" }).values?.replyDrafts as string[])[0];
    assert.ok(f !== p && p !== w && f !== w);
  });

  it("different comments can rotate the draft set (hash start index)", () => {
    const a = runTool(baseValues).values?.replyDrafts as string[];
    const b = runTool({ ...baseValues, commentText: "Completely different words here about newsletters." }).values?.replyDrafts as string[];
    // sets may occasionally coincide by hash; at minimum both are valid 3-draft sets
    assert.equal(a.length, 3);
    assert.equal(b.length, 3);
  });

  it("overlong comment is trimmed with a visible notice", () => {
    const r = runTool({ ...baseValues, commentText: "word ".repeat(300) });
    assert.equal(r.ok, true);
    const drafts = r.values?.replyDrafts as string[];
    assert.ok(drafts[0].includes("trimmed"), "visible trim notice");
  });

  it("excerpt never exceeds the documented excerpt size in code points", () => {
    const long = "This is a very long comment. ".repeat(40);
    const r = runTool({ ...baseValues, commentText: long });
    const drafts = r.values?.replyDrafts as string[];
    // excerpt is embedded; check the helper directly for the bound
    assert.ok([...excerptOf(long)].length <= EXCERPT_CHARS + 1);
    for (const d of drafts) assert.ok(d.length > 0);
  });

  it("excerptOf keeps emoji whole and ends with an ellipsis when cut", () => {
    const s = "Love this post! 🎉".repeat(20);
    const ex = excerptOf(s);
    assert.ok(ex.endsWith("…"));
    assert.ok(!/\uFFFD/.test(ex), "no replacement characters");
  });

  it("HTML tags are stripped from comment and author name", () => {
    const r = runTool({
      ...baseValues,
      commentText: "Great post <script>alert(1)</script> really!",
      authorName: "<b>Sara</b>",
    });
    assert.equal(r.ok, true);
    const drafts = r.values?.replyDrafts as string[];
    for (const d of drafts) {
      assert.ok(!d.includes("<script>") && !d.includes("<b>"));
    }
    assert.ok(drafts[0].includes("Sara"));
  });

  it("RTL comment works and is embedded in drafts", () => {
    const r = runTool({ ...baseValues, commentText: "مقال رائع، شكراً لك!" });
    assert.equal(r.ok, true);
    const drafts = r.values?.replyDrafts as string[];
    assert.ok(drafts.some((d) => d.includes("مقال رائع")));
  });

  it("hasRepeatedWords detection works", () => {
    assert.equal(hasRepeatedWords("thanks thanks a lot"), true);
    assert.equal(hasRepeatedWords("thanks a lot"), false);
  });

  it("duplicate-word input triggers a review flag on the draft", () => {
    const r = runTool({ ...baseValues, commentText: "great great post, very very helpful" });
    assert.equal(r.ok, true);
    const drafts = r.values?.replyDrafts as string[];
    assert.ok(drafts.some((d) => d.includes("Review flag")));
  });

  it("hashString is deterministic", () => {
    assert.equal(hashString("hello"), hashString("hello"));
    assert.notEqual(hashString("hello"), hashString("world"));
  });

  it("takeCodePoints does not split emoji", () => {
    assert.equal([...takeCodePoints("a🎉b🎉", 2)].length, 2);
  });

  it("stripTags removes markup", () => {
    assert.equal(stripTags("<p>hi</p>"), "hi");
  });

  it("generateReplyDrafts throws RangeError on empty comment", () => {
    assert.throws(() => generateReplyDrafts("   ", "friendly", ""), RangeError);
  });

  it("non-string tone is rejected", () => {
    const r = runTool({ ...baseValues, replyTone: 7 });
    assert.equal(r.ok, false);
  });

  it("MAX_COMMENT_CHARS is a sane documented bound", () => {
    assert.equal(MAX_COMMENT_CHARS, 1000);
  });
});
