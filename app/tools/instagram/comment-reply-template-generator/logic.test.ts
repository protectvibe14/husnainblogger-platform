import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateReplies,
  COMMENT_TYPES,
  COMMENT_TYPE_LABELS,
  REPLY_TONES,
  TONE_LABELS,
  BANK_SIZES,
  ASSUMPTIONS,
} from "./logic.ts";

describe("comment-reply-template-generator", () => {
  it("happy path: 3 praise replies in friendly tone with brand filled", () => {
    const r = runTool({ commentType: "praise", tone: "friendly", brandName: "GlowCo" });
    assert.equal(r.ok, true);
    const replies = r.values!.replies as string[];
    assert.equal(replies.length, 3);
    for (const reply of replies) {
      assert.ok(reply.includes("{name}"), reply);
      assert.ok(reply.includes("GlowCo"), reply);
      assert.ok(!reply.includes("{brand}"), reply);
    }
  });

  it("brandName omitted: {brand} slot is kept as placeholder", () => {
    const r = runTool({ commentType: "question", tone: "professional" });
    assert.equal(r.ok, true);
    const replies = r.values!.replies as string[];
    assert.ok(replies.every((x) => x.includes("{brand}")));
  });

  it("tone omitted: defaults to friendly", () => {
    const a = runTool({ commentType: "criticism" });
    const b = runTool({ commentType: "criticism", tone: "friendly" });
    assert.equal(a.ok, true);
    assert.deepEqual(a.values!.replies, b.values!.replies);
  });

  it("all comment types × tones generate 3 replies", () => {
    for (const commentType of COMMENT_TYPES) {
      for (const tone of REPLY_TONES) {
        const r = runTool({ commentType, tone });
        assert.equal(r.ok, true, `${commentType}/${tone}`);
        assert.equal((r.values!.replies as string[]).length, 3);
      }
    }
  });

  it("commentType is required", () => {
    const r = runTool({ tone: "friendly" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /commentType/i);
  });

  it("unknown commentType is rejected and lists valid types", () => {
    const r = runTool({ commentType: "hate", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("praise"));
    assert.ok(r.error!.includes("spam"));
  });

  it("unknown tone is rejected and lists valid tones", () => {
    const r = runTool({ commentType: "praise", tone: "sassy" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("friendly"));
  });

  it("commentType is case-sensitive", () => {
    const r = runTool({ commentType: "Praise", tone: "friendly" });
    assert.equal(r.ok, false);
  });

  it("brandName is trimmed before insertion", () => {
    const r = runTool({ commentType: "spam", tone: "formal", brandName: "  Acme  " });
    assert.ok((r.values!.replies as string[]).every((x) => x.includes("Acme")));
    assert.ok(!(r.values!.replies as string[]).some((x) => x.includes("  Acme")));
  });

  it("blank brandName behaves like omitted", () => {
    const r = runTool({ commentType: "praise", tone: "playful", brandName: "   " });
    assert.ok((r.values!.replies as string[]).every((x) => x.includes("{brand}")));
  });

  it("replies differ across comment types", () => {
    const praise = runTool({ commentType: "praise", tone: "friendly" }).values!.replies;
    const criticism = runTool({ commentType: "criticism", tone: "friendly" }).values!.replies;
    assert.notDeepEqual(praise, criticism);
  });

  it("replies differ across tones", () => {
    const friendly = runTool({ commentType: "question", tone: "friendly" }).values!.replies;
    const formal = runTool({ commentType: "question", tone: "formal" }).values!.replies;
    assert.notDeepEqual(friendly, formal);
  });

  it("copyAll joins replies with blank lines", () => {
    const r = runTool({ commentType: "spam", tone: "playful" });
    const replies = r.values!.replies as string[];
    assert.equal(r.values!.copyAll, replies.join("\n\n"));
  });

  it("output ids match meta.ts (replies, copyAll)", () => {
    const r = runTool({ commentType: "praise", tone: "friendly" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "replies"]);
  });

  it("bank sizes documented: 3 per pair, 4 types, 4 tones, 48 total", () => {
    assert.equal(BANK_SIZES.templatesPerPair, 3);
    assert.equal(BANK_SIZES.commentTypes, 4);
    assert.equal(BANK_SIZES.tones, 4);
    assert.equal(BANK_SIZES.total, 48);
  });

  it("deterministic: same inputs give identical output", () => {
    const a = runTool({ commentType: "question", tone: "professional", brandName: "X" });
    const b = runTool({ commentType: "question", tone: "professional", brandName: "X" });
    assert.deepEqual(a, b);
  });

  it("null values object is rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("every comment type and tone has a human label", () => {
    for (const t of COMMENT_TYPES) assert.ok(COMMENT_TYPE_LABELS[t].length > 0, t);
    for (const t of REPLY_TONES) assert.ok(TONE_LABELS[t].length > 0, t);
  });

  it("assumptions disclose template-based, non-AI nature", () => {
    assert.ok(ASSUMPTIONS.some((a) => a.includes("48 hand-written")));
    assert.ok(ASSUMPTIONS.some((a) => a.includes("not AI")));
  });

  it("no template is empty and all contain a {name} slot", () => {
    const { replies } = generateReplies("praise", "friendly", undefined);
    assert.ok(replies.every((x) => x.length > 10 && x.includes("{name}")));
  });
});
