import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, BANK_SIZES, ASSUMPTIONS } from "./logic.ts";

describe("story-poll-idea-generator", () => {
  it("happy path: returns polls table + copyAll + pollCount", () => {
    const r = runTool({ topic: "morning routines", count: 3 });
    assert.equal(r.ok, true);
    assert.ok(r.values);
    const table = r.values["polls"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Question", "Option A", "Option B"]);
    assert.equal(table.rows.length, 3);
    assert.equal(r.values["pollCount"], 3);
    assert.ok(typeof r.values["copyAll"] === "string");
    assert.ok((r.values["copyAll"] as string).includes("1."));
  });

  it("defaults to 5 polls when count is omitted", () => {
    const r = runTool({ topic: "skincare" });
    assert.equal(r.ok, true);
    const table = r.values!["polls"] as { rows: string[][] };
    assert.equal(table.rows.length, 5);
    assert.equal(r.values!["pollCount"], 5);
  });

  it("count accepts a numeric string", () => {
    const r = runTool({ topic: "skincare", count: "4" });
    assert.equal(r.ok, true);
    assert.equal(r.values!["pollCount"], 4);
  });

  it("topic is inserted into every question, no leftover placeholders", () => {
    const r = runTool({ topic: "home workouts", count: 10 });
    assert.equal(r.ok, true);
    const table = r.values!["polls"] as { rows: string[][] };
    for (const row of table.rows) {
      for (const cell of row) {
        assert.ok(!cell.includes("{topic}"), cell);
      }
      assert.ok(row[0].includes("home workouts"), row[0]);
    }
  });

  it("unicode topics are inserted verbatim", () => {
    const r = runTool({ topic: "café ☕ vibes", count: 2 });
    assert.equal(r.ok, true);
    const table = r.values!["polls"] as { rows: string[][] };
    assert.ok(table.rows[0][0].includes("café ☕ vibes"));
  });

  it("topic is trimmed", () => {
    const r = runTool({ topic: "  fitness  ", count: 1 });
    assert.equal(r.ok, true);
    const table = r.values!["polls"] as { rows: string[][] };
    assert.ok(!table.rows[0][0].startsWith(" "));
    assert.ok(table.rows[0][0].includes("fitness"));
  });

  it("errors on missing topic", () => {
    const r = runTool({ count: 3 });
    assert.equal(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("errors on empty topic", () => {
    const r = runTool({ topic: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("topic"));
  });

  it("errors on non-string topic", () => {
    const r = runTool({ topic: 42 });
    assert.equal(r.ok, false);
  });

  it("errors when count is 0", () => {
    const r = runTool({ topic: "x", count: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("1") && r.error!.includes("10"));
  });

  it("errors when count exceeds 10", () => {
    const r = runTool({ topic: "x", count: 11 });
    assert.equal(r.ok, false);
  });

  it("errors on non-integer count", () => {
    const r = runTool({ topic: "x", count: 2.5 });
    assert.equal(r.ok, false);
  });

  it("errors on non-numeric count string", () => {
    const r = runTool({ topic: "x", count: "many" });
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs give identical output", () => {
    const a = runTool({ topic: "meal prep", count: 7 });
    const b = runTool({ topic: "meal prep", count: 7 });
    assert.deepEqual(a, b);
  });

  it("count=10 never repeats a template (bank has 12)", () => {
    const r = runTool({ topic: "x", count: 10 });
    assert.equal(r.ok, true);
    const table = r.values!["polls"] as { rows: string[][] };
    const questions = table.rows.map((row) => row[0]);
    assert.equal(new Set(questions).size, 10);
  });

  it("bank sizes are documented and consistent", () => {
    assert.equal(BANK_SIZES.pollTemplates, 12);
    assert.equal(BANK_SIZES.minCount, 1);
    assert.equal(BANK_SIZES.maxCount, 10);
    assert.ok(BANK_SIZES.pollTemplates >= BANK_SIZES.maxCount);
  });

  it("assumptions are non-empty honest strings", () => {
    assert.ok(ASSUMPTIONS.length >= 1);
    for (const a of ASSUMPTIONS) assert.ok(a.length > 10);
    assert.ok(ASSUMPTIONS.some((a) => a.toLowerCase().includes("not ai")));
  });

  it("copyAll contains every poll question", () => {
    const r = runTool({ topic: "yoga", count: 4 });
    assert.equal(r.ok, true);
    const table = r.values!["polls"] as { rows: string[][] };
    const copy = r.values!["copyAll"] as string;
    for (const row of table.rows) assert.ok(copy.includes(row[0]));
  });

  it("output ids are the contract ids: polls, copyAll, pollCount", () => {
    const r = runTool({ topic: "x", count: 2 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "pollCount", "polls"]);
  });
});
