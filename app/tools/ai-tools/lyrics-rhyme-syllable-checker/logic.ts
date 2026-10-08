/**
 * Lyrics Rhyme & Syllable Checker — pure logic (tool-536), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY CONTRACT: everything here is a labeled heuristic.
 *  - Syllables: vowel-group counting (an ESTIMATE — English spelling is
 *    irregular; real scansion needs a pronunciation dictionary).
 *  - Rhyme: "ending-phoneme approximation" = the final vowel group through
 *    the end of the word. Near-rhymes and multisyllabic rhymes are NOT
 *    reliably detected. Two lines "rhyme" when their approximations match.
 *  - Scheme letters (AABB…) are assigned in order of first appearance.
 */

export interface LyricLine {
  /** 1-based line number. */
  line: number;
  /** The raw line text. */
  text: string;
  /** Syllable estimate (vowel-group heuristic). */
  syllables: number;
  /** Rhyme key: final vowel group -> end of the line's last word. */
  rhymeKey: string;
  /** Scheme letter, e.g. "A". "-" for blank lines. */
  scheme: string;
}

export interface LyricsResult {
  lines: LyricLine[];
  /** Space-joined scheme, e.g. "A A B B". */
  scheme: string;
  /** Scheme letter -> 1-based line numbers sharing it. */
  rhymeGroups: Record<string, number[]>;
  minSyllables: number;
  maxSyllables: number;
  avgSyllables: number;
}

export const MAX_LINES = 200;
export const MAX_LINE_CHARS = 500;

export const SYLLABLE_METHOD_NOTE =
  "Syllable counts are estimates from a vowel-group heuristic — English spelling is irregular, so verify tricky lines by ear.";

export const RHYME_METHOD_NOTE =
  "Rhyme detection is an approximation: it compares the final vowel group through the end of each line's last word. Near-rhymes, slant rhymes and multi-word rhymes may be missed or over-matched.";

/**
 * Vowel-group syllable estimate. Rules: count groups of [aeiouy]; subtract
 * one for a trailing silent "e"; "-es"/"-ed" endings usually add nothing
 * beyond the base word's groups (kept simple, labeled estimate).
 */
export function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z']/g, "").replace(/'/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let count = groups.length;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

/** Syllables for a whole line = sum of word estimates. */
export function lineSyllables(line: string): number {
  const words = line.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (words.length === 0) return 0;
  return words.reduce((sum, w) => sum + estimateSyllables(w), 0);
}

/**
 * Rhyme key: the final vowel group through the end of the word.
 * "fire" -> "ire", "desire" -> "ire", "cat" -> "at", "running" -> "ing".
 * Trailing plural/past inflections are normalized so "dreams"/"dream"
 * and "glows"/"glow" still match (documented approximation).
 */
export function rhymeKey(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return "";
  // Normalize common inflections for matching purposes.
  if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("es") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("s") && w.length > 3) w = w.slice(0, -1);
  // Silent final "e": the rhyme starts at the vowel before it ("fire" -> "ire").
  const silentE = /([aeiouy][^aeiouy]*)e$/.exec(w);
  const core = silentE ? w.slice(0, w.length - 1) : w;
  const m = /[aeiouy]+[^aeiouy]*$/.exec(core);
  const tail = m ? m[0] : core;
  return silentE ? tail + "e" : tail;
}

/** Last word of a line (letters only). */
export function lastWord(line: string): string {
  const words = line.match(/[a-zA-Z']+/g) ?? [];
  return words.length > 0 ? words[words.length - 1] : "";
}

/**
 * Analyze lyrics: per-line syllables, rhyme keys, scheme letters.
 * Deterministic: same input -> same output.
 */
export function analyzeLyrics(rawLines: string[]): LyricsResult {
  const lines: LyricLine[] = rawLines.map((text, i) => ({
    line: i + 1,
    text,
    syllables: lineSyllables(text),
    rhymeKey: rhymeKey(lastWord(text)),
    scheme: "-",
  }));

  const keyToLetter = new Map<string, string>();
  let nextCode = "A".charCodeAt(0);
  const letterFor = (key: string): string => {
    if (key === "") return "-";
    const existing = keyToLetter.get(key);
    if (existing) return existing;
    const letter = String.fromCharCode(nextCode);
    nextCode += 1;
    keyToLetter.set(key, letter);
    return letter;
  };

  for (const l of lines) l.scheme = letterFor(l.rhymeKey);

  const scheme = lines.map((l) => l.scheme).join(" ");
  const rhymeGroups: Record<string, number[]> = {};
  for (const l of lines) {
    if (l.scheme === "-") continue;
    (rhymeGroups[l.scheme] ??= []).push(l.line);
  }

  const counts = lines.filter((l) => l.text.trim().length > 0).map((l) => l.syllables);
  const minSyllables = counts.length > 0 ? Math.min(...counts) : 0;
  const maxSyllables = counts.length > 0 ? Math.max(...counts) : 0;
  const avgSyllables =
    counts.length > 0
      ? Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 10) / 10
      : 0;

  return { lines, scheme, rhymeGroups, minSyllables, maxSyllables, avgSyllables };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.lyrics: string, required, one line per lyric line, 1..MAX_LINES lines.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["lyrics"];
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please paste your lyrics, one line per line." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Lyrics must be text." };
  }
  const rawLines = raw.split(/\r?\n/);
  if (rawLines.length > MAX_LINES) {
    return {
      ok: false,
      error: `Keep it to ${MAX_LINES} lines or fewer.`,
    };
  }
  if (rawLines.some((l) => l.length > MAX_LINE_CHARS)) {
    return {
      ok: false,
      error: `Each line must be ${MAX_LINE_CHARS} characters or fewer.`,
    };
  }
  if (rawLines.every((l) => l.trim().length === 0)) {
    return { ok: false, error: "Please paste your lyrics, one line per line." };
  }

  const result = analyzeLyrics(rawLines);
  return {
    ok: true,
    values: {
      lines: result.lines,
      scheme: result.scheme,
      rhymeGroups: result.rhymeGroups,
      minSyllables: result.minSyllables,
      maxSyllables: result.maxSyllables,
      avgSyllables: result.avgSyllables,
      syllableNote: SYLLABLE_METHOD_NOTE,
      rhymeNote: RHYME_METHOD_NOTE,
    },
  };
}
