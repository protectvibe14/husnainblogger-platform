import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeHook, runTool } from "./logic.ts";

describe("analyzeHook — strong hook", () => {
  it("scores high for a short question hook with a number", () => {
    const r = analyzeHook("Stop scrolling: why do 90% of creators quit in 30 days?");
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 80, `expected >=80, got ${r.score}`);
    assert.equal(r.grade, "Excellent");
    assert.ok(r.patternsFound.includes("question"));
    assert.ok(r.patternsFound.includes("pattern-interrupt"));
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
});

describe("analyzeHook — weak hook", () => {
  it("penalizes weak openers", () => {
    const r = analyzeHook("Hey guys so basically today I wanted to talk about my morning routine and stuff");
    const opener = r.factors.find((f) => f.name === "No weak opener");
    assert.equal(opener?.points, 0);
    assert.ok(r.score < 60, `expected <60, got ${r.score}`);
  });

  it("penalizes long hooks", () => {
    const r = analyzeHook(
      "In this video I am going to show you every single step of the long process I use daily",
    );
    const len = r.factors.find((f) => f.name === "Hook length");
    assert.equal(len?.points, 5);
  });
});

describe("analyzeHook — patterns", () => {
  it("detects contradiction patterns", () => {
    const r = analyzeHook("Stop posting daily — nobody cares");
    assert.ok(r.patternsFound.includes("pattern-interrupt"));
  });

  it("detects curiosity gaps", () => {
    const r = analyzeHook("The secret to viral videos nobody talks about");
    assert.ok(r.patternsFound.includes("curiosity-gap"));
  });
});

describe("analyzeHook — errors", () => {
  it("throws on empty hook", () => {
    assert.throws(() => analyzeHook("   "), /non-empty/);
  });
  it("throws on non-string", () => {
    assert.throws(() => analyzeHook(7 as unknown as string), TypeError);
  });
});

describe("runTool contract", () => {
  it("returns ok with all output keys", () => {
    const r = runTool({ hook: "3 mistakes killing your reach" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values?.score === "number");
    assert.ok(typeof r.values?.patternsFound === "string");
    assert.match(String(r.values?.heuristicNote), /Heuristic/);
  });

  it("rejects empty hook", () => {
    const r = runTool({ hook: " " });
    assert.equal(r.ok, false);
  });
});
