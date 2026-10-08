/**
 * tool-366 — Pinterest Pin Title A/B Scorer (scorer)
 *
 * Pure client-side heuristic scorer. Compares two pin titles against a
 * published, fixed rubric and declares a winner (A, B, or tie).
 *
 * HONESTY CONTRACT (from spec): this is a HEURISTIC RUBRIC ONLY. The
 * output must be labeled "heuristic estimate, not a prediction of Pinterest
 * ranking". It never claims to predict real CTR, impressions, or ranking.
 * No ML/AI claim is made anywhere — scoring is deterministic rule math.
 *
 * ------------------------------------------------------------------
 * PUBLISHED RUBRIC (fixed weights, v1). Mirrors content.methodology.
 * ------------------------------------------------------------------
 * Each title is scored 0-100 on five criteria:
 *
 *   Criterion        Weight  How it is earned
 *   ───────────────  ──────  ─────────────────────────────────────────────
 *   keywordPosition    30     Primary keyword (case-insensitive substring)
 *                            inside the first 40 chars → 100; keyword
 *                            present but later → 55; keyword given but
 *                            absent → 20. No keyword given → 60 (neutral,
 *                            equal for both titles).
 *   specificity        25     Points, capped at 100: +35 contains a number
 *                            (\d); +25 contains a LIST_WORDS word (bank: 20
 *                            words, e.g. "tips", "recipes", "checklist");
 *                            +20 contains "how to"/"how do"; +10 contains
 *                            a year (19xx/20xx); +10 has (parentheses).
 *   length             20     40-100 chars → 100; 25-39 → 70; <25 → 40;
 *                            >100 → 0 (and the -10 over-limit penalty below).
 *   actionLanguage     15     ≥1 ACTION_VERBS word (bank: 25 verbs,
 *                            whole-word, case-insensitive, e.g. "get",
 *                            "transform") → 100; else 45.
 *   curiosityGap       10     Contains "?" or a CURIOSITY_WORDS word
 *                            (bank: 15 words, e.g. "secret", "surprising",
 *                            "why") → 100; else 50.
 *
 *   totalScore = round(Σ weight × criterion / 100), then -10 if the title
 *   is over 100 chars (over-limit penalty). Floored at 0, capped at 100.
 *
 * English-centric limitation: the word banks are English. Non-Latin titles
 * are still scored but get a "limited heuristic coverage" note.
 *
 * Deterministic: same inputs → identical scores, always.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Title hard cap per spec; over-limit titles are penalized, not rejected. */
export const TITLE_MAX_CHARS = 100;

/** Flat penalty (points) applied to an over-limit title's total score. */
export const OVER_LIMIT_PENALTY = 10;

/** Criterion weights; must sum to 100. Exported so tests can verify this. */
export const CRITERION_WEIGHTS: Readonly<Record<string, number>> = {
  keywordPosition: 30,
  specificity: 25,
  length: 20,
  actionLanguage: 15,
  curiosityGap: 10,
};

/** Bank: 20 "list/specificity" words. */
export const LIST_WORDS: ReadonlyArray<string> = [
  'ways', 'tips', 'ideas', 'steps', 'recipes', 'hacks', 'secrets', 'guide',
  'guides', 'tutorial', 'tutorials', 'checklist', 'mistakes', 'reasons',
  'tricks', 'inspiration', 'plan', 'plans', 'diy', 'list',
];

/** Bank: 25 action verbs. */
export const ACTION_VERBS: ReadonlyArray<string> = [
  'get', 'try', 'make', 'create', 'discover', 'learn', 'start', 'grow',
  'save', 'build', 'transform', 'boost', 'unlock', 'master', 'plan',
  'cook', 'bake', 'decorate', 'organize', 'style', 'shop', 'wear',
  'plant', 'paint', 'craft',
];

/** Bank: 15 curiosity-gap words. */
export const CURIOSITY_WORDS: ReadonlyArray<string> = [
  'secret', 'secrets', 'surprising', 'never', 'actually', 'truth',
  'nobody', 'shocking', 'unexpected', 'why', 'what', 'mistake',
  'mistakes', 'hidden', 'revealed',
];

export type Winner = 'A' | 'B' | 'tie';

export interface TitleScore {
  title: string;
  totalScore: number;
  criteria: {
    keywordPosition: number;
    specificity: number;
    length: number;
    actionLanguage: number;
    curiosityGap: number;
  };
  overLimit: boolean;
}

function asNonEmptyString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

/** Whole-word, case-insensitive match against a bank. */
function bankHit(text: string, bank: ReadonlyArray<string>): boolean {
  const lower = ' ' + text.toLowerCase() + ' ';
  for (const word of bank) {
    if (lower.indexOf(' ' + word + ' ') !== -1) return true;
  }
  return false;
}

