/**
 * Ken Burns Path Planner (tool-264) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: same inputs always yield the
 * same keyframes.
 *
 * Honesty: this is pure GEOMETRY MATH — linear interpolation of a crop
 * rectangle's center and scale over time. No image processing happens
 * here; the tool never sees your image. Output is coordinates and timings
 * (for your editor's keyframes), not a rendered video. Estimates are
 * labeled as plans, not renderings.
 *
 * Model:
 *  - Reference output frame is 1080p (16:9 -> 1920x1080, 9:16 -> 1080x1920,
 *    1:1 -> 1080x1080). If the max-zoom crop window would be smaller than
 *    this frame, the tool errors instead of planning an upscale.
 *  - Base crop = largest rect of the target aspect that fits the image.
 *    scale s means the crop is baseCrop/s.
 *  - Zoom moves: center fixed at image center, scale 1->z (in) or z->1 (out).
 *  - Pan moves: fixed scale z (needs z > 1 for room to move); the crop
 *    center travels between the edge bounds. Pan-left/right move the crop
 *    window left/right; pan-up/down move it up/down.
 *  - 11 keyframes, t in seconds, centers in image pixels, scale 3 decimals.
 */

const ASPECTS: Record<string, { w: number; h: number }> = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
  "1:1": { w: 1080, h: 1080 },
};

const MOVE_TYPES: string[] = [
  "zoom-in",
  "zoom-out",
  "pan-left",
  "pan-right",
  "pan-up",
  "pan-down",
];

const KEYFRAME_COUNT = 11;

function toNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") return Number(raw.trim());
  return NaN;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

interface Keyframe {
  t: number;
  x: number;
  y: number;
  scale: number;
}

interface CropWindow {
  t: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const imageW = toNumber(values["imageW"]);
  const imageH = toNumber(values["imageH"]);
  if (!Number.isFinite(imageW) || imageW <= 0) {
    return { ok: false, error: "Enter the image width in pixels (a number above 0)." };
  }
  if (!Number.isFinite(imageH) || imageH <= 0) {
    return { ok: false, error: "Enter the image height in pixels (a number above 0)." };
  }

  const rawAspect = values["videoAspect"];
  const videoAspect =
    typeof rawAspect === "string" ? rawAspect.trim() : "";
  const frame = ASPECTS[videoAspect];
  if (!frame) {
    return {
      ok: false,
      error: `Unknown video aspect "${typeof rawAspect === "string" ? rawAspect : ""}". Pick one of: ${Object.keys(ASPECTS).join(", ")}.`,
    };
  }

  const rawMove = values["moveType"];
  const moveType = typeof rawMove === "string" ? rawMove.trim().toLowerCase() : "";
  if (!MOVE_TYPES.includes(moveType)) {
    return {
      ok: false,
      error: `Unknown move type "${typeof rawMove === "string" ? rawMove : ""}". Pick one of: ${MOVE_TYPES.join(", ")}.`,
    };
  }

  const durationSec = toNumber(values["durationSec"]);
  if (!Number.isFinite(durationSec)) {
    return { ok: false, error: "Enter the clip duration in seconds (a number above 0)." };
  }
  if (durationSec <= 0) {
    return { ok: false, error: `Duration must be above 0 seconds — got ${durationSec}.` };
  }

  const rawZoom = values["zoomStrength"];
  const zoomStrength =
    rawZoom === undefined || rawZoom === null || rawZoom === ""
      ? 1.3
      : toNumber(rawZoom);
  if (!Number.isFinite(zoomStrength)) {
    return { ok: false, error: "Zoom strength must be a number between 1.0 and 2.0." };
  }
  if (zoomStrength < 1.0 || zoomStrength > 2.0) {
    return {
      ok: false,
      error: `Zoom strength must be between 1.0 and 2.0 — got ${zoomStrength}.`,
    };
  }

  const safeCheck: string[] = [];
  const warnings: string[] = [];

  // Base crop: largest rect of the target aspect inside the image.
  const aspect = frame.w / frame.h;
  const baseCropW = Math.min(imageW, imageH * aspect);
  const baseCropH = baseCropW / aspect;

