import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeSubject, runTool } from "./logic.ts";

describe("analyzeSubject — normal cases", () => {
  it("strong subject scores high", () => {
    const r = analyzeSubject("How {{first_name}} finally doubled her open rates");
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 85, `expected >=85, got ${r.score}`);
    assert.equal(r.grade, "Excellent");
    assert.equal(r.hasPersonalization, true);
    assert.equal(r.spamTriggers.length, 0);
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
  it("spammy subject gets penalized", () => {
    const r = analyzeSubject("CONGRATULATIONS!!! You've WON $$$ 100% FREE cash bonus ACT NOW!!!");
    assert.ok(r.spamTriggers.length >= 3, `expected >=3 triggers, got ${r.spamTriggers.join(",")}`);
    const f = r.factors.find((x) => x.name === "Spam triggers")!;
    assert.equal(f.verdict, "fail");
    assert.equal(f.points, 0);
    assert.ok(r.score < 50, `expected <50, got ${r.score}`);
  });
  it("ALL CAPS detected", () => {
    const r = analyzeSubject("AMAZING DEAL OF THE CENTURY HERE TODAY ONLY");
    assert.ok(r.spamTriggers.includes("ALL CAPS"));
  });
  it("excessive bangs detected", () => {
    const r = analyzeSubject("New guide for creators is here!!!");
    assert.ok(r.spamTriggers.some((t) => t.includes("exclamation")));
  });
  it("personalization tokens recognized", () => {
    for (const s of ["Hi {{first_name}}, your report", "Hi [Name], your report", "Hi %FIRSTNAME%, your report", "Hi {name}, your report"]) {
      assert.equal(analyzeSubject(s).hasPersonalization, true, s);
    }
  });
  it("curiosity + clarity both rewarded", () => {
    const r = analyzeSubject("Why your open rates dropped (free checklist)");
    const f = r.factors.find((x) => x.name === "Curiosity vs clarity")!;
    assert.equal(f.points, 20);
  });
});

describe("analyzeSubject — boundaries", () => {
  it("length bands", () => {
    const mk = (len: number) => analyzeSubject("x".repeat(len) + " guide"); // +6 chars for " guide"
    assert.equal(mk(34).factors.find((f) => f.name === "Length")!.points, 25); // 40 chars
    assert.equal(mk(19).factors.find((f) => f.name === "Length")!.points, 15); // 25 chars
    assert.equal(mk(80).factors.find((f) => f.name === "Length")!.points, 5); // 86 chars
  });
  it("word count bands", () => {
    assert.equal(analyzeSubject("Your weekly creator guide update").factors.find((f) => f.name === "Readability")!.points, 15);
    assert.equal(analyzeSubject("Hi").factors.find((f) => f.name === "Readability")!.points, 8);
  });
  it("emoji spam downgrades readability", () => {
    const r = analyzeSubject("Your weekly creator guide update 🎉🔥💯🚀");
    const f = r.factors.find((x) => x.name === "Readability")!;
    assert.ok(f.detail.includes("spammy"));
  });
  it("throws on empty / non-string", () => {
    assert.throws(() => analyzeSubject(""), Error);
    assert.throws(() => analyzeSubject("   "), Error);
    assert.throws(() => analyzeSubject(5 as unknown as string), TypeError);
  });
});

describe("runTool — contract", () => {
  it("rejects empty subject", () => {
    assert.equal(runTool({ subject: "" }).ok, false);
    assert.equal(runTool({}).ok, false);
  });
  it("returns score, grade, factors, counts, honesty note", () => {
    const r = runTool({ subject: "Your weekly creator guide is here" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values!.score === "number");
    assert.ok(Array.isArray(r.values!.factorResults));
    assert.ok((r.values!.counts as string).includes("characters"));
    assert.ok((r.values!.heuristicNote as string).includes("Heuristic only"));
  });
});