function scoreKeywordPosition(title: string, keyword: string): number {
  if (!keyword) return 60; // neutral when no keyword is given
  const idx = title.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return 20;
  return idx <= 40 ? 100 : 55;
}

function scoreSpecificity(title: string): number {
  let points = 0;
  if (/\d/.test(title)) points += 35;
  if (bankHit(title, LIST_WORDS)) points += 25;
  const lower = title.toLowerCase();
  if (lower.indexOf('how to') !== -1 || lower.indexOf('how do') !== -1) points += 20;
  if (/(19|20)\d{2}/.test(title)) points += 10;
  if (/\([^)]+\)/.test(title)) points += 10;
  return Math.min(100, points);
}

function scoreLength(title: string): number {
  const len = title.length;
  if (len > TITLE_MAX_CHARS) return 0;
  if (len >= 40) return 100;
  if (len >= 25) return 70;
  return 40;
}

function scoreActionLanguage(title: string): number {
  return bankHit(title, ACTION_VERBS) ? 100 : 45;
}

function scoreCuriosityGap(title: string): number {
  if (title.indexOf('?') !== -1) return 100;
  return bankHit(title, CURIOSITY_WORDS) ? 100 : 50;
}

export function scoreTitle(title: string, keyword: string): TitleScore {
  const overLimit = title.length > TITLE_MAX_CHARS;
  const criteria = {
    keywordPosition: scoreKeywordPosition(title, keyword),
    specificity: scoreSpecificity(title),
    length: scoreLength(title),
    actionLanguage: scoreActionLanguage(title),
    curiosityGap: scoreCuriosityGap(title),
  };
  let total =
    (CRITERION_WEIGHTS.keywordPosition * criteria.keywordPosition +
      CRITERION_WEIGHTS.specificity * criteria.specificity +
      CRITERION_WEIGHTS.length * criteria.length +
      CRITERION_WEIGHTS.actionLanguage * criteria.actionLanguage +
      CRITERION_WEIGHTS.curiosityGap * criteria.curiosityGap) / 100;
  total = Math.round(total);
  if (overLimit) total = Math.max(0, total - OVER_LIMIT_PENALTY);
  return { title, totalScore: Math.min(100, total), criteria, overLimit };
}

const HEURISTIC_LABEL =
  'Heuristic estimate, not a prediction of Pinterest ranking or CTR.';

export function runTool(values: Record<string, unknown>): ToolResult {
  const titleA = asNonEmptyString(values['titleA']);
  const titleB = asNonEmptyString(values['titleB']);
  const keyword = asNonEmptyString(values['primaryKeyword']);

  if (!titleA || !titleB) {
    return { ok: false, error: 'Enter two pin titles to compare.' };
  }

  const a = scoreTitle(titleA, keyword);
  const b = scoreTitle(titleB, keyword);

  let winner: Winner = 'tie';
  if (a.totalScore > b.totalScore) winner = 'A';
  else if (b.totalScore > a.totalScore) winner = 'B';

  const notes: string[] = [HEURISTIC_LABEL];

  const identical =
    titleA.toLowerCase().replace(/\s+/g, ' ') ===
    titleB.toLowerCase().replace(/\s+/g, ' ');
  if (identical) {
    notes.push('Both titles are identical, so this comparison is a tie.');
  }
  if (a.overLimit) {
    notes.push(
      'Title A is over 100 characters — scored with a 10-point over-limit penalty.',
    );
  }
  if (b.overLimit) {
    notes.push(
      'Title B is over 100 characters — scored with a 10-point over-limit penalty.',
    );
  }
  if (!/[A-Za-z]/.test(titleA + ' ' + titleB)) {
    notes.push(
      'Limited heuristic coverage: the word banks are English-based, so scores for non-Latin titles are rough.',
    );
  }
  if (!keyword) {
    notes.push(
      'No primary keyword was given, so the keyword-position criterion is neutral for both titles. Add one for a sharper comparison.',
    );
  }

  const columns = [
    'Title',
    'Total score',
    'Keyword position (30)',
    'Specificity (25)',
    'Length (20)',
    'Action language (15)',
    'Curiosity gap (10)',
  ];
  const row = (s: TitleScore): string[] => [
    s.title,
    String(s.totalScore),
    String(s.criteria.keywordPosition),
    String(s.criteria.specificity),
    String(s.criteria.length),
    String(s.criteria.actionLanguage),
    String(s.criteria.curiosityGap),
  ];

  return {
    ok: true,
    values: {
      scores: { columns, rows: [row(a), row(b)] },
      winner,
      notes,
    },
  };
}
