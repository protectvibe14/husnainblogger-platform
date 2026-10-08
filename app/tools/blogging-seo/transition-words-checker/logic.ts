/**
 * Transition Words Checker — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY CONTRACT (see spec honestyNote): counts occurrences of a FIXED bank
 * of English transition words/phrases (bank size documented below — counted
 * programmatically, never claimed as AI). Density guidance (verdict bands) is
 * OUR OWN editorial guidance, not a Yoast/Google-published rule.
 *
 * Matching rules (deterministic, longest-phrase-first):
 *   - Content is matched case-insensitively with word boundaries.
 *   - Multi-word phrases are matched before their single-word parts
 *     (e.g. "in addition" wins over nothing shorter, "first of all" over "first").
 *   - Each occurrence is counted once; overlapping matches are not double-counted.
 *   - Bank is English-only: non-English content will simply score low.
 *
 * Verdict bands (editorial): density = transition words per 100 words.
 *   < 1.0  -> "Low"      — add more transition words to improve flow.
 *   1.0-3.0 -> "Moderate" — decent flow; a few more transitions could help.
 *   > 3.0  -> "Good"     — solid use of transitions.
 */

export const MAX_CONTENT_CHARS = 200000;
export const LOW_DENSITY = 1.0;
export const GOOD_DENSITY = 3.0;
export const MATCHED_WORDS_CAP = 50;

/**
 * Fixed English transition-word bank. BANK_SIZE is the exact count —
 * update the comment if the bank changes.
 */
const TRANSITION_PHRASES: ReadonlyArray<string> = [
  // --- single words ---
  "however",
  "therefore",
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "meanwhile",
  "otherwise",
  "instead",
  "likewise",
  "similarly",
  "accordingly",
  "hence",
  "thus",
  "nevertheless",
  "nonetheless",
  "although",
  "though",
  "because",
  "since",
  "unless",
  "until",
  "while",
  "whereas",
  "despite",
  "besides",
  "indeed",
  "finally",
  "next",
  "then",
  "first",
  "second",
  "third",
  "also",
  "further",
  "rather",
  "yet",
  "still",
  "anyway",
  "overall",
  "essentially",
  "particularly",
  "especially",
  "specifically",
  "generally",
  "usually",
  "often",
  "sometimes",
  "plus",
  "except",
  "including",
  "without",
  "across",
  "among",
  "beyond",
  "during",
  "after",
  "before",
  "once",
  "when",
  "whether",
  "either",
  "neither",
  "both",
  "another",
  "such",
  "quite",
  // --- multi-word phrases ---
  "in addition",
  "as a result",
  "for example",
  "for instance",
  "in fact",
  "in contrast",
  "on the other hand",
  "on the contrary",
  "in other words",
  "that is",
  "for this reason",
  "as well as",
  "in summary",
  "in conclusion",
  "to summarize",
  "first of all",
  "in the first place",
  "at the same time",
  "by contrast",
  "in particular",
  "in general",
  "in short",
  "after all",
  "above all",
  "even so",
  "even though",
  "as soon as",
  "so that",
  "in order to",
  "due to",
  "because of",
  "apart from",
  "instead of",
  "rather than",
  "in spite of",
  "not only",
  "but also",
  "compared to",
  "in comparison",
  "in turn",
  "in the end",
  "at first",
  "in the meantime",
  "in any case",
];
/** Exact bank size (asserted by tests). */
export const BANK_SIZE = TRANSITION_PHRASES.length;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Longest-first alternation so multi-word phrases win over single words. */
const PHRASE_RE = new RegExp(
  "\\b(" +
    [...TRANSITION_PHRASES]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegex)
      .join("|") +
    ")\\b",
  "gi",
);

function countWords(text: string): number {
  const m = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return m ? m.length : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function verdictFor(density: number): string {
  if (density < LOW_DENSITY) {
    return "Low — your content uses few transition words. Add more (however, for example, as a result) to improve flow between ideas.";
  }
  if (density <= GOOD_DENSITY) {
    return "Moderate — decent flow. A few more transition words could make the connections between your ideas clearer.";
  }
  return "Good — your content uses transition words well. The connections between ideas should feel smooth to readers.";
}

/**
 * Tool logic slot. values: { content }.
 * Returns { transitionCount, density, matchedWords, verdict }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const raw = values["content"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Paste the content you want to check." };
  }
  const content = raw;
  if (content.length > MAX_CONTENT_CHARS) {
    return {
      ok: false,
      error: `Content must be ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  const words = countWords(content);
  const counts = new Map<string, number>();
  let transitionCount = 0;
  PHRASE_RE.lastIndex = 0;
  for (const m of content.matchAll(PHRASE_RE)) {
    const phrase = m[1].toLowerCase();
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    transitionCount++;
  }

  const density = words > 0 ? round2((transitionCount / words) * 100) : 0;

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MATCHED_WORDS_CAP)
    .map(([phrase, count]) => [phrase, String(count)]);

  return {
    ok: true,
    values: {
      transitionCount,
      density,
      matchedWords: { columns: ["Transition word/phrase", "Occurrences"], rows },
      verdict: verdictFor(density),
    },
  };
}
