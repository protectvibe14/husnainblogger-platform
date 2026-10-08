import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseUrlList,
  renderSitemapXml,
  isValidDate,
  isAbsoluteHttpUrl,
  escapeXml,
  MAX_URLS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    urls: [
      "https://example.com/ | 2026-09-30 | daily | 1.0",
      "https://example.com/about",
      "https://example.com/blog/post-1 | 2026-09-01 | weekly | 0.8",
    ].join("\n"),
  };
}

describe("xml-sitemap-generator", () => {
  it("happy path: 3 URLs -> valid sitemap XML", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 3);
    const xml = r.values?.sitemapXml as string;
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(xml, /<loc>https:\/\/example\.com\/<\/loc>/);
    assert.match(xml, /<lastmod>2026-09-30<\/lastmod>/);
    assert.match(xml, /<changefreq>daily<\/changefreq>/);
    assert.match(xml, /<priority>1\.0<\/priority>/);
    assert.match(xml, /<\/urlset>$/);
    assert.deepEqual(r.values?.errors, []);
  });

  it("minimal entry: URL only -> loc only, no optional tags", () => {
    const r = runTool({ urls: "https://example.com/about" });
    assert.equal(r.ok, true);
    const xml = r.values?.sitemapXml as string;
    assert.match(xml, /<loc>https:\/\/example\.com\/about<\/loc>/);
    assert.doesNotMatch(xml, /lastmod/);
    assert.doesNotMatch(xml, /changefreq/);
    assert.doesNotMatch(xml, /priority/);
  });

  it("empty urls -> ok:false", () => {
    const r = runTool({ urls: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /at least one URL/i);
  });

  it("all invalid -> ok:false", () => {
    const r = runTool({ urls: "not-a-url\nstill/not/absolute" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /No valid URLs/i);
  });

  it("bad lastmod line is skipped with note, rest still generated", () => {
    const r = runTool({
      urls: "https://example.com/a | 2026-13-99\nhttps://example.com/b",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 1);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /not a valid YYYY-MM-DD/i.test(e)));
  });

  it("bad changefreq with a valid line -> skipped with note", () => {
    const r = runTool({
      urls: "https://example.com/a | 2026-01-01 | sometimes\nhttps://example.com/b",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 1);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /changefreq/i.test(e)));
  });

  it("bad changefreq alone -> ok:false", () => {
    const r = runTool({ urls: "https://example.com/a | 2026-01-01 | sometimes" });
    assert.equal(r.ok, false); // all lines invalid -> failure
    assert.match(r.error ?? "", /No valid URLs/i);
  });

  it("priority out of range -> skipped", () => {
    const r = runTool({
      urls: "https://example.com/a | 2026-01-01 | daily | 1.5\nhttps://example.com/b",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 1);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /priority/i.test(e)));
  });

  it("relative URL without baseUrl -> skipped with note", () => {
    const r = runTool({ urls: "/contact\nhttps://example.com/" });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 1);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /not an absolute URL/i.test(e)));
  });

  it("relative URL with baseUrl -> resolved", () => {
    const r = runTool({
      urls: "/contact\nabout",
      baseUrl: "https://example.com",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 2);
    const xml = r.values?.sitemapXml as string;
    assert.match(xml, /<loc>https:\/\/example\.com\/contact<\/loc>/);
    assert.match(xml, /<loc>https:\/\/example\.com\/about<\/loc>/);
  });

  it("invalid baseUrl -> ok:false", () => {
    const r = runTool({ urls: "https://example.com/", baseUrl: "example.com" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Base URL/i);
  });

  it("duplicate URLs are de-duplicated", () => {
    const r = runTool({
      urls: "https://example.com/\nhttps://example.com/\nhttps://example.com/a",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 2);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /duplicate/i.test(e)));
  });

  it("unicode URL is percent-encoded", () => {
    const r = runTool({ urls: "https://example.com/café" });
    assert.equal(r.ok, true);
    assert.match(r.values?.sitemapXml as string, /caf%C3%A9/);
  });

  it("more than 50000 URLs -> ok:false (no silent truncation)", () => {
    const lines = Array.from({ length: MAX_URLS + 1 }, (_, i) => `https://example.com/p${i}`);
    const r = runTool({ urls: lines.join("\n") });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /50,000|50000/);
  });

  it("exactly 50000 URLs -> ok", () => {
    const lines = Array.from({ length: MAX_URLS }, (_, i) => `https://example.com/q${i}`);
    const r = runTool({ urls: lines.join("\n") });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, MAX_URLS);
  });

  it("comment and blank lines are ignored", () => {
    const r = runTool({ urls: "# my pages\n\nhttps://example.com/\n" });
    assert.equal(r.ok, true);
    assert.equal(r.values?.urlCount, 1);
  });

  it("deterministic: same inputs -> identical output", () => {
    const a = runTool(happyValues());
    const b = runTool(happyValues());
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), [...OUTPUT_IDS].sort());
  });

  it("non-object values -> ok:false", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("isValidDate: real calendar dates only", () => {
    assert.equal(isValidDate("2026-02-28"), true);
    assert.equal(isValidDate("2026-02-29"), false); // 2026 is not a leap year
    assert.equal(isValidDate("2024-02-29"), true); // leap year
    assert.equal(isValidDate("2026-13-01"), false);
    assert.equal(isValidDate("2026-01-32"), false);
    assert.equal(isValidDate("not-a-date"), false);
  });

  it("escapeXml escapes XML special chars", () => {
    assert.equal(escapeXml('a&b<c>d"e\'f'), "a&amp;b&lt;c&gt;d&quot;e&apos;f");
  });

  it("parseUrlList changefreq case-insensitive", () => {
    const { entries } = parseUrlList("https://example.com/ | 2026-01-01 | DAILY", "");
    assert.equal(entries[0].changefreq, "daily");
  });

  it("renderSitemapXml: empty list -> urlset shell", () => {
    const xml = renderSitemapXml([]);
    assert.match(xml, /<urlset/);
    assert.match(xml, /<\/urlset>/);
    assert.doesNotMatch(xml, /<url>/);
  });
});
