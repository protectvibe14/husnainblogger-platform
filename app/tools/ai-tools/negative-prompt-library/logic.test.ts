import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  filterByCategory,
  phrasesForUseCase,
  buildNegativePrompt,
  NEGATIVE_PROMPTS,
  NEGATIVE_CATEGORIES,
  USE_CASES,
  EXPECTED_BANK_SIZE,
} from "./logic.ts";

describe("negative-prompt-library", () => {
  it("bank contains exactly 60 phrases across 6 categories", () => {
    assert.equal(NEGATIVE_PROMPTS.length, EXPECTED_BANK_SIZE);
    assert.equal(NEGATIVE_CATEGORIES.length, 6);
    for (const c of NEGATIVE_CATEGORIES) {
      const inCat = NEGATIVE_PROMPTS.filter((p) => p.category === c.id);
      assert.equal(inCat.length, 10, `category ${c.id} should have 10 phrases`);
    }
  });

  it("bank has no duplicate phrases", () => {
    const lowered = NEGATIVE_PROMPTS.map((p) => p.phrase.toLowerCase());
    assert.equal(new Set(lowered).size, lowered.length);
  });

  it("happy path: default run returns all 60 + combined prompt", () => {
    const r = runTool({});
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["count"], 60);
    const combined = v["combinedPrompt"] as string;
    assert.ok(combined.startsWith("worst quality, low quality, ugly"));
    assert.ok(combined.includes("blurry"));
    assert.ok(combined.includes("extra fingers"));
  });

  it("category filter returns only that category", () => {
    const r = runTool({ categoryId: "anatomy" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["count"], 10);
    const items = v["items"] as { phrase: string; category: string }[];
    assert.ok(items.every((i) => i.category === "anatomy"));
    assert.ok(items.some((i) => i.phrase === "extra fingers"));
  });

  it("filterByCategory('all') returns the whole bank", () => {
    assert.equal(filterByCategory("all").length, 60);
  });

  it("use-case preset maps to expected categories", () => {
    const portraits = phrasesForUseCase("portraits");
    const cats = new Set(portraits.map((p) => p.category));
    assert.ok(cats.has("anatomy"));
    assert.ok(cats.has("lighting-exposure"));
    assert.ok(cats.has("composition"));
    assert.ok(!cats.has("text-typography"));
    assert.ok(portraits.length > 0);
    assert.equal(
      new Set(portraits.map((p) => p.phrase)).size,
      portraits.length,
      "recommended list is deduped",
    );
  });

  it("use-case 'all' recommends all 60", () => {
    assert.equal(phrasesForUseCase("all").length, 60);
  });

  it("unknown use case id returns empty recommendations", () => {
    assert.deepEqual(phrasesForUseCase("nope"), []);
  });

  it("combined prompt includes custom phrases, deduped", () => {
    const r = runTool({
      categoryId: "composition",
      customPhrases: "dark mood, blurry, dark mood",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const combined = v["combinedPrompt"] as string;
    assert.ok(combined.includes("dark mood"));
    assert.equal(
      combined.split(", ").filter((s) => s === "dark mood").length,
      1,
      "custom phrase appears once",
    );
    assert.deepEqual(v["customAdded"], ["dark mood", "blurry"]);
  });

  it("buildNegativePrompt always opens with the base openers", () => {
    const s = buildNegativePrompt([], []);
    assert.equal(s, "worst quality, low quality, ugly");
  });

  it("validation: unknown category -> error", () => {
    const r = runTool({ categoryId: "nope" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: unknown use case -> error", () => {
    const r = runTool({ useCaseId: "nope" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-string customPhrases -> error", () => {
    const r = runTool({ customPhrases: 42 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("all use cases reference real categories", () => {
    const ids = new Set(NEGATIVE_CATEGORIES.map((c) => c.id));
    for (const u of USE_CASES) {
      for (const c of u.categories) assert.ok(ids.has(c), `${u.id} -> ${c}`);
    }
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = { categoryId: "anatomy", useCaseId: "portraits", customPhrases: "x" };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
