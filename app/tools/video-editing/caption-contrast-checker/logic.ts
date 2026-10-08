/**
 * Caption Contrast Checker — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY: WCAG relative-luminance math on colors the user types. It checks
 * text/background COLOR PAIRS the user provides — it does NOT sample video
 * frames and cannot see the user's actual footage. The ratio shown is an
 * estimate, not a measurement of the rendered video.
 *
 * WCAG 2.x contrast rules (published here AND in content.methodology):
 * - Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05), where L is the
 *   relative luminance: L = 0.2126*R + 0.7152*G + 0.0722*B with each channel
 *   linearized from sRGB (c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4).
 * - "Large text" = fontSizePx >= 24, or bold text with fontSizePx >= 19
 *   (mirrors WCAG's 18pt / 14pt-bold large-text definition at 96dpi).
 * - AA threshold: 4.5:1 normal text, 3:1 large text.
 * - AAA threshold: 7:1 normal text, 4.5:1 large text.
 * - Verdict: "AAA" if ratio meets the AAA bar, "AA" if it meets the AA bar,
 *   otherwise "fail".
 *
 * Transparent-background edge case (bg "none"): a caption over video has no
 * single background, so NO ratio can be guaranteed. The tool computes the
 * ratio against pure black AND pure white video frames and reports the WORSE
 * of the two as a worst-case advisory estimate — the suggestions say plainly
 * that this is advisory, not a guarantee.
 *
 * Stroke edge case: when a stroke color is given, the tool also computes
 * text-vs-stroke and stroke-vs-bg ratios separately and reports them as
 * suggestions (the stroke sits between the text and the background).
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const LARGE_TEXT_PX = 24;
export const LARGE_TEXT_PX_BOLD = 19;
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;
export const AAA_NORMAL = 7;
export const AAA_LARGE = 4.5;

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = HEX_RE.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of an sRGB color. */
export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

/** WCAG contrast ratio between two sRGB colors, e.g. 4.6. */
export function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isLargeText(fontSizePx: number, bold: boolean): boolean {
  return fontSizePx >= LARGE_TEXT_PX || (bold && fontSizePx >= LARGE_TEXT_PX_BOLD);
}

