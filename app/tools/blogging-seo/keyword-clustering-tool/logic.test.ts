import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  clusterKeywords,
  tokenize,
  jaccard,
  parseKeywords,
  dedupe,
  DEFAULT_THRESHOLD,
} from "./logic.ts";

describe("keyword-clustering-tool", () => {
  it("happy path: obvious topic groups cluster together", () => {
    const r = runTool({
      keywords: [
        "best running shoes",
        "running shoes guide",
        "cheap running shoes",
        "sourdough bread recipe",
        "sourdough bread baking",
        "easy sourdough bread",
      ],
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["clusterCount"], 2);
    assert.deepEqual(Object.keys(v).sort(), [
      "clusterCount",
      "clusters",
      "unclustered",
    ]);
  });

  it("default threshold is 0.35 when omitted", () => {
    assert.equal(DEFAULT_THRESHOLD, 0.35);
    const a = runTool({ keywords: ["cat food", "dog food", "cat toys"] });
    const b = runTool({
      keywords: ["cat food", "dog food", "cat toys"],
      similarityThreshold: 0.35,
    });
    assert.deepEqual(a, b);
  });

  it("custom threshold changes grouping (high threshold splits)", () => {
    const kws = ["email marketing tips", "email marketing guide", "seo basics"];
    const loose = runTool({ keywords: kws, similarityThreshold: 0.1 });
    const tight = runTool({ keywords: kws, similarityThreshold: 0.9 });
    assert.equal(loose.ok, true);
    assert.equal(tight.ok, true);
    const looseCount = (loose.values as Record<string, unknown>)["clusterCount"] as number;
    const tightCount = (tight.values as Record<string, unknown>)["clusterCount"] as number;
    assert.ok(tightCount <= looseCount);
  });

  it("textarea string input is parsed (newline separated)", () => {
    const r = runTool({
      keywords: "best laptop deals\nlaptop deals guide\ncheap laptop deals\nplant care",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v["clusterCount"] as number) >= 1);
  });

  it("determinism: run twice -> identical output", () => {
    const kws = [
      "yoga for beginners",
      "beginner yoga poses",
      "yoga mat review",
      "keto recipes",
      "keto diet plan",
    ];
    assert.deepEqual(runTool({ keywords: kws }), runTool({ keywords: kws }));
  });

  it("validation: missing keywords -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: empty array -> error", () => {
    const r = runTool({ keywords: [] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: single keyword -> error (need >= 2)", () => {
    const r = runTool({ keywords: ["only one"] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-string item -> error", () => {
    const r = runTool({ keywords: ["ok", 42] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: keyword longer than 150 chars -> error", () => {
    const r = runTool({ keywords: ["a".repeat(151), "b".repeat(10)] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: threshold below 0.1 -> error", () => {
    const r = runTool({
      keywords: ["aa", "bb"],
      similarityThreshold: 0.05,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: threshold above 0.9 -> error", () => {
    const r = runTool({
      keywords: ["aa", "bb"],
      similarityThreshold: 1,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-numeric threshold -> error", () => {
    const r = runTool({
      keywords: ["aa", "bb"],
      similarityThreshold: "high",
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("edge case: all identical keywords -> dedupe leaves 1 -> honest error", () => {
    const r = runTool({ keywords: ["same", "same", "SAME"] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("edge case: single-word vs multi-word mix does not crash", () => {
    const r = runTool({
      keywords: ["seo", "seo tips", "seo guide for beginners", "pasta"],
    });
    assert.equal(r.ok, true);
  });

  it("edge case: unicode keywords tokenize and cluster", () => {
    const toks = tokenize("café recipes");
    assert.ok(toks.length > 0);
    const r = runTool({
      keywords: ["café recipes easy", "café recipes quick", "café desserts guide", "car repair"],
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v["clusterCount"] as number) >= 1);
  });

  it("unrelated keywords land in unclustered", () => {
    const r = runTool({
      keywords: ["best laptop", "laptop deals", "xylophone", "quantum"],
      similarityThreshold: 0.5,
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const un = v["unclustered"] as string[];
    assert.ok(un.includes("xylophone") || un.includes("quantum"));
  });

  it("cluster table shape: columns + rows", () => {
    const r = runTool({
      keywords: ["dog food recipes", "dog food brands", "dog food deals", "cat food"],
    });
    const v = r.values as Record<string, unknown>;
    const table = v["clusters"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Cluster", "Keywords", "Size"]);
    assert.ok(table.rows.length >= 1);
    for (const row of table.rows) assert.equal(row.length, 3);
  });

  it("jaccard: identical sets -> 1, disjoint -> 0", () => {
    assert.equal(jaccard(["a", "b"], ["a", "b"]), 1);
    assert.equal(jaccard(["a"], ["b"]), 0);
  });

  it("parseKeywords: splits on newlines and commas, drops blanks", () => {
    assert.deepEqual(parseKeywords("a\nb, c;;\n"), ["a", "b", "c"]);
    assert.equal(parseKeywords(42), null);
  });

  it("dedupe is case-insensitive, keeps first form", () => {
    assert.deepEqual(dedupe(["SEO Tips", "seo tips", "Other"]), [
      "SEO Tips",
      "Other",
    ]);
  });

  it("clusterKeywords is deterministic on shuffled input", () => {
    const kws = ["zz top", "aa first", "mm mid", "zz topic", "aa another"];
    const a = clusterKeywords(kws, 0.35);
    const b = clusterKeywords([...kws].reverse(), 0.35);
    assert.deepEqual(a, b);
  });

  it("clusterCount equals number of table rows", () => {
    const r = runTool({
      keywords: [
        "email subject lines",
        "subject line tips",
        "tiktok growth tips",
        "tiktok growth hacks",
        "lonelyword",
      ],
    });
    const v = r.values as Record<string, unknown>;
    const table = v["clusters"] as { rows: string[][] };
    assert.equal(v["clusterCount"], table.rows.length);
  });
});
