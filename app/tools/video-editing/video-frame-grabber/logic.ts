/**
 * Video Frame Grabber (tool-272) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: the same inputs always yield the same settings.
 *
 * FEASIBILITY: pure logic CANNOT decode video or grab frames — that needs
 * the browser (<video> + canvas) in the app shell, fully client-side with
 * no server upload. The logic layer's honest job is ONLY the timestamp
 * clamping/validation math and the output-dimension scaling math: given the
 * video duration, a requested timestamp, the source resolution, and the
 * output size, it returns the validated (possibly clamped) timestamp, the
 * target dimensions, and the frame-extraction settings the app shell uses
 * to capture the frame. It does NOT output an image.
 *
 * === PUBLISHED RULES ===
 *  Timestamp: requested < 0 -> error. Requested > duration -> clamp to
 *    duration (the last frame) with a warning; report the ACTUAL timestamp.
 *  Dimensions: "original" -> source WxH. "1080p" -> fit inside 1920x1080
 *    preserving aspect ratio; "720p" -> fit inside 1280x720. Never upscale:
 *    if the source is smaller than the target box, keep source dimensions.
 *    Width/height are rounded DOWN to even integers (encoder-safe).
 */

const OUTPUT_BOXES: Record<string, { w: number; h: number }> = {
  original: { w: 0, h: 0 }, // sentinel: passthrough
  "1080p": { w: 1920, h: 1080 },
  "720p": { w: 1280, h: 720 },
};

const MAX_DIMENSION = 16384;
const MAX_DURATION_SEC = 24 * 3600;

function toNumber(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function evenDown(n: number): number {
  return Math.max(2, 2 * Math.floor(n / 2));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const durationSec = toNumber(values["durationSec"]);
  if (durationSec === null || durationSec <= 0) {
    return { ok: false, error: "Enter the video duration in seconds (must be greater than 0)." };
  }
  if (durationSec > MAX_DURATION_SEC) {
    return { ok: false, error: "Duration looks unrealistic (over 24 hours) — check the value and try again." };
  }

  const timestampSec = toNumber(values["timestampSec"]);
  if (timestampSec === null) {
    return { ok: false, error: "Enter the timestamp in seconds where the frame should be captured." };
  }
  if (timestampSec < 0) {
    return { ok: false, error: "Timestamp cannot be negative — enter a value between 0 and the video duration." };
  }

  const sourceWidth = toNumber(values["sourceWidth"]);
  const sourceHeight = toNumber(values["sourceHeight"]);
  if (sourceWidth === null || !Number.isInteger(sourceWidth) || sourceWidth <= 0) {
    return { ok: false, error: "Enter the source video width in whole pixels (greater than 0)." };
  }
  if (sourceHeight === null || !Number.isInteger(sourceHeight) || sourceHeight <= 0) {
    return { ok: false, error: "Enter the source video height in whole pixels (greater than 0)." };
  }
  if (sourceWidth > MAX_DIMENSION || sourceHeight > MAX_DIMENSION) {
    return { ok: false, error: `Resolutions above ${MAX_DIMENSION}px are not supported — check the source dimensions.` };
  }

  const rawSize = values["outputSize"];
  const outputSize = typeof rawSize === "string" ? rawSize : "";
  if (!(outputSize in OUTPUT_BOXES)) {
    return { ok: false, error: 'Choose an output size: "original", "1080p", or "720p".' };
  }

  // --- timestamp clamp math (the logic layer's job) ---
  let actualTimestampSec: number;
  let warning: string;
  if (timestampSec > durationSec) {
    actualTimestampSec = round2(durationSec);
    warning = `Requested ${round2(timestampSec)}s is past the ${round2(durationSec)}s video — clamped to the last frame (${round2(durationSec)}s).`;
  } else {
    actualTimestampSec = round2(timestampSec);
    warning = "";
  }

  // --- dimension scaling math (the logic layer's job) ---
  let outW: number;
  let outH: number;
  if (outputSize === "original") {
    outW = sourceWidth;
    outH = sourceHeight;
  } else {
    const box = OUTPUT_BOXES[outputSize];
    const scale = Math.min(box.w / sourceWidth, box.h / sourceHeight);
    if (scale >= 1) {
      // Never upscale: keep source dimensions.
      outW = sourceWidth;
      outH = sourceHeight;
    } else {
      outW = evenDown(sourceWidth * scale);
      outH = evenDown(sourceHeight * scale);
    }
  }
  const outputDimensions = `${outW} x ${outH}`;

  const extractionSettings =
    `Seek the video to ${actualTimestampSec}s, draw the current frame to a ${outW}x${outH} canvas ` +
    `(aspect preserved, even dimensions for encoder safety), then export as PNG. ` +
    `The actual capture runs in your browser via <video> + canvas — no upload, no server.`;

  return {
    ok: true,
    values: {
      actualTimestampSec,
      outputDimensions,
      extractionSettings,
      warning,
    },
  };
}
