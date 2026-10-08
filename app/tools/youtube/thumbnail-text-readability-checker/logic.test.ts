import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WCAG_AAA,
  WCAG_AA,
  WCAG_AA_LARGE,
  parseHexColor,
  relativeLuminance,
  contrastRatio,
  wordCount,
  wcagVerdict,
  wordVerdict,
  checkReadability,
  runTool,
} from "./logic.ts";

describe("parseHexColor", () => {
  it("parses 6-digit hex with and without #", () => {
    assert.deepEqual(parseHexColor("#FFFFFF"), { r: 255, g: 255, b: 255 });
    assert.deepEqual(parseHexColor("000000"), { r: 0, g: 0, b: 0 });
  });
  it("parses 3-digit shorthand", () => {
    assert.deepEqual(parseHexColor("#fff"), { r: 255, g: 255, b: 255 });
    assert.deepEqual(parseHexColor("f00"), { r: 255, g: 0, b: 0 });
  });
  it("is case-insensitive", () => {
    assert.deepEqual(parseHexColor("#AbCdEf"), parseHexColor("#abcdef"));
  });
  it("returns null for invalid input", () => {
    assert.equal(parseHexColor("red"), null);
    assert.equal(parseHexColor("#ff"), null);
    assert.equal(parseHexColor("#fffff"), null);
    assert.equal(parseHexColor("#gggggg"), null);
    assert.equal(parseHexColor(""), null);
    assert.equal(parseHexColor(123), null);
  });
});

describe("relativeLuminance / contrastRatio", () => {
  it("black is 0 and white is 1", () => {
    assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
    assert.equal(relativeLuminance({ r: 255, g: 255, b: 255 }), 1);
  });
  it("black on white is 21:1", () => {
    assert.equal(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21);
  });
  it("ratio is symmetric regardless of argument order", () => {
    const a = { r: 200, g: 30, b: 30 };
    const b = { r: 20, g: 20, b: 120 };
    assert.equal(contrastRatio(a, b), contrastRatio(b, a));
  });
  it("identical colors give 1:1", () => {
    assert.equal(contrastRatio({ r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }), 1);
  });
  it("known value: #767676 on white ≈ 4.54", () => {
    const ratio = contrastRatio(parseHexColor("#767676")!, parseHexColor("#ffffff")!);
    assert.ok(Math.abs(ratio - 4.54) < 0.05, String(ratio));
  });
  it("rounds to 2 decimals", () => {
    const ratio = contrastRatio(parseHexColor("#123456")!, parseHexColor("#abcdef")!);
    assert.equal(ratio, Math.round(ratio * 100) / 100);
  });
});

describe("wordCount", () => {
  it("counts words separated by whitespace", () => {
    assert.equal(wordCount("best camera ever"), 3);
    assert.equal(wordCount("  spaced   out  "), 2);
  });
  it("counts emoji as a word", () => {
    assert.equal(wordCount("🔥 new video"), 3);
  });
});

describe("wcagVerdict", () => {
  it("labels >= 7 as AAA", () => {
    assert.match(wcagVerdict(21), /WCAG AAA/);
    assert.match(wcagVerdict(WCAG_AAA), /AAA/);
  });
  it("labels 4.5–7 as AA pass", () => {
    assert.match(wcagVerdict(5.2), /WCAG AA\)/);
    assert.match(wcagVerdict(WCAG_AA), /Pass/);
  });
  it("labels 3–4.5 as large-text-only", () => {
    assert.match(wcagVerdict(3.5), /large text only/);
    assert.match(wcagVerdict(WCAG_AA_LARGE), /Borderline/);
  });
  it("labels below 3 as Fail", () => {
    assert.match(wcagVerdict(2.1), /Fail/);
  });
});

describe("wordVerdict", () => {
  it("praises 1–3 words", () => {
    assert.match(wordVerdict(2), /ideal/);
  });
  it("accepts 4–5 words", () => {
    assert.match(wordVerdict(5), /recommended maximum/);
  });
  it("flags 6+ words as too wordy", () => {
    assert.match(wordVerdict(9), /Too wordy/);
  });
});