export function wcagVerdict(ratio: number, largeText: boolean): "fail" | "AA" | "AAA" {
  const aaBar = largeText ? AA_LARGE : AA_NORMAL;
  const aaaBar = largeText ? AAA_LARGE : AAA_NORMAL;
  if (ratio >= aaaBar) return "AAA";
  if (ratio >= aaBar) return "AA";
  return "fail";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const textColorRaw = values["textColor"];
  const bgColorRaw = values["bgColor"];
  const strokeColorRaw = values["strokeColor"];
  const fontSizeRaw = values["fontSizePx"];
  const boldRaw = values["bold"];

  if (typeof textColorRaw !== "string" || textColorRaw.trim() === "") {
    return { ok: false, error: "Please enter a text color (hex, e.g. #FFFFFF)." };
  }
  if (typeof bgColorRaw !== "string" || bgColorRaw.trim() === "") {
    return { ok: false, error: "Please enter a background color (hex, e.g. #000000) or 'none' for a transparent background." };
  }

  const textRgb = parseHex(textColorRaw);
  if (!textRgb) {
    return { ok: false, error: "Text color is not a valid hex color. Use #RGB or #RRGGBB, e.g. #FFFFFF." };
  }

  const bgIsNone = bgColorRaw.trim().toLowerCase() === "none";
  let bgRgb: { r: number; g: number; b: number } | null = null;
  if (!bgIsNone) {
    bgRgb = parseHex(bgColorRaw);
    if (!bgRgb) {
      return { ok: false, error: "Background color is not a valid hex color. Use #RGB or #RRGGBB, or 'none' for transparent." };
    }
  }

  let strokeRgb: { r: number; g: number; b: number } | null = null;
  if (typeof strokeColorRaw === "string" && strokeColorRaw.trim() !== "") {
    strokeRgb = parseHex(strokeColorRaw);
    if (!strokeRgb) {
      return { ok: false, error: "Stroke color is not a valid hex color. Use #RGB or #RRGGBB, or leave it empty." };
    }
  }

  let fontSizePx: number | null = null;
  if (typeof fontSizeRaw === "number" && Number.isFinite(fontSizeRaw)) {
    fontSizePx = fontSizeRaw;
  } else if (typeof fontSizeRaw === "string" && fontSizeRaw.trim() !== "") {
    const n = Number(fontSizeRaw);
    if (Number.isFinite(n)) fontSizePx = n;
  }
  if (fontSizePx === null || fontSizePx <= 0) {
    return { ok: false, error: "Please enter a font size in pixels greater than 0." };
  }

  const bold = boldRaw === true || boldRaw === "true" || boldRaw === 1;
  const largeText = isLargeText(fontSizePx, bold);

  // Primary ratio: text vs background (or worst-case advisory when bg is "none").
  let ratio: number;
  let ratioNote: string;
  if (bgIsNone) {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    const vsBlack = contrastRatio(textRgb, black);
    const vsWhite = contrastRatio(textRgb, white);
    ratio = Math.min(vsBlack, vsWhite);
    ratioNote = `worst-case advisory estimate vs pure black (${round2(vsBlack)}:1) and pure white (${round2(vsWhite)}:1) video frames`;
  } else {
    ratio = contrastRatio(textRgb, bgRgb!);
    ratioNote = "WCAG 2.x relative-luminance ratio of the two colors you entered";
  }
  const rounded = round2(ratio);
  const verdict = wcagVerdict(rounded, largeText);

  const aaBar = largeText ? AA_LARGE : AA_NORMAL;
  const aaaBar = largeText ? AAA_LARGE : AAA_NORMAL;
  const sizeLabel = largeText ? "large" : "normal";

  const suggestions: string[] = [];
  if (bgIsNone) {
    suggestions.push(
      "Advisory: a transparent background sits over moving video, so no fixed ratio can be guaranteed. The ratio above is the WORST case against pure black and pure white frames — real footage falls somewhere between.",
    );
    suggestions.push(
      "To make transparent captions readable on any footage, add a dark stroke, a drop shadow, or a semi-opaque background box — then re-check with that box color as the background.",
    );
  }
  if (strokeRgb) {
    const textVsStroke = round2(contrastRatio(textRgb, strokeRgb));
    const strokeVsBg = bgIsNone
      ? null
      : round2(contrastRatio(strokeRgb, bgRgb!));
    suggestions.push(
      `Stroke check: text vs stroke = ${textVsStroke}:1` +
        (strokeVsBg === null
          ? " (stroke vs background not computed — background is transparent)."
          : `, stroke vs background = ${strokeVsBg}:1. A stroke works best when it contrasts with BOTH the text and the background.`),
    );
    if (textVsStroke < 3) {
      suggestions.push(
        "Your stroke barely differs from the text — pick a stroke color on the opposite side of the text (dark text -> dark stroke).",
      );
    }
  }
  if (verdict === "fail") {
    suggestions.push(
      `Fails WCAG AA for ${sizeLabel} text (needs ${aaBar}:1, you have ${rounded}:1). Lighten the text, darken the background, or increase the font size${bold ? "" : " / use bold"} — then re-check.`,
    );
  } else if (verdict === "AA") {
    suggestions.push(
      `Passes WCAG AA for ${sizeLabel} text (${aaBar}:1). For the stricter AAA bar (${aaaBar}:1), push the colors further apart.`,
    );
  } else {
    suggestions.push(
      `Passes WCAG AAA for ${sizeLabel} text (${aaaBar}:1) — this color pair is comfortably readable.`,
    );
  }
  suggestions.push(
    `Remember: this is ${ratioNote}, not a measurement of your rendered video. Always preview captions on real footage.`,
  );

  return {
    ok: true,
    values: {
      contrastRatio: rounded,
      wcagVerdict: verdict,
      suggestions,
    },
  };
}
