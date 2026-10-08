import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_BIO_LENGTH,
  MAX_FOCUS_LENGTH,
  MAX_CTA_LENGTH,
  MAX_KEYWORDS_USED,
  VARIANT_COUNT,
} from "./logic.ts";
import { outputs } from "./meta.ts";

function okVariants(input: Record<string, unknown>): string[] {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  const v = r.values["bioVariants"];
  assert.ok(Array.isArray(v), "bioVariants must be an array");
  return v as string[];
}

describe("pinterest-bio-generator", () => {
  it("happy path: focus + keywords + cta -> 4 variants under 160 chars", () => {
    const variants = okVariants({
      profileFocus: "easy weeknight dinners",
      keywords: ["meal prep", "30-minute meals"],
      cta: "Follow for new recipes",
    });
    assert.equal(variants.length, VARIANT_COUNT);
    for (const v of variants) {
      assert.ok(v.length <= MAX_BIO_LENGTH, `${v.length}: ${v}`);
      assert.ok(v.includes("easy weeknight dinners"), v);
      assert.ok(v.includes("meal prep"), v);
      assert.ok(v.includes("Follow for new recipes"), v);
    }
  });

  it("no keywords -> plain bios with no filler hashtags", () => {
    const variants = okVariants({ profileFocus: "home workouts" });
    assert.equal(variants.length, VARIANT_COUNT);
    for (const v of variants) {
      assert.ok(v.includes("home workouts"), v);
      assert.ok(!v.includes("#"), `no filler hashtags: ${v}`);
      assert.ok(v.length <= MAX_BIO_LENGTH);
    }
  });

  it("no cta -> variants still complete and unique", () => {
    const variants = okVariants({ profileFocus: "budget travel", keywords: ["cheap flights"] });
    assert.equal(variants.length, VARIANT_COUNT);
    assert.equal(new Set(variants).size, variants.length);
  });

  it("single keyword is used grammatically", () => {
    const variants = okVariants({ profileFocus: "skincare", keywords: ["retinol"] });
    for (const v of variants) {
      assert.ok(v.includes("retinol"), v);
      assert.ok(!v.includes("{kw"), v);
    }
  });

  it("keywords accepted as a comma-separated string", () => {
    const variants = okVariants({ profileFocus: "x", keywords: "a, b" });
    for (const v of variants) assert.ok(v.includes("a"), v);
  });

  it("more than 3 keywords are trimmed", () => {
    const variants = okVariants({
      profileFocus: "x",
      keywords: ["k1", "k2", "k3", "k4"],
    });
    for (const v of variants) assert.ok(!v.includes("k4"), `4th keyword trimmed: ${v}`);
  });

  it("determinism: same input twice gives identical output", () => {
    const a = runTool({ profileFocus: "a", keywords: ["b"], cta: "c" });
    const b = runTool({ profileFocus: "a", keywords: ["b"], cta: "c" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ profileFocus: "x" });
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it("empty / blank / missing / non-string focus errors", () => {
    assert.equal(runTool({ profileFocus: "" }).ok, false);
    assert.equal(runTool({ profileFocus: "   " }).ok, false);
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ profileFocus: 9 }).ok, false);
  });

  it("focus longer than 160 chars errors (not silently compressed)", () => {
    const r = runTool({ profileFocus: "f".repeat(MAX_FOCUS_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("160"));
  });

  it("max-length focus + max keywords + max cta: all variants <=160 and keep the first keyword", () => {
    const variants = okVariants({
      profileFocus: "f".repeat(MAX_FOCUS_LENGTH),
      keywords: ["keyword-one-here", "keyword-two-here", "keyword-three"],
      cta: "c".repeat(MAX_CTA_LENGTH),
    });
    assert.equal(variants.length, VARIANT_COUNT);
    for (const v of variants) {
      assert.ok(v.length <= MAX_BIO_LENGTH, `${v.length}: ${v}`);
      assert.ok(v.includes("keyword-one-here"), `keyword survived truncation: ${v}`);
    }
  });

  it("cta longer than 60 chars errors", () => {
    const r = runTool({ profileFocus: "x", cta: "c".repeat(MAX_CTA_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("60"));
  });

  it("non-string cta errors", () => {
    assert.equal(runTool({ profileFocus: "x", cta: 5 }).ok, false);
  });

  it("keyword over 40 chars errors", () => {
    assert.equal(runTool({ profileFocus: "x", keywords: ["k".repeat(41)] }).ok, false);
  });

  it("non-string keyword errors", () => {
    assert.equal(runTool({ profileFocus: "x", keywords: [true] }).ok, false);
  });

  it("non-Latin focus and keywords pass through unchanged", () => {
    const variants = okVariants({ profileFocus: "سفر", keywords: ["پہاڑ"], cta: "فالو کریں" });
    for (const v of variants) {
      assert.ok(v.includes("سفر"), v);
      assert.ok(v.includes("پہاڑ"), v);
    }
  });

  it("no leftover placeholders in any variant", () => {
    const variants = okVariants({
      profileFocus: "x",
      keywords: ["y", "z"],
      cta: "do it",
    });
    for (const v of variants) {
      assert.ok(!/\{(focus|kw1|kw2|cta)\}/.test(v), v);
    }
  });

  it("no empty variants", () => {
    const variants = okVariants({ profileFocus: "q" });
    for (const v of variants) assert.ok(v.trim().length > 0);
    assert.ok(MAX_KEYWORDS_USED === 3);
    assert.ok(VARIANT_COUNT === 4);
  });

  it("non-object input errors", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});
