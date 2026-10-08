/**
 * logic.ts — Effect Stack Planner (tool-282)
 *
 * Pure, deterministic engine. ZERO imports.
 *
 * What this honestly is: a rule-based lookup. Your "desired look" text is
 * keyword-matched against 8 curated look presets, each carrying a fixed,
 * correctly-ordered effect stack. The ordering follows the classic edit
 * pipeline rule: correction (exposure, white balance) -> grade/filter ->
 * stylization (grain, vignette, glow) -> finish (sharpen). The tool never
 * applies effects or reads your video — it only plans the order.
 *
 * renderImpact is QUALITATIVE guidance, not a measurement: it sums a
 * fixed "cost" per effect (heavy effects count double), maps the total to
 * low|med|high (<=2.0 low, <=4.0 med, above high), then nudges one level up
 * for low-tier devices and one level down for high-tier devices.
 *
 * LOOK BANK SIZE: 8 presets, each with 4-6 effects.
 * Presets: cinematic, clean/natural, vintage film, warm vlog, noir,
 *          neon glow, glitchy pop, dreamy soft.
 *
 * Output is deterministic: same inputs always produce the same stack.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface EffectDef {
  effect: string;
  intensity: number; // 0-100, fixed per preset
  heavy: boolean; // GPU-heavy effect (blur, glow, RGB split, LUT render)
  blurFamily: boolean; // counts toward blur-redundancy rule
}

interface LookPreset {
  name: string;
  keywords: string[];
  stack: EffectDef[];
}

const LOOKS: LookPreset[] = [
  {
    name: "cinematic",
    keywords: ["cinematic", "movie", "film look", "hollywood", "dramatic", "teal"],
    stack: [
      { effect: "Exposure Correction", intensity: 35, heavy: false, blurFamily: false },
      { effect: "Contrast Curve (S-curve)", intensity: 60, heavy: true, blurFamily: false },
      { effect: "Teal-Orange LUT", intensity: 55, heavy: true, blurFamily: false },
      { effect: "Vignette", intensity: 40, heavy: false, blurFamily: false },
      { effect: "Film Grain", intensity: 45, heavy: false, blurFamily: false },
      { effect: "Sharpen (light)", intensity: 30, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "clean",
    keywords: ["clean", "natural", "minimal", "simple", "normal", "default", "basic"],
    stack: [
      { effect: "White Balance Fix", intensity: 40, heavy: false, blurFamily: false },
      { effect: "Exposure Correction", intensity: 30, heavy: false, blurFamily: false },
      { effect: "Subtle Contrast", intensity: 25, heavy: false, blurFamily: false },
      { effect: "Sharpen (light)", intensity: 20, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "vintage film",
    keywords: ["vintage", "retro", "old", "70s", "80s", "90s", "analog", "film"],
    stack: [
      { effect: "White Balance Warm Shift", intensity: 50, heavy: false, blurFamily: false },
      { effect: "Faded Contrast", intensity: 45, heavy: false, blurFamily: false },
      { effect: "Film Grain", intensity: 60, heavy: false, blurFamily: false },
      { effect: "Vignette", intensity: 55, heavy: false, blurFamily: false },
      { effect: "Light Leak Overlay", intensity: 40, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "warm vlog",
    keywords: ["vlog", "warm", "cozy", "travel", "lifestyle", "sunny"],
    stack: [
      { effect: "White Balance Warm", intensity: 45, heavy: false, blurFamily: false },
      { effect: "Exposure Correction", intensity: 30, heavy: false, blurFamily: false },
      { effect: "Warm Glow", intensity: 50, heavy: true, blurFamily: false },
      { effect: "Skin Tone Protect", intensity: 35, heavy: false, blurFamily: false },
      { effect: "Sharpen (light)", intensity: 25, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "noir",
    keywords: ["noir", "black and white", "bw", "b&w", "moody", "dark"],
    stack: [
      { effect: "Exposure Correction", intensity: 40, heavy: false, blurFamily: false },
      { effect: "Black & White Filter", intensity: 80, heavy: false, blurFamily: false },
      { effect: "High Contrast", intensity: 70, heavy: true, blurFamily: false },
      { effect: "Heavy Vignette", intensity: 65, heavy: false, blurFamily: false },
      { effect: "Film Grain", intensity: 50, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "neon glow",
    keywords: ["neon", "glow", "cyber", "futuristic", "city night", "synthwave"],
    stack: [
      { effect: "Exposure Correction", intensity: 30, heavy: false, blurFamily: false },
      { effect: "Saturation Boost", intensity: 55, heavy: false, blurFamily: false },
      { effect: "Neon Glow", intensity: 70, heavy: true, blurFamily: false },
      { effect: "Lens Blur (background)", intensity: 50, heavy: true, blurFamily: true },
      { effect: "Sharpen (light)", intensity: 30, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "glitchy pop",
    keywords: ["glitch", "pop", "edgy", "hype", "trailer", "energetic"],
    stack: [
      { effect: "Exposure Correction", intensity: 30, heavy: false, blurFamily: false },
      { effect: "Contrast Boost", intensity: 50, heavy: false, blurFamily: false },
      { effect: "Saturation Pop", intensity: 60, heavy: false, blurFamily: false },
      { effect: "RGB Split", intensity: 55, heavy: true, blurFamily: false },
      { effect: "Sharpen (light)", intensity: 35, heavy: false, blurFamily: false },
    ],
  },
  {
    name: "dreamy soft",
    keywords: ["dreamy", "soft", "romantic", "wedding", "fairy", "glow soft", "aesthetic"],
    stack: [
      { effect: "Exposure Correction", intensity: 35, heavy: false, blurFamily: false },
      { effect: "Low Contrast", intensity: 30, heavy: false, blurFamily: false },
      { effect: "Warm Tint", intensity: 40, heavy: false, blurFamily: false },
      { effect: "Soft Bloom", intensity: 55, heavy: true, blurFamily: true },
      { effect: "Gentle Blur", intensity: 35, heavy: true, blurFamily: true },
    ],
  },
];

function toString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function matchLook(desiredLook: string): { preset: LookPreset; matched: boolean } {
  const lower = desiredLook.toLowerCase();
  for (const preset of LOOKS) {
    if (preset.keywords.some((kw) => lower.includes(kw))) return { preset, matched: true };
  }
  return { preset: LOOKS[1], matched: false }; // fallback: "clean"
}

function costOf(e: EffectDef): number {
  return (e.intensity / 100) * (e.heavy ? 2 : 1);
}

export function runTool(values: Record<string, unknown>): RunResult {
  const desiredLook = toString(values.desiredLook);
  const deviceTier = toString(values.deviceTier).toLowerCase();

  if (!desiredLook) return { ok: false, error: "Describe the look you want (\"desiredLook\") — e.g. cinematic, vintage, neon glow." };
  if (deviceTier !== "low" && deviceTier !== "mid" && deviceTier !== "high") {
    return { ok: false, error: "Device tier must be \"low\", \"mid\", or \"high\"." };
  }

  let clipCount = 1;
  if (values.clipCount !== undefined && values.clipCount !== null && values.clipCount !== "") {
    const n = Number(values.clipCount);
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      return { ok: false, error: "Clip count must be a whole number between 1 and 500." };
    }
    clipCount = n;
  }

  const { preset, matched } = matchLook(desiredLook);

  // Stack: correction -> grade -> stylization -> finish is baked into each preset's order.
  const stack = preset.stack.map((e, i) => ({
    effect: e.effect,
    order: i + 1,
    intensity: e.intensity,
  }));

  // Qualitative render impact: sum of fixed per-effect costs.
  let score = preset.stack.reduce((s, e) => s + costOf(e), 0);
  let level: "low" | "med" | "high" = score <= 2.0 ? "low" : score <= 4.0 ? "med" : "high";
  if (deviceTier === "low" && level !== "high") level = level === "low" ? "med" : "high";
  if (deviceTier === "high" && level !== "low") level = level === "high" ? "med" : "low";

  const perfWarnings: string[] = [];
  const heavyEffects = preset.stack.filter((e) => e.heavy);

  if (!matched) {
    perfWarnings.push(
      `No preset matched "${desiredLook}" — the plan uses the safe "clean/natural" stack. Try keywords like cinematic, vintage, noir, neon glow, glitchy, dreamy, or warm vlog for a styled preset.`
    );
  }
  if (deviceTier === "low" && heavyEffects.length > 0) {
    perfWarnings.push(
      `STRONG WARNING: low-tier device with ${heavyEffects.length} GPU-heavy effect(s) (${heavyEffects.map((e) => e.effect).join(", ")}). Lighter alternative: drop ${heavyEffects[0].effect} and lower Vignette/Grain intensity — you keep ~80% of the look at a fraction of the render cost.`
    );
  } else if (deviceTier === "mid" && heavyEffects.length >= 2) {
    perfWarnings.push(
      `Mid-tier device: this stack uses ${heavyEffects.length} heavy effects (${heavyEffects.map((e) => e.effect).join(", ")}). If playback stutters, disable one of them first.`
    );
  }
  const blurry = preset.stack.filter((e) => e.blurFamily);
  if (blurry.length >= 2) {
    perfWarnings.push(
      `REDUNDANCY: the stack layers two blur-family effects (${blurry.map((e) => e.effect).join(" + ")}). They do similar work — pick one, or render will be slower for no visible gain.`
    );
  }
  if (clipCount > 30) {
    perfWarnings.push(
      `${clipCount} clips with a ${stack.length}-effect stack means a long render queue. Consider rendering a 5-second test clip first to check the look before the full export.`
    );
  }

  return { ok: true, values: { stack, perfWarnings, renderImpact: level } };
}

// Exported for tests only (not used by the UI template).
export const LOOK_COUNT = LOOKS.length;
