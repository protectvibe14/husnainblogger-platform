/**
 * Tests for the Caption Contrast Checker.
 * Run: node --test app/tools/video-editing/caption-contrast-checker/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseHex,
  relativeLuminance,
  contrastRatio,
  isLargeText,
  wcagVerdict,
  AA_NORMAL,
  AA_LARGE,
  AAA_NORMAL,
  AAA_LARGE,
} from "./logic.ts";

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

describe("caption-contrast-checker", () => {
  it("happy path: returns ok with all three output ids", () => {
    const r = runTool({ textColor: "#FFFFFF", bgColor: "#000000", fontSizePx: 24 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "contrastRatio",
      "suggestions",
      "wcagVerdict",
    ]);
  });

  it("white on black = 21:1 and AAA", () => {
    const r = runTool({ textColor: "#FFFFFF", bgColor: "#000000", fontSizePx: 16 }).values!;
    assert.equal(r.contrastRatio, 21);
    assert.equal(r.wcagVerdict, "AAA");
  });

  it("black on white = 21:1 (order independent)", () => {
    const r = runTool({ textColor: "#000000", bgColor: "#FFFFFF", fontSizePx: 16 }).values!;
    assert.equal(r.contrastRatio, 21);
  });

  it("same color = 1:1 and fail", () => {
    const r = runTool({ textColor: "#888888", bgColor: "#888888", fontSizePx: 16 }).values!;
    assert.equal(r.contrastRatio, 1);
    assert.equal(r.wcagVerdict, "fail");
  });

  it("AA verdict at the 4.5:1 boundary for normal text", () => {
    // #767676 on white is ~4.54:1 — a known AA-passing gray
    const r = runTool({ textColor: "#767676", bgColor: "#FFFFFF", fontSizePx: 16 }).values!;
    assert.ok((r.contrastRatio as number) >= AA_NORMAL);
    assert.equal(r.wcagVerdict, "AA");
  });

  it("large text (24px+) passes AA at 3:1", () => {
    // #949494 on white is ~3.6:1 — passes large-text AA, fails normal-text AA
    const large = runTool({ textColor: "#949494", bgColor: "#FFFFFF", fontSizePx: 24 }).values!;
    assert.ok((large.contrastRatio as number) >= AA_LARGE && (large.contrastRatio as number) < AA_NORMAL);
    assert.equal(large.wcagVerdict, "AA");
    const normal = runTool({ textColor: "#949494", bgColor: "#FFFFFF", fontSizePx: 16 }).values!;
    assert.equal(normal.wcagVerdict, "fail");
  });

  it("bold 19px counts as large text", () => {
    assert.equal(isLargeText(19, true), true);
    assert.equal(isLargeText(18, true), false);
    assert.equal(isLargeText(19, false), false);
    assert.equal(isLargeText(24, false), true);
  });

  it("AAA needs 7:1 for normal text", () => {
    assert.equal(wcagVerdict(7, false), "AAA");
    assert.equal(wcagVerdict(6.99, false), "AA");
    assert.equal(wcagVerdict(AAA_LARGE, true), "AAA");
    assert.equal(wcagVerdict(AAA_NORMAL - 0.01, false), "AA");
  });

  it("bg 'none' suggestion names both frame extremes", () => {
    const r = runTool({ textColor: "#FFDD00", bgColor: "none", fontSizePx: 28 }).values!;
    const s = r.suggestions as string[];
    assert.ok(s.some((x) => x.includes("pure black") && x.includes("pure white")));
    assert.ok(s.some((x) => x.includes("semi-opaque background box")));
  });

  it("bg 'none': white text worst-cases against white frames", () => {
    const r = runTool({ textColor: "#FFFFFF", bgColor: "NONE", fontSizePx: 30 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.contrastRatio, 1); // white vs white = worst case
    assert.equal(r.values!.wcagVerdict, "fail");
    const s = r.values!.suggestions as string[];
    assert.ok(s.some((x) => x.includes("WORST case")));
    assert.ok(s.some((x) => x.includes("Advisory")));
  });

  it("bg 'none': mid-gray text reports the worse of black/white", () => {
    const r = runTool({ textColor: "#808080", bgColor: "none", fontSizePx: 30 }).values!;
    const vsBlack = contrastRatio({ r: 128, g: 128, b: 128 }, BLACK);
    const vsWhite = contrastRatio({ r: 128, g: 128, b: 128 }, WHITE);
    const expected = Math.round(Math.min(vsBlack, vsWhite) * 100) / 100;
    assert.equal(r.contrastRatio, expected);
  });

  it("stroke present: reports text-vs-stroke and stroke-vs-bg separately", () => {
    const r = runTool({
      textColor: "#FFFFFF",
      bgColor: "#000000",
      strokeColor: "#000000",
      fontSizePx: 24,
    }).values!;
    const s = r.suggestions as string[];
    const line = s.find((x) => x.startsWith("Stroke check:"));
    assert.ok(line);
    assert.ok(line!.includes("text vs stroke = 21:1"));
    assert.ok(line!.includes("stroke vs background = 1:1"));
  });

  it("invalid textColor hex is rejected", () => {
    const r = runTool({ textColor: "notacolor", bgColor: "#000000", fontSizePx: 16 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /hex/);
  });

  it("invalid bgColor hex is rejected", () => {
    const r = runTool({ textColor: "#FFFFFF", bgColor: "#GGGGGG", fontSizePx: 16 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /hex/);
  });

  it("invalid strokeColor hex is rejected, empty stroke is fine", () => {
    assert.equal(
      runTool({ textColor: "#FFF", bgColor: "#000", strokeColor: "zzz", fontSizePx: 16 }).ok,
      false,
    );
    assert.equal(
      runTool({ textColor: "#FFF", bgColor: "#000", strokeColor: "", fontSizePx: 16 }).ok,
      true,
    );
  });

  it("3-digit hex is accepted and equals 6-digit", () => {
    const a = runTool({ textColor: "#FFF", bgColor: "#000", fontSizePx: 16 }).values!;
    const b = runTool({ textColor: "#FFFFFF", bgColor: "#000000", fontSizePx: 16 }).values!;
    assert.equal(a.contrastRatio, b.contrastRatio);
  });

  it("hex without leading # is accepted", () => {
    const r = runTool({ textColor: "FFFFFF", bgColor: "000000", fontSizePx: 16 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.contrastRatio, 21);
  });

  it("fontSizePx must be > 0", () => {
    for (const v of [0, -5, "big", undefined]) {
      const r = runTool({ textColor: "#FFF", bgColor: "#000", fontSizePx: v });
      assert.equal(r.ok, false, `fontSizePx=${String(v)}`);
    }
  });

  it("fail verdict includes actionable suggestion with the AA bar", () => {
    const r = runTool({ textColor: "#999999", bgColor: "#FFFFFF", fontSizePx: 16 }).values!;
    assert.equal(r.wcagVerdict, "fail");
    const s = r.suggestions as string[];
    assert.ok(s.some((x) => x.includes(`${AA_NORMAL}:1`)));
  });

  it("suggestions are honest: never claim video measurement", () => {
    const r = runTool({ textColor: "#FFF", bgColor: "#000", fontSizePx: 16 }).values!;
    const s = r.suggestions as string[];
    assert.ok(s.length >= 2);
    assert.ok(s.some((x) => x.includes("not a measurement of your rendered video")));
  });

  it("parseHex handles edge forms", () => {
    assert.deepEqual(parseHex("#fff"), { r: 255, g: 255, b: 255 });
    assert.deepEqual(parseHex("000"), { r: 0, g: 0, b: 0 });
    assert.equal(parseHex("#ffff"), null);
    assert.equal(parseHex(""), null);
    assert.equal(parseHex("#gggggg"), null);
  });

  it("relativeLuminance: black=0, white=1", () => {
    assert.equal(relativeLuminance(BLACK), 0);
    assert.ok(Math.abs(relativeLuminance(WHITE) - 1) < 1e-9);
  });

  it("deterministic: two runs with identical inputs are identical", () => {
    const v = { textColor: "#FFDD00", bgColor: "none", strokeColor: "#111111", fontSizePx: 28, bold: true };
    assert.deepEqual(runTool(v), runTool({ ...v }));
  });
});
