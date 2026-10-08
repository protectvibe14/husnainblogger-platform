import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  fitReply,
  COMMENT_MAX,
  COMMENT_SNIPPET_MAX,
  MAX_REPLY_LENGTH,
  TONE_OPTIONS,
  ABUSIVE_MARKERS,
  FUNNY_REPLIES,
  WARM_REPLIES,
  WITTY_REPLIES,
  REDIRECT_REPLIES,
  BOUNDARY_REPLIES,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["replies", "toneFocus", "guidance"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-comment-reply-idea-generator", () => {
  it("happy path: 8 replies, 2 per flavor", () => {
    const v = okValues({ pastedComment: "This tutorial saved me hours!" });
    const replies = v.replies as string[];
    assert.equal(replies.length, 8);
    assert.equal(v.toneFocus, "balanced (all four flavors)");
    for (const r of replies) {
      assert.ok([...r].length <= MAX_REPLY_LENGTH, `reply over limit: ${r}`);
      assert.ok(!r.includes("[COMMENT]"), `unfilled slot: ${r}`);
    }
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ pastedComment: "nice video" });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual(metaIds, [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("missing comment errors (does not invent one)", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /paste a comment/i);
  });

  it("blank comment errors", () => {
    const r = runTool({ pastedComment: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /paste a comment/i);
  });

  it("comment over 150 chars errors", () => {
    const r = runTool({ pastedComment: "x".repeat(COMMENT_MAX + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /150/);
  });

  it("comment exactly 150 chars is accepted", () => {
    const v = okValues({ pastedComment: "y".repeat(COMMENT_MAX) });
    assert.equal((v.replies as string[]).length, 8);
  });

  it("chosen tone's flavor leads the list", () => {
    const v = okValues({ pastedComment: "love this", tone: "funny" });
    assert.equal(v.toneFocus, "funny");
    const replies = v.replies as string[];
    assert.equal(replies.length, 8);
    // first two replies are exact members of the filled funny bank
    const expected = new Set(
      FUNNY_REPLIES.map((f) => fitReply(f.split("[COMMENT]").join("love this")))
    );
    assert.ok(expected.has(replies[0]), `unexpected first reply: ${replies[0]}`);
    assert.ok(expected.has(replies[1]), `unexpected second reply: ${replies[1]}`);
  });

  it("all four flavors appear when a tone is chosen", () => {
    const v = okValues({ pastedComment: "cool", tone: "warm" });
    const replies = v.replies as string[];
    assert.equal(replies.length, 8);
    const texts = replies.join("\n");
    assert.ok(texts.includes("\u{1F3A5}") || texts.includes("video")); // redirect flavor present
  });

  it("unknown tone errors", () => {
    const r = runTool({ pastedComment: "nice", tone: "sarcastic" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it("abusive comment returns ONLY boundary templates", () => {
    const v = okValues({ pastedComment: "you are such an idiot, hate this" });
    const replies = v.replies as string[];
    assert.equal(replies.length, BOUNDARY_REPLIES.length);
    assert.equal(v.toneFocus, "neutral boundary");
    assert.match(v.guidance as string, /boundary/i);
    // no roast-back content
    for (const r of replies) {
      assert.ok(!r.toLowerCase().includes("idiot"));
    }
  });

  it("each abuse marker triggers boundary mode", () => {
    for (const marker of ABUSIVE_MARKERS) {
      const v = okValues({ pastedComment: `this is ${marker} behavior` });
      assert.equal(v.toneFocus, "neutral boundary", `marker: ${marker}`);
    }
  });

  it("abuse detection is case-insensitive", () => {
    const v = okValues({ pastedComment: "You are STUPID" });
    assert.equal(v.toneFocus, "neutral boundary");
  });

  it("harmless critical comment is NOT flagged abusive", () => {
    const v = okValues({ pastedComment: "I disagree with this take, the pacing felt off" });
    assert.equal((v.replies as string[]).length, 8);
    assert.notEqual(v.toneFocus, "neutral boundary");
  });

  it("fitReply caps at 150 chars at a word boundary", () => {
    const long = "word ".repeat(60).trim();
    const out = fitReply(long);
    assert.ok([...out].length <= MAX_REPLY_LENGTH);
    assert.ok(out.endsWith("\u2026"));
    assert.ok(!out.endsWith(" \u2026"));
  });

  it("fitReply leaves short text untouched", () => {
    assert.equal(fitReply("short reply"), "short reply");
  });

  it("comment snippet inside replies is at most 40 chars", () => {
    const v = okValues({ pastedComment: "a".repeat(100) });
    const snippet = "a".repeat(COMMENT_SNIPPET_MAX);
    const replies = v.replies as string[];
    assert.ok(replies.some((r) => r.includes(snippet)));
    assert.ok(!replies.some((r) => r.includes("a".repeat(COMMENT_SNIPPET_MAX + 1))));
  });

  it("unicode comment works (emoji + CJK), no crash", () => {
    const v = okValues({ pastedComment: "寿司が大好き 🍣🔥" });
    assert.equal((v.replies as string[]).length, 8);
  });

  it("word-bank sizes match the documented contract", () => {
    assert.equal(FUNNY_REPLIES.length, 6);
    assert.equal(WARM_REPLIES.length, 6);
    assert.equal(WITTY_REPLIES.length, 6);
    assert.equal(REDIRECT_REPLIES.length, 6);
    assert.equal(BOUNDARY_REPLIES.length, 6);
    assert.equal(ABUSIVE_MARKERS.length, 10);
    assert.equal(TONE_OPTIONS.length, 4);
  });

  it("banks contain no empty frames and replies stay under the limit", () => {
    const snippet = "x".repeat(COMMENT_SNIPPET_MAX);
    for (const bank of [FUNNY_REPLIES, WARM_REPLIES, WITTY_REPLIES, REDIRECT_REPLIES, BOUNDARY_REPLIES]) {
      for (const f of bank) {
        assert.ok(f.trim().length > 0);
        assert.ok([...fitReply(f.split("[COMMENT]").join(snippet))].length <= MAX_REPLY_LENGTH);
      }
    }
  });

  it("determinism: same comment + tone -> identical replies", () => {
    const input = { pastedComment: "This tutorial saved me hours!", tone: "witty" };
    const a = okValues(input);
    const b = okValues(input);
    assert.deepEqual(a, b);
  });

  it("different comments produce different reply sets", () => {
    const a = okValues({ pastedComment: "first!" });
    const b = okValues({ pastedComment: "amazing work here" });
    assert.notDeepEqual(a.replies, b.replies);
  });

  it("guidance discloses no auto-posting", () => {
    const v = okValues({ pastedComment: "hi" });
    assert.match(v.guidance as string, /never posts/i);
  });
});
