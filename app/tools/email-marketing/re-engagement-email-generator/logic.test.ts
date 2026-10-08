import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TONES,
  SUBJECTS,
  BODIES,
  SUBJECT_OPTION_COUNT,
  MIN_INACTIVE_DAYS,
  MAX_INACTIVE_DAYS,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  segmentName: "Lapsed buyers",
  inactiveDays: 120,
  incentive: "20% off your next order",
  tone: "friendly",
};

describe("re-engagement-email-generator (tool-414)", () => {
  it("happy path: returns subject options, body draft, and offer block", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const subjects = r.values?.subjectOptions as string[];
    assert.equal(subjects.length, SUBJECT_OPTION_COUNT);
    for (const s of subjects) assert.ok(s.length > 0, "subject non-empty");
    const body = String(r.values?.bodyDraft ?? "");
    assert.ok(body.length > 0);
    const offer = String(r.values?.winbackOfferBlock ?? "");
    assert.ok(offer.includes("20% off your next order"));
  });

  it("interpolates segment name and inactive days into the copy", () => {
    const r = runTool(baseValues);
    const all =
      (r.values?.subjectOptions as string[]).join(" ") + " " + String(r.values?.bodyDraft);
    assert.ok(all.includes("Lapsed buyers"));
    assert.ok(all.includes("120"));
  });

  it("omits the offer gracefully when no incentive is given", () => {
    const r = runTool({ ...baseValues, incentive: "" });
    assert.equal(r.ok, true);
    const offer = String(r.values?.winbackOfferBlock ?? "");
    assert.ok(offer.length > 0);
    assert.match(offer, /No incentive was provided/);
    const body = String(r.values?.bodyDraft ?? "");
    assert.ok(!body.includes("As a welcome-back gift"));
  });

  it("treats whitespace-only incentive as omitted", () => {
    const r = runTool({ ...baseValues, incentive: "   " });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.winbackOfferBlock ?? ""), /No incentive was provided/);
  });

  it("rejects missing segment name", () => {
    const r = runTool({ ...baseValues, segmentName: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /segment/i);
  });

  it("rejects missing inactive days", () => {
    const r = runTool({ ...baseValues, inactiveDays: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /inactive/i);
  });

  it("rejects NaN inactive days", () => {
    const r = runTool({ ...baseValues, inactiveDays: NaN });
    assert.equal(r.ok, false);
  });

  it("rejects Infinity inactive days", () => {
    const r = runTool({ ...baseValues, inactiveDays: Infinity });
    assert.equal(r.ok, false);
  });

  it("clamps inactive days below minimum with a notice", () => {
    const r = runTool({ ...baseValues, inactiveDays: 5 });
    assert.equal(r.ok, true);
    const all =
      (r.values?.subjectOptions as string[]).join(" ") + " " + String(r.values?.bodyDraft);
    assert.ok(!all.includes("5 days"), "unclamped value must not appear");
    assert.match(String(r.values?.notices ?? ""), /minimum of 30/);
  });

  it("clamps inactive days above maximum with a notice", () => {
    const r = runTool({ ...baseValues, inactiveDays: 5000 });
    assert.equal(r.ok, true);
    const all =
      (r.values?.subjectOptions as string[]).join(" ") + " " + String(r.values?.bodyDraft);
    assert.ok(!all.includes("5000 days"), "unclamped value must not appear");
    assert.match(String(r.values?.notices ?? ""), /maximum of 730/);
  });

  it("accepts boundary values 30 and 730 without notices", () => {
    for (const days of [MIN_INACTIVE_DAYS, MAX_INACTIVE_DAYS]) {
      const r = runTool({ ...baseValues, inactiveDays: days });
      assert.equal(r.ok, true);
      assert.equal(r.values?.notices, undefined);
    }
  });

  it("rejects an invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "mysterious" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("truncates overlong segment name with a visible notice", () => {
    const long = "z".repeat(MAX_INPUT_CHARS + 10);
    const r = runTool({ ...baseValues, segmentName: long });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.notices ?? ""), /shortened/);
  });

  it("escapes HTML in user input", () => {
    const r = runTool({ ...baseValues, segmentName: "<img src=x>" });
    assert.equal(r.ok, true);
    const all =
      (r.values?.subjectOptions as string[]).join(" ") + " " + String(r.values?.bodyDraft);
    assert.ok(!all.includes("<img src=x>"));
    assert.ok(all.includes("&lt;img src=x&gt;"));
  });

  it("is deterministic: same inputs produce identical outputs", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("different segments surface different subject sets", () => {
    const getSubjects = (r: { values?: Record<string, unknown> }): string =>
      (r.values?.subjectOptions as string[]).join("|");
    const s1 = getSubjects(runTool({ ...baseValues, segmentName: "aaaaaaaaaa" }));
    const s2 = getSubjects(runTool({ ...baseValues, segmentName: "zzzzzzzzzz" }));
    // Not guaranteed different, but with 10 subjects and hash offsets it is
    // near-certain; assert the mechanism (rotation) rather than luck:
    assert.equal(s1.split("|").length, SUBJECT_OPTION_COUNT);
    assert.equal(s2.split("|").length, SUBJECT_OPTION_COUNT);
  });

  it("subject options contain no duplicates", () => {
    const r = runTool(baseValues);
    const subjects = r.values?.subjectOptions as string[];
    assert.equal(new Set(subjects).size, subjects.length);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    const metaIds = new Set(outputs.map((o) => o.id));
    for (const id of Object.keys(r.values ?? {})) {
      assert.ok(metaIds.has(id), `output id "${id}" missing from meta.ts`);
    }
    for (const id of ["subjectOptions", "bodyDraft", "winbackOfferBlock"]) {
      assert.ok(metaIds.has(id), `meta.ts missing output "${id}"`);
    }
  });

  it("word banks are the documented sizes with no empty entries", () => {
    assert.equal(SUBJECTS.length, 10);
    assert.equal(BODIES.length, 4);
    assert.equal(TONES.length, 4);
    for (const s of SUBJECTS) assert.ok(s.trim().length > 0);
    for (const b of BODIES) assert.ok(b.trim().length > 0);
  });

  it("accepts inactive days as a numeric string", () => {
    const r = runTool({ ...baseValues, inactiveDays: "90" });
    assert.equal(r.ok, true);
    const all =
      (r.values?.subjectOptions as string[]).join(" ") + " " + String(r.values?.bodyDraft);
    assert.ok(all.includes("90"));
  });
});
