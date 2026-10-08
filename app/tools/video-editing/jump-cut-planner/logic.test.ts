import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const SEGS = [
  { text: "hello everyone", startMs: 0, endMs: 900 },
  { text: "um uh", startMs: 1000, endMs: 1600 },
  { text: "today we cook rice", startMs: 1800, endMs: 3200 },
  { text: "so yeah", startMs: 6000, endMs: 6800 },
  { text: "final words here", startMs: 7000, endMs: 8000 },
];

describe("jump-cut-planner", () => {
  it("happy path: light cuts filler + long pauses; outputs all keys", () => {
    const r = runTool({ transcriptWithTimestamps: SEGS, aggressiveness: "light" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const cuts = v.cutSegments as { startMs: number; endMs: number; reason: string }[];
    assert.ok(cuts.length >= 2, `got ${cuts.length} cuts`);
    assert.ok(cuts.some((c) => c.reason.includes("filler words")));
    assert.ok(cuts.some((c) => c.reason.includes("pause")));
    assert.equal(typeof v.newDurationSec, "number");
    assert.equal(v.cutCount, cuts.length);
    assert.ok(Array.isArray(v.keepSegments));
    assert.ok(Array.isArray(v.warnings));
  });

  it("pause cut keeps a keep-margin (light: 200ms each side)", () => {
    const r = runTool({ transcriptWithTimestamps: SEGS, aggressiveness: "light" });
    const cuts = (r.values as Record<string, unknown>).cutSegments as { startMs: number; endMs: number; reason: string }[];
    const pause = cuts.find((c) => c.reason.includes("pause"));
    assert.ok(pause);
    // gap 3200 -> 6000 = 2800ms; keep 200ms each side
    assert.equal(pause.startMs, 3200 + 200);
    assert.equal(pause.endMs, 6000 - 200);
  });

  it("medium is more aggressive: 'so yeah' is filler at medium but not light", () => {
    const light = runTool({ transcriptWithTimestamps: SEGS, aggressiveness: "light" });
    const medium = runTool({ transcriptWithTimestamps: SEGS, aggressiveness: "medium" });
    const lCuts = (light.values as Record<string, unknown>).cutSegments as { reason: string; startMs: number }[];
    const mCuts = (medium.values as Record<string, unknown>).cutSegments as { reason: string; startMs: number }[];
    assert.ok(!lCuts.some((c) => c.reason.includes("filler") && c.startMs === 6000));
    assert.ok(mCuts.some((c) => c.reason.includes("filler") && c.startMs === 6000));
  });

  it("tight cuts repeated words", () => {
    const r = runTool({
      transcriptWithTimestamps: [{ text: "this this is the point", startMs: 0, endMs: 900 }],
      aggressiveness: "tight",
    });
    assert.equal(r.ok, true);
    const cuts = (r.values as Record<string, unknown>).cutSegments as { reason: string }[];
    assert.ok(cuts.some((c) => c.reason.includes("repeated word")));
  });

  it("light does not cut repeated words", () => {
    const r = runTool({
      transcriptWithTimestamps: [{ text: "this this is the point", startMs: 0, endMs: 900 }],
      aggressiveness: "light",
    });
    assert.equal((r.values as Record<string, unknown>).cutCount, 0);
  });

  it("partial filler text is NOT cut (only whole filler segments)", () => {
    const r = runTool({
      transcriptWithTimestamps: [{ text: "um so this is the plan", startMs: 0, endMs: 1200 }],
      aggressiveness: "light",
    });
    assert.equal((r.values as Record<string, unknown>).cutCount, 0);
  });

  it("newDurationSec math: total minus cuts", () => {
    const r = runTool({
      transcriptWithTimestamps: [
        { text: "hello", startMs: 0, endMs: 1000 },
        { text: "um", startMs: 1100, endMs: 1500 },
      ],
      aggressiveness: "light",
    });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).newDurationSec, 1.1);
  });

  it("keepSegments cover exactly the non-cut timeline", () => {
    const r = runTool({
      transcriptWithTimestamps: [
        { text: "hello", startMs: 0, endMs: 1000 },
        { text: "um", startMs: 1100, endMs: 1500 },
        { text: "bye", startMs: 1600, endMs: 2200 },
      ],
      aggressiveness: "light",
    });
    const v = r.values as Record<string, unknown>;
    const keep = v.keepSegments as { startMs: number; endMs: number }[];
    const keepMs = keep.reduce((s, k) => s + (k.endMs - k.startMs), 0);
    assert.equal(keepMs, (v.newDurationSec as number) * 1000);
  });

  it(">60% cut warns", () => {
    const r = runTool({
      transcriptWithTimestamps: [
        { text: "um uh", startMs: 0, endMs: 7000 },
        { text: "hi", startMs: 7100, endMs: 7600 },
      ],
      aggressiveness: "light",
    });
    assert.equal(r.ok, true);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("60%")));
  });

  it("accepts transcript as JSON string", () => {
    const r = runTool({ transcriptWithTimestamps: JSON.stringify(SEGS), aggressiveness: "medium" });
    assert.equal(r.ok, true);
  });

  it("rejects invalid JSON", () => {
    const r = runTool({ transcriptWithTimestamps: "nope", aggressiveness: "medium" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /JSON/i);
  });

  it("rejects empty transcript", () => {
    const r = runTool({ transcriptWithTimestamps: [], aggressiveness: "medium" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least 1/i);
  });

  it("rejects bad aggressiveness", () => {
    const r = runTool({ transcriptWithTimestamps: SEGS, aggressiveness: "extreme" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /light.*medium.*tight/);
  });

  it("rejects non-ascending segments", () => {
    const r = runTool({
      transcriptWithTimestamps: [
        { text: "second", startMs: 2000, endMs: 3000 },
        { text: "first", startMs: 0, endMs: 900 },
      ],
      aggressiveness: "light",
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /ascending/i);
  });

  it("rejects segment with endMs <= startMs", () => {
    const r = runTool({
      transcriptWithTimestamps: [{ text: "hi", startMs: 1000, endMs: 500 }],
      aggressiveness: "light",
    });
    assert.equal(r.ok, false);
  });

  it("rejects segment with empty text", () => {
    const r = runTool({
      transcriptWithTimestamps: [{ text: "   ", startMs: 0, endMs: 500 }],
      aggressiveness: "light",
    });
    assert.equal(r.ok, false);
  });

  it("short pauses are kept (no cut under threshold)", () => {
    const r = runTool({
      transcriptWithTimestamps: [
        { text: "hello", startMs: 0, endMs: 1000 },
        { text: "bye", startMs: 1400, endMs: 2000 },
      ],
      aggressiveness: "light",
    });
    assert.equal((r.values as Record<string, unknown>).cutCount, 0);
    assert.equal((r.values as Record<string, unknown>).newDurationSec, 2.0);
  });

  it("determinism: two runs identical", () => {
    const opts = { transcriptWithTimestamps: SEGS, aggressiveness: "medium" };
    assert.equal(JSON.stringify(runTool(opts)), JSON.stringify(runTool(opts)));
  });
});
