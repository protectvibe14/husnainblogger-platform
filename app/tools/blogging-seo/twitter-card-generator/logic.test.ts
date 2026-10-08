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
    image: "https://example.com/images/pour-over.jpg",
    site: "@husnainblogger",
  };
}

describe("twitter-card-generator", () => {
  it("happy path: -> 5 twitter tags, no warnings", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const html = r.values?.tagsHtml as string;
    assert.match(html, /name="twitter:card"/);
    assert.match(html, /name="twitter:title"/);
    assert.match(html, /name="twitter:description"/);
    assert.match(html, /name="twitter:image"/);
    assert.match(html, /name="twitter:site"/);
    assert.match(html, /content="summary_large_image"/);
    assert.match(html, /content="@husnainblogger"/);
    assert.deepEqual(r.values?.warnings, []);
  });

  it("card omitted -> defaults to summary_large_image", () => {
    const r = runTool(happyValues());
    assert.match(r.values?.tagsHtml as string, /content="summary_large_image"/);
  });

  it("card=summary -> summary tag", () => {
    const r = runTool({ ...happyValues(), card: "summary" });
    assert.equal(r.ok, true);
    assert.match(r.values?.tagsHtml as string, /content="summary"/);
  });

  it("invalid card -> ok:false", () => {
    const r = runTool({ ...happyValues(), card: "player" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /card/i);
  });

  it("missing title -> ok:false", () => {
    const r = runTool({ ...happyValues(), title: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /title/i);
  });

  it("title over 200 chars -> ok:false", () => {
    const r = runTool({ ...happyValues(), title: "x".repeat(MAX_TITLE_CHARS + 1) });
    assert.equal(r.ok, false);
  });

  it("missing description -> ok:false", () => {
    const r = runTool({ ...happyValues(), description: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /description/i);
  });

  it("description over 300 chars -> ok:false", () => {
    const r = runTool({ ...happyValues(), description: "x".repeat(MAX_DESCRIPTION_CHARS + 1) });
    assert.equal(r.ok, false);
  });

  it("bad image URL -> ok:false", () => {
    const r = runTool({ ...happyValues(), image: "example.com/x.jpg" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /image/i);
  });

  it("site without @ -> ok:false", () => {
    const r = runTool({ ...happyValues(), site: "husnainblogger" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /@husnainblogger|handle/i);
  });

  it("site with spaces -> ok:false", () => {
    const r = runTool({ ...happyValues(), site: "@my blog" });
    assert.equal(r.ok, false);
  });

  it("missing site handle -> warning and tag omitted", () => {
    const r = runTool({
      title: "T",
      description: "D",
      image: "https://example.com/i.png",
    });
    assert.equal(r.ok, true);
    const html = r.values?.tagsHtml as string;
    assert.doesNotMatch(html, /twitter:site/);
    const warnings = r.values?.warnings as string[];
    assert.ok(warnings.some((w) => /twitter:site/i.test(w)));
  });

  it("image without image extension -> warning, still ok", () => {
    const r = runTool({ ...happyValues(), image: "https://cdn.example.com/a/bc9" });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.ok(warnings.some((w) => /extension/i.test(w)));
  });

  it("long title -> truncation warning", () => {
    const r = runTool({ ...happyValues(), title: "x".repeat(90) });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.ok(warnings.some((w) => /truncate/i.test(w)));
  });

  it("attribute values are HTML-escaped", () => {
    const r = runTool({ ...happyValues(), title: 'A "quoted" & <b> title' });
    assert.equal(r.ok, true);
    assert.match(r.values?.tagsHtml as string, /A &quot;quoted&quot; &amp; &lt;b&gt; title/);
  });

  it("unicode title passes through unescaped", () => {
    const r = runTool({ ...happyValues(), title: "☕ دليل القهوة — Brew Guide" });
    assert.equal(r.ok, true);
    assert.match(r.values?.tagsHtml as string, /☕ دليل القهوة — Brew Guide/);
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

  it("isAbsoluteHttpUrl: accepts http/https, rejects junk", () => {
    assert.equal(isAbsoluteHttpUrl("https://example.com/i.png"), true);
    assert.equal(isAbsoluteHttpUrl("/i.png"), false);
    assert.equal(isAbsoluteHttpUrl(""), false);
  });

  it("escapeAttr escapes the four HTML attribute chars", () => {
    assert.equal(escapeAttr('a&b"c<d>e'), "a&amp;b&quot;c&lt;d&gt;e");
  });
});