  // Upscale guard at max zoom (smallest window = binding case).
  const minCropW = baseCropW / zoomStrength;
  const minCropH = baseCropH / zoomStrength;
  if (minCropW < frame.w || minCropH < frame.h) {
    return {
      ok: false,
      error:
        `Image too small: at max zoom (${zoomStrength}x) the crop window would be ` +
        `${Math.floor(minCropW)}x${Math.floor(minCropH)}px — smaller than the ${frame.w}x${frame.h} output frame, ` +
        `so the result would upscale and soften. Use a larger image.`,
    };
  }
  safeCheck.push(
    `Resolution OK: max-zoom crop ${Math.floor(minCropW)}x${Math.floor(minCropH)}px >= ${frame.w}x${frame.h} frame — no upscale.`,
  );
  safeCheck.push(
    `Base fit: ${Math.floor(baseCropW)}x${Math.floor(baseCropH)}px crop from a ${imageW}x${imageH}px image at ${videoAspect}.`,
  );

  if (zoomStrength === 1.0) {
    warnings.push(
      "Zoom strength 1.0 leaves no room to move — the path is static. Raise zoom strength above 1.0 for real motion.",
    );
  }

  const centerX = imageW / 2;
  const centerY = imageH / 2;

  // Pan bounds at fixed scale = zoomStrength.
  const panCropW = baseCropW / zoomStrength;
  const panCropH = baseCropH / zoomStrength;
  const minCx = panCropW / 2;
  const maxCx = imageW - panCropW / 2;
  const minCy = panCropH / 2;
  const maxCy = imageH - panCropH / 2;

  let startScale = 1;
  let endScale = zoomStrength;
  let startX = centerX;
  let startY = centerY;
  let endX = centerX;
  let endY = centerY;

  switch (moveType) {
    case "zoom-in":
      startScale = 1;
      endScale = zoomStrength;
      safeCheck.push(`Zoom-in: 1.0x -> ${zoomStrength}x over ${durationSec}s, center locked at image center.`);
      break;
    case "zoom-out":
      startScale = zoomStrength;
      endScale = 1;
      safeCheck.push(`Zoom-out: ${zoomStrength}x -> 1.0x over ${durationSec}s, center locked at image center.`);
      break;
    case "pan-left":
      startScale = endScale = zoomStrength;
      startX = maxCx;
      endX = minCx;
      break;
    case "pan-right":
      startScale = endScale = zoomStrength;
      startX = minCx;
      endX = maxCx;
      break;
    case "pan-up":
      startScale = endScale = zoomStrength;
      startY = maxCy;
      endY = minCy;
      break;
    case "pan-down":
      startScale = endScale = zoomStrength;
      startY = minCy;
      endY = maxCy;
      break;
  }

  if (moveType.startsWith("pan")) {
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const travel = round1(Math.max(dx, dy));
    const span = moveType === "pan-left" || moveType === "pan-right" ? imageW : imageH;
    if (travel < 0.05 * span) {
      warnings.push(
        `Pan distance is only ${travel}px — very short for this image at ${zoomStrength}x zoom. Clamped to the available range; raise zoom strength for a longer move.`,
      );
    }
    safeCheck.push(
      `Pan ${moveType.replace("pan-", "")}: ${travel}px travel at ${zoomStrength}x zoom over ${durationSec}s (window stays inside the image).`,
    );
  }

  const keyframes: Keyframe[] = [];
  for (let i = 0; i < KEYFRAME_COUNT; i++) {
    const f = i / (KEYFRAME_COUNT - 1);
    keyframes.push({
      t: round2(f * durationSec),
      x: round1(startX + (endX - startX) * f),
      y: round1(startY + (endY - startY) * f),
      scale: round3(startScale + (endScale - startScale) * f),
    });
  }

  const windowAt = (cx: number, cy: number, scale: number, t: number): CropWindow => {
    const w = baseCropW / scale;
    const h = baseCropH / scale;
    return { t: round2(t), x: round1(cx - w / 2), y: round1(cy - h / 2), w: round1(w), h: round1(h) };
  };
  const cropWindows: CropWindow[] = [
    windowAt(startX, startY, startScale, 0),
    windowAt(endX, endY, endScale, durationSec),
  ];

  for (const w of warnings) {
    safeCheck.push(`Warning: ${w}`);
  }

  return {
    ok: true,
    values: { keyframes, cropWindows, safeCheck },
  };
}
