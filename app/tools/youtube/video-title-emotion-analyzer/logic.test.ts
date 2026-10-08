import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

function okResult(title: string) {
  const r = runTool({ videoTitle: title });
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values!;
}

describe("video-title-emotion-analyzer — happy path", () => {
  it("returns emotionProfile, dominantEmotion, suggestions, note", () => {
    const v = okResult("Why I quit my job");
    assert.ok(Array.isArray(v.emotionProfile));
    assert.equal(typeof v.dominantEmotion, "string");
    assert.ok(Array.isArray(v.suggestions));
    assert.equal(typeof v.note, "string");
  });

  it("detects curiosity words", () => {
    const v = okResult("The secret truth behind my success");
    assert.equal(v.dominantEmotion, "curiosity");
    const profile = (v.emotionProfile as string[]).join(" ");
    assert.ok(profile.includes("curiosity: 3"));
  });

  it("detects power words", () => {
    const v = okResult("The ultimate guide to epic wins");
    assert.equal(v.dominantEmotion, "power");
  });

  it("detects urgency words", () => {
    const v = okResult("Do this now before the deadline expires");
    assert.equal(v.dominantEmotion, "urgency");
  });

  it("detects fear words", () => {
    const v = okResult("5 mistakes that will make you fail");
    assert.equal(v.dominantEmotion, "fear");
  });

  it("detects joy words", () => {
    const v = okResult("An amazing and beautiful celebration");
    assert.equal(v.dominantEmotion, "joy");
  });

  it("detects trust words", () => {
    const v = okResult("Honest review: tested with real data");
    assert.equal(v.dominantEmotion, "trust");
  });

  it("matching is case-insensitive", () => {
    const v = okResult("The ULTIMATE SECRET");
    const profile = (v.emotionProfile as string[]).join(" ");
    assert.ok(profile.includes("curiosity: 1"));
    assert.ok(profile.includes("power: 1"));
  });

  it("matches multi-word entries", () => {
    const v = okResult("Don't miss this last chance today");
    assert.equal(v.dominantEmotion, "urgency");
    const profile = (v.emotionProfile as string[]).join(" ");
    assert.ok(profile.includes("last chance"));
  });

  it("counts 'beginner-friendly' once, not also as 'beginner'", () => {
    const v = okResult("A beginner-friendly tutorial");
    const line = (v.emotionProfile as string[]).find((l) => l.startsWith("trust:"))!;
    assert.ok(line.includes("trust: 2")); // beginner-friendly + tutorial
    assert.ok(!line.split("(")[1].includes("beginner,"));
  });

  it("breaks ties toward the earlier category (curiosity before power)", () => {
    const v = okResult("Secret best method"); // 1 curiosity + 1 power
    assert.equal(v.dominantEmotion, "curiosity");
  });

  it("profile lists all six emotions even with zero hits", () => {
    const v = okResult("My weekly vlog number twelve");
    assert.equal((v.emotionProfile as string[]).length, 6);
    assert.ok((v.emotionProfile as string[]).every((l) => l.includes(": 0")));
  });

  it("is deterministic — same title gives identical output", () => {
    const a = okResult("Why I quit my job");
    const b = okResult("Why I quit my job");
    assert.deepEqual(a, b);
  });
});

describe("video-title-emotion-analyzer — edge cases", () => {
  it("neutral verdict with suggestions for a title with no emotion words", () => {
    const v = okResult("My weekly vlog number twelve");
    assert.equal(v.dominantEmotion, "neutral");
    assert.ok((v.suggestions as string[]).length > 0);
  });

  it("suggestions come from the fixed word bank", () => {
    const v = okResult("My weekly vlog number twelve");
    const joined = (v.suggestions as string[]).join(" ");
    assert.ok(joined.includes("secret")); // first curiosity word
    assert.ok(joined.includes("best")); // first power word
  });

  it("weak profile (1 hit) still gets suggestions", () => {
    const v = okResult("A quick update"); // urgency: 1
    assert.ok((v.suggestions as string[]).length > 0);
    assert.ok(!(v.suggestions as string[]).join(" ").includes("urgency:"));
  });

  it("strong profile (2+ hits) gets no suggestions", () => {
    const v = okResult("The secret truth revealed"); // curiosity: 3
    assert.deepEqual(v.suggestions, []);
  });

  it("honesty note says it is not AI and not predictive", () => {
    const v = okResult("Why I quit my job");
    assert.ok((v.note as string).includes("not AI"));
  });
});

describe("video-title-emotion-analyzer — validation errors", () => {
  it("rejects a missing title", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a blank title", () => {
    const r = runTool({ videoTitle: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a non-string title", () => {
    const r = runTool({ videoTitle: 123 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a title over 200 characters", () => {
    const r = runTool({ videoTitle: "x".repeat(201) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });
});
