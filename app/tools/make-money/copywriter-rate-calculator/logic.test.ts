/**
 * Tests for the Copywriter Rate Calculator pure logic (tool-070).
 *
 * Run: node --test app/tools/make-money/copywriter-rate-calculator/logic.test.ts
 *
 * Expected values are hand-computed from the FIXED benchmark table in
 * logic.ts (all bands are labeled survey estimates in code and UI), never
 * copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, BENCHMARK_TABLE } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("runTool — benchmark lookups", () => {
  it("returns the intermediate per-word band $0.15–$0.30", () => {
    const r = runTool({ experienceLevel: "intermediate", deliverable: "per_word", wordCount: 1500 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.rateRangeLow, 0.15);
    assert.strictEqual(r.values!.rateRangeHigh, 0.3);
    assert.strictEqual(r.values!.perWordRate, 0.15);
  });

  it("returns the beginner blog-post band $100–$250", () => {
    const r = runTool({ experienceLevel: "beginner", deliverable: "blog_post" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.rateRangeLow, 100);
    assert.strictEqual(r.values!.rateRangeHigh, 250);
    assert.strictEqual(r.values!.perWordRate, null); // no word count → not derived
  });

  it("derives a per-word equivalent for flat deliverables ($100 / 1000 words = $0.10)", () => {
    const r = runTool({ experienceLevel: "beginner", deliverable: "blog_post", wordCount: 1000 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perWordRate, 0.1);
  });

  it("applies a 50% niche premium to the expert sales-page band ($2,000–$7,500 → $3,000–$11,250)", () => {
    const r = runTool({ experienceLevel: "expert", deliverable: "sales_page", nichePremium: 50 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.rateRangeLow, 3000);
    assert.strictEqual(r.values!.rateRangeHigh, 11250);
  });

  it("applies a +150% finance-style premium to specialist per-word ($0.50–$2.00 → $1.25–$5.00)", () => {
    const r = runTool({ experienceLevel: "specialist", deliverable: "per_word", wordCount: 2000, nichePremium: 150 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.rateRangeLow, 1.25);
    assert.strictEqual(r.values!.rateRangeHigh, 5);
  });

  it("looks up every level × deliverable cell without error", () => {
    for (const level of ["beginner", "intermediate", "expert", "specialist"] as const) {
      for (const deliverable of ["per_word", "per_hour", "blog_post", "sales_page"] as const) {
        const r = runTool({
          experienceLevel: level,
          deliverable,
          wordCount: 1000, // satisfies per_word requirement
        });
        assert.strictEqual(r.ok, true, `${level}/${deliverable}`);
        const [low, high] = BENCHMARK_TABLE[deliverable][level];
        assert.strictEqual(r.values!.rateRangeLow, low);
        assert.strictEqual(r.values!.rateRangeHigh, high);
      }
    }
  });

  it("labels every result as an estimate in the note", () => {
    const r = runTool({ experienceLevel: "expert", deliverable: "per_hour" });
    assert.strictEqual(r.ok, true);
    assert.match(r.values!.note as string, /ESTIMATE/);
    assert.match(r.values!.note as string, /not official rates/);
  });
});

describe("runTool — custom rate overrides", () => {
  it("replaces the benchmark band with user-entered custom rates", () => {
    const r = runTool({
      experienceLevel: "beginner",
      deliverable: "per_word",
      wordCount: 800,
      customRateLow: 0.2,
      customRateHigh: 0.4,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.rateRangeLow, 0.2);
    assert.strictEqual(r.values!.rateRangeHigh, 0.4);
    assert.match(r.values!.note as string, /custom rates/);
  });

  it("still applies the niche premium on top of custom rates (0.20 × 1.5 = 0.30)", () => {
    const r = runTool({
      experienceLevel: "beginner",
      deliverable: "per_word",
      wordCount: 800,
      customRateLow: 0.2,
      customRateHigh: 0.4,
      nichePremium: 50,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.rateRangeLow, 0.3);
    assert.strictEqual(r.values!.rateRangeHigh, 0.6);
  });

  it("rejects a lone customRateLow without customRateHigh", () => {
    const r = runTool({
      experienceLevel: "beginner",
      deliverable: "per_word",
      wordCount: 800,
      customRateLow: 0.2,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /both/i);
  });

  it("rejects customRateHigh below customRateLow", () => {
    const r = runTool({
      experienceLevel: "beginner",
      deliverable: "per_word",
      wordCount: 800,
      customRateLow: 0.5,
      customRateHigh: 0.3,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least the custom rate low/);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing experienceLevel", () => {
    assert.strictEqual(runTool({ deliverable: "per_word", wordCount: 100 }).ok, false);
  });

  it("rejects an unknown experience level", () => {
    const r = runTool({ experienceLevel: "guru", deliverable: "per_word", wordCount: 100 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /experience level/i);
  });

  it("rejects missing deliverable", () => {
    assert.strictEqual(runTool({ experienceLevel: "expert" }).ok, false);
  });

  it("rejects an unknown deliverable", () => {
    const r = runTool({ experienceLevel: "expert", deliverable: "ebook" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /deliverable/i);
  });

  it("rejects per_word without wordCount", () => {
    const r = runTool({ experienceLevel: "intermediate", deliverable: "per_word" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Word count/i);
  });

  it("rejects zero wordCount", () => {
    assert.strictEqual(
      runTool({ experienceLevel: "intermediate", deliverable: "per_word", wordCount: 0 }).ok,
      false,
    );
  });

  it("rejects negative nichePremium", () => {
    assert.strictEqual(
      runTool({ experienceLevel: "expert", deliverable: "per_hour", nichePremium: -10 }).ok,
      false,
    );
  });

  it("rejects non-numeric wordCount", () => {
    assert.strictEqual(
      runTool({ experienceLevel: "intermediate", deliverable: "per_word", wordCount: "many" as never }).ok,
      false,
    );
  });

  it("rejects a non-object values argument", () => {
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — contract & determinism", () => {
  it("is deterministic: two runs with the same inputs are identical", () => {
    const args = { experienceLevel: "expert", deliverable: "sales_page", wordCount: 2500, nichePremium: 75 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returned output ids exactly match meta.ts outputs", () => {
    const r = runTool({ experienceLevel: "intermediate", deliverable: "per_word", wordCount: 1200 });
    assert.strictEqual(r.ok, true);
    const expected = outputs.map((o) => o.id).sort();
    assert.deepStrictEqual(Object.keys(r.values!).sort(), expected);
  });

  it("the benchmark table itself contains sane low <= high bands", () => {
    for (const deliverable of Object.keys(BENCHMARK_TABLE) as (keyof typeof BENCHMARK_TABLE)[]) {
      for (const level of Object.keys(BENCHMARK_TABLE[deliverable]) as ("beginner" | "intermediate" | "expert" | "specialist")[]) {
        const [low, high] = BENCHMARK_TABLE[deliverable][level];
        assert.ok(low > 0 && high >= low, `${level}/${deliverable} band invalid`);
      }
    }
  });
});
