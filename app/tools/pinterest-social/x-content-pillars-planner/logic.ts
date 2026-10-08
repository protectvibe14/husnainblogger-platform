/**
 * tool-381 — X Content Pillars Planner (planner)
 *
 * PLANNER, NOT AI. Builds a 3–5 pillar content strategy for X (Twitter) from
 * a FIXED archetype bank — 12 pillar archetypes, each with a description
 * template and 3 example-topic templates (36 topic templates total).
 * Placeholders {niche} are filled with the user's niche text verbatim.
 *
 * Fixed, documented rules:
 *   1. The first pillar is ALWAYS the "Teach & How-To" archetype (education
 *      anchors most starter X strategies).
 *   2. The remaining (pillarCount - 1) pillars are picked by rotating through
 *      the other 11 archetypes from a deterministic offset = djb2(niche)
 *      mod 11. Same niche + same count -> same pillars, always.
 *   3. Narrow-niche rule: if the niche is a SINGLE word, pillar count is
 *      reduced to 3 with a note (a one-word niche rarely sustains 4–5
 *      genuinely distinct pillars; fewer pillars keeps each one meaty).
 *   4. Pillar names are unique by construction (archetype keys are unique).
 *
 * No network, no DOM, no randomness, zero imports. Deterministic.
 */

export interface Pillar {
  name: string;
  description: string;
  exampleTopics: string[];
}

interface Archetype {
  key: string;
  name: string;
  description: string;
  topics: [string, string, string];
}

/** 12 fixed pillar archetypes × 3 topic templates each = 36 topic templates. */
export const ARCHETYPES: Archetype[] = [
  {
    key: 'teach',
    name: 'Teach & How-To',
    description: 'Actionable {niche} lessons that help your audience get a result fast.',
    topics: [
      'The 3-step {niche} routine I recommend to every beginner',
      '{Niche} mistake I see daily (and the 2-minute fix)',
      'How to get your first win in {niche} this week',
    ],
  },
  {
    key: 'opinion',
    name: 'Strong Opinions',
    description: 'Clear {niche} takes that show how you think — the pillar that builds a point of view.',
    topics: [
      'Why most {niche} advice is backwards',
      'The {niche} hill I will die on',
      'Popular {niche} tactic I would never use again',
    ],
  },
  {
    key: 'build-public',
    name: 'Build in Public',
    description: 'Real-time {niche} updates: what you are trying, what works, what flops.',
    topics: [
      'Week 4 of my {niche} experiment: honest numbers',
      'Trying a new {niche} approach today — will report back',
      'What failed this month in my {niche} work (and the lesson)',
    ],
  },
  {
    key: 'stories',
    name: 'Stories & Proof',
    description: 'Personal {niche} stories and results that make your claims believable.',
    topics: [
      'How I went from zero to first {niche} result in 90 days',
      'The {niche} story nobody believed until I showed receipts',
      'What 1 year of {niche} taught me (thread)',
    ],
  },
  {
    key: 'questions',
    name: 'Questions & Prompts',
    description: 'Engagement-style {niche} posts that invite replies and start conversations.',
    topics: [
      'What is your biggest {niche} frustration right now?',
      'One {niche} question I wish someone had answered for me early',
      'Finish this: the best {niche} advice is ______',
    ],
  },
  {
    key: 'curated',
    name: 'Curated Resources',
    description: 'The best {niche} tools, links, and finds — you become the filter.',
    topics: [
      '5 free {niche} tools worth your time',
      'The only {niche} bookmark list you need this year',
      'I tested 7 {niche} apps so you do not have to',
    ],
  },
  {
    key: 'news',
    name: 'News & Trends',
    description: 'Timely {niche} updates with your quick take — keeps you relevant.',
    topics: [
      'Big {niche} news today — here is what it actually means',
      'This {niche} trend is overhyped. This one is not.',
      'What the latest {niche} update changes for beginners',
    ],
  },
  {
    key: 'case-studies',
    name: 'Case Studies & Breakdowns',
    description: 'Deep dives into real {niche} examples — your highest-value pillar.',
    topics: [
      'Breaking down a {niche} win, step by step',
      'I analyzed 10 {niche} examples. Here is the pattern.',
      'Case study: what this {niche} result really cost',
    ],
  },
  {
    key: 'myths',
    name: 'Myths & Misconceptions',
    description: '{Niche} myths, debunked — positions you as the honest voice.',
    topics: [
      '3 {niche} myths that keep beginners stuck',
      'No, you do not need X to succeed at {niche}',
      'The {niche} lie I believed for way too long',
    ],
  },
  {
    key: 'frameworks',
    name: 'Frameworks & Templates',
    description: 'Reusable {niche} systems your audience can copy — high save/share value.',
    topics: [
      'My exact {niche} checklist (steal it)',
      'The 4-part {niche} framework I use every week',
      'Copy-paste {niche} template: fill in the blanks',
    ],
  },
  {
    key: 'personal',
    name: 'Personal & Behind the Scenes',
    description: 'The human behind the {niche} account — builds trust and likability.',
    topics: [
      'Why I got into {niche} in the first place',
      'A normal workday in my {niche} life',
      'The {niche} goal I am chasing this quarter',
    ],
  },
  {
    key: 'predictions',
    name: 'Predictions & Hot Takes',
    description: 'Forward-looking {niche} calls — high engagement, revisit them later.',
    topics: [
      'My 3 {niche} predictions for next year',
      'Where {niche} is headed (and how to prepare)',
      'I bet this {niche} tactic dies within 12 months',
    ],
  },
];

