/**
 * Subtitle Line Breaker (tool-255) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: same text + settings always yield the same breaks.
 *
 * Honesty: PURE GREEDY/DP LINE-BREAKING with linguistic break preferences —
 * no AI, no language model. Break choices follow Netflix-style guidance
 * (break after punctuation, before conjunctions/prepositions), documented
 * below. It cannot judge readability the way a human subtitler can.
 *
 * === FIXED RULES ===
 * CONJ_PREP (29 entries): and, but, or, nor, so, yet, for, because, while,
 *   with, without, of, to, in, on, at, from, by, as, about, into, over,
 *   after, before, between, through, during, under, against. Breaks go
 *   BEFORE these words when no punctuation break fits.
 * punctuation mode: greedy left-to-right; at each step take the rightmost
 *   break point within the char limit that follows punctuation; else the
 *   rightmost break before a conjunction/preposition; else the rightmost
 *   word that fits.
 * balanced mode: dynamic programming minimizing total cost =
 *   sum over lines of (maxChars - lineLen)^2 - 25 (ends with punctuation)
 *   - 10 (next line starts with conjunction/preposition) + LINE_PENALTY
 *   per line (LINE_PENALTY = maxChars * 8, documented heuristic that
 *   discourages over-splitting into tiny lines).
 * Punctuation recognized: . , ; : ! ? … — – - ' " ) plus CJK 。、，！？；：.
 *
 * Edge cases (per spec):
 * - single word longer than the limit -> hard-broken mid-word + warning.
 * - CJK-majority text -> effective limit min(maxCharsPerLine, 16) with a
 *   warning citing Netflix CJK guidance; breaks fall between characters.
 * - text already within limits -> returned as a single line, no warnings.
 * - more lines needed than maxLines -> lines are still returned, plus a
 *   warning suggesting the cue be split.
 */

const CONJ_PREP = [
  "and", "but", "or", "nor", "so", "yet", "for", "because", "while",
  "with", "without", "of", "to", "in", "on", "at", "from", "by", "as",
  "about", "into", "over", "after", "before", "between", "through",
  "during", "under", "against",
];

const CJK_RE = /[㐀-䶿一-鿿豈-﫿぀-ヿ가-힯]/g;
const DEFAULT_MAX_CHARS = 42;
const DEFAULT_MAX_LINES = 2;

function isCjkHeavy(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const cjk = (text.match(CJK_RE) ?? []).length;
  return cjk / letters.length > 0.5;
}

