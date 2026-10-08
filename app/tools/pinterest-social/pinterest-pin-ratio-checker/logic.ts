/**
 * Pinterest Pin Ratio Checker — pure logic (tool-361). Zero imports,
 * zero network, zero DOM.
 *
 * WHAT THIS IS: trivial deterministic math. It reduces the given pixel
 * dimensions via GCD, compares the aspect ratio against a stated
 * best-practice threshold table, and reports a feed-safety verdict.
 *
 * HONESTY: the 2:3 "ideal pin" ratio is a widely documented creator
 * best practice — it is NOT claimed to be an official Pinterest
 * endorsement, and the tool never claims to check real pins on
 * Pinterest (it only does arithmetic on the numbers you type).
 *
 * Threshold table (aspect = width / height):
 *   idea-9:16      |aspect - 9/16|  <= TOL  -> feed-safe
 *   standard-2:3   |aspect - 2/3|   <= TOL  -> feed-safe
 *   square-1:1     |aspect - 1|     <= TOL  -> low-visibility
 *                   (valid but shown smaller in feeds — edge case from spec)
 *   long-1:2.1     aspect in [1/2.1 - TOL, 2/3 - TOL) -> cropped-in-feed
 *   off-spec       everything else (wider than square, between bands, or
 *                  taller than 1:2.1, e.g. 1:10 -> "crops heavily").
 * TOL = 0.04.
 *
 * Inputs: widthPx (number, required, >0), heightPx (number, required, >0).
 * Non-integer dims are rounded before the ratio is computed (per spec).
 * Deterministic: same inputs -> same outputs.
 */

export type ClosestFormat =
  | "standard-2:3"
  | "square-1:1"
  | "idea-9:16"
  | "long-1:2.1"
  | "off-spec";

export type FeedVerdict = "feed-safe" | "cropped-in-feed" | "low-visibility";

/** Tolerance around the 2:3 / 1:1 / 9:16 targets when matching a format. */
export const RATIO_TOLERANCE = 0.04;

/** Stated best-practice ideal pin size (documented creator guidance, not a platform endorsement). */
export const IDEAL_PIN_WIDTH = 1000;
export const IDEAL_PIN_HEIGHT = 1500;

export interface RatioResultValues {
  ok: boolean;
  values?: {
    ratio: string;
    closestFormat: ClosestFormat;
    verdict: FeedVerdict;
    recommendation: string;
  };
  error?: string;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

/** Reduce (w, h) to a "W:H" string using GCD. Inputs must be integers. */
export function reduceRatio(w: number, h: number): string {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

/** Classify an aspect ratio into one of the five formats. */
export function classifyFormat(aspect: number): ClosestFormat {
  const tol = RATIO_TOLERANCE;
  if (Math.abs(aspect - 9 / 16) <= tol) return "idea-9:16";
  if (Math.abs(aspect - 2 / 3) <= tol) return "standard-2:3";
  if (Math.abs(aspect - 1) <= tol) return "square-1:1";
  if (aspect >= 1 / 2.1 - tol && aspect < 2 / 3 - tol) return "long-1:2.1";
  return "off-spec";
}

function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

export function runTool(values: Record<string, unknown>): RatioResultValues {
  const widthRaw = values["widthPx"];
  const heightRaw = values["heightPx"];

  if (typeof widthRaw !== "number" || Number.isNaN(widthRaw)) {
    return { ok: false, error: "Please enter the pin width in pixels (a number)." };
  }
  if (typeof heightRaw !== "number" || Number.isNaN(heightRaw)) {
    return { ok: false, error: "Please enter the pin height in pixels (a number)." };
  }
  if (!isPositiveNumber(widthRaw)) {
    return { ok: false, error: "Width must be a positive number of pixels." };
  }
  if (!isPositiveNumber(heightRaw)) {
    return { ok: false, error: "Height must be a positive number of pixels." };
  }

  const w = Math.round(widthRaw);
  const h = Math.round(heightRaw);
  if (w <= 0 || h <= 0) {
    return { ok: false, error: "Width and height must round to at least 1 pixel." };
  }

  const ratio = reduceRatio(w, h);
  const aspect = w / h;
  const closestFormat = classifyFormat(aspect);

  let verdict: FeedVerdict;
  let recommendation: string;
  switch (closestFormat) {
    case "standard-2:3":
    case "idea-9:16":
      verdict = "feed-safe";
      recommendation =
        `Your pin is ${w} × ${h} px (${ratio}), close to the ${closestFormat} best-practice ratio. ` +
        `This size displays fully in the Pinterest feed. Best-practice guidance — not a Pinterest endorsement.`;
      break;
    case "square-1:1":
      verdict = "low-visibility";
      recommendation =
        `Your pin is ${w} × ${h} px (${ratio}) — a square image is valid but takes less space in the ` +
        `Pinterest feed, so it tends to get less attention than a tall 2:3 pin. For maximum feed presence, ` +
        `use ${IDEAL_PIN_WIDTH} × ${IDEAL_PIN_HEIGHT} px (2:3).`;
      break;
    case "long-1:2.1":
      verdict = "cropped-in-feed";
      recommendation =
        `Your pin is ${w} × ${h} px (${ratio}) — taller than the 2:3 best-practice ratio. ` +
        `Long pins get cropped in the feed preview, hiding your bottom content. Resize to ` +
        `${IDEAL_PIN_WIDTH} × ${IDEAL_PIN_HEIGHT} px (2:3) so nothing is cut off.`;
      break;
    default:
      verdict = "cropped-in-feed";
      recommendation =
        `Your pin is ${w} × ${h} px (${ratio}) — off-spec and will crop heavily in the feed. ` +
        `Resize to ${IDEAL_PIN_WIDTH} × ${IDEAL_PIN_HEIGHT} px (2:3), the widely recommended pin ratio.`;
  }

  return {
    ok: true,
    values: { ratio, closestFormat, verdict, recommendation },
  };
}
