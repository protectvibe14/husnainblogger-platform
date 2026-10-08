import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  rankNiches,
  scoreProfile,
  QUESTIONS,
  NICHE_BANK,
  ANGLE_BANK,
  VALIDATION_STEPS,
  WEIGHT_INTEREST,
  WEIGHT_MATCH,
} from "./logic.ts";

const FIT = {
  q1: "Fitness and healthy living",
  q2: "I'm a professional or expert",
  q3: "People like me",
  q4: "Talking to camera",
  q5: "Growing a large following",
};

describe("niche-clarity-quiz", () => {
  it("happy path: returns top 3 niches, score, and steps", () => {
    const res = runTool(FIT);
    assert.equal(res.ok, true);
    const niches = res.values!.topNiches as string[];
    assert.equal(niches.length, 3);
    const steps = res.values!.validationSteps as string[];
    assert.equal(steps.length, 5);
    assert.equal(typeof res.values!.clarityScore, "number");
  });

  it("output ids match meta.ts outputs", () => {
    const res = runTool(FIT);
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "clarityScore",
      "topNiches",
      "validationSteps",
    ]);
  });

  it("top niche matches the chosen interest", () => {
    const res = runTool({
      q1: "Food and cooking",
      q2: "I'm learning and sharing the journey",
      q3: "Total beginners",
      q4: "Filming my everyday life",
      q5: "Growing a large following",
    });
    assert.equal(res.ok, true);
    const niches = res.values!.topNiches as string[];
    assert.ok(
      niches[0].includes("15-minute weeknight recipes"),
      `unexpected top niche: ${niches[0]}`,
    );
  });

  it("clarityScore equals the top profile's score", () => {
    const res = runTool(FIT);
    assert.equal(res.ok, true);
    assert.equal(res.values!.clarityScore, 70);
    const niches = res.values!.topNiches as string[];
    assert.ok(niches[0].includes("Beginner-friendly home workouts"));
  });

  it("score math: perfect profile scores 100", () => {
    // "15-minute weeknight recipes": interest 3, exp [1,2], aud [1,2], fmt [1,3], goal 0
    const profile = NICHE_BANK.find((p) => p.name === "15-minute weeknight recipes")!;
    assert.equal(scoreProfile(profile, [3, 1, 2, 1, 0]), 100);
  });

  it("score math: interest-only match scores 40", () => {
    const profile = NICHE_BANK.find((p) => p.name === "15-minute weeknight recipes")!;
    assert.equal(scoreProfile(profile, [3, 0, 0, 0, 3]), WEIGHT_INTEREST);
  });

  it("score math: nothing matching scores 0", () => {
    const profile = NICHE_BANK.find((p) => p.name === "15-minute weeknight recipes")!;
    assert.equal(scoreProfile(profile, [0, 0, 0, 0, 3]), 0);
  });

  it("score never exceeds 100 for any profile/answer combo", () => {
    for (const profile of NICHE_BANK) {
      for (const a of [0, 1, 2, 3, 4, 5, 6, 7]) {
        for (const b of [0, 1, 2]) {
          for (const c of [0, 1, 2, 3]) {
            for (const d of [0, 1, 2, 3]) {
              for (const e of [0, 1, 2, 3]) {
                const s = scoreProfile(profile, [a, b, c, d, e]);
                assert.ok(s >= 0 && s <= 100, `score ${s} out of range`);
              }
            }
          }
        }
      }
    }
  });

  it("ranking is sorted high to low", () => {
    const ranked = rankNiches([3, 1, 1, 3, 0]);
    for (let i = 1; i < ranked.length; i++) {
      assert.ok(ranked[i - 1].score >= ranked[i].score);
    }
  });

  it("tie-break is deterministic (stable order)", () => {
    const a = rankNiches([3, 1, 1, 3, 0]).map((r) => r.profile.name);
    const b = rankNiches([3, 1, 1, 3, 0]).map((r) => r.profile.name);
    assert.deepEqual(a, b);
  });

  it("mixed signals lower the clarity score", () => {
    // Interest points at fitness, everything else points elsewhere.
    const res = runTool({
      q1: "Fitness and healthy living",
      q2: "I'm a curious beginner",
      q3: "Ambitious people chasing bigger goals",
      q4: "Designed slides or text posts",
      q5: "Loving the process itself",
    });
    assert.equal(res.ok, true);
    assert.ok((res.values!.clarityScore as number) < 70);
  });

  it("errors when a question is missing", () => {
    const res = runTool({ q1: FIT.q1 });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /before getting your result/);
  });

  it("errors when all questions are missing", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(String(res.error), /Please answer/);
  });

  it("errors on an unknown choice value", () => {
    const res = runTool({ ...FIT, q2: "I'm basically a guru" });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /not a valid answer/);
  });

  it("errors on non-string answers", () => {
    const res = runTool({ ...FIT, q5: 3 });
    assert.equal(res.ok, false);
    assert.equal(typeof res.error, "string");
  });

  it("determinism: same answers twice give identical output", () => {
    assert.deepEqual(runTool(FIT), runTool(FIT));
  });

  it("angle text follows the q2 experience choice", () => {
    const res = runTool({ ...FIT, q2: "I'm learning and sharing the journey" });
    assert.equal(res.ok, true);
    const niches = res.values!.topNiches as string[];
    assert.ok(niches[0].includes("document the journey as you learn"));
  });

  it("word-bank bounds: 16 profiles, 2 per interest", () => {
    assert.equal(NICHE_BANK.length, 16);
    for (let i = 0; i < 8; i++) {
      assert.equal(NICHE_BANK.filter((p) => p.interest === i).length, 2, `interest ${i}`);
    }
    for (const p of NICHE_BANK) {
      assert.ok(p.name.length > 0);
      assert.ok(p.experience.length > 0 && p.audience.length > 0 && p.format.length > 0);
    }
  });

  it("word-bank bounds: 5 questions, 23 choices, 5 validation steps, 3 angles", () => {
    assert.equal(QUESTIONS.length, 5);
    const total = QUESTIONS.reduce((s, q) => s + q.choices.length, 0);
    assert.equal(total, 23);
    assert.equal(VALIDATION_STEPS.length, 5);
    assert.equal(ANGLE_BANK.length, 3);
  });

  it("weights: 40 + 4x15 = 100 max", () => {
    assert.equal(WEIGHT_INTEREST + WEIGHT_MATCH * 4, 100);
  });

  it("validation steps are all non-empty strings", () => {
    for (const step of VALIDATION_STEPS) assert.ok(step.length > 0);
  });
});
