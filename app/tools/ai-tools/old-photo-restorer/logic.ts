/**
 * Old Photo Restorer — pure config + DSP math (tool-539), zero imports,
 * zero network.
 *
 * HONESTY CONTRACT: there is NO model here — getModelConfig() returns null.
 * Restoration = three classic, fully disclosed filters applied to canvas
 * pixels in client.ts:
 *   1. auto-contrast  — histogram stretch (1st/99th percentile per channel)
 *   2. fade correction — gray-world white balance
 *   3. dust reduction  — 3x3 median filter on a downscaled copy blended back
 * plus an optional 2x bilinear upscale. The pure math below (LUTs, gains,
 * median, upscale) operates on plain arrays so it is unit-testable in Node.
 */

/** Local re-declaration (zero-import rule); mirrors lib/ai/types.ts. */
export interface AiModelInfo {
  id: string;
  task: string;
  sizeMb: number;
  license: string;
  dtype?: string;
  notes?: string;
}

export function getModelConfig(): AiModelInfo | null {
  return null; // no model — classic filters only
}

export function getDisclosures(): string[] {
  return [
    "Basic enhancement filters only — this is not AI restoration.",
    "What it does: auto-contrast (histogram stretch), fade correction (gray-world white balance), dust/scratch softening (median filter), optional 2x upscale.",
    "Everything runs in your browser — your photo is never uploaded.",
    "Deep damage (tears, missing areas, severe blur) cannot be fixed by filters — that needs professional restoration tools.",
  ];
}

export const HEADLINE =
  "Clean up old scanned photos with classic enhancement filters — auto-contrast, fade correction and dust reduction, right in your browser.";

export const MAX_FILE_MB = 25;
export const MAX_DIM = 1200;

/** 256-entry lookup table mapping [min,max] linearly onto [0,255]. */
export function computeContrastLut(min: number, max: number): number[] {
  const lut: number[] = new Array(256);
  if (max <= min) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }
  for (let i = 0; i < 256; i++) {
    const v = Math.round(((i - min) / (max - min)) * 255);
    lut[i] = Math.min(255, Math.max(0, v));
  }
  return lut;
}

/**
 * Gray-world white balance gains: scale each channel so the channel means
 * equalize to the overall mean. Gains are clamped to [0.5, 2].
 */
export function grayWorldGains(
  avgR: number,
  avgG: number,
  avgB: number,
): [number, number, number] {
  const mean = (avgR + avgG + avgB) / 3;
  const clamp = (g: number): number => Math.min(2, Math.max(0.5, g));
  const safe = (avg: number): number => (avg > 1 ? mean / avg : 1);
  return [clamp(safe(avgR)), clamp(safe(avgG)), clamp(safe(avgB))];
}

/** 3x3 median filter on a 2D grayscale array (edges clamp). */
export function medianFilter3x3(src: number[][], w: number, h: number): number[][] {
  const out: number[][] = [];
  const win = new Array<number>(9);
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cy = Math.min(h - 1, Math.max(0, y + dy));
          const cx = Math.min(w - 1, Math.max(0, x + dx));
          win[n++] = src[cy][cx];
        }
      }
      win.sort((a, b) => a - b);
      row.push(win[4]);
    }
    out.push(row);
  }
  return out;
}

/** 2x bilinear upscale of a 2D grayscale array. */
export function upscale2xBilinear(src: number[][], w: number, h: number): number[][] {
  const W = w * 2;
  const H = h * 2;
  const out: number[][] = [];
  for (let y = 0; y < H; y++) {
    const row: number[] = [];
    const sy = y / 2;
    const y0 = Math.floor(sy);
    const y1 = Math.min(h - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < W; x++) {
      const sx = x / 2;
      const x0 = Math.floor(sx);
      const x1 = Math.min(w - 1, x0 + 1);
      const fx = sx - x0;
      const a = src[y0][x0];
      const b = src[y0][x1];
      const c = src[y1][x0];
      const d = src[y1][x1];
      row.push(Math.round(a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy));
    }
    out.push(row);
  }
  return out;
}

/**
 * Validate the upload descriptor the client passes in.
 * values.fileName: string, required. values.fileSizeMb: number, <= MAX_FILE_MB.
 */
export function validateInputs(values: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  const name = values["fileName"];
  if (typeof name !== "string" || name.trim().length === 0) {
    return { ok: false, error: "Please choose a photo first." };
  }
  const size = values["fileSizeMb"];
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return { ok: false, error: "Could not read the file size — please try another photo." };
  }
  if (size > MAX_FILE_MB) {
    return { ok: false, error: `Photo is too large — keep it under ${MAX_FILE_MB} MB.` };
  }
  return { ok: true };
}
