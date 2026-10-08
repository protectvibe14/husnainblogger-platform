/**
 * Tests for the Lead Magnet Title Generator pure logic (tool-426).
 *
 * Run: node --test app/tools/email-marketing/lead-magnet-title-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  TITLE_PATTERNS,
  TONE_ADJECTIVES,
  TONES,
  TITLE_COUNT,
  TITLES_COLUMNS,
  MAX_TOPIC_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const VALID = {
  magnetType: "checklist",
  topic: "morning routines",
  outcome: "more focused workdays",
  tone: "bold",
};

interface TitlesTable {
  columns: string[];
  rows: string[][];
}

function titlesOf(r: { ok: boolean; values?: Record<string, unknown> }): TitlesTable {
  assert.strictEqual(r.ok, true);
  return r.values!["titles"] as TitlesTable;
}

describe("runTool — happy path", () => {
  it("returns 10 titles with correct character counts", () => {
    const t = titlesOf(runTool({ ...VALID }));
    assert.deepStrictEqual(t.columns, [...TITLES_COLUMNS]);
    assert.strictEqual(t.rows.length, TITLE_COUNT);
    for (const row of t.rows) {
      assert.strictEqual(row.length, 3);
      const title = row[1];
      assert.ok(title.length > 0, "title must not be empty");
      assert.strictEqual(row[2], String([...title].length), `charCount for: ${title}`);
    }
  });

  it("embeds the user inputs in every title (patterns vary which they use)", () => {
    const t = titlesOf(runTool({ ...VALID }));
    for (const row of t.rows) {
      const hits = ["checklist", "morning routines", "more focused workdays"].filter((x) =>
        row[1].includes(x),
      ).length;
      assert.ok(hits >= 2, `too few inputs in: ${row[1]}`);
    }
    // Across the run, every input appears at least once.
    const all = t.rows.map((r) => r[1]).join(" ");
    assert.ok(all.includes("checklist"));
    assert.ok(all.includes("morning routines"));
    assert.ok(all.includes("more focused workdays"));
  });

  it("uses a tone adjective from the selected tone in every title", () => {
    const t = titlesOf(runTool({ ...VALID }));
    const boldAdjs = TONE_ADJECTIVES[TONES.indexOf("bold")];
    for (const row of t.rows) {
      assert.ok(
        boldAdjs.some((adj) => row[1].includes(adj)),
        `no bold adjective in: ${row[1]}`,
      );
    }
  });

  it("accepts all four documented tones", () => {
    for (const tone of TONES) {
      const t = titlesOf(runTool({ ...VALID, tone }));
      const adjs = TONE_ADJECTIVES[TONES.indexOf(tone)];
      assert.ok(
        t.rows.every((row) => adjs.some((adj) => row[1].includes(adj))),
        tone,
      );
    }
  });

  it("generates distinct titles within one run", () => {
    const t = titlesOf(runTool({ ...VALID }));
    const titles = t.rows.map((r) => r[1]);
    assert.strictEqual(new Set(titles).size, TITLE_COUNT);
  });
});

describe("runTool — output ids match meta.ts", () => {
  it("values keys equal the meta outputs ids", () => {
    const r = runTool({ ...VALID });
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      metaOutputs.map((o) => o.id).sort(),
    );
    assert.deepStrictEqual(Object.keys(r.values!).sort(), ["titles"]);
  });
});

describe("runTool — validation errors", () => {
  it("errors when magnetType is missing", () => {
    const { magnetType, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Magnet type"));
  });

  it("errors when topic is whitespace-only", () => {
    const r = runTool({ ...VALID, topic: "   " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Topic"));
  });

  it("errors when outcome is missing", () => {
    const { outcome, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Outcome"));
  });

  it("errors on an invalid tone", () => {
    const r = runTool({ ...VALID, tone: "luxurious" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Tone must be one of"));
  });

  it("errors when tone is missing", () => {
    const { tone, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Tone must be one of"));
  });

  it("errors when topic is not a string", () => {
    const r = runTool({ ...VALID, topic: 42 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Topic"));
  });
});

describe("runTool — edge cases", () => {
  it("truncates overlong topic with a visible note row", () => {
    const long = "t".repeat(MAX_TOPIC_CHARS + 20);
    const r = runTool({ ...VALID, topic: long });
    assert.strictEqual(r.ok, true);
    const t = r.values!["titles"] as TitlesTable;
    assert.strictEqual(t.rows.length, TITLE_COUNT + 1);
    assert.ok(t.rows[TITLE_COUNT][1].includes("shortened"));
  });

  it("counts emoji as one character in charCount", () => {
    const r = runTool({ ...VALID, topic: "morning 🚀 routines" });
    assert.strictEqual(r.ok, true);
    const t = r.values!["titles"] as TitlesTable;
    for (const row of t.rows) {
      assert.strictEqual(row[2], String([...row[1]].length));
    }
  });

  it("escapes HTML in user input (plain-text output)", () => {
    const r = runTool({ ...VALID, outcome: "focus <now>" });
    const t = titlesOf(r);
    assert.ok(!t.rows[0][1].includes("<now>"));
    assert.ok(t.rows[0][1].includes("&lt;now&gt;"));
  });

  it("different tones produce different adjectives (deterministic)", () => {
    const bold = titlesOf(runTool({ ...VALID, tone: "bold" }));
    const friendly = titlesOf(runTool({ ...VALID, tone: "friendly" }));
    assert.notDeepStrictEqual(bold, friendly);
  });
});

describe("runTool — determinism and bank bounds", () => {
  it("returns identical output for identical inputs", () => {
    const a = runTool({ ...VALID });
    const b = runTool({ ...VALID });
    assert.deepStrictEqual(a, b);
  });

  it("uses the documented bank sizes with no empty picks", () => {
    assert.strictEqual(TITLE_PATTERNS.length, 12);
    assert.strictEqual(TONES.length, 4);
    assert.strictEqual(TONE_ADJECTIVES.length, 4);
    for (const adjs of TONE_ADJECTIVES) {
      assert.strictEqual(adjs.length, 4);
      for (const adj of adjs) {
        assert.ok(adj.trim().length > 0);
      }
    }
    for (const p of TITLE_PATTERNS) {
      assert.ok(p.trim().length > 0, "pattern must not be empty");
    }
  });
});
