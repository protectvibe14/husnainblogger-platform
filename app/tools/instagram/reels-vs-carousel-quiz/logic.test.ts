import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  scoreQuiz,
  QUESTIONS,
  MAX_SCORE,
  LEAD_THRESHOLD_PCT,
  REASON_LINES,
  NEXT_STEPS,
} from "./logic.ts";

const ALL_REELS = {
  q1: "Grow new followers fast",
  q2: "I film myself happily",
  q3: "Under 15 minutes",
  q4: "Talking-head or voiceover videos",
  q5: "5 or more times",
};

const ALL_CAROUSEL = {
  q1: "Get more saves and shares",
  q2: "I prefer staying behind the camera",
  q3: "Over an hour",
  q4: "Designed slides or graphics",
  q5: "1 to 2 times",
};

const MIXED = {
  q1: "Build deeper trust with my audience",
  q2: "Only for short, casual clips",
  q3: "15 to 30 minutes",
  q4: "A mix of both",
  q5: "3 to 4 times",
};

describe("reels-vs-carousel-quiz", () => {
  it("happy path: all-Reels answers recommend Reels", () => {
    const res = runTool(ALL_REELS);
    assert.equal(res.ok, true);
    assert.match(String(res.values!.recommendation), /^Reels \(/);
    assert.equal((res.values!.reasoning as string[]).length, 3);
    assert.equal((res.values!.nextSteps as string[]).length, 5);
  });

  it("happy path: all-carousel answers recommend carousels", () => {
    const res = runTool(ALL_CAROUSEL);
    assert.equal(res.ok, true);
    assert.match(String(res.values!.recommendation), /^Carousels \(/);
  });

  it("happy path: balanced answers recommend both formats", () => {
    const res = runTool(MIXED);
    assert.equal(res.ok, true);
    assert.match(String(res.values!.recommendation), /^Both formats \(/);
  });

  it("output ids match meta.ts outputs", () => {
    const res = runTool(ALL_REELS);
    assert.deepEqual(Object.keys(res.values!).sort(), ["nextSteps", "reasoning", "recommendation"]);
  });

  it("errors when a question is missing", () => {
    const res = runTool({ q1: ALL_REELS.q1 });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /before getting your result/);
  });

  it("errors when every question is missing", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(String(res.error), /Please answer/);
  });

  it("errors on an unknown choice value", () => {
    const res = runTool({ ...ALL_REELS, q3: "Whenever I feel like it" });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /not a valid answer/);
  });

  it("errors on a non-string answer", () => {
    const res = runTool({ ...ALL_REELS, q2: 42 });
    assert.equal(res.ok, false);
    assert.equal(typeof res.error, "string");
  });

  it("errors on a blank answer string", () => {
    const res = runTool({ ...ALL_REELS, q4: "   " });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /before getting your result/);
  });

  it("accepts answers with surrounding whitespace", () => {
    const res = runTool({ ...ALL_REELS, q1: "  Grow new followers fast  " });
    assert.equal(res.ok, true);
  });

  it("determinism: same answers twice give identical output", () => {
    const a = runTool(MIXED);
    const b = runTool(MIXED);
    assert.deepEqual(a, b);
  });

  it("determinism: scoreQuiz is stable across calls", () => {
    const picked = QUESTIONS.map((q) => q.choices[0]);
    assert.deepEqual(scoreQuiz(picked), scoreQuiz(picked));
  });

  it("score math: max reels answers give 100% reels", () => {
    const picked = QUESTIONS.map((q) =>
      q.choices.reduce((best, c) => (c.reels > best.reels ? c : best), q.choices[0]),
    );
    const result = scoreQuiz(picked);
    assert.equal(result.reelsScore, 100);
    assert.equal(result.recommendation, "reels");
  });

  it("score math: max carousel answers give 100% carousels", () => {
    const picked = QUESTIONS.map((q) =>
      q.choices.reduce((best, c) => (c.carousel > best.carousel ? c : best), q.choices[0]),
    );
    const result = scoreQuiz(picked);
    assert.equal(result.recommendation, "carousel");
    assert.equal(result.carouselScore, 100);
  });

  it("lead threshold: near-tie answers fall back to both", () => {
    // Hand-computed exact tie: reels = carousel = 8 -> both.
    const tied = {
      q1: "Grow new followers fast", // 3/0
      q2: "I prefer staying behind the camera", // 0/3
      q3: "Under 15 minutes", // 2/1
      q4: "A mix of both", // 2/2
      q5: "1 to 2 times", // 1/2
    };
    const result = scoreQuiz(
      QUESTIONS.map((q) => q.choices.find((c) => c.label === (tied as Record<string, string>)[q.id])!),
    );
    assert.equal(result.reelsScore, result.carouselScore);
    assert.equal(result.recommendation, "both");
  });

  it("threshold constant is positive and sane", () => {
    assert.ok(LEAD_THRESHOLD_PCT > 0 && LEAD_THRESHOLD_PCT < 100);
  });

  it("word-bank bounds: every question has >= 2 choices", () => {
    assert.equal(QUESTIONS.length, 5);
    for (const q of QUESTIONS) {
      assert.ok(q.choices.length >= 2, q.id);
      for (const c of q.choices) {
        assert.ok(c.label.length > 0, q.id);
        assert.ok(c.reels >= 0 && c.carousel >= 0, q.id);
      }
    }
  });

  it("word-bank bounds: MAX_SCORE covers each side's maximum", () => {
    const maxReels = QUESTIONS.reduce(
      (s, q) => s + Math.max(...q.choices.map((c) => c.reels)),
      0,
    );
    const maxCarousel = QUESTIONS.reduce(
      (s, q) => s + Math.max(...q.choices.map((c) => c.carousel)),
      0,
    );
    assert.equal(maxReels, MAX_SCORE);
    assert.equal(maxCarousel, MAX_SCORE);
  });

  it("reason lines exist for every question and both sides", () => {
    for (const q of QUESTIONS) {
      assert.ok(REASON_LINES[q.id], q.id);
      assert.ok(REASON_LINES[q.id].reels.length > 0);
      assert.ok(REASON_LINES[q.id].carousel.length > 0);
    }
  });

  it("next steps: 3 banks x 5 non-empty steps", () => {
    assert.deepEqual(Object.keys(NEXT_STEPS).sort(), ["both", "carousel", "reels"]);
    for (const key of ["reels", "carousel", "both"] as const) {
      assert.equal(NEXT_STEPS[key].length, 5, key);
      for (const step of NEXT_STEPS[key]) assert.ok(step.length > 0, key);
    }
  });

  it("reasoning uses the recommendation's own lines", () => {
    const res = runTool(ALL_REELS);
    const lines = res.values!.reasoning as string[];
    const allLines = QUESTIONS.flatMap((q) => [REASON_LINES[q.id].reels, REASON_LINES[q.id].carousel]);
    assert.ok(lines.every((l) => allLines.includes(l)));
  });
});
