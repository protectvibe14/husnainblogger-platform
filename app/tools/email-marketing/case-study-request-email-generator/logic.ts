/**
 * Case Study Request Email Generator — pure logic (tool-437).
 *
 * ASSEMBLY, NOT AI: the email is assembled from FIXED template/part banks
 * bundled below — no network, no model, no randomness. Variant selection is a
 * deterministic hash of the inputs, so identical inputs always produce
 * identical output. Copy says "templates", never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - SUBJECT_TEMPLATES: 10 subject-line patterns ({clientName}, {resultMetric})
 * - OPENERS: 6 greeting openers (2 per tone: formal/friendly/casual)
 * - ASK_FRAMINGS: 12 ask paragraphs (4 per format: written/video/quote)
 * - METRIC_LINES: 5 ways to cite the result metric ({resultMetric})
 * - EASE_LINES: 5 "make it easy" lines
 * - CLOSERS: 6 closers (2 per tone)
 * - SIGNOFFS: 4 sign-offs (fixed set; "[Your Name]" placeholder keeps a
 *   fallback and is never rendered empty)
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK / RTL
 *   count as one character each.
 * - Over-long inputs are TRUNCATED with a visible notice in the body draft.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 * - The generated draft is scanned for repeated-word patterns with a visible
 *   notice when found.
 */

export const SUBJECT_COUNT = 5;

/** Documented input length caps (Unicode code points). */
export const MAX_CLIENT_NAME_CHARS = 60;
export const MAX_RESULT_METRIC_CHARS = 80;

export const FORMATS = ['written', 'video', 'quote'] as const;
export const TONES = ['formal', 'friendly', 'casual'] as const;

/** 10 subject-line patterns. Placeholders: {clientName}, {resultMetric}. */
export const SUBJECT_TEMPLATES: readonly string[] = [
  'Quick favor, {clientName}?',
  'Can we feature your story, {clientName}?',
  'Your results ({resultMetric}) — mind if we share them?',
  'A small ask about your experience',
  '{clientName}, would you be in a case study?',
  'Loved working together — one quick request',
  'Your story could help others like you',
  'Featuring {resultMetric} — with your permission?',
  '2 minutes to help other clients?',
  'Can I share your success story?',
];

/** 6 greeting openers, 2 per tone (formal / friendly / casual). */
export const OPENERS: Record<string, readonly string[]> = {
  formal: [
    'I hope this message finds you well. I wanted to reach out regarding the results you have achieved.',
    'It has been a pleasure working with you, and I wanted to ask a small favor related to your experience.',
  ],
  friendly: [
    'Hope you are doing well! I had a quick favor to ask about your experience with us.',
    'Thanks again for being such a great client — I wanted to reach out with a small request.',
  ],
  casual: [
    'Hey! Quick one — I would love your help with something.',
    "Hope all is good on your end! Got a tiny favor to ask.",
  ],
};

/** 12 ask paragraphs, 4 per format. */
export const ASK_FRAMINGS: Record<string, readonly string[]> = {
  written: [
    "Would you be open to a written case study about your results? It would be a short 20–30 minute chat, and I'd write everything up — you'd just review and approve the final draft before anything goes live.",
    "I'm putting together a written case study featuring clients who got great results. It takes one short call; I handle the writing, and you get final approval on every word.",
    "Would you let me feature your story as a written case study? I'll send the questions in advance, keep the call under 30 minutes, and share the draft for your sign-off first.",
    "I'd love to turn your results into a written case study. You talk for 20 minutes, I do the rest — and nothing publishes without your approval.",
  ],
  video: [
    "Would you be open to a quick video case study? It's a relaxed 15-minute recorded call — no scripts, no retakes required — and I'd send you the final edit for approval first.",
    "I'm filming short video case studies with clients like you. It takes 15 minutes on a recorded call, I handle all the editing, and you approve the cut before it goes anywhere.",
    "Would you record a short video case study with me? Just a casual conversation about your results — I'll edit it down to 2–3 minutes and you'll sign off before publishing.",
    "I'd love to feature you in a video case study. One 15-minute call, zero prep needed, and the final video only goes live with your thumbs-up.",
  ],
  quote: [
    "Could I feature a one-sentence quote from you about your results? Just reply to this email with whatever comes to mind — I'll polish the wording and send it back for your approval.",
    "Would you share a short quote I can use on our site? Two sentences max, nothing formal — and you'd approve the exact wording before it's published.",
    "I'm collecting one-line quotes from clients who saw strong results. If you're willing, just reply with a sentence or two in your own words.",
    "Could I quote you? A single sentence about what changed for you would be perfect — you'll see the final version before I use it anywhere.",
  ],
};

/** 5 ways to cite the result metric. Placeholder: {resultMetric}. */
export const METRIC_LINES: readonly string[] = [
  'Seeing you hit {resultMetric} has been one of the highlights of my year.',
  'Your result — {resultMetric} — is exactly the kind of story other clients need to hear.',
  'The {resultMetric} result you achieved speaks for itself.',
  'Results like {resultMetric} are why I love this work.',
  'Not everyone gets to {resultMetric} — your story stands out.',
];

