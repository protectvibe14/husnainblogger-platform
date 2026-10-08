import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, NICHE_OPTIONS } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["teaser", "style", "beats", "revealCta"];

function okResult(productName = "Aurora Vitamin C Serum", niche = "Beauty / Skincare") {
  const r = runTool({ productName, niche });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: Record<string, string | string[]> }).values;
}

describe("tiktok-unboxing-flow-planner", () => {
  it("happy path: teaser, style, 7 beats, reveal CTA", () => {
    const v = okResult();
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.ok((v.teaser as string).length > 10);
    assert.equal(v.style, "Standard");
    assert.equal((v.beats as string[]).length, 7);
    assert.ok((v.revealCta as string).length > 10);
  });

  it("ASMR niche adds sound-cue beats and style=ASMR-style", () => {
    const v = okResult("Mystery Snack Box", "ASMR / Sensory");
    assert.equal(v.style, "ASMR-style");
    for (const b of v.beats as string[]) {
      assert.ok(b.includes("Sound cue:"), b);
    }
  });

  it("product name containing 'asmr' triggers ASMR-style even in another niche", () => {
    const v = okResult("asmr slime kit", "Toys / Collectibles");
    assert.equal(v.style, "ASMR-style");
    assert.ok((v.beats as string[])[0].includes("Sound cue:"));
  });

  it("standard plan has no sound cues", () => {
    const v = okResult("Aurora Vitamin C Serum", "Beauty / Skincare");
    for (const b of v.beats as string[]) assert.ok(!b.includes("Sound cue:"));
  });

  it("beats are sequential shots 1-7 with a Say line each", () => {
    const beats = okResult().beats as string[];
    beats.forEach((b, i) => {
      assert.ok(b.startsWith(`Shot ${i + 1} —`), b);
      assert.ok(b.includes('Say: "'), b);
    });
  });

  it("missing productName errors", () => {
    const r = runTool({ niche: "Tech / Gadgets" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /product name/i);
  });

  it("blank productName errors", () => {
    assert.equal(runTool({ productName: "   ", niche: "Tech / Gadgets" }).ok, false);
  });

  it("productName over 150 chars errors", () => {
    const r = runTool({ productName: "x".repeat(151), niche: "Tech / Gadgets" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /150/);
  });

  it("missing niche errors", () => {
    assert.equal(runTool({ productName: "Widget" }).ok, false);
  });

  it("niche not in options errors", () => {
    const r = runTool({ productName: "Widget", niche: "Cars" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /niche/i);
  });

  it("deterministic: same inputs -> identical plan", () => {
    assert.deepEqual(
      okResult("Pixel Buds Case", "Tech / Gadgets"),
      okResult("Pixel Buds Case", "Tech / Gadgets")
    );
  });

  it("different products -> different teasers", () => {
    assert.notEqual(
      okResult("Pixel Buds Case", "Tech / Gadgets").teaser,
      okResult("Retro Game Console", "Tech / Gadgets").teaser
    );
  });

  it("product substituted into teaser and CTA (no {product} leftovers)", () => {
    const v = okResult("Glow Lamp", "Other");
    assert.ok(!(v.teaser as string).includes("{product}"));
    assert.ok(!(v.revealCta as string).includes("{product}"));
    assert.ok((v.teaser as string).includes("Glow Lamp"));
  });

  it("word-bank bounds: no empty picks across all niches", () => {
    for (const niche of NICHE_OPTIONS) {
      const v = okResult("Sample Gadget", niche);
      assert.ok((v.teaser as string).length > 10);
      assert.ok((v.revealCta as string).length > 10);
      for (const b of v.beats as string[]) assert.ok(b.length > 30);
    }
  });

  it("shot beat order is stable across runs", () => {
    const a = okResult("A", "Food / Snacks").beats as string[];
    const b = okResult("A", "Food / Snacks").beats as string[];
    assert.deepEqual(a.map((s) => s.split(":")[0]), b.map((s) => s.split(":")[0]));
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });
});
