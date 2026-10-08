import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  expandSeed,
  sanitizeSeed,
  MAX_EXPANSIONS,
} from "./logic.ts";

describe("long-tail-keyword-expander", () => {
  it("happy path: expands a normal seed", () => {
    const r = runTool({ seedKeyword: "email marketing" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(Array.isArray(v["expansions"]));
    assert.equal(v["count"], (v["expansions"] as string[]).length);
    assert.ok((v["expansions"] as string[]).length > 0);
  });

  it("expansions include prefix, suffix, audience and how-to templates", () => {
    const { expansions } = expandSeed("yoga");
    assert.ok(expansions.includes("best yoga"));
    assert.ok(expansions.includes("yoga guide"));
    assert.ok(expansions.includes("yoga for bloggers"));
    assert.ok(expansions.includes("how to choose yoga"));
  });

  it("count matches expansions length", () => {
    const { expansions, count } = expandSeed("coffee");
    assert.equal(count, expansions.length);
  });

  it("never exceeds MAX_EXPANSIONS (28)", () => {
    const { expansions } = expandSeed("a".repeat(100));
    assert.ok(expansions.length <= MAX_EXPANSIONS);
  });

  it("expansions are deduplicated", () => {
    const { expansions } = expandSeed("for beginners");
    const lowered = expansions.map((e) => e.toLowerCase());
    assert.equal(new Set(lowered).size, lowered.length);
  });

  it("determinism: same seed twice -> identical output", () => {
    const a = runTool({ seedKeyword: "keto diet" });
    const b = runTool({ seedKeyword: "keto diet" });
    assert.deepEqual(a, b);
  });

  it("validation: missing seedKeyword -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });

  it("validation: empty string -> error", () => {
    const r = runTool({ seedKeyword: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-string seed -> error", () => {
    const r = runTool({ seedKeyword: 42 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: too short (1 char after trim) -> error", () => {
    const r = runTool({ seedKeyword: " x " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: longer than 100 chars -> error", () => {
    const r = runTool({ seedKeyword: "a".repeat(101) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("edge case: trailing spaces are trimmed", () => {
    const a = runTool({ seedKeyword: "gardening   " });
    const b = runTool({ seedKeyword: "gardening" });
    assert.deepEqual(a, b);
  });

  it("edge case: single-word seed works", () => {
    const r = runTool({ seedKeyword: "running" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.ok(exps.includes("best running"));
    assert.ok(exps.includes("running tips"));
  });

  it("edge case: unicode seed ('café recipes') works", () => {
    const r = runTool({ seedKeyword: "café recipes" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.ok(exps.includes("best café recipes"));
    assert.ok(exps.includes("café recipes guide"));
  });

  it("edge case: HTML tags are stripped", () => {
    const seed = sanitizeSeed("<b>dog</b> training");
    assert.equal(seed, "dog training");
    const r = runTool({ seedKeyword: "<b>dog</b> training" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.ok(!exps.some((e) => e.includes("<")));
  });

  it("edge case: URLs are stripped", () => {
    const seed = sanitizeSeed("visit https://example.com for seo tips");
    assert.ok(!seed.includes("http"));
    assert.ok(seed.includes("seo tips"));
  });

  it("edge case: seed that becomes too short after stripping -> error", () => {
    const r = runTool({ seedKeyword: "<b>a</b>" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("output keys are exactly expansions + count", () => {
    const r = runTool({ seedKeyword: "hiking" });
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "count",
      "expansions",
    ]);
  });

  it("word-bank bound: MAX_EXPANSIONS equals documented bank total (8+10+6+4)", () => {
    assert.equal(MAX_EXPANSIONS, 8 + 10 + 6 + 4);
  });
});
