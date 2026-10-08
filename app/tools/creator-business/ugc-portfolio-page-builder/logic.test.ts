import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

function items() {
  return [
    {
      creatorName: "Maya R.",
      niche: "Skincare",
      sampleUrl: "https://example.com/video-1",
      sampleCaption: "Morning routine UGC",
    },
    { creatorName: "Maya R.", niche: "skincare", sampleUrl: "https://example.com/video-2" },
    { creatorName: "Maya R.", niche: "Fitness" },
  ];
}

describe("ugc-portfolio-page-builder", () => {
  it("happy path: returns portfolioData output id", () => {
    const res = runTool({ items: items() });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.deepEqual(Object.keys(res.values!), ["portfolioData"]);
  });

  it("builds structured data: creator, niches, samples, counts", () => {
    const res = runTool({ items: items() });
    const data = res.values!["portfolioData"] as {
      creator: { name: string };
      niches: string[];
      samples: { niche: string; url: string; caption: string }[];
      counts: { niches: number; samples: number };
    };
    assert.equal(data.creator.name, "Maya R.");
    assert.deepEqual(data.niches, ["Skincare", "Fitness"]);
    assert.equal(data.samples.length, 2);
    assert.deepEqual(data.counts, { niches: 2, samples: 2 });
  });

  it("samples preserve input order and carry niche + url + caption", () => {
    const res = runTool({ items: items() });
    const data = res.values!["portfolioData"] as {
      samples: { niche: string; url: string; caption: string }[];
    };
    assert.equal(data.samples[0].url, "https://example.com/video-1");
    assert.equal(data.samples[0].caption, "Morning routine UGC");
    assert.equal(data.samples[1].url, "https://example.com/video-2");
    assert.equal(data.samples[1].caption, "");
  });

  it("dedupes niches case-insensitively keeping first casing", () => {
    const res = runTool({ items: items() });
    const data = res.values!["portfolioData"] as { niches: string[] };
    assert.deepEqual(data.niches, ["Skincare", "Fitness"]);
  });

  it("entry without sampleUrl still builds a valid portfolio (no samples required)", () => {
    const res = runTool({
      items: [{ creatorName: "Leo", niche: "Coffee" }],
    });
    assert.equal(res.ok, true);
    const data = res.values!["portfolioData"] as {
      samples: unknown[];
      counts: { samples: number };
    };
    assert.deepEqual(data.samples, []);
    assert.equal(data.counts.samples, 0);
  });

  it("empty items returns error", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at least one portfolio entry/i);
  });

  it("non-array items returns error", () => {
    const res = runTool({ items: null });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("missing creator name returns error naming the item", () => {
    const res = runTool({ items: [{ creatorName: "", niche: "Skincare" }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1.*creator name is required/);
  });

  it("creator name over 80 chars returns error", () => {
    const res = runTool({
      items: [{ creatorName: "x".repeat(81), niche: "Skincare" }],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /80 characters/);
  });

  it("mismatched creator names across items returns error", () => {
    const res = runTool({
      items: [
        { creatorName: "Maya R.", niche: "Skincare" },
        { creatorName: "Someone Else", niche: "Fitness" },
      ],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2.*must match/);
  });

  it("empty niche returns error", () => {
    const res = runTool({ items: [{ creatorName: "Maya R.", niche: "  " }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1.*niche is required/);
  });

  it("more than 10 unique niches returns error", () => {
    const many = Array.from({ length: 11 }, (_, i) => ({
      creatorName: "Maya R.",
      niche: `Niche ${i}`,
    }));
    const res = runTool({ items: many });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at most 10 unique niches/);
  });

  it("invalid sampleUrl returns error naming the item", () => {
    const res = runTool({
      items: [{ creatorName: "Maya R.", niche: "Skincare", sampleUrl: "not-a-url" }],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1.*valid URL/);
  });

  it("sampleUrl without http(s) scheme is rejected", () => {
    const res = runTool({
      items: [{ creatorName: "Maya R.", niche: "Skincare", sampleUrl: "ftp://example.com/x" }],
    });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("caption over 300 chars returns error", () => {
    const res = runTool({
      items: [
        {
          creatorName: "Maya R.",
          niche: "Skincare",
          sampleUrl: "https://example.com/x",
          sampleCaption: "y".repeat(301),
        },
      ],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /300 characters/);
  });

  it("output is pure data: serialized JSON contains no HTML markup", () => {
    const res = runTool({
      items: [
        {
          creatorName: "Maya <script>alert(1)</script> R.",
          niche: "Skincare",
          sampleUrl: "https://example.com/x",
          sampleCaption: "<b>bold</b>",
        },
      ],
    });
    assert.equal(res.ok, true);
    const json = JSON.stringify(res.values!["portfolioData"]);
    assert.doesNotMatch(json, /<html/i);
    assert.doesNotMatch(json, /<div/i);
    assert.doesNotMatch(json, /<body/i);
  });

  it("deterministic: identical items give identical data", () => {
    const a = runTool({ items: items() });
    const b = runTool({ items: items() });
    assert.deepEqual(a, b);
  });
});