/** 5 "make it easy" lines. */
export const EASE_LINES: readonly string[] = [
  "I'll send the questions in advance so nothing catches you off guard.",
  "I've made it as easy as possible: one short call, and I handle everything else.",
  'Total time on your end is under 30 minutes — I promise to keep it snappy.',
  "You don't need to prepare anything; just show up and tell your story.",
  "I'll draft everything and send it to you for approval before anything is published.",
];

/** 6 closers, 2 per tone. */
export const CLOSERS: Record<string, readonly string[]> = {
  formal: [
    "Thank you for considering this — I completely understand if the timing isn't right.",
    "I'd be grateful for your participation, whenever suits your schedule.",
  ],
  friendly: [
    'Either way, thanks for being an awesome client. Let me know what you think!',
    "No pressure at all — just let me know if you're up for it.",
  ],
  casual: [
    "Totally fine to say no, btw — just thought I'd ask!",
    "Let me know if you're in — would mean a lot!",
  ],
};

/** 4 fixed sign-offs. */
export const SIGNOFFS: readonly string[] = [
  'Best regards',
  'Warmly',
  'Cheers',
  'Thanks so much',
];

/** Unicode code-point length (emoji / CJK / RTL each count as 1). */
function cpLength(s: string): number {
  return [...s].length;
}

/** Truncate to max code points; returns [text, wasTruncated]. */
function truncateCp(s: string, max: number): [string, boolean] {
  const cps = [...s];
  if (cps.length <= max) return [s, false];
  return [cps.slice(0, max).join(''), true];
}

/** Escape user text for plain-text output (no markup may render). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Fill {placeholder} tokens from a map; unknown tokens are left as-is. */
function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in vars ? vars[key] : m,
  );
}

/** Deterministic FNV-style hash of the canonical input tuple. */
export function hashInputs(clientName: string, resultMetric: string, format: string, tone: string): number {
  const s = JSON.stringify([clientName, resultMetric, format, tone]);
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic pick: index = (hash + salt) mod length. */
function pick<T>(bank: readonly T[], h: number, salt: number): T {
  return bank[(h + salt) % bank.length];
}

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const { clientName, resultMetric, format, tone } = values;

  if (!nonEmptyString(clientName)) {
    return { ok: false, error: 'Please enter the client name.' };
  }
  if (!nonEmptyString(resultMetric)) {
    return { ok: false, error: 'Please enter the result metric (e.g. "doubled email signups in 60 days").' };
  }
  if (typeof format !== 'string' || !(FORMATS as readonly string[]).includes(format)) {
    return { ok: false, error: 'Please choose a format: written, video, or quote.' };
  }
  if (typeof tone !== 'string' || !(TONES as readonly string[]).includes(tone)) {
    return { ok: false, error: 'Please choose a tone: formal, friendly, or casual.' };
  }

  let name = (clientName as string).trim();
  let metric = (resultMetric as string).trim();
  const notices: string[] = [];

  const [n2, nTrunc] = truncateCp(name, MAX_CLIENT_NAME_CHARS);
  if (nTrunc) {
    notices.push(`Note: the client name was truncated to ${MAX_CLIENT_NAME_CHARS} characters.`);
    name = n2;
  }
  const [m2, mTrunc] = truncateCp(metric, MAX_RESULT_METRIC_CHARS);
  if (mTrunc) {
    notices.push(`Note: the result metric was truncated to ${MAX_RESULT_METRIC_CHARS} characters.`);
    metric = m2;
  }

  const escName = escapeHtml(name);
  const escMetric = escapeHtml(metric);
  const h = hashInputs(name, metric, format as string, tone as string);
  const vars = { clientName: escName, resultMetric: escMetric };

  // 5 distinct subject lines: step 3 is coprime with bank size 10.
  const subjectOptions: string[] = [];
  for (let i = 0; i < SUBJECT_COUNT; i++) {
    subjectOptions.push(fill(SUBJECT_TEMPLATES[(h + i * 3) % SUBJECT_TEMPLATES.length], vars));
  }

  const opener = pick(OPENERS[tone as string], h, 11);
  const metricLine = fill(pick(METRIC_LINES, h, 23), vars);
  const ask = pick(ASK_FRAMINGS[format as string], h, 37);
  const ease = pick(EASE_LINES, h, 53);
  const closer = pick(CLOSERS[tone as string], h, 67);
  const signoff = pick(SIGNOFFS, h, 79);

  const lines = [
    `Hi ${escName},`,
    '',
    opener,
    '',
    metricLine,
    '',
    ask,
    '',
    ease,
    '',
    closer,
    '',
    `${signoff},`,
    '[Your Name]',
  ];
  for (const n of notices) {
    lines.push('', n);
  }
  const bodyDraft = lines.join('\n');

  // Repeated-word safety scan: flag accidental stutters in the draft.
  if (/(\b[\p{L}\p{N}']+\b)([ ,]?\1){2,}/iu.test(bodyDraft)) {
    return { ok: true, values: { subjectOptions, bodyDraft: bodyDraft + '\n\nNote: a repeated-word pattern was detected — please proofread before sending.' } };
  }

  return { ok: true, values: { subjectOptions, bodyDraft } };
}
