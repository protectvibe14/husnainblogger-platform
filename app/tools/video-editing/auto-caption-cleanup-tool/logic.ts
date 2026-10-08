/**
 * Auto-Caption Cleanup Tool (tool-254) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same text + options always yield the
 * same cleanup.
 *
 * Honesty: PURE REGEX/STRING RULES. No model, no language understanding —
 * it must never claim AI. It applies mechanical fixes (filler-word removal,
 * sentence-casing, punctuation spacing, word-wrap) and logs every change.
 *
 * === FIXED BANKS / RULES ===
 * FILLERS (13 entries): um, uh, umm, uhh, uhm, hmm, hm, erm, er, ah,
 *   mmm, mm, ahem. Removed only as standalone tokens (optionally with
 *   trailing punctuation); "(um)" or "humming" are left alone.
 * SRT/VTT parsing: strips numeric indices, timestamp lines
 *   (00:00:00,000 --> 00:00:02,000), WEBVTT header, NOTE/STYLE/REGION
 *   blocks, and <cue> tags — keeps cue text only.
 * fixCaps: all-lowercase lines -> sentence case; mixed-case lines -> only
 *   the first letter is capitalized; ALL-CAPS lines (>=2 letters) are
 *   preserved intentionally (shouting emphasis) with no change logged.
 * fixPunct: removes space before , . ! ? ; :, collapses ! ? , repeats,
 *   collapses 4+ dots to "...", and adds a terminal period to the final
 *   line when missing.
 * Wrapping: greedy word wrap at maxCharsPerLine; a single word longer than
 *   the limit is hard-broken mid-word and logged.
 * Non-Latin-majority lines (<50% Latin letters) are left completely
 *   untouched by every rule (documented limitation).
 * Change log is capped at 200 entries (transformations still apply).
 */

interface Change {
  type: string;
  before: string;
  after: string;
}

const FILLERS = [
  "um", "uh", "umm", "uhh", "uhm", "hmm", "hm",
  "erm", "er", "ah", "mmm", "mm", "ahem",
];

const MAX_CHANGES = 200;
const DEFAULT_MAX_CHARS = 42;

const TIMESTAMP_RE = /^\d{2}:\d{2}(:\d{2})?[,.]\d{3}\s*-->/;

function extractLines(text: string): string[] {
  const raw = text.split(/\r?\n/);
  const looksTimed =
    raw.some((l) => TIMESTAMP_RE.test(l.trim())) || /^\s*WEBVTT/.test(text);
  if (!looksTimed) {
    return raw.map((l) => l.trim()).filter((l) => l.length > 0);
  }
  const out: string[] = [];
  for (const line of raw) {
    const t = line.trim();
    if (!t) continue;
    if (/^\d+$/.test(t)) continue; // SRT index
    if (TIMESTAMP_RE.test(t)) continue; // timestamp line
    if (/^WEBVTT/.test(t)) continue; // VTT header
    if (/^(NOTE|STYLE|REGION)([\s:]|$)/.test(t)) continue; // VTT blocks
    out.push(t.replace(/<[^>]+>/g, "").trim());
  }
  return out.filter((l) => l.length > 0);
}

/** True when at least half the letters are Latin (or there are no letters). */
function isLatinLine(line: string): boolean {
  const letters = line.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return true;
  const latin = letters.filter((c) => /[A-Za-z]/.test(c)).length;
  return latin / letters.length >= 0.5;
}

function isAllCaps(line: string): boolean {
  const letters = line.match(/[A-Za-z]/g) ?? [];
  return letters.length >= 2 && letters.every((c) => c === c.toUpperCase());
}

function sentenceCase(line: string): string {
  return line
    .toLowerCase()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_m, p1: string, p2: string) => p1 + p2.toUpperCase());
}

function fixPunctuation(line: string): string {
  let s = line.replace(/\s+([,.!?;:])/g, "$1");
  s = s.replace(/!{2,}/g, "!").replace(/\?{2,}/g, "?").replace(/,{2,}/g, ",");
  s = s.replace(/\.{4,}/g, "...");
  return s;
}

