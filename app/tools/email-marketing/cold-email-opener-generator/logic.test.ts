import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateOpeners,
  hasRepeatedWords,
  OPENER_PATTERNS,
  OPENER_TONES,
  OPENER_COUNT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  prospectContext: "just opened a second office in Austin",
  industry: "dental clinics",
  tone: "friendly",
};

describe("cold-email-opener-generator (tool-409)", () => {
  it("happy path: returns 6 openers with personalization slots", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const table = r.values?.openers as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Opener", "Personalize this slot"]);
    assert.equal(table.rows.length, OPENER_COUNT);
    for (const row of table.rows) {
      assert.ok(row[0].length > 0);
      assert.ok(/^\{\{[a-zA-Z]+\}\}$/.test(row[1]), `slot format: ${row[1]}`);
    }
  });

  it("pattern bank sizes are as documented (4 tones x 6 = 24)", () => {
    assert.equal(OPENER_TONES.length, 4);
    assert.equal(Object.keys(OPENER_PATTERNS).length, 4);
    for (const t of OPENER_TONES) {
      assert.equal(OPENER_PATTERNS[t].length, 6, `tone ${t} must have 6 patterns`);
    }
  });

  it("context and industry are interpolated, no unfilled slots", () => {
    const r = runTool(baseValues);
    const table = r.values?.openers as { rows: string[][] };
    assert.ok(table.rows.some((row) => row[0].includes("dental clinics")));
    for (const row of table.rows) {
      assert.ok(!row[0].includes("{context}"));
      assert.ok(!row[0].includes("{industry}"));
    }
  });

  it("every opener carries a personalization slot to replace", () => {
    const r = runTool(baseValues);
    const table = r.values?.openers as { rows: string[][] };
    const slots = new Set(table.rows.map((row) => row[1]));
    assert.ok(slots.size >= 2, "slots should vary across openers");
  });

  it("tones produce distinct openers", () => {
    const friendly = (runTool(baseValues).values?.openers as { rows: string[][] }).rows.map(
      (r) => r[0],
    );
    const direct = (runTool({ ...baseValues, tone: "direct" }).values?.openers as {
      rows: string[][];
    }).rows.map((r) => r[0]);
    assert.ok(!friendly.some((f) => direct.includes(f)), "tones must not share copy");
  });

  it("no opener contains repeated adjacent words", () => {
    for (const t of OPENER_TONES) {
      const table = (runTool({ ...baseValues, tone: t }).values?.openers as {
        rows: string[][];
      }).rows;
      for (const row of table) {
        if (row[1] === "—") continue; // notice row
        assert.equal(hasRepeatedWords(row[0]), false, `repeated words: ${row[0]}`);
      }
    }
  });

  it("openers are first lines only, not full sequences", () => {
    const r = runTool(baseValues);
    const table = r.values?.openers as { rows: string[][] };
    for (const row of table.rows) {
      assert.ok(!row[0].toLowerCase().includes("follow-up"));
      assert.ok([...row[0]].length < 200, "opener should be a single short line");
    }
  });

  it("rejects missing prospectContext", () => {
    const r = runTool({ industry: "x", tone: "friendly" });
    assert.equal(r.ok, false);
  });

  it("rejects whitespace-only prospectContext", () => {
    const r = runTool({ ...baseValues, prospectContext: "   " });
    assert.equal(r.ok, false);
  });

  it("rejects missing industry", () => {
    const r = runTool({ prospectContext: "x", tone: "friendly" });
    assert.equal(r.ok, false);
  });

  it("rejects whitespace-only industry", () => {
    const r = runTool({ ...baseValues, industry: "\n " });
    assert.equal(r.ok, false);
  });

  it("rejects invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "romantic" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("tone"));
  });

  it("generateOpeners throws on empty industry", () => {
    assert.throws(() => generateOpeners("ctx", "  ", "friendly"), RangeError);
  });

  it("generateOpeners throws on bad tone", () => {
    assert.throws(() => generateOpeners("ctx", "ind", "nope"), RangeError);
  });

  it("overlong input trimmed with a visible notice row", () => {
    const long = "b".repeat(MAX_INPUT_CHARS + 40);
    const r = runTool({ ...baseValues, industry: long });
    assert.equal(r.ok, true);
    const table = r.values?.openers as { rows: string[][] };
    assert.equal(table.rows.length, OPENER_COUNT + 1);
    assert.ok(table.rows[table.rows.length - 1][0].includes("trimmed to 200 characters"));
  });

  it("CJK/emoji-safe inputs interpolate correctly", () => {
    const r = runTool({ prospectContext: "新开分店 🎉", industry: "餐饮", tone: "playful" });
    assert.equal(r.ok, true);
    const table = r.values?.openers as { rows: string[][] };
    assert.ok(table.rows.some((row) => row[0].includes("餐饮")));
  });

  it("deterministic: same input twice gives identical output", () => {
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), outputs.map((o) => o.id).sort());
  });
});