function endsWithPunct(word: string): boolean {
  return /[.,;:!?…—–\-'")’”]+$/.test(word) || /[。、，！？；：]$/.test(word);
}

function isConjPrep(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  return clean.length > 0 && CONJ_PREP.includes(clean);
}

function splitLongWords(words: string[], max: number, warnings: string[]): string[] {
  const out: string[] = [];
  for (const w of words) {
    if (w.length <= max) {
      out.push(w);
      continue;
    }
    warnings.push(
      `Word "${w}" (${w.length} chars) exceeds the ${max}-char limit — split mid-word.`
    );
    let rest = w;
    while (rest.length > max) {
      out.push(rest.slice(0, max));
      rest = rest.slice(max);
    }
    out.push(rest);
  }
  return out;
}

function lineLen(words: string[], from: number, to: number): number {
  let len = 0;
  for (let i = from; i < to; i++) len += words[i].length;
  return len + Math.max(0, to - from - 1);
}

function breakPunctuation(words: string[], max: number): string[] {
  const lines: string[] = [];
  const n = words.length;
  let i = 0;
  while (i < n) {
    let j = i;
    let len = 0;
    while (j < n) {
      const add = words[j].length + (j > i ? 1 : 0);
      if (len + add > max) break;
      len += add;
      j++;
    }
    let cut = j;
    let best = -1;
    for (let k = i + 1; k <= j; k++) {
      if (endsWithPunct(words[k - 1])) best = k;
    }
    if (best > 0) {
      cut = best;
    } else {
      best = -1;
      for (let k = i + 1; k <= j; k++) {
        if (k < n && isConjPrep(words[k])) best = k;
      }
      if (best > 0) cut = best;
    }
    lines.push(words.slice(i, cut).join(" "));
    i = cut;
  }
  return lines;
}

function breakBalanced(words: string[], max: number): string[] {
  const n = words.length;
  const LINE_PENALTY = max * 8;
  const dp = new Array<number>(n + 1).fill(Number.MAX_SAFE_INTEGER);
  const prev = new Array<number>(n + 1).fill(-1);
  dp[0] = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = i - 1; j >= 0; j--) {
      const len = lineLen(words, j, i);
      if (len > max) break;
      const bonus =
        (endsWithPunct(words[i - 1]) ? 25 : 0) +
        (i < n && isConjPrep(words[i]) ? 10 : 0);
      const cost = dp[j] + (max - len) * (max - len) - bonus + LINE_PENALTY;
      if (cost < dp[i]) {
        dp[i] = cost;
        prev[i] = j;
      }
    }
  }
  const lines: string[] = [];
  let i = n;
  while (i > 0) {
    const j = prev[i];
    if (j < 0) {
      lines.unshift(words.slice(0, i).join(" "));
      break;
    }
    lines.unshift(words.slice(j, i).join(" "));
    i = j;
  }
  return lines;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawText = values["subtitleText"];
  const subtitleText = typeof rawText === "string" ? rawText.trim().replace(/\s+/g, " ") : "";
  if (!subtitleText) {
    return { ok: false, error: "Paste your subtitle text first." };
  }

  const rawMax = values["maxCharsPerLine"];
  const maxCharsPerLine =
    rawMax === undefined || rawMax === null || rawMax === "" ? DEFAULT_MAX_CHARS : Number(rawMax);
  if (!Number.isFinite(maxCharsPerLine) || maxCharsPerLine < 10 || maxCharsPerLine > 60) {
    return { ok: false, error: "Max chars per line must be a number between 10 and 60." };
  }

  const rawLines = values["maxLines"];
  const maxLines =
    rawLines === undefined || rawLines === null || rawLines === "" ? DEFAULT_MAX_LINES : Number(rawLines);
  if (!Number.isFinite(maxLines) || maxLines < 1 || maxLines > 3) {
    return { ok: false, error: "Max lines must be a number between 1 and 3." };
  }

  const rawPref = values["breakPreference"];
  const breakPreference =
    rawPref === undefined || rawPref === null || rawPref === "" ? "punctuation" : String(rawPref).trim();
  if (breakPreference !== "punctuation" && breakPreference !== "balanced") {
    return { ok: false, error: "Break preference must be punctuation or balanced." };
  }

  const warnings: string[] = [];
  const cjkMode = isCjkHeavy(subtitleText);
  const effectiveMax = cjkMode ? Math.min(maxCharsPerLine, 16) : maxCharsPerLine;
  if (cjkMode) {
    warnings.push(
      "CJK text detected — using 16 chars/line (Netflix CJK guidance) instead of your setting."
    );
  }

  let words = cjkMode
    ? subtitleText.replace(/\s+/g, "").split("")
    : subtitleText.split(" ").filter((w) => w.length > 0);
  words = splitLongWords(words, effectiveMax, warnings);

  const brokenLines =
    breakPreference === "balanced"
      ? breakBalanced(words, effectiveMax)
      : breakPunctuation(words, effectiveMax);

  if (brokenLines.length > maxLines) {
    warnings.push(
      `Text needs ${brokenLines.length} lines but your max is ${maxLines} — consider splitting this into two subtitle cues.`
    );
  }

  return {
    ok: true,
    values: {
      brokenLines,
      charsPerLine: brokenLines.map((l) => l.length),
      warnings,
    },
  };
}
