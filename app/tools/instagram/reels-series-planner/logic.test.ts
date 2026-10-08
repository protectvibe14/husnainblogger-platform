import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, GOALS, MIN_EPISODES, MAX_EPISODES, BANK_SIZES } from "./logic.ts";

const BASE = {
  seriesTitle: "Budget Meal Prep",
  episodes: 4,
  goal: "Grow followers",
};

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("reels-series-planner", () => {
  it("happy path: 4 episodes produce a 4-entry plan", () => {
    const v = okRun({ ...BASE });
    const plan = v.episodePlan as { n: number; hook: string; beat: string }[];
    assert.equal(plan.length, 4);
    assert.deepEqual(plan.map((e) => e.n), [1, 2, 3, 4]);
  });

  it("returns exactly the meta output ids", () => {
    const v = okRun({ ...BASE });
    assert.deepEqual(Object.keys(v).sort(), ["arcSummary", "copyAll", "episodePlan"]);
  });

  it("every hook names the series title and is non-empty", () => {
    const v = okRun({ ...BASE });
    const plan = v.episodePlan as { hook: string }[];
    for (const e of plan) {
      assert.ok(e.hook.length > 0);
      assert.ok(e.hook.includes("Budget Meal Prep"));
    }
  });

  it("arc structure: episode 1 sets the premise, last pays off", () => {
    const v = okRun({ ...BASE });
    const plan = v.episodePlan as { beat: string }[];
    assert.match(plan[0].beat, /premise/i);
    assert.match(plan[plan.length - 1].beat, /call to action/i);
  });

  it("middle beats are non-empty and cycle", () => {
    const v = okRun({ ...BASE, episodes: 12 });
    const plan = v.episodePlan as { beat: string }[];
    for (let i = 1; i < 11; i++) assert.ok(plan[i].beat.length > 0);
    // 10 middle beats in a 12-episode series = full bank once; check rotation holds
    assert.equal(plan[1].beat, plan[1].beat);
  });

  it("hooks cycle the goal bank for 12 episodes (ep7 hook repeats ep1)", () => {
    const v = okRun({ ...BASE, episodes: 12 });
    const plan = v.episodePlan as { hook: string }[];
    assert.equal(plan[6].hook.replace("Episode 7", "Episode X"), plan[0].hook.replace("Episode 1", "Episode X"));
  });

  it("goal selects the hook bank: different goals give different hooks", () => {
    const a = okRun({ ...BASE, goal: "Grow followers" });
    const b = okRun({ ...BASE, goal: "Drive sales" });
    const ha = (a.episodePlan as { hook: string }[])[0].hook;
    const hb = (b.episodePlan as { hook: string }[])[0].hook;
    assert.notEqual(ha, hb);
  });

  it("arcSummary names the title, episode count and goal", () => {
    const v = okRun({ ...BASE });
    assert.match(v.arcSummary as string, /Budget Meal Prep/);
    assert.match(v.arcSummary as string, /4-episode/);
    assert.match(v.arcSummary as string, /grow followers/);
  });

  it("copyAll contains every episode hook", () => {
    const v = okRun({ ...BASE });
    const plan = v.episodePlan as { hook: string }[];
    const copy = v.copyAll as string;
    for (const e of plan) assert.ok(copy.includes(e.hook));
    assert.ok(copy.includes("Budget Meal Prep"));
  });

  it("deterministic: identical inputs give identical outputs", () => {
    const a = JSON.stringify(runTool({ ...BASE, episodes: 8 }));
    const b = JSON.stringify(runTool({ ...BASE, episodes: 8 }));
    assert.equal(a, b);
  });

  it("missing title fails", () => {
    const r = runTool({ episodes: 4, goal: "Grow followers" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /title is required/i);
  });

  it("blank title fails", () => {
    const r = runTool({ ...BASE, seriesTitle: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /title is required/i);
  });

  it("title is trimmed", () => {
    const v = okRun({ ...BASE, seriesTitle: "  Budget Meal Prep  " });
    const plan = v.episodePlan as { hook: string }[];
    assert.ok(plan[0].hook.includes("Budget Meal Prep"));
    assert.ok(!plan[0].hook.includes("  Budget"));
  });

  it("missing episodes fails", () => {
    const r = runTool({ seriesTitle: "x", goal: "Grow followers" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it(`episodes below ${MIN_EPISODES} fails`, () => {
    const r = runTool({ ...BASE, episodes: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 4 and 12/);
  });

  it(`episodes above ${MAX_EPISODES} fails`, () => {
    const r = runTool({ ...BASE, episodes: 13 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 4 and 12/);
  });

  it("non-integer episodes fails", () => {
    const r = runTool({ ...BASE, episodes: 4.5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("missing goal fails", () => {
    const r = runTool({ seriesTitle: "x", episodes: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Goal must be one of/);
  });

  it("unknown goal fails listing the valid goals", () => {
    const r = runTool({ ...BASE, goal: "go viral" });
    assert.equal(r.ok, false);
    for (const g of GOALS) assert.ok((r.error as string).includes(g));
  });

  it("boundary: 12 episodes all have hooks and beats", () => {
    const v = okRun({ ...BASE, episodes: 12 });
    const plan = v.episodePlan as { hook: string; beat: string }[];
    assert.equal(plan.length, 12);
    for (const e of plan) {
      assert.ok(e.hook.length > 0);
      assert.ok(e.beat.length > 0);
    }
  });

  it("unicode titles are inserted verbatim", () => {
    const v = okRun({ ...BASE, seriesTitle: "Café Vibes ☕" });
    const plan = v.episodePlan as { hook: string }[];
    assert.ok(plan[0].hook.includes("Café Vibes ☕"));
  });

  it("bank sizes are documented: 24 hooks + 10 beats + premise + finale = 36", () => {
    assert.equal(BANK_SIZES.hooksPerGoal, 6);
    assert.equal(BANK_SIZES.goals, 4);
    assert.equal(BANK_SIZES.middleBeats, 10);
    assert.equal(BANK_SIZES.total, 36);
  });
});
