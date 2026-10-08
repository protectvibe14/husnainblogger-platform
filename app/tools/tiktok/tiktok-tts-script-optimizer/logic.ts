/**
 * TikTok TTS Script Optimizer — pure logic (tool-176).
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * TEXT-ANALYSIS ENGINE (fully client-side, feasible per spec honesty note):
 *   - Expands abbreviations from a FIXED map (ABBREVIATION_MAP, 47 entries)
 *     so TikTok's text-to-speech voices read the full words instead of
 *     letter soup.
 *   - Spells out numbers with fixed English rules: integers (0–999999),
 *     ordinals (1st → "first"), decimals (3.5 → "three point five"),
 *     percents (25% → "twenty-five percent"), currency ($50 → "fifty
 *     dollars"), years 1000–2099 ("2026" → "twenty twenty-six").
 *   - Splits sentences longer than MAX_SENTENCE_WORDS (25) at commas,
 *     semicolons, or conjunctions so TTS voices get natural pause points.
 *   - Flags problematic punctuation (ellipses, repeated marks, ALL-CAPS
 *     acronyms not in the map) as warnings for the user to review.
 *   - Computes a 0–100 "TTS readability score" from a PUBLISHED,
 *     ESTIMATED heuristic (weights below are guesses, labeled as such —
 *     this is guidance, not a measurement of any TTS voice).
 * Brand names / unknown acronyms are NEVER given invented phonetic
 * spellings; they are surfaced as warnings for the user to confirm.
 * No AI is claimed anywhere.
 */

/** Abbreviations expanded before TTS reading. Fixed bank: 47 entries. */
export const ABBREVIATION_MAP: Record<string, string> = {
  "e.g.": "for example",
  "i.e.": "that is",
  etc: "and so on",
  vs: "versus",
  "w/o": "without",
  "w/": "with",
  "b/c": "because",
  DIY: "do it yourself",
  ASAP: "as soon as possible",
  BTW: "by the way",
  FYI: "for your information",
  FAQ: "frequently asked questions",
  DM: "direct message",
  PM: "private message",
  POV: "point of view",
  GRWM: "get ready with me",
  OOTD: "outfit of the day",
  "TL;DR": "too long didn't read",
  TLDR: "too long didn't read",
  BTS: "behind the scenes",
  "Q&A": "Q and A",
  CEO: "C E O",
  CFO: "C F O",
  CTO: "C T O",
  HR: "H R",
  PR: "P R",
  SEO: "S E O",
  URL: "U R L",
  DMV: "D M V",
  ETA: "estimated time of arrival",
  RSVP: "R S V P",
  SOS: "S O S",
  VIP: "V I P",
  DIYs: "do it yourselfs",
  ROI: "R O I",
  KPI: "K P I",
  BFF: "best friends forever",
  LOL: "laughing out loud",
  OMG: "oh my god",
  TBH: "to be honest",
  NGL: "not gonna lie",
  IMO: "in my opinion",
  IMHO: "in my humble opinion",
  FOMO: "fear of missing out",
  IRL: "in real life",
  TMI: "too much information",
  NSFW: "not safe for work",
};

/** Sentences longer than this (words) are split for natural TTS pauses. */
export const MAX_SENTENCE_WORDS = 25;

/**
 * Readability score heuristic (ESTIMATED weights — guidance only, not a
 * measurement of any real TTS voice):
 *   score = 100 − 2×(long sentences) − 1×(abbreviations expanded)
 *                 − 1×(numbers spelled out) − 3×(punctuation warnings)
 * clamped to 0–100.
 */
export const SCORE_LONG_SENTENCE_PENALTY = 2;
export const SCORE_ABBREVIATION_PENALTY = 1;
export const SCORE_NUMBER_PENALTY = 1;
export const SCORE_PUNCTUATION_PENALTY = 3;

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
  "eighty", "ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return r === 0 ? TENS[t] : `${TENS[t]}-${ONES[r]}`;
}

function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  return r === 0
    ? `${ONES[h]} hundred`
    : `${ONES[h]} hundred ${twoDigits(r)}`;
}

/** Spells out integers 0–999999; larger values fall back to digit-by-digit. */
export function spellInteger(n: number): string {
  if (n < 0) return `minus ${spellInteger(-n)}`;
  if (n < 1000) return threeDigits(n);
  if (n < 1000000) {
    const th = Math.floor(n / 1000);
    const r = n % 1000;
    return r === 0
      ? `${threeDigits(th)} thousand`
      : `${threeDigits(th)} thousand ${threeDigits(r)}`;
  }
  return n
    .toString()
    .split("")
    .map((d) => ONES[Number(d)])
    .join(" ");
}

