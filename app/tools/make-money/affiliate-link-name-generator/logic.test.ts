/**
 * Tests for the Affiliate Link Name Generator (tool-506).
 *
 * Run: node --test app/tools/make-money/affiliate-link-name-generator/logic.test.ts
 *
 * Expected values are hand-computed from the documented slugify + variant
 * rules in logic.ts — never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  slugify,
  SUFFIX_BANK,
  MAX_BASE_LENGTH,
  DEFAULT_COUNT,
  MAX_COUNT,
  MAX_PRODUCT_NAME_LENGTH,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const okSlugs = (input: Record<string, unknown>): string[] => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  const v = r.values as Record<string, unknown>;
  assert.ok(Array.isArray(v.slugs), "slugs must be an array");
  return v.slugs as string[];
};

const errOf = (input: unknown): string => {
  const r = runTool(input as Record<string, unknown>);
  assert.strictEqual(r.ok, false, "expected failure, got ok");
  assert.ok(typeof r.error === "string" && r.error.length > 0, "error must be a non-empty string");
  return r.error as string;
};

describe("affiliate link name generator — happy path", () => {
  it("generates the exact requested variants", () => {
    // base "bluehost-wordpress-hosting"; then suffix bank order: -deal, -deals, -offer, -offers.
    assert.deepStrictEqual(okSlugs({ productName: "Bluehost WordPress Hosting", count: 5 }), [
      "bluehost-wordpress-hosting",
      "bluehost-wordpress-hosting-deal",
      "bluehost-wordpress-hosting-deals",
      "bluehost-wordpress-hosting-offer",
      "bluehost-wordpress-hosting-offers",
    ]);
  });

  it("defaults to 10 names when count is omitted", () => {
    const slugs = okSlugs({ productName: "Grammarly" });
    assert.strictEqual(slugs.length, DEFAULT_COUNT);
    assert.deepStrictEqual(slugs, [
      "grammarly",
      "grammarly-deal",
      "grammarly-deals",
      "grammarly-offer",
      "grammarly-offers",
      "grammarly-discount",
      "grammarly-bonus",
      "grammarly-review",
      "grammarly-reviews",
      "grammarly-guide",
    ]);
  });

  it("returns just the base slug for count 1", () => {
    assert.deepStrictEqual(okSlugs({ productName: "Semrush", count: 1 }), ["semrush"]);
  });

  it("uses numbered fallbacks past the 24-suffix bank", () => {
    // 1 base + 24 suffixes + numbered (base-2 .. base-26) = 50.
    const slugs = okSlugs({ productName: "ConvertKit", count: 50 });
    assert.strictEqual(slugs.length, 50);
    assert.strictEqual(slugs[25], "convertkit-2");
    assert.strictEqual(slugs[49], "convertkit-26");
  });

  it("dedupes within the batch", () => {
    const slugs = okSlugs({ productName: "Ahrefs", count: 30 });
    assert.strictEqual(new Set(slugs).size, slugs.length);
  });

  it("outputs only slug-safe characters", () => {
    const slugs = okSlugs({ productName: "Notion's AI 2.0 (Pro!)", count: 20 });
    for (const s of slugs) {
      assert.ok(/^[a-z0-9-]+$/.test(s), `slug-safe: ${s}`);
    }
    assert.strictEqual(slugs[0], "notion-s-ai-2-0-pro");
  });

  it("truncates the base slug to 40 chars without a trailing hyphen", () => {
    const slugs = okSlugs({ productName: `${"a".repeat(60)} extra words here`, count: 2 });
    assert.strictEqual(slugs[0], "a".repeat(40));
    assert.strictEqual(slugs[0].length, MAX_BASE_LENGTH);
  });

  it("trims a hyphen left dangling by the 40-char cut", () => {
    // "aaa…a-bbb" (43 chars) cut at 40 leaves "aaa…a-", trimmed to 39 a's.
    const slugs = okSlugs({ productName: `${"a".repeat(39)}  bbb`, count: 1 });
    assert.strictEqual(slugs[0], "a".repeat(39));
    assert.ok(!slugs[0].endsWith("-"));
  });

  it("keeps numbers and strips accents via the ascii-safe rule", () => {
    assert.deepStrictEqual(okSlugs({ productName: "iPhone 17 Pro", count: 1 }), ["iphone-17-pro"]);
    assert.deepStrictEqual(okSlugs({ productName: "Café Møbler", count: 1 }), ["caf-m-bler"]);
  });

  it("treats empty count as the default", () => {
    assert.strictEqual(okSlugs({ productName: "Trello", count: "" }).length, DEFAULT_COUNT);
    assert.strictEqual(okSlugs({ productName: "Trello", count: null }).length, DEFAULT_COUNT);
  });
});

describe("affiliate link name generator — validation errors", () => {
  it("rejects a missing product name", () => {
    assert.ok(errOf({}).includes("product name"));
  });

  it("rejects an empty or whitespace-only product name", () => {
    assert.ok(errOf({ productName: "" }).includes("product name"));
    assert.ok(errOf({ productName: "   " }).includes("product name"));
  });

  it("rejects a non-string product name", () => {
    assert.ok(errOf({ productName: 123 }).includes("product name"));
  });

  it("rejects names over 100 characters", () => {
    assert.ok(
      errOf({ productName: "x".repeat(MAX_PRODUCT_NAME_LENGTH + 1) }).includes("100 characters"),
    );
  });

  it("rejects punctuation-only names that leave an empty slug", () => {
    const e = errOf({ productName: "!!! ???" });
    assert.ok(e.includes("could not build"));
    assert.ok(e.includes("letters or numbers"));
  });

  it("rejects count 0, 51, non-integers, and non-numbers", () => {
    for (const count of [0, 51, 2.5, NaN, "abc", -3]) {
      const e = errOf({ productName: "Canva", count });
      assert.ok(e.includes("between 1 and 50"), `count=${count}: ${e}`);
    }
  });

  it("rejects a non-object input", () => {
    assert.ok(errOf(null).includes("object"));
  });
});

describe("affiliate link name generator — honesty and determinism", () => {
  it("runs twice with identical output (deterministic)", () => {
    const input = { productName: "Bluehost WordPress Hosting", count: 25 };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ productName: "Figma", count: 3 });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(
      Object.keys(r.values as Record<string, unknown>).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("word bank has its documented size and MAX_COUNT is 50", () => {
    assert.strictEqual(SUFFIX_BANK.length, 24, "24 fixed suffixes");
    assert.strictEqual(MAX_COUNT, 50);
    assert.ok(slugify("Hello World").length <= MAX_BASE_LENGTH);
  });
});
