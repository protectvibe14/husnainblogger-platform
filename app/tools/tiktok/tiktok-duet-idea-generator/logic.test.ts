import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { niche: "sourdough baking", duetType: "react", hasPartner: "yes" };

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-duet-idea-generator", () => {
  it("happy path: react generates 5 duet ideas", () => {
    const v = okValues();
    assert.ok(Array.isArray(v.duetIdeas));
    assert.equal((v.duetIdeas as string[]).length, 5);
  });

  it("each idea mentions the niche and has concept + setup", () => {
    const v = okValues();
    for (const idea of v.duetIdeas as string[]) {
      assert.ok(idea.includes("sourdough baking"), `idea mentions niche: ${idea}`);
      assert.ok(idea.includes("Setup:"), `idea has setup: ${idea}`);
      assert.ok(idea.length > 60, "idea is substantive");
    }
  });

  it("all 4 duet types produce distinct idea sets", () => {
    const sets = ["react", "reply", "collab", "challenge"].map(
      (t) => (okValues({ duetType: t }).duetIdeas as string[]).join("|"),
    );
    assert.equal(new Set(sets).size, 4, "each duet type has its own ideas");
  });

  it("duetType is case/whitespace tolerant", () => {
    const v = okValues({ duetType: "  REACT " });
    assert.equal((v.duetIdeas as string[]).length, 5);
  });

  it("hasPartner=yes returns coordination tips", () => {
    const v = okValues({ hasPartner: "yes" });
    assert.match(v.partnerGuidance as string, /Partner coordination tips/);
    assert.match(v.partnerGuidance as string, /1\./);
  });

  it("hasPartner=no returns no-partner guidance without naming creators", () => {
    const v = okValues({ hasPartner: "no" });
    assert.match(v.partnerGuidance as string, /No duet partner yet/);
    assert.ok(
      !(v.partnerGuidance as string).includes("@"),
      "guidance names no real creators",
    );
  });

  it("no ideas contain unfilled {niche} placeholders", () => {
    for (const t of ["react", "reply", "collab", "challenge"]) {
      const v = okValues({ duetType: t, niche: "home workouts" });
      for (const idea of v.duetIdeas as string[]) {
        assert.ok(!idea.includes("{niche}"), `no raw placeholder: ${idea}`);
      }
      assert.ok(!(v.partnerGuidance as string).includes("{niche}"));
    }
  });

  it("errors on missing niche", () => {
    const r = runTool({ ...BASE, niche: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("errors on blank niche", () => {
    const r = runTool({ ...BASE, niche: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("errors on non-string niche", () => {
    const r = runTool({ ...BASE, niche: 42 });
    assert.equal(r.ok, false);
  });

  it("errors on niche over 100 chars", () => {
    const r = runTool({ ...BASE, niche: "a".repeat(101) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /100/);
  });

  it("errors on invalid duetType", () => {
    const r = runTool({ ...BASE, duetType: "duet" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /react, reply, collab, or challenge/);
  });

  it("errors on missing duetType", () => {
    const r = runTool({ niche: "fitness", hasPartner: "no" });
    assert.equal(r.ok, false);
  });

  it("errors on invalid hasPartner", () => {
    const r = runTool({ ...BASE, hasPartner: "maybe" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /partner/i);
  });

  it("errors on missing hasPartner", () => {
    const r = runTool({ niche: "fitness", duetType: "reply" });
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs twice -> identical output", () => {
    const a = runTool(BASE);
    const b = runTool({ ...BASE });
    assert.deepEqual(a, b);
  });

  it("different niches -> different idea sets", () => {
    const a = (okValues({ niche: "pottery" }).duetIdeas as string[]).join("|");
    const b = (okValues({ niche: "chess" }).duetIdeas as string[]).join("|");
    assert.notEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues();
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
  });

  it("word-bank bounds: no empty ideas, hook tip and CTA present in each", () => {
    const v = okValues({ niche: "gardening", duetType: "challenge", hasPartner: "no" });
    for (const idea of v.duetIdeas as string[]) {
      assert.ok(idea.trim().length > 0);
      assert.ok(idea.includes("Hook tip:"), "hook present");
      assert.ok(idea.includes("CTA:"), "CTA present");
    }
  });

  it("error results carry no values", () => {
    const r = runTool({ niche: "", duetType: "x", hasPartner: "y" });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});
