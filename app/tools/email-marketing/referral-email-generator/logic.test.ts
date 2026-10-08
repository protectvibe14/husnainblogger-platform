import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateReferralEmail,
  hasRepeatedWords,
  sanitizePlain,
  SUBJECTS,
  BODY_TEMPLATES,
  SHARE_BLOCK,
  REFERRAL_TONES,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = {
  programName: "BookClub Plus",
  reward: "$20 credit",
  audience: "loyal readers",
  tone: "friendly",
};

describe("referral-email-generator (tool-433)", () => {
  it("happy path: returns 3 outputs with correct ids", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), ["bodyDraft", "shareBlock", "subjectOptions"]);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    const outIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(r.values!).sort(), outIds);
  });

  it("subject bank is 4 tones x 5 = 20 templates", () => {
    assert.equal(REFERRAL_TONES.length, 4);
    let total = 0;
    for (const t of REFERRAL_TONES) {
      assert.equal(SUBJECTS[t].length, 5, `tone ${t} must have 5 subjects`);
      total += SUBJECTS[t].length;
    }
    assert.equal(total, 20);
  });

  it("body templates: 4 tones, each uses programName/reward/audience slots", () => {
    for (const t of REFERRAL_TONES) {
      const b = BODY_TEMPLATES[t];
      assert.ok(b.includes("{programName}"), `tone ${t} missing {programName}`);
      assert.ok(b.includes("{reward}"), `tone ${t} missing {reward}`);
      assert.ok(b.includes("{audience}"), `tone ${t} missing {audience}`);
    }
  });

  it("share block has visible link placeholder, never an empty token", () => {
    assert.ok(SHARE_BLOCK.includes("[your referral link here]"));
    const r = runTool(base);
    const block = r.values!.shareBlock as string;
    assert.ok(block.includes("[your referral link here]"));
    assert.ok(!block.includes("{{"), "no unresolved placeholder tokens");
    assert.ok(block.includes("BookClub Plus"));
    assert.ok(block.includes("$20 credit"));
  });

  it("subjects are filled, non-empty, no repeated words", () => {
    const r = runTool(base);
    const subs = r.values!.subjectOptions as string[];
    assert.equal(subs.length, 5);
    for (const s of subs) {
      assert.ok(s.length > 0);
      assert.ok(!s.includes("{"), `unfilled slot in: ${s}`);
      assert.equal(hasRepeatedWords(s), false);
    }
  });

  it("body draft mentions program, reward, audience", () => {
    const r = runTool(base);
    const body = r.values!.bodyDraft as string;
    assert.ok(body.includes("BookClub Plus"));
    assert.ok(body.includes("$20 credit"));
    assert.ok(body.includes("loyal readers"));
  });

  it("validation: missing programName -> error", () => {
    const r = runTool({ reward: "$5", audience: "fans", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("validation: whitespace-only reward -> error", () => {
    const r = runTool({ programName: "X", reward: "   ", audience: "fans", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("reward"));
  });

  it("validation: missing audience -> error", () => {
    const r = runTool({ programName: "X", reward: "$5", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("audience"));
  });

  it("validation: bad tone -> error listing options", () => {
    const r = runTool({ programName: "X", reward: "$5", audience: "fans", tone: "formal" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("friendly"));
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });

  it("overlong input trimmed with visible notice", () => {
    const long = "y".repeat(MAX_INPUT_CHARS + 30);
    const r = runTool({ ...base, audience: long });
    assert.equal(r.ok, true);
    const body = r.values!.bodyDraft as string;
    assert.ok(body.includes("trimmed to 200 characters"));
  });

  it("sanitizePlain strips HTML tags; output has no raw tags", () => {
    assert.equal(sanitizePlain("<i>$20</i> credit"), "$20 credit");
    const r = runTool({ ...base, reward: "<b>$20</b> credit" });
    assert.equal(r.ok, true);
    const body = r.values!.bodyDraft as string;
    assert.ok(!body.includes("<b>"));
  });

  it("edge: emoji input handled in code points; RTL text passes through", () => {
    const r = runTool({ programName: "🎉 Club 🎉", reward: "$5", audience: "الأعضاء", tone: "playful" });
    assert.equal(r.ok, true);
    const subs = r.values!.subjectOptions as string[];
    assert.ok(subs[0].includes("🎉 Club 🎉"));
    assert.ok((r.values!.bodyDraft as string).includes("الأعضاء"));
  });

  it("generateReferralEmail throws on empty programName", () => {
    assert.throws(() => generateReferralEmail("", "$5", "fans", "friendly"), RangeError);
  });
});
