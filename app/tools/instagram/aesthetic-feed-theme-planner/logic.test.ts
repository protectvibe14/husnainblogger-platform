import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, planTheme, FEED_THEMES, BANK_SIZES, type FeedTheme } from "./logic.ts";

describe("aesthetic-feed-theme-planner", () => {
  it("happy path: minimal theme returns all outputs", () => {
    const r = runTool({ theme: "minimal", niche: "coffee shops" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.palette as string[]).length, 6);
    assert.equal((r.values!.doList as string[]).length, 6);
    assert.equal((r.values!.dontList as string[]).length, 6);
    assert.equal((r.values!.sampleGrid as string[]).length, 9);
    assert.match(r.values!.postingRhythm as string, /3 posts per week/);
    assert.match(r.values!.themeNote as string, /coffee shops/);
  });

  it("output ids match meta: palette, doList, dontList, postingRhythm, sampleGrid, themeNote", () => {
    const r = runTool({ theme: "bold" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "doList",
      "dontList",
      "palette",
      "postingRhythm",
      "sampleGrid",
      "themeNote",
    ]);
  });

  it("all five themes produce valid plans with hex palettes", () => {
    for (const theme of FEED_THEMES) {
      const r = runTool({ theme });
      assert.equal(r.ok, true, `theme ${theme}`);
      for (const hex of r.values!.palette as string[]) {
        assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `palette ${hex} of ${theme}`);
      }
      const plan = planTheme(theme, "");
      assert.equal(plan.entry.palette.length, BANK_SIZES.palettePerTheme);
      assert.equal(plan.entry.doList.length, BANK_SIZES.doPerTheme);
    }
  });

  it("missing theme -> error", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Theme is required/);
  });

  it("blank theme string -> error", () => {
    const r = runTool({ theme: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /required/);
  });

  it("unknown theme defaults to minimal with a note", () => {
    const r = runTool({ theme: "neon" });
    assert.equal(r.ok, true);
    assert.match(r.values!.themeNote as string, /defaulted to "minimal"/);
    assert.match(r.values!.themeNote as string, /"neon"/);
    assert.equal((r.values!.palette as string[])[0], "#FFFFFF");
  });

  it("theme matching is case-insensitive", () => {
    const r = runTool({ theme: "PASTEL" });
    assert.equal(r.ok, true);
    assert.match(r.values!.themeNote as string, /Theme: pastel/);
  });

  it("niche is optional: plan works without it", () => {
    const r = runTool({ theme: "moody" });
    assert.equal(r.ok, true);
    assert.match(r.values!.themeNote as string, /none provided/);
  });

  it("niche tip only references the niche, never changes the bank", () => {
    const a = runTool({ theme: "editorial", niche: "bakeries" });
    const b = runTool({ theme: "editorial", niche: "gyms" });
    assert.deepEqual(a.values!.palette, b.values!.palette);
    assert.deepEqual(a.values!.doList, b.values!.doList);
    assert.deepEqual(a.values!.sampleGrid, b.values!.sampleGrid);
    assert.match(a.values!.themeNote as string, /bakeries/);
  });

  it("sampleGrid cells are labeled row-by-row in order", () => {
    const r = runTool({ theme: "minimal" });
    const grid = r.values!.sampleGrid as string[];
    assert.match(grid[0], /^Row 1, Col 1:/);
    assert.match(grid[4], /^Row 2, Col 2:/);
    assert.match(grid[8], /^Row 3, Col 3:/);
  });

  it("deterministic: same input twice -> identical output", () => {
    const input = { theme: "bold", niche: "streetwear" };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("FEED_THEMES contains exactly the five spec themes", () => {
    assert.deepEqual(FEED_THEMES, ["minimal", "bold", "pastel", "moody", "editorial"]);
  });

  it("BANK_SIZES documents the curated bank honestly", () => {
    assert.equal(BANK_SIZES.themes, 5);
    assert.equal(BANK_SIZES.palettePerTheme, 6);
    assert.equal(BANK_SIZES.doPerTheme, 6);
    assert.equal(BANK_SIZES.dontPerTheme, 6);
    assert.equal(BANK_SIZES.gridCells, 9);
  });

  it("no palette hex is duplicated inside one theme", () => {
    for (const theme of FEED_THEMES) {
      const plan = planTheme(theme, "");
      const set = new Set(plan.entry.palette);
      assert.equal(set.size, plan.entry.palette.length, `dupes in ${theme}`);
    }
  });

  it("planTheme reports usedDefault and requestedTheme", () => {
    const p = planTheme("weird", "") as { usedDefault: boolean; requestedTheme: string; theme: FeedTheme };
    assert.equal(p.usedDefault, true);
    assert.equal(p.requestedTheme, "weird");
    assert.equal(p.theme, "minimal");
  });

  it("summary always carries the honesty line", () => {
    const r = runTool({ theme: "pastel", niche: "" });
    assert.match(r.values!.themeNote as string, /hand-curated guidance, not AI/);
  });
});
