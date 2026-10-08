import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_OPTIONS,
  OPTION_CHAR_LIMIT,
  QUESTION_CHAR_LIMIT,
  MAX_TOPIC_LEN,
  DURATIONS,
  DEFAULT_DURATION,
  hashTopic,
  xWeightedLength,
  buildPoll,
  runTool,
} from "./logic.ts";

describe("constants match platform rules", () => {
  it("4 options max, 25 chars per option, 280-char question budget", () => {
    assert.equal(MAX_OPTIONS, 4);
    assert.equal(OPTION_CHAR_LIMIT, 25);
    assert.equal(QUESTION_CHAR_LIMIT, 280);
  });
  it("durations are exactly the four allowed values, default 24h", () => {
    assert.deepEqual(Object.keys(DURATIONS).sort(), ["1h", "24h", "5min", "7d"]);
    assert.equal(DEFAULT_DURATION, "24h");
  });
});

describe("hashTopic", () => {
  it("deterministic for the same topic", () => {
    assert.equal(hashTopic("email marketing"), hashTopic("email marketing"));
  });
  it("differs across topics (spot check)", () => {
    assert.notEqual(hashTopic("cats"), hashTopic("dogs"));
  });
});

describe("buildPoll", () => {
  it("happy path: question, 2-4 options, duration", () => {
    const p = buildPoll("freelancing", "24h");
    assert.ok(p.pollQuestion.length > 0);
    assert.ok(p.options.length >= 2 && p.options.length <= 4);
    assert.ok(p.suggestedDuration.includes("24 hours"));
  });
  it("every option is <= 25 chars", () => {
    for (const topic of ["ai tools", "meal prep", "x", "a".repeat(50)]) {
      const p = buildPoll(topic, "1h");
      for (const o of p.options) {
        assert.ok(o.length <= OPTION_CHAR_LIMIT, `option too long: "${o}"`);
      }
    }
  });
  it("poll question fits the 280 weighted-char budget", () => {
    const p = buildPoll("a".repeat(190), "7d");
    assert.ok(xWeightedLength(p.pollQuestion) <= QUESTION_CHAR_LIMIT);
  });
  it("very long fitting topic gets truncated with ellipsis, not dropped", () => {
    const p = buildPoll("b".repeat(250), "5min");
    assert.ok(xWeightedLength(p.pollQuestion) <= QUESTION_CHAR_LIMIT);
    assert.ok(p.pollQuestion.includes("…"));
  });
  it("question contains the topic", () => {
    const p = buildPoll("sourdough", "24h");
    assert.ok(p.pollQuestion.toLowerCase().includes("sourdough"));
  });
  it("template selection is deterministic per topic", () => {
    const a = buildPoll("podcasting", "24h");
    const b = buildPoll("podcasting", "24h");
    assert.deepEqual(a, b);
  });
  it("throws on empty topic", () => {
    assert.throws(() => buildPoll("   ", "24h"), /non-empty topic/);
  });
  it("throws on unknown duration", () => {
    assert.throws(() => buildPoll("cats", "2w"), /unknown duration/);
  });
  it("throws TypeError on non-string inputs", () => {
    assert.throws(() => buildPoll(5 as unknown as string, "24h"), TypeError);
  });
});

describe("runTool", () => {
  it("happy path returns the three documented output ids", () => {
    const res = runTool({ topic: "morning routines", duration: "1h" });
    assert.equal(res.ok, true);
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["options", "pollQuestion", "suggestedDuration"]);
  });
  it("duration defaults to 24h when omitted", () => {
    const res = runTool({ topic: "morning routines" });
    assert.equal(res.ok, true);
    assert.ok((res.values?.suggestedDuration as string).includes("24 hours"));
  });
  it("all four durations accepted", () => {
    for (const d of ["5min", "1h", "24h", "7d"]) {
      const res = runTool({ topic: "tea", duration: d });
      assert.equal(res.ok, true, `duration ${d} should be accepted`);
    }
  });
  it("invalid duration -> validation error", () => {
    const res = runTool({ topic: "tea", duration: "2 weeks" });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /Duration must be one of/);
  });
  it("missing topic -> validation error", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ topic: "   " }).ok, false);
    assert.equal(runTool({ topic: 42 }).ok, false);
  });
  it("topic over max length -> validation error", () => {
    const res = runTool({ topic: "x".repeat(MAX_TOPIC_LEN + 1) });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /too long/);
  });
  it("deterministic: same inputs -> identical output", () => {
    const a = runTool({ topic: "remote work", duration: "7d" });
    const b = runTool({ topic: "remote work", duration: "7d" });
    assert.deepEqual(a, b);
  });
  it("question fits budget and options fit caps on every sample", () => {
    for (const topic of ["crypto", "parenting tips", "home workouts", "ai video tools"]) {
      const res = runTool({ topic });
      assert.equal(res.ok, true);
      const q = res.values?.pollQuestion as string;
      const opts = res.values?.options as string[];
      assert.ok(xWeightedLength(q) <= 280, `question over budget: ${q}`);
      assert.ok(opts.length >= 2 && opts.length <= 4);
      assert.ok(opts.every((o) => o.length <= 25));
    }
  });
});
