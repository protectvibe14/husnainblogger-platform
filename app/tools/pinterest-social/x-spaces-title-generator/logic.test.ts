import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TITLE_COUNT,
  TITLE_GUIDANCE_LIMIT,
  MAX_TOPIC_LEN,
  MAX_GUESTS_LEN,
  hashSeed,
  buildTitles,
  runTool,
} from "./logic.ts";

describe("constants", () => {
  it("emits 8 titles with 70-char guidance", () => {
    assert.equal(TITLE_COUNT, 8);
    assert.equal(TITLE_GUIDANCE_LIMIT, 70);
  });
});

describe("hashSeed", () => {
  it("deterministic for the same seed", () => {
    assert.equal(hashSeed("ai|x"), hashSeed("ai|x"));
  });
});

describe("buildTitles", () => {
  it("happy path: 8 non-empty curiosity-led titles", () => {
    const { titles } = buildTitles("ai agents", "");
    assert.equal(titles.length, 8);
    assert.ok(titles.every((t) => t.length > 0));
    assert.ok(titles.every((t) => t.toLowerCase().includes("ai agents")));
  });
  it("every title respects the 70-char guidance", () => {
    const { titles } = buildTitles("a".repeat(100), "Some Very Long Guest Name Here");
    assert.ok(titles.every((t) => t.length <= TITLE_GUIDANCE_LIMIT), JSON.stringify(titles));
  });
  it("long topics are shortened with an ellipsis, not dropped", () => {
    const { titles } = buildTitles("b".repeat(100), "");
    assert.ok(titles.every((t) => t.length <= TITLE_GUIDANCE_LIMIT));
    assert.ok(titles.some((t) => t.includes("…")));
  });
  it("guests rotate into titles with 'with' / 'ft.' suffixes", () => {
    const { titles } = buildTitles("crypto", "Jane Doe");
    assert.ok(titles.some((t) => t.includes("Jane Doe")));
    assert.ok(titles.some((t) => t.includes(" with Jane Doe") || t.includes(" ft. Jane Doe")));
  });
  it("no guests -> no dangling suffix", () => {
    const { titles } = buildTitles("crypto", "");
    assert.ok(titles.every((t) => !t.includes(" with ") || t.toLowerCase().includes("crypto")));
    assert.ok(titles.every((t) => !t.includes(" ft.")));
  });
  it("all 8 titles are unique", () => {
    const { titles } = buildTitles("freelancing", "John");
    assert.equal(new Set(titles).size, 8);
  });
  it("deterministic: same inputs -> same titles", () => {
    const a = buildTitles("podcasting", "Amy");
    const b = buildTitles("podcasting", "Amy");
    assert.deepEqual(a, b);
  });
  it("different topics can rotate the bank start", () => {
    const a = buildTitles("alpha topic", "");
    const b = buildTitles("omega topic", "");
    assert.notDeepEqual(a.titles, b.titles);
  });
  it("throws on empty topic", () => {
    assert.throws(() => buildTitles("   ", ""), /non-empty topic/);
  });
  it("throws TypeError on non-string inputs", () => {
    assert.throws(() => buildTitles(1 as unknown as string, ""), TypeError);
    assert.throws(() => buildTitles("x", null as unknown as string), TypeError);
  });
});

describe("runTool", () => {
  it("happy path returns spaceTitles", () => {
    const res = runTool({ topic: "ai voice agents", guests: "Sam Lee" });
    assert.equal(res.ok, true);
    assert.deepEqual(Object.keys(res.values ?? {}), ["spaceTitles"]);
    const titles = res.values?.spaceTitles as string[];
    assert.equal(titles.length, 8);
  });
  it("guests optional: works without them", () => {
    const res = runTool({ topic: "ai voice agents" });
    assert.equal(res.ok, true);
    assert.equal((res.values?.spaceTitles as string[]).length, 8);
  });
  it("missing/empty topic -> validation error", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ topic: "  " }).ok, false);
    assert.match(runTool({}).error ?? "", /topic/i);
  });
  it("topic over max length -> validation error", () => {
    const res = runTool({ topic: "x".repeat(MAX_TOPIC_LEN + 1) });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /too long/);
  });
  it("guests over max length -> validation error", () => {
    const res = runTool({ topic: "ai", guests: "y".repeat(MAX_GUESTS_LEN + 1) });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /too long/);
  });
  it("non-string topic -> validation error", () => {
    assert.equal(runTool({ topic: 42 }).ok, false);
  });
  it("deterministic: same inputs -> identical output", () => {
    const a = runTool({ topic: "web3", guests: "Kim" });
    const b = runTool({ topic: "web3", guests: "Kim" });
    assert.deepEqual(a, b);
  });
  it("titles stay within guidance across many samples", () => {
    for (const topic of ["nfts", "remote work", "c".repeat(110), "email marketing"]) {
      const res = runTool({ topic, guests: "Alex Morgan" });
      assert.equal(res.ok, true);
      const titles = res.values?.spaceTitles as string[];
      assert.ok(titles.every((t) => t.length <= 70), JSON.stringify(titles));
    }
  });
});
