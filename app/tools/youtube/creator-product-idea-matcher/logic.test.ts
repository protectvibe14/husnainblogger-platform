import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NICHE_IDEAS, runTool } from "./logic.ts";

const BASE = { niche: "gaming", audienceBand: "1k-10k", effortTolerance: "medium" };

describe("runTool — happy path", () => {
  it("returns ranked ideas for a valid combo", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(Array.isArray(r.values.rankedIdeas));
    assert.ok(r.values.rankedIdeas.length > 0);
    assert.match(r.values.rankedIdeas[0], /^1\. /);
  });
  it("ranks best fit first", () => {
    const r = runTool({ niche: "education", audienceBand: "over-100k", effortTolerance: "high" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.match(r.values.rankedIdeas[0], /^1\. /);
    assert.ok(r.values.summary.includes("Education"));
  });
  it("summary names the niche, band and effort", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(r.values.summary.includes("Gaming"));
    assert.ok(r.values.summary.includes("1K – 10K subscribers"));
    assert.ok(r.values.summary.includes("medium"));
  });
  it("honesty note labels it a heuristic brainstorm aid", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(r.values.honestyNote.toLowerCase().includes("heuristic"));
    assert.ok(r.values.honestyNote.includes("72-item"));
  });
});

describe("runTool — validation errors", () => {
  it("missing niche -> error", () => {
    const r = runTool({ audienceBand: "1k-10k", effortTolerance: "medium" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /niche/i);
  });
  it("empty niche -> error", () => {
    const r = runTool({ ...BASE, niche: "   " });
    assert.equal(r.ok, false);
  });
  it("unknown niche -> error", () => {
    const r = runTool({ ...BASE, niche: "quantum-physics" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /Unknown niche/);
  });
  it("missing audience band -> error", () => {
    const r = runTool({ niche: "gaming", effortTolerance: "medium" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /audience/i);
  });
  it("unknown audience band -> error", () => {
    const r = runTool({ ...BASE, audienceBand: "1M" });
    assert.equal(r.ok, false);
  });
  it("missing effort tolerance -> error", () => {
    const r = runTool({ niche: "gaming", audienceBand: "1k-10k" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /effort/i);
  });
  it("unknown effort tolerance -> error", () => {
    const r = runTool({ ...BASE, effortTolerance: "extreme" });
    assert.equal(r.ok, false);
  });
});

describe("runTool — effort filtering", () => {
  it("low effort excludes medium/high effort ideas", () => {
    const r = runTool({ ...BASE, effortTolerance: "low" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    for (const line of r.values.rankedIdeas) {
      assert.ok(line.includes("low effort"), `expected only low effort, got: ${line}`);
    }
  });
  it("high effort includes all 6 ideas of the niche table", () => {
    const r = runTool({ ...BASE, effortTolerance: "high" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.rankedIdeas.length, 6);
  });
  it("medium effort is a subset of high effort results", () => {
    const med = runTool({ ...BASE, effortTolerance: "medium" });
    const high = runTool({ ...BASE, effortTolerance: "high" });
    assert.equal(med.ok, true);
    assert.equal(high.ok, true);
    if (!med.ok || !high.ok) return;
    assert.ok(med.values.rankedIdeas.length <= high.values.rankedIdeas.length);
  });
});

describe("runTool — audience boost behavior", () => {
  it("small audience favors digital in top ranks", () => {
    const r = runTool({ niche: "gaming", audienceBand: "under-1k", effortTolerance: "high" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(r.values.rankedIdeas[0].includes("digital"), r.values.rankedIdeas[0]);
  });
});

describe("runTool — determinism & bank", () => {
  it("same input -> identical output (run twice)", () => {
    const a = runTool(BASE);
    const b = runTool(BASE);
    assert.deepEqual(a, b);
  });
  it("table holds 12 niches x 6 ideas", () => {
    assert.equal(NICHE_IDEAS.length, 12);
    for (const n of NICHE_IDEAS) assert.equal(n.ideas.length, 6);
  });
  it("every idea has product, kind, effort, fitScore, why", () => {
    for (const n of NICHE_IDEAS) {
      for (const idea of n.ideas) {
        assert.ok(idea.product.length > 0);
        assert.ok(["digital", "physical", "service"].includes(idea.kind));
        assert.ok([1, 2, 3].includes(idea.effort));
        assert.ok(idea.fitScore >= 1 && idea.fitScore <= 5);
        assert.ok(idea.why.length > 10);
      }
    }
  });
  it("niche ids are unique kebab-case", () => {
    const ids = NICHE_IDEAS.map((n) => n.nicheId);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
  });
});

describe("output ids match meta contract", () => {
  it("values keys are rankedIdeas, summary, honestyNote", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(Object.keys(r.values).sort(), ["honestyNote", "rankedIdeas", "summary"]);
  });
});
