import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  COMMENT_TYPES,
  TONES,
  TEMPLATES_PER_COMBO,
  TOTAL_TEMPLATES,
  bankSize,
  type CommentTypeId,
  type ToneId,
} from "./logic.ts";
import { outputs } from "./meta.ts";

describe("comment-reply-templates", () => {
  it("happy path: returns 2 templates for a type + tone", () => {
    const r = runTool({ commentType: "thank-you", tone: "warm" });
    assert.equal(r.ok, true);
    const replies = r.values!["replies"] as string[];
    assert.equal(replies.length, TEMPLATES_PER_COMBO);
    assert.ok(replies[0].startsWith("Template 1:"));
    assert.ok(replies[0].includes("[Commenter]"));
    assert.ok(replies[0].includes("[Your Name]"));
  });

  it("all 15 type x tone combos produce templates", () => {
    for (const t of COMMENT_TYPES) {
      for (const tone of TONES) {
        const r = runTool({ commentType: t, tone });
        assert.equal(r.ok, true, `${t}/${tone}`);
        assert.equal((r.values!["replies"] as string[]).length, 2);
      }
    }
  });

  it("question templates include an answer placeholder", () => {
    const r = runTool({ commentType: "question", tone: "professional" });
    for (const reply of r.values!["replies"] as string[]) {
      assert.ok(reply.includes("[your answer]") || reply.includes("[Your answer]"));
    }
  });

  it("collaboration templates include an email placeholder", () => {
    const r = runTool({ commentType: "collaboration", tone: "warm" });
    for (const reply of r.values!["replies"] as string[]) {
      assert.ok(reply.includes("[your email]"));
    }
  });

  it("comment type and tone are case-insensitive", () => {
    const r = runTool({ commentType: "Criticism", tone: "PLAYFUL" });
    assert.equal(r.ok, true);
  });

  it("missing comment type -> error", () => {
    const r = runTool({ tone: "warm" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("comment type"));
  });

  it("blank comment type -> error", () => {
    const r = runTool({ commentType: "  ", tone: "warm" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("invalid comment type -> error listing valid types", () => {
    const r = runTool({ commentType: "praise", tone: "warm" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("thank-you"));
    assert.ok(r.error!.includes("spam-adjacent"));
  });

  it("missing tone -> error", () => {
    const r = runTool({ commentType: "question" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("tone"));
  });

  it("invalid tone -> error listing valid tones", () => {
    const r = runTool({ commentType: "question", tone: "sarcastic" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("warm"));
  });

  it("note discloses fixed bank + no auto-reply + placeholder legend", () => {
    const r = runTool({ commentType: "thank-you", tone: "warm" });
    const note = r.values!["note"] as string;
    assert.ok(note.includes("30 templates"));
    assert.ok(note.toLowerCase().includes("cannot auto-reply"));
    assert.ok(note.includes("[Commenter]"));
  });

  it("tones actually differ per type", () => {
    const tones = new Set<ToneId>();
    for (const tone of TONES) {
      const r = runTool({ commentType: "criticism" as CommentTypeId, tone });
      for (const reply of r.values!["replies"] as string[]) tones.add(tone);
      void r;
    }
    assert.equal(tones.size, 3);
    const w = (runTool({ commentType: "criticism", tone: "warm" }).values!["replies"] as string[]).join();
    const p = (runTool({ commentType: "criticism", tone: "professional" }).values!["replies"] as string[]).join();
    assert.notEqual(w, p);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const v = { commentType: "spam-adjacent", tone: "playful" };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("bank size documented: 5 x 3 x 2 = 30 templates", () => {
    assert.equal(TOTAL_TEMPLATES, 30);
    assert.equal(bankSize(), 30);
  });

  it("every template is non-empty and mentions the commenter placeholder", () => {
    for (const t of COMMENT_TYPES) {
      for (const tone of TONES) {
        const r = runTool({ commentType: t, tone });
        for (const reply of r.values!["replies"] as string[]) {
          assert.ok(reply.length > 20, `too short: ${reply}`);
          assert.ok(reply.includes("[Commenter]"), `missing placeholder: ${reply}`);
        }
      }
    }
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ commentType: "thank-you", tone: "warm" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });
});
