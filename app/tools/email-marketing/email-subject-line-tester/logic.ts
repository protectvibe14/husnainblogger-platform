/**
 * Email Subject Line Tester — pure logic (tool-401).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure rule-based scoring.
 * - This is a RULE-BASED heuristic analyzer, NOT machine learning and NOT a
 *   real spam filter. It cannot predict open rates or inbox placement; every
 *   score is an estimate from transparent, documented signals (stated in
 *   assumptions[] and in the returned result).
 * - Length is measured in user-perceived characters ([...str].length), so
 *   emoji count as one character each.
 * - Spam-trigger matching uses case-insensitive whole-word/phrase matching.
 *   The trigger list is a transparent heuristic, not an authoritative list.
 * - Emoji counting uses Unicode ranges and is approximate for multi-codepoint
 *   (ZWJ / skin-tone) sequences — documented as a heuristic.
 * - Subjects longer than 200 characters are still scored in full, with a
 *   warning that most inboxes/clients truncate display around 60–80 chars.
 */

export const MAX_SUBJECT_CHARS_ANALYZED = 200;
export const BASE_SCORE = 50;

/**
 * Spam-trigger words/phrases. Transparent heuristic list — NOT an
 * authoritative spam-filter database. Matched case-insensitively on word
 * boundaries (so "free" does not match inside "freelance").
 */
export const SPAM_TRIGGERS: readonly string[] = [
  "free",
  "buy now",
  "click here",
  "click below",
  "guaranteed",
  "winner",
  "cash prize",
  "urgent",
  "act now",
  "limited time",
  "risk-free",
  "no cost",
  "make money fast",
  "miracle",
  "congratulations",
  "dear friend",
  "no obligation",
  "call now",
  "order now",
  "100% free",
  "extra income",
  "work from home",
];

/** Curiosity/question cue words (heuristic engagement signals). */
export const CURIOSITY_WORDS: readonly string[] = [
  "how",
  "why",
  "what",
  "secret",
  "truth",
  "revealed",
  "mistake",
  "warning",
];

/** Score bands. */
export type SubjectBand = "excellent" | "good" | "fair" | "needs-work";

/**
 * One scored signal with its impact on the total.
 */
export interface SubjectSignal {
  /** Human-readable signal name. */
  signal: string;
  /** Points added to (or subtracted from) the score. */
  impact: number;
  /** Why this signal fired. */
  detail: string;
}

/**
 * Result of testing one subject line.
 */
export interface SubjectTestResult {
  /** The subject as provided. */
  subject: string;
  /** User-perceived character count. */
  charCount: number;
  /** Final score, 0–100. */
  score: number;
  /** Band for the score. */
  band: SubjectBand;
  /** Per-signal breakdown (transparent scoring). */
  signals: SubjectSignal[];
  /** Actionable suggestions derived from negative signals. */
  suggestions: string[];
  /** Non-fatal warnings (e.g. very long subject). */
  warnings: string[];
  /** Assumption/heuristic notes surfaced to the UI. */
  assumptions: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countEmojis(s: string): number {
  const m = s.match(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}]/gu,
  );
  return m ? m.length : 0;
}

/**
 * Ratio of ALL-CAPS words (words whose letters are all uppercase).
 * Words without letters (e.g. "30") are ignored.
 */
function capsWordRatio(s: string): number {
  const words = s.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 0;
  let caps = 0;
  let withLetters = 0;
  for (const w of words) {
    const letters = w.replace(/[^A-Za-z]/g, "");
    if (letters.length === 0) continue;
    withLetters++;
    if (letters === letters.toUpperCase()) caps++;
  }
  return withLetters === 0 ? 0 : caps / withLetters;
}

/** Detect common personalization tokens: {name}, {{name}}, [Name], %NAME%. */
function hasPersonalization(s: string): boolean {
  return (
    /\{[A-Za-z][A-Za-z0-9_ ]*\}/.test(s) ||
    /\{\{[A-Za-z][A-Za-z0-9_ ]*\}\}/.test(s) ||
    /\[[A-Za-z][A-Za-z0-9 ]+\]/.test(s) ||
    /%[A-Z][A-Z0-9_]+%/.test(s)
  );
}

function bandFor(score: number): SubjectBand {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "needs-work";
}

/**
 * Test an email subject line with transparent rule-based scoring.
 *
 * @param subject - the subject line to test.
 * @returns Score 0–100 with band, per-signal breakdown, and suggestions.
 * @throws {TypeError} when subject is not a string.
 * @throws {RangeError} when subject is empty/whitespace-only.
 */