describe("checkReadability", () => {
  it("black text on white passes everything", () => {
    const c = checkReadability("new video", parseHexColor("#000000")!, parseHexColor("#ffffff")!);
    assert.equal(c.ratio, 21);
    assert.match(c.wcagVerdict, /AAA/);
    assert.match(c.mobileVerdict, /Likely readable on mobile \(heuristic/);
  });
  it("low contrast flags the mobile heuristic", () => {
    const c = checkReadability("new video", parseHexColor("#999999")!, parseHexColor("#ffffff")!);
    assert.ok(c.ratio < 4.5);
    assert.match(c.mobileVerdict, /May be hard to read on mobile \(heuristic\)/);
    assert.match(c.mobileVerdict, /contrast/);
  });
  it("wordy text flags the mobile heuristic", () => {
    const c = checkReadability(
      "this is a very long thumbnail title with too many words",
      parseHexColor("#000000")!,
      parseHexColor("#ffffff")!,
      "small",
    );
    assert.match(c.mobileVerdict, /over the 5-word max/);
    assert.match(c.mobileVerdict, /long for small text/);
  });
  it("size classes change the character threshold", () => {
    const text = "a".repeat(25);
    const fg = parseHexColor("#000000")!;
    const bg = parseHexColor("#ffffff")!;
    assert.match(checkReadability(text, fg, bg, "small").mobileVerdict, /long for small text/);
    assert.match(checkReadability(text, fg, bg, "large").mobileVerdict, /Likely readable/);
  });
  it("throws on non-string text", () => {
    assert.throws(
      () => checkReadability(7 as unknown as string, parseHexColor("#000")!, parseHexColor("#fff")!),
      TypeError,
    );
  });
});

describe("runTool — checker template adapter", () => {
  it("returns ratio and three verdicts for valid input", () => {
    const r = runTool({ text: "new video", textColor: "#000000", backgroundColor: "#ffffff" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.contrastRatio, 21);
    assert.match(String(r.values!.wcagVerdict), /AAA/);
    assert.match(String(r.values!.wordVerdict), /ideal/);
    assert.match(String(r.values!.mobileVerdict), /Likely readable/);
  });
  it("accepts shorthand hex without #", () => {
    const r = runTool({ text: "hi", textColor: "fff", backgroundColor: "000" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.contrastRatio, 21);
  });
  it("rejects an empty text", () => {
    const r = runTool({ text: "  ", textColor: "#000", backgroundColor: "#fff" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /text field is empty/);
  });
  it("rejects an invalid text color", () => {
    const r = runTool({ text: "hi", textColor: "red", backgroundColor: "#fff" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Text color must be a valid hex/);
  });
  it("rejects an invalid background color", () => {
    const r = runTool({ text: "hi", textColor: "#000", backgroundColor: "#fffff" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Background color must be a valid hex/);
  });
  it("rejects missing colors", () => {
    assert.equal(runTool({ text: "hi", backgroundColor: "#fff" }).ok, false);
    assert.equal(runTool({ text: "hi", textColor: "#000" }).ok, false);
  });
  it("defaults to medium size on unknown textSize", () => {
    const r = runTool({ text: "hi", textColor: "#000", backgroundColor: "#fff", textSize: "huge" });
    assert.equal(r.ok, true);
  });
  it("mobile verdict carries the no-pixels disclaimer", () => {
    const r = runTool({ text: "hi", textColor: "#000", backgroundColor: "#fff" });
    assert.match(String(r.values!.mobileVerdict), /image pixels are not analyzed/);
  });
  it("is deterministic across runs", () => {
    const v = { text: "top 10", textColor: "#ff0000", backgroundColor: "#ffffff", textSize: "large" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output keys match the meta outputs contract", () => {
    const r = runTool({ text: "hi", textColor: "#000", backgroundColor: "#fff" });
    assert.deepEqual(
      Object.keys(r.values!).sort(),
      ["contrastRatio", "mobileVerdict", "wcagVerdict", "wordVerdict"],
    );
  });
});
