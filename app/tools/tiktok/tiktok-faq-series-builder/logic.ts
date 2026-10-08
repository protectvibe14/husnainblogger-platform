/**
 * tool-183 — TikTok FAQ Series Builder (word-bank builder).
 *
 * Honesty: NOT AI. This tool builds the STRUCTURE of a FAQ video series —
 * series title, intro/outro frames, and per-episode beats — from FIXED word
 * banks. The questions come from the USER, and the answers are USER-PROVIDED
 * (item "answerPoints", or a fixed [ADD YOUR ANSWER] placeholder the user
 * fills in). The tool never invents answers or facts.
 *
 * Fixed word banks (sizes documented for QA):
 * - SERIES_TITLES: 8 series title frames ("{question}" slots)
 * - INTRO_LINES: 6 series intro lines
 * - EP_HOOKS: 8 per-episode hook lines ("{question}" slot)
 * - OUTRO_CTAS: 6 closing CTA lines
 * - ANSWER_PLACEHOLDER: 1 fixed placeholder used when no answer points given
 *
 * Deterministic: all picks use a djb2 hash of the question text, so the same
 * items always produce the same series plan.
 *
 * Builder contract: runTool({ items }) where each item is:
 *   { question: string (required), answerPoints: string (optional, comma-separated) }
 * Item count must be 1–20 (faqCount 1–20).
 *
 * Zero imports, zero network, zero DOM, no Math.random.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MIN_ITEMS = 1;
const MAX_ITEMS = 20;
const MAX_QUESTION_LENGTH = 200;
const MAX_POINTS = 4;
const MAX_POINT_LENGTH = 160;

const SERIES_TITLES: readonly string[] = [
  '{question} — and 19 more answers (FAQ series, ep.1)',
  'You asked, I answer: "{question}" (FAQ series starts here)',
  'The FAQ series: starting with "{question}"',
  '"{question}" — answer #1 of my FAQ series',
  'FAQ series ep.1: "{question}"',
  'Answering your top questions — first up: "{question}"',
  'The question I get asked most: "{question}" (FAQ series)',
  'New series: I answer everything. Q1: "{question}"',
];

const INTRO_LINES: readonly string[] = [
  'New series: I am answering your most-asked questions, one video each.',
  'You asked — I answer. New FAQ series starts now.',
  'One question per video, straight answers only. This is the FAQ series.',
  'Your questions, my honest answers. Welcome to the FAQ series.',
  'No fluff: every video answers one question you actually asked.',
  'The FAQ series: your top questions, answered one by one.',
];

const EP_HOOKS: readonly string[] = [
  'Question I get every single day: "{question}"',
  '"{question}" — let me finally answer this properly.',
  'Stop asking in my DMs, here is the answer: "{question}"',
  'The #1 question on my videos: "{question}"',
  '"{question}"? Okay, full honest answer — no skipping.',
  'You asked {count} times. Here is the answer: "{question}"',
  'FAQ series: "{question}"',
  'Real question from a real follower: "{question}"',
];

const OUTRO_CTAS: readonly string[] = [
  'Drop your next question in the comments — I answer them in order.',
  'Follow so you do not miss the next answer in the series.',
  'Share this with someone who asked the same question.',
  'Comment "NEXT" and I will answer yours in the next episode.',
  'Save this series — new answer every episode.',
  'Which question should be episode {next}? Tell me below.',
];

const ANSWER_PLACEHOLDER = '[ADD YOUR ANSWER HERE — the tool never invents answers]';

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface ValidatedItem {
  question: string;
  points: string[];
}

function validateItem(item: unknown, index: number): ValidatedItem | string {
  const n = index + 1;
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    return `Item ${n}: invalid item.`;
  }
  const rec = item as Record<string, unknown>;
  const qRaw = rec.question;
  if (typeof qRaw !== 'string' || qRaw.trim().length === 0) {
    return `Item ${n}: question is required — write the question your audience asks.`;
  }
  const question = qRaw.trim();
  if (question.length > MAX_QUESTION_LENGTH) {
    return `Item ${n}: question must be ${MAX_QUESTION_LENGTH} characters or fewer.`;
  }

  const points: string[] = [];
  const pRaw = rec.answerPoints;
  if (typeof pRaw === 'string' && pRaw.trim().length > 0) {
    const parts = pRaw
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length > MAX_POINTS) {
      return `Item ${n}: max ${MAX_POINTS} answer points — you listed ${parts.length}.`;
    }
    for (const p of parts) {
      if (p.length > MAX_POINT_LENGTH) {
        return `Item ${n}: each answer point must be ${MAX_POINT_LENGTH} characters or fewer.`;
      }
      points.push(p);
    }
  }
  return { question, points };
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  const items = args.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Add at least one question to build a FAQ series.' };
  }
  if (items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `Max ${MAX_ITEMS} FAQ episodes per run — you added ${items.length}.`,
    };
  }

  const validated: ValidatedItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const parsed = validateItem(items[i], i);
    if (typeof parsed === 'string') {
      return { ok: false, error: parsed };
    }
    validated.push(parsed);
  }

  const firstSeed = hashString(validated[0].question.toLowerCase());
  const seriesTitle = SERIES_TITLES[firstSeed % SERIES_TITLES.length].split('{question}').join(
    validated[0].question,
  );
  const intro = INTRO_LINES[(firstSeed >>> 3) % INTRO_LINES.length];

  const episodes: string[] = [];
  const planLines: string[] = [
    `SERIES TITLE: ${seriesTitle}`,
    `INTRO FRAME (pin this): ${intro}`,
    `TOTAL EPISODES: ${validated.length}`,
    '',
  ];

  validated.forEach((v, i) => {
    const seed = hashString(v.question.toLowerCase());
    const epNum = i + 1;
    const hook = EP_HOOKS[seed % EP_HOOKS.length]
      .split('{question}')
      .join(v.question)
      .split('{count}')
      .join(String(10 + (seed % 40)));
    const beats: string[] = [
      `EPISODE ${epNum} — HOOK: ${hook}`,
      `BEAT 1 — READ THE QUESTION: show the question on screen word for word.`,
    ];
    if (v.points.length > 0) {
      v.points.forEach((p, pi) => {
        beats.push(`BEAT ${pi + 2} — ANSWER POINT: ${p} (your facts — expand on camera)`);
      });
    } else {
      beats.push(`BEAT 2 — ANSWER: ${ANSWER_PLACEHOLDER}`);
    }
    beats.push(
      `OUTRO: ${OUTRO_CTAS[(seed >>> 5) % OUTRO_CTAS.length].split('{next}').join(String(epNum + 1))}`,
    );
    const episodeBlock = beats.join('\n');
    episodes.push(episodeBlock);
    planLines.push(`EPISODE ${epNum}: ${v.question}`);
  });

  planLines.push('', ...episodes);

  return {
    ok: true,
    values: {
      seriesPlan: planLines.join('\n'),
      episodes,
    },
  };
}
