import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  isAbsoluteHttpUrl,
  escapeAttr,
  MAX_TITLE_CHARS,
  MAX_DESCRIPTION_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    title: "How to Brew Pour-Over Coffee",
    description: "A step-by-step guide to brewing pour-over coffee at home.",
    url: "https://example.com/pour-over",
    image: "https://example.com/images/pour-over.jpg",
  };
}

describe("open-graph-tag-generator", () => {
  it("happy path: all fields -> 5 og tags, no warnings", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const html = r.values?.tagsHtml as string;
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:description"/);
    assert.match(html, /property="og:url"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /property="og:type"/);
    assert.match(html, /content="How to Brew Pour-Over Coffee"/);
    assert.match(html, /content="website"/);
    assert.deepEqual(r.values?.warnings, []);
  });

  it("type omitted -> defaults to website", () => {
    const r = runTool(happyValues());
    assert.match(r.values?.tagsHtml as string, /content="website"/);
  });

  it("type=article -> og:type article", () => {
    const r = runTool({ ...happyValues(), type: "article" });
    assert.equal(r.ok, true);
    assert.match(r.values?.tagsHtml as string, /content="article"/);
  });

  it("invalid type -> ok:false", () => {
    const r = runTool({ ...happyValues(), type: "product" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /og:type/i);
  });

  it("missing title -> ok:false", () => {
    const r = runTool({ ...happyValues(), title: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /title/i);
  });

  it("title over 200 chars -> ok:false", () => {
    const r = runTool({ ...happyValues(), title: "x".repeat(MAX_TITLE_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /201/);
  });

  it("missing description -> ok:false", () => {
    const r = runTool({ ...happyValues(), description: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /description/i);
  });

  it("description over 300 chars -> ok:false", () => {
    const r = runTool({ ...happyValues(), description: "x".repeat(MAX_DESCRIPTION_CHARS + 1) });
    assert.equal(r.ok, false);
  });

  it("relative page URL -> ok:false", () => {
    const r = runTool({ ...happyValues(), url: "/pour-over" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /absolute/i);
  });

  it("bad image URL -> ok:false", () => {
    const r = runTool({ ...happyValues(), image: "not-a-url" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /image/i);
  });

  it("image without image extension -> warning, still ok", () => {
    const r = runTool({ ...happyValues(), image: "https://cdn.example.com/img/12345" });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /extension/i);
  });

  it("long title -> truncation warning, tags still generated", () => {
    const r = runTool({ ...happyValues(), title: "x".repeat(80) });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.ok(warnings.some((w) => /truncate/i.test(w)));
  });

  it("long description -> truncation warning", () => {
    const r = runTool({ ...happyValues(), description: "x".repeat(200) });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.ok(warnings.some((w) => /truncate/i.test(w)));
  });

  it("attribute values are HTML-escaped", () => {
    const r = runTool({
      ...happyValues(),
      title: 'Coffee "Best" & <Great>',
      description: "a & b",
    });
    assert.equal(r.ok, true);
    const html = r.values?.tagsHtml as string;
    assert.match(html, /content="Coffee &quot;Best&quot; &amp; &lt;Great&gt;"/);
    assert.match(html, /content="a &amp; b"/);
    assert.doesNotMatch(html, /<Great>/);
  });

  it("unicode title passes through unescaped", () => {
    const r = runTool({ ...happyValues(), title: "Café au lait ☕ — دليل" });
    assert.equal(r.ok, true);
    assert.match(r.values?.tagsHtml as string, /Café au lait ☕ — دليل/);
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

  it("isAbsoluteHttpUrl: accepts http/https, rejects junk", () => {
    assert.equal(isAbsoluteHttpUrl("https://example.com"), true);
    assert.equal(isAbsoluteHttpUrl("http://example.com/x"), true);
    assert.equal(isAbsoluteHttpUrl("ftp://example.com"), false);
    assert.equal(isAbsoluteHttpUrl("not a url"), false);
    assert.equal(isAbsoluteHttpUrl(""), false);
  });

  it("escapeAttr escapes the four HTML attribute chars", () => {
    assert.equal(escapeAttr('a&b"c<d>e'), "a&amp;b&quot;c&lt;d&gt;e");
  });
});
