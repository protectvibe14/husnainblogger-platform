import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, CHAR_BUDGET, MAX_NAMES } from "./logic.ts";

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("profile-name-seo-optimizer", () => {
  it("happy path: fitting keywords keep 100% coverage", () => {
    const v = okRun({ keywords: "fitness, coach, nutrition" });
    const names = v.optimizedNames as string[];
    assert.ok(names.length > 0);
    for (const n of names) assert.ok(n.length <= CHAR_BUDGET, n);
    assert.equal(v.keywordCoverage, 100);
  });

  it("returns exactly the meta output ids", () => {
    const v = okRun({ keywords: "fitness, coach" });
    assert.deepEqual(Object.keys(v).sort(), [
      "charBudgetBar",
      "keywordCoverage",
      "note",
      "optimizedNames",
    ]);
  });

  it("recommended name is the first name and the bar matches it", () => {
    const v = okRun({ keywords: "fitness, coach" });
    const names = v.optimizedNames as string[];
    const bar = v.charBudgetBar as string;
    assert.ok(bar.endsWith(` ${names[0].length}/${CHAR_BUDGET}`));
    // bar body is exactly CHAR_BUDGET block characters
    const body = bar.split(" ")[0];
    assert.equal([...body].length, CHAR_BUDGET);
  });

  it("too many keywords: priority-ranked truncation with a note", () => {
    const v = okRun({
      keywords: "fitness coaching, weight loss, meal plans, online training, hiit workouts",
    });
    const names = v.optimizedNames as string[];
    for (const n of names) assert.ok(n.length <= CHAR_BUDGET, n);
    const note = v.note as string;
    assert.match(note, /dropped to fit/i);
    assert.ok(note.includes("hiit workouts")); // lowest priority dropped first
    assert.ok((v.keywordCoverage as number) < 100);
  });

  it("first (highest-priority) keyword is always kept", () => {
    const v = okRun({ keywords: "fitness, weight loss, meal plans, online training, yoga" });
    const names = v.optimizedNames as string[];
    assert.ok(names[0].toLowerCase().includes("fitness"));
  });

  it("a single keyword longer than the budget is hard-cut at 30 chars", () => {
    const v = okRun({ keywords: "a".repeat(40) });
    const names = v.optimizedNames as string[];
    assert.equal(names[0].length, CHAR_BUDGET);
    assert.match(v.note as string, /cut at the budget/i);
  });

  it("keywords split on commas, newlines and semicolons", () => {
    const v = okRun({ keywords: "hiit, yoga\nabs;core" });
    assert.equal(v.keywordCoverage, 100);
    const recommended = (v.optimizedNames as string[])[0].toLowerCase();
    for (const kw of ["hiit", "yoga", "abs", "core"]) assert.ok(recommended.includes(kw));
  });

  it("keywords are deduplicated case-insensitively", () => {
    const v = okRun({ keywords: "fitness, Fitness, FITNESS, coach" });
    // 2 unique keywords: fitness, coach
    assert.equal(v.keywordCoverage, 100);
    const names = v.optimizedNames as string[];
    assert.ok(names[0].toLowerCase().includes("fitness"));
    assert.ok(names[0].toLowerCase().includes("coach"));
  });

  it("current name produces name+keyword combos", () => {
    const v = okRun({ keywords: "fitness, coach", name: "Alex" });
    const names = v.optimizedNames as string[];
    assert.ok(names.some((n) => n.toLowerCase().includes("alex")));
  });

  it("current name alone is optional", () => {
    const v = okRun({ keywords: "fitness" });
    assert.ok((v.optimizedNames as string[]).length > 0);
  });

  it("empty current name behaves like no name", () => {
    const a = JSON.stringify(runTool({ keywords: "fitness, coach" }));
    const b = JSON.stringify(runTool({ keywords: "fitness, coach", name: "   " }));
    assert.equal(a, b);
  });

  it("non-string current name fails", () => {
    const r = runTool({ keywords: "fitness", name: 42 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Current name must be text/);
  });

  it("missing keywords fails", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Keywords are required/);
  });

  it("whitespace-only keywords fail", () => {
    const r = runTool({ keywords: "  \n, ; " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Keywords are required/);
  });

  it("never returns more than MAX_NAMES names", () => {
    const v = okRun({
      keywords: "fitness, coach, nutrition, yoga, running, cycling, swimming, hiking, boxing, pilates",
      name: "Alex Rivera",
    });
    assert.ok((v.optimizedNames as string[]).length <= MAX_NAMES);
  });

  it("a keyword of exactly 30 chars fits without a cut note", () => {
    const kw = "b".repeat(30);
    const v = okRun({ keywords: kw });
    const names = v.optimizedNames as string[];
    assert.ok(names.includes(kw));
    assert.match(v.note as string, /all keywords fit/i);
  });

  it("note is always present and non-empty", () => {
    const v = okRun({ keywords: "fitness" });
    assert.ok(typeof v.note === "string" && (v.note as string).length > 0);
  });

  it("deterministic: same inputs give identical outputs", () => {
    const args = { keywords: "fitness, coach, nutrition, yoga", name: "Alex" };
    assert.equal(JSON.stringify(runTool(args)), JSON.stringify(runTool(args)));
  });
});
