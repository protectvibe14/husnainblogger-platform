/**
 * tool-385 — Tweet Quote Card Maker (builder)
 *
 * PURE LAYOUT MATH + VALIDATION. This tool validates each quote card item
 * and computes a deterministic render spec (dimensions, font size, theme
 * colors) that the page's client-side <canvas> code uses to draw the PNG.
 * NO pixels are rendered here — there is no image library, DOM, or network
 * in this module. The PNG itself is drawn in the user's browser at 2x for
 * sharpness and downloaded as a file.
 *
 * Fixed, documented rules:
 *   1. quoteText: required, non-empty, max 280 characters (a tweet's length).
 *      Longer quotes fail with "text too long — shorten it" (the tool never
 *      renders illegible tiny text).
 *   2. author: optional, max 80 chars. theme: light | dark | brand;
 *      anything else (including empty) defaults to "dark" with no error.
 *   3. Dimensions rule: quote ≤ 120 chars -> 1080×1080 (square);
 *      longer -> 1200×675 (16:9 landscape).
 *   4. Auto-fit font tiers (documented; min-size floor = 34px, then error
 *      instead of shrinking further — but rule 1 caps at 280 chars, so the
 *      floor only protects against pathological whitespace cases):
 *        ≤ 60 chars  -> 64px
 *        ≤120 chars  -> 52px
 *        ≤180 chars  -> 44px
 *        ≤240 chars  -> 38px
 *        ≤280 chars  -> 34px
 *   5. Theme colors (fixed):
 *        dark:  bg #0F1419, text #FFFFFF, accent #1D9BF0
 *        light: bg #FFFFFF, text #0F1419, accent #1D9BF0
 *        brand: bg #1D9BF0, text #FFFFFF, accent #0F1419
 *   6. Emoji note: emoji in quotes renders via the viewer's system font —
 *      the spec passes it through untouched.
 *
 * Validation: on any invalid item the whole build fails with
 * "Item N: ..." so the user can fix the exact row. Deterministic: same
 * items -> identical spec, always.
 */

export const MAX_QUOTE_CHARS = 280;
export const MAX_AUTHOR_CHARS = 80;
export const SQUARE_MAX_CHARS = 120;

export const SQUARE_SIZE = { width: 1080, height: 1080 };
export const LANDSCAPE_SIZE = { width: 1200, height: 675 };

export type Theme = 'light' | 'dark' | 'brand';

export const THEME_COLORS: Record<Theme, { bg: string; text: string; accent: string }> = {
  dark: { bg: '#0F1419', text: '#FFFFFF', accent: '#1D9BF0' },
  light: { bg: '#FFFFFF', text: '#0F1419', accent: '#1D9BF0' },
  brand: { bg: '#1D9BF0', text: '#FFFFFF', accent: '#0F1419' },
};

/** Font-size tiers by quote length (see rule 4 in the header comment). */
export const FONT_TIERS: { maxChars: number; fontSizePx: number }[] = [
  { maxChars: 60, fontSizePx: 64 },
  { maxChars: 120, fontSizePx: 52 },
  { maxChars: 180, fontSizePx: 44 },
  { maxChars: 240, fontSizePx: 38 },
  { maxChars: 280, fontSizePx: 34 },
];

export interface CardSpec {
  index: number;
  text: string;
  author: string;
  theme: Theme;
  width: number;
  height: number;
  fontSizePx: number;
  colors: { bg: string; text: string; accent: string };
  charCount: number;
}

export function fontSizeFor(length: number): number {
  for (const tier of FONT_TIERS) {
    if (length <= tier.maxChars) return tier.fontSizePx;
  }
  return 34; // floor — never render smaller
}

function normalizeTheme(raw: unknown): Theme {
  const t = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (t === 'light' || t === 'dark' || t === 'brand') return t;
  return 'dark'; // default for empty/unknown
}

function buildCardSpec(item: Record<string, unknown>, index: number): CardSpec {
  const n = index + 1;
  const text = typeof item['quoteText'] === 'string' ? item['quoteText'].trim() : '';
  if (text.length === 0) {
    throw new Error(`Item ${n}: quote text is required.`);
  }
  if (text.length > MAX_QUOTE_CHARS) {
    throw new Error(
      `Item ${n}: quote is ${text.length} characters — max is ${MAX_QUOTE_CHARS}. Shorten the text; the tool will not render illegible tiny type.`
    );
  }
  const author = typeof item['author'] === 'string' ? item['author'].trim() : '';
  if (author.length > MAX_AUTHOR_CHARS) {
    throw new Error(`Item ${n}: author is too long — keep it under ${MAX_AUTHOR_CHARS} characters.`);
  }
  const theme = normalizeTheme(item['theme']);
  const square = text.length <= SQUARE_MAX_CHARS;
  const { width, height } = square ? SQUARE_SIZE : LANDSCAPE_SIZE;
  return {
    index: n,
    text,
    author,
    theme,
    width,
    height,
    fontSizePx: fontSizeFor(text.length),
    colors: THEME_COLORS[theme],
    charCount: text.length,
  };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point (builder). args: { items: [{ quoteText, author?, theme? }] }.
 * Returns { cards: string[], specDownload: string } where specDownload is the
 * render-spec JSON the client-side canvas code consumes.
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  try {
    if (!args || !Array.isArray(args.items) || args.items.length === 0) {
      return { ok: false, error: 'Add at least one quote card item first.' };
    }
    if (args.items.length > 20) {
      return { ok: false, error: 'Max 20 quote cards per build — split into smaller batches.' };
    }
    const specs = args.items.map((item, i) => buildCardSpec(item, i));

    const cards = specs.map(
      (s) =>
        `Card ${s.index}: ${s.theme} theme · ${s.width}×${s.height} PNG · ${s.fontSizePx}px type · ` +
        `${s.charCount}/${MAX_QUOTE_CHARS} chars${s.author ? ` · — ${s.author}` : ''}`
    );

    const specDownload = JSON.stringify(
      {
        version: 1,
        renderedAt: 'client-side',
        note: 'Drawn by the in-browser canvas renderer at 2x for sharpness. Emoji renders via the viewer system font.',
        cards: specs.map((s) => ({
          text: s.text,
          author: s.author,
          theme: s.theme,
          width: s.width,
          height: s.height,
          fontSizePx: s.fontSizePx,
          colors: s.colors,
          charCount: s.charCount,
        })),
      },
      null,
      2
    );

    return { ok: true, values: { cards, specDownload } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid input.' };
  }
}
