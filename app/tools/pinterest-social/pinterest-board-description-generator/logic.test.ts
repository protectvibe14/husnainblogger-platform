import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  OPENER_BANK,
  VALUE_PAIR_BANK,
  VALUE_SINGLE_BANK,
  VALUE_GENERIC_BANK,
  CLOSER_BANK,
  BANK_SIZES,
  BOARD_DESC_TONES,
  MAX_DESCRIPTION_LENGTH,
  MAX_KEYWORDS_USED,
} from "./logic.ts";
import { outputs } from "./meta.ts";

function okDescription(input: Record<string, unknown>): string {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  const d = r.values["boardDescription"];
  assert.equal(typeof d, "string", "boardDescription must be a string");
  return d as string;
}

describe("pinterest-board-description-generator", () => {
  it("happy path: board name only -> description under 500 chars, board name in first sentence", () => {
    const d = okDescription({ boardName: "Cozy Fall Decor" });
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, `len ${d.length}`);
    const firstSentence = d.split(/(?<=[.!?])\s/)[0];
    assert.ok(firstSentence.includes("Cozy Fall Decor"), d);
    assert.ok(d.length > 40, "description should be a real paragraph");
  });

  it("keywords are woven into the description", () => {
    const d = okDescription({
      boardName: "Small Kitchen Ideas",
      keywords: ["pantry organization", "tiny kitchens"],
    });
    assert.ok(d.includes("pantry organization"), d);
    assert.ok(d.includes("tiny kitchens"), d);
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH);
  });

  it("keywords accepted as a comma-separated string", () => {
    const d = okDescription({
      boardName: "Garden Plans",
      keywords: "raised beds, container gardening",
    });
    assert.ok(d.includes("raised beds"), d);
    assert.ok(d.includes("container gardening"), d);
  });

  it("all three tones produce valid descriptions", () => {
    for (const tone of BOARD_DESC_TONES) {
      const d = okDescription({ boardName: "DIY Gifts", tone, keywords: ["handmade"] });
      assert.ok(d.includes("DIY Gifts"), `${tone}: ${d}`);
      assert.ok(d.includes("handmade"), `${tone}: ${d}`);
      assert.ok(d.length <= MAX_DESCRIPTION_LENGTH);
    }
  });

  it("determinism: same input twice gives identical output", () => {
    const a = runTool({ boardName: "Meal Prep", keywords: ["lunch"], tone: "seo" });
    const b = runTool({ boardName: "Meal Prep", keywords: ["lunch"], tone: "seo" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ boardName: "x" });
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it("empty board name errors with guidance", () => {
    const r = runTool({ boardName: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error && r.error.length > 10);
  });

  it("blank and non-string board names error", () => {
    assert.equal(runTool({ boardName: "   " }).ok, false);
    assert.equal(runTool({ boardName: 7 }).ok, false);
    assert.equal(runTool({}).ok, false);
  });

  it("board name over 200 chars errors", () => {
    const r = runTool({ boardName: "b".repeat(201) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("200"));
  });

  it("200-char board name still fits under 500 chars", () => {
    const d = okDescription({
      boardName: "b".repeat(200),
      keywords: ["a", "b", "c", "d", "e", "f"],
      tone: "seo",
    });
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, `len ${d.length}`);
    assert.ok(d.includes("b".repeat(200).slice(0, 50)), "board name (start) present");
  });

  it("more than 6 keywords are trimmed (first 6 woven, 7th ignored)", () => {
    const d = okDescription({
      boardName: "Wedding Ideas",
      keywords: ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8"],
    });
    assert.ok(d.includes("k6"), d);
    assert.ok(!d.includes("k7"), `7th keyword should be trimmed: ${d}`);
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH);
  });

  it("keyword containing a comma/pipe (pasted list) is rejected", () => {
    const r = runTool({ boardName: "x", keywords: ["a, b, c"] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("list"));
  });

  it("keyword over 60 chars errors", () => {
    assert.equal(runTool({ boardName: "x", keywords: ["k".repeat(61)] }).ok, false);
  });

  it("non-string keyword errors", () => {
    assert.equal(runTool({ boardName: "x", keywords: [5] }).ok, false);
  });

  it("invalid tone errors and lists valid tones", () => {
    const r = runTool({ boardName: "x", tone: "sassy" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("friendly"));
  });

  it("non-Latin board name and keywords pass through unchanged", () => {
    const d = okDescription({ boardName: "سفر", keywords: ["پہاڑ"] });
    assert.ok(d.includes("سفر"), d);
    assert.ok(d.includes("پہاڑ"), d);
  });

  it("no leftover placeholders in output", () => {
    const d = okDescription({ boardName: "x", keywords: ["y", "z"], tone: "professional" });
    assert.ok(!d.includes("{board}"), d);
    assert.ok(!d.includes("{kw1}"), d);
    assert.ok(!d.includes("{kw2}"), d);
  });

  it("no keyword-stuffing pattern: keywords only appear inside sentences", () => {
    const d = okDescription({
      boardName: "x",
      keywords: ["alpha", "beta", "gamma", "delta"],
    });
    // a comma/pipe-joined keyword list would be stuffing; sentences use "and"
    assert.ok(!/\b(alpha|beta|gamma|delta)\s*[,|]\s*(alpha|beta|gamma|delta)/.test(d), d);
  });

  it("odd keyword count uses a single-keyword line for the leftover", () => {
    const d = okDescription({ boardName: "x", keywords: ["solo"] });
    assert.ok(d.includes("solo"), d);
    assert.ok(!d.includes("{kw2}"), d);
  });

  it("empty keywords array behaves like no keywords", () => {
    const a = okDescription({ boardName: "Board A", keywords: [] });
    const b = okDescription({ boardName: "Board A" });
    assert.equal(a, b);
  });

  it("bank bounds: documented sizes match actual banks", () => {
    for (const tone of BOARD_DESC_TONES) {
      assert.equal(OPENER_BANK[tone].length, 4, `openers ${tone}`);
      assert.equal(CLOSER_BANK[tone].length, 2, `closers ${tone}`);
      for (const t of OPENER_BANK[tone]) assert.ok(t.includes("{board}"));
    }
    assert.equal(VALUE_PAIR_BANK.length, 4);
    assert.equal(VALUE_SINGLE_BANK.length, 4);
    assert.equal(VALUE_GENERIC_BANK.length, 2);
    assert.equal(BANK_SIZES.total, 28);
    const all = [
      ...Object.values(OPENER_BANK).flat(),
      ...VALUE_PAIR_BANK,
      ...VALUE_SINGLE_BANK,
      ...VALUE_GENERIC_BANK,
      ...Object.values(CLOSER_BANK).flat(),
    ];
    for (const t of all) assert.ok(t.length > 0, "no empty templates");
    assert.ok(MAX_KEYWORDS_USED === 6);
  });

  it("non-object input errors", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});
