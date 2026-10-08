import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  checkSubjectLine,
  codePointLength,
  CLIENT_THRESHOLDS,
  MAX_ANALYZED_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = { subjectLine: "Your 20% discount ends tonight — don't miss out" };

describe("subject-line-character-checker (tool-406)", () => {
  it("happy path: counts + per-client table + fitsAllMobile", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    assert.equal(typeof r.values?.charCount, "number");
    assert.equal(typeof r.values?.wordCount, "number");
    assert.equal(typeof r.values?.fitsAllMobile, "string");
    const perClient = r.values?.perClient as { columns: string[]; rows: string[][] };
    assert.deepEqual(perClient.columns, [
      "Email client",
      "Visible chars (approx.)",
      "Truncated?",
      "Preview",
    ]);
    assert.equal(perClient.rows.length, 6);
  });

  it("charCount matches code-point length", () => {
    const s = baseValues.subjectLine;
    const r = runTool({ subjectLine: s });
    assert.equal(r.values?.charCount, [...s].length);
  });

  it("wordCount counts words", () => {
    const r = runTool({ subjectLine: "one two three four" });
    assert.equal(r.values?.wordCount, 4);
  });

  it("emoji counts as one character each (code points, not UTF-16 units)", () => {
    const s = "🔥 Sale ends today 🔥";
    assert.equal(codePointLength(s), [...s].length);
    assert.ok(s.length > codePointLength(s)); // UTF-16 units would be higher
    const r = runTool({ subjectLine: s });
    assert.equal(r.values?.charCount, codePointLength(s));
  });

  it("CJK characters count as one character each", () => {
    const s = "新年快乐 Sale 🎉";
    const r = runTool({ subjectLine: s });
    assert.equal(r.values?.charCount, 11);
  });

  it("short subject fits all mobile clients", () => {
    const r = runTool({ subjectLine: "20% off ends tonight" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.fitsAllMobile as string).startsWith("Yes"));
    const perClient = r.values?.perClient as { rows: string[][] };
    for (const row of perClient.rows) assert.equal(row[2], "No");
  });

  it("long subject is flagged truncated on mobile clients, not desktop Gmail", () => {
    const r = runTool({ subjectLine: "a".repeat(60) });
    assert.equal(r.ok, true);
    assert.ok((r.values?.fitsAllMobile as string).startsWith("No"));
    const perClient = r.values?.perClient as { rows: string[][] };
    const gmailAndroid = perClient.rows[0];
    assert.equal(gmailAndroid[0], "Gmail app (Android)");
    assert.equal(gmailAndroid[2], "Yes — truncated");
    const gmailDesktop = perClient.rows[5];
    assert.equal(gmailDesktop[0], "Gmail (desktop)");
    assert.equal(gmailDesktop[2], "No");
  });

  it("truncated previews end with an ellipsis marker", () => {
    const r = runTool({ subjectLine: "x".repeat(60) });
    const perClient = r.values?.perClient as { rows: string[][] };
    assert.ok(perClient.rows[0][3].endsWith("…"));
  });

  it("exactly at mobile threshold is not truncated", () => {
    const r = runTool({ subjectLine: "y".repeat(40) });
    assert.ok((r.values?.fitsAllMobile as string).startsWith("Yes"));
    const perClient = r.values?.perClient as { rows: string[][] };
    assert.equal(perClient.rows[0][2], "No");
  });

  it("one char over mobile threshold fails fitsAllMobile", () => {
    const r = runTool({ subjectLine: "z".repeat(41) });
    assert.ok((r.values?.fitsAllMobile as string).startsWith("No"));
  });

  it("rejects empty string input", () => {
    const r = runTool({ subjectLine: "" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("rejects whitespace-only input", () => {
    const r = runTool({ subjectLine: "   \t\n " });
    assert.equal(r.ok, false);
  });

  it("rejects missing subjectLine", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("rejects non-string subjectLine", () => {
    const r = runTool({ subjectLine: 123 });
    assert.equal(r.ok, false);
  });

  it("checkSubjectLine throws TypeError on non-string", () => {
    assert.throws(() => checkSubjectLine(42 as unknown as string), TypeError);
  });

  it("checkSubjectLine throws RangeError on whitespace-only", () => {
    assert.throws(() => checkSubjectLine("   "), RangeError);
  });

  it("overlong input: preview is trimmed with a visible notice", () => {
    const r = runTool({ subjectLine: "a".repeat(MAX_ANALYZED_CHARS + 50) });
    assert.equal(r.ok, true);
    assert.equal(r.values?.charCount, MAX_ANALYZED_CHARS + 50); // counts are full
    const perClient = r.values?.perClient as { rows: string[][] };
    assert.ok(perClient.rows[5][3].includes("input trimmed to 500 chars"));
  });

  it("client thresholds are as documented (6 clients)", () => {
    assert.equal(CLIENT_THRESHOLDS.length, 6);
    const mobile = CLIENT_THRESHOLDS.filter((c) => c.mobile);
    assert.equal(mobile.length, 2);
    for (const c of CLIENT_THRESHOLDS) assert.ok(c.visibleChars > 0);
  });

  it("deterministic: same input twice gives identical output", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values ?? {}).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("single word subject: wordCount 1", () => {
    const r = runTool({ subjectLine: "Hello" });
    assert.equal(r.values?.wordCount, 1);
  });
});
