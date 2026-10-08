/**
 * tool-383 — X Viral Template Rewriter (generator)
 *
 * GENERATOR, NOT AI. Rewraps the user's draft into 3 rewrites following one
 * of 4 FIXED viral-pattern frames: stat-hook, question-hook, hot-take,
 * build-in-public. This is a STATIC PATTERN LIBRARY — it is not backed by
 * live viral data and never claims to be. The draft's own words are reused
 * ({core}); no facts, stats, or numbers are invented.
 *
 * Weighted character budget (approximating X's counting rules):
 *   - every URL (http(s)://...) counts as 23 characters (t.co wrapping)
 *   - every other character counts as 1
 *   - free-account limit: 280 weighted characters
 *   Approximation: X also weights some non-Latin scripts and emoji
 *   differently; the tool uses the simple 23-per-URL / 1-per-char rule and
 *   says so in its assumptions.
 *
 * Fixed, documented rules:
 *   1. Each template has 3 frames; {core} = the user's draft, trimmed at a
 *      word boundary (+ "…") so the whole rewrite fits 280 weighted chars.
 *   2. "Already on-template" check: a documented regex per template
 *      detects drafts that already match the chosen pattern; the tool then
 *      notes "light polish only" instead of implying a full rewrite.
 *   3. Same draft + template -> same 3 rewrites, always (deterministic).
 *
 * No network, no DOM, no randomness, zero imports.
 */

export const CHAR_LIMIT = 280;
export const URL_WEIGHT = 23;

export type TemplateKey = 'stat-hook' | 'question-hook' | 'hot-take' | 'build-in-public';

export interface TemplateDef {
  key: TemplateKey;
  label: string;
  frames: [string, string, string];
  /** Detects drafts that already follow this pattern (light polish only). */
  alreadyMatches: RegExp;
  alreadyHint: string;
}

/**
 * 4 curated viral-pattern templates × 3 frames each.
 * Frames are pattern wrappers — {core} is always the user's own draft text.
 */
export const TEMPLATES: TemplateDef[] = [
  {
    key: 'stat-hook',
    label: 'Stat Hook',
    frames: [
      'Most people get this wrong:\n{core}',
      '{core}\n\nThe pattern is obvious once you see it.',
      'Read this twice:\n{core}',
    ],
    alreadyMatches: /(\d+%|\d+x\b|\$\d)/i,
    alreadyHint: 'contains a number/stat-like hook',
  },
  {
    key: 'question-hook',
    label: 'Question Hook',
    frames: [
      'What if I told you this?\n{core}',
      '{core}\n\nAgree or disagree?',
      'Nobody asks this enough:\n{core}',
    ],
    alreadyMatches: /\?\s*$/,
    alreadyHint: 'already ends with a question',
  },
  {
    key: 'hot-take',
    label: 'Hot Take',
    frames: [
      'Unpopular opinion: {core}',
      '{core}\n\nFight me in the replies.',
      "I'll die on this hill: {core}",
    ],
    alreadyMatches: /(unpopular opinion|hot take|controversial)/i,
    alreadyHint: 'already reads as a hot take',
  },
  {
    key: 'build-in-public',
    label: 'Build in Public',
    frames: [
      'Building in public, day by day:\n{core}',
      '{core}\n\nHere is what I am learning in real time.',
      'Transparent update:\n{core}',
    ],
    alreadyMatches: /(building in public|day \d+|in public|transparent update)/i,
    alreadyHint: 'already framed as build-in-public',
  },
];

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

/** Weighted char count: URLs count as 23, everything else as 1. */
export function weightedLength(text: string): number {
  let count = 0;
  let last = 0;
  URL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(text)) !== null) {
    count += (m.index - last) + URL_WEIGHT;
    last = m.index + m[0].length;
  }
  count += text.length - last;
  return count;
}

/** Trim at a word boundary (single line), appending "…" when trimmed. */
function trimCore(core: string, maxChars: number): string {
  const s = core.replace(/\s+/g, ' ').trim();
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, Math.max(0, maxChars - 1));
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) return cut.slice(0, lastSpace) + '…';
  return cut + '…';
}

export interface RewriteResult {
  template: TemplateKey;
  rewrites: string[];
  fitNote: string;
  alreadyOnTemplate: boolean;
}

export function rewriteDraft(draftRaw: unknown, templateRaw: unknown): RewriteResult {
  const draft = typeof draftRaw === 'string' ? draftRaw.replace(/\s+/g, ' ').trim() : '';
  if (draft.length === 0) {
    throw new Error('Please paste your draft text first.');
  }
  if (draft.length > 2000) {
    throw new Error('Draft is too long — keep it under 2,000 characters.');
  }

  const key = typeof templateRaw === 'string' ? templateRaw.trim() : '';
  const def = TEMPLATES.find((t) => t.key === key);
  if (!def) {
    throw new Error('Please choose a template: stat-hook, question-hook, hot-take, or build-in-public.');
  }

  const alreadyOnTemplate = def.alreadyMatches.test(draft);

  const rewrites = def.frames.map((frame) => {
    // Budget for {core} = limit minus everything else in the frame.
    const overhead = weightedLength(frame.split('{core}').join(''));
    const coreBudget = Math.max(1, CHAR_LIMIT - overhead - 1);
    const core = trimCore(draft, coreBudget);
    const out = frame.split('{core}').join(core);
    // Safety net: if the weighting math slipped, trim core harder (loop-free).
    if (weightedLength(out) > CHAR_LIMIT) {
      const tighter = trimCore(draft, Math.max(1, coreBudget - 10));
      return frame.split('{core}').join(tighter);
    }
    return out;
  });

  const minRemaining = Math.min(...rewrites.map((r) => CHAR_LIMIT - weightedLength(r)));
  const fitNote =
    `Template: ${def.label}. All 3 rewrites fit within ${CHAR_LIMIT} weighted characters ` +
    `(URLs count as ${URL_WEIGHT}; ${minRemaining} chars to spare on the tightest). ` +
    (alreadyOnTemplate
      ? `Your draft ${def.alreadyHint} — rewrites below are light polish on the same pattern.`
      : 'Note: these are pattern-library frames, not live trend data — pick the one that sounds most like you.');

  return { template: def.key, rewrites, fitNote, alreadyOnTemplate };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { draft: string, template: TemplateKey }.
 * Returns { rewrites: string[], fitNote: string }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const result = rewriteDraft(values['draft'], values['template']);
    return {
      ok: true,
      values: {
        rewrites: result.rewrites,
        fitNote: result.fitNote,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid input.' };
  }
}
