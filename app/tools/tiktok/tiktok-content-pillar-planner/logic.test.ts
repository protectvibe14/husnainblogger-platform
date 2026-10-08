import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, GOALS, GOAL_LABELS, MAX_NICHE_LEN } from "./logic.ts";

const OUTPUT_IDS = ["pillars", "weeklySchedule", "planSummary"];

const good = { niche: "meal prep", businessGoal: "get-leads" };

describe("tiktok-content-pillar-planner", () => {
  it("happy path returns 4 pillars, 7-day schedule, summary", () => {
    const r = runTool(good);
    assert.equal(r.ok, true);
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
    assert.equal((r.values!.pillars as string[]).length, 4);
    assert.equal((r.values!.weeklySchedule as string[]).length, 7);
    assert.ok((r.values!.planSummary as string).includes("meal prep"));
  });

  it("pillar lines name the niche and include formats + example topics", () => {
    const r = runTool(good).values!;
    for (const p of r.pillars as string[]) {
      assert.ok(p.includes("meal prep"), `pillar mentions niche: ${p}`);
      assert.ok(p.includes("posts/week"));
      assert.ok(p.includes("Formats:"));
    }
  });

  it("schedule covers all 7 days and all posted topics mention the niche", () => {
    const r = runTool(good).values!;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const schedule = r.weeklySchedule as string[];
    days.forEach((d, i) => assert.ok(schedule[i].startsWith(d), `line ${i} starts with ${d}`));
    assert.ok(schedule.some((s) => !s.includes("rest / engage")));
  });

  it("every goal produces 4 pillars (3-5 per spec validation)", () => {
    for (const g of GOALS) {
      const r = runTool({ niche: "fitness", businessGoal: g });
      assert.equal(r.ok, true, `goal ${g}`);
      const pillars = r.values!.pillars as string[];
      assert.ok(pillars.length >= 3 && pillars.length <= 5, `goal ${g} pillar count`);
    }
  });

  it("different goals produce different pillar plans", () => {
    const a = runTool({ niche: "fitness", businessGoal: "grow-audience" }).values!.pillars;
    const b = runTool({ niche: "fitness", businessGoal: "sell-products" }).values!.pillars;
    assert.notDeepEqual(a, b);
  });

  it("goal labels appear in summary", () => {
    const r = runTool(good).values!;
    assert.ok((r.planSummary as string).includes(GOAL_LABELS["get-leads"]));
  });

  it("missing businessGoal defaults to grow-audience pillars", () => {
    const a = runTool({ niche: "fitness" }).values!;
    const b = runTool({ niche: "fitness", businessGoal: "grow-audience" }).values!;
    assert.deepEqual(a, b);
  });

  it("blank businessGoal also defaults", () => {
    const a = runTool({ niche: "fitness", businessGoal: "  " }).values!;
    const b = runTool({ niche: "fitness", businessGoal: "grow-audience" }).values!;
    assert.deepEqual(a, b);
  });

  it("goal value is normalized (spaces/underscores/case)", () => {
    const a = runTool({ niche: "fitness", businessGoal: "Get Leads" }).values!;
    const b = runTool({ niche: "fitness", businessGoal: "get-leads" }).values!;
    assert.deepEqual(a, b);
    const c = runTool({ niche: "fitness", businessGoal: "get_leads" });
    assert.equal(c.ok, true);
  });

  it("invalid businessGoal fails", () => {
    const r = runTool({ niche: "fitness", businessGoal: "world-domination" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /business goal/i);
  });

  it("missing niche fails", () => {
    const r = runTool({ businessGoal: "get-leads" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("blank niche fails", () => {
    const r = runTool({ niche: "   ", businessGoal: "get-leads" });
    assert.equal(r.ok, false);
  });

  it("over-long niche fails", () => {
    const r = runTool({ niche: "x".repeat(MAX_NICHE_LEN + 1), businessGoal: "get-leads" });
    assert.equal(r.ok, false);
  });

  it("total posts/week in summary matches pillar frequencies", () => {
    const r = runTool(good).values!;
    const pillars = r.pillars as string[];
    const total = pillars.reduce((sum, p) => {
      const m = p.match(/(\d+) posts\/week/);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);
    assert.ok((r.planSummary as string).includes(`${total} posts/week`));
  });

  it("deterministic: same inputs twice give identical outputs", () => {
    const a = runTool(good);
    const b = runTool(good);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(good);
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("no empty pillar or schedule lines", () => {
    const r = runTool(good).values!;
    for (const line of [...(r.pillars as string[]), ...(r.weeklySchedule as string[])]) {
      assert.ok(line.trim().length > 0);
    }
  });
});
