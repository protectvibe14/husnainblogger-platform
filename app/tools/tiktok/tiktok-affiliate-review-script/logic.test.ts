import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TESTED_HOOKS, FIRST_IMPRESSION_HOOKS, DEMO_SHOTS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = {
  productName: "mini portable blender",
  triedProduct: true,
  experienceNotes: "Blends frozen fruit smoothly\nCharges over USB-C\nA bit loud on max speed",
};

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

function scriptOf(v: Record<string, unknown>): string {
  return v.reviewScript as string;
}

describe("tiktok-affiliate-review-script", () => {
  it("happy path (tested + notes): script + disclosure, output ids match meta", () => {
    const v = okValues();
    assert.equal(typeof v.reviewScript, "string");
    assert.equal(typeof v.disclosure, "string");
    assert.deepEqual(
      Object.keys(v).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("tested script uses the user's own notes as pros — never invented claims", () => {
    const s = scriptOf(okValues());
    assert.ok(s.includes("mini portable blender"), "mentions product");
    assert.ok(s.includes("Blends frozen fruit smoothly"), "uses note line 1");
    assert.ok(s.includes("Charges over USB-C"), "uses note line 2");
    assert.ok(s.includes("#ad"), "affiliate disclosure present");
    assert.ok(s.includes("DEMO SHOTS"), "demo shot section present");
  });

  it("tested script includes an honest-downside placeholder to fill", () => {
    const s = scriptOf(okValues());
    assert.match(s, /honest downside/i);
    assert.ok(s.includes("[Write one real downside"), "labeled placeholder");
  });

  it("tested without notes: pros become labeled placeholders", () => {
    const s = scriptOf(okValues({ experienceNotes: "" }));
    assert.ok(s.includes("[Write 2-3 things you genuinely liked"), "placeholder pros");
    assert.ok(!s.includes("Blends frozen fruit"), "no stale notes");
  });

  it("not tried: forces first-impressions framing, no experience claims", () => {
    const s = scriptOf(okValues({ triedProduct: false, experienceNotes: "" }));
    assert.match(s, /first look and unboxing/i);
    assert.match(s, /NOT fully tested/i);
    assert.match(s, /no durability claims/i);
    assert.ok(s.includes("#ad"), "disclosure still present");
    assert.ok(!s.includes("Blends frozen fruit"), "no invented experience");
  });

  it("not tried: ignores notes for pros framing", () => {
    const s = scriptOf(okValues({ triedProduct: false }));
    assert.match(s, /part 2/, "promises follow-up test");
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(okValues(), okValues());
    assert.deepEqual(
      okValues({ triedProduct: false }),
      okValues({ triedProduct: false }),
    );
  });

  it("different modes produce different scripts", () => {
    const tested = scriptOf(okValues({ triedProduct: true }));
    const first = scriptOf(okValues({ triedProduct: false }));
    assert.notEqual(tested, first);
  });

  it("disclosure explains FTC rule + not legal advice", () => {
    const d = okValues().disclosure as string;
    assert.match(d, /FTC/i);
    assert.match(d, /not legal advice/i);
    assert.match(d, /never invents experience claims/i);
  });

  it("word banks: 6 tested + 4 first-impression hooks + 5 demo shots", () => {
    assert.equal(TESTED_HOOKS.length, 6);
    assert.equal(FIRST_IMPRESSION_HOOKS.length, 4);
    assert.equal(DEMO_SHOTS.length, 5);
    for (const h of [...TESTED_HOOKS, ...FIRST_IMPRESSION_HOOKS]) {
      assert.ok(h.length > 0 && h.includes("{P}"), `hook has placeholder: ${h}`);
    }
    for (const s of DEMO_SHOTS) {
      assert.ok(s.length > 0, "no empty demo shot");
    }
  });

  it("no {P} placeholder leaks into output", () => {
    for (const mode of [true, false]) {
      assert.ok(!scriptOf(okValues({ triedProduct: mode })).includes("{P}"));
    }
  });

  it("notes split on newlines and semicolons", () => {
    const s = scriptOf(okValues({ experienceNotes: "fast\nquiet;light" }));
    assert.ok(s.includes("• fast"));
    assert.ok(s.includes("• quiet"));
    assert.ok(s.includes("• light"));
  });

  it("errors on missing productName", () => {
    const r = runTool({ triedProduct: true });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors on blank productName", () => {
    const r = runTool({ productName: "  ", triedProduct: true });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors when productName exceeds 150 chars", () => {
    const r = runTool({ productName: "x".repeat(151), triedProduct: true });
    assert.equal(r.ok, false);
    assert.match(r.error!, /150/);
  });

  it("errors when triedProduct is missing", () => {
    const r = runTool({ productName: "blender" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /tried/i);
  });

  it("errors when triedProduct is not a boolean", () => {
    const r = runTool({ productName: "blender", triedProduct: "yes" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /tried/i);
  });

  it("errors when experience notes exceed 2000 chars", () => {
    const r = runTool({ productName: "blender", triedProduct: true, experienceNotes: "n".repeat(2001) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /2000/);
  });
});
