/**
 * Tests for the Newsletter Sponsorship Rate Calculator (tool-084).
 *
 * Run: node --test app/tools/make-money/newsletter-sponsorship-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the CPM constants in logic.ts,
 * never copied from tool output. CPM benchmarks are labeled estimates;
 * tests assert the math and honesty labels, not "real" market rates.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateNewsletterRate,
  runTool,
  roundMoney,
  PLACEMENT_CPM,
} from "./logic.ts";

const OUTPUT_IDS = ["ratePerIssue", "effectiveCpm", "benchmarkCpm", "currency", "note"];

describe("roundMoney", () => {
  it("rounds half-up to 2 decimals", () => {
    assert.strictEqual(roundMoney(2.345), 2.35);
    assert.strictEqual(roundMoney(2.344), 2.34);
  });
});

describe("calculateNewsletterRate — happy paths", () => {
  it("primary placement: $150 CPM", () => {
    // 20,000 subs -> 20k; 20 × 150 = 3000.00.
    // effective CPM: 3000 / (20000 × 0.40) × 1000 = 3000/8000 × 1000 = 375.00.
    const r = calculateNewsletterRate({ subscriberCount: 20000, openRate: 40, placement: "primary" });
    assert.strictEqual(r.ratePerIssue, 3000);
    assert.strictEqual(r.effectiveCpm, 375);
    assert.strictEqual(r.benchmarkCpm, 150);
    assert.strictEqual(r.currency, "USD");
  });

  it("secondary placement: $50 CPM", () => {
    // 10,000 subs -> 10k; 10 × 50 = 500.00.
    // effective CPM: 500 / (10000 × 0.50) × 1000 = 500/5000 × 1000 = 100.00.
    const r = calculateNewsletterRate({ subscriberCount: 10000, openRate: 50, placement: "secondary" });
    assert.strictEqual(r.ratePerIssue, 500);
    assert.strictEqual(r.effectiveCpm, 100);
    assert.strictEqual(r.benchmarkCpm, 50);
  });

  it("fractional rates round to cents", () => {
    // 1,234 subs -> 1.234k; 1.234 × 150 = 185.10.
    // effective: 185.1 / (1234 × 0.33) × 1000 = 185.1/407.22 × 1000 = 454.548... -> 454.55.
    const r = calculateNewsletterRate({ subscriberCount: 1234, openRate: 33, placement: "primary" });
    assert.strictEqual(r.ratePerIssue, 185.1);
    assert.strictEqual(r.effectiveCpm, 454.55);
  });

  it("0% open rate -> effectiveCpm null and note says n/a", () => {
    const r = calculateNewsletterRate({ subscriberCount: 5000, openRate: 0, placement: "secondary" });
    assert.strictEqual(r.effectiveCpm, null);
    assert.strictEqual(r.ratePerIssue, 250);
    assert.ok(r.note.includes("n/a"), "note must explain the n/a effective CPM");
  });

  it("100% open rate -> effective CPM equals benchmark CPM", () => {
    // 5000 subs, primary: rate=750; effective=750/(5000×1)×1000=150.
    const r = calculateNewsletterRate({ subscriberCount: 5000, openRate: 100, placement: "primary" });
    assert.strictEqual(r.effectiveCpm, 150);
  });

  it("labels estimates in the note", () => {
    const r = calculateNewsletterRate({ subscriberCount: 8000, openRate: 45, placement: "primary" });
    assert.ok(r.note.includes("labeled estimate"), "note must label the CPM estimate");
    assert.ok(r.note.includes("$150 CPM"), "note must cite the benchmark");
    assert.ok(r.note.includes("vary by niche"), "note must cite variance");
  });

  it("exposes the documented CPM constants", () => {
    assert.strictEqual(PLACEMENT_CPM.primary.cpm, 150);
    assert.strictEqual(PLACEMENT_CPM.secondary.cpm, 50);
  });
});

describe("calculateNewsletterRate — invalid input", () => {
  it("rejects zero / negative subscriberCount", () => {
    assert.throws(() => calculateNewsletterRate({ subscriberCount: 0, openRate: 40, placement: "primary" }), RangeError);
    assert.throws(() => calculateNewsletterRate({ subscriberCount: -10, openRate: 40, placement: "primary" }), RangeError);
  });

  it("rejects openRate outside 0–100", () => {
    assert.throws(() => calculateNewsletterRate({ subscriberCount: 5000, openRate: -1, placement: "primary" }), RangeError);
    assert.throws(() => calculateNewsletterRate({ subscriberCount: 5000, openRate: 100.5, placement: "primary" }), RangeError);
    assert.throws(() => calculateNewsletterRate({ subscriberCount: 5000, openRate: 101, placement: "primary" }), RangeError);
  });

  it("rejects non-numeric inputs", () => {
    assert.throws(() => calculateNewsletterRate({ subscriberCount: NaN, openRate: 40, placement: "primary" }), TypeError);
    assert.throws(() => calculateNewsletterRate({ subscriberCount: 5000, openRate: "40" as unknown as number, placement: "primary" }), TypeError);
  });

  it("rejects an unknown placement", () => {
    assert.throws(
      () => calculateNewsletterRate({ subscriberCount: 5000, openRate: 40, placement: "classifieds" as never }),
      TypeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => calculateNewsletterRate(null as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("computes rate per issue and effective CPM", () => {
    // 20,000 subs, 40% open, primary: rate 3000; effective 375.
    const r = runTool({ subscriberCount: 20000, openRate: 40, placement: "primary" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values?.["ratePerIssue"], 3000);
    assert.strictEqual(r.values?.["effectiveCpm"], 375);
    assert.strictEqual(r.values?.["benchmarkCpm"], 150);
  });

  it("surfaces the n/a effective CPM as text", () => {
    const r = runTool({ subscriberCount: 5000, openRate: 0, placement: "secondary" });
    assert.strictEqual(r.ok, true);
    assert.ok(typeof r.values?.["effectiveCpm"] === "string", "n/a must be text");
    assert.ok((r.values?.["effectiveCpm"] as string).startsWith("n/a"));
  });

  it("errors on invalid inputs with human messages", () => {
    assert.strictEqual(runTool({}).ok, false);
    assert.ok((runTool({}).error ?? "").length > 0);
    assert.strictEqual(runTool({ subscriberCount: 0, openRate: 40, placement: "primary" }).ok, false);
    assert.strictEqual(runTool({ subscriberCount: 5000, openRate: 120, placement: "primary" }).ok, false);
    assert.strictEqual(runTool({ subscriberCount: 5000, openRate: 40, placement: "sidebar" }).ok, false);
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });

  it("returns exactly the meta.ts output ids", () => {
    const r = runTool({ subscriberCount: 12000, openRate: 35, placement: "secondary" });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values ?? {}).sort(), [...OUTPUT_IDS].sort());
  });

  it("is deterministic: two runs give identical results", () => {
    const a = runTool({ subscriberCount: 15000, openRate: 42, placement: "primary" });
    const b = runTool({ subscriberCount: 15000, openRate: 42, placement: "primary" });
    assert.deepStrictEqual(a, b);
  });
});
