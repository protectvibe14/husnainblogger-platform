import test from "node:test";
import assert from "node:assert/strict";
import { runTool, USAGE_TYPES, PLACEMENTS } from "./logic.ts";

const GOOD = { usageType: "text", placement: "description" };

test("happy path: text + description returns all three outputs", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.ok(Array.isArray(r.values.variants));
  assert.equal(typeof r.values.recommended, "string");
  assert.equal(typeof r.values.placementTip, "string");
});

test("output ids match meta.ts: variants, recommended, placementTip", () => {
  const r = runTool(GOOD);
  assert.ok(r.values);
  assert.deepEqual(Object.keys(r.values).sort(), [
    "placementTip",
    "recommended",
    "variants",
  ]);
});

test("returns exactly 4 labeled variants", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.variants.length, 4);
  for (const v of r.values!.variants) {
    assert.match(v, /^(Short|Standard|Detailed|Friendly): /);
    assert.ok(v.length > 15, "no empty or near-empty variant");
  }
});

test("each usage type produces distinct statements", () => {
  const seen = new Set<string>();
  for (const u of USAGE_TYPES) {
    const r = runTool({ usageType: u, placement: "caption" });
    assert.equal(r.ok, true);
    seen.add(r.values!.recommended);
  }
  assert.equal(seen.size, USAGE_TYPES.length);
});

test("caption placement recommends the short variant", () => {
  const r = runTool({ usageType: "video", placement: "caption" });
  assert.ok(r.values!.recommended.startsWith("Recommended Short variant"));
});

test("description placement recommends the detailed variant", () => {
  const r = runTool(GOOD);
  assert.ok(r.values!.recommended.startsWith("Recommended Detailed variant"));
});

test("footer placement recommends the standard variant", () => {
  const r = runTool({ usageType: "voice", placement: "footer" });
  assert.ok(r.values!.recommended.startsWith("Recommended Standard variant"));
});

test("placement tip mentions the chosen placement", () => {
  const r = runTool({ usageType: "image", placement: "footer" });
  assert.match(r.values!.placementTip, /footer/);
});

test("recommendation names the usage type and placement", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.recommended, /text/);
  assert.match(r.values!.recommended, /description/);
});

test("missing usageType returns a human error", () => {
  const r = runTool({ placement: "caption" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /usage type/i);
});

test("invalid usageType returns a human error listing options", () => {
  const r = runTool({ usageType: "music", placement: "caption" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /unknown usage type/i);
  assert.match(r.error!, /text, image, video, voice/);
});

test("missing placement returns a human error", () => {
  const r = runTool({ usageType: "text" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /placement/i);
});

test("invalid placement returns a human error listing options", () => {
  const r = runTool({ usageType: "text", placement: "sidebar" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /unknown placement/i);
  assert.match(r.error!, /caption, description, footer/);
});

test("non-string usageType is rejected", () => {
  const r = runTool({ usageType: 42, placement: "caption" });
  assert.equal(r.ok, false);
});

test("inputs are case-insensitive and trimmed", () => {
  const r = runTool({ usageType: "  VIDEO ", placement: " Caption" });
  assert.equal(r.ok, true);
});

test("deterministic: same inputs give identical outputs", () => {
  const a = runTool(GOOD);
  const b = runTool(GOOD);
  assert.deepEqual(a, b);
});

test("all 4 usage types x 3 placements succeed", () => {
  for (const u of USAGE_TYPES) {
    for (const p of PLACEMENTS) {
      const r = runTool({ usageType: u, placement: p });
      assert.equal(r.ok, true, `${u}/${p}`);
      assert.equal(r.values!.variants.length, 4);
    }
  }
});

test("bank sizes match the documented constants", () => {
  assert.equal(USAGE_TYPES.length, 4);
  assert.equal(PLACEMENTS.length, 3);
});

test("statements contain no AI-authorship claim about this tool", () => {
  const r = runTool(GOOD);
  const all = r.values!.variants.join(" ") + " " + r.values!.recommended;
  assert.ok(!/artificial intelligence wrote/i.test(all));
});

test("tip reminds the user this is a template, not legal advice", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.placementTip, /human review/i);
});
