import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parsePageList,
  renderSitemapHtml,
  isLinkableUrl,
  escapeHtml,
  MAX_PAGES,
  MAX_TITLE_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    pages: [
      "Home | https://example.com/",
      "Getting Started | https://example.com/start | Guides",
      "SEO Basics | https://example.com/seo-basics | Guides",
      "Pricing | /pricing | Company",
    ].join("\n"),
    siteName: "Example Blog",
  };
}

describe("html-sitemap-generator", () => {
  it("happy path: sections grouped, siteName in h1", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.values?.pageCount, 4);
    const html = r.values?.sitemapHtml as string;
    assert.match(html, /<h1>Example Blog Sitemap<\/h1>/);
    assert.match(html, /<h2>Guides<\/h2>/);
    assert.match(html, /<h2>Company<\/h2>/);
    assert.match(
      html,
      /<li><a href="https:\/\/example\.com\/start">Getting Started<\/a><\/li>/
    );
    assert.match(html, /<li><a href="\/pricing">Pricing<\/a><\/li>/);
  });

  it("no custom sections -> single list, no h2 headings", () => {
    const r = runTool({ pages: "Home | https://example.com/\nAbout | /about" });
    assert.equal(r.ok, true);
    assert.doesNotMatch(r.values?.sitemapHtml as string, /<h2>/);
    assert.match(r.values?.sitemapHtml as string, /<ul>/);
  });

  it("empty siteName -> plain Sitemap h1", () => {
    const r = runTool({ pages: "Home | https://example.com/" });
    assert.equal(r.ok, true);
    assert.match(r.values?.sitemapHtml as string, /<h1>Sitemap<\/h1>/);
  });

  it("siteName over 100 chars -> ok:false", () => {
    const r = runTool({ pages: "Home | https://example.com/", siteName: "x".repeat(101) });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Site name/i);
  });

  it("empty pages -> ok:false", () => {
    const r = runTool({ pages: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /at least one page/i);
  });

  it("all invalid lines -> ok:false", () => {
    const r = runTool({ pages: "No pipes here\nAlso | not a url at all!!" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /No valid pages/i);
  });

  it("bad URL line is skipped and reported in the HTML comment", () => {
    const r = runTool({
      pages: "Good | https://example.com/\nBad | example.com/no-scheme",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pageCount, 1);
    const html = r.values?.sitemapHtml as string;
    assert.match(html, /<!--.*Skipped 1.*-->/s);
    // The skipped URL may appear inside the report comment, but never as a link.
    assert.doesNotMatch(html, /<a[^>]*no-scheme/);
  });

  it("empty title line is skipped", () => {
    const { pages, notes } = parsePageList(" | https://example.com/\nA | /a");
    assert.equal(pages.length, 1);
    assert.ok(notes.some((n) => /no title/i.test(n)));
  });

  it("over-long title line is skipped", () => {
    const { pages, notes } = parsePageList(
      `${"x".repeat(MAX_TITLE_CHARS + 1)} | https://example.com/\nA | /a`
    );
    assert.equal(pages.length, 1);
    assert.ok(notes.some((n) => /max 200/i.test(n)));
  });

  it("root-relative URLs are accepted", () => {
    const r = runTool({ pages: "Contact | /contact" });
    assert.equal(r.ok, true);
    assert.match(r.values?.sitemapHtml as string, /href="\/contact"/);
  });

  it("duplicate URLs are de-duplicated (first wins)", () => {
    const r = runTool({
      pages: "Home | https://example.com/\nHomepage | https://example.com/\nAbout | /about",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pageCount, 2);
    assert.match(r.values?.sitemapHtml as string, /duplicate/i);
  });

  it("unicode title is preserved and HTML-escaped", () => {
    const r = runTool({ pages: "Café ☕ & <دليل> | https://example.com/cafe" });
    assert.equal(r.ok, true);
    const html = r.values?.sitemapHtml as string;
    assert.match(html, /Café ☕ &amp; &lt;دليل&gt;/);
  });

  it("section order follows first appearance", () => {
    const r = runTool({
      pages: "B1 | /b1 | Beta\nA1 | /a1 | Alpha\nB2 | /b2 | Beta",
    });
    assert.equal(r.ok, true);
    const html = r.values?.sitemapHtml as string;
    assert.ok(html.indexOf("<h2>Beta</h2>") < html.indexOf("<h2>Alpha</h2>"));
  });

  it("mixed sectioned and unsectioned pages -> unsectioned under General", () => {
    const r = runTool({
      pages: "Home | /\nGuide | /g | Guides",
    });
    assert.equal(r.ok, true);
    const html = r.values?.sitemapHtml as string;
    assert.match(html, /<h2>General<\/h2>/);
    assert.match(html, /<h2>Guides<\/h2>/);
  });

  it("more than 2000 pages -> ok:false", () => {
    const lines = Array.from({ length: MAX_PAGES + 1 }, (_, i) => `P${i} | /p${i}`);
    const r = runTool({ pages: lines.join("\n") });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /2000/);
  });

  it("exactly 2000 pages -> ok", () => {
    const lines = Array.from({ length: MAX_PAGES }, (_, i) => `P${i} | /p${i}`);
    const r = runTool({ pages: lines.join("\n") });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pageCount, MAX_PAGES);
  });

  it("pageCount matches listed pages", () => {
    const r = runTool(happyValues());
    const html = r.values?.sitemapHtml as string;
    const liCount = (html.match(/<li>/g) ?? []).length;
    assert.equal(r.values?.pageCount, liCount);
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
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("isLinkableUrl: absolute or root-relative only", () => {
    assert.equal(isLinkableUrl("https://example.com/x"), true);
    assert.equal(isLinkableUrl("/x"), true);
    assert.equal(isLinkableUrl("x"), false);
    assert.equal(isLinkableUrl(""), false);
  });

  it("escapeHtml escapes the five HTML chars", () => {
    assert.equal(escapeHtml('a&b<c>d"e\'f'), "a&amp;b&lt;c&gt;d&quot;e&#39;f");
  });

  it("renderSitemapHtml embeds skipped notes safely (no -- sequences)", () => {
    const html = renderSitemapHtml([], "", ["Line 1: a--b"]);
    assert.doesNotMatch(html, /--b/);
    assert.match(html, /0 pages listed/);
  });
});
