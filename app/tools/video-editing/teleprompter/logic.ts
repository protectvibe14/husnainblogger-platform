/**
 * Teleprompter (tool-252) — pure logic, zero imports, zero network, zero DOM.
 * Deterministic: same script + settings always yield the same timing plan.
 *
 * Honesty: this is TIMING MATH only (engine "timing-math", formula F-WPM-01).
 * The scrolling viewport itself is UI (MA1 scaffold); this logic only
 * supplies durations and the px/sec scroll rate. Nothing here reads your
 * script aloud or verifies actual delivery speed — test with a real read.
 *
 * === FORMULAS (all documented assumptions) ===
 * wordCount = whitespace-separated tokens (Latin) or CJK chars + Latin tokens.
 * CJK mode: >50% of letters are CJK (Hiragana/Katakana/Han/Hangul ranges).
 *   Reading speed in CJK mode = wpm * 5 chars/min (documented estimate:
 *   ~5 CJK characters carry about one English word of reading time).
 * estimatedReadTimeSec = wordCount / wpm * 60  (CJK: cjkChars / (wpm*5) * 60).
 * scrollDurationSec = round1(readTimeSec + 3) — 3s lead-in buffer, documented.
 * scrollPlan px/sec: charsPerLine = max(12, floor(800 / (fontSize * 0.55)))
 *   (assumes an 800px viewport and 0.55x average glyph width); lines =
 *   ceil(charsNoSpace / charsPerLine); totalPx = lines * fontSize * 1.5
 *   (1.5x line height); pxPerSec = round1(totalPx / scrollDurationSec).
 * wpm clamp: [40, 300] — out-of-range values are clamped WITH a warning note.
 */

const DEFAULT_WPM = 140;
const MIN_WPM = 40;
const MAX_WPM = 300;
const MAX_SCRIPT_CHARS = 20000;
const MIN_FONT_PX = 12;
const MAX_FONT_PX = 120;
const LEAD_IN_SEC = 3;
const CJK_RE = /[㐀-䶿一-鿿豈-﫿぀-ヿ가-힯]/g;

function isCjkMode(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const cjk = (text.match(CJK_RE) ?? []).length;
  return cjk / letters.length > 0.5;
}

function countWords(text: string, cjkMode: boolean): { words: number; cjkChars: number } {
  const cjkChars = (text.match(CJK_RE) ?? []).length;
  if (!cjkMode) {
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    return { words, cjkChars };
  }
  const stripped = text.replace(CJK_RE, " ");
  const latinWords = stripped.split(/\s+/).filter((w) => w.length > 0).length;
  return { words: cjkChars + latinWords, cjkChars };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawScript = values["scriptText"];
  const script = typeof rawScript === "string" ? rawScript : "";
  if (script.trim().length === 0) {
    return { ok: false, error: "Paste your script text first — the teleprompter needs words to time." };
  }
  if (script.length > MAX_SCRIPT_CHARS) {
    return {
      ok: false,
      error: `Scripts over ${MAX_SCRIPT_CHARS} characters are too long — split the script into sections first.`,
    };
  }

  const rawWpm = values["wordsPerMinute"];
  let wpm = DEFAULT_WPM;
  let wpmNote = "";
  if (rawWpm !== undefined && rawWpm !== null && rawWpm !== "") {
    const parsed = typeof rawWpm === "number" ? rawWpm : Number(rawWpm);
    if (!Number.isFinite(parsed)) {
      return { ok: false, error: "Words per minute must be a number between 40 and 300." };
    }
    if (parsed < MIN_WPM) {
      wpm = MIN_WPM;
      wpmNote = `WPM ${parsed} is below the readable range — clamped to ${MIN_WPM}.`;
    } else if (parsed > MAX_WPM) {
      wpm = MAX_WPM;
      wpmNote = `WPM ${parsed} is above the readable range — clamped to ${MAX_WPM}.`;
    } else {
      wpm = parsed;
    }
  }

  const rawFont = values["fontSize"];
  const fontSize = typeof rawFont === "number" ? rawFont : Number(rawFont);
  if (!Number.isFinite(fontSize) || fontSize < MIN_FONT_PX || fontSize > MAX_FONT_PX) {
    return {
      ok: false,
      error: `Font size must be a number between ${MIN_FONT_PX} and ${MAX_FONT_PX} px.`,
    };
  }

  const rawMirror = values["mirrorMode"];
  const mirrorMode = rawMirror === true || rawMirror === "true";

  const cjkMode = isCjkMode(script);
  const { words: wordCount, cjkChars } = countWords(script, cjkMode);

  const readTimeSec =
    cjkMode && cjkChars > 0
      ? (cjkChars / (wpm * 5)) * 60
      : (wordCount / wpm) * 60;
  const estimatedReadTimeSec = round1(readTimeSec);
  const scrollDurationSec = round1(readTimeSec + LEAD_IN_SEC);

  // Scroll-rate estimate from documented viewport/typography assumptions.
  const charsNoSpace = script.replace(/\s+/g, "").length;
  const charsPerLine = Math.max(12, Math.floor(800 / (fontSize * 0.55)));
  const lines = Math.max(1, Math.ceil(charsNoSpace / charsPerLine));
  const totalPx = lines * fontSize * 1.5;
  const pxPerSec = round1(totalPx / scrollDurationSec);

  const notes: string[] = [];
  if (wpmNote) notes.push(wpmNote);
  if (cjkMode) {
    notes.push(
      "CJK text detected — timing uses characters-per-minute mode (wpm x 5 chars/min estimate), since CJK scripts do not separate words with spaces."
    );
  }
  if (mirrorMode) notes.push("Mirror mode ON — remember to flip the display with a beamsplitter or mirrored monitor.");
  if (scrollDurationSec > 600) {
    notes.push("Script runs over 10 minutes — consider splitting it into sections to avoid scroll drift.");
  }
  notes.push("Estimates only — do a live read-through to calibrate your actual pace before recording.");

  const scrollPlan =
    `Scroll at ~${pxPerSec} px/sec for ${scrollDurationSec}s — about ${lines} lines at ${fontSize}px font ` +
    `(1.5x line height, ~${charsPerLine} chars/line on an 800px viewport), ${LEAD_IN_SEC}s lead-in included.` +
    (notes.length > 0 ? ` Notes: ${notes.join(" ")}` : "");

  return {
    ok: true,
    values: {
      scrollDurationSec,
      estimatedReadTimeSec,
      wordCount,
      scrollPlan,
    },
  };
}
