import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  calculate,
  countWords,
  formatDuration,
  DEFAULT_WPM,
} from "./logic.ts";

describe("voiceover-timing-cost-calculator", () => {
  it("happy path: script text -> words, duration, cost", () => {
    const script = "word ".repeat(300).trim(); // 300 words, 1499 chars
    const r = runTool({ scriptText: script, ratePer1kChars: 0.3 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["wordCount"], 300);
    assert.equal(v["charCount"], 1499);
    assert.equal(v["charCountEstimated"], false);
    assert.equal(v["wpm"], DEFAULT_WPM);
    // 300 words @150wpm = 120s
    assert.equal(v["durationSec"], 120);
    assert.equal(v["duration"], "2:00 (estimate at 150 wpm)");
    // 1499/1000 * 0.30 = 0.4497 -> 0.45
    assert.equal(v["estimatedCostUSD"], 0.45);
    assert.equal(v["finishedMinuteCostUSD"], null);
  });

  it("cost math: chars/1000 x rate, rounded to cents", () => {
    const r = calculate(100, 2000, false, 150, 1.5, null);
    assert.equal(r.estimatedCostUSD, 3);
    const r2 = calculate(100, 3333, false, 150, 0.1, null);
    assert.equal(r2.estimatedCostUSD, 0.33);
  });

  it("wordCountOverride wins over script text; chars counted from script", () => {
    const r = runTool({
      scriptText: "short script here",
      wordCountOverride: 1000,
      wpm: 100,
      ratePer1kChars: 1,
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["wordCount"], 1000);
    assert.equal(v["charCount"], "short script here".length);
    assert.equal(v["durationSec"], 600);
    assert.equal(v["duration"], "10:00 (estimate at 100 wpm)");
  });

  it("word-count-only mode estimates chars and flags it", () => {
    const r = runTool({ wordCountOverride: 500, ratePer1kChars: 0.3 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["wordCount"], 500);
    assert.equal(v["charCount"], 2500);
    assert.equal(v["charCountEstimated"], true);
  });

  it("optional voiceover rate per finished minute", () => {
    const r = runTool({
      wordCountOverride: 300,
      ratePer1kChars: 0,
      voiceoverRatePerMin: 50,
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["estimatedCostUSD"], 0);
    assert.equal(v["finishedMinuteCostUSD"], 100); // 2 min x $50
  });

  it("zero rates are allowed (free tier)", () => {
    const r = runTool({ wordCountOverride: 100, ratePer1kChars: 0 });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>)["estimatedCostUSD"], 0);
  });

  it("custom WPM changes duration", () => {
    const r = runTool({ wordCountOverride: 300, wpm: 75, ratePer1kChars: 0 });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>)["durationSec"], 240);
  });

  it("formatDuration pads seconds", () => {
    assert.equal(formatDuration(65), "1:05");
    assert.equal(formatDuration(60), "1:00");
    assert.equal(formatDuration(59.6), "1:00");
    assert.equal(formatDuration(3661), "61:01");
  });

  it("countWords handles messy whitespace", () => {
    assert.equal(countWords("  one   two\nthree  "), 3);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = { wordCountOverride: 250, wpm: 150, ratePer1kChars: 0.3 };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("HTML in script text is stripped before counting", () => {
    const r = runTool({ scriptText: "<p>hello world</p>", ratePer1kChars: 0 });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>)["wordCount"], 2);
  });

  it("validation: neither script nor word count -> error", () => {
    assert.equal(runTool({ ratePer1kChars: 0.3 }).ok, false);
    assert.equal(runTool({ scriptText: "", ratePer1kChars: 0.3 }).ok, false);
    assert.equal(runTool({ scriptText: "   ", ratePer1kChars: 0.3 }).ok, false);
  });

  it("validation: missing or invalid rate -> error", () => {
    assert.equal(runTool({ wordCountOverride: 100 }).ok, false);
    assert.equal(runTool({ wordCountOverride: 100, ratePer1kChars: -1 }).ok, false);
    assert.equal(runTool({ wordCountOverride: 100, ratePer1kChars: "cheap" }).ok, false);
  });

  it("validation: wpm out of range -> error", () => {
    assert.equal(runTool({ wordCountOverride: 100, ratePer1kChars: 0, wpm: 59 }).ok, false);
    assert.equal(runTool({ wordCountOverride: 100, ratePer1kChars: 0, wpm: 301 }).ok, false);
    assert.equal(runTool({ wordCountOverride: 100, ratePer1kChars: 0, wpm: 120.5 }).ok, false);
  });

  it("validation: bad wordCountOverride -> error", () => {
    assert.equal(runTool({ wordCountOverride: 0, ratePer1kChars: 0 }).ok, false);
    assert.equal(runTool({ wordCountOverride: -5, ratePer1kChars: 0 }).ok, false);
    assert.equal(runTool({ wordCountOverride: 2.5, ratePer1kChars: 0 }).ok, false);
  });

  it("validation: invalid per-minute rate -> error", () => {
    assert.equal(
      runTool({ wordCountOverride: 100, ratePer1kChars: 0, voiceoverRatePerMin: -2 }).ok,
      false,
    );
  });
});
