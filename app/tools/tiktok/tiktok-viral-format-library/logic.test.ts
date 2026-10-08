import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  FORMAT_CATEGORIES,
  FORMAT_LIBRARY,
  LIBRARY_SIZE,
  MAX_NICHE_LENGTH,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["formats"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values;
}

type Table = { columns: string[]; rows: string[][] };

describe("tiktok-viral-format-library", () => {
  it("happy path: tutorial category -> 6-row table", () => {
    const v = okValues({ niche: "skincare", formatCategory: "tutorial" });
    const t = v.formats as Table;
    assert.deepEqual(t.columns, ["Format", "Setup", "Beats", "When to use"]);
    assert.equal(t.rows.length, 6);
    for (const row of t.rows) {
      assert.equal(row.length, 4);
      assert.ok(row.every((c) => c.length > 0), "no empty cells");
      assert.ok(row.every((c) => !c.includes("[NICHE]")), "niche slot filled");
    }
  });

  it("all 5 categories return 6 entries each", () => {
    for (const cat of FORMAT_CATEGORIES) {
      const v = okValues({ niche: "fitness", formatCategory: cat });
      assert.equal((v.formats as Table).rows.length, 6, `category ${cat}`);
    }
  });

  it("library has exactly 30 entries", () => {
    let total = 0;
    for (const cat of FORMAT_CATEGORIES) total += FORMAT_LIBRARY[cat].length;
    assert.equal(total, LIBRARY_SIZE);
    assert.equal(LIBRARY_SIZE, 30);
  });

  it("niche is substituted into names, setups, beats, and usage", () => {
    const v = okValues({ niche: "real estate", formatCategory: "story" });
    const t = v.formats as Table;
    assert.ok(t.rows.some((r) => r[0].toLowerCase().includes("real estate")), "niche in format names");
    assert.ok(t.rows.every((r) => r[1].toLowerCase().includes("real estate")), "niche in setups");
  });

  it("determinism: same inputs -> identical table", () => {
    const input = { niche: "cooking", formatCategory: "challenge" };
    assert.deepEqual(runTool(input).values, runTool(input).values);
  });

  it("category is case-insensitive", () => {
    const v = okValues({ niche: "cooking", formatCategory: "Story" });
    assert.equal((v.formats as Table).rows.length, 6);
  });

  it("missing niche -> error", () => {
    const r = runTool({ formatCategory: "tutorial" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("empty niche -> error", () => {
    const r = runTool({ niche: "  ", formatCategory: "tutorial" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("niche too long -> error", () => {
    const r = runTool({ niche: "x".repeat(MAX_NICHE_LENGTH + 1), formatCategory: "tutorial" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /48/);
  });

  it("missing formatCategory -> error listing the 5 options", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /challenge, story, tutorial, trend-jack, series/);
  });

  it("unknown formatCategory -> error", () => {
    const r = runTool({ niche: "fitness", formatCategory: "vlog" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Unknown format category/);
  });

  it("edge case: no live-virality claims anywhere in output", () => {
    const v = okValues({ niche: "fitness", formatCategory: "trend-jack" });
    const blob = JSON.stringify(v).toLowerCase();
    assert.ok(!blob.includes("currently viral"), "no 'currently viral' claim");
    assert.ok(!blob.includes("trending right now"), "no 'right now' claim");
    assert.ok(!blob.includes("viral right now"), "no live virality claim");
  });

  it("different categories return different formats", () => {
    const a = JSON.stringify(okValues({ niche: "fitness", formatCategory: "challenge" }).formats);
    const b = JSON.stringify(okValues({ niche: "fitness", formatCategory: "series" }).formats);
    assert.notEqual(a, b);
  });

  it("every entry has name, setup, beats, whenToUse filled", () => {
    for (const cat of FORMAT_CATEGORIES) {
      for (const e of FORMAT_LIBRARY[cat]) {
        assert.ok(e.name.length > 0, `${cat} name`);
        assert.ok(e.setup.length > 0, `${cat} setup`);
        assert.ok(e.beats.length > 0, `${cat} beats`);
        assert.ok(e.whenToUse.length > 0, `${cat} whenToUse`);
      }
    }
  });

  it("format names are unique within the library", () => {
    const names = FORMAT_CATEGORIES.flatMap((c) => FORMAT_LIBRARY[c].map((e) => e.name.replace("[NICHE]", "x")));
    assert.equal(new Set(names).size, names.length, "no duplicate format names");
  });

  it("output ids match meta.ts outputs", () => {
    const ids = outputs.map((o) => o.id).sort();
    assert.deepEqual(ids, EXPECTED_OUTPUT_IDS.slice().sort());
  });
});