const ORDINALS_SPECIAL: Record<string, string> = {
  "1st": "first", "2nd": "second", "3rd": "third", "5th": "fifth",
  "8th": "eighth", "9th": "ninth", "12th": "twelfth", "20th": "twentieth",
  "30th": "thirtieth",
};

/** Spells out an ordinal token like "21st"; falls back to "N-th". */
export function spellOrdinal(token: string): string {
  if (ORDINALS_SPECIAL[token]) return ORDINALS_SPECIAL[token];
  const n = Number(token.replace(/(st|nd|rd|th)$/, ""));
  if (!Number.isInteger(n) || n < 0) return token;
  if (n >= 1000) return `${spellInteger(n)}th`;
  return `${threeDigits(n)}th`;
}

/** "2026" → "twenty twenty-six" for years 1000–2099. */
export function spellYear(n: number): string {
  const first = Math.floor(n / 100);
  const last = n % 100;
  if (last === 0) return `${twoDigits(first)} hundred`;
  return `${twoDigits(first)} ${last < 10 ? `oh ${ONES[last]}` : twoDigits(last)}`;
}

/** Rewrites number tokens in text with spoken forms. Returns rewrite + count. */
function spellOutNumbers(text: string): { text: string; count: number } {
  let count = 0;
  const out = text.replace(
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)|(\d{1,3}(?:,\d{3})*(?:\.\d+)?)%|(\d+)(st|nd|rd|th)\b|(\b\d{1,3}(?:,\d{3})*\.\d+)|\b(\d{4})\b|\b(\d[\d,]*)\b/g,
    (match, money, pct, ordNum, ordSuf, decimal, year, plain) => {
      if (money !== undefined) {
        count++;
        const n = Number(money.replace(/,/g, ""));
        return `${spellInteger(Math.floor(n))} dollars`;
      }
      if (pct !== undefined) {
        count++;
        return `${spellInteger(Number(pct.replace(/,/g, "")))} percent`;
      }
      if (ordNum !== undefined) {
        count++;
        return spellOrdinal(`${ordNum}${ordSuf}`);
      }
      if (decimal !== undefined) {
        count++;
        const [whole, frac] = decimal.replace(/,/g, "").split(".");
        const digits = frac
          .split("")
          .map((d: string) => ONES[Number(d)])
          .join(" ");
        return `${spellInteger(Number(whole))} point ${digits}`;
      }
      if (year !== undefined) {
        const y = Number(year);
        if (y >= 1000 && y <= 2099) {
          count++;
          return spellYear(y);
        }
        // falls through to plain-number handling below
      }
      if (plain !== undefined) {
        count++;
        return spellInteger(Number(plain.replace(/,/g, "")));
      }
      return match;
    }
  );
  return { text: out, count };
}

/** Escapes regex special chars in a literal string. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Expands abbreviations from ABBREVIATION_MAP (case-insensitive except
 * all-caps acronyms, matched on token boundaries). Returns rewrite + the
 * list of distinct abbreviations expanded.
 */
function expandAbbreviations(text: string): {
  text: string;
  expanded: string[];
} {
  const expanded: string[] = [];
  let out = text;
  for (const [abbr, spoken] of Object.entries(ABBREVIATION_MAP)) {
    const pattern = new RegExp(`(^|\\W)${escapeRegExp(abbr)}(?=\\W|$)`, "gi");
    if (pattern.test(out)) {
      expanded.push(abbr);
      out = out.replace(new RegExp(`(^|\\W)${escapeRegExp(abbr)}(?=\\W|$)`, "gi"), `$1${spoken}`);
    }
  }
  // "&" and "+" read better as words for TTS.
  out = out.replace(/&/g, "and").replace(/\+/g, "plus");
  return { text: out, expanded };
}

