import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { topic: "making sourdough bread", videoType: "tutorial", shotCount: 8 };

describe("b-roll-shot-list-generator (tool-276)", () => {
  it("happy path: returns shots + coverageChecklist + warnings", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(Array.isArray(v.shots));
    assert.equal((v.shots as unknown[]).length, 8);
    assert.ok(Array.isArray(v.coverageChecklist));
    assert.equal((v.coverageChecklist as unknown[]).length, 5);
    assert.ok(Array.isArray(v.warnings));
  });

  it("each shot has description, angle, movement, duration", () => {
    const r = runTool(base);
    const shots = (r.values as Record<string, unknown>).shots as Record<string, unknown>[];
    for (const s of shots) {
      assert.equal(typeof s.description, "string");
      assert.ok((s.description as string).length > 0);
      assert.equal(typeof s.angle, "string");
      assert.equal(typeof s.movement, "string");
      assert.equal(typeof s.duration, "string");
      assert.ok(!(s.description as string).includes("{t}"), "topic slot must be filled");
      assert.ok((s.description as string).includes("making sourdough bread"));
    }
  });

  it("output keys match meta.ts outputs (shots, coverageChecklist, warnings)", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), ["coverageChecklist", "shots", "warnings"]);
  });

  it("shotCount defaults to 8 when omitted", () => {
    const r = runTool({ topic: "urban gardening", videoType: "vlog" });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 8);
  });

  it("respects shotCount 3 (minimum)", () => {
    const r = runTool({ ...base, shotCount: 3 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 3);
  });

  it("respects shotCount 30 (maximum) and cycles the bank with a warning", () => {
    const r = runTool({ ...base, shotCount: 30 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 30);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("24 shots")));
  });

  it("high shotCount adds a shoot-time warning", () => {
    const r = runTool({ ...base, shotCount: 25 });
    assert.equal(r.ok, true);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("estimate")));
  });

  it("rejects empty topic", () => {
    const r = runTool({ topic: "   ", videoType: "tutorial", shotCount: 8 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).length > 0);
  });

  it("rejects missing topic", () => {
    const r = runTool({ videoType: "tutorial" });
    assert.equal(r.ok, false);
  });

  it("vague topic still produces a list but adds a warning", () => {
    const r = runTool({ topic: "video", videoType: "ad", shotCount: 6 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 6);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("vague")));
  });

  it("rejects unknown videoType", () => {
    const r = runTool({ ...base, videoType: "music-video" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("tutorial"));
  });

  it("rejects shotCount below 3", () => {
    const r = runTool({ ...base, shotCount: 2 });
    assert.equal(r.ok, false);
  });

  it("rejects shotCount above 30", () => {
    const r = runTool({ ...base, shotCount: 31 });
    assert.equal(r.ok, false);
  });

  it("rejects non-integer shotCount", () => {
    const r = runTool({ ...base, shotCount: 7.5 });
    assert.equal(r.ok, false);
  });

  it("accepts shotCount as a numeric string", () => {
    const r = runTool({ ...base, shotCount: "10" });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 10);
  });

  it("each videoType uses its own bank (deterministic but different content)", () => {
    const t = runTool({ ...base, videoType: "tutorial" });
    const d = runTool({ ...base, videoType: "documentary" });
    const tFirst = ((t.values as Record<string, unknown>).shots as Record<string, string>[])[0].description;
    const dFirst = ((d.values as Record<string, unknown>).shots as Record<string, string>[])[0].description;
    assert.notEqual(tFirst, dFirst);
  });

  it("is deterministic: same inputs twice give identical output", () => {
    const a = runTool(base);
    const b = runTool({ topic: "making sourdough bread", videoType: "tutorial", shotCount: 8 });
    assert.deepEqual(a, b);
  });

  it("different topics can rotate the bank start deterministically", () => {
    const a = runTool({ ...base, topic: "aaa" });
    const b = runTool({ ...base, topic: "zzz" });
    // both valid; rotation is deterministic per topic
    assert.deepEqual(a, runTool({ ...base, topic: "aaa" }));
    assert.deepEqual(b, runTool({ ...base, topic: "zzz" }));
  });

  it("coverage checklist marks missing categories honestly", () => {
    const r = runTool({ ...base, shotCount: 3 });
    const checklist = (r.values as Record<string, unknown>).coverageChecklist as string[];
    assert.equal(checklist.length, 5);
    assert.ok(checklist.some((c) => c.includes("consider adding")));
  });

  it("no empty picks: angles/movements/durations are non-empty in every bank", () => {
    for (const vt of ["tutorial", "vlog", "ad", "documentary"]) {
      const r = runTool({ topic: "coffee brewing", videoType: vt, shotCount: 24 });
      assert.equal(r.ok, true);
      const shots = (r.values as Record<string, unknown>).shots as Record<string, string>[];
      assert.equal(shots.length, 24, vt);
      for (const s of shots) {
        assert.ok(s.angle.length > 0 && s.movement.length > 0 && s.duration.length > 0);
      }
    }
  });
});
