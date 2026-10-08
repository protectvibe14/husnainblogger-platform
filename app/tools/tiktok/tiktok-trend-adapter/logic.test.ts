import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TREND_TYPES,
  MAX_TREND_NAME_LEN,
  MAX_NICHE_LEN,
  DISCLAIMER,
} from "./logic.ts";

const OUTPUT_IDS = ["concepts", "hooks", "shootingTips", "disclaimer"];

const good = {
  trendName: "the demure trend",
  niche: "meal prep",
  trendType: "meme",
};

describe("tiktok-trend-adapter", () => {
  it("happy path returns 4 concepts, 3 hooks, 3 tips, disclaimer", () => {
    const r = runTool(good);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), OUTPUT_IDS.sort());
    assert.equal((r.values!.concepts as string[]).length, 4);
    assert.equal((r.values!.hooks as string[]).length, 3);
    assert.equal((r.values!.shootingTips as string[]).length, 3);
    assert.equal(r.values!.disclaimer, DISCLAIMER);
  });

  it("concepts contain the pasted trend and niche (never invented)", () => {
    const r = runTool(good);
    for (const c of r.values!.concepts as string[]) {
      assert.ok(c.includes("the demure trend"), `concept mentions trend: ${c}`);
      assert.ok(c.includes("meal prep"), `concept mentions niche: ${c}`);
    }
  });

  it("hooks are non-empty and filled with trend + niche", () => {
    const r = runTool(good);
    for (const h of r.values!.hooks as string[]) {
      assert.ok(h.length > 10);
      assert.ok(!h.includes("{trend}") && !h.includes("{niche}"), "no unfilled placeholders");
    }
  });

  it("every trend type returns type-specific output", () => {
    for (const t of TREND_TYPES) {
      const r = runTool({ ...good, trendType: t });
      assert.equal(r.ok, true, `trendType ${t}`);
      assert.equal((r.values!.concepts as string[]).length, 4);
    }
  });

  it("different trend types give different concepts", () => {
    const a = runTool({ ...good, trendType: "sound" }).values!.concepts;
    const b = runTool({ ...good, trendType: "dance" }).values!.concepts;
    assert.notDeepEqual(a, b);
  });

  it("missing trendName fails", () => {
    const r = runTool({ niche: "meal prep", trendType: "meme" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /trend name/i);
  });

  it("blank trendName fails", () => {
    const r = runTool({ trendName: "   ", niche: "meal prep", trendType: "meme" });
    assert.equal(r.ok, false);
  });

  it("over-long trendName fails", () => {
    const r = runTool({ ...good, trendName: "x".repeat(MAX_TREND_NAME_LEN + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, new RegExp(String(MAX_TREND_NAME_LEN)));
  });

  it("missing niche fails", () => {
    const r = runTool({ trendName: "demure", trendType: "meme" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("over-long niche fails", () => {
    const r = runTool({ ...good, niche: "x".repeat(MAX_NICHE_LEN + 1) });
    assert.equal(r.ok, false);
  });

  it("missing trendType fails", () => {
    const r = runTool({ trendName: "demure", niche: "meal prep" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /trend type/i);
  });

  it("invalid trendType fails", () => {
    const r = runTool({ ...good, trendType: "song" });
    assert.equal(r.ok, false);
  });

  it("trendType is case-insensitive", () => {
    const r = runTool({ ...good, trendType: "MEME" });
    assert.equal(r.ok, true);
  });

  it("'what's trending now' question is refused, not fabricated", () => {
    for (const q of [
      "what's trending now",
      "what is trending right now",
      "which trends are popular",
      "show me the trends",
      "tell me what's viral",
    ]) {
      const r = runTool({ ...good, trendName: q });
      assert.equal(r.ok, false, `refused: ${q}`);
      assert.match(r.error!, /can't see live TikTok trends/i);
      assert.match(r.error!, /Discover/i);
    }
  });

  it("a real trend name containing the word 'trend' is accepted", () => {
    const r = runTool({ ...good, trendName: "the 'clean girl' trend sound" });
    assert.equal(r.ok, true);
  });

  it("deterministic: same inputs twice give identical outputs", () => {
    const a = runTool(good);
    const b = runTool(good);
    assert.deepEqual(a, b);
  });

  it("deterministic across all trend types", () => {
    for (const t of TREND_TYPES) {
      const a = runTool({ ...good, trendType: t });
      const b = runTool({ ...good, trendType: t });
      assert.deepEqual(a.values, b.values, `deterministic for ${t}`);
    }
  });

  it("different niches give different concepts", () => {
    const a = runTool(good).values!.concepts;
    const b = runTool({ ...good, niche: "fitness" }).values!.concepts;
    assert.notDeepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(good);
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("no empty picks from banks", () => {
    for (const t of TREND_TYPES) {
      const r = runTool({ ...good, trendType: t }).values!;
      for (const id of ["concepts", "hooks", "shootingTips"]) {
        for (const item of r[id] as string[]) assert.ok(item.trim().length > 0, `${t}/${id} non-empty`);
      }
    }
  });
});
