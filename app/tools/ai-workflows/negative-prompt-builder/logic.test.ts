import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SUGGESTED_TERMS, cleanTerm, combineTerms, runTool } from "./logic.ts";

describe("cleanTerm", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(cleanTerm("  bad   anatomy  "), "bad anatomy");
  });

  it("replaces embedded commas with spaces", () => {
    assert.equal(cleanTerm("blurry, low quality"), "blurry low quality");
  });

  it("returns empty string for non-strings", () => {
    assert.equal(cleanTerm(undefined), "");
    assert.equal(cleanTerm(42), "");
  });
});

describe("combineTerms", () => {
  it("joins terms with comma-space in order", () => {
    assert.equal(combineTerms(["blurry", "watermark", "text"]), "blurry, watermark, text");
  });

  it("dedupes case-insensitively, keeping the first spelling", () => {
    assert.equal(combineTerms(["Blurry", "blurry", "BLURRY"]), "Blurry");
  });

  it("keeps a single term as-is", () => {
    assert.equal(combineTerms(["noisy"]), "noisy");
  });
});

describe("runTool — happy path", () => {
  it("builds a negative prompt from rows", () => {
    const res = runTool({ items: [{ term: "blurry" }, { term: "watermark" }, { term: "text" }] });
    assert.equal(res.ok, true);
    assert.equal(res.values!.negativePrompt, "blurry, watermark, text");
  });

  it("trims terms and drops duplicates across rows", () => {
    const res = runTool({ items: [{ term: "  blurry " }, { term: "BlurrY" }, { term: "logo" }] });
    assert.equal(res.ok, true);
    assert.equal(res.values!.negativePrompt, "blurry, logo");
  });

  it("handles commas typed inside a term", () => {
    const res = runTool({ items: [{ term: "blurry, low quality" }] });
    assert.equal(res.ok, true);
    assert.equal(res.values!.negativePrompt, "blurry low quality");
  });

  it("accepts every suggested term without errors", () => {
    assert.equal(SUGGESTED_TERMS.length, 24);
    const res = runTool({ items: SUGGESTED_TERMS.map((term) => ({ term })) });
    assert.equal(res.ok, true);
    assert.ok((res.values!.negativePrompt as string).length > 0);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing items", () => {
    const res = runTool({} as unknown as { items: Record<string, unknown>[] });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects an empty items array", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
  });

  it("rejects a blank term, naming the item number", () => {
    const res = runTool({ items: [{ term: "blurry" }, { term: "   " }] });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("Item 2"));
  });

  it("rejects a non-string term", () => {
    const res = runTool({ items: [{ term: 123 }] });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("Item 1"));
  });

  it("rejects a missing term field", () => {
    const res = runTool({ items: [{ note: "oops" }] });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("Item 1"));
  });
});

describe("runTool — determinism and output contract", () => {
  it("same items -> identical output (deep equal)", () => {
    const args = { items: [{ term: "blurry" }, { term: "watermark" }] };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("returns exactly one output key: negativePrompt (matches meta.ts outputs)", () => {
    const res = runTool({ items: [{ term: "blurry" }] });
    assert.deepEqual(Object.keys(res.values!).sort(), ["negativePrompt"]);
  });
});
