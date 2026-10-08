import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateAbTestIdeas,
  TEST_IDEAS,
  TEST_FOCI,
  EMAIL_TYPES,
  RULE_OF_THUMB_PER_VARIANT,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = { emailType: "newsletter", testFocus: "subject" };

describe("email-a-b-test-idea-generator (tool-408)", () => {
  it("happy path: 3 ideas + sample-size note", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const table = r.values?.testIdeas as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, [
      "Test name",
      "Variable",
      "Variant A",
      "Variant B",
      "Hypothesis",
    ]);
    assert.equal(table.rows.length, 3);
    for (const row of table.rows) {
      assert.equal(row.length, 5);
      for (const cell of row) assert.ok(cell.length > 0);
    }
    assert.ok((r.values?.sampleSizeNote as string).length > 0);
  });

  it("idea bank sizes are as documented (6 foci x 3 = 18)", () => {
    assert.equal(TEST_FOCI.length, 6);
    assert.equal(Object.keys(TEST_IDEAS).length, 6);
    for (const f of TEST_FOCI) assert.equal(TEST_IDEAS[f].length, 3);
    assert.equal(EMAIL_TYPES.length, 5);
  });

  it("hypotheses mention the selected email type", () => {
    const r = runTool({ emailType: "abandoned-cart", testFocus: "cta" });
    const table = r.values?.testIdeas as { rows: string[][] };
    for (const row of table.rows) assert.ok(row[4].includes("abandoned cart"));
  });

  it("every focus returns distinct ideas", () => {
    const names = new Set<string>();
    for (const f of TEST_FOCI) {
      const t = runTool({ emailType: "welcome", testFocus: f }).values?.testIdeas as {
        rows: string[][];
      };
      for (const row of t.rows) names.add(`${f}:${row[0]}`);
    }
    assert.equal(names.size, 18);
  });

  it("sampleSizeNote is labeled as a rule of thumb, not a power calculation", () => {
    const r = runTool(baseValues);
    const note = r.values?.sampleSizeNote as string;
    assert.ok(note.toLowerCase().includes("rule of thumb"));
    assert.ok(note.toLowerCase().includes("not a statistical power calculation"));
  });

  it("listSize below the floor gets a noisy-results warning", () => {
    const r = runTool({ ...baseValues, listSize: 500 });
    assert.equal(r.ok, true);
    const note = r.values?.sampleSizeNote as string;
    assert.ok(note.includes("250 recipients per variant"));
    assert.ok(note.includes("below the 1,000-per-variant rule of thumb"));
  });

  it("listSize above the floor gets a meets-the-floor note", () => {
    const r = runTool({ ...baseValues, listSize: 5000 });
    const note = r.values?.sampleSizeNote as string;
    assert.ok(note.includes("2,500 recipients per variant"));
    assert.ok(note.includes("meets the rule-of-thumb floor"));
  });

  it("listSize=0 is accepted and warned", () => {
    const r = runTool({ ...baseValues, listSize: 0 });
    assert.equal(r.ok, true);
    assert.ok((r.values?.sampleSizeNote as string).includes("below"));
  });

  it("no unfilled {emailType} placeholders in hypotheses", () => {
    for (const f of TEST_FOCI) {
      const r = runTool({ emailType: "promotional", testFocus: f });
      const t = r.values?.testIdeas as { rows: string[][] };
      for (const row of t.rows) assert.ok(!row[4].includes("{emailType}"));
    }
  });

  it("rejects missing emailType", () => {
    const r = runTool({ testFocus: "subject" });
    assert.equal(r.ok, false);
  });

  it("rejects invalid emailType", () => {
    const r = runTool({ ...baseValues, emailType: "spam" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("email type"));
  });

  it("rejects missing testFocus", () => {
    const r = runTool({ emailType: "newsletter" });
    assert.equal(r.ok, false);
  });

  it("rejects invalid testFocus", () => {
    const r = runTool({ ...baseValues, testFocus: "font" });
    assert.equal(r.ok, false);
  });

  it("rejects negative listSize", () => {
    const r = runTool({ ...baseValues, listSize: -10 });
    assert.equal(r.ok, false);
  });

  it("rejects NaN listSize", () => {
    const r = runTool({ ...baseValues, listSize: NaN });
    assert.equal(r.ok, false);
  });

  it("rejects Infinity listSize", () => {
    const r = runTool({ ...baseValues, listSize: Infinity });
    assert.equal(r.ok, false);
  });

  it("generateAbTestIdeas throws on bad focus", () => {
    assert.throws(() => generateAbTestIdeas("welcome", "font", null), RangeError);
  });

  it("rule-of-thumb constants are the documented values", () => {
    assert.equal(RULE_OF_THUMB_PER_VARIANT, 1000);
  });

  it("deterministic: same input twice gives identical output", () => {
    const withSize = { ...baseValues, listSize: 3200 };
    assert.deepEqual(runTool(withSize), runTool(withSize));
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), outputs.map((o) => o.id).sort());
  });
});