export const MIN_PILLARS = 3;
export const MAX_PILLARS = 5;
export const DEFAULT_PILLARS = 4;

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function capitalizeFirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function fill(template: string, niche: string): string {
  return template
    .split('{niche}').join(niche)
    .split('{Niche}').join(capitalizeFirst(niche));
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function coercePillarCount(raw: unknown): number | null {
  if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
    return DEFAULT_PILLARS;
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

export interface PillarsPlan {
  niche: string;
  pillarCount: number;
  pillars: Pillar[];
  note: string;
}

/**
 * Build the pillar plan. Throws with a human-readable message on bad input
 * (runTool converts to { ok: false, error }).
 */
export function planContentPillars(nicheRaw: unknown, pillarCountRaw: unknown): PillarsPlan {
  const niche = asTrimmedString(nicheRaw);
  if (niche.length === 0) {
    throw new Error('Please enter your niche (e.g. "freelance copywriting").');
  }
  if (niche.length > 120) {
    throw new Error('Niche is too long — keep it under 120 characters.');
  }

  const count = coercePillarCount(pillarCountRaw);
  if (count === null || !Number.isInteger(count)) {
    throw new Error('Pillar count must be a whole number between 3 and 5.');
  }
  if (count < MIN_PILLARS || count > MAX_PILLARS) {
    throw new Error(`Pillar count must be between ${MIN_PILLARS} and ${MAX_PILLARS} — you asked for ${count}.`);
  }

  // Narrow-niche rule: single-word niche -> cap at 3 pillars with a note.
  let finalCount = count;
  let note: string;
  if (niche.split(/\s+/).length === 1 && count > 3) {
    finalCount = 3;
    note =
      `Your niche ("${niche}") reads quite narrow, so the plan uses 3 pillars instead of ${count} ` +
      'to keep each pillar distinct. Add a fourth pillar once clear sub-topics emerge.';
  } else {
    note =
      `${finalCount} distinct content pillars for "${niche}". ` +
      'Rotate through them weekly; pillar 1 (Teach & How-To) anchors the mix.';
  }

  // Pillar 1 is always Teach & How-To; the rest rotate deterministically.
  const teach = ARCHETYPES[0];
  const rest = ARCHETYPES.slice(1);
  const offset = djb2(niche.toLowerCase()) % rest.length;
  const picked: Archetype[] = [teach];
  for (let i = 0; i < finalCount - 1; i++) {
    picked.push(rest[(offset + i) % rest.length]);
  }

  const pillars: Pillar[] = picked.map((a) => ({
    name: a.name,
    description: fill(a.description, niche),
    exampleTopics: a.topics.map((t) => fill(t, niche)),
  }));

  return { niche, pillarCount: finalCount, pillars, note };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { niche: string, pillarCount: number|string }.
 * Returns { pillars: string[], planNote: string }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const plan = planContentPillars(values['niche'], values['pillarCount']);
    return {
      ok: true,
      values: {
        pillars: plan.pillars.map(
          (p, i) =>
            `${i + 1}. ${p.name} — ${p.description} Topic ideas: ${p.exampleTopics.join(' | ')}`
        ),
        planNote: plan.note,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid input.' };
  }
}
