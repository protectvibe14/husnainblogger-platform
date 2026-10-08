/**
 * Aspect Ratio Crop Visualizer (tool-273) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: the same inputs always yield the
 * same crop rectangle.
 *
 * Honesty: the "visualizer" outputs computed crop rectangles and coordinates
 * (numbers the app shell renders as an SVG/canvas overlay). It does NOT
 * render or output an image.
 *
 * === PUBLISHED GEOMETRY (F-ASPECT-01) ===
 *  targetRatio = targetW / targetH ; sourceRatio = sourceW / sourceH
 *  If targetRatio > sourceRatio: the target is WIDER than the source — no
 *    crop is possible, so return mode "letterbox" (full-frame rect + pad
 *    with bars instead of cropping) and 0% pixels lost.
 *  Else crop: cropW = min(sourceW, sourceH * targetRatio)
 *             cropH = min(sourceH, sourceW / targetRatio)
 *  Anchor: center -> centered; top -> y=0, x centered; bottom -> y=max, x
 *    centered; left -> x=0, y centered; right -> x=max, y centered;
 *    custom -> x = anchorX% of (sourceW - cropW), clamped to bounds.
 *  pixelsLostPct = (1 - cropW*cropH / (sourceW*sourceH)) * 100 (1 decimal).
 *  safeZones: center 80% of the crop rect (10% margin) for text/subtitles.
 *  svgPreviewParams: JSON string of {source, crop, safe, mode} the app shell
 *    draws as the overlay preview — parameters, not a rendered image.
 */

const KNOWN_ASPECTS: Record<string, [number, number]> = {
  "16:9": [16, 9],
  "9:16": [9, 16],
  "1:1": [1, 1],
  "4:5": [4, 5],
};

const MAX_DIMENSION = 16384;

