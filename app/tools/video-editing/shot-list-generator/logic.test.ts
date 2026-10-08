import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { sceneDescription: "coffee shop interview, morning light", coverage: "basic", cameraCount: 1 };

describe("shot-list-generator (tool-278)", () => {
  it("happy path: basic coverage returns 6 shots", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal((v.shots as unknown[]).length, 6);
    assert.ok(Array.isArray(v.shootOrder));
    assert.ok(Array.isArray(v.warnings));
  });

  it("each shot has shotSize, angle, movement, lens, purpose", () => {
    const r = runTool(base);
    const shots = (r.values as Record<string, unknown>).shots as Record<string, string>[];
    for (const s of shots) {
      assert.ok(s.shotSize.length > 0);
      assert.ok(s.angle.length > 0);
      assert.ok(s.movement.length > 0);
      assert.ok(s.lens.length > 0);
      assert.ok(s.purpose.includes("coffee shop interview, morning light"));
      assert.ok(!s.purpose.includes("{s}"));
    }
  });

  it("output keys match meta.ts outputs (shots, shootOrder, warnings)", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), ["shootOrder", "shots", "warnings"]);
  });

  it("full coverage returns all 12 bank entries", () => {
    const r = runTool({ ...base, coverage: "full" });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 12);
  });

  it("basic is exactly the first 6 of full", () => {
    const b = runTool({ ...base, coverage: "basic" });
    const f = runTool({ ...base, coverage: "full" });
    const bShots = (b.values as Record<string, unknown>).shots as unknown[];
    const fShots = (f.values as Record<string, unknown>).shots as unknown[];
    assert.deepEqual(bShots, fShots.slice(0, 6));
  });

  it("single camera adds a reset-time warning", () => {
    const r = runTool(base);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("estimate")));
  });

  it("two cameras: no reset warning, multi-camera tip in shoot order", () => {
    const r = runTool({ ...base, cameraCount: 2 });
    assert.equal(r.ok, true);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.equal(warnings.length, 0);
    const order = (r.values as Record<string, unknown>).shootOrder as string[];
    assert.ok(order[order.length - 1].includes("2-camera"));
  });

  it("tiny scene + full coverage caps at 8 with a note", () => {
    const r = runTool({ sceneDescription: "park bench", coverage: "full", cameraCount: 1 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 8);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("capped at 8")));
  });

  it("tiny scene + basic coverage is not capped", () => {
    const r = runTool({ sceneDescription: "park bench", coverage: "basic", cameraCount: 1 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).shots as unknown[]).length, 6);
  });

  it("shoot order batches by setup and references every shot", () => {
    const r = runTool({ ...base, coverage: "full" });
    const order = (r.values as Record<string, unknown>).shootOrder as string[];
    const shots = (r.values as Record<string, unknown>).shots as unknown[];
    const joined = order.join(" ");
    for (let n = 1; n <= shots.length; n++) {
      assert.ok(joined.includes(`#${n}`), `shot #${n} missing from shoot order`);
    }
  });

  it("rejects empty sceneDescription", () => {
    const r = runTool({ sceneDescription: "  ", coverage: "basic", cameraCount: 1 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).length > 0);
  });

  it("rejects missing sceneDescription", () => {
    assert.equal(runTool({ coverage: "basic", cameraCount: 1 }).ok, false);
  });

  it("rejects unknown coverage", () => {
    const r = runTool({ ...base, coverage: "medium" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("basic or full"));
  });

  it("rejects cameraCount outside 1-3", () => {
    assert.equal(runTool({ ...base, cameraCount: 0 }).ok, false);
    assert.equal(runTool({ ...base, cameraCount: 4 }).ok, false);
    assert.equal(runTool({ ...base, cameraCount: 1.5 }).ok, false);
  });

  it("accepts cameraCount 3", () => {
    const r = runTool({ ...base, cameraCount: 3 });
    assert.equal(r.ok, true);
    const order = (r.values as Record<string, unknown>).shootOrder as string[];
    assert.ok(order[order.length - 1].includes("3-camera"));
  });

  it("accepts cameraCount as numeric string", () => {
    assert.equal(runTool({ ...base, cameraCount: "2" }).ok, true);
  });

  it("is deterministic: same inputs twice give identical output", () => {
    const a = runTool(base);
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("no empty picks across the whole bank", () => {
    const r = runTool({ ...base, coverage: "full", cameraCount: 2 });
    const shots = (r.values as Record<string, unknown>).shots as Record<string, string>[];
    assert.equal(shots.length, 12);
    for (const s of shots) {
      assert.ok(s.shotSize && s.angle && s.movement && s.lens && s.purpose);
    }
  });
});
