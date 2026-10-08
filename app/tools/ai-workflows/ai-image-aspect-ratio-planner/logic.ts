/**
 * AI Image Aspect Ratio Planner (tool-348) — pure logic, zero imports.
 *
 * REAL MATH + STATIC REFERENCE TABLE, NO AI: simplifies width×height to its
 * lowest-terms ratio using GCD arithmetic, then ranks a fixed table of
 * 14 platform presets by decimal-ratio distance. Crop guidance is computed
 * from the same numbers (how many pixels to trim from each side).
 *
 * Preset table (14 entries, documented for honest UI copy):
 *   - 5 Midjourney --ar ratios (1:1, 3:2, 2:3, 16:9, 9:16)
 *   - 9 platform references: YouTube thumbnail, YouTube Shorts,
 *     TikTok video, Instagram square, Instagram portrait, Instagram Reel,
 *     X post, Pinterest pin, Facebook link image.
 * Preset ratios are REFERENCE values — platforms change specs; the copy
 * must say "reference" and tell users to verify against the live spec.
 *
 * Rules:
 *   - Path A: width + height (positive integers). Path B: a preset id.
 *     Explicitly typed width + height take precedence over a pre-selected
 *     preset; if neither path is given the tool errors
 *     (spec: "width, height OR platform preset").
 *   - Decimal form is rounded to 2 decimals (spec edge case).
 *   - Nearest presets: the 3 table entries with the smallest absolute
 *     decimal difference, ties broken by preset order.
 *   - Deterministic: same inputs -> same outputs, always.
 */

export interface Preset {
  /** Lowercase kebab id, used as the select option value. */
  id: string;
  /** Human label, e.g. "YouTube thumbnail". */
  label: string;
  /** Reference pixel size the preset is based on (for context only). */
  referencePx: string;
  ratioW: number;
  ratioH: number;
  /** Midjourney flag suggestion, or "n/a" when not applicable. */
  midjourney: string;
  /** One line of practical guidance. */
  note: string;
}

export const PRESETS: Preset[] = [
  { id: "midjourney-square", label: "Midjourney square", referencePx: "1024 x 1024", ratioW: 1, ratioH: 1, midjourney: "--ar 1:1", note: "Default square output; safe for avatars, icons, and square feeds." },
  { id: "midjourney-landscape", label: "Midjourney landscape", referencePx: "1456 x 816", ratioW: 3, ratioH: 2, midjourney: "--ar 3:2", note: "Classic photo landscape; good for blog headers and wide banners." },
  { id: "midjourney-portrait", label: "Midjourney portrait", referencePx: "816 x 1456", ratioW: 2, ratioH: 3, midjourney: "--ar 2:3", note: "Classic photo portrait; good for book covers and posters." },
  { id: "midjourney-widescreen", label: "Midjourney widescreen", referencePx: "1456 x 816", ratioW: 16, ratioH: 9, midjourney: "--ar 16:9", note: "Cinematic widescreen; matches video frames and thumbnails." },
  { id: "midjourney-vertical", label: "Midjourney vertical", referencePx: "816 x 1456", ratioW: 9, ratioH: 16, midjourney: "--ar 9:16", note: "Phone-vertical output; matches Shorts, Reels, and TikTok." },
  { id: "youtube-thumbnail", label: "YouTube thumbnail", referencePx: "1280 x 720", ratioW: 16, ratioH: 9, midjourney: "--ar 16:9", note: "YouTube shows thumbnails at 16:9 — keep text away from the bottom-right corner where the duration badge sits." },
  { id: "youtube-shorts", label: "YouTube Shorts", referencePx: "1080 x 1920", ratioW: 9, ratioH: 16, midjourney: "--ar 9:16", note: "Full-phone vertical; keep key elements in the middle band so titles and buttons do not cover them." },
  { id: "tiktok-video", label: "TikTok video", referencePx: "1080 x 1920", ratioW: 9, ratioH: 16, midjourney: "--ar 9:16", note: "Full-phone vertical; the right-side icon rail and bottom caption overlay the edges." },
  { id: "instagram-square", label: "Instagram square post", referencePx: "1080 x 1080", ratioW: 1, ratioH: 1, midjourney: "--ar 1:1", note: "Square feed post; a balanced, forgiving crop for most subjects." },
  { id: "instagram-portrait", label: "Instagram portrait post", referencePx: "1080 x 1350", ratioW: 4, ratioH: 5, midjourney: "--ar 4:5", note: "Portrait feed post; fills more of the screen than square, so it tends to hold attention longer." },
  { id: "instagram-reel", label: "Instagram Reel", referencePx: "1080 x 1920", ratioW: 9, ratioH: 16, midjourney: "--ar 9:16", note: "Full-phone vertical; Reels also render in a 9:16 cover slot, so compose for vertical first." },
  { id: "x-post", label: "X post image", referencePx: "1200 x 675", ratioW: 16, ratioH: 9, midjourney: "--ar 16:9", note: "X displays in-stream images at 16:9; the timeline crops top and bottom on small cards." },
  { id: "pinterest-pin", label: "Pinterest pin", referencePx: "1000 x 1500", ratioW: 2, ratioH: 3, midjourney: "--ar 2:3", note: "Tall pins take more feed space; Pinterest trims anything taller than 2:3." },
  { id: "facebook-link", label: "Facebook link image", referencePx: "1200 x 630", ratioW: 40, ratioH: 21, midjourney: "n/a", note: "Link previews render near 1.91:1; keep text and logos inside the center safe area." },
];

