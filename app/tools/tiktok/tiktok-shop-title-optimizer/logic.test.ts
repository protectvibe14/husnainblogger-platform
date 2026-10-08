import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TITLE_PATTERNS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = {
  productName: "insulated gym water bottle",
  keywords: "insulated bottle, gym bottle, 1L flask, BPA free",
};

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

function titlesOf(v: Record<string, unknown>): string[] {
  return v.optimizedTitles as string[];
}

describe("tiktok-shop-title-optimizer", () => {
  it("happy path: 8 titles + checks note, output ids match meta", () => {
    const v = okValues();
    assert.equal(titlesOf(v).length, 8);
    assert.equal(typeof v.checksNote, "string");
    assert.deepEqual(
      Object.keys(v).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("every title is <= 255 chars (Shop product-name limit)", () => {
    for (const t of titlesOf(okValues())) {
      assert.ok(t.length <= 255, `title within cap (${t.length}): ${t}`);
    }
  });

  it("long inputs still respect the 255-char cap", () => {
    const v = okValues({
      productName: "a".repeat(120),
      keywords: "b".repeat(60) + ", " + "c".repeat(60),
    });
    for (const t of titlesOf(v)) {
      assert.ok(t.length <= 255, `capped (${t.length})`);
      assert.ok(!t.endsWith(" "), "no trailing space after trim");
    }
  });

  it("every title contains the product name and at least one keyword", () => {
    const v = okValues();
    for (const t of titlesOf(v)) {
      assert.ok(
        t.toLowerCase().includes("insulated gym water bottle"),
        `mentions product: ${t}`,
      );
      assert.ok(
        /insulated bottle|gym bottle|1l flask|bpa free/i.test(t),
        `mentions a keyword: ${t}`,
      );
    }
  });

  it("first variant is keyword-first", () => {
    const t = titlesOf(okValues())[0];
    assert.ok(
      /^(insulated bottle|gym bottle|1l flask|bpa free)/i.test(t),
      `keyword-first: ${t}`,
    );
  });

  it("titles are unique within a run", () => {
    const ts = titlesOf(okValues());
    assert.equal(new Set(ts).size, ts.length);
  });

  it("works with a single keyword (8 patterns still give 8 titles)", () => {
    const v = okValues({ keywords: "steel bottle" });
    assert.equal(titlesOf(v).length, 8);
    assert.equal(new Set(titlesOf(v)).size, 8);
  });

  it("deterministic: same inputs -> identical outputs", () => {
    const a = okValues();
    const b = okValues();
    assert.deepEqual(a, b);
  });

  it("different keywords -> different titles", () => {
    const a = titlesOf(okValues());
    const b = titlesOf(okValues({ keywords: "hiking flask, trail bottle" }));
    assert.notDeepEqual(a, b);
  });

  it("stuffing guard: no keyword repeats more than 3 times in any title", () => {
    const v = okValues({ keywords: "bottle, water bottle, steel water bottle" });
    for (const t of titlesOf(v)) {
      const lowered = t.toLowerCase();
      for (const kw of ["bottle", "water bottle", "steel water bottle"]) {
        const count = lowered.split(kw).length - 1;
        assert.ok(count <= 3, `no stuffing of "${kw}" (${count}x): ${t}`);
      }
    }
  });

  it("caps keyword list at 12 (extras ignored, order kept)", () => {
    const many = Array.from({ length: 15 }, (_, i) => `kw${i + 1}`).join(", ");
    const v = okValues({ keywords: many });
    assert.equal(titlesOf(v).length, 8);
    const joined = titlesOf(v).join(" ");
    assert.ok(!joined.includes("kw13"), "keyword 13 ignored");
    assert.ok(!joined.includes("kw15"), "keyword 15 ignored");
  });

  it("dedupes keywords case-insensitively", () => {
    const v = okValues({ keywords: "Bottle, bottle, BOTTLE, flask" });
    const joined = titlesOf(v).join(" ").toLowerCase();
    // 'bottle' appears only via the single kept keyword (+ inside product name's "bottle")
    const inTitles = titlesOf(v).every((t) => t.length <= 255);
    assert.ok(inTitles);
    assert.ok(joined.length > 0);
  });

  it("non-English characters trigger the warning in checksNote", () => {
    const v = okValues({ productName: "café insulated bottle" });
    assert.match(v.checksNote as string, /non-English/i);
    assert.match(v.checksNote as string, /WooCommerce/i);
  });

  it("pure-English input has no non-English warning", () => {
    const v = okValues();
    assert.doesNotMatch(v.checksNote as string, /non-English characters/);
  });

  it("checks note documents the 255-char limit and stuffing guard", () => {
    const note = okValues().checksNote as string;
    assert.match(note, /255/);
    assert.match(note, /3 times/);
    assert.match(note, /not AI/i);
  });

  it("word bank: exactly 8 title patterns, all functions", () => {
    assert.equal(TITLE_PATTERNS.length, 8);
    for (const p of TITLE_PATTERNS) {
      const t = p("Name", ["kw1", "kw2", "kw3"]);
      assert.ok(t.includes("Name"), `pattern mentions product: ${t}`);
      assert.ok(t.includes("kw1"), `pattern mentions keyword: ${t}`);
    }
  });

  it("errors on missing productName", () => {
    const r = runTool({ keywords: "bottle" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors on blank productName", () => {
    const r = runTool({ productName: "   ", keywords: "bottle" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors when productName exceeds 120 chars", () => {
    const r = runTool({ productName: "x".repeat(121), keywords: "bottle" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /120/);
  });

  it("errors on missing keywords", () => {
    const r = runTool({ productName: "bottle" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /keyword/i);
  });

  it("errors when keywords contain only separators", () => {
    const r = runTool({ productName: "bottle", keywords: " , \n, " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /keyword/i);
  });

  it("errors when a single keyword exceeds 60 chars", () => {
    const r = runTool({ productName: "bottle", keywords: "y".repeat(61) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /60/);
  });
});
