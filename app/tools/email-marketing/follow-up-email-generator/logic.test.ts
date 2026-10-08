import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateFollowUp,
  hasRepeatedWords,
  STEP_SUBJECTS,
  STEP_BODIES,
  TONE_CLOSINGS,
  FOLLOW_UP_TONES,
  MIN_STEP,
  MAX_STEP,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  sequenceStep: 2,
  originalSubject: "Quick question about your hiring plan",
  goal: "book a 15-minute call",
  tone: "friendly",
};

describe("follow-up-email-generator (tool-410)", () => {
  it("happy path: 4 subject options + body draft", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const subjects = r.values?.subjectOptions as string[];
    assert.equal(subjects.length, 4);
    for (const s of subjects) assert.ok(s.length > 0);
    const draft = r.values?.bodyDraft as string;
    assert.ok(draft.length > 0);
    assert.ok(draft.includes("book a 15-minute call"));
  });

  it("bank sizes are as documented (5x4 subjects, 5x3 bodies, 4 closings)", () => {
    assert.equal(Object.keys(STEP_SUBJECTS).length, 5);
    assert.equal(Object.keys(STEP_BODIES).length, 5);
    for (let step = MIN_STEP; step <= MAX_STEP; step++) {
      assert.equal(STEP_SUBJECTS[step].length, 4, `step ${step} subjects`);
      assert.equal(STEP_BODIES[step].length, 3, `step ${step} bodies`);
    }
    assert.equal(Object.keys(TONE_CLOSINGS).length, 4);
  });

  it("each step uses its own subject patterns", () => {
    const step1 = (runTool({ ...baseValues, sequenceStep: 1 }).values?.subjectOptions as string[]).join("|");
    const step5 = (runTool({ ...baseValues, sequenceStep: 5 }).values?.subjectOptions as string[]).join("|");
    assert.ok(step1 !== step5);
    assert.ok(step5.includes("Break-up"), "step 5 uses break-up style subjects");
  });

  it("original subject is interpolated, no unfilled slots", () => {
    const r = runTool(baseValues);
    const subjects = r.values?.subjectOptions as string[];
    assert.ok(subjects.some((s) => s.includes("Quick question about your hiring plan")));
    const draft = r.values?.bodyDraft as string;
    assert.ok(!draft.includes("{subject}") && !draft.includes("{goal}") && !draft.includes("{closing}"));
  });

  it("tone changes the closing line", () => {
    const friendly = runTool(baseValues).values?.bodyDraft as string;
    const professional = runTool({ ...baseValues, tone: "professional" }).values?.bodyDraft as string;
    assert.ok(friendly.includes("Thanks either way!"));
    assert.ok(professional.includes("Kind regards,"));
    assert.ok(!professional.includes("Thanks either way!"));
  });

  it("draft keeps prospect personalization placeholders intact", () => {
    const r = runTool(baseValues);
    const draft = r.values?.bodyDraft as string;
    assert.ok(draft.includes("{{firstName}}"));
    assert.ok(draft.includes("{{yourName}}"));
  });

  it("no repeated adjacent words in draft or subjects", () => {
    for (let step = MIN_STEP; step <= MAX_STEP; step++) {
      for (const t of FOLLOW_UP_TONES) {
        const r = runTool({ ...baseValues, sequenceStep: step, tone: t });
        assert.equal(r.ok, true);
        const subjects = r.values?.subjectOptions as string[];
        for (const s of subjects) assert.equal(hasRepeatedWords(s), false, `dup: ${s}`);
        assert.equal(hasRepeatedWords(r.values?.bodyDraft as string), false);
      }
    }
  });

  it("rejects step 0", () => {
    assert.equal(runTool({ ...baseValues, sequenceStep: 0 }).ok, false);
  });

  it("rejects step 6", () => {
    assert.equal(runTool({ ...baseValues, sequenceStep: 6 }).ok, false);
  });

  it("rejects non-integer step", () => {
    assert.equal(runTool({ ...baseValues, sequenceStep: 2.5 }).ok, false);
  });

  it("rejects missing sequenceStep", () => {
    const { sequenceStep: _omit, ...rest } = baseValues;
    assert.equal(runTool(rest).ok, false);
  });

  it("rejects missing originalSubject", () => {
    assert.equal(runTool({ ...baseValues, originalSubject: undefined }).ok, false);
  });

  it("rejects whitespace-only originalSubject", () => {
    assert.equal(runTool({ ...baseValues, originalSubject: "  " }).ok, false);
  });

  it("rejects missing goal", () => {
    assert.equal(runTool({ ...baseValues, goal: "" }).ok, false);
  });

  it("rejects invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "shy" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("tone"));
  });

  it("generateFollowUp throws on bad step", () => {
    assert.throws(() => generateFollowUp(9, "s", "g", "friendly"), RangeError);
  });

  it("overlong goal trimmed with a visible notice in the draft", () => {
    const long = "c".repeat(MAX_INPUT_CHARS + 30);
    const r = runTool({ ...baseValues, goal: long });
    assert.equal(r.ok, true);
    const draft = r.values?.bodyDraft as string;
    assert.ok(draft.includes("trimmed to 200 characters"));
  });

  it("CJK/emoji-safe inputs", () => {
    const r = runTool({ ...baseValues, originalSubject: "合作邀请 🤝", goal: "约个电话 📞" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.bodyDraft as string).includes("约个电话"));
  });

  it("deterministic: same input twice gives identical output", () => {
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), outputs.map((o) => o.id).sort());
  });
});
