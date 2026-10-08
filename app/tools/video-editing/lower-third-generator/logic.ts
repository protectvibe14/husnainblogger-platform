/**
 * Lower Third Generator (tool-260) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: the same inputs always produce the
 * same snippets.
 *
 * Honesty: this is a TEMPLATE ENGINE, not a renderer. It emits copy-ready
 * HTML + CSS from 5 fixed preset styles — no AI, no rendering, no preview
 * here (any visual preview happens in the platform UI). The safe-area and
 * read-time checks are arithmetic estimates, labeled as such.
 *
 * === DOCUMENTED BANKS / RULES ===
 *  STYLES (5 fixed presets, ids published below):
 *    modern-bar, classic-slant, minimal-line, bold-block, mono-card
 *  Font auto-shrink: base 44px; when the name exceeds 22 characters the
 *  size scales to 44 * 22 / len (floored, min 20px) so it stays on one
 *  line — reported in the safe-area note.
 *  Read-time check: viewers read ~20 chars/second (CPS readability rate);
 *  if durationSec < (name+title chars) / 20 the check WARNS that the
 *  graphic may disappear before it is read.
 *  Safe width: estimated text width (0.55 x font-size per character) must
 *  fit 90% of a 1920px canvas (action-safe estimate) — always an estimate,
 *  never a measured render.
 *  Timing: 500ms in, hold = duration - 1000ms, 500ms out (duration 2-10s).
 */

export interface TimingPhase {
  phase: string;
  ms: number;
}

const BASE_FONT_PX = 44;
const SHRINK_AFTER_CHARS = 22;
const MIN_FONT_PX = 20;
const IN_MS = 500;
const OUT_MS = 500;
const CANVAS_WIDTH_PX = 1920;
const SAFE_WIDTH_PX = CANVAS_WIDTH_PX * 0.9;
const CHAR_WIDTH_FACTOR = 0.55;
const READ_CPS = 20;

const STYLES: Record<string, { label: string }> = {
  "modern-bar": { label: "Modern Bar" },
  "classic-slant": { label: "Classic Slant" },
  "minimal-line": { label: "Minimal Line" },
  "bold-block": { label: "Bold Block" },
  "mono-card": { label: "Mono Card" },
};

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function fontSizeFor(nameLen: number): { px: number; shrunk: boolean } {
  if (nameLen <= SHRINK_AFTER_CHARS) return { px: BASE_FONT_PX, shrunk: false };
  const px = Math.max(MIN_FONT_PX, Math.floor((BASE_FONT_PX * SHRINK_AFTER_CHARS) / nameLen));
  return { px, shrunk: true };
}

function accentOf(color: string): string {
  return color.toLowerCase();
}

function cssFor(style: string, accent: string, fontPx: number, inMs: number, holdMs: number, outMs: number): string {
  const base = [
    `.hb-lower-third {`,
    `  font-family: Arial, Helvetica, sans-serif;`,
    `  color: #ffffff;`,
    `  animation: hb-lt-in ${inMs}ms ease-out both, hb-lt-out ${outMs}ms ease-in ${inMs + holdMs}ms both;`,
    `}`,
    `.hb-lt-name { font-size: ${fontPx}px; font-weight: 700; margin: 0; line-height: 1.2; }`,
    `.hb-lt-title { font-size: ${Math.round(fontPx * 0.5)}px; font-weight: 400; margin: 4px 0 0; opacity: 0.9; }`,
    `@keyframes hb-lt-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`,
    `@keyframes hb-lt-out { from { opacity: 1; } to { opacity: 0; } }`,
  ];
  const themed: Record<string, string[]> = {
    "modern-bar": [
      `.hb-lower-third {`,
      `  position: absolute; left: 64px; bottom: 64px;`,
      `  background: rgba(0, 0, 0, 0.65);`,
      `  border-left: 8px solid ${accent};`,
      `  padding: 16px 28px 16px 24px;`,
      `  border-radius: 0 6px 6px 0;`,
      `}`,
    ],
    "classic-slant": [
      `.hb-lower-third {`,
      `  position: absolute; left: 80px; bottom: 72px;`,
      `  background: ${accent};`,
      `  padding: 14px 40px 14px 28px;`,
      `  transform: skewX(-12deg);`,
      `}`,
      `.hb-lower-third > div { transform: skewX(12deg); }`,
    ],
    "minimal-line": [
      `.hb-lower-third {`,
      `  position: absolute; left: 64px; bottom: 80px;`,
      `  background: transparent;`,
      `  padding: 0 0 12px 0;`,
      `  border-bottom: 4px solid ${accent};`,
      `}`,
    ],
    "bold-block": [
      `.hb-lower-third {`,
      `  position: absolute; left: 56px; bottom: 64px;`,
      `  background: ${accent};`,
      `  padding: 18px 36px;`,
      `  border-radius: 4px;`,
      `  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);`,
      `}`,
    ],
    "mono-card": [
      `.hb-lower-third {`,
      `  position: absolute; left: 50%; bottom: 56px; transform: translateX(-50%);`,
      `  background: #111111;`,
      `  border: 2px solid ${accent};`,
      `  padding: 14px 32px;`,
      `  border-radius: 8px;`,
      `  text-align: center;`,
      `  animation-name: hb-lt-in-center, hb-lt-out;`,
      `}`,
      `@keyframes hb-lt-in-center { from { opacity: 0; transform: translateX(-50%) translateY(24px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`,
    ],
  };
  return [...base, ...themed[style]].join("\n");
}

