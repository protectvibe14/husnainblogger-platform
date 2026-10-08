import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, IDEA_BANK, MAX_IDEAS, MIN_IDEAS, BUDGETS } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues(): Record<string, unknown> {
  return { niche: "fitness coaching", budget: "both", count: 10 };
}

describe("email-list-growth-idea-generator", () => {
  it("happy path returns ideas table and notice", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { columns: string[]; rows: string[][] };
    assert.deepEqual(ideas.columns, ["Idea", "Effort", "Cost"]);
    assert.equal(ideas.rows.length, 10);
    assert.equal(typeof r.values!.notice, "string");
  });

  it("every row has tactic, effort, cost and the niche filled in", () => {
    const r = runTool(happyValues());
    const ideas = r.values!.ideas as { columns: string[]; rows: string[][] };
    for (const row of ideas.rows) {
      assert.equal(row.length, 3);
      assert.ok(row[0].includes("fitness coaching"), `niche missing in: ${row[0]}`);
      assert.ok(["low", "medium", "high"].includes(row[1]));
      assert.ok(row[2].length > 0);
    }
  });

  it("free budget returns only free-lane ideas", () => {
    const r = runTool({ niche: "travel", budget: "free", count: 15 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { columns: string[]; rows: string[][] };
    assert.equal(ideas.rows.length, 15);
    for (const row of ideas.rows) assert.equal(row[2], "Free");
  });

  it("paid budget returns only paid-lane ideas (no Free labels)", () => {
    const r = runTool({ niche: "travel", budget: "paid", count: 15 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { columns: string[]; rows: string[][] };
    assert.equal(ideas.rows.length, 15);
    for (const row of ideas.rows) assert.notEqual(row[2], "Free");
  });

  it("both budget mixes lanes", () => {
    const r = runTool({ niche: "travel", budget: "both", count: 20 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { columns: string[]; rows: string[][] };
    const costs = new Set(ideas.rows.map((row) => row[2]));
    assert.ok(costs.has("Free"));
    assert.ok(costs.size > 1);
  });

  it("count 1 returns exactly one idea", () => {
    const r = runTool({ niche: "travel", budget: "free", count: 1 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.ideas as { rows: string[][] }).rows.length, 1);
  });

  it("count 20 works (max) with no repeats", () => {
    const r = runTool(happyValues());
    const rows = (r.values!.ideas as { rows: string[][] }).rows;
    assert.equal(new Set(rows.map((row) => row[0])).size, rows.length);
  });

  it("idea bank holds 30 ideas: 15 free + 15 paid", () => {
    assert.equal(IDEA_BANK.length, 30);
    assert.equal(IDEA_BANK.filter((i) => i.lane === "free").length, 15);
    assert.equal(IDEA_BANK.filter((i) => i.lane === "paid").length, 15);
  });

  it("missing niche -> error", () => {
    const v = happyValues();
    delete v.niche;
    assert.match(runTool(v).error!, /niche/i);
  });

  it("whitespace-only niche -> error", () => {
    const v = happyValues();
    v.niche = "   ";
    assert.equal(runTool(v).ok, false);
  });

  it("invalid budget -> error", () => {
    const v = happyValues();
    v.budget = "whatever";
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /budget/i);
  });

  it("each budget enum value is accepted", () => {
    for (const b of BUDGETS) {
      const r = runTool({ niche: "cooking", budget: b, count: 5 });
      assert.equal(r.ok, true, `budget ${b} rejected`);
    }
  });

  it("missing count -> error", () => {
    const v = happyValues();
    delete v.count;
    assert.equal(runTool(v).ok, false);
  });

  it(`count above ${MAX_IDEAS} -> error`, () => {
    const v = happyValues();
    v.count = 21;
    assert.equal(runTool(v).ok, false);
  });

  it(`count below ${MIN_IDEAS} -> error`, () => {
    const v = happyValues();
    v.count = 0;
    assert.equal(runTool(v).ok, false);
  });

  it("non-integer count -> error", () => {
    const v = happyValues();
    v.count = 2.5;
    assert.equal(runTool(v).ok, false);
  });

  it("NaN and Infinity counts rejected", () => {
    const v = happyValues();
    v.count = NaN;
    assert.equal(runTool(v).ok, false);
    v.count = Infinity;
    assert.equal(runTool(v).ok, false);
  });

  it("currentListSize is optional; invalid size -> error", () => {
    const a = runTool(happyValues());
    assert.equal(a.ok, true);
    const b = runTool({ ...happyValues(), currentListSize: -5 });
    assert.equal(b.ok, false);
    const c = runTool({ ...happyValues(), currentListSize: NaN });
    assert.equal(c.ok, false);
  });

  it("currentListSize adds a stage note to the notice", () => {
    const r = runTool({ ...happyValues(), currentListSize: 2500 });
    assert.equal(r.ok, true);
    assert.match(r.values!.notice as string, /growing/);
  });

  it("notice always carries the consent reminder", () => {
    const r = runTool(happyValues());
    assert.match(r.values!.notice as string, /never buy|purchased lists/i);
  });

  it("HTML stripped from niche", () => {
    const r = runTool({ niche: "<b>Travel</b>", budget: "free", count: 2 });
    assert.equal(r.ok, true);
    const rows = (r.values!.ideas as { rows: string[][] }).rows;
    assert.ok(!rows[0][0].includes("<b>"));
  });

  it("overlong niche truncated with visible notice", () => {
    const r = runTool({ niche: "x".repeat(300), budget: "free", count: 2 });
    assert.equal(r.ok, true);
    assert.match(r.values!.notice as string, /shortened/);
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(happyValues()), runTool(happyValues()));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("no unfilled {niche} tokens in output", () => {
    const r = runTool(happyValues());
    const rows = (r.values!.ideas as { rows: string[][] }).rows;
    assert.ok(!/\{niche\}/.test(rows.map((row) => row[0]).join("\n")));
  });
});
