/**
 * Tests for the Blog Series Planner pure logic (tool-036).
 *
 * Run: node --test app/tools/blogging-seo/blog-series-planner/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  slugify,
  pickRoleIndices,
  buildLinkNote,
  PART_ROLES,
  MIN_PARTS,
  MAX_PARTS,
  MAX_TOPIC_LENGTH,
  FALLBACK_SLUG,
} from "./logic.ts";

describe("slugify", () => {
  it("lowercases, strips diacritics, hyphenates", () => {
    assert.equal(slugify("Email Marketing!"), "email-marketing");
    assert.equal(slugify("Café Au Lait"), "cafe-au-lait");
  });
  it("falls back when nothing usable remains", () => {
    assert.equal(slugify("!!!"), FALLBACK_SLUG);
  });
  it("keeps non-Latin scripts", () => {
    assert.equal(slugify("نیوزلیٹر"), "نیوزلیٹر");
  });
});

describe("pickRoleIndices", () => {
  it("spreads N parts evenly across the 12-role bank", () => {
    assert.deepEqual(pickRoleIndices(2), [0, 11]);
    assert.deepEqual(pickRoleIndices(12).length, 12);
    assert.deepEqual(pickRoleIndices(12), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it("always starts with the overview role and ends with the conclusion role", () => {
    for (const n of [2, 3, 4, 5, 8, 12]) {
      const idx = pickRoleIndices(n);
      assert.equal(idx[0], 0);
      assert.equal(idx[idx.length - 1], 11);
      assert.equal(PART_ROLES[idx[0]].role, "Overview");
      assert.equal(PART_ROLES[idx[idx.length - 1]].role, "Conclusion");
    }
  });
});

describe("buildLinkNote", () => {
  it("gives prev/next guidance for a middle part", () => {
    const note = buildLinkNote(2, 5);
    assert.ok(note.includes("Part 1"));
    assert.ok(note.includes("Part 3"));
  });
  it("marks part 1 as the series hub", () => {
    assert.ok(buildLinkNote(1, 5).includes("hub"));
  });
  it("has no forward link on the last part", () => {
    assert.ok(!buildLinkNote(5, 5).includes("Part 6"));
  });
});

describe("runTool — happy path", () => {
  it("builds a series title and N parts with all expected fields", () => {
    const res = runTool({ seriesTopic: "email marketing", partCount: 4 });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal(v["seriesTitle"], "email marketing: A 4-Part Series");
    const parts = v["parts"] as { columns: string[]; rows: string[][] };
    assert.equal(parts.rows.length, 4);
    assert.ok(parts.columns.includes("Suggested title"));
    assert.equal(parts.rows[0][1], "Overview");
    assert.equal(parts.rows[3][1], "Conclusion");
    // Titles fill in the topic verbatim.
    assert.ok(parts.rows[0][2].includes("email marketing"));
  });

  it("generates unique slugs per part", () => {
    const res = runTool({ seriesTopic: "SEO basics", partCount: 3 });
    const v = res.values as Record<string, unknown>;
    const parts = v["parts"] as { rows: string[][] };
    const slugs = parts.rows.map((r) => r[3]);
    assert.deepEqual(slugs, ["seo-basics-part-1", "seo-basics-part-2", "seo-basics-part-3"]);
  });

  it("accepts partCount as a numeric string (form input)", () => {
    const res = runTool({ seriesTopic: "gardening", partCount: "5" });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    const parts = v["parts"] as { rows: string[][] };
    assert.equal(parts.rows.length, 5);
  });

  it("handles the 12-part edge case: every role used exactly once", () => {
    const res = runTool({ seriesTopic: "python", partCount: 12 });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    const parts = v["parts"] as { rows: string[][] };
    assert.equal(parts.rows.length, 12);
    const roles = parts.rows.map((r) => r[1]);
    assert.deepEqual(roles, PART_ROLES.map((p) => p.role));
  });

  it("reports target words and estimated read minutes per part", () => {
    const res = runTool({ seriesTopic: "yoga", partCount: 2 });
    const v = res.values as Record<string, unknown>;
    const parts = v["parts"] as { rows: string[][] };
    for (const row of parts.rows) {
      assert.ok(Number(row[4]) > 0);
      assert.ok(Number(row[5]) >= 1);
    }
  });
});

describe("runTool — validation", () => {
  it("rejects a missing topic", () => {
    assert.deepEqual(runTool({ partCount: 4 }), {
      ok: false,
      error: "Please enter the series topic.",
    });
  });
  it("rejects a topic shorter than 2 chars", () => {
    assert.equal(runTool({ seriesTopic: "x", partCount: 4 }).ok, false);
  });
  it("rejects a topic longer than 120 chars", () => {
    const res = runTool({ seriesTopic: "a".repeat(MAX_TOPIC_LENGTH + 1), partCount: 4 });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("120"));
  });
  it("rejects a missing part count", () => {
    assert.equal(runTool({ seriesTopic: "email" }).ok, false);
  });
  it("rejects partCount below 2 and above 12", () => {
    assert.equal(runTool({ seriesTopic: "email", partCount: MIN_PARTS - 1 }).ok, false);
    assert.equal(runTool({ seriesTopic: "email", partCount: MAX_PARTS + 1 }).ok, false);
    assert.ok(runTool({ seriesTopic: "email", partCount: 99 }).error!.includes("12"));
  });
  it("rejects a non-integer part count", () => {
    assert.equal(runTool({ seriesTopic: "email", partCount: 3.5 }).ok, false);
  });
  it("rejects non-object input", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — determinism & output shape", () => {
  it("is deterministic: same inputs -> identical outputs", () => {
    const a = runTool({ seriesTopic: "freelancing", partCount: 6 });
    const b = runTool({ seriesTopic: "freelancing", partCount: 6 });
    assert.deepEqual(a, b);
  });
  it("returns only the declared output ids (seriesTitle, parts)", () => {
    const res = runTool({ seriesTopic: "freelancing", partCount: 6 });
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["parts", "seriesTitle"]);
  });
  it("column count matches row cell count in the table output", () => {
    const res = runTool({ seriesTopic: "freelancing", partCount: 6 });
    const v = res.values as Record<string, unknown>;
    const parts = v["parts"] as { columns: string[]; rows: string[][] };
    for (const row of parts.rows) {
      assert.equal(row.length, parts.columns.length);
    }
  });
});
