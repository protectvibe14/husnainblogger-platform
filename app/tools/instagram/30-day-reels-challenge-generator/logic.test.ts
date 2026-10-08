/**
 * Tests for the 30-Day Reels Challenge Generator.
 * Run: node --test app/tools/instagram/30-day-reels-challenge-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, FORMATS, CHALLENGE_DAYS } from "./logic.ts";

const GOOD = { pillars: "Hooks\nTutorials\nBehind the scenes", niche: "skincare" };

interface Table {
  columns: string[];
  rows: string[][];
}

describe("30-day-reels-challenge-generator", () => {
  it("happy path: returns ok with calendar table and exportCSV", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["calendar", "exportCSV"]);
    const t = r.values!.calendar as Table;
    assert.deepEqual(t.columns, ["Day", "Pillar", "Prompt", "Format"]);
    assert.equal(t.rows.length, CHALLENGE_DAYS);
  });

  it("day numbers run 1..30", () => {
    const rows = (runTool(GOOD).values!.calendar as Table).rows;
    assert.deepEqual(rows.map((r) => r[0]), Array.from({ length: 30 }, (_, i) => String(i + 1)));
  });

  it("pillars rotate in fixed order: 1,2,3,1,2,3,...", () => {
    const rows = (runTool(GOOD).values!.calendar as Table).rows;
    const seq = rows.map((r) => r[1]);
    assert.deepEqual(seq.slice(0, 6), ["Hooks", "Tutorials", "Behind the scenes", "Hooks", "Tutorials", "Behind the scenes"]);
  });

  it("all 30 prompts are unique (no repeats in a calendar)", () => {
    const rows = (runTool(GOOD).values!.calendar as Table).rows;
    const prompts = rows.map((r) => r[2]);
    assert.equal(new Set(prompts).size, 30);
  });

  it("niche and pillar are filled; no raw placeholders remain", () => {
    const rows = (runTool(GOOD).values!.calendar as Table).rows;
    for (const r of rows) {
      assert.ok(r[2].includes("skincare"), "niche filled");
      assert.ok(!r[2].includes("{{niche}}") && !r[2].includes("{{pillar}}"), "no raw placeholders");
    }
  });

  it("formats cycle through all 6 formats evenly (5 days each)", () => {
    const rows = (runTool(GOOD).values!.calendar as Table).rows;
    for (const f of FORMATS) {
      assert.equal(rows.filter((r) => r[3] === f).length, 5, f);
    }
    assert.equal(rows[0][3], FORMATS[0]);
  });

  it("accepts comma-separated pillars and trims whitespace", () => {
    const r = runTool({ pillars: "  Hooks , Tutorials , Behind the scenes  ", niche: "skincare" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.calendar as Table).rows[0][1], "Hooks");
  });

  it("accepts 4 and 5 pillars", () => {
    assert.equal(runTool({ pillars: "A\nB\nC\nD", niche: "x" }).ok, true);
    assert.equal(runTool({ pillars: "A\nB\nC\nD\nE", niche: "x" }).ok, true);
  });

  it("2 pillars -> error; 6 pillars -> error", () => {
    for (const pillars of ["A\nB", "A\nB\nC\nD\nE\nF"]) {
      const r = runTool({ pillars, niche: "x" });
      assert.equal(r.ok, false, pillars);
      assert.ok(/pillar/i.test(r.error!), pillars);
    }
  });

  it("empty / missing pillars -> error", () => {
    assert.equal(runTool({ niche: "x" }).ok, false);
    assert.equal(runTool({ pillars: "  \n , ", niche: "x" }).ok, false);
  });

  it("duplicate pillars (case-insensitive) -> error", () => {
    const r = runTool({ pillars: "Hooks\nhooks\nTutorials", niche: "x" });
    assert.equal(r.ok, false);
    assert.ok(/duplicate/i.test(r.error!));
  });

  it("pillar over 60 chars -> error", () => {
    assert.equal(runTool({ pillars: `${"P".repeat(61)}\nB\nC`, niche: "x" }).ok, false);
  });

  it("missing niche -> error; niche over 60 chars -> error", () => {
    assert.equal(runTool({ pillars: "A\nB\nC" }).ok, false);
    const r = runTool({ pillars: "A\nB\nC", niche: "  " });
    assert.equal(r.ok, false);
    assert.ok(/niche/i.test(r.error!));
    assert.equal(runTool({ pillars: "A\nB\nC", niche: "N".repeat(61) }).ok, false);
  });

  it("exportCSV is valid CSV: header + 30 quoted rows, 4 columns each", () => {
    const csv = runTool(GOOD).values!.exportCSV as string;
    const lines = csv.split("\n");
    assert.equal(lines.length, 31);
    assert.equal(lines[0], "Day,Pillar,Prompt,Format");
    for (let i = 1; i < lines.length; i++) {
      assert.ok(lines[i].startsWith(`"${i}",`), `row ${i} starts with quoted day`);
      assert.ok((lines[i].match(/","/g) || []).length === 3, `row ${i} has 4 columns`);
    }
  });

  it("exportCSV escapes quotes inside prompts", () => {
    const csv = runTool({ pillars: "A\nB\nC", niche: 'fit "mom" life' }).values!.exportCSV as string;
    assert.ok(csv.includes('fit ""mom"" life'));
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
  });

  it("different niches give different prompts", () => {
    const a = runTool(GOOD).values!.calendar;
    const b = runTool({ ...GOOD, niche: "fitness" }).values!.calendar;
    assert.notDeepEqual(a, b);
  });
});
