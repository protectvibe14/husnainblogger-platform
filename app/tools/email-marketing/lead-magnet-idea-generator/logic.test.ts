/**
 * Tests for the Lead Magnet Idea Generator pure logic (tool-425).
 *
 * Run: node --test app/tools/email-marketing/lead-magnet-idea-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  readCount,
  TITLE_PATTERNS,
  WHY_CONVERTS,
  FORMATS,
  IDEAS_COLUMNS,
  MIN_COUNT,
  MAX_COUNT,
  MAX_NICHE_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const VALID = {
  niche: "email marketing",
  audience: "bloggers",
  format: "checklist",
  count: 3,
};

interface IdeasTable {
  columns: string[];
  rows: string[][];
}

function ideasOf(r: { ok: boolean; values?: Record<string, unknown> }): IdeasTable {
  assert.strictEqual(r.ok, true);
  return r.values!["ideas"] as IdeasTable;
}

describe("runTool — happy path", () => {
  it("returns a table with the requested number of ideas", () => {
    const t = ideasOf(runTool({ ...VALID }));
    assert.deepStrictEqual(t.columns, [...IDEAS_COLUMNS]);
    assert.strictEqual(t.rows.length, 3);
    for (const row of t.rows) {
      assert.strictEqual(row.length, 4);
      assert.ok(row[1].length > 0, "title must not be empty");
      assert.ok(row[3].length > 0, "why-it-converts must not be empty");
    }
  });

  it("embeds niche or audience in every title (patterns vary which they use)", () => {
    const t = ideasOf(runTool({ ...VALID }));
    for (const row of t.rows) {
      assert.ok(
        row[1].includes("email marketing") || row[1].includes("bloggers"),
        row[1],
      );
    }
    // Across the run, both inputs appear at least once.
    const all = t.rows.map((r) => r[1]).join(" ");
    assert.ok(all.includes("email marketing"));
    assert.ok(all.includes("bloggers"));
  });

  it("uses only the requested format when a format is given", () => {
    const t = ideasOf(runTool({ ...VALID, count: 8 }));
    assert.strictEqual(t.rows.length, 8);
    for (const row of t.rows) {
      assert.strictEqual(row[2], "Checklist");
    }
  });

  it("cycles formats deterministically when format is 'any'", () => {
    const t = ideasOf(runTool({ niche: "fitness", audience: "moms", format: "any", count: 5 }));
    const formats = t.rows.map((r) => r[2]);
    assert.strictEqual(new Set(formats).size, 5, "5 ideas should cover all 5 formats");
  });

  it("defaults to cycling formats when format is omitted", () => {
    const { format, ...rest } = VALID;
    const t = ideasOf(runTool({ ...rest, count: 5 }));
    assert.strictEqual(t.rows.length, 5);
  });

  it("generates distinct titles within one run", () => {
    const t = ideasOf(runTool({ ...VALID, count: 20 }));
    const titles = t.rows.map((r) => r[1]);
    assert.strictEqual(new Set(titles).size, 20);
  });

  it("accepts a numeric-string count", () => {
    const t = ideasOf(runTool({ ...VALID, count: "4" }));
    assert.strictEqual(t.rows.length, 4);
  });
});

describe("runTool — output ids match meta.ts", () => {
  it("values keys equal the meta outputs ids", () => {
    const r = runTool({ ...VALID });
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      metaOutputs.map((o) => o.id).sort(),
    );
    assert.deepStrictEqual(Object.keys(r.values!).sort(), ["ideas"]);
  });
});

describe("runTool — validation errors", () => {
  it("errors when niche is missing", () => {
    const { niche, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Niche"));
  });

  it("errors when audience is whitespace-only", () => {
    const r = runTool({ ...VALID, audience: "   " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Audience"));
  });

  it("errors when count is missing", () => {
    const { count, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Number of ideas"));
  });

  it("errors on NaN / Infinity / non-numeric counts", () => {
    for (const bad of [NaN, Infinity, -Infinity, "abc", ""]) {
      const r = runTool({ ...VALID, count: bad });
      assert.strictEqual(r.ok, false, `count=${String(bad)}`);
      assert.ok(r.error!.includes("Number of ideas"));
    }
  });

  it("errors on an invalid format", () => {
    const r = runTool({ ...VALID, format: "podcast" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Format must be one of"));
  });
});

describe("runTool — clamping and truncation", () => {
  it("clamps count 0 up to the minimum with a visible note row", () => {
    const r = runTool({ ...VALID, count: 0 });
    assert.strictEqual(r.ok, true);
    const t = r.values!["ideas"] as IdeasTable;
    assert.strictEqual(t.rows.length, 2); // 1 idea + 1 note row
    assert.strictEqual(t.rows[0][0], "1");
    assert.ok(t.rows[1][1].includes(`minimum of ${MIN_COUNT}`));
  });

  it("clamps count 25 down to the maximum with a visible note row", () => {
    const r = runTool({ ...VALID, count: 25 });
    assert.strictEqual(r.ok, true);
    const t = r.values!["ideas"] as IdeasTable;
    assert.strictEqual(t.rows.length, MAX_COUNT + 1); // 20 ideas + 1 note row
    assert.ok(t.rows[MAX_COUNT][1].includes(`maximum of ${MAX_COUNT}`));
  });

  it("readCount rejects non-finite numbers directly", () => {
    assert.deepStrictEqual(readCount({ count: NaN }).ok, false);
    assert.deepStrictEqual(readCount({ count: Infinity }).ok, false);
    assert.deepStrictEqual(readCount({ count: "7" }), { ok: true, value: 7 });
  });

  it("truncates overlong niche with a visible note row", () => {
    const long = "n".repeat(MAX_NICHE_CHARS + 15);
    const r = runTool({ ...VALID, niche: long, count: 2 });
    assert.strictEqual(r.ok, true);
    const t = r.values!["ideas"] as IdeasTable;
    assert.strictEqual(t.rows.length, 3); // 2 ideas + 1 note row
    assert.ok(t.rows[2][1].includes("shortened"));
  });

  it("escapes HTML in user input (plain-text output)", () => {
    const r = runTool({ ...VALID, niche: "<b>fitness</b>", count: 1 });
    const t = ideasOf(r);
    assert.ok(!t.rows[0][1].includes("<b>"));
    assert.ok(t.rows[0][1].includes("&lt;b&gt;fitness&lt;/b&gt;"));
  });
});

describe("runTool — determinism and bank bounds", () => {
  it("returns identical output for identical inputs", () => {
    const a = runTool({ ...VALID });
    const b = runTool({ ...VALID });
    assert.deepStrictEqual(a, b);
  });

  it("uses the documented bank sizes with no empty picks", () => {
    assert.strictEqual(TITLE_PATTERNS.length, 24);
    assert.strictEqual(FORMATS.length, 5);
    for (const f of FORMATS) {
      assert.strictEqual(WHY_CONVERTS[f].length, 4);
      for (const reason of WHY_CONVERTS[f]) {
        assert.ok(reason.trim().length > 0);
      }
    }
    for (const p of TITLE_PATTERNS) {
      assert.ok(p.trim().length > 0, "pattern must not be empty");
    }
  });
});
