import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  estimateTitleWidthPx,
  TITLE_MAX_CHARS,
  DESCRIPTION_MAX_CHARS,
  DATE_MAX_CHARS,
  TITLE_TRUNCATE_PX,
  BREADCRUMB_MAX_CHARS,
} from "./logic.ts";

function okValues(input: Record<string, unknown>) {
  const r = runTool(input);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("serp-snippet-preview-tool", () => {
  it("happy path: title, url, description, date", () => {
    const v = okValues({
      title: "How to Start a Blog in 2026",
      url: "https://example.com/how-to-start-a-blog/",
      description: "Learn how to start a blog step by step.",
      date: "Jan 5, 2026",
    });
    assert.equal(typeof v.previewHtml, "string");
    assert.equal(typeof v.titleWidthPxEstimate, "number");
    assert.equal(typeof v.truncationWarning, "string");
    assert.match(v.previewHtml as string, /How to Start a Blog in 2026/);
    assert.match(v.previewHtml as string, /example\.com/);
    assert.match(v.previewHtml as string, /Jan 5, 2026/);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ title: "Hello", url: "https://example.com/" });
    assert.deepEqual(Object.keys(v).sort(), [
      "previewHtml",
      "titleWidthPxEstimate",
      "truncationWarning",
    ]);
  });

  it("width estimate uses the char table: 'iii' = 12 px", () => {
    assert.equal(estimateTitleWidthPx("iii"), 12);
  });

  it("wide chars count more: 'mmm' > 'iii'", () => {
    assert.ok(estimateTitleWidthPx("mmm") > estimateTitleWidthPx("iii"));
  });

  it("short title: no truncation warning", () => {
    const v = okValues({ title: "Short title", url: "https://example.com/" });
    assert.match(v.truncationWarning as string, /^No/);
    assert.ok((v.titleWidthPxEstimate as number) <= TITLE_TRUNCATE_PX);
  });

  it("very wide title: truncation warning", () => {
    const v = okValues({
      title: "m".repeat(60), // 60 * 15 = 900 px > 600
      url: "https://example.com/",
    });
    assert.equal(v.titleWidthPxEstimate, 900);
    assert.match(v.truncationWarning as string, /^Yes/);
    assert.match(v.truncationWarning as string, /900 px/);
  });

  it("emoji in title counts wide and is escaped", () => {
    const v = okValues({
      title: "Best snacks 😋",
      url: "https://example.com/",
    });
    // 😋 is a surrogate-pair emoji -> 24 px; plain text would be much less
    assert.ok((v.titleWidthPxEstimate as number) > estimateTitleWidthPx("Best snacks x"));
    assert.match(v.previewHtml as string, /😋/);
  });

  it("unicode title is escaped, not executed", () => {
    const v = okValues({
      title: '<script>alert("x")</script> Ünïcodé',
      url: "https://example.com/",
    });
    assert.ok(!(v.previewHtml as string).includes("<script>"));
    assert.match(v.previewHtml as string, /&lt;script&gt;/);
  });

  it("very long URL gets middle-truncated breadcrumb", () => {
    const longPath = "/a/" + "segment-".repeat(20) + "final-page";
    const v = okValues({
      title: "Title",
      url: "https://example.com" + longPath,
    });
    assert.match(v.previewHtml as string, /…/);
    assert.ok((v.previewHtml as string).length < 4000);
  });

  it("breadcrumb keeps host for a root URL", () => {
    const v = okValues({ title: "T", url: "https://example.com" });
    assert.match(v.previewHtml as string, /example\.com/);
  });

  it("missing description shows honest placeholder", () => {
    const v = okValues({ title: "Title", url: "https://example.com/" });
    assert.match(v.previewHtml as string, /No meta description entered/);
  });

  it("description HTML is escaped", () => {
    const v = okValues({
      title: "T",
      url: "https://example.com/",
      description: 'Desc with <b>tags</b> & "quotes"',
    });
    assert.ok(!(v.previewHtml as string).includes("<b>tags</b>"));
    assert.match(v.previewHtml as string, /&lt;b&gt;tags&lt;\/b&gt;/);
  });

  it("missing title rejected", () => {
    const r = runTool({ url: "https://example.com/" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /page title/i);
  });

  it("blank title rejected", () => {
    const r = runTool({ title: "   ", url: "https://example.com/" });
    assert.equal(r.ok, false);
  });

  it(`title over ${TITLE_MAX_CHARS} chars rejected`, () => {
    const r = runTool({ title: "x".repeat(TITLE_MAX_CHARS + 1), url: "https://example.com/" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /200 characters or fewer/);
  });

  it(`title at exactly ${TITLE_MAX_CHARS} chars accepted`, () => {
    const v = okValues({ title: "x".repeat(TITLE_MAX_CHARS), url: "https://example.com/" });
    assert.ok((v.titleWidthPxEstimate as number) > 0);
  });

  it("missing url rejected", () => {
    const r = runTool({ title: "Title" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /page URL/i);
  });

  it("url without protocol rejected", () => {
    const r = runTool({ title: "Title", url: "example.com/page" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /http/);
  });

  it("non-http protocol rejected", () => {
    const r = runTool({ title: "Title", url: "ftp://example.com/x" });
    assert.equal(r.ok, false);
  });

  it("http url accepted", () => {
    const v = okValues({ title: "T", url: "http://example.com/page" });
    assert.match(v.previewHtml as string, /example\.com/);
  });

  it(`description over ${DESCRIPTION_MAX_CHARS} chars rejected`, () => {
    const r = runTool({
      title: "T",
      url: "https://example.com/",
      description: "x".repeat(DESCRIPTION_MAX_CHARS + 1),
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /500 characters or fewer/);
  });

  it(`date over ${DATE_MAX_CHARS} chars rejected`, () => {
    const r = runTool({
      title: "T",
      url: "https://example.com/",
      date: "x".repeat(DATE_MAX_CHARS + 1),
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /60 characters or fewer/);
  });

  it("non-object input rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("non-string title rejected", () => {
    const r = runTool({ title: 123, url: "https://example.com/" });
    assert.equal(r.ok, false);
  });

  it("mockup carries the honesty disclaimer", () => {
    const v = okValues({ title: "T", url: "https://example.com/" });
    assert.match(v.previewHtml as string, /not live Google data/i);
  });

  it("deterministic: same inputs give identical output twice", () => {
    const input = {
      title: "Deterministic 😋 title",
      url: "https://example.com/some/very/long/path/segment/",
      description: "Desc & <more>",
      date: "2026-01-05",
    };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("boundary: title at exactly the 600 px cutoff is not flagged", () => {
    // 40 'm' chars = 600 px exactly -> not over the cutoff
    const v = okValues({ title: "m".repeat(40), url: "https://example.com/" });
    assert.equal(v.titleWidthPxEstimate, TITLE_TRUNCATE_PX);
    assert.match(v.truncationWarning as string, /^No/);
  });

  it("breadcrumb max chars constant is sane", () => {
    assert.equal(BREADCRUMB_MAX_CHARS, 64);
  });
});
