/**
 * Green Screen Color Picker (tool-266) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same colors always yield the same
 * recommendation.
 *
 * Honesty: this is PURE COLOR MATH (RGB->HSV conversion, hue distance). It
 * does NOT perform chroma keying — real keying needs per-pixel access to
 * video frames, which only the editor (Premiere, CapCut, DaVinci) has. The
 * tool recommends the key color (broadcast green #00B140 or broadcast blue
 * #0000FF) and an HSV tolerance range to key by, plus spill-risk notes.
 * The UI must say so.
 *
 * === PUBLISHED RULES ===
 *  1. Suggest mode: if ANY subject color is "greenish" (hue 75-165 deg,
 *     saturation >= 0.25, value >= 0.20), recommend BLUE screen (#0000FF) —
 *     keying green would punch holes in those subject areas.
 *  2. Otherwise recommend broadcast green #00B140 (the standard chroma
 *     green: camera-friendly, far from skin tones).
 *  3. HSV tolerance range (starting point): chosen key hue ±12 deg,
 *     S >= 0.45, V >= 0.40. Tune ±4 deg on the hue window in the keyer.
 *  4. Analyze mode: parse the sample hex; measure hue distance to both
 *     standards; recommend the nearer one; center the HSV window on the
 *     sample hue (±12 deg) with S/V floors at max(0.15, sample - 0.15).
 *  5. Near-gray sample (saturation < 0.25) -> warn that chroma keying will
 *     be hard (luminance keys leak).
 */

interface Hsv {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const KEY_GREEN = "#00B140";
const KEY_BLUE = "#0000FF";

function parseHex(raw: unknown): Rgb | null {
  if (typeof raw !== "string") return null;
  const m = raw.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta > 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const GREEN_H = rgbToHsv(0, 177, 64).h; // ~141.7
const BLUE_H = 240;

function isGreenish(c: Hsv): boolean {
  return c.h >= 75 && c.h <= 165 && c.s >= 0.25 && c.v >= 0.2;
}

function isSkinish(c: Hsv): boolean {
  return (c.h <= 40 || c.h >= 340) && c.s >= 0.3 && c.v >= 0.3;
}

function noPixelKeyingNote(): string {
  return "This tool recommends the color and tolerance only — it does not key video. Real chroma keying needs per-pixel frame access and happens in your editor (Premiere, CapCut, DaVinci).";
}

function suggest(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["subjectColors"];
  let parts: string[];
  if (Array.isArray(raw)) {
    parts = raw.filter((x): x is string => typeof x === "string");
  } else if (typeof raw === "string") {
    parts = raw.split(/[\s,;]+/).filter((p) => p.length > 0);
  } else {
    parts = [];
  }

  if (parts.length === 0) {
    return {
      ok: false,
      error: "Add at least one subject color as a hex value (e.g. #c85a3a) in suggest mode.",
    };
  }
  const bad = parts.find((p) => parseHex(p) === null);
  if (bad) {
    return {
      ok: false,
      error: `"${bad}" is not a valid 6-digit hex color — use the format #rrggbb, e.g. #c85a3a.`,
    };
  }

  const hsvs: Hsv[] = parts.map((p) => {
    const rgb = parseHex(p) as Rgb;
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  });

  const greenHit = hsvs.find(isGreenish);
  const skinHit = hsvs.find(isSkinish);
  const recommendBlue = greenHit !== undefined;
  const keyHex = recommendBlue ? KEY_BLUE : KEY_GREEN;
  const keyHue = recommendBlue ? BLUE_H : GREEN_H;
  const keyName = recommendBlue ? "broadcast chroma blue" : "broadcast chroma green";

  const hsvRange = `H ${Math.round(keyHue - 12)}°–${Math.round(keyHue + 12)}°, S ≥ 0.45, V ≥ 0.40`;

  const spillRiskNotes: string[] = [];
  if (recommendBlue) {
    spillRiskNotes.push(
      "Your subject contains green tones — a blue screen keeps those areas keyable instead of punching transparent holes in them."
    );
  } else {
    spillRiskNotes.push(
      "No strong green in your subject colors — broadcast green (#00B140) is the standard, camera-friendly key color."
    );
  }
  if (skinHit) {
    spillRiskNotes.push(
      "Warm skin-like tones detected — both key colors sit far from skin hues, so face spill risk is low."
    );
  }
  spillRiskNotes.push(noPixelKeyingNote());

  return {
    ok: true,
    values: {
      recommendedKeyColor: `${keyHex} (${keyName})`,
      hsvRange,
      spillRiskNotes,
    },
  };
}

function analyze(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rgb = parseHex(values["sampleHex"]);
  if (!rgb) {
    return {
      ok: false,
      error: "Enter a valid 6-digit hex color for the sample (e.g. #00b140).",
    };
  }
  const c = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const dGreen = hueDistance(c.h, GREEN_H);
  const dBlue = hueDistance(c.h, BLUE_H);
  const nearerBlue = dBlue < dGreen;
  const nearest = nearerBlue ? dBlue : dGreen;
  const keyHex = nearerBlue ? KEY_BLUE : KEY_GREEN;
  const keyName = nearerBlue ? "broadcast chroma blue" : "broadcast chroma green";

  const hMin = Math.max(0, Math.round(c.h - 12));
  const hMax = Math.min(360, Math.round(c.h + 12));
  const sMin = round2(Math.max(0.15, c.s - 0.15));
  const vMin = round2(Math.max(0.15, c.v - 0.15));
  const hsvRange = `H ${hMin}°–${hMax}°, S ≥ ${sMin}, V ≥ ${vMin}`;

  const spillRiskNotes: string[] = [];
  if (c.s < 0.25) {
    spillRiskNotes.push(
      `Sample is near-gray (S=${round2(c.s)}): chroma keying will be hard — luminance keys leak into shadows and highlights. Use a saturated screen color instead.`
    );
  }
  if (nearest <= 15) {
    spillRiskNotes.push(
      `Sample sits ${Math.round(nearest)}° from ${keyName} — a good match for standard keyers.`
    );
  } else {
    spillRiskNotes.push(
      `Sample sits ${Math.round(nearest)}° from the nearest standard key color — non-standard screens key inconsistently across shots. Consider ${KEY_GREEN} or ${KEY_BLUE}.`
    );
  }
  spillRiskNotes.push(noPixelKeyingNote());

  return {
    ok: true,
    values: {
      recommendedKeyColor: `${keyHex} (${keyName})`,
      hsvRange,
      spillRiskNotes,
    },
  };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawMode = values["mode"];
  const mode = typeof rawMode === "string" ? rawMode.trim().toLowerCase() : "";
  if (mode !== "suggest" && mode !== "analyze") {
    return {
      ok: false,
      error: "Pick a mode: 'suggest' to get a screen-color recommendation, or 'analyze' to check one color.",
    };
  }
  return mode === "suggest" ? suggest(values) : analyze(values);
}