function wrapLine(line: string, max: number, pushChange: (c: Change) => void): string[] {
  const words = line.split(/\s+/).filter((w) => w.length > 0);
  const out: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur) {
      out.push(cur);
      cur = "";
    }
  };
  for (const w of words) {
    if (w.length > max) {
      flush();
      const chunks: string[] = [];
      let rest = w;
      while (rest.length > max) {
        chunks.push(rest.slice(0, max));
        rest = rest.slice(max);
      }
      chunks.push(rest);
      pushChange({ type: "hard-break", before: w, after: chunks.join("\n") });
      out.push(...chunks);
      continue;
    }
    const len = cur ? cur.length + 1 + w.length : w.length;
    if (len > max) {
      flush();
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  flush();
  if (out.length > 1) {
    pushChange({ type: "wrap", before: line, after: out.join("\n") });
  }
  return out;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawText = values["rawCaptionText"];
  const rawCaptionText = typeof rawText === "string" ? rawText : "";
  if (rawCaptionText.trim().length === 0) {
    return { ok: false, error: "Paste your caption text (plain text, SRT, or VTT) first." };
  }

  const boolOpt = (v: unknown, dflt: boolean): boolean =>
    v === undefined || v === null ? dflt : v === true || v === "true";
  const fixCaps = boolOpt(values["fixCaps"], true);
  const fixPunct = boolOpt(values["fixPunct"], true);
  const removeFillers = boolOpt(values["removeFillers"], true);

  const rawMax = values["maxCharsPerLine"];
  const maxCharsPerLine =
    rawMax === undefined || rawMax === null || rawMax === ""
      ? DEFAULT_MAX_CHARS
      : Number(rawMax);
  if (!Number.isFinite(maxCharsPerLine) || maxCharsPerLine < 10 || maxCharsPerLine > 80) {
    return { ok: false, error: "Max chars per line must be a number between 10 and 80." };
  }

  const changes: Change[] = [];
  const pushChange = (c: Change): void => {
    if (changes.length < MAX_CHANGES) changes.push(c);
  };

  let fillerCountRemoved = 0;
  const processed: string[] = [];

  for (const original of extractLines(rawCaptionText)) {
    let line = original;
    const latin = isLatinLine(line);

    if (latin && removeFillers) {
      const tokens = line.split(/(\s+)/);
      const kept: string[] = [];
      for (const tok of tokens) {
        if (/^\s*$/.test(tok)) {
          kept.push(tok);
          continue;
        }
        const m = tok.match(/^([A-Za-z]+)([,.!?;:]*)$/);
        if (m && FILLERS.includes(m[1].toLowerCase())) {
          pushChange({ type: "filler", before: tok, after: "" });
          fillerCountRemoved++;
          continue;
        }
        kept.push(tok);
      }
      const joined = kept.join("").replace(/\s{2,}/g, " ").trim();
      line = joined;
    }

    if (latin && fixCaps && line && !isAllCaps(line)) {
      let fixed: string;
      if (/[a-z]/.test(line) && line === line.toLowerCase()) {
        fixed = sentenceCase(line);
      } else if (/^[a-z]/.test(line)) {
        fixed = line[0].toUpperCase() + line.slice(1);
      } else {
        fixed = line;
      }
      if (fixed !== line) {
        pushChange({ type: "caps", before: line, after: fixed });
        line = fixed;
      }
    }

    if (latin && fixPunct && line) {
      const fixed = fixPunctuation(line);
      if (fixed !== line) {
        pushChange({ type: "punct", before: line, after: fixed });
        line = fixed;
      }
    }

    if (!line) continue;
    if (latin) {
      processed.push(...wrapLine(line, maxCharsPerLine, pushChange));
    } else {
      processed.push(line); // non-Latin lines: untouched by every rule
    }
  }

  // Terminal period on the final non-empty line.
  if (fixPunct) {
    for (let i = processed.length - 1; i >= 0; i--) {
      if (processed[i].trim()) {
        if (/[A-Za-z0-9]$/.test(processed[i])) {
          const before = processed[i];
          processed[i] = `${before}.`;
          pushChange({ type: "punct", before, after: processed[i] });
        }
        break;
      }
    }
  }

  const cleanedText = processed.filter((l) => l.trim().length > 0).join("\n");

  return {
    ok: true,
    values: {
      cleanedText,
      changes,
      fillerCountRemoved,
    },
  };
}
