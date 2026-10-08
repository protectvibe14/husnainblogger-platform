/**
 * Thumbnail Text Readability Checker — pure logic.
 *
 * ENGINE: color-contrast calculator (WCAG contrast ratio) +
 * word-count/character heuristics.
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. All math is exact and deterministic.
 * - HONESTY NOTE: this tool CANNOT inspect an actual thumbnail image file's
 *   pixels — there is no upload or canvas sampling in this version. It does
 *   exact WCAG math on the two colors YOU enter, plus word-count and length
 *   heuristics on the text. Gradients, photos, text outlines, and drop
 *   shadows are NOT modeled — the verdicts assume flat text on a flat
 *   background, and the copy says so.
 * - WCAG bands: >= 7:1 = AAA excellent; >= 4.5:1 = AA pass (normal text);
 *   >= 3:1 = AA pass for large text only; < 3:1 = fail. Relative luminance
 *   follows the WCAG 2.x sRGB formula.
 * - The mobile-legibility verdict is a labeled HEURISTIC (contrast + word
 *   count + character length vs size-class thresholds), not a device test.
 * - Character/word counts use graphemes (Intl.Segmenter) so emoji count as
 *   one visible character.
 */

/** WCAG band thresholds. */
export const WCAG_AAA = 7;
export const WCAG_AA = 4.5;
export const WCAG_AA_LARGE = 3;

/** Recommended maximum words for thumbnail text. */
export const RECOMMENDED_MAX_WORDS = 5;
/** Ideal word count for thumbnail text. */
export const IDEAL_MAX_WORDS = 3;

/** Text size classes the UI offers; each sets a mobile length threshold. */
export type TextSize = "small" | "medium" | "large";
export const TEXT_SIZES: readonly TextSize[] = ["small", "medium", "large"];
/** Max graphemes before the mobile heuristic flags length, per size class. */
export const MOBILE_CHAR_THRESHOLDS: Record<TextSize, number> = {
  small: 20,
  medium: 30,
  large: 45,
};

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

function graphemes(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...seg.segment(text)].map((s) => s.segment);
}

/**
 * Parse a hex color: "#fff", "fff", "#ffffff", "ffffff" (case-insensitive).
 * Returns null for anything else.
 */
export function parseHexColor(raw: unknown): Rgb | null {
  if (typeof raw !== "string") return null;
  const hex = raw.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
  if (hex.length === 3) {
    const [r, g, b] = hex.split("");
    return {
      r: parseInt(r + r, 16),
      g: parseInt(g + g, 16),
      b: parseInt(b + b, 16),
    };
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return null;
}

/** WCAG 2.x relative luminance of an sRGB color. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors, rounded to 2 decimals. */
export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export function wordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/** Verdict for the WCAG contrast ratio, labeled by band. */
export function wcagVerdict(ratio: number): string {
  if (ratio >= WCAG_AAA) {
    return `Excellent — ${ratio}:1 (WCAG AAA). Text will be crisp on almost any screen.`;
  }
  if (ratio >= WCAG_AA) {
    return `Pass — ${ratio}:1 (WCAG AA). Good contrast for normal-size text.`;
  }
  if (ratio >= WCAG_AA_LARGE) {
    return `Borderline — ${ratio}:1 (WCAG AA for large text only). Fine for big bold thumbnail text, weak for smaller text.`;
  }
  return `Fail — ${ratio}:1 is below 3:1. Low contrast; most viewers will struggle to read this. Pick colors further apart.`;
}

/** Verdict for thumbnail word count (3 ideal, 5 max). */
export function wordVerdict(words: number): string {
  if (words <= IDEAL_MAX_WORDS) {
    return `Excellent — ${words} ${words === 1 ? "word" : "words"}. Three or fewer words is ideal for thumbnails.`;
  }
  if (words <= RECOMMENDED_MAX_WORDS) {
    return `Good — ${words} words. Four to five words is the recommended maximum for thumbnails.`;
  }
  return `Too wordy — ${words} words. Trim to 3–5 words; long text shrinks to unreadable on mobile.`;
}

export interface ReadabilityCheck {
  ratio: number;
  words: number;
  chars: number;
  wcagVerdict: string;
  wordVerdict: string;
  mobileVerdict: string;
}

/**
 * Full check. The mobile verdict is a HEURISTIC (labeled in the copy): it
 * flags contrast below 4.5:1, more than 5 words, or length beyond the
 * size-class threshold. It is not a device test.
 */
export function checkReadability(
  text: string,
  fg: Rgb,
  bg: Rgb,
  size: TextSize = "medium",
): ReadabilityCheck {
  if (typeof text !== "string") throw new TypeError("checkReadability expects a string text");
  const ratio = contrastRatio(fg, bg);
  const words = wordCount(text);
  const chars = graphemes(text.trim()).length;
  const issues: string[] = [];
  if (ratio < WCAG_AA) issues.push(`contrast ${ratio}:1 is below 4.5:1`);
  if (words > RECOMMENDED_MAX_WORDS) issues.push(`${words} words is over the 5-word max`);
  if (chars > MOBILE_CHAR_THRESHOLDS[size]) {
    issues.push(`${chars} characters is long for ${size} text on a phone screen`);
  }
  const mobileVerdict =
    issues.length === 0
      ? "Likely readable on mobile (heuristic — based on contrast, word count and length, not a device test)."
      : `May be hard to read on mobile (heuristic): ${issues.join("; ")}.`;
  return {
    ratio,
    words,
    chars,
    wcagVerdict: wcagVerdict(ratio),
    wordVerdict: wordVerdict(words),
    mobileVerdict,
  };
}

/**
 * UI adapter (checker template dispatch): validates the form values and
 * returns the contrast ratio plus the three verdicts.
 * Output keys match meta.ts outputs: contrastRatio, wcagVerdict, wordVerdict, mobileVerdict.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawText = values.text;
  if (typeof rawText !== "string" || rawText.trim() === "") {
    return { ok: false, error: "Enter your thumbnail text — the text field is empty." };
  }
  const fg = parseHexColor(values.textColor);
  if (fg === null) {
    return { ok: false, error: "Text color must be a valid hex color like #FFFFFF or #FFF." };
  }
  const bg = parseHexColor(values.backgroundColor);
  if (bg === null) {
    return { ok: false, error: "Background color must be a valid hex color like #000000 or #000." };
  }
  const rawSize = values.textSize;
  const size: TextSize =
    typeof rawSize === "string" && (TEXT_SIZES as readonly string[]).includes(rawSize)
      ? (rawSize as TextSize)
      : "medium";

  const check = checkReadability(rawText, fg, bg, size);
  return {
    ok: true,
    values: {
      contrastRatio: check.ratio,
      wcagVerdict: check.wcagVerdict,
      wordVerdict: check.wordVerdict,
      mobileVerdict: `${check.mobileVerdict} Note: this is exact math on the flat colors you entered — gradients, photos, outlines, and shadows are not modeled, and image pixels are not analyzed.`,
    },
  };
}