export const NEAREST_COUNT = 3;
export const MAX_DIMENSION = 100000;

export interface SimplifiedRatio {
  width: number;
  height: number;
  ratioW: number;
  ratioH: number;
  /** width / height, rounded to 2 decimals. */
  decimal: number;
}

export interface ToolValues {
  /** e.g. "16:9 (decimal 1.78)". */
  simplifiedRatio: string;
  /** 3 lines: label, ratio, decimal, and difference. */
  nearestPresets: string[];
  /** Multi-line crop guidance. */
  cropGuidance: string;
}

export interface RunResult {
  ok: boolean;
  values?: ToolValues;
  error?: string;
}

/** Greatest common divisor (Euclid). */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0 ? 1 : x;
}

/** Round to 2 decimals (banker's float noise is cut off). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Simplify width x height with GCD; returns lowest-terms ratio + decimal. */
export function simplifyRatio(width: number, height: number): SimplifiedRatio {
  const g = gcd(width, height);
  const ratioW = Math.trunc(width / g);
  const ratioH = Math.trunc(height / g);
  return { width, height, ratioW, ratioH, decimal: round2(width / height) };
}

/** Find a preset by id (case-insensitive). */
export function findPreset(id: unknown): Preset | null {
  if (typeof id !== "string") return null;
  const v = id.trim().toLowerCase();
  if (v === "") return null;
  return PRESETS.find((p) => p.id === v) ?? null;
}

export interface NearestPreset {
  preset: Preset;
  /** |input decimal - preset decimal|, rounded to 2 decimals. */
  diff: number;
  /** True when the difference is exactly zero. */
  exact: boolean;
}

/** Rank presets by decimal-ratio distance; return the NEAREST_COUNT closest. */
export function nearestPresets(s: SimplifiedRatio): NearestPreset[] {
  return PRESETS.map((preset) => {
    const diff = round2(Math.abs(s.decimal - round2(preset.ratioW / preset.ratioH)));
    return { preset, diff, exact: diff === 0 };
  })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, NEAREST_COUNT);
}

/** Human line for one nearest-preset entry. */
export function formatNearest(n: NearestPreset): string {
  const p = n.preset;
  const ratio = `${p.ratioW}:${p.ratioH}`;
  const dec = round2(p.ratioW / p.ratioH);
  const flag = p.midjourney === "n/a" ? "" : ` · Midjourney ${p.midjourney}`;
  const mark = n.exact ? " — EXACT MATCH" : ` — diff ${n.diff.toFixed(2)}`;
  return `${p.label} — ${ratio} (decimal ${dec.toFixed(2)})${flag}${mark}`;
}

/**
 * Crop guidance for reaching the best preset from the input size.
 * Computes pixel trims from the actual numbers; edges get generic
 * keep-subject-centered advice (labeled as advice, not a spec).
 * `sizeNote` describes the input (raw pixels or a chosen preset).
 */