export function testSubjectLine(subject: string): SubjectTestResult {
  if (typeof subject !== "string") {
    throw new TypeError("subject must be a string.");
  }
  const trimmed = subject.trim();
  if (trimmed.length === 0) {
    throw new RangeError("subject must not be empty.");
  }

  const warnings: string[] = [];
  const signals: SubjectSignal[] = [];
  const suggestions: string[] = [];
  const s = subject; // score the raw subject, not the trimmed copy
  const charCount = [...s].length;

  if (charCount > MAX_SUBJECT_CHARS_ANALYZED) {
    warnings.push(
      `Subject is ${charCount} characters; most inboxes truncate display around 60–80 characters.`,
    );
  }

  let score = BASE_SCORE;

  // 1. Length.
  let lengthImpact: number;
  let lengthDetail: string;
  if (charCount >= 30 && charCount <= 50) {
    lengthImpact = 15;
    lengthDetail = `${charCount} chars is in the ideal 30–50 range.`;
  } else if (
    (charCount >= 20 && charCount <= 29) ||
    (charCount >= 51 && charCount <= 60)
  ) {
    lengthImpact = 8;
    lengthDetail = `${charCount} chars is acceptable; 30–50 performs best as a rule of thumb.`;
    suggestions.push("Aim for 30–50 characters for the best display across devices.");
  } else if (
    (charCount >= 10 && charCount <= 19) ||
    (charCount >= 61 && charCount <= 80)
  ) {
    lengthImpact = -5;
    lengthDetail = `${charCount} chars is short/long for most inboxes.`;
    suggestions.push("Aim for 30–50 characters for the best display across devices.");
  } else {
    lengthImpact = -15;
    lengthDetail = `${charCount} chars is very short or very long.`;
    suggestions.push("Aim for 30–50 characters for the best display across devices.");
  }
  score += lengthImpact;
  signals.push({ signal: "length", impact: lengthImpact, detail: lengthDetail });

  // 2. Spam triggers (whole-word, case-insensitive).
  const lowered = s.toLowerCase();
  const hits = SPAM_TRIGGERS.filter((t) =>
    new RegExp(`\\b${escapeRegExp(t)}\\b`, "i").test(lowered),
  );
  const spamImpact = hits.length === 0 ? 0 : Math.max(-24, hits.length * -8);
  score += spamImpact;
  signals.push({
    signal: "spam-triggers",
    impact: spamImpact,
    detail:
      hits.length === 0
        ? "No spam-trigger words detected."
        : `Matched: ${hits.join(", ")} (heuristic list, not a real spam filter).`,
  });
  if (hits.length > 0) {
    suggestions.push(`Remove spam-trigger wording: ${hits.join(", ")}.`);
  }

  // 3. ALL-CAPS ratio.
  const capsRatio = capsWordRatio(s);
  let capsImpact = 0;
  let capsDetail = `${Math.round(capsRatio * 100)}% of words are ALL-CAPS.`;
  if (capsRatio >= 0.5) {
    capsImpact = -10;
    capsDetail += " Heavy caps use reads as shouting.";
    suggestions.push("Avoid ALL CAPS — use normal capitalization.");
  } else if (capsRatio >= 0.25) {
    capsImpact = -5;
    capsDetail += " Noticeable caps use.";
    suggestions.push("Reduce ALL-CAPS words to at most one for emphasis.");
  }
  score += capsImpact;
  signals.push({ signal: "all-caps", impact: capsImpact, detail: capsDetail });

  // 4. Personalization tokens.
  const personalized = hasPersonalization(s);
  const personalizationImpact = personalized ? 8 : 0;
  score += personalizationImpact;
  signals.push({
    signal: "personalization",
    impact: personalizationImpact,
    detail: personalized
      ? "Personalization token detected (e.g. {first_name})."
      : "No personalization token detected.",
  });

  // 5. Emoji count (approximate heuristic).
  const emojiCount = countEmojis(s);
  let emojiImpact = 0;
  let emojiDetail: string;
  if (emojiCount >= 1 && emojiCount <= 2) {
    emojiImpact = 5;
    emojiDetail = `${emojiCount} emoji — tasteful use.`;
  } else if (emojiCount >= 5) {
    emojiImpact = -5;
    emojiDetail = `${emojiCount} emojis — excessive.`;
    suggestions.push("Use at most 1–2 emojis; more looks spammy.");
  } else {
    emojiDetail =
      emojiCount === 0 ? "No emojis." : `${emojiCount} emojis — neutral.`;
  }
  score += emojiImpact;
  signals.push({ signal: "emoji", impact: emojiImpact, detail: emojiDetail });

  // 6. Question / curiosity cues.
  const hasQuestion = s.includes("?");
  const curiosityHit = CURIOSITY_WORDS.find((w) =>
    new RegExp(`\\b${w}\\b`, "i").test(lowered),
  );
  const curiosityImpact = hasQuestion || curiosityHit ? 5 : 0;
  score += curiosityImpact;
  signals.push({
    signal: "curiosity",
    impact: curiosityImpact,
    detail:
      curiosityImpact > 0
        ? "Question mark or curiosity cue detected."
        : "No question or curiosity cue detected.",
  });

  // 7. Exclamation marks beyond the first.
  const bangs = (s.match(/!/g) || []).length;
  const bangImpact = bangs > 1 ? Math.max(-9, (bangs - 1) * -3) : 0;
  score += bangImpact;
  signals.push({
    signal: "exclamation",
    impact: bangImpact,
    detail:
      bangs === 0
        ? "No exclamation marks."
        : `${bangs} exclamation mark${bangs === 1 ? "" : "s"}.`,
  });
  if (bangImpact < 0) {
    suggestions.push("Limit exclamation marks to one — more reads as hype.");
  }

  // 8. Specificity: contains a digit.
  const digitImpact = /\d/.test(s) ? 3 : 0;
  score += digitImpact;
  signals.push({
    signal: "specificity",
    impact: digitImpact,
    detail: digitImpact > 0 ? "Contains a number (specificity cue)." : "No numbers.",
  });

  score = Math.max(0, Math.min(100, Math.round(score)));
  const band = bandFor(score);

  if (suggestions.length === 0) {
    suggestions.push(
      "Subject looks strong — A/B test 2–3 variants to confirm with your audience.",
    );
  }

  const assumptions: string[] = [
    "Rule-based heuristic scoring — NOT machine learning and NOT a deliverability guarantee. It cannot predict open rates or inbox placement.",
    "The spam-trigger list is a transparent heuristic, not a real spam filter; mailbox providers use far more signals.",
    "Length guidance (30–50 chars) is a display rule of thumb, not a ranking factor.",
  ];

  return {
    subject: s,
    charCount,
    score,
    band,
    signals,
    suggestions,
    warnings,
    assumptions,
  };
}

