import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  mapFunnel,
  STAGE_MAPS,
  EMAIL_PURPOSES,
  FUNNEL_GOALS,
  MIN_STAGES,
  MAX_STAGES,
  MIN_EMAILS_PER_STAGE,
  MAX_EMAILS_PER_STAGE,
  STAGE_GAP_DAYS,
  EMAILS_GAP_DAYS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = { funnelGoal: "welcome", stageCount: 4, emailsPerStage: 2 };

describe("email-funnel-mapper (tool-435)", () => {
  it("happy path: funnelMap has stageCount stages with emailsPerStage emails each", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const map = r.values!.funnelMap as Record<string, unknown>[];
    assert.equal(map.length, 4);
    for (const s of map) {
      assert.deepEqual(Object.keys(s).sort(), ["emails", "goal", "stage", "trigger"]);
      assert.equal((s.emails as unknown[]).length, 2);
      for (const e of s.emails as Record<string, unknown>[]) {
        assert.deepEqual(Object.keys(e).sort(), ["dayOffset", "purpose"]);
        assert.equal(typeof e.purpose, "string");
        assert.ok((e.purpose as string).length > 0);
        assert.ok(typeof e.dayOffset === "number" && e.dayOffset >= 0);
      }
    }
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    const outIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(r.values!).sort(), outIds);
  });

  it("fixed data: 4 goals, each with 7 stages and 7 purposes", () => {
    assert.equal(FUNNEL_GOALS.length, 4);
    for (const g of FUNNEL_GOALS) {
      assert.equal(STAGE_MAPS[g].length, 7, `goal ${g} must have 7 stages`);
      assert.equal(EMAIL_PURPOSES[g].length, 7, `goal ${g} must have 7 purposes`);
    }
  });

  it("summaryText describes stages, email count, and timing as estimates", () => {
    const r = runTool(base);
    const summary = r.values!.summaryText as string;
    assert.ok(summary.includes("4 stages"));
    assert.ok(summary.includes("8 emails"));
    assert.ok(summary.includes("welcome"));
    assert.ok(summary.toLowerCase().includes("estimate") || summary.toLowerCase().includes("suggestion"));
  });

  it("day offsets follow the fixed scheduling formula", () => {
    const r = runTool({ funnelGoal: "sales", stageCount: 3, emailsPerStage: 3 });
    const map = r.values!.funnelMap as { emails: { dayOffset: number }[] }[];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        assert.equal(map[i].emails[j].dayOffset, i * STAGE_GAP_DAYS + j * EMAILS_GAP_DAYS);
      }
    }
  });

  it("stage specs are taken in order from the fixed goal map", () => {
    const r = runTool({ funnelGoal: "winback", stageCount: 3, emailsPerStage: 1 });
    const map = r.values!.funnelMap as { stage: string; trigger: string; goal: string }[];
    assert.equal(map[0].stage, STAGE_MAPS.winback[0].stage);
    assert.equal(map[1].trigger, STAGE_MAPS.winback[1].trigger);
    assert.equal(map[2].goal, STAGE_MAPS.winback[2].goal);
  });

  it("each goal's map is distinct (welcome != sales)", () => {
    const w = mapFunnel("welcome", 4, 1).funnelMap.map((s) => s.stage).join("|");
    const s = mapFunnel("sales", 4, 1).funnelMap.map((st) => st.stage).join("|");
    assert.notEqual(w, s);
  });

  it("clamping: stageCount 2 -> 3, 9 -> 7; emailsPerStage 0 -> 1, 9 -> 5", () => {
    const low = runTool({ funnelGoal: "nurture", stageCount: 2, emailsPerStage: 0 });
    assert.equal((low.values!.funnelMap as unknown[]).length, MIN_STAGES);
    assert.equal(((low.values!.funnelMap as { emails: unknown[] }[])[0].emails).length, MIN_EMAILS_PER_STAGE);
    const high = runTool({ funnelGoal: "nurture", stageCount: 9, emailsPerStage: 9 });
    assert.equal((high.values!.funnelMap as unknown[]).length, MAX_STAGES);
    assert.equal(((high.values!.funnelMap as { emails: unknown[] }[])[0].emails).length, MAX_EMAILS_PER_STAGE);
  });

  it("fractional counts are floored", () => {
    const r = runTool({ funnelGoal: "welcome", stageCount: 4.9, emailsPerStage: 2.2 });
    assert.equal((r.values!.funnelMap as unknown[]).length, 4);
    assert.equal(((r.values!.funnelMap as { emails: unknown[] }[])[0].emails).length, 2);
  });

  it("validation: bad funnelGoal -> error", () => {
    const r = runTool({ funnelGoal: "reactivation", stageCount: 4, emailsPerStage: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("welcome"));
  });

  it("validation: NaN/Infinity stageCount -> error", () => {
    assert.equal(runTool({ funnelGoal: "welcome", stageCount: NaN, emailsPerStage: 2 }).ok, false);
    assert.equal(runTool({ funnelGoal: "welcome", stageCount: Infinity, emailsPerStage: 2 }).ok, false);
  });

  it("validation: non-numeric emailsPerStage -> error", () => {
    const r = runTool({ funnelGoal: "welcome", stageCount: 4, emailsPerStage: "two" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("emails per stage"));
  });

  it("validation: missing funnelGoal -> error", () => {
    const r = runTool({ stageCount: 4, emailsPerStage: 2 });
    assert.equal(r.ok, false);
  });

  it("determinism: same inputs -> identical funnel map", () => {
    assert.deepEqual(runTool(base), runTool(base));
    assert.deepEqual(mapFunnel("sales", 5, 2), mapFunnel("sales", 5, 2));
  });

  it("mapFunnel throws on invalid goal", () => {
    assert.throws(() => mapFunnel("bogus", 4, 2), RangeError);
    assert.throws(() => mapFunnel("welcome", NaN, 2), RangeError);
    assert.throws(() => mapFunnel("welcome", 4, NaN), RangeError);
  });

  it("edge: maximum config (7 stages x 5 emails) produces 35 emails total", () => {
    const r = runTool({ funnelGoal: "nurture", stageCount: 7, emailsPerStage: 5 });
    assert.equal(r.ok, true);
    const map = r.values!.funnelMap as { emails: unknown[] }[];
    const total = map.reduce((n, s) => n + s.emails.length, 0);
    assert.equal(total, 35);
    assert.ok((r.values!.summaryText as string).includes("35 emails"));
  });
});
