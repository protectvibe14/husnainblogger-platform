/**
 * contrast.ts — WCAG 2.1/2.2 relative-luminance contrast math.
 * Owner: MA1-DesignSystem.
 *
 * Canonical implementation used by unit tests (MA4) and any in-app contrast
 * needs. The build-time token gate `scripts/check-token-contrast.mjs`
 * mirrors this math for plain-Node execution (no TS transform at that layer).
 */

export type RGB = [number, number, number];

/** Parse #rgb / #rrggbb (also accepts the leading '#'-less form). */
export function hexToRgb(hex: string): RGB {
  const h = hex.replace(/^#/, "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`contrast: invalid hex color "${hex}"`);
  }
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance of an sRGB color, 0–1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors, 1–21. */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export const MIN_TEXT_CONTRAST = 4.5; // WCAG 2.2 AA 1.4.3
export const MIN_UI_CONTRAST = 3.0; // WCAG 2.2 AA 1.4.11 + D8 focus ring

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
  passes: boolean;
}

/** Assert one token pair; returns the measured ratio (never throws). */
export function checkPair(
  foreground: string,
  background: string,
  minimum: number,
): ContrastCheck {
  const ratio = contrastRatio(foreground, background);
  return { foreground, background, ratio, minimum, passes: ratio >= minimum };
}
