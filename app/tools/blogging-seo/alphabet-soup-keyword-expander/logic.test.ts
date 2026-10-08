import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  expandAlphabetSoup,
  EXPANSION_COUNT,
} from "./logic.ts";

describe("alphabet-soup-keyword-expander", () => {
  it("happy path: expands a normal seed", () => {
    const r = runTool({ seedKeyword: "dog training" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(Array.isArray(v["expansions"]));
    assert.equal(v["count"], 26);
  });

  it("produces exactly one expansion per letter a-z, in order", () => {
    const { expansions, count } = expandAlphabetSoup("seo");
    assert.equal(count, 26);
    assert.equal(expansions.length, 26);
    assert.equal(expansions[0], "seo a");
    assert.equal(expansions[25], "seo z");
    assert.equal(expansions[12], "seo m");
  });

  it("count matches expansions length", () => {
    const { expansions, count } = expandAlphabetSoup("coffee");
    assert.equal(count, expansions.length);
  });

  it("determinism: same seed twice -> identical output", () => {
    assert.deepEqual(
      runTool({ seedKeyword: "keto diet" }),
      runTool({ seedKeyword: "keto diet" }),
    );
  });

  it("validation: missing seedKeyword -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(r.error);
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

  it("validation: too short -> error", () => {
    const r = runTool({ seedKeyword: " x " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: longer than 100 chars -> error", () => {
    const r = runTool({ seedKeyword: "a".repeat(101) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("edge case: very long seed (100 chars) still yields 26 expansions", () => {
    const seed = "a".repeat(100);
    const r = runTool({ seedKeyword: seed });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal((v["expansions"] as string[]).length, 26);
    assert.equal(v["count"], 26);
  });

  it("edge case: non-latin seed still gets a-z suffixes", () => {
    const r = runTool({ seedKeyword: "日本語テスト" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.equal(exps.length, 26);
    assert.equal(exps[0], "日本語テスト a");
    assert.equal(exps[25], "日本語テスト z");
  });

  it("edge case: trailing spaces are trimmed", () => {
    assert.deepEqual(
      runTool({ seedKeyword: "gardening   " }),
      runTool({ seedKeyword: "gardening" }),
    );
  });

  it("edge case: internal multiple spaces collapse", () => {
    const r = runTool({ seedKeyword: "dog   training" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.equal(exps[0], "dog training a");
  });

  it("edge case: single-word seed works", () => {
    const r = runTool({ seedKeyword: "running" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.ok(exps.includes("running q"));
  });

  it("output keys are exactly expansions + count", () => {
    const r = runTool({ seedKeyword: "hiking" });
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "count",
      "expansions",
    ]);
  });

  it("word-bank bound: EXPANSION_COUNT equals 26 letters", () => {
    assert.equal(EXPANSION_COUNT, 26);
    assert.equal("abcdefghijklmnopqrstuvwxyz".length, EXPANSION_COUNT);
  });
});
