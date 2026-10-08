/**
 * X Hook Analyzer — pure logic (tool-376), zero imports, zero network,
 * zero DOM.
 *
 * HEURISTIC RUBRIC (fixed, transparent — NOT a virality prediction):
 * The score measures how well a hook follows documented hook-writing
 * patterns (specificity, curiosity gap, clarity, contrarian edge). X
 * publishes no virality formula, so no tool can predict virality — every
 * output is labeled "heuristic estimate, not a virality prediction".
 *
 *   Dimension        Weight   Max  How earned (each signal +2, cap 10)
 *   ───────────────  ──────   ───  ────────────────────────────────────
 *   1. Specificity    30%     10   contains a digit; a timeframe word
 *                                  (day/week/month/year/hour/minute/today…);
 *                                  a money/scale marker ($, %, "10x");
 *                                  a concrete-quantity word (steps, ways,
 *                                  rules, mistakes, lessons, tips, secrets)
 *   2. Curiosity gap  30%     10   a "?" ; a leading question word
 *                                  (who/what/why/how/when/where/which);
 *                                  an open-loop phrase (secret, nobody
 *                                  talks about, what happens, here's why,
 *                                  "but", until, truth about, nobody tells
 *                                  you). −2 penalty when the hook both makes
 *                                  a claim AND explains it fully
 *                                  ("because"/"so that" with an answer).
 *   3. Clarity        20%     10   starts at 10; −3 if >3 hashtags;
 *                                  −3 if >60% of letters are UPPERCASE;
 *                                  −2 if >2 sentences; −2 if >5 emojis.
 *                                  Floor 0.
 *   4. Contrarian     20%     10   signals: stop, don't, never, unpopular
 *    edge                            opinion, hot take, everyone is wrong,
 *                                  nobody, wrong, myth, overrated, lie/lies,
 *                                  steal, quit — each +2, cap 10.
 *
 * Weighted total = 0.30*specificity + 0.30*curiosity + 0.20*clarity
 *                + 0.20*contrarian, 0–10, rounded to 1 decimal.
 * Verdicts: strong ≥ 7.0 · okay ≥ 4.5 · weak < 4.5.
 *
 * Character counting follows the X rules in
 * data/platform-rules/x.json: URL = 23 chars, emoji/CJK = 2 chars,
 * everything else = 1 char (approximation — X's exact segmenter is
 * proprietary; documented limitation).
 *
 * English detection: the rubric was written for English hooks. A hook
 * with no ASCII letters at all gets a "limited heuristic coverage" note.
 */

/** X post limit for free accounts (data/platform-rules/x.json). */
export const X_POST_LIMIT = 280;

export type HookVerdict = "strong" | "okay" | "weak";

export interface HookDimension {
  name: string;
  score: number;
  weight: string;
  detail: string;
}

export interface HookScores {
  /** Heuristic total, 0–10. */
  total: number;
  verdict: HookVerdict;
  specificity: number;
  curiosityGap: number;
  clarity: number;
  contrarianEdge: number;
  dimensions: HookDimension[];
  weightedChars: number;
  overLimit: boolean;
}

const TIMEFRAME_WORDS = [
  "day", "days", "week", "weeks", "month", "months", "year", "years",
  "hour", "hours", "minute", "minutes", "second", "seconds",
  "today", "tomorrow", "tonight", "daily", "weekly",
];

const QUANTITY_WORDS = [
  "step", "steps", "way", "ways", "rule", "rules", "mistake", "mistakes",
  "lesson", "lessons", "tip", "tips", "secret", "secrets", "reason", "reasons",
];

const OPEN_LOOP_PHRASES = [
  "secret", "nobody talks about", "what happens", "here's why", "heres why",
  "but ", " until ", "truth about", "nobody tells you", "what if",
  "the real reason", "behind the scenes",
];

const CONTRARIAN_SIGNALS = [
  "stop", "don't", "dont", "never", "unpopular opinion", "hot take",
  "everyone is wrong", "nobody", "wrong", "myth", "overrated",
  "lie", "lies", "steal", "quit",
];

function containsWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
}

