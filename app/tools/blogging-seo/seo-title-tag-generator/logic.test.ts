import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  estimatePixelWidth,
  TEMPLATE_COUNT,
  TITLE_MIN_RECOMMENDED,
  TITLE_MAX_RECOMMENDED,
  TITLE_TRUNCATE_PX,
  DEFAULT_CHAR_WIDTH,
  EMOJI_CHAR_WIDTH,
  MAX_KEYWORD_CHARS,
  MAX_BRAND_CHARS,
  MAX_TOPIC_CHARS,
} from "./logic.ts";

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("seo-title-tag-generator", () => {
  it("happy path: 6 template titles with keyword and brand", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing tips", brand: "HusnainBlog" });
    const titles = v.titles as string[];
    assert.equal(titles.length, TEMPLATE_COUNT);
    for (const t of titles) {
      assert.ok(t.length > 0);
      assert.ok(!t.includes("{keyword}") && !t.includes("{topic}") && !t.includes("{brand}"));
      assert.match(t.toLowerCase(), /email marketing tips/);
    }
    assert.match(titles[5], /HusnainBlog/);
  });

  it("primary title front-loads the keyword", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing tips" });
    const titles = v.titles as string[];
    assert.ok(titles[0].toLowerCase().startsWith("email marketing tips"));
  });

  it("brand falls back when omitted", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing tips" });
    const titles = v.titles as string[];
    assert.ok(titles[5].length > 0);
    assert.ok(!titles[5].includes("{brand}"));
  });

  it("missing topic fails", () => {
    const r = runTool({ targetKeyword: "keyword" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Topic is required/);
  });

  it("missing target keyword fails", () => {
    const r = runTool({ topic: "email marketing", targetKeyword: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Target keyword is required/);
  });

  it("over-long keyword fails", () => {
    const r = runTool({ topic: "email marketing", targetKeyword: "k".repeat(MAX_KEYWORD_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /100 characters or fewer/);
  });

  it("over-long brand fails", () => {
    const r = runTool({ topic: "email marketing", targetKeyword: "tips", brand: "b".repeat(MAX_BRAND_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /40 characters or fewer/);
  });

  it("over-long topic fails", () => {
    const r = runTool({ topic: "t".repeat(MAX_TOPIC_CHARS + 1), targetKeyword: "tips" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /200 characters or fewer/);
  });

  it("edge: very long topic flags overCharLimit", () => {
    const v = okRun({
      topic: "a very long topic name that keeps going and going for many characters",
      targetKeyword: "tips",
    });
    const la = v.lengthAnalysis as { titles: { overCharLimit: boolean }[] };
    assert.ok(la.titles.some((t) => t.overCharLimit === true));
    assert.equal(la.titles.length, (v.titles as string[]).length);
  });

  it("edge: unicode title estimates pixel width with code-point rules", () => {
    const v = okRun({ topic: "meal prep 🥗 ideas", targetKeyword: "meal prep" });
    const la = v.lengthAnalysis as { titles: { pixelWidthEstimate: number }[] };
    assert.ok(la.titles[0].pixelWidthEstimate > 0);
    // Emoji costs EMOJI_CHAR_WIDTH (24), so a single emoji is wider than a plain char.
    assert.ok(estimatePixelWidth("🥗") === EMOJI_CHAR_WIDTH);
    assert.ok(estimatePixelWidth("a") === 10);
  });

  it("pixelWidthEstimate output equals the first title's estimate", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "email marketing tips" });
    const la = v.lengthAnalysis as { titles: { pixelWidthEstimate: number }[] };
    assert.equal(v.pixelWidthEstimate, la.titles[0].pixelWidthEstimate);
    assert.equal(typeof v.pixelWidthEstimate, "number");
  });

  it("unknown BMP chars default to 10 px", () => {
    assert.equal(estimatePixelWidth("Ω"), DEFAULT_CHAR_WIDTH);
  });

  it("length analysis exposes the 50-60 convention and 600 px cutoff", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "tips" });
    const la = v.lengthAnalysis as {
      recommendedMin: number;
      recommendedMax: number;
      pixelCutoff: number;
      note: string;
    };
    assert.equal(la.recommendedMin, TITLE_MIN_RECOMMENDED);
    assert.equal(la.recommendedMax, TITLE_MAX_RECOMMENDED);
    assert.equal(la.pixelCutoff, TITLE_TRUNCATE_PX);
    assert.match(la.note, /not guarantees/);
  });

  it("titles dedupe when topic equals keyword", () => {
    const v = okRun({ topic: "seo", targetKeyword: "seo" });
    const titles = v.titles as string[];
    assert.equal(new Set(titles.map((t) => t.toLowerCase())).size, titles.length);
  });

  it("deterministic: same inputs give identical outputs", () => {
    const input = { topic: "email marketing", targetKeyword: "email marketing tips", brand: "B" };
    assert.deepEqual(okRun(input), okRun(input));
  });

  it("output ids match contract: titles, lengthAnalysis, pixelWidthEstimate", () => {
    const v = okRun({ topic: "email marketing", targetKeyword: "tips" });
    assert.deepEqual(Object.keys(v).sort(), ["lengthAnalysis", "pixelWidthEstimate", "titles"]);
    assert.ok(Array.isArray(v.titles));
  });

  it("non-object input fails gracefully", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });
});
