/**
 * Keyframe Easing Visualizer (tool-263) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: same easing + samples always
 * yields the same curve points.
 *
 * Honesty: this is pure CUBIC-BEZIER MATH, not a rendered image. The tool
 * evaluates the easing curve at N sample points and hands them to the UI
 * (MA1), which draws the canvas/SVG. The UI must label the curve a computed
 * preview, never a rendered animation. CapCut has limited built-in easing
 * options, so the CapCut approximation maps to the nearest standard curve
 * with an explicit note — never a claim of an exact match.
 *
 * Math: cubic bezier (F-EASING-01). For target x, solve Bx(t)=x with
 * Newton-Raphson (8 iterations, 1e-6 tolerance) and a bisection fallback,
 * then return By(t). Standard CSS control points:
 *  linear [0,0,0,0] · ease [0.25,0.1,0.25,1] · ease-in [0.42,0,1,1] ·
 *  ease-out [0,0,0.58,1] · ease-in-out [0.42,0,0.58,1].
 */

interface Bezier {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const NAMED: Record<string, Bezier> = {
  linear: { x1: 0, y1: 0, x2: 0, y2: 0 },
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  "ease-in": { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  "ease-out": { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  "ease-in-out": { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
};

const EASING_IDS: string[] = ["linear", "ease", "ease-in", "ease-out", "ease-in-out", "custom"];

function makeSolver(b: Bezier): (x: number) => number {
  const ax = 3 * b.x1 - 3 * b.x2 + 1;
  const bx = 3 * b.x2 - 6 * b.x1;
  const cx = 3 * b.x1;
  const ay = 3 * b.y1 - 3 * b.y2 + 1;
  const by = 3 * b.y2 - 6 * b.y1;
  const cy = 3 * b.y1;
  const sampleX = (t: number): number => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number): number => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number): number => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return sampleY(t);
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
      if (t < 0 || t > 1) break;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return sampleY(t);
      if (x > v) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function sampleCurve(b: Bezier, samples: number): { t: number; value: number }[] {
  const solve = makeSolver(b);
  const points: { t: number; value: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const t = samples === 1 ? 0 : i / (samples - 1);
    points.push({ t: round4(t), value: round4(solve(t)) });
  }
  return points;
}

function nearestNamed(points: { t: number; value: number }[]): string {
  let best = "linear";
  let bestErr = Infinity;
  for (const name of Object.keys(NAMED)) {
    const ref = sampleCurve(NAMED[name] as Bezier, points.length);
    let err = 0;
    for (let i = 0; i < points.length; i++) {
      const d = (points[i] as { value: number }).value - (ref[i] as { value: number }).value;
      err += d * d;
    }
    if (err < bestErr) {
      bestErr = err;
      best = name;
    }
  }
  return best;
}

function toNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") return Number(raw.trim());
  return NaN;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawEasing = values["easing"];
  const easing =
    typeof rawEasing === "string" ? rawEasing.trim().toLowerCase() : "";
  if (!EASING_IDS.includes(easing)) {
    return {
      ok: false,
      error: `Unknown easing "${typeof rawEasing === "string" ? rawEasing : ""}". Pick one of: ${EASING_IDS.join(", ")}.`,
    };
  }

  const durationMs = toNumber(values["durationMs"]);
  if (!Number.isFinite(durationMs)) {
    return { ok: false, error: "Enter the animation duration in milliseconds (a number above 0)." };
  }
  if (durationMs <= 0) {
    return { ok: false, error: `Duration must be above 0 ms — got ${durationMs}.` };
  }

  const rawSamples = values["samples"];
  const samples = rawSamples === undefined || rawSamples === null || rawSamples === ""
    ? 60
    : toNumber(rawSamples);
  if (!Number.isFinite(samples) || Math.floor(samples) !== samples) {
    return { ok: false, error: "Samples must be a whole number between 10 and 240." };
  }
  if (samples < 10 || samples > 240) {
    return {
      ok: false,
      error: `Samples must be between 10 and 240 — got ${samples}.`,
    };
  }

  let bezier: Bezier;
  if (easing === "custom") {
    const x1 = toNumber(values["x1"]);
    const y1 = toNumber(values["y1"]);
    const x2 = toNumber(values["x2"]);
    const y2 = toNumber(values["y2"]);
    if (![x1, y1, x2, y2].every(Number.isFinite)) {
      return {
        ok: false,
        error: "Custom easing needs all four control points: x1, y1, x2, y2.",
      };
    }
    if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
      return {
        ok: false,
        error: `Invalid cubic-bezier: x1 and x2 must be within 0-1 (CSS requirement) — got x1=${x1}, x2=${x2}.`,
      };
    }
    bezier = { x1, y1, x2, y2 };
  } else {
    bezier = NAMED[easing] as Bezier;
  }

  const curvePoints = sampleCurve(bezier, samples);
  const cssEasingString =
    easing === "linear"
      ? "linear"
      : `cubic-bezier(${bezier.x1}, ${bezier.y1}, ${bezier.x2}, ${bezier.y2})`;

  const overshoot =
    bezier.y1 < 0 || bezier.y1 > 1 || bezier.y2 < 0 || bezier.y2 > 1;
  const nearest = nearestNamed(curvePoints);
  let capcutApproximation =
    `Nearest standard curve: "${nearest}". CapCut's built-in easing options are limited — ` +
    `pick the closest available easing and recreate the timing manually; this is an approximation, not an exact match.`;
  if (easing !== "custom") {
    capcutApproximation =
      `This is the standard "${easing}" curve. CapCut's built-in easing options are limited — ` +
      `use the closest available easing setting; timings are approximate, not exact.`;
  }
  if (overshoot) {
    capcutApproximation +=
      " Warning: the curve overshoots past 0-1 (anticipation effect) — CapCut approximations cannot reproduce overshoot.";
  }

  return {
    ok: true,
    values: {
      curvePoints,
      cssEasingString,
      capcutApproximation,
    },
  };
}
