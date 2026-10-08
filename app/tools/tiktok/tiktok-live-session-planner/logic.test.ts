import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { liveTopic: "beginner budgeting", durationMin: 60, sessionMode: "solo" };

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

function show(v: Record<string, unknown>) {
  return v.runOfShow as { columns: string[]; rows: string[][] };
}

function totalMinutes(v: Record<string, unknown>): number {
  let sum = 0;
  for (const row of show(v).rows) {
    const m = row[0].match(/(\d+)–(\d+) min/);
    assert.ok(m, `row time parses: ${row[0]}`);
    sum += Number(m![2]) - Number(m![1]);
  }
  return sum;
}

describe("tiktok-live-session-planner", () => {
  it("happy path: 60-min solo plan with table, prompts, gift goals, CTA, eligibility", () => {
    const v = okValues();
    const t = show(v);
    assert.deepEqual(t.columns, ["Time", "Segment", "What to do"]);
    assert.ok(t.rows.length >= 6, `has enough rows (${t.rows.length})`);
    assert.equal((v.engagementPrompts as string[]).length, 4);
    assert.equal((v.giftGoalMoments as string[]).length, 3);
    assert.ok((v.closingCta as string).includes("beginner budgeting"));
    assert.match(v.eligibilityNote as string, /1,000 followers/);
  });

  it("run-of-show minutes sum exactly to the duration", () => {
    for (const d of [5, 15, 45, 60, 120, 240]) {
      const v = okValues({ durationMin: d });
      assert.equal(totalMinutes(v), d, `sums to ${d}`);
      const rows = show(v).rows;
      assert.ok(rows[0][0].startsWith("0–"), "starts at 0");
      assert.ok(rows[rows.length - 1][0].endsWith(`${d} min`), `ends at ${d}`);
    }
  });

  it("first row is cold open, last row is close", () => {
    const rows = show(okValues()).rows;
    assert.match(rows[0][1], /Cold open/i);
    assert.match(rows[rows.length - 1][1], /Close/i);
  });

  it("co-host mode adds a co-host introduction row; solo does not", () => {
    const co = show(okValues({ sessionMode: "co-host" })).rows.map((r) => r[1]);
    assert.ok(co.some((s) => /Co-host introduction/i.test(s)), "co-host intro present");
    const solo = show(okValues({ sessionMode: "solo" })).rows.map((r) => r[1]);
    assert.ok(!solo.some((s) => /Co-host introduction/i.test(s)), "no co-host intro for solo");
  });

  it("gift-goal push row appears for 30+ min sessions, not for short ones", () => {
    const long = show(okValues({ durationMin: 60 })).rows.map((r) => r[1]);
    assert.ok(long.some((s) => /Gift goal push/i.test(s)));
    const short = show(okValues({ durationMin: 20 })).rows.map((r) => r[1]);
    assert.ok(!short.some((s) => /Gift goal push/i.test(s)));
  });

  it("below 1000 followers shows the eligibility heads-up", () => {
    const v = okValues({ followerCount: 500 });
    assert.match(v.eligibilityNote as string, /500 followers/);
    assert.match(v.eligibilityNote as string, /may not be able to go live/i);
  });

  it("1000+ followers shows the generic verify-in-app note", () => {
    const v = okValues({ followerCount: 5000 });
    assert.match(v.eligibilityNote as string, /verify.*TikTok app/i);
    assert.ok(!(v.eligibilityNote as string).includes("may not be able to go live"));
  });

  it("follower count is optional", () => {
    const v = okValues({});
    assert.ok((v.eligibilityNote as string).length > 0);
  });

  it("works without niche (falls back to 'your niche' copy)", () => {
    const v = okValues({ niche: undefined, sessionMode: "co-host" });
    assert.ok(show(v).rows.some((r) => r[2].includes("your niche")));
  });

  it("engagement prompts are non-empty and mostly mention the topic", () => {
    const v = okValues();
    const prompts = v.engagementPrompts as string[];
    assert.equal(prompts.length, 4);
    for (const p of prompts) {
      assert.ok(p.trim().length > 20, `prompt substantive: ${p}`);
    }
    // one generic welcome prompt is intentional; the rest reference the topic
    const topical = prompts.filter((p) => p.includes("beginner budgeting")).length;
    assert.ok(topical >= 3, `${topical}/4 prompts mention the topic`);
  });

  it("gift goals carry escalating sample targets", () => {
    const v = okValues({ durationMin: 60 });
    const targets = (v.giftGoalMoments as string[]).map((g) => Number(g.match(/hit (\d+) gifts/)![1]));
    assert.deepEqual(targets, [12, 24, 36]);
    assert.ok(targets[0] < targets[1] && targets[1] < targets[2]);
  });

  it("no unfilled {topic} placeholders anywhere", () => {
    const v = okValues({ niche: "money tips", sessionMode: "co-host" });
    const all = [
      ...show(v).rows.flat(),
      ...(v.engagementPrompts as string[]),
      ...(v.giftGoalMoments as string[]),
      v.closingCta as string,
    ];
    for (const s of all) assert.ok(!s.includes("{topic}"), `no placeholder: ${s}`);
  });

  it("errors on missing liveTopic", () => {
    const r = runTool({ durationMin: 60, sessionMode: "solo" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic/i);
  });

  it("errors on liveTopic over 80 chars", () => {
    const r = runTool({ ...BASE, liveTopic: "x".repeat(81) });
    assert.equal(r.ok, false);
  });

  it("errors on niche over 60 chars", () => {
    const r = runTool({ ...BASE, niche: "y".repeat(61) });
    assert.equal(r.ok, false);
  });

  it("errors on duration below 5", () => {
    const r = runTool({ ...BASE, durationMin: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /5 and 240/);
  });

  it("errors on duration above 240", () => {
    const r = runTool({ ...BASE, durationMin: 241 });
    assert.equal(r.ok, false);
  });

  it("errors on non-integer duration", () => {
    const r = runTool({ ...BASE, durationMin: 30.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("errors on non-numeric duration", () => {
    const r = runTool({ ...BASE, durationMin: "one hour" });
    assert.equal(r.ok, false);
  });

  it("errors on missing duration", () => {
    const r = runTool({ liveTopic: "x", sessionMode: "solo" });
    assert.equal(r.ok, false);
  });

  it("errors on invalid sessionMode", () => {
    const r = runTool({ ...BASE, sessionMode: "guest" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /solo or co-host/);
  });

  it("errors on negative or fractional follower count", () => {
    assert.equal(runTool({ ...BASE, followerCount: -1 }).ok, false);
    assert.equal(runTool({ ...BASE, followerCount: 999.5 }).ok, false);
  });

  it("deterministic: same inputs twice -> identical output", () => {
    const a = runTool({ ...BASE, niche: "money", followerCount: 800 });
    const b = runTool({ liveTopic: "beginner budgeting", durationMin: 60, sessionMode: "solo", niche: "money", followerCount: 800 });
    assert.deepEqual(a, b);
  });

  it("different durations -> different run-of-show", () => {
    const a = JSON.stringify(show(okValues({ durationMin: 30 })).rows);
    const b = JSON.stringify(show(okValues({ durationMin: 90 })).rows);
    assert.notEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ followerCount: 1200 });
    assert.deepEqual(Object.keys(v).sort(), outputs.map((o) => o.id).sort());
  });

  it("error results carry no values", () => {
    const r = runTool({ liveTopic: "", durationMin: 999, sessionMode: "x" });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});
