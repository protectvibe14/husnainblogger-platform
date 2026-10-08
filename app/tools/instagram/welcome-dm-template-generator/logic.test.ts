/**
 * Tests for the Welcome DM Template Generator.
 * Run: node --test app/tools/instagram/welcome-dm-template-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TONES, MAX_DM_CHARS } from "./logic.ts";

const GOOD = { brandName: "GlowSkin", offer: "skincare routines for busy women", tone: "friendly", count: 3 };

describe("welcome-dm-template-generator", () => {
  it("happy path: returns ok with dms and personalizationSlots", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values!.dms));
    assert.equal((r.values!.dms as string[]).length, 3);
    assert.ok(Array.isArray(r.values!.personalizationSlots));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(GOOD);
    assert.deepEqual(Object.keys(r.values!).sort(), ["dms", "personalizationSlots"]);
  });

  it("fills {brand} and {offer} but keeps {name} as a slot", () => {
    const r = runTool(GOOD);
    const dms = r.values!.dms as string[];
    for (const dm of dms) {
      assert.ok(dm.includes("GlowSkin"), "brand filled");
      assert.ok(dm.includes("skincare routines for busy women"), "offer filled");
      assert.ok(dm.includes("{name}"), "{name} kept as personalization slot");
      assert.ok(!dm.includes("{brand}") && !dm.includes("{offer}"), "no raw brand/offer placeholders");
    }
  });

  it("count=1 returns exactly one DM; count=5 returns five distinct DMs", () => {
    assert.equal((runTool({ ...GOOD, count: 1 }).values!.dms as string[]).length, 1);
    const five = runTool({ ...GOOD, count: 5 }).values!.dms as string[];
    assert.equal(five.length, 5);
    assert.equal(new Set(five).size, 5, "all five distinct");
  });

  it("count omitted defaults to 3", () => {
    const { count: _c, ...rest } = GOOD;
    assert.equal((runTool(rest).values!.dms as string[]).length, 3);
  });

  it("every tone produces templates mentioning brand and offer", () => {
    for (const tone of TONES) {
      const r = runTool({ ...GOOD, tone, count: 5 });
      assert.equal(r.ok, true, tone);
      const dms = r.values!.dms as string[];
      assert.equal(dms.length, 5, tone);
      for (const dm of dms) assert.ok(dm.includes("GlowSkin") && dm.includes("skincare routines"), tone);
    }
  });

  it("unknown tone falls back to friendly", () => {
    const r = runTool({ ...GOOD, tone: "mysterious", count: 2 });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values!.dms, runTool({ ...GOOD, tone: "friendly", count: 2 }).values!.dms);
  });

  it("missing brandName -> error", () => {
    const r = runTool({ ...GOOD, brandName: "" });
    assert.equal(r.ok, false);
    assert.ok(/brand/i.test(r.error!));
  });

  it("whitespace-only brandName -> error", () => {
    assert.equal(runTool({ ...GOOD, brandName: "   " }).ok, false);
  });

  it("missing offer -> error", () => {
    const r = runTool({ ...GOOD, offer: "" });
    assert.equal(r.ok, false);
    assert.ok(/offer/i.test(r.error!));
  });

  it("brandName over 60 chars -> error", () => {
    assert.equal(runTool({ ...GOOD, brandName: "B".repeat(61) }).ok, false);
    assert.equal(runTool({ ...GOOD, brandName: "B".repeat(60) }).ok, true);
  });

  it("offer over 140 chars -> error", () => {
    assert.equal(runTool({ ...GOOD, offer: "O".repeat(141) }).ok, false);
    assert.equal(runTool({ ...GOOD, offer: "O".repeat(140) }).ok, true);
  });

  it("count=0, count=6, count=2.5, count='abc' -> error", () => {
    for (const count of [0, 6, 2.5, "abc"]) {
      const r = runTool({ ...GOOD, count });
      assert.equal(r.ok, false, `count=${count}`);
      assert.ok(/count/i.test(r.error!), `count=${count}`);
    }
  });

  it("count accepts numeric strings", () => {
    assert.equal((runTool({ ...GOOD, count: "4" }).values!.dms as string[]).length, 4);
  });

  it("determinism: same inputs -> identical outputs", () => {
    const a = runTool(GOOD);
    const b = runTool({ ...GOOD });
    assert.deepEqual(a, b);
  });

  it("no DM exceeds the 1,000-char DM limit across all tones", () => {
    for (const tone of TONES) {
      const dms = runTool({ brandName: "B".repeat(60), offer: "O".repeat(140), tone, count: 5 }).values!.dms as string[];
      for (const dm of dms) assert.ok(dm.length <= MAX_DM_CHARS, `${tone}: ${dm.length}`);
    }
  });

  it("personalizationSlots explains all three placeholders", () => {
    const slots = runTool(GOOD).values!.personalizationSlots as string[];
    assert.equal(slots.length, 3);
    assert.ok(slots.some((s) => s.includes("{name}")));
    assert.ok(slots.some((s) => s.includes("{brand}")));
    assert.ok(slots.some((s) => s.includes("{offer}")));
  });

  it("trims whitespace on brandName and offer", () => {
    const r = runTool({ ...GOOD, brandName: "  GlowSkin  ", offer: "  skincare  " });
    const dms = r.values!.dms as string[];
    assert.ok(dms[0].includes("GlowSkin"));
    assert.ok(!dms[0].includes("  GlowSkin  "));
  });
});
