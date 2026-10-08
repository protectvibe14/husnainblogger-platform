import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  assert.deepEqual(Object.keys(r.values).sort(), OUTPUT_IDS);
  return r.values;
}

describe("internal-link-opportunity-finder", () => {
  it("happy path: finds keyword matches for target pages", () => {
    const v = okValues({
      content:
        "This beginner guide to email marketing explains how newsletters grow traffic. " +
        "Read our SEO basics post to learn keyword research.",
      targetPages: [
        { url: "https://example.com/email-guide/", keywords: ["email marketing", "newsletters"] },
        { url: "https://example.com/seo-basics/", keywords: ["keyword research"] },
      ],
    });
    assert.equal(v["count"], 3);
    const table = v["opportunities"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Keyword", "Target URL", "Context"]);
    assert.equal(table.rows.length, 3);
    assert.equal(table.rows[0][0], "email marketing");
    assert.equal(table.rows[0][1], "https://example.com/email-guide/");
    assert.ok(table.rows[0][2].includes("email marketing"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({
      content: "Some article about dogs and cats.",
      targetPages: [{ url: "https://example.com/pets/", keywords: ["dogs"] }],
    });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), OUTPUT_IDS);
  });

  it("skips a target page already linked in the content", () => {
    const v = okValues({
      content:
        'Our email marketing guide is here: <a href="https://example.com/email-guide/">email marketing</a>. ' +
        "It also covers newsletters in depth.",
      targetPages: [{ url: "https://example.com/email-guide/", keywords: ["newsletters"] }],
    });
    assert.equal(v["count"], 0); // whole page skipped: URL already linked
  });

  it("skips keywords inside existing link anchor text", () => {
    const v = okValues({
      content:
        "See [email marketing tips](https://example.com/other/) for more. " +
        "This article is about email marketing in general.",
      targetPages: [{ url: "https://example.com/email-guide/", keywords: ["email marketing"] }],
    });
    // "email marketing tips" anchor is skipped, but the plain-text occurrence counts.
    assert.equal(v["count"], 1);
  });

  it("matches unicode keywords", () => {
    const v = okValues({
      content: "Unsere Anleitung für Suchmaschinenoptimierung hilft Anfängern.",
      targetPages: [{ url: "https://example.com/seo/", keywords: ["Suchmaschinenoptimierung"] }],
    });
    assert.equal(v["count"], 1);
  });

  it("validation: empty content errors", () => {
    const r = runTool({ content: "   ", targetPages: [{ url: "https://example.com/x/", keywords: ["a"] }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /article content/i);
  });

  it("validation: missing targetPages errors", () => {
    const r = runTool({ content: "Some article text here." });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: invalid URL errors with the page number", () => {
    const r = runTool({
      content: "Some article text here.",
      targetPages: [{ url: "not a url", keywords: ["a"] }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Target page #1/);
  });

  it("validation: page without keywords errors", () => {
    const r = runTool({
      content: "Some article text here.",
      targetPages: [{ url: "https://example.com/x/", keywords: [] }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /keyword/i);
  });

  it("validation: more than 200 target pages errors", () => {
    const pages = Array.from({ length: 201 }, (_, i) => ({
      url: `https://example.com/p${i}/`,
      keywords: ["a"],
    }));
    const r = runTool({ content: "Some article text here.", targetPages: pages });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /200/);
  });

  it("accepts site-relative target paths", () => {
    const v = okValues({
      content: "Read about keyword research in our guide.",
      targetPages: [{ url: "/blog/seo-guide/", keywords: ["keyword research"] }],
    });
    assert.equal(v["count"], 1);
  });

  it("accepts textarea format: 'URL | keyword 1, keyword 2' per line", () => {
    const v = okValues({
      content: "Email marketing and newsletters are powerful channels.",
      targetPages: "https://example.com/email/ | email marketing, newsletters\nhttps://example.com/seo/ | seo",
    });
    assert.equal(v["count"], 2);
  });

  it("matching is case-insensitive", () => {
    const v = okValues({
      content: "EMAIL MARKETING is powerful.",
      targetPages: [{ url: "https://example.com/email/", keywords: ["email marketing"] }],
    });
    assert.equal(v["count"], 1);
  });

  it("no matches returns count 0 with an empty table", () => {
    const v = okValues({
      content: "An article about gardening and roses.",
      targetPages: [{ url: "https://example.com/email/", keywords: ["email marketing"] }],
    });
    assert.equal(v["count"], 0);
    const table = v["opportunities"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.rows, []);
  });

  it("duplicate keyword on the same page yields one opportunity", () => {
    const v = okValues({
      content: "Email marketing works. Email marketing again.",
      targetPages: [{ url: "https://example.com/email/", keywords: ["email marketing", "Email Marketing"] }],
    });
    assert.equal(v["count"], 1);
  });

  it("keyword inside a markdown link URL is skipped", () => {
    const v = okValues({
      content: "See [this guide](https://example.com/email-marketing-tips/) for details.",
      targetPages: [{ url: "https://example.com/other/", keywords: ["email-marketing"] }],
    });
    assert.equal(v["count"], 0);
  });

  it("determinism: same inputs produce identical results", () => {
    const input = {
      content: "Email marketing grows traffic. Newsletters convert readers into buyers.",
      targetPages: [
        { url: "https://example.com/email/", keywords: ["email marketing", "newsletters"] },
        { url: "https://example.com/blog/", keywords: ["traffic"] },
      ],
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });

  it("context snippet is trimmed and bounded", () => {
    const long = "word ".repeat(100) + "email marketing" + " word".repeat(100);
    const v = okValues({
      content: long,
      targetPages: [{ url: "https://example.com/email/", keywords: ["email marketing"] }],
    });
    const table = v["opportunities"] as { columns: string[]; rows: string[][] };
    const ctx = table.rows[0][2];
    assert.ok(ctx.length < long.length);
    assert.ok(ctx.includes("email marketing"));
    assert.ok(ctx.startsWith("…") && ctx.endsWith("…"));
  });
});
