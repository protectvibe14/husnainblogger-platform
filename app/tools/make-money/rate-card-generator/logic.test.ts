/**
 * Tests for the Rate Card Generator (tool-085).
 *
 * Run: node --test app/tools/make-money/rate-card-generator/logic.test.ts
 *
 * All expected values are hand-computed from the constants and parser in
 * logic.ts, never copied from tool output. Fallback bands are labeled
 * estimates; tests assert the math and honesty labels, not market data.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateRateCard,
  runTool,
  formatForPlatform,
  platformNote,
  ESTIMATE_TIERS,
  MAX_ROWS,
} from "./logic.ts";

const OUTPUT_IDS = ["rateCard", "summary", "disclaimer"];

describe("formatForPlatform / platformNote", () => {
  it("maps platform keywords to deliverable labels", () => {
    assert.strictEqual(formatForPlatform("YouTube"), "Sponsored video");
    assert.strictEqual(formatForPlatform("my podcast"), "Sponsored episode");
    assert.strictEqual(formatForPlatform("Newsletter"), "Sponsored placement");
    assert.strictEqual(formatForPlatform("TikTok"), "Sponsored post");
    assert.strictEqual(formatForPlatform("Instagram"), "Sponsored post");
    assert.strictEqual(formatForPlatform("Some New App"), "Sponsored placement");
  });

  it("gives platform-specific estimate context", () => {
    assert.ok(platformNote("Podcast").includes("$300–$500"), "podcast note mentions flat-fee guidance");
    assert.ok(platformNote("Newsletter").includes("$150 CPM"), "newsletter note mentions CPM benchmarks");
    assert.ok(platformNote("YouTube").includes("$20–$200"), "youtube note cites the band family");
    assert.ok(platformNote("TikTok").includes("Generic estimate"), "unknown platform gets generic note");
  });
});

describe("generateRateCard — happy paths", () => {
  it("uses user-supplied base rates and marks them as your-rate", () => {
    const r = generateRateCard({
      creatorName: "Jane Doe",
      platformRows: "YouTube, 120000, 800-1500",
    });
    assert.strictEqual(r.rows.length, 1);
    assert.strictEqual(r.rows[0].platform, "YouTube");
    assert.strictEqual(r.rows[0].audience, 120000);
    assert.strictEqual(r.rows[0].format, "Sponsored video");
    assert.strictEqual(r.rows[0].rateLow, 800);
    assert.strictEqual(r.rows[0].rateHigh, 1500);
    assert.strictEqual(r.rows[0].source, "your-rate");
    assert.ok(r.rateCard.includes("RATE CARD — Jane Doe"), "header names the creator");
    assert.ok(r.rateCard.includes("Your rate"), "card marks user rates");
    assert.ok(r.summary.includes("1 platform"), "summary counts platforms");
  });

  it("falls back to estimate bands when no base rate is given", () => {
    // 8000 audience -> tier 0 (<10k): 50–200 rounded to $25 -> 50–200.
    const r = generateRateCard({ platformRows: "Podcast, 8000" });
    assert.strictEqual(r.rows[0].source, "estimate-band");
    assert.strictEqual(r.rows[0].rateLow, 50);
    assert.strictEqual(r.rows[0].rateHigh, 200);
    assert.ok(r.rateCard.includes("ESTIMATE band"), "card marks estimate rows");
    assert.ok(r.summary.includes("ESTIMATE band"), "summary warns about estimates");
  });

  it("picks the band tier by audience size", () => {
    // 50000 -> tier 10k: 200–1000. 2500000 -> tier 1M: 10000–50000. 15000000 -> tier 10M: 50000–300000.
    const r = generateRateCard({
      platformRows: "TikTok, 50000\nInstagram, 2500000\nYouTube, 15000000",
    });
    assert.strictEqual(r.rows[0].rateLow, 200);
    assert.strictEqual(r.rows[0].rateHigh, 1000);
    assert.strictEqual(r.rows[1].rateLow, 10000);
    assert.strictEqual(r.rows[1].rateHigh, 50000);
    assert.strictEqual(r.rows[2].rateLow, 50000);
    assert.strictEqual(r.rows[2].rateHigh, 300000);
  });

  it("mixes user rates and estimate bands and skips blank lines", () => {
    const r = generateRateCard({
      platformRows: "YouTube, 120000, 800-1500\n\n  \nPodcast, 8000",
    });
    assert.strictEqual(r.rows.length, 2);
    assert.strictEqual(r.rows[0].source, "your-rate");
    assert.strictEqual(r.rows[1].source, "estimate-band");
    assert.ok(r.summary.includes("2 platforms"), "summary counts both");
    assert.ok(r.summary.includes("1 of 2 rows use ESTIMATE bands"));
  });

  it("rounds user rates to cents", () => {
    // 800.005 -> 800.01 half-up.
    const r = generateRateCard({ platformRows: "YouTube, 50000, 800.005-1500" });
    assert.strictEqual(r.rows[0].rateLow, 800.01);
    assert.strictEqual(r.rows[0].rateHigh, 1500);
  });

  it("works without a creator name", () => {
    const r = generateRateCard({ platformRows: "TikTok, 50000" });
    assert.ok(r.rateCard.startsWith("RATE CARD\n"), "header omits the name");
  });

  it("trims and caps the creator name at 80 chars", () => {
    const long = `  ${"A".repeat(200)}  `;
    const r = generateRateCard({ creatorName: long, platformRows: "TikTok, 50000" });
    assert.ok(r.rateCard.includes(`RATE CARD — ${"A".repeat(80)}`), "name capped at 80 chars");
  });

  it("document says the card is only as accurate as the user's inputs", () => {
    const r = generateRateCard({ platformRows: "YouTube, 120000, 800-1500" });
    assert.ok(
      r.rateCard.includes("only as accurate as the numbers you entered"),
      "card must carry the accuracy disclaimer",
    );
    assert.ok(
      r.disclaimer.includes("only as accurate as the numbers you entered"),
      "disclaimer output must say the same",
    );
  });

  it("exposes the documented estimate tier table", () => {
    assert.strictEqual(ESTIMATE_TIERS.length, 5);
    assert.deepStrictEqual([ESTIMATE_TIERS[0].low, ESTIMATE_TIERS[0].high], [50, 200]);
    assert.deepStrictEqual([ESTIMATE_TIERS[4].low, ESTIMATE_TIERS[4].high], [50000, 300000]);
  });
});

describe("generateRateCard — invalid input", () => {
  it("rejects empty rows (needs at least one platform)", () => {
    assert.throws(() => generateRateCard({ platformRows: "" }), /at least one platform/);
    assert.throws(() => generateRateCard({ platformRows: "   \n  " }), /at least one platform/);
  });

  it("names the line number for a missing platform name", () => {
    assert.throws(() => generateRateCard({ platformRows: ", 5000" }), /Line 1/);
  });

  it("names the line number for a missing follower count", () => {
    assert.throws(() => generateRateCard({ platformRows: "YouTube" }), /Line 1.*missing follower/);
  });

  it("rejects non-numeric, zero, or fractional follower counts", () => {
    assert.throws(() => generateRateCard({ platformRows: "YouTube, many" }), /Line 1/);
    assert.throws(() => generateRateCard({ platformRows: "YouTube, 0" }), /Line 1/);
    assert.throws(() => generateRateCard({ platformRows: "YouTube, 1.5" }), /Line 1/);
  });

  it("rejects malformed base rates and low > high", () => {
    assert.throws(() => generateRateCard({ platformRows: "YouTube, 5000, 800" }), /must look like/);
    assert.throws(() => generateRateCard({ platformRows: "YouTube, 5000, 1500-800" }), /low cannot exceed high/);
    assert.throws(() => generateRateCard({ platformRows: "YouTube, 5000, abc-def" }), /must be numbers/);
  });

  it("rejects too many rows", () => {
    const rows = Array.from({ length: MAX_ROWS + 1 }, (_, i) => `P${i}, 1000`).join("\n");
    assert.throws(() => generateRateCard({ platformRows: rows }), /Too many rows/);
  });

  it("rejects non-string platformRows and non-object input", () => {
    assert.throws(() => generateRateCard({ platformRows: 42 as unknown as string }), TypeError);
    assert.throws(() => generateRateCard(null as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("builds a card through the adapter", () => {
    const r = runTool({ creatorName: "Jane", platformRows: "YouTube, 120000, 800-1500\nPodcast, 8000" });
    assert.strictEqual(r.ok, true);
    assert.ok(typeof r.values?.["rateCard"] === "string");
    assert.ok((r.values?.["rateCard"] as string).includes("RATE CARD — Jane"));
    assert.ok((r.values?.["rateCard"] as string).includes("YouTube"));
    assert.ok((r.values?.["rateCard"] as string).includes("Podcast"));
    assert.ok(typeof r.values?.["summary"] === "string");
    assert.ok(typeof r.values?.["disclaimer"] === "string");
  });

  it("errors on empty rows with a human message", () => {
    assert.strictEqual(runTool({}).ok, false);
    assert.ok((runTool({}).error ?? "").length > 0);
    assert.strictEqual(runTool({ platformRows: "   " }).ok, false);
    assert.strictEqual(runTool({ platformRows: "YouTube, nope" }).ok, false);
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });

  it("returns exactly the meta.ts output ids", () => {
    const r = runTool({ platformRows: "TikTok, 50000" });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(Object.keys(r.values ?? {}).sort(), [...OUTPUT_IDS].sort());
  });

  it("is deterministic: two runs give identical results", () => {
    const input = { creatorName: "Jane", platformRows: "YouTube, 120000, 800-1500\nPodcast, 8000" };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });
});
