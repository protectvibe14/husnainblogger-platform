import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  matchNiche,
  postingWeekdays,
  parsePlatforms,
  TOPIC_BANKS,
  GENERIC_BANK,
  FORMATS,
  CTAS,
  WEEKDAYS,
  PLAN_DAYS,
} from "./logic.ts";

const baseValues = {
  niche: "fitness",
  platforms: "blog, instagram",
  postsPerWeek: 3,
};

describe("30-day-content-plan-generator (tool-305)", () => {
  it("happy path: returns a 30-day table + topic bank label", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const plan = r.values?.plan;
    assert.deepEqual(plan?.columns, ["Day", "Weekday", "Topic", "Format", "CTA"]);
    assert.ok((plan?.rows.length ?? 0) > 0);
    for (const row of plan?.rows ?? []) assert.equal(row.length, 5);
    assert.ok((r.values?.topicBank ?? "").startsWith("fitness (12 topics)"));
  });

  it("word bank sizes are as documented (8x12 + 12 generic = 108)", () => {
    assert.equal(Object.keys(TOPIC_BANKS).length, 8);
    for (const [k, bank] of Object.entries(TOPIC_BANKS)) {
      assert.equal(bank.length, 12, `bank ${k} has ${bank.length} topics`);
    }
    assert.equal(GENERIC_BANK.length, 12);
    assert.equal(FORMATS.length, 6);
    assert.equal(CTAS.length, 6);
  });

  it("postsPerWeek=3 spreads across Mon/Wed/Sat", () => {
    assert.deepEqual(postingWeekdays(3), [0, 2, 5]);
  });

  it("postsPerWeek=7 posts every day (30 rows)", () => {
    const r = runTool({ ...baseValues, postsPerWeek: 7 });
    assert.ok(r.ok);
    assert.equal(r.values?.plan.rows.length, 30);
  });

  it("postsPerWeek=1 posts only Mondays", () => {
    const r = runTool({ ...baseValues, postsPerWeek: 1 });
    assert.ok(r.ok);
    for (const row of r.values?.plan.rows ?? []) {
      assert.equal(row[1], "Monday");
    }
  });

  it("topics rotate through the bank without repeats before cycling", () => {
    const r = runTool({ ...baseValues, postsPerWeek: 7 });
    const topics = (r.values?.plan.rows ?? []).slice(0, 12).map((row) => row[2]);
    assert.equal(new Set(topics).size, 12);
    const thirteenth = r.values?.plan.rows[12][2];
    assert.equal(thirteenth, topics[0]);
  });

  it("formats and CTAs rotate through their 6-item banks", () => {
    const r = runTool({ ...baseValues, postsPerWeek: 7 });
    const rows = r.values?.plan.rows ?? [];
    const formats = rows.slice(0, 6).map((row) => row[3]);
    assert.deepEqual(formats, [...FORMATS]);
    assert.equal(rows[6][3], FORMATS[0]);
    assert.equal(rows[6][4], CTAS[0]);
  });

  it("unknown niche falls back to generic bank and labels it", () => {
    const r = runTool({ ...baseValues, niche: "underwater basket weaving" });
    assert.ok(r.ok);
    assert.ok((r.values?.topicBank ?? "").startsWith("generic (12 topics)"));
    assert.ok((r.values?.topicBank ?? "").includes("fallback"));
    assert.ok(GENERIC_BANK.includes(r.values?.plan.rows[0][2] ?? ""));
  });

  it("niche aliases resolve (money -> finance)", () => {
    assert.equal(matchNiche("money"), "finance");
    assert.equal(matchNiche("Skincare"), "beauty");
    assert.equal(matchNiche("  FITNESS  "), "fitness");
    assert.equal(matchNiche("xyz"), null);
  });

  it("missing niche -> error", () => {
    const r = runTool({ ...baseValues, niche: "   " });
    assert.equal(r.ok, false);
    assert.equal(r.error, "Niche is required.");
  });

  it("no platforms -> error", () => {
    const r = runTool({ ...baseValues, platforms: " , ," });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("at least one platform"));
  });

  it("postsPerWeek 0 and 8 -> errors", () => {
    for (const n of [0, 8]) {
      const r = runTool({ ...baseValues, postsPerWeek: n });
      assert.equal(r.ok, false);
      assert.ok((r.error ?? "").includes("between 1 and 7"));
    }
  });

  it("non-integer postsPerWeek -> error", () => {
    const r = runTool({ ...baseValues, postsPerWeek: 2.5 });
    assert.equal(r.ok, false);
  });

  it("string postsPerWeek is accepted ('3' -> 3)", () => {
    const r = runTool({ ...baseValues, postsPerWeek: "3" });
    assert.ok(r.ok);
    assert.deepEqual(postingWeekdays(3), [0, 2, 5]);
  });

  it("deterministic: same input twice -> identical output", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("output keys are exactly 'plan' and 'topicBank' (match meta.ts)", () => {
    const r = runTool(baseValues);
    assert.ok(r.ok);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["plan", "topicBank"]);
  });

  it("parsePlatforms dedupes case-insensitively and caps count", () => {
    const ps = parsePlatforms("Blog, blog,  Instagram ,tiktok,x,linkedin,pinterest,extra");
    assert.deepEqual(ps, ["Blog", "Instagram", "tiktok", "x", "linkedin", "pinterest"]);
  });

  it("rows cover Day 1..Day 30 in order with correct weekdays", () => {
    const r = runTool({ ...baseValues, postsPerWeek: 7 });
    const rows = r.values?.plan.rows ?? [];
    assert.equal(rows[0][0], "Day 1");
    assert.equal(rows[0][1], "Monday");
    assert.equal(rows[6][0], "Day 7");
    assert.equal(rows[6][1], "Sunday");
    assert.equal(rows[7][0], "Day 8");
    assert.equal(rows[7][1], "Monday");
    assert.equal(rows[29][0], "Day 30");
  });

  it("bank topics contain no invented stats or prices", () => {
    const banned = /\$\d|\d+%|guaranteed/i;
    for (const bank of [...Object.values(TOPIC_BANKS), GENERIC_BANK]) {
      for (const t of bank) assert.ok(!banned.test(t), `banned content in: ${t}`);
    }
  });

  it("postingWeekdays never exceeds 7 unique days", () => {
    for (let n = 1; n <= 7; n++) {
      const d = postingWeekdays(n);
      assert.equal(new Set(d).size, d.length);
      assert.ok(d.every((x) => x >= 0 && x <= 6));
    }
  });
});
