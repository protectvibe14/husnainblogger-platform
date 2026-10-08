import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TONES,
  SUBJECTS,
  BODIES,
  SLOT_PHASES,
  SLOT_DAY_OFFSETS,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  product: "Glow Habit Tracker",
  launchDate: "2026-11-15",
  audience: "busy parents",
  tone: "warm",
};

function rowsOf(r: { ok: boolean; values?: Record<string, unknown> }): string[][] {
  const seq = r.values?.sequence as { columns: string[]; rows: string[][] };
  return seq.rows;
}

describe("launch-email-sequence-generator (tool-413)", () => {
  it("happy path: returns 7 emails with phase, offset, send date, subject, body", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const rows = rowsOf(r);
    assert.equal(rows.length, 7);
    const seq = r.values?.sequence as { columns: string[] };
    assert.deepEqual(seq.columns, ["Phase", "Day offset", "Send date", "Subject", "Body draft"]);
    for (const row of rows) {
      assert.equal(row.length, 5);
      assert.ok(row[3].length > 0, "subject non-empty");
      assert.ok(row[4].length > 0, "body non-empty");
    }
  });

  it("phases and day offsets follow the fixed launch arc", () => {
    const r = runTool(baseValues);
    const rows = rowsOf(r);
    assert.deepEqual(
      rows.map((row) => row[0]),
      SLOT_PHASES,
    );
    assert.deepEqual(
      rows.map((row) => row[1]),
      ["T-7", "T-3", "T-1", "Launch day", "T+2", "T+5", "T+7"],
    );
    assert.deepEqual(SLOT_DAY_OFFSETS, [-7, -3, -1, 0, 2, 5, 7]);
  });

  it("send dates are computed from the launch date with UTC arithmetic", () => {
    const r = runTool(baseValues);
    const dates = rowsOf(r).map((row) => row[2]);
    assert.deepEqual(dates, [
      "2026-11-08",
      "2026-11-12",
      "2026-11-14",
      "2026-11-15",
      "2026-11-17",
      "2026-11-20",
      "2026-11-22",
    ]);
  });

  it("send dates handle month boundaries correctly", () => {
    const r = runTool({ ...baseValues, launchDate: "2026-03-01" });
    const dates = rowsOf(r).map((row) => row[2]);
    assert.equal(dates[2], "2026-02-28"); // T-1 across month boundary
    assert.equal(dates[3], "2026-03-01");
  });

  it("product, audience, and launch date are interpolated into copy", () => {
    const r = runTool(baseValues);
    const all = rowsOf(r).map((row) => row[3] + " " + row[4]).join(" ");
    assert.ok(all.includes("Glow Habit Tracker"));
    assert.ok(all.includes("busy parents"));
    assert.ok(all.includes("2026-11-15"));
  });

  it("rejects missing product", () => {
    const r = runTool({ ...baseValues, product: "  " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /product/i);
  });

  it("rejects missing audience", () => {
    const r = runTool({ ...baseValues, audience: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /audience/i);
  });

  it("rejects a missing launch date", () => {
    const r = runTool({ ...baseValues, launchDate: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /launch date/i);
  });

  it("rejects a malformed launch date", () => {
    const r = runTool({ ...baseValues, launchDate: "15/11/2026" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /YYYY-MM-DD/);
  });

  it("rejects an impossible calendar date", () => {
    const r = runTool({ ...baseValues, launchDate: "2026-02-30" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /real calendar date/i);
  });

  it("rejects an invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "dramatic" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("defaults tone to friendly when omitted", () => {
    const r = runTool({
      product: "Widget",
      launchDate: "2026-12-01",
      audience: "developers",
    });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, 7);
  });

  it("truncates overlong input with a visible notice", () => {
    const long = "y".repeat(MAX_INPUT_CHARS + 20);
    const r = runTool({ ...baseValues, product: long });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.notices ?? ""), /shortened/);
  });

  it("escapes HTML in user input", () => {
    const r = runTool({ ...baseValues, product: "<script>alert(1)</script>" });
    assert.equal(r.ok, true);
    const all = rowsOf(r).map((row) => row[3] + " " + row[4]).join(" ");
    assert.ok(!all.includes("<script>"));
    assert.ok(all.includes("&lt;script&gt;"));
  });

  it("is deterministic: same inputs produce identical outputs", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    const metaIds = new Set(outputs.map((o) => o.id));
    for (const id of Object.keys(r.values ?? {})) {
      assert.ok(metaIds.has(id), `output id "${id}" missing from meta.ts`);
    }
    assert.ok(metaIds.has("sequence"));
  });

  it("word banks are the documented sizes with no empty entries", () => {
    assert.equal(SUBJECTS.length, 7);
    assert.equal(BODIES.length, 7);
    assert.equal(SLOT_PHASES.length, 7);
    for (let i = 0; i < 7; i++) {
      assert.equal(SUBJECTS[i].length, 5, `subject slot ${i}`);
      assert.equal(BODIES[i].length, 4, `body slot ${i}`);
      for (const s of SUBJECTS[i]) assert.ok(s.trim().length > 0);
      for (const b of BODIES[i]) assert.ok(b.trim().length > 0);
    }
    assert.equal(TONES.length, 4);
  });

  it("accepts a leap-day launch date", () => {
    const r = runTool({ ...baseValues, launchDate: "2028-02-29" });
    assert.equal(r.ok, true);
    const dates = rowsOf(r).map((row) => row[2]);
    assert.equal(dates[3], "2028-02-29");
    assert.equal(dates[2], "2028-02-28");
  });
});
