/**
 * 90-Day Email Marketing Planner — pure logic (tool-441).
 *
 * CLIENT-SIDE DATE ARITHMETIC ONLY: builds a 90-day send calendar from the
 * user's start date, weekly frequency, chosen goal mix, and optional blackout
 * dates. The goal mix is USER INPUT, not a recommendation — the planner does
 * not advise which mix to pick. No network, no AI, no randomness.
 *
 * Fixed, documented rule set:
 * - Window: start date + 89 days (90 days total), all math in UTC.
 * - Send weekdays by emails/week: 1→[Tue], 2→[Tue,Thu], 3→[Tue,Wed,Thu],
 *   4→[Mon–Thu], 5→[Mon–Fri], 6→[Mon–Sat], 7→[every day].
 * - Goal mixes (presets, percentages sum to 100): 60/20/20, 50/30/20,
 *   40/30/30, 70/20/10, 30/40/30 (nurture/promo/content). Each preset maps to
 *   a fixed hand-written 10-slot interleave pattern (counts documented below).
 * - Content pillars: 6 fixed sub-topics per pillar, cycled deterministically.
 * - Blackout dates (YYYY-MM-DD, one per line) are skipped, counted in totals.
 * - Milestones at day 1 / 30 / 60 / 90 with cumulative sent counts.
 *
 * Deterministic: same inputs → identical output, always.
 */

export const PLAN_DAYS = 90;