/**
 * mountToolUI contract — runTool wrapper around testSubjectLine().
 *
 * Input ids: `subjectLine` (required text), `audienceHint` (optional text).
 * Output ids: `score`, `band`, `checkResults`, `truncationPreview`,
 * `warnings`, `suggestions`, `audienceNote` — matching meta.ts outputs.
 *
 * `audienceHint` is accepted for labeling/future use only; it does NOT
 * change the heuristic score (stated in the returned audienceNote and in
 * meta.ts assumptions).
 */
export interface ToolRunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Approximate display limits for the truncation preview. These are
 * widely-used approximations of common clients, NOT measured guarantees —
 * clients change their UI and fonts, so the client names say "approx".
 */
export const TRUNCATION_CLIENTS: ReadonlyArray<{
  client: string;
  visibleChars: number;
}> = [
  { client: "iPhone Mail app (approx)", visibleChars: 41 },
  { client: "Gmail on desktop (approx)", visibleChars: 70 },
  { client: "Outlook on desktop (approx)", visibleChars: 60 },
];

export function runTool(values: Record<string, unknown>): ToolRunResult {
  const raw = values["subjectLine"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      ok: false,
      error: "Enter a subject line to test.",
    };
  }

  const audienceRaw = values["audienceHint"];
  let audienceHint = "";
  if (audienceRaw !== undefined && audienceRaw !== null && audienceRaw !== "") {
    if (typeof audienceRaw !== "string") {
      return { ok: false, error: "Audience hint must be text." };
    }
    audienceHint = audienceRaw.trim();
  }

  const result = testSubjectLine(raw);

  const checkResults = {
    columns: ["Check", "Result", "Detail"],
    rows: result.signals.map((s) => [
      s.signal,
      s.impact >= 0 ? "Pass" : "Fail",
      s.detail,
    ]),
  };

  const truncationPreview = {
    columns: ["Email client", "Visible characters (approx)"],
    rows: TRUNCATION_CLIENTS.map((c) => [
      c.client,
      String(Math.min(result.charCount, c.visibleChars)),
    ]),
  };

  const audienceNote =
    audienceHint.length > 0
      ? `Audience hint noted ("${audienceHint}") — it does not change the heuristic score.`
      : "No audience hint provided.";

  return {
    ok: true,
    values: {
      score: result.score,
      band: result.band,
      checkResults,
      truncationPreview,
      warnings: result.warnings,
      suggestions: result.suggestions,
      audienceNote,
    },
  };
}
