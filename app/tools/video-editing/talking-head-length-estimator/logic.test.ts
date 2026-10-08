import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const script140 = Array(140).fill("word").join(" ");

describe("talking-head-length-estimator (tool-275)", () => {
  it("happy path: 140 words at 140 wpm + 10% pause -> 66s, range 53-80s", () => {
    const r = runTool({ scriptText: script140, wpm: 140, pauseAllowancePct: 10 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    // base = 140/140*60 = 60; est = ceil(60*1.1) = 66; low = ceil(52.8) = 53; high = ceil(79.2) = 80
    assert.equal(v.estimatedSec, 66);
    assert.equal(v.wordCount, 140);
    assert.equal(v.rangeLowSec, 53);
    assert.equal(v.rangeHighSec, 80);
    assert.equal(v.estimateBasis, "words");
    assert.ok(String(v.note).includes("Estimate"), String(v.note));
    assert.ok(!r.error);
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool({ scriptText: script140 });
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "estimateBasis",
      "estimatedSec",
      "note",
      "rangeHighSec",
      "rangeLowSec",
      "wordCount",
    ]);
  });

  it("defaults: wpm 140 and pause 10% when omitted", () => {
    const a = runTool({ scriptText: script140 });
    const b = runTool({ scriptText: script140, wpm: 140, pauseAllowancePct: 10 });
    assert.deepEqual(a.values, b.values);
  });

  it("wpm changes the estimate predictably: faster speech = shorter video", () => {
    const slow = runTool({ scriptText: script140, wpm: 100, pauseAllowancePct: 0 });
    const fast = runTool({ scriptText: script140, wpm: 200, pauseAllowancePct: 0 });
    // 100 wpm: 84s; 200 wpm: 42s
    assert.equal((slow.values as Record<string, unknown>).estimatedSec, 84);
    assert.equal((fast.values as Record<string, unknown>).estimatedSec, 42);
  });

  it("pause allowance 0% gives the raw speech time rounded up", () => {
    const r = runTool({ scriptText: script140, wpm: 140, pauseAllowancePct: 0 });
    assert.equal((r.values as Record<string, unknown>).estimatedSec, 60);
  });

  it("very short script rounds up to whole seconds", () => {
    const r = runTool({ scriptText: "hello world", wpm: 140, pauseAllowancePct: 10 });
    const v = r.values as Record<string, unknown>;
    // ceil(2/140*60*1.1) = ceil(0.94) = 1
    assert.equal(v.estimatedSec, 1);
    assert.ok(Number.isInteger(v.estimatedSec as number));
  });

  it("edge case: CJK script -> char-based estimate with a note", () => {
    const cjk = "你好世界这是一个测试脚本用来估算时长".repeat(20); // 18 chars x 20 = 360 CJK chars
    const r = runTool({ scriptText: cjk, wpm: 140, pauseAllowancePct: 10 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.wordCount, 360);
    assert.equal(v.estimateBasis, "CJK characters");
    // base = 360/300*60 = 72; est = ceil(79.2) = 80
    assert.equal(v.estimatedSec, 80);
    assert.ok(String(v.note).includes("CJK script detected"), String(v.note));
    assert.ok(String(v.note).includes("300 chars/min (estimate)"));
  });

  it("range is always ±20% of the estimate (never a single exact number)", () => {
    const r = runTool({ scriptText: script140, wpm: 140, pauseAllowancePct: 10 });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.rangeLowSec, Math.ceil((v.estimatedSec as number) * 0.8));
    assert.equal(v.rangeHighSec, Math.ceil((v.estimatedSec as number) * 1.2));
    assert.ok((v.rangeLowSec as number) < (v.estimatedSec as number));
    assert.ok((v.rangeHighSec as number) > (v.estimatedSec as number));
  });

  it("note tells the user to plan around the range, not the point estimate", () => {
    const r = runTool({ scriptText: script140 });
    assert.ok(String((r.values as Record<string, unknown>).note).includes("plan around the"));
  });

  it("500 words at 140 wpm -> about 4.7 min", () => {
    const r = runTool({ scriptText: Array(500).fill("word").join(" "), wpm: 140, pauseAllowancePct: 10 });
    const v = r.values as Record<string, unknown>;
    // base = 500/140*60 = 214.2857; est = ceil(235.714) = 236; range 189s (3m 9s) - 284s (4m 44s)
    assert.equal(v.estimatedSec, 236);
    assert.ok(String(v.note).includes("3m 9s-4m 44s"), String(v.note));
  });

  it("validation: empty script -> error", () => {
    const r = runTool({ scriptText: "   ", wpm: 140 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: missing script -> error", () => {
    assert.equal(runTool({ wpm: 140 }).ok, false);
  });

  it("validation: wpm below 60 or above 250 -> error", () => {
    for (const w of [59, 251]) {
      const r = runTool({ scriptText: script140, wpm: w });
      assert.equal(r.ok, false, `wpm=${w}`);
      assert.ok(String(r.error).includes("60") && String(r.error).includes("250"));
    }
  });

  it("validation: wpm boundaries 60 and 250 are accepted", () => {
    assert.equal(runTool({ scriptText: script140, wpm: 60 }).ok, true);
    assert.equal(runTool({ scriptText: script140, wpm: 250 }).ok, true);
  });

  it("validation: pause allowance above 50 -> error; 50 accepted", () => {
    assert.equal(runTool({ scriptText: script140, pauseAllowancePct: 51 }).ok, false);
    assert.equal(runTool({ scriptText: script140, pauseAllowancePct: 50 }).ok, true);
  });

  it("validation: non-numeric wpm -> error", () => {
    const r = runTool({ scriptText: script140, wpm: "fast" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-numeric pause allowance -> error", () => {
    const r = runTool({ scriptText: script140, pauseAllowancePct: "some" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("accepts numeric strings for wpm and pause", () => {
    const r = runTool({ scriptText: script140, wpm: "140", pauseAllowancePct: "10" });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).estimatedSec, 66);
  });

  it("determinism: same inputs twice -> identical output", () => {
    assert.deepEqual(runTool({ scriptText: script140 }), runTool({ scriptText: script140 }));
  });

  it("multiline scripts count words across line breaks", () => {
    const r = runTool({ scriptText: "one two\nthree   four\n\nfive", wpm: 60, pauseAllowancePct: 0 });
    assert.equal((r.values as Record<string, unknown>).wordCount, 5);
    assert.equal((r.values as Record<string, unknown>).estimatedSec, 5); // 5/60*60 = 5
  });
});