export function buildCropGuidance(s: SimplifiedRatio, best: NearestPreset, sizeNote: string): string {
  const p = best.preset;
  const lines: string[] = [];
  lines.push(sizeNote);
  lines.push(`Closest preset: ${p.label} at ${p.ratioW}:${p.ratioH} (reference ${p.referencePx}).`);

  if (best.exact) {
    lines.push(
      `No cropping needed — your ratio already matches ${p.label} exactly.`,
    );
  } else {
    const target = p.ratioW / p.ratioH;
    const actual = s.width / s.height;
    if (actual > target) {
      // Input is wider than the preset: trim width.
      const targetW = Math.round(s.height * target);
      const trim = s.width - targetW;
      const perSide = (trim / 2).toFixed(trim % 2 === 0 ? 0 : 1);
      lines.push(
        `To reach ${p.ratioW}:${p.ratioH}, trim ${trim} px total from the width (${s.width} -> ${targetW} px): about ${perSide} px from each side.`,
      );
    } else {
      // Input is taller than the preset: trim height.
      const targetH = Math.round(s.width / target);
      const trim = s.height - targetH;
      const perSide = (trim / 2).toFixed(trim % 2 === 0 ? 0 : 1);
      lines.push(
        `To reach ${p.ratioW}:${p.ratioH}, trim ${trim} px total from the height (${s.height} -> ${targetH} px): about ${perSide} px from top and bottom.`,
      );
    }
  }

  lines.push(`Preset note: ${p.note}`);
  lines.push(
    "General advice (not a platform spec): crops take pixels from the edges, so keep the main subject and any text away from the borders with a comfortable margin.",
  );
  return lines.join("\n");
}

/** Validate width/height as positive integers. */
function validateDimension(value: unknown, name: string): { ok: boolean; n?: number; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: false, error: `${name} is required (or choose a platform preset instead).` };
  }
  const n = typeof value === "string" ? Number(value.trim()) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, error: `${name} must be a whole number of pixels.` };
  }
  if (n < 1) return { ok: false, error: `${name} must be a positive number of pixels.` };
  if (n > MAX_DIMENSION) return { ok: false, error: `${name} is unrealistically large (max ${MAX_DIMENSION} px).` };
  return { ok: true, n };
}

export function runTool(values: Record<string, unknown>): RunResult {
  // Custom dimensions take precedence when both are provided; otherwise
  // fall back to the selected preset. (A pre-selected preset must not
  // silently override explicitly typed dimensions.)
  const vw = validateDimension(values?.width, "Width");
  const vh = validateDimension(values?.height, "Height");
  const hasCustom = vw.ok && vh.ok && vw.n !== undefined && vh.n !== undefined;

  let w: number;
  let h: number;
  let sizeNote: string;

  if (hasCustom) {
    w = vw.n as number;
    h = vh.n as number;
    sizeNote = "";
  } else {
    const preset = findPreset(values?.preset);
    if (preset !== null) {
      w = Math.round(preset.ratioW);
      h = Math.round(preset.ratioH);
      sizeNote = `Selected preset: ${preset.label} at ${preset.ratioW}:${preset.ratioH} (reference ${preset.referencePx} px).`;
    } else if (typeof values?.preset === "string" && values.preset.trim() !== "") {
      return {
        ok: false,
        error: `Unknown platform preset "${String(values.preset).trim()}". Choose one of: ${PRESETS.map((p) => p.id).join(", ")}.`,
      };
    } else {
      if (!vw.ok || vw.n === undefined) return { ok: false, error: vw.error };
      if (!vh.ok || vh.n === undefined) return { ok: false, error: vh.error };
      w = vw.n;
      h = vh.n;
      sizeNote = "";
    }
  }

  const simplified = simplifyRatio(w, h);
  if (sizeNote === "") {
    sizeNote = `Your size: ${simplified.width} x ${simplified.height} px = ${simplified.ratioW}:${simplified.ratioH} (decimal ${simplified.decimal.toFixed(2)}).`;
  }
  const nearest = nearestPresets(simplified);
  const lines = nearest.map(formatNearest);
  const guidance = buildCropGuidance(simplified, nearest[0], sizeNote);

  return {
    ok: true,
    values: {
      simplifiedRatio: `${simplified.ratioW}:${simplified.ratioH} (decimal ${simplified.decimal.toFixed(2)})`,
      nearestPresets: lines,
      cropGuidance: guidance,
    },
  };
}