/** Send weekdays (0=Sun..6=Sat, UTC) per weekly frequency. */
export const SEND_WEEKDAYS: Record<number, readonly number[]> = {
  1: [2],
  2: [2, 4],
  3: [2, 3, 4],
  4: [1, 2, 3, 4],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type Pillar = 'nurture' | 'promo' | 'content';

export const SLOT_TYPES: Record<Pillar, string> = {
  nurture: 'Nurture email',
  promo: 'Promo email',
  content: 'Content email',
};

/**
 * Goal-mix presets → fixed 10-slot interleave patterns.
 * Counts per pattern: 60/20/20 → n6/p2/c2; 50/30/20 → n5/p3/c2;
 * 40/30/30 → n4/p3/c3; 70/20/10 → n7/p2/c1; 30/40/30 → n3/p4/c3.
 */
export const GOAL_MIXES: Record<string, { nurture: number; promo: number; content: number }> = {
  'Nurture 60% / Promo 20% / Content 20%': { nurture: 60, promo: 20, content: 20 },
  'Nurture 50% / Promo 30% / Content 20%': { nurture: 50, promo: 30, content: 20 },
  'Nurture 40% / Promo 30% / Content 30%': { nurture: 40, promo: 30, content: 30 },
  'Nurture 70% / Promo 20% / Content 10%': { nurture: 70, promo: 20, content: 10 },
  'Nurture 30% / Promo 40% / Content 30%': { nurture: 30, promo: 40, content: 30 },
};

const N: Pillar = 'nurture';
const P: Pillar = 'promo';
const C: Pillar = 'content';

export const MIX_PATTERNS: Record<string, readonly Pillar[]> = {
  'Nurture 60% / Promo 20% / Content 20%': [N, N, P, N, C, N, N, P, N, C],
  'Nurture 50% / Promo 30% / Content 20%': [N, P, N, C, N, P, N, P, N, C],
  'Nurture 40% / Promo 30% / Content 30%': [N, P, C, N, P, C, N, C, P, N],
  'Nurture 70% / Promo 20% / Content 10%': [N, N, N, P, N, N, C, N, P, N],
  'Nurture 30% / Promo 40% / Content 30%': [N, P, P, C, N, P, C, P, N, C],
};

/** 6 fixed content-pillar topics per pillar, cycled deterministically. */
export const PILLAR_TOPICS: Record<Pillar, readonly string[]> = {
  nurture: [
    'Behind-the-scenes story',
    'Quick win tip',
    'Customer spotlight',
    'Founder note',
    'FAQ answer',
    'Lesson learned',
  ],
  promo: [
    'Product launch',
    'Limited-time offer',
    'Bundle deal',
    'New feature announcement',
    'Seasonal promotion',
    'Last-chance reminder',
  ],
  content: [
    'Blog digest',
    'Curated resources',
    'Industry news take',
    'How-to guide',
    'Case study feature',
    'Video/asset drop',
  ],
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface YMD {
  y: number;
  m: number;
  d: number;
}

/** Parse strict YYYY-MM-DD; null when malformed or not a real date. */
export function parseISODate(s: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return { y, m: mo, d };
}

function toDate(v: YMD): Date {
  return new Date(Date.UTC(v.y, v.m - 1, v.d));
}

export function isoOf(dt: Date): string {
  const p = (x: number) => String(x).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

/** "2026-10-06 (Tue)" label for a date. */
export function dateLabel(dt: Date): string {
  return `${isoOf(dt)} (${WEEKDAY_LABELS[dt.getUTCDay()]})`;
}

export interface PlanRow {
  date: string;
  slotType: string;
  contentPillar: string;
}

export interface PlanResult {
  calendar: { columns: string[]; rows: string[][] };
  milestones: string[];
  totals: string;
}

/** Build the 90-day plan. Assumes validated inputs. */
export function buildPlan(
  start: YMD,
  emailsPerWeek: number,
  goalMix: string,
  blackouts: Set<string>,
): PlanResult {
  const sendDays = new Set(SEND_WEEKDAYS[emailsPerWeek]);
  const pattern = MIX_PATTERNS[goalMix];
  const pillarCount: Record<Pillar, number> = { nurture: 0, promo: 0, content: 0 };

  const rows: PlanRow[] = [];
  let skipped = 0;
  for (let n = 0; n < PLAN_DAYS; n++) {
    const dt = new Date(toDate(start).getTime() + n * 86400000);
    const iso = isoOf(dt);
    if (blackouts.has(iso)) {
      if (sendDays.has(dt.getUTCDay())) skipped++;
      continue;
    }
    if (!sendDays.has(dt.getUTCDay())) continue;
    const pillar = pattern[rows.length % pattern.length];
    const topic = PILLAR_TOPICS[pillar][pillarCount[pillar] % PILLAR_TOPICS[pillar].length];
    pillarCount[pillar]++;
    rows.push({ date: dateLabel(dt), slotType: SLOT_TYPES[pillar], contentPillar: topic });
  }

  const total = rows.length;
  const byPillar = (pl: Pillar) => rows.filter((r) => r.slotType === SLOT_TYPES[pl]).length;
  const mixLine = `nurture ${byPillar('nurture')} / promo ${byPillar('promo')} / content ${byPillar('content')}`;

  const cumulative = (throughDay: number): string => {
    const cut = new Date(toDate(start).getTime() + (throughDay - 1) * 86400000);
    const cutIso = isoOf(cut);
    const sent = rows.filter((r) => r.date.slice(0, 10) <= cutIso);
    const c = (pl: Pillar) => sent.filter((r) => r.slotType === SLOT_TYPES[pl]).length;
    return `${sent.length} emails sent (nurture ${c('nurture')} / promo ${c('promo')} / content ${c('content')})`;
  };

  const milestones = [
    `Day 1 (${dateLabel(toDate(start))}): kickoff — the first send of your 90-day plan goes out.`,
    `Day 30 (${dateLabel(new Date(toDate(start).getTime() + 29 * 86400000))}): first-month checkpoint — ${cumulative(30)}. Review opens and clicks, then keep or adjust the mix.`,
    `Day 60 (${dateLabel(new Date(toDate(start).getTime() + 59 * 86400000))}): second-month checkpoint — ${cumulative(60)}. Double down on the best-performing pillar.`,
    `Day 90 (${dateLabel(new Date(toDate(start).getTime() + 89 * 86400000))}): plan complete — ${cumulative(90)}. Audit the quarter and build the next 90-day plan.`,
  ];

  const totals =
    `${total} emails planned over 90 days: ${mixLine}` +
    (skipped > 0 ? `. ${skipped} send date${skipped === 1 ? '' : 's'} skipped (blackout).` : '.');

  return {
    calendar: {
      columns: ['Date', 'Type', 'Content pillar'],
      rows: rows.map((r) => [r.date, r.slotType, r.contentPillar]),
    },
    milestones,
    totals,
  };
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const { startDate, emailsPerWeek, goalMix, blackoutDates } = values;

  if (typeof startDate !== 'string' || startDate.trim().length === 0) {
    return { ok: false, error: 'Please pick a start date.' };
  }
  const start = parseISODate(startDate);
  if (!start) {
    return { ok: false, error: 'The start date is not a valid YYYY-MM-DD date.' };
  }
  if (typeof emailsPerWeek !== 'number' || !Number.isFinite(emailsPerWeek)) {
    return { ok: false, error: 'Emails per week must be a number.' };
  }
  if (!Number.isInteger(emailsPerWeek) || emailsPerWeek < 1 || emailsPerWeek > 7) {
    return { ok: false, error: 'Emails per week must be a whole number from 1 to 7.' };
  }
  if (typeof goalMix !== 'string' || !(goalMix in GOAL_MIXES)) {
    return { ok: false, error: 'Please choose a goal mix from the list.' };
  }

  const blackouts = new Set<string>();
  if (typeof blackoutDates === 'string' && blackoutDates.trim().length > 0) {
    const lines = blackoutDates.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parsed = parseISODate(line);
      if (!parsed) {
        return { ok: false, error: `Blackout dates: line ${i + 1} ("${line}") is not a valid YYYY-MM-DD date.` };
      }
      blackouts.add(isoOf(toDate(parsed)));
    }
  }

  const plan = buildPlan(start, emailsPerWeek, goalMix as string, blackouts);
  return {
    ok: true,
    values: {
      calendar: plan.calendar,
      milestones: plan.milestones,
      totals: plan.totals,
    },
  };
}