function htmlFor(style: string, name: string, title: string): string {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);
  const inner =
    title.length > 0
      ? `    <p class="hb-lt-name">${safeName}</p>\n    <p class="hb-lt-title">${safeTitle}</p>`
      : `    <p class="hb-lt-name">${safeName}</p>`;
  const innerDiv = style === "classic-slant" ? `<div>\n${inner}\n  </div>` : inner;
  return `<div class="hb-lower-third">\n  ${innerDiv}\n</div>`;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const name = typeof values["name"] === "string" ? values["name"].trim() : "";
  if (name === "") {
    return { ok: false, error: "Enter the name for the lower third." };
  }
  if (name.length > 60) {
    return { ok: false, error: "Name must be 60 characters or fewer." };
  }
  const title = typeof values["title"] === "string" ? values["title"].trim() : "";
  if (title.length > 60) {
    return { ok: false, error: "Title must be 60 characters or fewer (it may be left empty)." };
  }

  const style = typeof values["style"] === "string" ? values["style"] : "";
  if (!(style in STYLES)) {
    return {
      ok: false,
      error: `Pick a style: ${Object.keys(STYLES).join(", ")}.`,
    };
  }

  const brandColor = typeof values["brandColor"] === "string" ? values["brandColor"].trim() : "";
  if (!HEX_RE.test(brandColor)) {
    return {
      ok: false,
      error: 'Brand color must be a hex code like #ff3366 or #f36.',
    };
  }

  const durationSec = toNumber(values["durationSec"]);
  if (durationSec === null || durationSec < 2 || durationSec > 10) {
    return {
      ok: false,
      error: "Duration must be between 2 and 10 seconds.",
    };
  }

  const accent = accentOf(brandColor);
  const { px: fontPx, shrunk } = fontSizeFor(name.length);
  const totalMs = Math.round(durationSec * 1000);
  const holdMs = totalMs - IN_MS - OUT_MS;

  const cssSnippet = cssFor(style, accent, fontPx, IN_MS, holdMs, OUT_MS);
  const htmlSnippet = htmlFor(style, name, title);

  const timing: TimingPhase[] = [
    { phase: "Fade in", ms: IN_MS },
    { phase: "Hold", ms: holdMs },
    { phase: "Fade out", ms: OUT_MS },
  ];

  // Safe-area estimate: approx text width must fit 90% of a 1920px canvas.
  const chars = name.length + title.length;
  const estWidthPx = Math.round(chars * fontPx * CHAR_WIDTH_FACTOR);
  const checks: string[] = [];
  if (estWidthPx <= SAFE_WIDTH_PX) {
    checks.push(
      `Width OK (estimate): text is ~${estWidthPx}px wide at ${fontPx}px, within the 90% action-safe width (~${Math.round(SAFE_WIDTH_PX)}px of 1920px).`,
    );
  } else {
    checks.push(
      `Width warning (estimate): text is ~${estWidthPx}px wide, over the 90% action-safe width (~${Math.round(SAFE_WIDTH_PX)}px of 1920px) — shorten the text.`,
    );
  }
  if (shrunk) {
    checks.push(
      `Auto-shrink: name is ${name.length} chars, so the font was reduced to ${fontPx}px to stay on one line.`,
    );
  }
  const minReadSec = chars / READ_CPS;
  if (durationSec < minReadSec) {
    checks.push(
      `Read-time warning: ${chars} chars need ~${minReadSec.toFixed(1)}s to read at ${READ_CPS} chars/sec, but the duration is ${durationSec}s — lengthen the hold.`,
    );
  } else {
    checks.push(
      `Read time OK: ${chars} chars need ~${minReadSec.toFixed(1)}s at ${READ_CPS} chars/sec; the duration is ${durationSec}s.`,
    );
  }
  const safeAreaCheck = checks.join(" ");

  return {
    ok: true,
    values: { cssSnippet, htmlSnippet, timing, safeAreaCheck },
  };
}
