import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { businessType: "coffee shop", niche: "coffee culture" };
const OUTPUT_IDS = ["momentsToFilm", "captionTemplates", "postingCadence", "weeklySchedule"];

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-behind-the-scenes-planner", () => {
  it("happy path: business track returns moments, captions, cadence, weekly table", () => {
    const v = okValues();
    const moments = v.momentsToFilm as string[];
    assert.equal(moments.length, 8);
    assert.ok(moments.every((m) => m.includes("coffee shop")), "business type filled in");
    assert.ok(moments.every((m) => !m.includes("{business}")), "no unfilled placeholders");
    const captions = v.captionTemplates as string[];
    assert.equal(captions.length, 4);
    assert.ok((v.postingCadence as string).includes("3 BTS videos per week"));
    const ws = v.weeklySchedule as { columns: string[]; rows: string[][] };
    assert.deepEqual(ws.columns, ["Day", "Task", "Plan"]);
    assert.equal(ws.rows.length, 7);
    assert.equal(ws.rows.filter((r) => r[1] === "Post a BTS video").length, 3, "3 posting days");
  });

  it("output keys exactly match meta.ts outputs", () => {
    const v = okValues();
    assert.deepEqual(Object.keys(v).sort(), OUTPUT_IDS.sort(), "keys match");
    assert.deepEqual(outputs.map((o) => o.id).sort(), OUTPUT_IDS.sort(), "meta ids match");
  });

  it("validation: missing/blank businessType errors", () => {
    for (const bad of [undefined, null, "", "   ", 42]) {
      const r = runTool({ businessType: bad, niche: "x" });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /business type/i);
    }
  });

  it("validation: businessType over 80 chars errors", () => {
    const r = runTool({ businessType: "x".repeat(81) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /80 characters/);
  });

  it("validation: niche over 60 chars errors", () => {
    const r = runTool({ businessType: "coffee shop", niche: "x".repeat(61) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /60 characters/);
  });

  it("edge case: 'no business' switches to creator-personal BTS track", () => {
    for (const noBiz of ["no business", "No Business", "none", "n/a", "personal", "just a creator"]) {
      const v = okValues({ businessType: noBiz });
      assert.ok((v.postingCadence as string).includes("Creator-personal track"), `personal track for "${noBiz}"`);
      const joint = (v.momentsToFilm as string[]).join(" ").toLowerCase();
      // personal-track markers: every 8-of-12 window contains at least one
      assert.ok(
        ["desk", "blooper", "retake", "script", "draft", "analytics", "comment", "workspace", "creator", "dm"].some((w) => joint.includes(w)),
        `personal moments used for "${noBiz}"`,
      );
      // and none of the business-track-only markers
      assert.ok(!["order", "customer", "supplier", "storefront", "restock"].some((w) => joint.includes(w)), "no business moments leaked in");
    }
  });

  it("edge case: real business stays on business track", () => {
    const v = okValues({ businessType: "clothing store" });
    assert.ok((v.postingCadence as string).includes("Business track"));
    const joint = (v.momentsToFilm as string[]).join(" ").toLowerCase();
    assert.ok(joint.includes("order") || joint.includes("customer") || joint.includes("store") || joint.includes("supplier"));
  });

  it("edge case: 'businessman' is not misread as no-business", () => {
    const v = okValues({ businessType: "businessman" });
    assert.ok((v.postingCadence as string).includes("Business track"), "kept on business track");
  });

  it("niche is optional; defaults to content creation", () => {
    const v = okValues({ niche: undefined });
    assert.ok((v.momentsToFilm as string[]).every((m) => !m.includes("{niche}")), "placeholder filled");
  });

  it("determinism: identical inputs give identical outputs", () => {
    assert.deepEqual(runTool({ ...BASE }), runTool({ ...BASE }));
    assert.deepEqual(
      runTool({ businessType: "no business" }),
      runTool({ businessType: "no business" }),
    );
  });

  it("word-bank bounds: 8 moments, 4 captions, no empties, no duplicates", () => {
    const v = okValues();
    const moments = v.momentsToFilm as string[];
    const captions = v.captionTemplates as string[];
    assert.ok(moments.every((m) => m.trim().length > 25));
    assert.ok(captions.every((c) => c.trim().length > 10));
    assert.equal(new Set(moments).size, moments.length, "no duplicate moments");
    assert.equal(new Set(captions).size, captions.length, "no duplicate captions");
  });

  it("different businesses produce different plans", () => {
    const a = okValues({ businessType: "coffee shop" }).momentsToFilm as string[];
    const b = okValues({ businessType: "plant nursery" }).momentsToFilm as string[];
    assert.notDeepEqual(a, b);
  });

  it("weekly schedule covers Mon/Wed/Fri posting with matching plan entries", () => {
    const ws = okValues().weeklySchedule as { columns: string[]; rows: string[][] };
    const postRows = ws.rows.filter((r) => r[1] === "Post a BTS video");
    assert.deepEqual(postRows.map((r) => r[0]), ["Monday", "Wednesday", "Friday"]);
    assert.ok(postRows.every((r) => r[2].includes("Caption:")), "each post day has a caption");
  });

  it("niche flavors the captions — every 4-caption window hits a {niche} template", () => {
    const v = okValues({ businessType: "plant nursery", niche: "urban gardening" });
    const captions = v.captionTemplates as string[];
    assert.ok(captions.every((c) => !c.includes("{niche}") && !c.includes("{business}")), "no raw placeholders");
    assert.ok(captions.join(" ").includes("urban gardening"), "niche appears in captions");
  });

  it("captions filled with business and niche, no raw placeholders", () => {
    const v = okValues();
    const captions = v.captionTemplates as string[];
    assert.ok(captions.every((c) => !c.includes("{business}") && !c.includes("{niche}")));
    assert.ok(captions.some((c) => c.includes("coffee shop") || c.includes("coffee culture")));
  });
});
