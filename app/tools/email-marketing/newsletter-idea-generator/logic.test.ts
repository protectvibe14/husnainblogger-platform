import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TITLES,
  ANGLES,
  WHYS,
  FREQUENCIES,
  DEFAULT_COUNT,
  MIN_COUNT,
  MAX_COUNT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  niche: "houseplant care",
  audience: "beginner plant parents",
  frequency: "weekly",
  count: 10,
};

function rowsOf(r: { ok: boolean; values?: Record<string, unknown> }): string[][] {
  const ideas = r.values?.ideas as { columns: string[]; rows: string[][] };
  return ideas.rows;
}

describe("newsletter-idea-generator (tool-416)", () => {
  it("happy path: returns the requested number of ideas with title, angle, why", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const rows = rowsOf(r);
    assert.equal(rows.length, 10);
    const ideas = r.values?.ideas as { columns: string[] };
    assert.deepEqual(ideas.columns, ["#", "Title", "Angle", "Why it works"]);
    for (const row of rows) {
      assert.equal(row.length, 4);
      assert.ok(row[1].length > 0, "title non-empty");
      assert.ok(row[2].length > 0, "angle non-empty");
      assert.ok(row[3].length > 0, "why non-empty");
    }
  });

  it("interpolates the niche into titles and notes the audience", () => {
    const r = runTool(baseValues);
    const titles = rowsOf(r).map((row) => row[1]);
    for (const t of titles) assert.ok(t.includes("houseplant care"), `title: ${t}`);
    assert.ok(String(r.values?.notices ?? "").includes("beginner plant parents"));
  });

  it("titles are unique within a run", () => {
    const r = runTool({ ...baseValues, count: MAX_COUNT });
    const titles = rowsOf(r).map((row) => row[1]);
    assert.equal(titles.length, MAX_COUNT);
    assert.equal(new Set(titles).size, titles.length);
  });

  it("rejects missing niche", () => {
    const r = runTool({ ...baseValues, niche: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /niche/i);
  });

  it("rejects missing audience", () => {
    const r = runTool({ ...baseValues, audience: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /audience/i);
  });

  it("rejects NaN count", () => {
    const r = runTool({ ...baseValues, count: NaN });
    assert.equal(r.ok, false);
  });

  it("rejects Infinity count", () => {
    const r = runTool({ ...baseValues, count: Infinity });
    assert.equal(r.ok, false);
  });

  it("rejects an invalid frequency", () => {
    const r = runTool({ ...baseValues, frequency: "daily" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /frequency/i);
  });

  it("clamps count below minimum to 1 with a notice", () => {
    const r = runTool({ ...baseValues, count: 0 });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, MIN_COUNT);
    assert.match(String(r.values?.notices ?? ""), /minimum/);
  });

  it("clamps count above maximum to 20 with a notice", () => {
    const r = runTool({ ...baseValues, count: 100 });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, MAX_COUNT);
    assert.match(String(r.values?.notices ?? ""), /maximum/);
  });

  it("defaults count to 10 and frequency to weekly when omitted", () => {
    const r = runTool({ niche: "bread baking", audience: "home bakers" });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, DEFAULT_COUNT);
    assert.ok(String(r.values?.notices ?? "").includes("weekly"));
  });

  it("accepts all three frequencies", () => {
    for (const f of FREQUENCIES) {
      const r = runTool({ ...baseValues, frequency: f });
      assert.equal(r.ok, true, `frequency ${f}`);
      assert.ok(String(r.values?.notices ?? "").includes(f));
    }
  });

  it("truncates overlong input with a visible notice", () => {
    const long = "n".repeat(MAX_INPUT_CHARS + 5);
    const r = runTool({ ...baseValues, niche: long });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.notices ?? ""), /shortened/);
  });

  it("escapes HTML in user input", () => {
    const r = runTool({ ...baseValues, niche: "<em>plants</em>" });
    assert.equal(r.ok, true);
    const titles = rowsOf(r).map((row) => row[1]).join(" ");
    assert.ok(!titles.includes("<em>"));
    assert.ok(titles.includes("&lt;em&gt;plants&lt;/em&gt;"));
  });

  it("is deterministic: same inputs produce identical outputs", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("different niches produce different idea lists", () => {
    const a = rowsOf(runTool(baseValues)).map((row) => row[1]).join("|");
    const b = rowsOf(runTool({ ...baseValues, niche: "sourdough baking" }))
      .map((row) => row[1]).join("|");
    assert.notEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    const metaIds = new Set(outputs.map((o) => o.id));
    for (const id of Object.keys(r.values ?? {})) {
      assert.ok(metaIds.has(id), `output id "${id}" missing from meta.ts`);
    }
    assert.ok(metaIds.has("ideas"));
  });

  it("word banks are the documented sizes with no empty entries", () => {
    assert.equal(TITLES.length, 24);
    assert.equal(ANGLES.length, 12);
    assert.equal(WHYS.length, 12);
    assert.equal(FREQUENCIES.length, 3);
    for (const t of TITLES) assert.ok(t.includes("{niche}"), `title pattern: ${t}`);
    for (const a of ANGLES) assert.ok(a.trim().length > 0);
    for (const w of WHYS) assert.ok(w.trim().length > 0);
  });

  it("supports every count from 1 to 20", () => {
    for (const n of [1, 5, 19, 20]) {
      const r = runTool({ ...baseValues, count: n });
      assert.equal(r.ok, true);
      assert.equal(rowsOf(r).length, n, `count ${n}`);
    }
  });

  it("row numbers are sequential starting at 1", () => {
    const r = runTool({ ...baseValues, count: 5 });
    assert.deepEqual(
      rowsOf(r).map((row) => row[0]),
      ["1", "2", "3", "4", "5"],
    );
  });
});
