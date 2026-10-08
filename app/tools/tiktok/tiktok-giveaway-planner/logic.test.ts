import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, ENTRY_METHOD_IDS, ENTRY_METHODS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = {
  prize: "a $50 skincare bundle",
  durationDays: 7,
  entryMethod: "Follow + comment",
};

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-giveaway-planner", () => {
  it("happy path: rules + timeline + scripts + legal reminder, output ids match meta", () => {
    const v = okValues();
    assert.equal(typeof v.planRules, "string");
    assert.ok(Array.isArray(v.timeline));
    assert.equal(typeof v.scripts, "string");
    assert.equal(typeof v.legalReminder, "string");
    assert.deepEqual(
      Object.keys(v).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("rules contain prize, duration, mechanics, no-purchase-necessary, TikTok disclaimer", () => {
    const rules = okValues().planRules as string;
    assert.ok(rules.includes("a $50 skincare bundle"), "mentions prize");
    assert.ok(rules.includes("7 days"), "mentions duration");
    assert.ok(rules.includes("Follow your account"), "entry mechanics");
    assert.ok(rules.includes("No purchase necessary"), "no-purchase clause");
    assert.ok(rules.includes("not sponsored, endorsed, or run by TikTok"), "platform disclaimer");
    assert.ok(rules.includes("[DATE, TIME, TIMEZONE]"), "bracketed placeholder to fill");
  });

  it("timeline for 7 days: launch, midpoint, final push, selection, announcement", () => {
    const tl = okValues().timeline as string[];
    assert.equal(tl.length, 5);
    assert.match(tl[0], /Day 1 — Launch/);
    assert.match(tl[1], /Day 4 — Midpoint/);
    assert.match(tl[2], /Day 7 — Final 24 hours/);
    assert.match(tl[3], /Day 8 — Winner selection/);
    assert.match(tl[4], /Day 9 — Winner announcement/);
  });

  it("timeline for 1 day: launch, close, selection, announcement (no midpoint)", () => {
    const tl = okValues({ durationDays: 1 }).timeline as string[];
    assert.equal(tl.length, 4);
    assert.match(tl[0], /Day 1 — Launch/);
    assert.match(tl[1], /Entries close/);
    assert.match(tl[2], /Day 2 — Winner selection/);
    assert.match(tl[3], /Day 3 — Winner announcement/);
  });

  it("timeline for 30 days works and stays ordered", () => {
    const tl = okValues({ durationDays: 30 }).timeline as string[];
    assert.equal(tl.length, 5);
    assert.match(tl[3], /Day 31 — Winner selection/);
    assert.match(tl[4], /Day 32 — Winner announcement/);
  });

  it("scripts contain announcement + winner scripts with prize and placeholders", () => {
    const s = okValues().scripts as string;
    assert.ok(s.includes("ANNOUNCEMENT VIDEO SCRIPT"), "announcement script");
    assert.ok(s.includes("WINNER ANNOUNCEMENT SCRIPT"), "winner script");
    assert.ok(s.includes("a $50 skincare bundle"), "mentions prize");
    assert.ok(s.includes("@[winner handle]"), "winner placeholder");
    assert.ok(s.includes("[number]"), "entry-count placeholder");
  });

  it("legal reminder always present: not legal advice + check local rules", () => {
    const r = okValues().legalReminder as string;
    assert.match(r, /Not legal advice/);
    assert.match(r, /differ by country/);
    assert.match(r, /never ask entrants for payment/);
  });

  it("every entry method produces its own mechanics", () => {
    const seen = new Set<string>();
    for (const m of ENTRY_METHOD_IDS) {
      const rules = okValues({ entryMethod: m }).planRules as string;
      seen.add(rules);
      assert.ok(rules.includes("How to enter:"), `mechanics for ${m}`);
    }
    assert.equal(seen.size, ENTRY_METHOD_IDS.length, "methods differ");
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(okValues(), okValues());
  });

  it("word banks: 5 entry methods, each with 3 mechanics + announcement line", () => {
    assert.equal(ENTRY_METHOD_IDS.length, 5);
    assert.deepEqual(Object.keys(ENTRY_METHODS).sort(), [...ENTRY_METHOD_IDS].sort());
    for (const id of ENTRY_METHOD_IDS) {
      const m = ENTRY_METHODS[id];
      assert.equal(m.mechanics.length, 3, `${id} has 3 mechanics`);
      assert.ok(m.announcementLine.length > 0, `${id} has announcement line`);
      for (const step of m.mechanics) assert.ok(step.length > 0, "no empty mechanic");
    }
  });

  it("accepts durationDays as a numeric string", () => {
    const v = okValues({ durationDays: "10" });
    assert.match(v.planRules as string, /10 days/);
  });

  it("errors on missing prize", () => {
    const r = runTool({ durationDays: 7, entryMethod: "Follow + comment" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /prize/i);
  });

  it("errors on blank prize", () => {
    const r = runTool({ prize: "  ", durationDays: 7, entryMethod: "Follow + comment" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /prize/i);
  });

  it("errors when prize exceeds 150 chars", () => {
    const r = runTool({ prize: "x".repeat(151), durationDays: 7, entryMethod: "Follow + comment" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /150/);
  });

  it("errors when durationDays is 0", () => {
    const r = runTool({ ...BASE, durationDays: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 30/);
  });

  it("errors when durationDays is 31", () => {
    const r = runTool({ ...BASE, durationDays: 31 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 30/);
  });

  it("errors when durationDays is not a whole number", () => {
    const r = runTool({ ...BASE, durationDays: 2.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("errors on missing entryMethod", () => {
    const r = runTool({ prize: "a mug", durationDays: 7 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /entry method/i);
  });

  it("errors on invalid entryMethod", () => {
    const r = runTool({ ...BASE, entryMethod: "Buy to enter" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /must be one of/);
  });
});
