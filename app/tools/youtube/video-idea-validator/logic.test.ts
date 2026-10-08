import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RUBRIC,
  RUBRIC_TOTAL,
  verdictFor,
  parseRating,
  scoreIdea,
  runTool,
  HONEST_NOTE,
} from "./logic.ts";

const META_OUTPUT_IDS = ["score", "verdict", "weakestFactor", "factorBreakdown", "honestNote"];

const ALL_FIVES = { demand: 5, competition: 5, channelFit: 5, packaging: 5, effort: 5 };
const ALL_ONES = { demand: 1, competition: 1, channelFit: 1, packaging: 1, effort: 1 };

describe("video-idea-validator — rubric", () => {
  it("weights sum to exactly 100", () => {
    assert.equal(RUBRIC_TOTAL, 100);
    assert.equal(RUBRIC.reduce((a, c) => a + c.weight, 0), 100);
  });
  it("has 5 criteria in documented order with ids", () => {
    assert.deepEqual(RUBRIC.map((c) => c.id), ["demand", "competition", "channelFit", "packaging", "effort"]);
    assert.deepEqual(RUBRIC.map((c) => c.weight), [30, 25, 20, 15, 10]);
  });
  it("every criterion documents what 1 and 5 mean", () => {
    for (const c of RUBRIC) {
      assert.ok(c.lowMeans.includes("1 ="), c.id);
      assert.ok(c.highMeans.includes("5 ="), c.id);
    }
  });
  it("verdict bands: 75+ greenlight, 50-74 refine, below 50 park", () => {
    assert.equal(verdictFor(100), "GREENLIGHT");
    assert.equal(verdictFor(75), "GREENLIGHT");
    assert.equal(verdictFor(74), "REFINE");
    assert.equal(verdictFor(50), "REFINE");
    assert.equal(verdictFor(49), "PARK");
    assert.equal(verdictFor(0), "PARK");
  });
});

describe("video-idea-validator — parseRating", () => {
  it("accepts 1..5 and string forms", () => {
    for (const n of [1, 2, 3, 4, 5]) assert.equal(parseRating(n), n);
    assert.equal(parseRating("5"), 5);
    assert.equal(parseRating(" 3 "), 3);
  });
  it("rejects 0, 6, decimals, junk, empty", () => {
    for (const bad of [0, 6, 2.5, "three", "", " ", null, undefined, true]) {
      assert.equal(parseRating(bad), null, `expected null for ${String(bad)}`);
    }
  });
});

describe("video-idea-validator — scoreIdea math", () => {
  it("all 5s -> 100, GREENLIGHT", () => {
    const r = scoreIdea("X", ALL_FIVES);
    assert.equal(r.score, 100);
    assert.equal(r.verdict, "GREENLIGHT");
    assert.equal(r.factors.reduce((a, f) => a + f.points, 0), 100);
  });
  it("all 1s -> 0, PARK", () => {
    const r = scoreIdea("X", ALL_ONES);
    assert.equal(r.score, 0);
    assert.equal(r.verdict, "PARK");
  });
  it("all 3s -> 50, REFINE (boundary)", () => {
    const r = scoreIdea("X", { demand: 3, competition: 3, channelFit: 3, packaging: 3, effort: 3 });
    // (3-1)/4 = 0.5 of each weight -> 15+12.5+10+7.5+5 rounded per factor
    assert.ok(r.score >= 49 && r.score <= 51, `got ${r.score}`);
  });
  it("known case: 4/4/3/4/5", () => {
    const r = scoreIdea("X", { demand: 4, competition: 4, channelFit: 3, packaging: 4, effort: 5 });
    // 0.75*30=22.5->23? Math.round(22.5)=23; 0.75*25=18.75->19; 0.5*20=10; 0.75*15=11.25->11; 1.0*10=10
    const expected = 23 + 19 + 10 + 11 + 10;
    assert.equal(r.score, expected);
  });
  it("weakest factor is the lowest earned share", () => {
    const r = scoreIdea("X", { demand: 2, competition: 5, channelFit: 5, packaging: 5, effort: 5 });
    assert.equal(r.weakestFactorId, "demand");
    assert.ok(r.weakestFactorAdvice.includes("demand"));
  });
  it("weakest factor ties break by rubric order", () => {
    const r = scoreIdea("X", { demand: 1, competition: 1, channelFit: 5, packaging: 5, effort: 5 });
    assert.equal(r.weakestFactorId, "demand");
  });
  it("honest note admits no prediction of performance", () => {
    assert.ok(HONEST_NOTE.includes("not validation"));
    assert.ok(HONEST_NOTE.toLowerCase().includes("cannot predict"));
  });
});

describe("video-idea-validator — runTool adapter", () => {
  it("happy path returns all five outputs", () => {
    const r = runTool({ ideaTitle: "I built a chicken coop", ...ALL_FIVES });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [...META_OUTPUT_IDS].sort());
    assert.equal(r.values!["score"], 100);
    assert.equal(r.values!["verdict"], "GREENLIGHT");
    assert.equal((r.values!["factorBreakdown"] as string[]).length, 5);
    assert.ok((r.values!["weakestFactor"] as string).length > 0);
    assert.equal(r.values!["honestNote"], HONEST_NOTE);
  });
  it("low ratings -> PARK with weakest factor named", () => {
    const r = runTool({ ideaTitle: "Vlog #412", ...ALL_ONES });
    assert.equal(r.ok, true);
    assert.equal(r.values!["score"], 0);
    assert.equal(r.values!["verdict"], "PARK");
    assert.ok((r.values!["weakestFactor"] as string).includes("Search demand"));
  });
  it("mixed ratings -> REFINE", () => {
    const r = runTool({ ideaTitle: "Desk setup tour", demand: 4, competition: 3, channelFit: 4, packaging: 3, effort: 4 });
    assert.equal(r.ok, true);
    assert.equal(r.values!["verdict"], "REFINE");
  });
  it("accepts string ratings from form selects", () => {
    const r = runTool({ ideaTitle: "x", demand: "5", competition: "4", channelFit: "5", packaging: "4", effort: "5" });
    assert.equal(r.ok, true);
    assert.ok((r.values!["score"] as number) >= 75);
  });
  it("rejects blank idea title", () => {
    const r = runTool({ ideaTitle: "  ", ...ALL_FIVES });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("idea title"));
  });
  it("rejects missing values object", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
  it("rejects each invalid rating individually", () => {
    for (const id of ["demand", "competition", "channelFit", "packaging", "effort"]) {
      const vals: Record<string, unknown> = { ideaTitle: "x", ...ALL_FIVES, [id]: 9 };
      const r = runTool(vals);
      assert.equal(r.ok, false, id);
      assert.ok(r.error!.includes("1 to 5"), id);
    }
  });
  it("rejects missing rating", () => {
    const vals: Record<string, unknown> = { ideaTitle: "x", demand: 5, competition: 5, channelFit: 5, packaging: 5 };
    const r = runTool(vals);
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Effort efficiency"));
  });
  it("rejects over-long idea title", () => {
    const r = runTool({ ideaTitle: "x".repeat(201), ...ALL_FIVES });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("200"));
  });
  it("deterministic: run twice -> identical", () => {
    const vals = { ideaTitle: "same idea", demand: 4, competition: 2, channelFit: 5, packaging: 3, effort: 4 };
    assert.deepEqual(runTool(vals), runTool(vals));
  });
  it("error results carry no values", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });
});
