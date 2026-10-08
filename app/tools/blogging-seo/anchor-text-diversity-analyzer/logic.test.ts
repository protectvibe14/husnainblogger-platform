import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_ANCHORS,
  GENERIC_BANK_SIZE,
  CONCENTRATION_THRESHOLD,
  LOW_ENTROPY_THRESHOLD,
} from "./logic.ts";

function okValues(input: Record<string, unknown>) {
  const r = runTool(input);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

function dist(v: Record<string, unknown>) {
  return v.distribution as { columns: string[]; rows: string[][] };
}

describe("anchor-text-diversity-analyzer", () => {
  it("happy path: diverse anchors", () => {
    const v = okValues({
      anchors: [
        "best running shoes | https://example.com/shoes",
        "top trail runners 2026 | https://example.com/trail",
        "marathon shoe guide | https://example.com/marathon",
        "click here | https://example.com/more",
      ].join("\n"),
    });
    assert.equal(v.exactMatchRatio, 25);
    assert.equal(v.entropy, 2);
    assert.deepEqual(dist(v).columns, ["Anchor text", "Type", "Count", "Share %"]);
    assert.equal(dist(v).rows.length, 4);
    assert.deepEqual(v.riskFlags, []);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ anchors: "a | https://example.com/\nb | https://example.com/2" });
    assert.deepEqual(Object.keys(v).sort(), [
      "distribution",
      "entropy",
      "exactMatchRatio",
      "riskFlags",
    ]);
  });

  it("all anchors identical: ratio 100, entropy 0, flags raised", () => {
    const v = okValues({
      anchors: Array.from({ length: 6 }, () => "best shoes | https://example.com/").join("\n"),
    });
    assert.equal(v.exactMatchRatio, 100);
    assert.equal(v.entropy, 0);
    const flags = v.riskFlags as string[];
    assert.ok(flags.some((f) => f.includes("Over-concentration")));
    assert.ok(flags.some((f) => f.includes("entropy")));
    const rows = dist(v).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0][1], "exact-match");
    assert.equal(rows[0][2], "6");
  });

  it("single anchor: single-anchor flag", () => {
    const v = okValues({ anchors: "only one | https://example.com/" });
    const flags = v.riskFlags as string[];
    assert.ok(flags.some((f) => f.includes("Only one anchor")));
    assert.equal(v.exactMatchRatio, 100);
  });

  it("naked URLs classified as naked-url", () => {
    const v = okValues({
      anchors: [
        "https://example.com/page | https://example.com/page",
        "www.example.com/other | https://example.com/other",
        "descriptive text here | https://example.com/x",
      ].join("\n"),
    });
    const rows = dist(v).rows;
    assert.ok(rows.some((r) => r[1] === "naked-url"));
    const flags = v.riskFlags as string[];
    assert.ok(flags.some((f) => f.includes("Naked URLs")));
  });

  it("generic phrases classified as generic", () => {
    const v = okValues({
      anchors: [
        "click here | https://example.com/1",
        "read more | https://example.com/2",
        "real descriptive anchor | https://example.com/3",
      ].join("\n"),
    });
    const rows = dist(v).rows;
    assert.ok(rows.some((r) => r[0] === "click here" && r[1] === "generic"));
  });

  it("dominant naked URL is naked-url, not exact-match (priority rule)", () => {
    const v = okValues({
      anchors: [
        "https://example.com/ | https://example.com/",
        "https://example.com/ | https://example.com/",
        "other text | https://example.com/x",
      ].join("\n"),
    });
    const rows = dist(v).rows;
    assert.equal(rows[0][1], "naked-url");
  });

  it("unicode anchor text grouped and reported", () => {
    const v = okValues({
      anchors: "café guide über alles | https://example.com/\nsecond one | https://example.com/2",
    });
    assert.equal(dist(v).rows.length, 2);
    assert.ok(dist(v).rows.some((r) => r[0] === "café guide über alles"));
  });

  it("normalization groups case/whitespace variants", () => {
    const v = okValues({
      anchors: [
        "Best Shoes | https://example.com/1",
        "best  shoes | https://example.com/2",
        "BEST SHOES | https://example.com/3",
      ].join("\n"),
    });
    assert.equal(dist(v).rows.length, 1);
    assert.equal(v.exactMatchRatio, 100);
  });

  it("pipe inside anchor text is preserved (split on last pipe)", () => {
    const v = okValues({ anchors: "shoes | boots | https://example.com/" });
    assert.equal(dist(v).rows[0][0], "shoes | boots");
  });

  it("concentration flag triggers at exactly the threshold", () => {
    const lines = [
      "same text | https://example.com/1",
      "same text | https://example.com/2",
      "other one | https://example.com/3",
      "other two | https://example.com/4",
    ];
    const v = okValues({ anchors: lines.join("\n") });
    assert.equal(v.exactMatchRatio, CONCENTRATION_THRESHOLD);
    assert.ok((v.riskFlags as string[]).some((f) => f.includes("Over-concentration")));
  });

  it("uniform distribution entropy equals log2(n)", () => {
    const v = okValues({
      anchors: [
        "alpha anchor | https://example.com/1",
        "beta anchor | https://example.com/2",
        "gamma anchor | https://example.com/3",
        "delta anchor | https://example.com/4",
      ].join("\n"),
    });
    assert.equal(v.entropy, 2); // log2(4)
    assert.ok((v.entropy as number) >= LOW_ENTROPY_THRESHOLD);
  });

  it("distribution rows sorted by count desc", () => {
    const v = okValues({
      anchors: [
        "rare one | https://example.com/1",
        "common text | https://example.com/2",
        "common text | https://example.com/3",
        "common text | https://example.com/4",
      ].join("\n"),
    });
    const rows = dist(v).rows;
    assert.equal(rows[0][0], "common text");
    assert.equal(rows[0][2], "3");
    assert.equal(rows[0][3], "75.0");
  });

  it("generic-heavy profile raises the generic flag", () => {
    const v = okValues({
      anchors: [
        "click here | https://example.com/1",
        "read more | https://example.com/2",
        "learn more | https://example.com/3",
        "unique descriptive anchor | https://example.com/4",
      ].join("\n"),
    });
    assert.ok((v.riskFlags as string[]).some((f) => f.includes("Generic phrases")));
  });

  it("blank lines are skipped", () => {
    const v = okValues({ anchors: "\n\na | https://example.com/\n\nb | https://example.com/2\n" });
    assert.equal(dist(v).rows.length, 2);
  });

  it("empty input rejected", () => {
    const r = runTool({ anchors: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /paste your anchors/i);
  });

  it("whitespace-only input rejected", () => {
    const r = runTool({ anchors: "  \n " });
    assert.equal(r.ok, false);
  });

  it("missing input rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("line without pipe rejected with line number", () => {
    const r = runTool({ anchors: "good | https://example.com/\nbad line here" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Line 2/);
  });

  it("empty anchor text rejected", () => {
    const r = runTool({ anchors: "   | https://example.com/" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /anchor text is empty/);
  });

  it("URL without protocol rejected", () => {
    const r = runTool({ anchors: "text | example.com/page" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /http/);
  });

  it("ftp URL rejected", () => {
    const r = runTool({ anchors: "text | ftp://example.com/x" });
    assert.equal(r.ok, false);
  });

  it(`over ${MAX_ANCHORS} lines rejected`, () => {
    const lines = Array.from({ length: MAX_ANCHORS + 1 }, (_, i) => `a${i} | https://example.com/${i}`);
    const r = runTool({ anchors: lines.join("\n") });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Too many anchors/);
  });

  it("non-object input rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs give identical output twice", () => {
    const input = {
      anchors: "Best Shoes | https://example.com/1\nclick here | https://example.com/2\nbest shoes | https://example.com/3",
    };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("generic bank size is documented and stable", () => {
    assert.equal(GENERIC_BANK_SIZE, 28);
  });
});
