import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  escapeHtml,
  toNumber,
  starFillPercent,
  formatRating,
  buildStarRatingBox,
} from "./logic.ts";

describe("star-rating-box-generator", () => {
  it("builds a box on a happy path", () => {
    const r = runTool({ rating: 4.5, title: "Great product", reviewCount: 12 });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    assert.ok(html.includes("Great product"));
    assert.ok(html.includes("4.5 out of 5 · 12 reviews"));
    assert.ok(html.includes("width:90%"));
    assert.ok((r.values!.boxCss as string).includes(".hb-starrating"));
  });

  it("renders a fractional rating as a partial fill", () => {
    const r = runTool({ rating: 3.7 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("width:74%"));
    assert.equal(starFillPercent(3.7), 74);
  });

  it("renders a rating of 0 as an empty fill", () => {
    const r = runTool({ rating: 0 });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    assert.ok(html.includes("width:0%"));
    assert.ok(html.includes("0.0 out of 5"));
  });

  it("renders a rating of 5 as a full fill", () => {
    const r = runTool({ rating: 5 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("width:100%"));
  });

  it("works without a title", () => {
    const r = runTool({ rating: 4 });
    assert.equal(r.ok, true);
    assert.ok(!(r.values!.boxHtml as string).includes("hb-starrating-title"));
  });

  it("works without a review count", () => {
    const r = runTool({ rating: 4 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("4.0 out of 5"));
    assert.ok(!(r.values!.boxHtml as string).includes("reviews"));
  });

  it("uses singular 'review' for a count of 1", () => {
    const r = runTool({ rating: 4, reviewCount: 1 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("1 review<"));
  });

  it("rejects a rating above 5", () => {
    const r = runTool({ rating: 5.1 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 5/);
  });

  it("rejects a negative rating", () => {
    const r = runTool({ rating: -1 });
    assert.equal(r.ok, false);
  });

  it("rejects a missing rating", () => {
    const r = runTool({ title: "x" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Rating is required/);
  });

  it("rejects a non-numeric rating", () => {
    const r = runTool({ rating: "great" });
    assert.equal(r.ok, false);
  });

  it("rejects a negative review count", () => {
    const r = runTool({ rating: 4, reviewCount: -2 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Review count/);
  });

  it("rejects a fractional review count", () => {
    const r = runTool({ rating: 4, reviewCount: 2.5 });
    assert.equal(r.ok, false);
  });

  it("accepts a review count of 0", () => {
    const r = runTool({ rating: 4, reviewCount: 0 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("0 reviews"));
  });

  it("rejects a title over 100 chars", () => {
    const r = runTool({ rating: 4, title: "t".repeat(101) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Title is 101 chars/);
  });

  it("escapes the title", () => {
    const r = runTool({ rating: 4, title: "<script>x</script>" });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("escapes quotes and ampersands in the title", () => {
    assert.equal(escapeHtml('a&b"c'), "a&amp;b&quot;c");
  });

  it("keeps unicode titles intact", () => {
    const r = runTool({ rating: 4.5, title: "بہترین ⭐" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("بہترین ⭐"));
  });

  it("accepts a numeric string rating", () => {
    const r = runTool({ rating: "4.5" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("width:90%"));
  });

  it("formatRating shows one decimal", () => {
    assert.equal(formatRating(4), "4.0");
    assert.equal(formatRating(4.567), "4.6");
    assert.equal(toNumber("4.5"), 4.5);
  });

  it("buildStarRatingBox carries an accessible label", () => {
    const { boxHtml } = buildStarRatingBox(4.5, null, null);
    assert.ok(boxHtml.includes('aria-label="Rated 4.5 out of 5 stars"'));
  });

  it("is deterministic (same inputs → identical outputs)", () => {
    const input = { rating: 3.2, title: "T", reviewCount: 7 };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("returns exactly the output ids defined in meta.ts", () => {
    const r = runTool({ rating: 4 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["boxCss", "boxHtml"]);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
