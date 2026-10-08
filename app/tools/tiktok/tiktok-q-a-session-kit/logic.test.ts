import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { niche: "vegan baking", sessionType: "live" };
const OUTPUT_IDS = ["questionBank", "runOfShow", "callToAction", "eligibilityNote"];

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-q-a-session-kit", () => {
  it("happy path: live kit returns bank, 4-phase run-of-show, CTA, eligibility note", () => {
    const v = okValues();
    const bank = v.questionBank as string[];
    assert.equal(bank.length, 5 + 6 + 3, "14 questions");
    assert.ok(bank.every((q) => q.includes("vegan baking")), "all questions filled with niche");
    assert.ok(bank.every((q) => !q.includes("{niche}")), "no unfilled placeholders");
    const ros = v.runOfShow as { columns: string[]; rows: string[][] };
    assert.deepEqual(ros.columns, ["Phase", "Format", "Script"]);
    assert.equal(ros.rows.length, 4);
    assert.deepEqual(ros.rows.map((r) => r[0]), ["Warm-up", "Rapid-fire", "Deep-dive", "CTA"]);
    assert.ok((v.callToAction as string).includes("vegan baking"));
    assert.match(v.eligibilityNote as string, /1,?000 followers/);
  });

  it("video-comments session type uses video-comments scripts (no LIVE pins)", () => {
    const v = okValues({ sessionType: "video-comments" });
    const ros = v.runOfShow as { columns: string[]; rows: string[][] };
    assert.ok(ros.rows.every((r) => r[1] === "video comments"), "format column is video comments");
    assert.ok(ros.rows[1][2].includes("Film a rapid-fire video"), "video-comments rapid-fire script");
    assert.ok((v.callToAction as string).includes("videos"));
  });

  it("live scripts mention the chat", () => {
    const v = okValues({ sessionType: "live" });
    const ros = v.runOfShow as { columns: string[]; rows: string[][] };
    assert.ok(ros.rows[0][2].includes("Pin it in the chat"), "live warm-up pins");
  });

  it("output keys exactly match meta.ts outputs", () => {
    const v = okValues();
    assert.deepEqual(Object.keys(v).sort(), OUTPUT_IDS.sort(), "keys match");
    assert.deepEqual(outputs.map((o) => o.id).sort(), OUTPUT_IDS.sort(), "meta ids match");
  });

  it("validation: missing niche errors", () => {
    const r = runTool({ sessionType: "live" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("validation: blank niche errors", () => {
    const r = runTool({ niche: "   ", sessionType: "live" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("validation: niche over 60 chars errors", () => {
    const r = runTool({ niche: "x".repeat(61), sessionType: "live" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /60 characters/);
  });

  it("validation: sessionType one of 2 options enforced", () => {
    for (const bad of ["video", "q&a", "", "Live Stream", 42, null]) {
      const r = runTool({ niche: "vegan baking", sessionType: bad });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /live or video-comments/);
    }
  });

  it("validation: sessionType trims and lowercases", () => {
    const r = runTool({ niche: "vegan baking", sessionType: "  LIVE " });
    assert.equal(r.ok, true);
  });

  it("validation: bad follower count errors", () => {
    for (const bad of [-1, 1.5, "abc", NaN]) {
      const r = runTool({ ...BASE, followerCount: bad });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /Follower count/);
    }
  });

  it("edge case: under 1,000 followers + live = eligibility banner", () => {
    const v = okValues({ followerCount: 800 });
    assert.match(v.eligibilityNote as string, /800 followers/, "names the count");
    assert.match(v.eligibilityNote as string, /may not be able to go live/, "banner message");
  });

  it("edge case: 1,000+ followers + live = no banner", () => {
    const v = okValues({ followerCount: 5000 });
    assert.doesNotMatch(v.eligibilityNote as string, /may not be able to go live/);
  });

  it("edge case: under 1,000 followers + video-comments = no live banner", () => {
    const v = okValues({ sessionType: "video-comments", followerCount: 100 });
    assert.doesNotMatch(v.eligibilityNote as string, /may not be able to go live/);
    assert.match(v.eligibilityNote as string, /any follower count/);
  });

  it("determinism: identical inputs give identical outputs", () => {
    const a = runTool({ ...BASE });
    const b = runTool({ ...BASE });
    assert.deepEqual(a, b);
    const c = runTool({ niche: "crypto trading", sessionType: "video-comments", followerCount: 10 });
    const d = runTool({ niche: "crypto trading", sessionType: "video-comments", followerCount: 10 });
    assert.deepEqual(c, d);
  });

  it("word-bank bounds: 14 questions, correct phase prefixes, no empties", () => {
    const bank = okValues().questionBank as string[];
    assert.equal(bank.filter((q) => q.startsWith("[Warm-up]")).length, 5);
    assert.equal(bank.filter((q) => q.startsWith("[Rapid-fire]")).length, 6);
    assert.equal(bank.filter((q) => q.startsWith("[Deep-dive]")).length, 3);
    assert.ok(bank.every((q) => q.trim().length > 20), "no empty/short picks");
    assert.ok(new Set(bank).size === bank.length, "no duplicate picks");
  });

  it("word bank variety: different niches produce different banks", () => {
    const a = okValues({ niche: "vegan baking" }).questionBank as string[];
    const b = okValues({ niche: "car detailing" }).questionBank as string[];
    assert.notDeepEqual(a, b);
  });
});
