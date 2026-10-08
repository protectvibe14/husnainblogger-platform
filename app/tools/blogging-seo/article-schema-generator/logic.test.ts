import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  isValidDate,
  isAbsoluteHttpUrl,
  MAX_HEADLINE_CHARS,
  MAX_AUTHOR_CHARS,
  MAX_DESCRIPTION_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    headline: "How to Brew Pour-Over Coffee",
    author: "Jane Doe",
    datePublished: "2026-09-15",
    image: "https://example.com/images/pour-over.jpg",
    description: "A step-by-step guide to brewing pour-over coffee at home.",
  };
}

describe("article-schema-generator", () => {
  it("happy path: all fields -> valid Article JSON-LD", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed["@context"], "https://schema.org");
    assert.equal(parsed["@type"], "Article");
    assert.equal(parsed.headline, "How to Brew Pour-Over Coffee");
    assert.equal(parsed.author["@type"], "Person");
    assert.equal(parsed.author.name, "Jane Doe");
    assert.equal(parsed.datePublished, "2026-09-15");
    assert.equal(parsed.image, "https://example.com/images/pour-over.jpg");
    assert.equal(
      parsed.description,
      "A step-by-step guide to brewing pour-over coffee at home."
    );
    assert.deepEqual(r.values?.errors, []);
  });

  it("minimal: required fields only -> ok, no optional keys", () => {
    const r = runTool({
      headline: "Minimal",
      author: "Author",
      datePublished: "2026-01-01",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.image, undefined);
    assert.equal(parsed.description, undefined);
  });

  it("missing headline -> ok:false", () => {
    const r = runTool({ headline: "", author: "A", datePublished: "2026-01-01" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /headline/i);
  });

  it("headline over max chars -> ok:false", () => {
    const r = runTool({
      headline: "h".repeat(MAX_HEADLINE_CHARS + 1),
      author: "A",
      datePublished: "2026-01-01",
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", new RegExp(String(MAX_HEADLINE_CHARS)));
  });

  it("missing author -> ok:false", () => {
    const r = runTool({ headline: "H", author: "  ", datePublished: "2026-01-01" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /author/i);
  });

  it("author over max chars -> ok:false", () => {
    const r = runTool({
      headline: "H",
      author: "a".repeat(MAX_AUTHOR_CHARS + 1),
      datePublished: "2026-01-01",
    });
    assert.equal(r.ok, false);
  });

  it("missing date -> ok:false", () => {
    const r = runTool({ headline: "H", author: "A", datePublished: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /YYYY-MM-DD/);
  });

  it("wrong date format -> ok:false", () => {
    const r = runTool({ headline: "H", author: "A", datePublished: "10/01/2026" });
    assert.equal(r.ok, false);
  });

  it("impossible calendar date -> ok:false", () => {
    assert.equal(isValidDate("2026-02-30"), false);
    const r = runTool({ headline: "H", author: "A", datePublished: "2026-02-30" });
    assert.equal(r.ok, false);
  });

  it("leap day accepted on leap years, rejected otherwise", () => {
    assert.equal(isValidDate("2024-02-29"), true);
    assert.equal(isValidDate("2025-02-29"), false);
  });

  it("future publish date -> ok:true with a warning", () => {
    const r = runTool({ headline: "H", author: "A", datePublished: "2099-01-01" });
    assert.equal(r.ok, true);
    const errs = r.values?.errors as string[];
    assert.ok(errs.length > 0);
    assert.match(errs[0], /future/i);
  });

  it("invalid image URL -> ok:false", () => {
    const r = runTool({ ...happyValues(), image: "not-a-url" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /http/i);
  });

  it("non-http(s) image URL rejected", () => {
    assert.equal(isAbsoluteHttpUrl("ftp://example.com/x.jpg"), false);
    const r = runTool({ ...happyValues(), image: "ftp://example.com/x.jpg" });
    assert.equal(r.ok, false);
  });

  it("description over max chars -> ok:false", () => {
    const r = runTool({
      ...happyValues(),
      description: "d".repeat(MAX_DESCRIPTION_CHARS + 1),
    });
    assert.equal(r.ok, false);
  });

  it("trims whitespace on string inputs", () => {
    const r = runTool({
      headline: "  Padded  ",
      author: "  Jane  ",
      datePublished: " 2026-09-15 ",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.headline, "Padded");
    assert.equal(parsed.author.name, "Jane");
  });

  it("dateModified equals datePublished (documented)", () => {
    const r = runTool(happyValues());
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.dateModified, parsed.datePublished);
  });

  it("unicode headline and author preserved", () => {
    const r = runTool({
      headline: "Kaffee brühen ☕ — Grüße",
      author: "Jürgen Müller",
      datePublished: "2026-05-05",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.headline, "Kaffee brühen ☕ — Grüße");
    assert.equal(parsed.author.name, "Jürgen Müller");
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
