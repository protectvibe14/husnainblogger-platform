import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreProfile, runTool, CHECKLIST } from "./logic.ts";

const ALL_DONE: Record<string, boolean> = Object.fromEntries(CHECKLIST.map((c) => [c.id, true]));
const NONE_DONE: Record<string, boolean> = Object.fromEntries(CHECKLIST.map((c) => [c.id, false]));

describe("scoreProfile — normal cases", () => {
  it("all done scores 100", () => {
    const r = scoreProfile(ALL_DONE);
    assert.equal(r.heuristic, true);
    assert.equal(r.score, 100);
    assert.equal(r.grade, "Complete");
    assert.equal(r.doneCount, 8);
    assert.equal(r.priorities.length, 0);
  });
  it("none done scores 0", () => {
    const r = scoreProfile(NONE_DONE);
    assert.equal(r.score, 0);
    assert.equal(r.grade, "Incomplete");
    assert.equal(r.priorities.length, 8);
  });
  it("weights sum to 100", () => {
    assert.equal(CHECKLIST.reduce((a, c) => a + c.weight, 0), 100);
  });
  it("partial completion grades correctly", () => {
    const r = scoreProfile({ ...NONE_DONE, photo: true, bio: true, link: true, handle: true });
    assert.equal(r.score, 60);
    assert.equal(r.grade, "Needs work");
  });
  it("strong threshold", () => {
    const r = scoreProfile({ ...ALL_DONE, contact: false, highlights: false });
    assert.equal(r.score, 80);
    assert.equal(r.grade, "Strong");
  });
  it("priorities sorted by weight desc", () => {
    const r = scoreProfile(NONE_DONE);
    const weights = r.priorities.map((p) => {
      const m = p.match(/\(\+(\d+) pts\)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const sorted = [...weights].sort((a, b) => b - a);
    assert.deepEqual(weights, sorted);
  });
  it("each priority includes a fix", () => {
    const r = scoreProfile(NONE_DONE);
    assert.ok(r.priorities.every((p) => p.includes(":")));
  });
});

describe("scoreProfile — boundaries", () => {
  it("missing keys treated as not done", () => {
    const r = scoreProfile({});
    assert.equal(r.score, 0);
    assert.equal(r.doneCount, 0);
  });
  it("non-boolean truthy values treated strictly", () => {
    const r = scoreProfile({ photo: "yes" } as unknown as Record<string, boolean>);
    assert.equal(r.score, 0); // only === true counts
  });
  it("throws on non-object", () => {
    assert.throws(() => scoreProfile(null as unknown as Record<string, boolean>), TypeError);
    assert.throws(() => scoreProfile("x" as unknown as Record<string, boolean>), TypeError);
  });
  it("8 checklist items", () => {
    assert.equal(CHECKLIST.length, 8);
  });
});

describe("runTool — contract", () => {
  it("all unchecked still returns a result", () => {
    const r = runTool({});
    assert.equal(r.ok, true);
    assert.equal(r.values!.score, 0);
    assert.equal(r.values!.grade, "Incomplete");
  });
  it("returns itemStatus, priorities, honesty note", () => {
    const r = runTool(ALL_DONE);
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values!.itemStatus));
    assert.ok(Array.isArray(r.values!.priorities));
    assert.ok((r.values!.heuristicNote as string).includes("Self-reported"));
  });
});
