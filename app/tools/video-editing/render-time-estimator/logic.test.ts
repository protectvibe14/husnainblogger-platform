import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const BASE = {
  durationSec: 600,
  fps: 30,
  resolution: "1080p",
  effectLoad: "medium",
  deviceTier: "mid",
};

function valuesOf(r: ReturnType<typeof runTool>) {
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values!;
}

describe("render-time-estimator", () => {
  it("happy path: returns a range, never a point estimate", () => {
    const v = valuesOf(runTool(BASE));
    assert.ok(typeof v.estimatedMinSec === "number");
    assert.ok(typeof v.estimatedMaxSec === "number");
    assert.ok(v.estimatedMaxSec >= v.estimatedMinSec, "max >= min");
    assert.ok(v.estimatedMinSec >= 1);
    // 600s / (6 / (1 * 1.6 * 1) * 1) = 600/3.75 = 160 -> [112, 240]
    assert.equal(v.estimatedMinSec, 112, `min ${v.estimatedMinSec}`);
    assert.equal(v.estimatedMaxSec, 240, `max ${v.estimatedMaxSec}`);
    assert.ok(Array.isArray(v.assumptions) && (v.assumptions as string[]).length >= 3);
  });

  it("higher device tier renders faster (narrower, lower range)", () => {
    const low = valuesOf(runTool({ ...BASE, deviceTier: "low" }));
    const high = valuesOf(runTool({ ...BASE, deviceTier: "high" }));
    assert.ok(
      (high.estimatedMaxSec as number) < (low.estimatedMaxSec as number),
      "high tier max < low tier max"
    );
  });

  it("4k costs ~4x the encode time of 1080p", () => {
    const fhd = valuesOf(runTool(BASE));
    const uhd = valuesOf(runTool({ ...BASE, resolution: "4k" }));
    assert.equal(
      uhd.estimatedMaxSec,
      (fhd.estimatedMaxSec as number) * 4,
      `4k max ${(uhd.estimatedMaxSec as number)} vs 1080p ${(fhd.estimatedMaxSec as number)}`
    );
  });

  it("heavy effects slower than light", () => {
    const light = valuesOf(runTool({ ...BASE, effectLoad: "light" }));
    const heavy = valuesOf(runTool({ ...BASE, effectLoad: "heavy" }));
    assert.ok((heavy.estimatedMinSec as number) > (light.estimatedMinSec as number));
  });

  it("higher fps scales render time linearly-ish", () => {
    const f30 = valuesOf(runTool(BASE));
    const f60 = valuesOf(runTool({ ...BASE, fps: 60 }));
    assert.equal(
      f60.estimatedMinSec,
      (f30.estimatedMinSec as number) * 2,
      `60fps ${(f60.estimatedMinSec as number)} vs 30fps ${(f30.estimatedMinSec as number)}`
    );
  });

  it("extreme case 4k+heavy+low -> very wide range with strong caveat", () => {
    const v = valuesOf(
      runTool({ ...BASE, resolution: "4k", effectLoad: "heavy", deviceTier: "low" })
    );
    const assumptions = v.assumptions as string[];
    assert.ok(
      assumptions.some((a) => a.includes("STRONG CAVEAT")),
      "strong caveat present"
    );
    const min = v.estimatedMinSec as number;
    const max = v.estimatedMaxSec as number;
    assert.ok(max / min > 3, `wide range ${min}-${max}`);
  });

  it("non-extreme cases have no strong caveat", () => {
    const v = valuesOf(runTool(BASE));
    assert.ok(!(v.assumptions as string[]).some((a) => a.includes("STRONG CAVEAT")));
  });

  it("every assumption labels numbers as ROUGH ESTIMATE", () => {
    const v = valuesOf(runTool(BASE));
    assert.ok(
      (v.assumptions as string[])[0].includes("ROUGH ESTIMATE"),
      (v.assumptions as string[])[0]
    );
  });

  it("invalid duration/fps rejected", () => {
    for (const key of ["durationSec", "fps"]) {
      for (const bad of [0, -30, NaN, Infinity, "60" as unknown as number]) {
        const r = runTool({ ...BASE, [key]: bad });
        assert.equal(r.ok, false, `${key}=${bad} rejected`);
        assert.ok(r.error);
      }
    }
  });

  it("unknown enum values rejected", () => {
    assert.equal(runTool({ ...BASE, resolution: "8k" }).ok, false);
    assert.equal(runTool({ ...BASE, effectLoad: "extreme" }).ok, false);
    assert.equal(runTool({ ...BASE, deviceTier: "ultra" }).ok, false);
  });

  it("enum values case-insensitive", () => {
    assert.equal(runTool({ ...BASE, resolution: "4K", effectLoad: "Heavy", deviceTier: "HIGH" }).ok, true);
  });

  it("tiny video clamps minimum to 1 second", () => {
    const v = valuesOf(
      runTool({ durationSec: 1, fps: 24, resolution: "720p", effectLoad: "light", deviceTier: "high" })
    );
    assert.ok((v.estimatedMinSec as number) >= 1);
    assert.ok((v.estimatedMaxSec as number) >= (v.estimatedMinSec as number));
  });

  it("missing inputs rejected with human messages", () => {
    assert.equal(runTool({}).ok, false);
    assert.match(runTool({}).error!, /duration/);
  });

  it("deterministic: same input run twice -> identical output", () => {
    assert.deepEqual(runTool(BASE), runTool(BASE));
  });

  it("output ids match meta.ts outputs", async () => {
    const meta = await import("./meta.ts");
    const outputIds = (meta.outputs as { id: string }[]).map((o) => o.id).sort();
    assert.deepEqual(outputIds, ["assumptions", "estimatedMaxSec", "estimatedMinSec"]);
  });

  it("range widens proportionally with duration", () => {
    const a = valuesOf(runTool(BASE));
    const b = valuesOf(runTool({ ...BASE, durationSec: 1200 }));
    assert.equal(b.estimatedMinSec, (a.estimatedMinSec as number) * 2);
    assert.equal(b.estimatedMaxSec, (a.estimatedMaxSec as number) * 2);
  });
});
