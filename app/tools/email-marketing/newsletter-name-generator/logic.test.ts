import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TONES,
  SUFFIXES,
  TONE_WORDS,
  NAME_PATTERNS,
  TAGLINES,
  codePoints,
  sanitizePlain,
  MAX_NICHE_CHARS,
  MAX_KEYWORDS_CHARS,
  MIN_COUNT,
  MAX_COUNT,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    niche: "personal finance",
    keywords: "money, habits",
    tone: "bold",
    count: 5,
  };
}

function outputIdsOf(values: Record<string, unknown>): string[] {
  const r = runTool(values);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  return Object.keys(r.values ?? {}).sort();
}

describe("newsletter-name-generator", () => {
  it("happy path returns ok with names and notices", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    const names = r.values!.names as { name: string; taglineSuggestion: string }[];
    assert.equal(names.length, 5);
    for (const n of names) {
      assert.equal(typeof n.name, "string");
      assert.ok(n.name.length > 0, "name must not be empty");
      assert.equal(typeof n.taglineSuggestion, "string");
      assert.ok(n.taglineSuggestion.length > 0, "tagline must not be empty");
    }
    assert.ok(Array.isArray(r.values!.notices));
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputIdsOf(happyValues()), [...OUTPUT_IDS].sort());
  });

  it("deterministic: same inputs produce identical output", () => {
    const a = runTool(happyValues());
    const b = runTool(happyValues());
    assert.deepEqual(a, b);
  });

  it("different tone produces different names", () => {
    const a = runTool({ ...happyValues(), tone: "bold" });
    const b = runTool({ ...happyValues(), tone: "playful" });
    const namesA = (a.values!.names as { name: string }[]).map((n) => n.name);
    const namesB = (b.values!.names as { name: string }[]).map((n) => n.name);
    assert.notDeepEqual(namesA, namesB);
  });

  it("missing niche errors", () => {
    const r = runTool({ ...happyValues(), niche: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("whitespace-only niche errors", () => {
    const r = runTool({ ...happyValues(), niche: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("non-string niche errors", () => {
    const r = runTool({ ...happyValues(), niche: 42 });
    assert.equal(r.ok, false);
  });

  it("invalid tone errors and lists valid tones", () => {
    const r = runTool({ ...happyValues(), tone: "spicy" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /playful/);
  });

  it("missing tone errors", () => {
    const r = runTool({ ...happyValues(), tone: undefined });
    assert.equal(r.ok, false);
  });

  it("count NaN errors", () => {
    const r = runTool({ ...happyValues(), count: NaN });
    assert.equal(r.ok, false);
  });

  it("count Infinity errors", () => {
    const r = runTool({ ...happyValues(), count: Infinity });
    assert.equal(r.ok, false);
  });

  it("count as string errors", () => {
    const r = runTool({ ...happyValues(), count: "5" });
    assert.equal(r.ok, false);
  });

  it("count above max clamps to 20", () => {
    const r = runTool({ ...happyValues(), count: 25 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.names as unknown[]).length, MAX_COUNT);
  });

  it("count below min clamps to 1", () => {
    const r = runTool({ ...happyValues(), count: 0 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.names as unknown[]).length, MIN_COUNT);
  });

  it("fractional count is floored", () => {
    const r = runTool({ ...happyValues(), count: 3.7 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.names as unknown[]).length, 3);
  });

  it("works without keywords", () => {
    const r = runTool({ niche: "sourdough baking", tone: "playful", count: 3 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.names as unknown[]).length, 3);
  });

  it("whitespace-only keywords treated as absent", () => {
    const r = runTool({ ...happyValues(), keywords: "   " });
    assert.equal(r.ok, true);
  });

  it("overlong niche is truncated with a visible notice", () => {
    const long = "x".repeat(MAX_NICHE_CHARS + 10);
    const r = runTool({ ...happyValues(), niche: long });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(
      notices.some((n) => n.includes("shortened")),
      "expected truncation notice",
    );
    const names = r.values!.names as { name: string }[];
    for (const n of names) {
      assert.ok(!n.name.includes("x".repeat(MAX_NICHE_CHARS + 1)));
    }
  });

  it("emoji length measured in code points, not UTF-16 units", () => {
    assert.equal(codePoints("🎉🎉"), 2);
    // 80 emoji is exactly at the limit -> no truncation notice
    const r = runTool({ ...happyValues(), niche: "🎉".repeat(MAX_NICHE_CHARS) });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(!notices.some((n) => n.includes("shortened")));
  });

  it("81 emoji niche triggers truncation measured in code points", () => {
    const r = runTool({ ...happyValues(), niche: "🎉".repeat(MAX_NICHE_CHARS + 1) });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("shortened")));
  });

  it("HTML angle brackets are stripped from user text", () => {
    assert.equal(sanitizePlain("<b>hi</b>"), "bhi/b");
    const r = runTool({ ...happyValues(), niche: "<script>finance</script>" });
    assert.equal(r.ok, true);
    const names = r.values!.names as { name: string; taglineSuggestion: string }[];
    for (const n of names) {
      assert.ok(!n.name.includes("<") && !n.name.includes(">"));
      assert.ok(!n.taglineSuggestion.includes("<") && !n.taglineSuggestion.includes(">"));
    }
  });

  it("generated names are unique within a batch", () => {
    const r = runTool({ ...happyValues(), count: 20 });
    const names = (r.values!.names as { name: string }[]).map((n) => n.name);
    assert.equal(new Set(names).size, names.length);
  });

  it("every result carries the manual availability-check reminder", () => {
    const r = runTool(happyValues());
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("manually")));
  });

  it("no empty picks: names and taglines are non-blank", () => {
    for (const tone of TONES) {
      const r = runTool({ niche: "gardening", tone, count: 10 });
      assert.equal(r.ok, true);
      const names = r.values!.names as { name: string; taglineSuggestion: string }[];
      for (const n of names) {
        assert.ok(n.name.trim().length > 0);
        assert.ok(n.taglineSuggestion.trim().length > 0);
      }
    }
  });

  it("word bank sizes match documentation", () => {
    assert.equal(SUFFIXES.length, 18);
    assert.equal(NAME_PATTERNS.length, 10);
    assert.equal(TAGLINES.length, 8);
    let total = 0;
    for (const tone of TONES) total += TONE_WORDS[tone].length;
    assert.equal(total, 40);
  });

  it("keywords truncation notice mentions keywords", () => {
    const r = runTool({ ...happyValues(), keywords: "y".repeat(MAX_KEYWORDS_CHARS + 5) });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("Keywords")));
  });

  it("null values object errors", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
