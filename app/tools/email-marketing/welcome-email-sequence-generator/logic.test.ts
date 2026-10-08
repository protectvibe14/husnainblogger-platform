import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TONES,
  SUBJECTS,
  BODIES,
  GREETINGS,
  SIGNOFFS,
  SLOT_GOALS,
  SLOT_DAY_OFFSETS,
  MIN_EMAIL_COUNT,
  MAX_EMAIL_COUNT,
  DEFAULT_EMAIL_COUNT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  brand: "Bright Bloom Co",
  leadMagnet: "10-page spring lookbook",
  emailCount: 5,
  tone: "friendly",
};

function rowsOf(r: { ok: boolean; values?: Record<string, unknown> }): string[][] {
  const seq = r.values?.sequence as { columns: string[]; rows: string[][] };
  return seq.rows;
}

describe("welcome-email-sequence-generator (tool-411)", () => {
  it("happy path: returns the requested number of emails with all fields", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const rows = rowsOf(r);
    assert.equal(rows.length, 5);
    const seq = r.values?.sequence as { columns: string[] };
    assert.deepEqual(seq.columns, ["Day", "Goal", "Subject", "Body draft"]);
    for (const row of rows) {
      assert.equal(row.length, 4);
      assert.ok(row[2].length > 0, "subject non-empty");
      assert.ok(row[3].length > 0, "body non-empty");
    }
  });

  it("day offsets and goals follow the fixed welcome arc", () => {
    const r = runTool(baseValues);
    const rows = rowsOf(r);
    assert.deepEqual(
      rows.map((row) => row[0]),
      ["0", "1", "3", "5", "7"],
    );
    assert.deepEqual(
      rows.map((row) => row[1]),
      SLOT_GOALS.slice(0, 5),
    );
  });

  it("brand and lead magnet are interpolated into copy", () => {
    const r = runTool(baseValues);
    const rows = rowsOf(r);
    const all = rows.map((row) => row[2] + " " + row[3]).join(" ");
    assert.ok(all.includes("Bright Bloom Co"));
    assert.ok(all.includes("10-page spring lookbook"));
  });

  it("rejects missing brand", () => {
    const r = runTool({ ...baseValues, brand: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /brand/i);
  });

  it("rejects whitespace-only brand", () => {
    const r = runTool({ ...baseValues, brand: "   " });
    assert.equal(r.ok, false);
  });

  it("rejects missing lead magnet", () => {
    const r = runTool({ ...baseValues, leadMagnet: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /lead magnet/i);
  });

  it("rejects NaN email count", () => {
    const r = runTool({ ...baseValues, emailCount: NaN });
    assert.equal(r.ok, false);
  });

  it("rejects Infinity email count", () => {
    const r = runTool({ ...baseValues, emailCount: Infinity });
    assert.equal(r.ok, false);
  });

  it("rejects an invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "sarcastic" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("clamps email count below minimum to 3 with a notice", () => {
    const r = runTool({ ...baseValues, emailCount: 1 });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, MIN_EMAIL_COUNT);
    assert.match(String(r.values?.notices ?? ""), /minimum/);
  });

  it("clamps email count above maximum to 7 with a notice", () => {
    const r = runTool({ ...baseValues, emailCount: 99 });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, MAX_EMAIL_COUNT);
    assert.match(String(r.values?.notices ?? ""), /maximum/);
  });

  it("defaults email count to 5 and tone to friendly when omitted", () => {
    const r = runTool({ brand: "Acme", leadMagnet: "Free guide" });
    assert.equal(r.ok, true);
    assert.equal(rowsOf(r).length, DEFAULT_EMAIL_COUNT);
  });

  it("truncates overlong input with a visible notice instead of dropping it", () => {
    const long = "x".repeat(MAX_INPUT_CHARS + 50);
    const r = runTool({ ...baseValues, brand: long });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.notices ?? ""), /shortened/);
    const all = rowsOf(r).map((row) => row[2] + " " + row[3]).join(" ");
    assert.ok(!all.includes(long), "overlong text must not appear in full");
  });

  it("counts emoji as one character each for the length limit", () => {
    // 100 emoji = 100 code points but 200 UTF-16 units: must NOT be truncated.
    const emoji = "🌸".repeat(MAX_INPUT_CHARS);
    assert.equal(emoji.length, MAX_INPUT_CHARS * 2);
    const r = runTool({ ...baseValues, brand: emoji });
    assert.equal(r.ok, true);
    assert.ok(!String(r.values?.notices ?? "").includes("shortened"));
  });

  it("escapes HTML in user input interpolated into copy", () => {
    const r = runTool({ ...baseValues, brand: "<b>Bold</b> & Co" });
    assert.equal(r.ok, true);
    const all = rowsOf(r).map((row) => row[2] + " " + row[3]).join(" ");
    assert.ok(all.includes("&lt;b&gt;Bold&lt;/b&gt; &amp; Co"));
    assert.ok(!all.includes("<b>Bold</b>"));
  });

  it("is deterministic: same inputs produce identical outputs", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("varies the sequence with different inputs", () => {
    const r = runTool({ ...baseValues, brand: "Totally Different Brand Name Here" });
    assert.notDeepEqual(
      rowsOf(r).map((row) => row[2]),
      rowsOf(runTool(baseValues)).map((row) => row[2]),
    );
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
    assert.equal(SLOT_GOALS.length, 7);
    assert.equal(SLOT_DAY_OFFSETS.length, 7);
    for (let i = 0; i < 7; i++) {
      assert.equal(SUBJECTS[i].length, 6, `subject slot ${i}`);
      assert.equal(BODIES[i].length, 4, `body slot ${i}`);
      for (const s of SUBJECTS[i]) assert.ok(s.trim().length > 0);
      for (const b of BODIES[i]) assert.ok(b.trim().length > 0);
    }
    assert.equal(TONES.length, 4);
    for (const t of TONES) {
      assert.equal(GREETINGS[t].length, 3, `greetings for ${t}`);
      assert.equal(SIGNOFFS[t].length, 2, `signoffs for ${t}`);
    }
  });

  it("tone changes the greeting and sign-off", () => {
    const friendly = rowsOf(runTool({ ...baseValues, tone: "friendly" }))[0][3];
    const professional = rowsOf(runTool({ ...baseValues, tone: "professional" }))[0][3];
    assert.notEqual(friendly, professional);
  });

  it("supports all 7 email counts", () => {
    for (let n = MIN_EMAIL_COUNT; n <= MAX_EMAIL_COUNT; n++) {
      const r = runTool({ ...baseValues, emailCount: n });
      assert.equal(r.ok, true);
      assert.equal(rowsOf(r).length, n, `count ${n}`);
    }
  });
});
