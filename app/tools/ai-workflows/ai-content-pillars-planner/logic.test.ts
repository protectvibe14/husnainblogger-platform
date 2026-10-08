import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FORMAT_BANK,
  SUBTOPIC_SLOTS_PER_PILLAR,
  MAX_NICHE_LENGTH,
  runTool,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("builds a grid for 3 pillars (18 rows)", () => {
    const res = runTool({ niche: "meal prep", pillarCount: 3 });
    assert.equal(res.ok, true);
    const grid = res.values!.pillarGrid as { columns: string[]; rows: string[][] };
    assert.deepEqual(grid.columns, ["Pillar", "Subtopic slot", "Suggested format"]);
    assert.equal(grid.rows.length, 3 * SUBTOPIC_SLOTS_PER_PILLAR);
  });

  it("builds a grid for 7 pillars (42 rows)", () => {
    const res = runTool({ niche: "meal prep", pillarCount: 7 });
    assert.equal(res.ok, true);
    assert.equal((res.values!.pillarGrid as { rows: string[][] }).rows.length, 42);
  });

  it("trims whitespace from the niche and uses it in slot labels", () => {
    const res = runTool({ niche: "  sourdough  ", pillarCount: 3 });
    assert.equal(res.ok, true);
    const rows = (res.values!.pillarGrid as { rows: string[][] }).rows;
    assert.ok(rows[0][1].includes("sourdough"));
  });

  it("accepts pillarCount as a numeric string", () => {
    const res = runTool({ niche: "fitness", pillarCount: "5" });
    assert.equal(res.ok, true);
    assert.equal((res.values!.pillarGrid as { rows: string[][] }).rows.length, 30);
  });

  it("pillar labels are numbered Pillar 1..N", () => {
    const res = runTool({ niche: "fitness", pillarCount: 4 });
    const rows = (res.values!.pillarGrid as { rows: string[][] }).rows;
    const labels = [...new Set(rows.map((r) => r[0]))];
    assert.deepEqual(labels, ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"]);
  });

  it("every suggested format comes from the fixed 8-format bank", () => {
    const res = runTool({ niche: "fitness", pillarCount: 7 });
    const rows = (res.values!.pillarGrid as { rows: string[][] }).rows;
    assert.equal(FORMAT_BANK.length, 8);
    for (const row of rows) {
      assert.ok(FORMAT_BANK.includes(row[2]), `unexpected format: ${row[2]}`);
    }
  });

  it("format suggestions rotate across slots (no single format dominates)", () => {
    const res = runTool({ niche: "fitness", pillarCount: 7 });
    const rows = (res.values!.pillarGrid as { rows: string[][] }).rows;
    const formats = rows.map((r) => r[2]);
    assert.equal(new Set(formats).size, FORMAT_BANK.length);
  });

  it("SUBTOPIC_SLOTS_PER_PILLAR is 6", () => {
    assert.equal(SUBTOPIC_SLOTS_PER_PILLAR, 6);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing niche", () => {
    const res = runTool({ pillarCount: 4 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects empty niche", () => {
    const res = runTool({ niche: "   ", pillarCount: 4 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects non-string niche", () => {
    const res = runTool({ niche: 42, pillarCount: 4 });
    assert.equal(res.ok, false);
  });

  it("rejects niche over the length limit", () => {
    const res = runTool({ niche: "x".repeat(MAX_NICHE_LENGTH + 1), pillarCount: 4 });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes(String(MAX_NICHE_LENGTH)));
  });

  it("rejects missing pillarCount", () => {
    const res = runTool({ niche: "fitness" });
    assert.equal(res.ok, false);
  });

  it("rejects pillarCount below 3", () => {
    const res = runTool({ niche: "fitness", pillarCount: 2 });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("3"));
  });

  it("rejects pillarCount above 7", () => {
    const res = runTool({ niche: "fitness", pillarCount: 8 });
    assert.equal(res.ok, false);
  });

  it("rejects fractional pillarCount", () => {
    const res = runTool({ niche: "fitness", pillarCount: 4.5 });
    assert.equal(res.ok, false);
  });

  it("rejects non-numeric pillarCount strings", () => {
    const res = runTool({ niche: "fitness", pillarCount: "four" });
    assert.equal(res.ok, false);
  });
});

describe("runTool — determinism and output contract", () => {
  it("same inputs -> identical outputs (deep equal)", () => {
    const a = runTool({ niche: "email marketing", pillarCount: 5 });
    const b = runTool({ niche: "email marketing", pillarCount: 5 });
    assert.deepEqual(a, b);
  });

  it("returns exactly one output key: pillarGrid (matches meta.ts outputs)", () => {
    const res = runTool({ niche: "email marketing", pillarCount: 5 });
    assert.deepEqual(Object.keys(res.values!).sort(), ["pillarGrid"]);
  });
});
