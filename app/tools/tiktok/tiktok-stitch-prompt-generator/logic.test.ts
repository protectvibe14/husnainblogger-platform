import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { niche: "personal finance", stance: "debunk" };

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-stitch-prompt-generator", () => {
  it("happy path: debunk stance yields 5 prompts + 3 filming tips", () => {
    const v = okValues();
    assert.equal((v.stitchPrompts as string[]).length, 5);
    assert.equal((v.filmingTips as string[]).length, 3);
  });

  it("each prompt has an opening line and a response angle mentioning the niche", () => {
    const v = okValues();
    for (const p of v.stitchPrompts as string[]) {
      assert.ok(p.includes("Opening line:"), `has opening: ${p}`);
      assert.ok(p.includes("Response angle:"), `has angle: ${p}`);
      assert.ok(p.includes("personal finance"), `mentions niche: ${p}`);
    }
  });

  it("all 4 stances produce distinct prompt sets", () => {
    const sets = ["agree", "debunk", "add-context", "funny"].map(
      (s) => (okValues({ stance: s }).stitchPrompts as string[]).join("|"),
    );
    assert.equal(new Set(sets).size, 4, "each stance has its own prompts");
  });

  it("stance is case/whitespace tolerant", () => {
    const v = okValues({ stance: "  ADD-CONTEXT " });
    assert.equal((v.stitchPrompts as string[]).length, 5);
  });

  it("optional videoDescription is quoted back into prompts", () => {
    const v = okValues({ videoDescription: "a guy claiming credit cards are free money" });
    for (const p of v.stitchPrompts as string[]) {
      assert.ok(
        p.includes("a guy claiming credit cards are free money"),
        `quotes description: ${p}`,
      );
    }
  });

  it("videoDescription is optional — omitted and blank are fine", () => {
    const a = okValues({});
    const b = okValues({ videoDescription: "   " });
    for (const p of [...(a.stitchPrompts as string[]), ...(b.stitchPrompts as string[])]) {
      assert.ok(!p.includes("Tailor this to the video"), "no tail without description");
    }
  });

  it("no prompts contain unfilled {niche} placeholders", () => {
    for (const s of ["agree", "debunk", "add-context", "funny"]) {
      const v = okValues({ stance: s, niche: "meal prep" });
      for (const p of [...(v.stitchPrompts as string[]), ...(v.filmingTips as string[])]) {
        assert.ok(!p.includes("{niche}"), `no raw placeholder: ${p}`);
      }
    }
  });

  it("errors on missing niche", () => {
    const r = runTool({ stance: "agree" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("errors on blank niche", () => {
    const r = runTool({ ...BASE, niche: "  " });
    assert.equal(r.ok, false);
  });

  it("errors on non-string niche", () => {
    const r = runTool({ ...BASE, niche: 7 });
    assert.equal(r.ok, false);
  });

  it("errors on niche over 100 chars", () => {
    const r = runTool({ ...BASE, niche: "b".repeat(101) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /100/);
  });

  it("errors on invalid stance", () => {
    const r = runTool({ ...BASE, stance: "neutral" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /agree, debunk, add-context, or funny/);
  });

  it("errors on missing stance", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
  });

  it("errors on videoDescription over 500 chars", () => {
    const r = runTool({ ...BASE, videoDescription: "x".repeat(501) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /500/);
  });

  it("deterministic: same inputs twice -> identical output", () => {
    const a = runTool({ ...BASE, videoDescription: "some clip" });
    const b = runTool({ niche: "personal finance", stance: "debunk", videoDescription: "some clip" });
    assert.deepEqual(a, b);
  });

  it("different niches -> different prompt sets", () => {
    const a = (okValues({ niche: "pottery" }).stitchPrompts as string[]).join("|");
    const b = (okValues({ niche: "chess" }).stitchPrompts as string[]).join("|");
    assert.notEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ videoDescription: "clip" });
    assert.deepEqual(Object.keys(v).sort(), outputs.map((o) => o.id).sort());
  });

  it("word-bank bounds: prompts and tips are all non-empty strings", () => {
    for (const s of ["agree", "debunk", "add-context", "funny"]) {
      const v = okValues({ stance: s });
      for (const p of [...(v.stitchPrompts as string[]), ...(v.filmingTips as string[])]) {
        assert.ok(typeof p === "string" && p.trim().length > 0);
      }
    }
  });

  it("error results carry no values", () => {
    const r = runTool({ niche: "", stance: "nope" });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});
