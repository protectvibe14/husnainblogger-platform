import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseRuleBlocks,
  renderRobotsTxt,
  isAbsoluteHttpUrl,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    rules: [
      "User-agent: *",
      "Disallow: /admin/",
      "Allow: /public/",
      "",
      "User-agent: Googlebot",
      "Disallow: /private/",
    ].join("\n"),
    sitemapUrl: "https://example.com/sitemap.xml",
  };
}

describe("robots-txt-generator", () => {
  it("happy path: two blocks + sitemap -> valid robots.txt", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    const txt = r.values?.robotsTxt as string;
    assert.match(txt, /^User-agent: \*$/m);
    assert.match(txt, /^Disallow: \/admin\/$/m);
    assert.match(txt, /^Allow: \/public\/$/m);
    assert.match(txt, /^User-agent: Googlebot$/m);
    assert.match(txt, /^Disallow: \/private\/$/m);
    assert.match(txt, /^Sitemap: https:\/\/example\.com\/sitemap\.xml$/m);
    assert.deepEqual(r.values?.errors, []);
  });

  it("no sitemapUrl -> no Sitemap line", () => {
    const r = runTool({ rules: "User-agent: *\nDisallow: /admin/" });
    assert.equal(r.ok, true);
    assert.doesNotMatch(r.values?.robotsTxt as string, /Sitemap:/);
  });

  it("empty rules -> ok:false", () => {
    const r = runTool({ rules: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /rule/i);
  });

  it("rules with no User-agent -> ok:false", () => {
    const r = runTool({ rules: "Disallow: /admin/" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /User-agent/i);
  });

  it("empty disallow (allow all) -> bare Disallow: line + note", () => {
    const r = runTool({ rules: "User-agent: *\nDisallow:" });
    assert.equal(r.ok, true);
    assert.match(r.values?.robotsTxt as string, /^Disallow:$/m);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /allow all|access everything/i.test(e)));
  });

  it("path without leading / is corrected and reported", () => {
    const r = runTool({ rules: "User-agent: *\nDisallow: admin" });
    assert.equal(r.ok, true);
    assert.match(r.values?.robotsTxt as string, /^Disallow: \/admin$/m);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /did not start with "\/"/i.test(e)));
  });

  it("unicode path is percent-encoded", () => {
    const r = runTool({ rules: "User-agent: *\nDisallow: /café/" });
    assert.equal(r.ok, true);
    assert.match(r.values?.robotsTxt as string, /Disallow: \/caf%C3%A9\//);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /percent-encoded/i.test(e)));
  });

  it("invalid sitemapUrl -> ok:false", () => {
    const r = runTool({ rules: "User-agent: *\nDisallow: /x", sitemapUrl: "sitemap.xml" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Sitemap/i);
  });

  it("comment lines and blank lines are handled", () => {
    const r = runTool({
      rules: "# block crawlers\nUser-agent: *\n\n# keep admin private\nDisallow: /admin/",
    });
    assert.equal(r.ok, true);
    const txt = r.values?.robotsTxt as string;
    assert.match(txt, /^User-agent: \*$/m);
    assert.match(txt, /^Disallow: \/admin\/$/m);
  });

  it("consecutive User-agent lines belong to one group", () => {
    const r = runTool({
      rules: "User-agent: a\nUser-agent: b\nDisallow: /x/",
    });
    assert.equal(r.ok, true);
    const txt = r.values?.robotsTxt as string;
    assert.match(txt, /User-agent: a\nUser-agent: b\nDisallow: \/x\//);
  });

  it("unknown directive line is ignored with a note", () => {
    const r = runTool({
      rules: "User-agent: *\nCrawl-delay: 10\nDisallow: /x/",
    });
    assert.equal(r.ok, true);
    const errors = r.values?.errors as string[];
    assert.ok(errors.some((e) => /ignored/i.test(e)));
    assert.doesNotMatch(r.values?.robotsTxt as string, /Crawl-delay/);
  });

  it("empty User-agent value is ignored", () => {
    const { blocks, notes } = parseRuleBlocks("User-agent:\nUser-agent: *\nDisallow: /x/");
    assert.equal(blocks.length, 1);
    assert.ok(notes.some((n) => /no value/i.test(n)));
  });

  it("only comments -> ok:false", () => {
    const r = runTool({ rules: "# just a comment\n# another" });
    assert.equal(r.ok, false);
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

  it("parseRuleBlocks: case-insensitive directives", () => {
    const { blocks } = parseRuleBlocks("uSeR-aGeNt: *\ndIsAlLoW: /x/");
    assert.equal(blocks.length, 1);
    assert.deepEqual(blocks[0].userAgents, ["*"]);
    assert.equal(blocks[0].rules[0].directive, "Disallow");
  });

  it("renderRobotsTxt: group without rules emits bare Disallow", () => {
    const txt = renderRobotsTxt([{ userAgents: ["*"], rules: [] }], "");
    assert.match(txt, /^User-agent: \*$/m);
    assert.match(txt, /^Disallow:$/m);
  });

  it("isAbsoluteHttpUrl: accepts http/https, rejects junk", () => {
    assert.equal(isAbsoluteHttpUrl("https://example.com/sitemap.xml"), true);
    assert.equal(isAbsoluteHttpUrl("/sitemap.xml"), false);
    assert.equal(isAbsoluteHttpUrl(""), false);
  });
});