function toNumber(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function parseAspect(selection: string, custom: string): { w?: number; h?: number; error?: string } {
  if (selection === "custom") {
    const t = (custom ?? "").trim();
    const m = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/.exec(t);
    if (!m) {
      return { error: 'Custom aspect must look like "3:4" — two positive numbers separated by a colon.' };
    }
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (w <= 0 || h <= 0) return { error: "Custom aspect numbers must be greater than 0." };
    return { w, h };
  }
  const known = KNOWN_ASPECTS[selection];
  if (!known) return { error: 'Choose a target aspect: 16:9, 9:16, 1:1, 4:5, or custom.' };
  return { w: known[0], h: known[1] };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const sourceW = toNumber(values["sourceW"]);
  const sourceH = toNumber(values["sourceH"]);
  if (sourceW === null || sourceW <= 0 || !Number.isFinite(sourceW)) {
    return { ok: false, error: "Enter the source width in pixels (a positive number)." };
  }
  if (sourceH === null || sourceH <= 0 || !Number.isFinite(sourceH)) {
    return { ok: false, error: "Enter the source height in pixels (a positive number)." };
  }
  if (sourceW > MAX_DIMENSION || sourceH > MAX_DIMENSION) {
    return { ok: false, error: `Dimensions above ${MAX_DIMENSION}px are not supported.` };
  }

  const rawAspect = values["targetAspect"];
  const aspectSel = typeof rawAspect === "string" ? rawAspect : "";
  const aspect = parseAspect(aspectSel, typeof values["targetAspectCustom"] === "string" ? (values["targetAspectCustom"] as string) : "");
  if (aspect.error || aspect.w === undefined || aspect.h === undefined) {
    return { ok: false, error: aspect.error ?? "Choose a target aspect." };
  }
  const targetRatio = aspect.w / aspect.h;

  const rawAnchor = values["cropAnchor"];
  const anchor = typeof rawAnchor === "string" ? rawAnchor : "center";
  const anchors = ["center", "top", "bottom", "left", "right", "custom"];
  if (!anchors.includes(anchor)) {
    return { ok: false, error: "Choose a crop anchor: center, top, bottom, left, right, or custom." };
  }

  let anchorX = toNumber(values["anchorX"]);
  let anchorY = toNumber(values["anchorY"]);
  if (anchorX === null) anchorX = 50;
  if (anchorY === null) anchorY = 50;
  if (anchor === "custom" && (anchorX < 0 || anchorX > 100 || anchorY < 0 || anchorY > 100)) {
    return { ok: false, error: "Custom anchor X/Y must be percentages between 0 and 100." };
  }

  const sourceRatio = sourceW / sourceH;
  const sw = Math.round(sourceW);
  const sh = Math.round(sourceH);

  // Target wider than source -> letterbox, not a crop.
  if (targetRatio > sourceRatio) {
    const safeX = Math.round(sw * 0.1);
    const safeY = Math.round(sh * 0.1);
    const safeW = Math.round(sw * 0.8);
    const safeH = Math.round(sh * 0.8);
    return {
      ok: true,
      values: {
        cropRect: `x=0, y=0, w=${sw}, h=${sh} (full frame — no crop)`,
        pixelsLostPct: 0,
        safeZones: `Text/subtitle safe area (center 80%): x ${safeX}-${safeX + safeW}, y ${safeY}-${safeY + safeH}.`,
        svgPreviewParams: JSON.stringify({
          source: { w: sw, h: sh },
          crop: { x: 0, y: 0, w: sw, h: sh },
          safe: { x: safeX, y: safeY, w: safeW, h: safeH },
          mode: "letterbox",
          note: "Target is wider than the source — pad with bars instead of cropping.",
        }),
        mode: "letterbox",
        warning:
          `The target aspect (${aspect.w}:${aspect.h}) is wider than your source — nothing can be cropped. ` +
          "Use letterboxing (bars) or a wider source instead.",
      },
    };
  }

  // Crop math.
  const cropW = Math.max(1, Math.round(Math.min(sourceW, sourceH * targetRatio)));
  const cropH = Math.max(1, Math.round(Math.min(sourceH, sourceW / targetRatio)));
  const freeX = sw - cropW;
  const freeY = sh - cropH;

  let x: number;
  let y: number;
  switch (anchor) {
    case "top":
      x = Math.round(freeX / 2);
      y = 0;
      break;
    case "bottom":
      x = Math.round(freeX / 2);
      y = freeY;
      break;
    case "left":
      x = 0;
      y = Math.round(freeY / 2);
      break;
    case "right":
      x = freeX;
      y = Math.round(freeY / 2);
      break;
    case "custom": {
      const cx = Math.min(100, Math.max(0, anchorX));
      const cy = Math.min(100, Math.max(0, anchorY));
      x = Math.round((cx / 100) * freeX);
      y = Math.round((cy / 100) * freeY);
      break;
    }
    default:
      x = Math.round(freeX / 2);
      y = Math.round(freeY / 2);
  }
  x = Math.min(freeX, Math.max(0, x));
  y = Math.min(freeY, Math.max(0, y));

  const pixelsLostPct = round1((1 - (cropW * cropH) / (sw * sh)) * 100);

  const safeX = Math.round(x + cropW * 0.1);
  const safeY = Math.round(y + cropH * 0.1);
  const safeW = Math.round(cropW * 0.8);
  const safeH = Math.round(cropH * 0.8);

  let warning = "";
  if (pixelsLostPct >= 50) {
    warning =
      `Heavy crop: you keep only ${round1(100 - pixelsLostPct)}% of the pixels. ` +
      "Reframe important subjects toward the crop center — edges will be discarded.";
  }

  return {
    ok: true,
    values: {
      cropRect: `x=${x}, y=${y}, w=${cropW}, h=${cropH}`,
      pixelsLostPct,
      safeZones: `Text/subtitle safe area (center 80% of crop): x ${safeX}-${safeX + safeW}, y ${safeY}-${safeY + safeH}.`,
      svgPreviewParams: JSON.stringify({
        source: { w: sw, h: sh },
        crop: { x, y, w: cropW, h: cropH },
        safe: { x: safeX, y: safeY, w: safeW, h: safeH },
        mode: "crop",
        note: "Computed coordinates for the app shell to render as an SVG overlay — not a rendered image.",
      }),
      mode: "crop",
      warning,
    },
  };
}
