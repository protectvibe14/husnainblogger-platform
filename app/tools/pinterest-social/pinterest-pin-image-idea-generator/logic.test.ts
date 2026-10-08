import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TITLE_BANK,
  COMPOSITION_BANK,
  TEXT_OVERLAY_BANK,
  COLOR_DIRECTION_BANK,
  FIRST_FRAME_BANK,
  BANK_SIZES,
  PIN_FORMATS,
  FORMAT_RATIOS,
  MAX_OVERLAY_WORDS,
  MAX_TOPIC_LENGTH,
  ABSTRACT_TOPICS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

function okBriefs(input: Record<string, unknown>): string[] {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  const b = r.values["imageBriefs"];
  assert.ok(Array.isArray(b), "imageBriefs must be an array");
  return b as string[];
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

describe("pinterest-pin-image-idea-generator", () => {
  it("happy path: standard format -> 5 briefs with all fields, ratio 2:3", () => {
    const briefs = okBriefs({ pinTopic: "small balcony garden" });
    assert.equal(briefs.length, 5);
    for (const b of briefs) {
      assert.ok(b.includes("small balcony garden"), b);
      assert.ok(b.includes("Composition:"), b);
      assert.ok(b.includes("Text overlay:"), b);
      assert.ok(b.includes("Color direction:"), b);
      assert.ok(b.includes("Format ratio: 2:3"), b);
      assert.ok(!b.includes("First frame"), "standard briefs have no first-frame note");
      assert.ok(!b.includes("{topic}"), b);
    }
  });

  it("idea format -> 9:16, no first-frame note", () => {
    const briefs = okBriefs({ pinTopic: "meal prep", pinFormat: "idea", count: 2 });
    assert.equal(briefs.length, 2);
    for (const b of briefs) {
      assert.ok(b.includes("Format ratio: 9:16"), b);
      assert.ok(!b.includes("First frame"), b);
    }
  });

  it("video format -> 9:16 plus first-frame guidance", () => {
    const briefs = okBriefs({ pinTopic: "pasta recipe", pinFormat: "video", count: 3 });
    for (const b of briefs) {
      assert.ok(b.includes("Format ratio: 9:16"), b);
      assert.ok(b.includes("First frame:"), b);
    }
  });

  it("every supported format ties to a supported ratio", () => {
    for (const f of PIN_FORMATS) {
      const briefs = okBriefs({ pinTopic: "weeknight dinners", pinFormat: f, count: 1 });
      assert.ok(briefs[0].includes(`Format ratio: ${FORMAT_RATIOS[f]}`));
      assert.ok(["2:3", "9:16"].includes(FORMAT_RATIOS[f]));
    }
  });

  it("count boundaries 1 and 10, briefs unique in a batch of 10", () => {
    assert.equal(okBriefs({ pinTopic: "candles", count: 1 }).length, 1);
    const ten = okBriefs({ pinTopic: "candles", count: 10 });
    assert.equal(ten.length, 10);
    assert.equal(new Set(ten).size, 10, "no duplicate briefs in a batch");
  });

  it("count accepts numeric strings", () => {
    assert.equal(okBriefs({ pinTopic: "candle making", count: "4" }).length, 4);
  });

  it("determinism: same input twice gives identical output", () => {
    const a = runTool({ pinTopic: "skincare", pinFormat: "video", count: 6 });
    const b = runTool({ pinTopic: "skincare", pinFormat: "video", count: 6 });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ pinTopic: "candle making" });
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it("empty / blank / missing / non-string topic errors", () => {
    assert.equal(runTool({ pinTopic: "" }).ok, false);
    assert.equal(runTool({ pinTopic: "   " }).ok, false);
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ pinTopic: 3 }).ok, false);
  });

  it("abstract topics are rejected with sub-topic guidance", () => {
    for (const abstract of ["motivation", "Things", "LIFE", "vibes"]) {
      const r = runTool({ pinTopic: abstract });
      assert.equal(r.ok, false, `abstract topic "${abstract}" should error`);
      assert.ok(r.error!.toLowerCase().includes('sub-topic'), r.error ?? 'failed');
    }
  });

  it("two-character topic is rejected", () => {
    assert.equal(runTool({ pinTopic: "ab" }).ok, false);
  });

  it("topic over 120 chars errors", () => {
    const r = runTool({ pinTopic: "t".repeat(MAX_TOPIC_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("120"));
  });

  it("concrete multi-word topics similar to abstract words are accepted", () => {
    const briefs = okBriefs({ pinTopic: "morning motivation routine" });
    assert.ok(briefs[0].includes("morning motivation routine"));
  });

  it("invalid pin format errors and lists valid formats", () => {
    const r = runTool({ pinTopic: "candle making", pinFormat: "story" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("standard"));
  });

  it("count out of range / non-integer errors", () => {
    assert.equal(runTool({ pinTopic: "weeknight dinners", count: 0 }).ok, false);
    assert.equal(runTool({ pinTopic: "weeknight dinners", count: 11 }).ok, false);
    assert.equal(runTool({ pinTopic: "weeknight dinners", count: 2.5 }).ok, false);
  });

  it("non-Latin topic passes through unchanged", () => {
    const briefs = okBriefs({ pinTopic: "دیسی کھانے" });
    assert.ok(briefs[0].includes("دیسی کھانے"));
  });

  it("bank bound: every text overlay is <= 8 words ({topic} counts as one word)", () => {
    for (const t of TEXT_OVERLAY_BANK) {
      assert.ok(t.length > 0, "no empty overlay templates");
      assert.ok(
        countWords(t) <= MAX_OVERLAY_WORDS,
        `"${t}" has ${countWords(t)} words`
      );
    }
  });

  it("generated overlays contain the topic and stay short", () => {
    const briefs = okBriefs({ pinTopic: "cozy reading nook", count: 10 });
    for (const b of briefs) {
      const line = b.split("\n").find((l) => l.includes("Text overlay:"));
      assert.ok(line, b);
      assert.ok(line.includes("cozy reading nook"), b);
      // Bank guarantees <= 8 words with {topic} as one word; a 3-word topic
      // adds at most 2 extra words — overlays stay glanceable.
      assert.ok(countWords(line) <= MAX_OVERLAY_WORDS + 6, b);
    }
  });

  it("bank sizes documented and non-empty", () => {
    assert.equal(TITLE_BANK.length, 10);
    assert.equal(COMPOSITION_BANK.length, 10);
    assert.equal(TEXT_OVERLAY_BANK.length, 10);
    assert.equal(COLOR_DIRECTION_BANK.length, 8);
    assert.equal(FIRST_FRAME_BANK.length, 4);
    assert.equal(BANK_SIZES.total, 42);
    assert.ok(ABSTRACT_TOPICS.length > 0);
    for (const bank of [TITLE_BANK, COMPOSITION_BANK, TEXT_OVERLAY_BANK, FIRST_FRAME_BANK]) {
      for (const t of bank) assert.ok(t.includes("{topic}"), `missing placeholder: ${t}`);
    }
  });

  it("no empty briefs", () => {
    const briefs = okBriefs({ pinTopic: "cozy reading nook", count: 10 });
    for (const b of briefs) assert.ok(b.trim().length > 50, b);
  });

  it("non-object input errors", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});