/** Splits text into sentences on . ! ? (keeps the terminator). */
function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+[""')\]]*\s*/g);
  if (!matches) return text.trim().length > 0 ? [text.trim()] : [];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Splits a long sentence into chunks of at most MAX_SENTENCE_WORDS words,
 * preferring splits at commas, semicolons, then conjunctions. Deterministic.
 */
function splitLongSentence(sentence: string): string[] {
  const termMatch = sentence.match(/([.!?]+[""')\]]*)$/);
  const terminator = termMatch ? termMatch[1] : ".";
  const core = termMatch ? sentence.slice(0, -termMatch[1].length) : sentence;
  const words = core.split(/\s+/).filter((w) => w.length > 0);
  if (words.length <= MAX_SENTENCE_WORDS) return [sentence];
  const chunks: string[][] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length > 0) {
      chunks.push(current);
      current = [];
    }
  };
  for (const word of words) {
    current.push(word);
    const endsClause = /[,;:]$/.test(word);
    const isConj = /^(and|but|so|because|however)$/i.test(word);
    if (current.length >= 10 && (endsClause || isConj)) flush();
    if (current.length >= MAX_SENTENCE_WORDS) flush();
  }
  flush();
  // Each chunk becomes its own sentence so TTS voices pause between them;
  // the last chunk keeps the original terminator.
  return chunks.map((c, i) => {
    const clean = c.join(" ").replace(/[,;:]+$/, "").trim();
    return i === chunks.length - 1 ? `${clean}${terminator}` : `${clean}.`;
  });
}

/** Flags punctuation/acronym issues TTS voices struggle with. */
function flagPunctuation(text: string): string[] {
  const warnings: string[] = [];
  if (/\.\.\./.test(text))
    warnings.push(
      "Ellipses (…) often make TTS voices trail off or pause oddly — replaced with periods."
    );
  if (/([!?])\1/.test(text))
    warnings.push(
      "Repeated punctuation (!! or ??) doesn't change TTS tone — simplified to a single mark."
    );
  if (/[!?]{2,}/.test(text) === false && /[!?][!?]/.test(text))
    warnings.push(
      "Mixed punctuation (!? or ?!) can confuse TTS rhythm — simplified."
    );
  const unknownAcronyms = Array.from(
    new Set(
      (text.match(/\b[A-Z]{2,}\b/g) || []).filter(
        (a) => !(a in ABBREVIATION_MAP)
      )
    )
  );
  for (const a of unknownAcronyms.slice(0, 5)) {
    warnings.push(
      `Check pronunciation of "${a}" in TikTok's voice preview — the tool does not invent phonetic spellings for brand names or unknown acronyms.`
    );
  }
  const capsRuns = (text.match(/\b[A-Z]{2,}(?:\s+[A-Z]{2,}){1,}\b/g) || []).length;
  if (capsRuns > 0 && unknownAcronyms.length === 0)
    warnings.push(
      "Long ALL-CAPS runs are usually read letter-by-letter — consider normal casing."
    );
  return warnings;
}

export interface TtsResult {
  optimizedScript: string;
  readabilityScore: number;
  scoreBand: string;
  changes: string[];
  warnings: string[];
}

export function optimizeScript(scriptText: string): TtsResult {
  let text = scriptText.trim().replace(/\s+/g, " ");

  const { text: afterAbbr, expanded } = expandAbbreviations(text);
  const { text: afterNumbers, count: numberCount } = spellOutNumbers(afterAbbr);
  let cleaned = afterNumbers
    .replace(/\.\.\./g, ".")
    .replace(/([!?])\1+/g, "$1")
    .replace(/[!?][!?]+/g, "!");

  const warnings = flagPunctuation(afterNumbers);

  const sentences = splitSentences(cleaned);
  const longCount = sentences.filter(
    (s) => wordCount(s) > MAX_SENTENCE_WORDS
  ).length;
  const splitPieces = sentences.flatMap(splitLongSentence);
  const splitCount = Math.max(0, splitPieces.length - sentences.length);

  const optimizedScript = splitPieces.join(" ");

  const score = Math.max(
    0,
    Math.min(
      100,
      100 -
        longCount * SCORE_LONG_SENTENCE_PENALTY -
        expanded.length * SCORE_ABBREVIATION_PENALTY -
        numberCount * SCORE_NUMBER_PENALTY -
        warnings.length * SCORE_PUNCTUATION_PENALTY
    )
  );
  const scoreBand =
    score >= 85
      ? "Excellent for TTS"
      : score >= 70
        ? "Good for TTS"
        : score >= 50
          ? "Needs tweaks for TTS"
          : "Hard to read aloud";

  const changes: string[] = [];
  if (expanded.length > 0)
    changes.push(
      `Expanded ${expanded.length} abbreviation${expanded.length === 1 ? "" : "s"}: ${expanded
        .slice(0, 5)
        .map((a) => `"${a}" → "${ABBREVIATION_MAP[a]}"`)
        .join(", ")}${expanded.length > 5 ? ", …" : ""}`
    );
  if (numberCount > 0)
    changes.push(
      `Spelled out ${numberCount} number${numberCount === 1 ? "" : "s"} (currency, percents, ordinals, years, and decimals included)`
    );
  if (splitCount > 0)
    changes.push(
      `Split ${splitCount} long sentence${splitCount === 1 ? "" : "s"} into shorter pieces for natural TTS pauses`
    );
  if (changes.length === 0)
    changes.push(
      "No changes needed — your script is already TTS-friendly."
    );

  return { optimizedScript, readabilityScore: score, scoreBand, changes, warnings };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["scriptText"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      ok: false,
      error: "Please paste your script text first — the optimizer needs something to rewrite.",
    };
  }
  const result = optimizeScript(raw);
  return {
    ok: true,
    values: {
      optimizedScript: result.optimizedScript,
      readabilityScore: result.readabilityScore,
      changes: result.changes,
      warnings: result.warnings,
    },
  };
}
