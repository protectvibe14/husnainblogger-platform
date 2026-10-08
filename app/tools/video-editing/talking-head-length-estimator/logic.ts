/**
 * Talking-Head Length Estimator (tool-275) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: the same script and settings
 * always yield the same estimate.
 *
 * Honesty: this is an ESTIMATE by construction — speaking speed varies per
 * person, so the tool always returns a RANGE, never a single exact number.
 * Rates are labeled estimates.
 *
 * === PUBLISHED FORMULA (F-WPM-01) ===
 *  units   = word count (Latin scripts) or CJK character count
 *  rate    = wpm for words (default 140, allowed 60-250);
 *            300 chars/min (estimate) for CJK scripts
 *  baseSec = units / rate * 60
 *  estimatedSec = ceil(baseSec * (1 + pauseAllowancePct / 100))
 *  rangeLowSec  = ceil(estimatedSec * 0.8)
 *  rangeHighSec = ceil(estimatedSec * 1.2)
 * All results round UP to whole seconds (very short scripts never report
 * fractional seconds). pauseAllowancePct defaults to 10 (allowed 0-50).
 *
 * CJK detection: if 50%+ of non-space characters are Han/Hiragana/Katakana/
 * Hangul, the script is char-counted with a note — word counting would be
 * meaningless.
 */

const DEFAULT_WPM = 140;
const MIN_WPM = 60;
const MAX_WPM = 250;
const DEFAULT_PAUSE_PCT = 10;
const MAX_PAUSE_PCT = 50;
const CJK_RATE_CPM = 300; // chars per minute — estimate, labeled as such
const MAX_SCRIPT_CHARS = 100_000;

function isCjkChar(ch: string): boolean {
  return /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u.test(ch);
}

function toNumber(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function fmtDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawScript = values["scriptText"];
  const script = typeof rawScript === "string" ? rawScript.trim() : "";
  if (script.length === 0) {
    return { ok: false, error: "Paste your script text — it cannot be empty." };
  }
  if (script.length > MAX_SCRIPT_CHARS) {
    return { ok: false, error: "Script is too long (max 100,000 characters) — split it into parts." };
  }

  let wpm: number;
  const rawWpm = values["wpm"];
  if (rawWpm === undefined || rawWpm === null || (typeof rawWpm === "string" && rawWpm.trim() === "")) {
    wpm = DEFAULT_WPM;
  } else {
    const n = toNumber(rawWpm);
    if (n === null) {
      return { ok: false, error: `Speaking rate must be a number between ${MIN_WPM} and ${MAX_WPM} words per minute (default ${DEFAULT_WPM}).` };
    }
    wpm = n;
  }
  if (wpm < MIN_WPM || wpm > MAX_WPM) {
    return { ok: false, error: `Speaking rate must be between ${MIN_WPM} and ${MAX_WPM} words per minute (default ${DEFAULT_WPM}).` };
  }

  let pausePct: number;
  const rawPause = values["pauseAllowancePct"];
  if (rawPause === undefined || rawPause === null || (typeof rawPause === "string" && rawPause.trim() === "")) {
    pausePct = DEFAULT_PAUSE_PCT;
  } else {
    const n = toNumber(rawPause);
    if (n === null) {
      return { ok: false, error: `Pause allowance must be a number between 0 and ${MAX_PAUSE_PCT}% (default ${DEFAULT_PAUSE_PCT}%).` };
    }
    pausePct = n;
  }
  if (pausePct < 0 || pausePct > MAX_PAUSE_PCT) {
    return { ok: false, error: `Pause allowance must be between 0 and ${MAX_PAUSE_PCT}% (default ${DEFAULT_PAUSE_PCT}%).` };
  }

  // CJK detection over non-space characters.
  const chars = [...script].filter((c) => !/\s/.test(c));
  const cjkCount = chars.filter(isCjkChar).length;
  const isCjk = chars.length > 0 && cjkCount / chars.length >= 0.5;

  let units: number;
  let rate: number;
  let basis: string;
  if (isCjk) {
    units = cjkCount;
    rate = CJK_RATE_CPM;
    basis = "CJK characters";
  } else {
    units = script.split(/\s+/).filter((w) => w.length > 0).length;
    rate = wpm;
    basis = "words";
  }
  if (units === 0) {
    return { ok: false, error: "Paste your script text — it cannot be empty." };
  }

  const baseSec = (units / rate) * 60;
  const estimatedSec = Math.ceil(baseSec * (1 + pausePct / 100));
  const rangeLowSec = Math.ceil(estimatedSec * 0.8);
  const rangeHighSec = Math.ceil(estimatedSec * 1.2);

  let note =
    `Estimate from ${units.toLocaleString("en-US")} ${basis} at ${rate} ${isCjk ? "chars" : "words"}/min ` +
    `(+${pausePct}% pause allowance). Speaking speed is personal — plan around the ${fmtDuration(rangeLowSec)}-${fmtDuration(rangeHighSec)} range, not the point estimate.`;
  if (isCjk) {
    note += ` CJK script detected: char-based estimate at ${CJK_RATE_CPM} chars/min (estimate).`;
  }

  return {
    ok: true,
    values: {
      estimatedSec,
      wordCount: units,
      rangeLowSec,
      rangeHighSec,
      estimateBasis: basis,
      note,
    },
  };
}
