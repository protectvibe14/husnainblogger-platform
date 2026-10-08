/**
 * tool-289 — Render Time Estimator (calculator, statistical-estimate engine).
 *
 * ROUGH ESTIMATE BY DESIGN (isEstimate=true). Real render speed depends on
 * your encoder (hardware vs software), codec, effects, background load, and
 * thermals — no formula can know your machine. This tool outputs a RANGE,
 * never a point estimate, and every number is labeled a ROUGH ESTIMATE.
 *
 * F-RENDER-01 (documented baseline — all values are ESTIMATES, not measured):
 *   BASE_RT = 6
 *     Estimated realtime factor: a mid-tier device encodes 1080p30 with
 *     light effects at ~6x realtime (i.e. 60 video-seconds render in ~10 s).
 *   PIXEL_FACTORS (encode cost relative to 1080p):
 *     720p: 0.44 · 1080p: 1 · 4k: 4
 *   EFFECT_FACTORS: light: 1 · medium: 1.6 · heavy: 2.8
 *   DEVICE_FACTORS: low: 0.45 · mid: 1 · high: 1.9
 *   FPS factor: fps / 30
 *
 *   speed(video-sec per real-sec) =
 *     BASE_RT / (pixelFactor * effectFactor * fpsFactor) * deviceFactor
 *   estimateSec = durationSec / speed
 *   normal range:   [round(estimate * 0.7), round(estimate * 1.5)]
 *   extreme range (4k + heavy + low tier): [round(estimate * 0.5), round(estimate * 2.2)]
 *     plus a strong caveat assumption (spec edge case).
 *
 * runTool({ durationSec, fps, resolution, effectLoad, deviceTier })
 *   -> { estimatedMinSec, estimatedMaxSec, assumptions }
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** F-RENDER-01 baseline encode-rate table. EVERY value is a ROUGH ESTIMATE. */
const BASE_RT = 6; // estimated 1080p30/light realtime factor on a mid-tier device

const PIXEL_FACTORS: Record<string, number> = {
  "720p": 0.44,
  "1080p": 1,
  "4k": 4,
};

const EFFECT_FACTORS: Record<string, number> = {
  light: 1,
  medium: 1.6,
  heavy: 2.8,
};

const DEVICE_FACTORS: Record<string, number> = {
  low: 0.45,
  mid: 1,
  high: 1.9,
};

function fail(message: string): RunResult {
  return { ok: false, error: message };
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

function parseEnum(value: unknown, table: Record<string, number>): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(table, t) ? t : null;
}

function formatDuration(sec: number): string {
  const s = Math.round(sec);
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} min` : `${m} min ${rest} sec`;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const durationSec = toPositiveNumber(values.durationSec);
  if (durationSec === null) {
    return fail("Enter the video duration in seconds (a positive number).");
  }
  const fps = toPositiveNumber(values.fps);
  if (fps === null) {
    return fail("Enter the frame rate (a positive number, e.g. 30).");
  }
  const resolution = parseEnum(values.resolution, PIXEL_FACTORS);
  if (resolution === null) {
    return fail("Choose a resolution: 720p, 1080p, or 4k.");
  }
  const effectLoad = parseEnum(values.effectLoad, EFFECT_FACTORS);
  if (effectLoad === null) {
    return fail("Choose the effects load: light, medium, or heavy.");
  }
  const deviceTier = parseEnum(values.deviceTier, DEVICE_FACTORS);
  if (deviceTier === null) {
    return fail("Choose your device tier: low, mid, or high.");
  }

  const speed =
    (BASE_RT /
      (PIXEL_FACTORS[resolution] * EFFECT_FACTORS[effectLoad] * (fps / 30))) *
    DEVICE_FACTORS[deviceTier];
  const estimateSec = durationSec / speed;

  const extreme = resolution === "4k" && effectLoad === "heavy" && deviceTier === "low";
  const minSec = Math.max(1, Math.round(estimateSec * (extreme ? 0.5 : 0.7)));
  const maxSec = Math.max(minSec, Math.round(estimateSec * (extreme ? 2.2 : 1.5)));

  const assumptions: string[] = [
    `ROUGH ESTIMATE only: a ${resolution} video of ${durationSec}s at ${fps} fps with ${effectLoad} effects on a ${deviceTier}-tier device is estimated to render in ${formatDuration(
      minSec
    )}–${formatDuration(maxSec)}.`,
    "Baseline encode rates are estimates, not measurements — real speed depends on your encoder (hardware vs software), codec, effects, background apps, and thermals.",
    "The range is deliberately wide because render times vary wildly between machines; treat the low end as best-case and the high end as a long-coffee-break case.",
  ];
  if (extreme) {
    assumptions.push(
      "STRONG CAVEAT: 4k + heavy effects on a low-tier device is the worst combination — renders can take far longer than this already-wide range, and some machines may fail to complete the export at all. Consider 1080p, proxy editing, or lighter effects."
    );
  }

  return {
    ok: true,
    values: {
      estimatedMinSec: minSec,
      estimatedMaxSec: maxSec,
      assumptions,
    },
  };
}
