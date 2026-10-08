import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, NICHE_OPTIONS } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["hook", "branch", "steps", "productSlots", "cta"];

function okResult(topic = "5-minute work makeup", niche = "Skincare", stepCount: unknown = 4) {
  const r = runTool({ grwmTopic: topic, niche, stepCount });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: Record<string, string | string[]> }).values;
}

describe("tiktok-grwm-script-planner", () => {
  it("happy path: returns all expected outputs with correct step count", () => {
    const v = okResult();
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.ok(typeof v.hook === "string" && v.hook.length > 0);
    assert.ok(typeof v.cta === "string" && v.cta.length > 0);
    assert.equal(v.branch, "Skincare");
    assert.equal((v.steps as string[]).length, 4);
    assert.equal((v.productSlots as string[]).length, 4);
  });

  it("skincare branch: steps use the skincare template bank", () => {
    const v = okResult("glowy night routine", "Skincare", 6);
    assert.equal(v.branch, "Skincare");
    assert.ok((v.steps as string[]).some((s) => /serum|moisturizer|SPF/i.test(s)));
  });

  it("fashion branch: different template bank than skincare", () => {
    const skin = okResult("glow up", "Skincare", 5);
    const fashion = okResult("glow up", "Fashion / Outfits", 5);
    assert.equal(fashion.branch, "Fashion / Outfits");
    assert.notDeepEqual(fashion.steps, skin.steps);
    assert.ok((fashion.steps as string[]).some((s) => /outfit|fit check|shoes/i.test(s)));
  });

  it("other niches fall back to the general branch", () => {
    const v = okResult("date night", "Fragrance", 3);
    assert.equal(v.branch, "General");
    assert.equal((v.steps as string[]).length, 3);
  });

  it("stepCount 10 works; stepCount 3 works (bounds)", () => {
    assert.equal((okResult("x", "Hair", 10).steps as string[]).length, 10);
    assert.equal((okResult("x", "Hair", 3).steps as string[]).length, 3);
  });

  it("missing grwmTopic errors", () => {
    const r = runTool({ niche: "Skincare", stepCount: 4 });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /topic/i);
  });

  it("blank grwmTopic errors", () => {
    assert.equal(runTool({ grwmTopic: "   ", niche: "Skincare", stepCount: 4 }).ok, false);
  });

  it("grwmTopic over 200 chars errors", () => {
    const r = runTool({ grwmTopic: "a".repeat(201), niche: "Skincare", stepCount: 4 });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /200/);
  });

  it("missing niche errors", () => {
    assert.equal(runTool({ grwmTopic: "x", stepCount: 4 }).ok, false);
  });

  it("niche not in options errors", () => {
    const r = runTool({ grwmTopic: "x", niche: "Cooking", stepCount: 4 });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /niche/i);
  });

  it("stepCount 2 and 11 error (3-10 range)", () => {
    assert.match((runTool({ grwmTopic: "x", niche: "Hair", stepCount: 2 }) as { error: string }).error, /3 and 10/);
    assert.match((runTool({ grwmTopic: "x", niche: "Hair", stepCount: 11 }) as { error: string }).error, /3 and 10/);
  });

  it("non-integer stepCount errors", () => {
    assert.equal(runTool({ grwmTopic: "x", niche: "Hair", stepCount: 4.5 }).ok, false);
    assert.equal(runTool({ grwmTopic: "x", niche: "Hair", stepCount: "abc" }).ok, false);
  });

  it("numeric string stepCount is coerced", () => {
    const v = okResult("x", "Hair", "5");
    assert.equal((v.steps as string[]).length, 5);
  });

  it("deterministic: same inputs -> identical output", () => {
    const a = okResult("morning glow", "Makeup / Beauty", 5);
    const b = okResult("morning glow", "Makeup / Beauty", 5);
    assert.deepEqual(a, b);
  });

  it("different topics -> different hooks (seed actually varies)", () => {
    const a = okResult("morning glow", "Skincare", 4);
    const b = okResult("night out", "Skincare", 4);
    assert.notEqual(a.hook, b.hook);
  });

  it("topic is substituted into hook and cta (no {topic} leftovers)", () => {
    const v = okResult("work meeting", "Skincare", 4);
    assert.ok(!(v.hook as string).includes("{topic}"));
    assert.ok(!(v.cta as string).includes("{topic}"));
    for (const s of v.steps as string[]) assert.ok(!s.includes("{topic}"));
  });

  it("word-bank bounds: no empty picks", () => {
    for (const niche of NICHE_OPTIONS) {
      const v = okResult("sample topic", niche, 7);
      assert.ok((v.hook as string).length > 10);
      assert.ok((v.cta as string).length > 10);
      for (const s of v.steps as string[]) assert.ok(s.length > 20);
      for (const p of v.productSlots as string[]) assert.ok(p.length > 20);
    }
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });
});