/** Approximate X weighted character count: URL=23, emoji/CJK=2, else 1. */
export function xWeightedLength(text: string): number {
  if (typeof text !== "string") throw new TypeError("xWeightedLength expects a string");
  const noUrls = text.replace(/https?:\/\/[^\s]+/g, () => "U".repeat(23));
  let n = 0;
  for (const ch of noUrls) {
    const cp = ch.codePointAt(0) as number;
    if (/\p{Extended_Pictographic}/u.test(ch)) {
      n += 2; // emoji
    } else if (
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK unified
      (cp >= 0x3400 && cp <= 0x4dbf) || // CJK extension A
      (cp >= 0x20000 && cp <= 0x2a6df) || // CJK extension B
      (cp >= 0x3040 && cp <= 0x30ff) || // hiragana/katakana
      (cp >= 0xac00 && cp <= 0xd7af) // hangul syllables
    ) {
      n += 2;
    } else {
      n += 1;
    }
  }
  return n;
}

function countEmojis(text: string): number {
  return [...text].filter((ch) => /\p{Extended_Pictographic}/u.test(ch)).length;
}

function countHashtags(text: string): number {
  const m = text.match(/#[\p{L}\p{N}_]+/gu);
  return m ? m.length : 0;
}

function sentenceCount(text: string): number {
  return text.split(/[.!?…]+/).map((s) => s.trim()).filter((s) => s.length > 0).length;
}

function uppercaseRatio(text: string): number {
  const letters = [...text].filter((ch) => /[a-zA-Z]/.test(ch));
  if (letters.length === 0) return 0;
  const upper = letters.filter((ch) => ch === ch.toUpperCase()).length;
  return upper / letters.length;
}

/** Specificity 0–10: +2 per signal, cap 10. */
export function scoreSpecificity(hook: string): number {
  let s = 0;
  if (/\d/.test(hook)) s += 2;
  if (TIMEFRAME_WORDS.some((w) => containsWord(hook, w))) s += 2;
  if (/[$%]/.test(hook) || /\b\d+\s*x\b/i.test(hook)) s += 2;
  if (QUANTITY_WORDS.some((w) => containsWord(hook, w))) s += 2;
  return Math.min(10, s);
}

/** Curiosity gap 0–10: +2 per signal, cap 10, −2 if it answers itself. */
export function scoreCuriosityGap(hook: string): number {
  let s = 0;
  if (hook.includes("?")) s += 2;
  if (/^(who|what|why|how|when|where|which)\b/i.test(hook.trim())) s += 2;
  if (OPEN_LOOP_PHRASES.some((p) => hook.toLowerCase().includes(p))) s += 2;
  if (/\b(because|so that)\b/i.test(hook) && hook.length > 60) s -= 2; // answers itself
  return Math.max(0, Math.min(10, s));
}

/** Clarity 0–10: starts at 10, deductions for clutter. */
export function scoreClarity(hook: string): number {
  let s = 10;
  if (countHashtags(hook) > 3) s -= 3;
  if (uppercaseRatio(hook) > 0.6) s -= 3;
  if (sentenceCount(hook) > 2) s -= 2;
  if (countEmojis(hook) > 5) s -= 2;
  return Math.max(0, s);
}

/** Contrarian edge 0–10: +2 per signal, cap 10. */
export function scoreContrarianEdge(hook: string): number {
  let s = 0;
  const lower = hook.toLowerCase();
  for (const sig of CONTRARIAN_SIGNALS) {
    if (lower.includes(sig)) s += 2;
  }
  return Math.min(10, s);
}

export function verdictFor(total: number): HookVerdict {
  if (total >= 7) return "strong";
  if (total >= 4.5) return "okay";
  return "weak";
}

/**
 * Score a hook against the documented rubric.
 * @throws {TypeError} on non-string input. @throws {Error} on empty input.
 */
export function scoreHook(hookText: string): HookScores {
  if (typeof hookText !== "string") throw new TypeError("scoreHook expects a string");
  const hook = hookText.trim();
  if (hook === "") throw new Error("scoreHook requires a non-empty hook");

  const specificity = scoreSpecificity(hook);
  const curiosityGap = scoreCuriosityGap(hook);
  const clarity = scoreClarity(hook);
  const contrarianEdge = scoreContrarianEdge(hook);
  const total = Math.round((0.3 * specificity + 0.3 * curiosityGap + 0.2 * clarity + 0.2 * contrarianEdge) * 10) / 10;

  const dimensions: HookDimension[] = [
    {
      name: "Specificity",
      score: specificity,
      weight: "30%",
      detail: "Concrete numbers, timeframes, money/scale markers, and quantity words make a hook feel real.",
    },
    {
      name: "Curiosity gap",
      score: curiosityGap,
      weight: "30%",
      detail: "Questions and open loops create a gap the reader must click to close; hooks that answer themselves lose it.",
    },
    {
      name: "Clarity",
      score: clarity,
      weight: "20%",
      detail: "One readable sentence with minimal hashtags, caps, and emojis reads cleanly in the feed.",
    },
    {
      name: "Contrarian edge",
      score: contrarianEdge,
      weight: "20%",
      detail: "Stance-taking language ('stop', 'unpopular opinion', 'myth') stands out against bland agreement.",
    },
  ];

  const weightedChars = xWeightedLength(hook);
  return {
    total,
    verdict: verdictFor(total),
    specificity,
    curiosityGap,
    clarity,
    contrarianEdge,
    dimensions,
    weightedChars,
    overLimit: weightedChars > X_POST_LIMIT,
  };
}

/** Improvement suggestions for each dimension scoring below 7. */
export function buildSuggestions(r: HookScores, hook: string): string[] {
  const out: string[] = [];
  if (r.specificity < 7) {
    out.push("Add a concrete number, timeframe, or dollar amount (e.g. 'in 30 days', '$1,000', '7 steps').");
  }
  if (r.curiosityGap < 7) {
    out.push("Open a loop: ask a question or tease what happens next without giving the answer away in the hook.");
  }
  if (r.clarity < 7) {
    if (countHashtags(hook) > 3) out.push("Move hashtags to the end or drop them — a hook works best with 1–2 at most.");
    if (uppercaseRatio(hook) > 0.6) out.push("Turn off caps lock: one emphasized word beats a whole sentence in caps.");
    if (sentenceCount(hook) > 2) out.push("Trim to one punchy sentence — hooks are openers, not paragraphs.");
    if (countEmojis(hook) > 5) out.push("Cut emojis down to 1–2 so the words carry the hook.");
    if (out.length === 0) out.push("Simplify the hook to a single clear sentence.");
  }
  if (r.contrarianEdge < 7) {
    out.push("Take a stance: 'stop', 'unpopular opinion', or 'everyone is wrong about' adds edge that stops the scroll.");
  }
  if (out.length === 0) {
    out.push("Strong hook — post it as-is, or test one variation with a different opening line.");
  }
  return out;
}

/** Context notes: the honesty label plus limit/coverage warnings. */
export function buildNotes(r: HookScores, hook: string): string[] {
  const notes = [
    "Heuristic estimate, not a virality prediction: this score measures how well the hook follows documented hook-writing patterns — it cannot predict whether X's algorithm or audience will make it go viral.",
  ];
  if (r.overLimit) {
    notes.push(
      `Over X's 280-character limit for free accounts (weighted count: ${r.weightedChars}) — trim it before posting.`,
    );
  }
  if (!/[a-zA-Z]/.test(hook)) {
    notes.push(
      "Limited heuristic coverage: this rubric was written for English hooks, so scores on non-English text are rough.",
    );
  }
  return notes;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const raw = values["hookText"];
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, error: "Please paste the hook text you want analyzed." };
  }
  const hook = raw.trim();

  const r = scoreHook(hook);
  return {
    ok: true,
    values: {
      scores: {
        columns: ["Dimension", "Score (0–10)", "Weight", "What it measures"],
        rows: r.dimensions.map((d) => [d.name, d.score, d.weight, d.detail]),
      },
      totalScore: r.total,
      verdict: r.verdict,
      suggestions: buildSuggestions(r, hook),
      notes: buildNotes(r, hook),
    },
  };
}
