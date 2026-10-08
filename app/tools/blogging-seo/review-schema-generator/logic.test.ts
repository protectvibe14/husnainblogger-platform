import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_ITEM_NAME_CHARS,
  MAX_AUTHOR_CHARS,
  MAX_REVIEW_BODY_CHARS,
  DEFAULT_BEST_RATING,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    itemName: "Acme Pour-Over Dripper",
    author: "Jane Doe",
    ratingValue: 4.5,
    bestRating: 5,
    reviewBody: "Excellent build quality and a clean cup. Highly recommended.",
  };
}

describe("review-schema-generator", () => {
  it("happy path: all fields -> valid Review JSON-LD", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed["@context"], "https://schema.org");
    assert.equal(parsed["@type"], "Review");
    assert.equal(parsed.itemReviewed["@type"], "Thing");
    assert.equal(parsed.itemReviewed.name, "Acme Pour-Over Dripper");
    assert.equal(parsed.author["@type"], "Person");
    assert.equal(parsed.author.name, "Jane Doe");
    assert.equal(parsed.reviewRating["@type"], "Rating");
    assert.equal(parsed.reviewRating.ratingValue, 4.5);
    assert.equal(parsed.reviewRating.bestRating, 5);
    assert.equal(
      parsed.reviewBody,
      "Excellent build quality and a clean cup. Highly recommended."
    );
    assert.deepEqual(r.values?.errors, []);
  });

  it("minimal: no reviewBody -> ok:true with a note, no reviewBody key", () => {
    const r = runTool({
      itemName: "Widget",
      author: "Sam",
      ratingValue: 4,
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.reviewBody, undefined);
    assert.equal(parsed.reviewRating.bestRating, DEFAULT_BEST_RATING);
    const errs = r.values?.errors as string[];
    assert.ok(errs.length > 0);
    assert.match(errs[0], /no review text/i);
  });

  it("missing itemName -> ok:false", () => {
    const r = runTool({ itemName: "  ", author: "A", ratingValue: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /item being reviewed/i);
  });

  it("itemName over max chars -> ok:false", () => {
    const r = runTool({
      itemName: "i".repeat(MAX_ITEM_NAME_CHARS + 1),
      author: "A",
      ratingValue: 4,
    });
    assert.equal(r.ok, false);
  });

  it("missing author -> ok:false", () => {
    const r = runTool({ itemName: "Widget", author: "", ratingValue: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /reviewer name/i);
  });

  it("author over max chars -> ok:false", () => {
    const r = runTool({
      itemName: "Widget",
      author: "a".repeat(MAX_AUTHOR_CHARS + 1),
      ratingValue: 4,
    });
    assert.equal(r.ok, false);
  });

  it("missing ratingValue -> ok:false", () => {
    const r = runTool({ itemName: "Widget", author: "A" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /numeric rating/i);
  });

  it("non-numeric rating -> ok:false", () => {
    const r = runTool({ itemName: "Widget", author: "A", ratingValue: "great" });
    assert.equal(r.ok, false);
  });

  it("rating above bestRating -> ok:false", () => {
    const r = runTool({ itemName: "Widget", author: "A", ratingValue: 6 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 0 and 5/);
  });

  it("rating 0 is allowed and rendered", () => {
    const r = runTool({ itemName: "Widget", author: "A", ratingValue: 0 });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.reviewRating.ratingValue, 0);
  });

  it("negative rating -> ok:false", () => {
    const r = runTool({ itemName: "Widget", author: "A", ratingValue: -1 });
    assert.equal(r.ok, false);
  });

  it("numeric string rating accepted", () => {
    const r = runTool({ itemName: "Widget", author: "A", ratingValue: "4.5" });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.reviewRating.ratingValue, 4.5);
  });

  it("custom bestRating scales the allowed range", () => {
    const r = runTool({
      itemName: "Widget",
      author: "A",
      ratingValue: 8,
      bestRating: 10,
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.reviewRating.bestRating, 10);
    assert.equal(parsed.reviewRating.ratingValue, 8);
  });

  it("bestRating 0 or negative -> ok:false", () => {
    const r0 = runTool({ itemName: "W", author: "A", ratingValue: 0, bestRating: 0 });
    assert.equal(r0.ok, false);
    const rNeg = runTool({ itemName: "W", author: "A", ratingValue: 0, bestRating: -5 });
    assert.equal(rNeg.ok, false);
  });

  it("rating above custom bestRating -> ok:false", () => {
    const r = runTool({
      itemName: "Widget",
      author: "A",
      ratingValue: 9,
      bestRating: 10,
    });
    assert.equal(r.ok, true); // sanity: 9 <= 10
    const bad = runTool({
      itemName: "Widget",
      author: "A",
      ratingValue: 11,
      bestRating: 10,
    });
    assert.equal(bad.ok, false);
    assert.match(bad.error ?? "", /between 0 and 10/);
  });

  it("reviewBody over max chars -> ok:false", () => {
    const r = runTool({
      ...happyValues(),
      reviewBody: "b".repeat(MAX_REVIEW_BODY_CHARS + 1),
    });
    assert.equal(r.ok, false);
  });

  it("unicode item and author preserved", () => {
    const r = runTool({
      itemName: "Kaffeemaschine ☕",
      author: "Jürgen Müller",
      ratingValue: 5,
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemReviewed.name, "Kaffeemaschine ☕");
  });

  it("non-object values -> ok:false", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("pretty-printed with 2-space indent", () => {
    const r = runTool(happyValues());
    assert.ok((r.values?.jsonLd as string).includes('\n  "@type"'));
  });

  it("deterministic: same input -> identical output", () => {
    const a = runTool(happyValues());
    const b = runTool(happyValues());
    assert.deepEqual(a.values, b.values);
  });

  it("output ids match meta.ts", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), OUTPUT_IDS);
    assert.deepEqual(OUTPUT_IDS, ["jsonLd", "errors"]);
  });
});
