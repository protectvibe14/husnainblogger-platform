import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseCrumbsText,
  resolveCrumbUrl,
  isAbsoluteHttpUrl,
  MAX_CRUMBS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    crumbs: [
      { name: "Home", url: "https://example.com/" },
      { name: "Blog", url: "https://example.com/blog/" },
      { name: "SEO Guide", url: "https://example.com/blog/seo-guide/" },
    ],
  };
}

describe("breadcrumb-schema-generator", () => {
  it("happy path: 3 crumbs -> valid BreadcrumbList JSON-LD with positions", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed["@context"], "https://schema.org");
    assert.equal(parsed["@type"], "BreadcrumbList");
    assert.equal(parsed.itemListElement.length, 3);
    assert.deepEqual(
      parsed.itemListElement.map((e: { position: number }) => e.position),
      [1, 2, 3]
    );
    assert.equal(parsed.itemListElement[0]["@type"], "ListItem");
    assert.equal(parsed.itemListElement[0].name, "Home");
    assert.equal(parsed.itemListElement[0].item, "https://example.com/");
    assert.equal(parsed.itemListElement[2].name, "SEO Guide");
    assert.deepEqual(r.values?.errors, []);
  });

  it("accepts the textarea format (Name ||| URL per line)", () => {
    const r = runTool({
      crumbs: "Home ||| https://example.com/\nBlog ||| https://example.com/blog/",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemListElement.length, 2);
    assert.equal(parsed.itemListElement[1].name, "Blog");
  });

  it("single crumb works", () => {
    const r = runTool({ crumbs: [{ name: "Home", url: "https://example.com/" }] });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemListElement.length, 1);
    assert.equal(parsed.itemListElement[0].position, 1);
  });

  it("relative URLs resolved against baseUrl", () => {
    const r = runTool({
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog/" },
      ],
      baseUrl: "https://example.com",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemListElement[0].item, "https://example.com/");
    assert.equal(parsed.itemListElement[1].item, "https://example.com/blog/");
  });

  it("relative URL without baseUrl -> skipped with a note, rest emitted", () => {
    const r = runTool({
      crumbs: [
        { name: "Home", url: "https://example.com/" },
        { name: "Blog", url: "/blog/" },
      ],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemListElement.length, 1);
    const errs = r.values?.errors as string[];
    assert.ok(errs.some((e) => /Base URL/i.test(e)));
  });

  it("resolveCrumbUrl: absolute passes through; bad relative returns null", () => {
    assert.equal(
      resolveCrumbUrl("https://example.com/x", ""),
      "https://example.com/x"
    );
    assert.equal(resolveCrumbUrl("/x", ""), null);
    assert.equal(resolveCrumbUrl("", ""), null);
    assert.equal(
      resolveCrumbUrl("/x", "https://example.com"),
      "https://example.com/x"
    );
  });

  it("positions stay sequential after a skipped crumb", () => {
    const r = runTool({
      crumbs: [
        { name: "Home", url: "https://example.com/" },
        { name: "Bad", url: "not a url at all :::" },
        { name: "Blog", url: "https://example.com/blog/" },
      ],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.deepEqual(
      parsed.itemListElement.map((e: { position: number }) => e.position),
      [1, 2]
    );
    assert.equal(parsed.itemListElement[1].name, "Blog");
  });

  it("missing crumbs -> ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("empty array -> ok:false", () => {
    const r = runTool({ crumbs: [] });
    assert.equal(r.ok, false);
  });

  it("empty text -> ok:false", () => {
    const r = runTool({ crumbs: "   " });
    assert.equal(r.ok, false);
  });

  it("over max crumbs -> ok:false", () => {
    const crumbs = Array.from({ length: MAX_CRUMBS + 1 }, (_, i) => ({
      name: `Crumb ${i}`,
      url: `https://example.com/${i}/`,
    }));
    const r = runTool({ crumbs });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Too many breadcrumbs/);
  });

  it("crumb with empty name -> ok:false", () => {
    const r = runTool({
      crumbs: [{ name: "  ", url: "https://example.com/" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /name is required/);
  });

  it("invalid baseUrl -> ok:false", () => {
    const r = runTool({
      crumbs: [{ name: "Home", url: "https://example.com/" }],
      baseUrl: "not-a-url",
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Base URL/);
  });

  it("all crumbs invalid -> ok:false", () => {
    const r = runTool({
      crumbs: [{ name: "Bad", url: "/relative/" }],
    });
    assert.equal(r.ok, false);
  });

  it("crumb with no URL -> skipped with a note", () => {
    const r = runTool({
      crumbs: [
        { name: "Home", url: "https://example.com/" },
        { name: "No URL", url: "" },
      ],
    });
    assert.equal(r.ok, true);
    const errs = r.values?.errors as string[];
    assert.ok(errs.some((e) => /no URL/i.test(e)));
  });

  it("trims whitespace", () => {
    const r = runTool({
      crumbs: [{ name: "  Home  ", url: "  https://example.com/  " }],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemListElement[0].name, "Home");
  });

  it("unicode crumb names preserved", () => {
    const r = runTool({
      crumbs: [{ name: "Startseite 🏠", url: "https://example.com/" }],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.itemListElement[0].name, "Startseite 🏠");
  });

  it("non-object values -> ok:false", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("isAbsoluteHttpUrl rejects non-http(s)", () => {
    assert.equal(isAbsoluteHttpUrl("ftp://example.com/"), false);
    assert.equal(isAbsoluteHttpUrl("example.com"), false);
    assert.equal(isAbsoluteHttpUrl("https://example.com/"), true);
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

  it("parseCrumbsText skips lines without the separator", () => {
    assert.deepEqual(parseCrumbsText("just a note\nHome ||| https://example.com/"), [
      { name: "Home", url: "https://example.com/" },
    ]);
  });
});
