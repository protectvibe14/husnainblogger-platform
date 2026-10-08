import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, HOOK_TEMPLATES, IP_TERMS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = {
  productName: "ceramic pour-over coffee set",
  features: "Brews 4 cups at once\nDishwasher-safe ceramic\nIncludes reusable steel filter",
};

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-shop-description-writer", () => {
  it("happy path: description + policy note, output ids match meta", () => {
    const v = okValues();
    assert.equal(typeof v.description, "string");
    assert.equal(typeof v.policyNote, "string");
    assert.deepEqual(
      Object.keys(v).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("description has all sections: hook, benefits, specs placeholder, box placeholder, keywords", () => {
    const d = okValues().description as string;
    assert.ok(d.includes("ceramic pour-over coffee set"), "mentions product");
    assert.ok(d.includes("Brews 4 cups at once"), "includes features");
    assert.ok(d.includes("•"), "bulleted benefits");
    assert.ok(d.includes("REPLACE"), "spec placeholders clearly labeled");
    assert.ok(d.includes("What's in the box"), "what's-included section");
    assert.ok(d.includes("Do not publish this placeholder"), "placeholder warning");
    assert.ok(d.includes("Keywords"), "keywords section");
  });

  it("never invents specs: placeholders stay bracketed, not filled", () => {
    const d = okValues().description as string;
    assert.ok(d.includes("[add the real specs here]"));
    assert.ok(d.includes("[List every item in the box"));
  });

  it("features parsed one-per-line; semicolons also split", () => {
    const v = okValues({ features: "one\ntwo;three" });
    const d = v.description as string;
    assert.ok(d.includes("• one"));
    assert.ok(d.includes("• two"));
    assert.ok(d.includes("• three"));
  });

  it("caps features at 25", () => {
    const many = Array.from({ length: 30 }, (_, i) => `feature ${i + 1}`).join("\n");
    const d = okValues({ features: many }).description as string;
    assert.ok(d.includes("• feature 25"));
    assert.ok(!d.includes("• feature 26"), "feature 26 dropped");
  });

  it("description stays within the 10000-char Shop guideline", () => {
    const many = Array.from({ length: 25 }, () => "x".repeat(195)).join("\n");
    const d = okValues({ features: many }).description as string;
    assert.ok(d.length > 4000, `near-limit input used (${d.length})`);
    assert.ok(d.length <= 10000, `within cap (${d.length})`);
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(okValues(), okValues());
  });

  it("different product -> different hook pick is stable per product", () => {
    const a = okValues().description as string;
    const b = okValues({ productName: "bamboo bath mat" }).description as string;
    assert.notEqual(a, b);
    assert.equal(b, okValues({ productName: "bamboo bath mat" }).description);
  });

  it("flags brand terms in product name with policy reminder", () => {
    const v = okValues({ productName: "Nike-style running socks" });
    assert.match(v.policyNote as string, /nike/i);
    assert.match(v.policyNote as string, /counterfeit/i);
    assert.match(v.policyNote as string, /not legal advice/i);
  });

  it("flags counterfeit terms in features", () => {
    const v = okValues({ features: "1:1 replica quality strap" });
    assert.match(v.policyNote as string, /replica/i);
  });

  it("flags multi-word brand phrases", () => {
    const v = okValues({ features: "fits Louis Vuitton pouches" });
    assert.match(v.policyNote as string, /louis vuitton/i);
  });

  it("clean input: policy note says no terms detected", () => {
    const v = okValues();
    assert.match(v.policyNote as string, /No brand\/IP-sensitive terms detected/);
  });

  it("word banks: 6 hooks + 58 IP terms, none empty", () => {
    assert.equal(HOOK_TEMPLATES.length, 6);
    assert.equal(IP_TERMS.length, 58);
    for (const h of HOOK_TEMPLATES) {
      assert.ok(h.length > 0 && h.includes("{P}"), `hook has placeholder: ${h}`);
    }
    for (const t of IP_TERMS) {
      assert.ok(t.length > 0, "no empty IP term");
    }
  });

  it("errors on missing productName", () => {
    const r = runTool({ features: "a" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors on blank productName", () => {
    const r = runTool({ productName: "  ", features: "a" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors when productName exceeds 150 chars", () => {
    const r = runTool({ productName: "x".repeat(151), features: "a" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /150/);
  });

  it("errors on missing features", () => {
    const r = runTool({ productName: "bottle" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /feature/i);
  });

  it("errors on blank features", () => {
    const r = runTool({ productName: "bottle", features: "  \n " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /feature/i);
  });
});
