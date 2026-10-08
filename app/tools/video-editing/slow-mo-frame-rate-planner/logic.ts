/**
 * Slow-Mo Frame Rate Planner (tool-267) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same inputs always yield the same plan.
 *
 * Honesty: PURE FRAME-RATE ARITHMETIC (F-SLOWMO-01/02). No video is
 * processed, no frames are analyzed — this plans the shoot/edit math only.
 *
 * === PUBLISHED FORMULAS ===
 *  F-SLOWMO-01 (smoothness): smooth slow motion needs one real source frame
 *   per timeline frame -> achievable iff sourceFps * slowFactor >= timelineFps.
 *  F-SLOWMO-02 (speeds): playbackSpeedPct = slowFactor * 100;
 *   effectiveFps = sourceFps * slowFactor.
 *  Even cadence: sourceFps divisible by timelineFps -> uniform frame mapping;
 *   otherwise frames drop unevenly -> judder warning (esp. on pans).
 *  Reshoot target: requiredFps = ceil(timelineFps / slowFactor), rounded UP
 *   to the next standard high-speed step: 60 / 120 / 240 / 480 / 960.
 *  Flicker heuristic: sources at 240 fps+ get a light-flicker warning
 *   (LED/fluorescent flicker under fast shutters).
 */

const TIMELINE_SET = [24, 25, 30, 60];
const STD_STEPS = [60, 120, 240, 480, 960];

function toFiniteNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") return Number(raw.trim());
  return NaN;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const sourceFps = toFiniteNumber(values["sourceFps"]);
  if (!Number.isFinite(sourceFps) || sourceFps < 24 || sourceFps > 960) {
    return {
      ok: false,
      error: "Source frame rate must be a number between 24 and 960 fps.",
    };
  }

  const timelineFps = toFiniteNumber(values["timelineFps"]);
  if (!TIMELINE_SET.includes(timelineFps)) {
    return {
      ok: false,
      error: "Timeline frame rate must be one of 24, 25, 30, or 60 fps.",
    };
  }

  const slowFactor = toFiniteNumber(values["desiredSlowFactor"]);
  if (!Number.isFinite(slowFactor) || slowFactor < 0.05 || slowFactor > 1.0) {
    return {
      ok: false,
      error: "Slow factor must be a number between 0.05 (5% speed) and 1.0 (full speed).",
    };
  }

  const playbackSpeedPct = Math.round(slowFactor * 1000) / 10;
  const effectiveFps = Math.round(sourceFps * slowFactor * 100) / 100;
  const achievable = sourceFps * slowFactor >= timelineFps;
  const evenCadence =
    Number.isInteger(sourceFps) && sourceFps % timelineFps === 0;

  let qualityVerdict: string;
  if (achievable && evenCadence) {
    qualityVerdict =
      "Smooth native slow motion — every timeline frame gets a real source frame, evenly spaced.";
  } else if (achievable) {
    qualityVerdict = `Smooth, but ${sourceFps} is not a multiple of ${timelineFps}: frames map unevenly, so watch pans and fast motion for judder.`;
  } else {
    qualityVerdict = `Not smoothly achievable: at ${playbackSpeedPct}% speed you get ${effectiveFps} fps of real frames, but a ${timelineFps} fps timeline needs one frame per slot — expect stutter unless you use frame interpolation (optical flow), which can add artifacts.`;
  }

  let shootRecommendation: string;
  if (achievable) {
    shootRecommendation = `You're covered — shoot at ${sourceFps} fps and conform to a ${timelineFps} fps timeline at ${playbackSpeedPct}% speed.`;
  } else {
    const requiredFps = Math.ceil(timelineFps / slowFactor);
    const step = STD_STEPS.find((s) => s >= requiredFps) ?? requiredFps;
    shootRecommendation = `Reshoot at ${step} fps or faster (needs at least ${requiredFps} fps) to hit ${playbackSpeedPct}% speed smoothly on a ${timelineFps} fps timeline.`;
  }
  if (sourceFps >= 240) {
    shootRecommendation +=
      " High-fps warning: at 240 fps+ shoot under flicker-free light, or set the shutter to a multiple of your mains frequency (1/100 s or 1/120 s) to avoid banding.";
  }

  return {
    ok: true,
    values: {
      achievable: achievable ? "Yes" : "No",
      playbackSpeedPct,
      effectiveFps,
      qualityVerdict,
      shootRecommendation,
    },
  };
}
