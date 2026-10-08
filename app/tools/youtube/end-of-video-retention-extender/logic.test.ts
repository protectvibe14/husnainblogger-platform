import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PATTERNS,
  NEXT_TOPIC_FALLBACK,
  RUNWAY_RULE,
  TOPIC_MAX_CHARS,
  runTool,
} from "./logic.ts";

const META_OUTPUT_IDS = ["scriptBeats", "timingNote", "runwayRule"];

describe("end-of-video-retention-extender — patterns", () => {
  it("has 4 patterns x 5 beats = 20 beats", () => {
    assert.equal(PATTERNS.length, 4);
    for (const p of PATTERNS) assert.equal(p.beats.length, 5, `pattern ${p.id}`);
  });
  it("pattern ids are the four documented patterns", () => {
    assert.deepEqual(PATTERNS.map((p) => p.id), [
      "loop-back",
      "next-video-bridge",
      "open-loop",
      "end-screen-runway",
    ]);
  });
  it("every beat carries a timing label in parentheses", () => {
    for (const p of PATTERNS) {
      for (const b of p.beats) {
        assert.ok(/\(\d+s\)/.test(b), `${p.id}: "${b.slice(0, 40)}"`);
      }
    }
  });
  it("every pattern has a timing note mentioning the 5-20s clear window", () => {
    for (const p of PATTERNS) {
      assert.ok(p.timingNote.includes("5–20 seconds"), `${p.id}`);
    }
  });
  it("no beat makes numeric retention claims", () => {
    const all = PATTERNS.flatMap((p) => p.beats).join(" ");
    assert.ok(!/%/.test(all), "no percentages");
    assert.ok(!/retention by \d/i.test(all), "no retention-by-N claims");
  });
  it("runway rule describes the 5-20s clear window", () => {
    assert.ok(RUNWAY_RULE.includes("5–20 seconds"));
    assert.ok(RUNWAY_RULE.toLowerCase().includes("end-screen"));
  });
});

describe("end-of-video-retention-extender — runTool happy path", () => {
  it("returns 5 beats, timing note, and runway rule", () => {
    const r = runTool({
      videoTopic: "sourdough starter",
      nextVideoTopic: "no-knead bread recipe",
      pattern: "next-video-bridge",
    });
    assert.equal(r.ok, true);
    const beats = r.values!["scriptBeats"] as string[];
    assert.equal(beats.length, 5);
    assert.ok(beats[0].startsWith("Beat 1 —"));
    assert.ok(beats.join(" ").includes("sourdough starter"), "topic inserted");
    assert.ok(beats.join(" ").includes("no-knead bread recipe"), "next topic inserted");
    assert.ok(!(beats.join(" ")).includes("{topic}"), "no leftover placeholders");
    assert.ok((r.values!["timingNote"] as string).length > 0);
    assert.equal(r.values!["runwayRule"], RUNWAY_RULE);
  });
  it("works without the optional next video topic (fallback used)", () => {
    const r = runTool({ videoTopic: "meal prep", pattern: "open-loop" });
    assert.equal(r.ok, true);
    assert.ok((r.values!["scriptBeats"] as string[]).join(" ").includes(NEXT_TOPIC_FALLBACK));
  });
  it("blank next video topic also falls back", () => {
    const r = runTool({ videoTopic: "meal prep", nextVideoTopic: "   ", pattern: "end-screen-runway" });
    assert.equal(r.ok, true);
    assert.ok((r.values!["scriptBeats"] as string[]).join(" ").includes(NEXT_TOPIC_FALLBACK));
  });
  it("each pattern produces distinct beats", () => {
    const outs = PATTERNS.map((p) =>
      (runTool({ videoTopic: "t", pattern: p.id }).values!["scriptBeats"] as string[]).join("|"),
    );
    assert.equal(new Set(outs).size, 4, "all four patterns differ");
  });
});

describe("end-of-video-retention-extender — validation errors", () => {
  it("rejects missing values object", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error!.length > 0);
  });
  it("rejects blank video topic", () => {
    const r = runTool({ videoTopic: "  ", pattern: "loop-back" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("video topic"));
  });
  it("rejects topic over 200 chars", () => {
    const r = runTool({ videoTopic: "x".repeat(TOPIC_MAX_CHARS + 1), pattern: "loop-back" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("200"));
  });
  it("rejects unknown pattern", () => {
    const r = runTool({ videoTopic: "x", pattern: "cliffhanger-max" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Ending pattern"));
  });
  it("rejects missing pattern", () => {
    const r = runTool({ videoTopic: "x" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Ending pattern"));
  });
  it("rejects non-string topic", () => {
    const r = runTool({ videoTopic: 42, pattern: "open-loop" });
    assert.equal(r.ok, false);
  });
});

describe("end-of-video-retention-extender — determinism & contract", () => {
  it("run twice -> identical", () => {
    const args = { videoTopic: "budget travel", nextVideoTopic: "packing list", pattern: "end-screen-runway" };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ videoTopic: "x", pattern: "loop-back" });
    assert.deepEqual(Object.keys(r.values!).sort(), [...META_OUTPUT_IDS].sort());
  });
  it("error results carry no values", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });
});
