/**
 * Tests for the Web Designer Project Pricing Calculator pure logic (tool-073).
 *
 * Run: node --test app/tools/make-money/web-designer-project-pricing-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fixed benchmark tables in
 * logic.ts (scope bands, experience multipliers 0.75/1.0/1.5, page scaling),
 * never copied from tool output. Output ids are cross-checked against meta.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  SCOPE_BASE_BANDS,
  EXPERIENCE_MULTIPLIERS,
  SCOPE_REFERENCE_PAGES,
  PROJECT_SCOPES,
  EXPERIENCE_LEVELS,
  CURRENCY,
} from "./logic.ts";

const EXPECTED_OUTPUT_IDS = ["projectPriceLow", "projectPriceHigh", "scopeNote"];

describe("tool-073 happy paths", () => {
  it("landing, 1 page, mid → $500–$2,000 (no scaling)", () => {
    const r = runTool({ projectScope: "landing", pageCount: 1, experienceLevel: "mid" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 500);
    assert.strictEqual(r.values!.projectPriceHigh, 2000);
    assert.ok(r.values!.scopeNote.includes("Landing page"));
  });

  it("5-page site, 5 pages, mid → $2,000–$7,500 benchmark band", () => {
    const r = runTool({ projectScope: "five_page", pageCount: 5, experienceLevel: "mid" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 2000);
    assert.strictEqual(r.values!.projectPriceHigh, 7500);
  });

  it("5-page site, 10 pages, mid → page factor ×2 → $4,000–$15,000", () => {
    // factor = 1.0 × (10/5) = 2 → 2000×2=4000, 7500×2=15000
    const r = runTool({ projectScope: "five_page", pageCount: 10, experienceLevel: "mid" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 4000);
    assert.strictEqual(r.values!.projectPriceHigh, 15000);
    assert.ok(r.values!.scopeNote.includes("×2 (10 pages vs 5-page reference)"));
  });

  it("landing, 3 pages, entry → factor 2.25 → $1,150–$4,500", () => {
    // factor = 0.75 × (3/1) = 2.25 → 500×2.25=1125→1150, 2000×2.25=4500
    const r = runTool({ projectScope: "landing", pageCount: 3, experienceLevel: "entry" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 1150);
    assert.strictEqual(r.values!.projectPriceHigh, 4500);
  });

  it("ecommerce, senior → ignores page count → $7,500–$37,500", () => {
    // factor = 1.5 × 1 = 1.5 → 5000×1.5=7500, 25000×1.5=37500
    const r = runTool({ projectScope: "ecommerce", pageCount: 20, experienceLevel: "senior" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 7500);
    assert.strictEqual(r.values!.projectPriceHigh, 37500);
    assert.ok(r.values!.scopeNote.includes("informational only"));
  });

  it("custom, entry → $7,500–$37,500 with wide-band honesty note", () => {
    // factor = 0.75 → 10000×0.75=7500, 50000×0.75=37500
    const r = runTool({ projectScope: "custom", pageCount: 1, experienceLevel: "entry" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 7500);
    assert.strictEqual(r.values!.projectPriceHigh, 37500);
    assert.ok(r.values!.scopeNote.includes("Wide estimate"));
  });

  it("rounds half-up to the nearest $50 (no false precision)", () => {
    // landing entry 1 page: 500×0.75=375 → 400 ; 2000×0.75=1500
    const r = runTool({ projectScope: "landing", pageCount: 1, experienceLevel: "entry" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 400);
    assert.strictEqual(r.values!.projectPriceHigh, 1500);
  });

  it("accepts numeric strings for page count", () => {
    const r = runTool({ projectScope: "landing", pageCount: "1", experienceLevel: "mid" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.projectPriceLow, 500);
    assert.strictEqual(r.values!.projectPriceHigh, 2000);
  });
});

describe("tool-073 validation errors", () => {
  it("rejects an unknown project scope", () => {
    const r = runTool({ projectScope: "blog", pageCount: 5, experienceLevel: "mid" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a missing project scope", () => {
    const r = runTool({ pageCount: 5, experienceLevel: "mid" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects an unknown experience level", () => {
    const r = runTool({ projectScope: "landing", pageCount: 1, experienceLevel: "guru" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero page count", () => {
    const r = runTool({ projectScope: "landing", pageCount: 0, experienceLevel: "mid" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("rejects fractional page count", () => {
    const r = runTool({ projectScope: "landing", pageCount: 2.5, experienceLevel: "mid" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("whole number"));
  });

  it("rejects non-numeric page count", () => {
    const r = runTool({ projectScope: "landing", pageCount: "many", experienceLevel: "mid" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects page count above the sanity cap", () => {
    const r = runTool({ projectScope: "landing", pageCount: 999999, experienceLevel: "mid" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
});

describe("tool-073 contract and determinism", () => {
  it("runs twice with identical results (deterministic)", () => {
    const args = { projectScope: "five_page", pageCount: 7, experienceLevel: "senior" };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returns exactly the output ids declared in meta.ts", () => {
    const r = runTool({ projectScope: "landing", pageCount: 2, experienceLevel: "mid" });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values!).sort(), [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("exports the benchmark tables used by the tool", () => {
    assert.strictEqual(CURRENCY, "USD");
    assert.deepStrictEqual([...PROJECT_SCOPES], ["landing", "five_page", "ecommerce", "custom"]);
    assert.deepStrictEqual([...EXPERIENCE_LEVELS], ["entry", "mid", "senior"]);
    assert.deepStrictEqual(SCOPE_BASE_BANDS.five_page, { low: 2000, high: 7500 });
    assert.strictEqual(EXPERIENCE_MULTIPLIERS.senior, 1.5);
    assert.strictEqual(SCOPE_REFERENCE_PAGES.ecommerce, null);
    assert.strictEqual(SCOPE_REFERENCE_PAGES.five_page, 5);
  });

  it("note labels the band a survey estimate and points to a real quote", () => {
    const r = runTool({ projectScope: "ecommerce", pageCount: 12, experienceLevel: "mid" });
    assert.ok(r.values!.scopeNote.includes("survey estimate"));
    assert.ok(r.values!.scopeNote.includes("real quote"));
  });
});
