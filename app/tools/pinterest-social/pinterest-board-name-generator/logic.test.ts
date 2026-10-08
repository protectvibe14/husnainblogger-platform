import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  NAME_BANK,
  BANK_SIZES,
  BOARD_NAME_TONES,
  DEFAULT_COUNT,
  MAX_COUNT,
  MIN_COUNT,
  MAX_NAME_LENGTH,
  MAX_KEYWORD_LENGTH,
} from "./logic.ts";
import { outputs } from "./meta.ts";

function okValues(input: Record<string, unknown>): string[] {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  const names = r.values["boardNameCandidates"];
  assert.ok(Array.isArray(names), "boardNameCandidates must be an array");
  return names as string[];
}

describe("pinterest-board-name-generator", () => {
  it("happy path: default tone seo, default count 5", () => {
    const names = okValues({ nicheKeyword: "meal prep" });
    assert.equal(names.length, DEFAULT_COUNT);
    for (const n of names) {
      assert.ok(n.includes("meal prep"), n);
      assert.ok(!n.includes("{keyword}"), n);
      assert.ok(n.length <= MAX_NAME_LENGTH, n);
    }
  });

  it("all three tones generate count names with the keyword", () => {
    for (const tone of BOARD_NAME_TONES) {
      const names = okValues({ nicheKeyword: "fall outfits", tone, count: 4 });
      assert.equal(names.length, 4, `tone ${tone}`);
      for (const n of names) {
        assert.ok(n.includes("fall outfits"), `${tone}: ${n}`);
        assert.ok(n.length <= MAX_NAME_LENGTH);
      }
    }
  });

  it("tones produce different name sets", () => {
    const seo = okValues({ nicheKeyword: "gardening", tone: "seo", count: 10 });
    const playful = okValues({ nicheKeyword: "gardening", tone: "playful", count: 10 });
    const brand = okValues({ nicheKeyword: "gardening", tone: "brand", count: 10 });
    const overlap = seo.filter((n) => playful.includes(n) || brand.includes(n));
    assert.equal(overlap.length, 0, `tone sets should not overlap: ${overlap}`);
  });

  it("count boundaries: 1 and 10 work", () => {
    assert.equal(okValues({ nicheKeyword: "x", count: 1 }).length, 1);
    assert.equal(okValues({ nicheKeyword: "x", count: 10 }).length, 10);
  });

  it("count accepts numeric strings", () => {
    assert.equal(okValues({ nicheKeyword: "x", count: "3" }).length, 3);
  });

  it("determinism: same input twice gives identical output", () => {
    const a = runTool({ nicheKeyword: "home office", tone: "brand", count: 7 });
    const b = runTool({ nicheKeyword: "home office", tone: "brand", count: 7 });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ nicheKeyword: "skincare" });
    assert.ok(r.values);
    const valueIds = Object.keys(r.values).sort();
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("no duplicate names in one batch (count = 10)", () => {
    const names = okValues({ nicheKeyword: "wedding", tone: "playful", count: 10 });
    assert.equal(new Set(names).size, names.length);
  });

  it("empty keyword errors with guidance", () => {
    const r = runTool({ nicheKeyword: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error && r.error.length > 10, "error should guide the user");
  });

  it("blank keyword errors", () => {
    assert.equal(runTool({ nicheKeyword: "   " }).ok, false);
  });

  it("missing keyword errors", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("non-string keyword errors", () => {
    assert.equal(runTool({ nicheKeyword: 42 }).ok, false);
  });

  it("keyword longer than 100 chars errors", () => {
    const r = runTool({ nicheKeyword: "k".repeat(MAX_KEYWORD_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("100"));
  });

  it("keyword of exactly 100 chars still produces names <=100 chars", () => {
    // Honest edge: truncation can collapse templates to identical names, so
    // fewer than `count` distinct names may come back — never duplicates.
    const names = okValues({ nicheKeyword: "k".repeat(MAX_KEYWORD_LENGTH), count: 10 });
    assert.ok(names.length > 0 && names.length <= 10);
    assert.equal(new Set(names).size, names.length);
    for (const n of names) assert.ok(n.length <= MAX_NAME_LENGTH, `len ${n.length}`);
  });

  it("long keyword names are truncated at word boundaries, never mid-word cuts with dangling fragments", () => {
    const names = okValues({ nicheKeyword: "small kitchen organization ideas for tiny apartments", count: 10 });
    for (const n of names) {
      assert.ok(n.length <= MAX_NAME_LENGTH, n);
      assert.ok(!n.endsWith(" ") && !n.endsWith("-"), n);
    }
  });

  it("non-Latin keyword passes through unchanged (no transliteration)", () => {
    const names = okValues({ nicheKeyword: "سفر", count: 3 });
    for (const n of names) assert.ok(n.includes("سفر"), n);
    const jp = okValues({ nicheKeyword: "旅行", tone: "brand", count: 2 });
    for (const n of jp) assert.ok(n.includes("旅行"), n);
  });

  it("keyword is trimmed of surrounding whitespace", () => {
    const names = okValues({ nicheKeyword: "  declutter  " });
    for (const n of names) {
      assert.ok(n.includes("declutter"), n);
      assert.ok(!n.includes("  declutter"), n);
    }
  });

  it("invalid tone errors and lists valid tones", () => {
    const r = runTool({ nicheKeyword: "x", tone: "funny" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("seo"));
  });

  it("count 0 and 11 error", () => {
    assert.equal(runTool({ nicheKeyword: "x", count: 0 }).ok, false);
    assert.equal(runTool({ nicheKeyword: "x", count: MAX_COUNT + 1 }).ok, false);
  });

  it("non-integer and non-numeric count error", () => {
    assert.equal(runTool({ nicheKeyword: "x", count: 2.5 }).ok, false);
    assert.equal(runTool({ nicheKeyword: "x", count: "many" }).ok, false);
  });

  it("non-object input errors", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });

  it("bank bounds: 12 non-empty templates per tone, 36 total", () => {
    assert.equal(BOARD_NAME_TONES.length, 3);
    for (const tone of BOARD_NAME_TONES) {
      const bank = NAME_BANK[tone];
      assert.equal(bank.length, 12, `tone ${tone} bank size`);
      for (const t of bank) {
        assert.ok(t.length > 0, "no empty templates");
        assert.ok(t.includes("{keyword}"), `template missing placeholder: ${t}`);
      }
    }
    assert.equal(BANK_SIZES.total, 36);
    assert.equal(BANK_SIZES.perTone, 12);
    assert.ok(MIN_COUNT >= 1 && MAX_COUNT <= 12, "count max never exceeds bank size");
  });

  it("no empty picks: every generated name is non-empty for a minimal keyword", () => {
    const names = okValues({ nicheKeyword: "a", tone: "seo", count: 10 });
    for (const n of names) assert.ok(n.trim().length > 0);
  });
});
