import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i + 1}`).join(" ");
}

const base = { scriptText: words(140), wordsPerMinute: 140, fontSize: 32, mirrorMode: false };

describe("teleprompter (tool-252)", () => {
  it("happy path: 140 words at 140 wpm = 60s read, 63s scroll", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.wordCount, 140);
    assert.equal(v.estimatedReadTimeSec, 60);
    assert.equal(v.scrollDurationSec, 63);
    assert.ok(String(v.scrollPlan).includes("px/sec"));
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "estimatedReadTimeSec",
      "scrollDurationSec",
      "scrollPlan",
      "wordCount",
    ]);
  });

  it("wordsPerMinute defaults to 140 when omitted", () => {
    const r = runTool({ scriptText: words(70), fontSize: 32 });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).estimatedReadTimeSec, 30);
  });

  it("wpm below 40 is clamped to 40 with a warning note", () => {
    const r = runTool({ ...base, wordsPerMinute: 20 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.estimatedReadTimeSec, 210);
    assert.ok(String(v.scrollPlan).includes("clamped to 40"));
  });

  it("wpm above 300 is clamped to 300 with a warning note", () => {
    const r = runTool({ ...base, wordsPerMinute: 500 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.estimatedReadTimeSec, 28);
    assert.ok(String(v.scrollPlan).includes("clamped to 300"));
  });

  it("validation: non-numeric wpm errors", () => {
    const r = runTool({ ...base, wordsPerMinute: "fast" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).toLowerCase().includes("words per minute"));
  });

  it("validation: empty script errors", () => {
    const r = runTool({ ...base, scriptText: "   " });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).toLowerCase().includes("script"));
  });

  it("validation: script over 20000 chars errors", () => {
    const r = runTool({ ...base, scriptText: "a".repeat(20001) });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("20000"));
  });

  it("validation: font size outside 12-120 px errors", () => {
    for (const fontSize of [8, 200, "big"]) {
      const r = runTool({ ...base, fontSize });
      assert.equal(r.ok, false, String(fontSize));
    }
  });

  it("CJK text uses chars-per-minute mode with a note", () => {
    const cjk = "这是一个中文测试脚本用于提词器速度计算功能验证";
    const r = runTool({ scriptText: cjk, wordsPerMinute: 140, fontSize: 32 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.wordCount, cjk.length);
    assert.ok(String(v.scrollPlan).includes("CJK"));
  });

  it("mirror mode adds a mirror note to the scroll plan", () => {
    const r = runTool({ ...base, mirrorMode: true });
    assert.ok(String((r.values as Record<string, unknown>).scrollPlan).includes("Mirror mode ON"));
  });

  it("very long script warns about splitting past 10 minutes", () => {
    const r = runTool({ scriptText: words(1500), wordsPerMinute: 140, fontSize: 32 });
    assert.equal(r.ok, true);
    assert.ok(String((r.values as Record<string, unknown>).scrollPlan).includes("10 minutes"));
  });

  it("larger font size produces a faster px/sec rate (fewer chars per line)", () => {
    const small = runTool({ ...base, fontSize: 16 });
    const large = runTool({ ...base, fontSize: 64 });
    const px = (r: typeof small) => Number(String((r.values as Record<string, unknown>).scrollPlan).match(/~([\d.]+) px\/sec/)?.[1]);
    assert.ok(px(large) > px(small));
  });

  it("scroll plan always carries the estimates-only calibration note", () => {
    const r = runTool(base);
    assert.ok(String((r.values as Record<string, unknown>).scrollPlan).includes("Estimates only"));
  });

  it("deterministic: two runs produce identical output", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });
});
