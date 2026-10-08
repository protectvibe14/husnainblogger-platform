/**
 * TikTok Posting Time Scheduler (tool-187) — pure schedule-template engine.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY (per spec honestyNote): this is a schedule PLAN generator, not a
 * scheduler — it cannot post to TikTok or automate anything. Posting-time
 * suggestions come from FIXED general-guidance time slots (not real audience
 * analytics: the tool cannot see the user's TikTok data or followers). Every
 * window is labeled a general estimate in the outputs, methodology, and tips.
 *
 * FIXED DATA (documented — selection is deterministic, not random):
 *   TIME_SLOTS   5 — general guidance windows (morning, lunch, evening,
 *                  peak evening, weekend late morning), each with a "why"
 *                  labeled as a general estimate
 *   WEEKDAYS     7 — Monday..Sunday, day offset seeded by hash of niche
 *   PLAN_TIPS    6 — fixed tips, incl. "use TikTok Analytics for real data"
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_POSTS_PER_WEEK = 1;
export const MAX_POSTS_PER_WEEK = 21;
export const MAX_NICHE_LENGTH = 48;
export const MAX_TIMEZONE_LENGTH = 60;

/** IANA-like zone shape: Region/City (allows sub-areas like America/Argentina/Buenos_Aires). */
const TIMEZONE_PATTERN = /^[A-Za-z][A-Za-z0-9_\-+]*(\/[A-Za-z][A-Za-z0-9_\-+]*)+$/;

export const WEEKDAYS: readonly string[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export interface TimeSlot {
  window: string;
  why: string;
}

/** General-research guidance slots — estimates, never audience-specific claims. */
export const TIME_SLOTS: readonly TimeSlot[] = [
  { window: '6:30–8:30 AM', why: 'Morning scroll before work/school — general estimate, not your audience’s real activity.' },
  { window: '12:00–2:00 PM', why: 'Lunch-break scrolling — general estimate, not your audience’s real activity.' },
  { window: '5:00–7:00 PM', why: 'After-work wind-down — general estimate, not your audience’s real activity.' },
  { window: '7:00–10:00 PM', why: 'Evening leisure peak — general estimate, not your audience’s real activity.' },
  { window: '10:00 AM–12:00 PM', why: 'Late-morning window that suits weekends and casual browsing — general estimate.' },
];

export const PLAN_TIPS: readonly string[] = [
  'These windows are general estimates: check TikTok Analytics → Followers → Follower activity for when YOUR audience is actually online.',
  'Test each window for 2–4 weeks and compare views — general guidance never beats your own data.',
  'Post 30–60 minutes before the window’s end so the algorithm has time to distribute the video during the peak.',
  'Consistency beats perfect timing: a fixed weekly rhythm outperforms chasing the ideal slot.',
  'Avoid posting back-to-back: leave at least 2–3 hours between same-day posts.',
  'This tool does not post or schedule to TikTok — use TikTok’s built-in scheduler or post manually at these times.',
];

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawTz = values.timezone;
  if (!isNonEmptyString(rawTz)) {
    return { ok: false, error: 'Timezone is required — enter a valid IANA timezone like "America/New_York" or "Europe/London".' };
  }
  const timezone = rawTz.trim();
  if (timezone.length > MAX_TIMEZONE_LENGTH || !TIMEZONE_PATTERN.test(timezone)) {
    return { ok: false, error: 'Timezone must be a valid IANA name like "America/New_York", "Europe/London", or "Asia/Karachi".' };
  }

  const rawNiche = values.niche;
  if (!isNonEmptyString(rawNiche)) {
    return { ok: false, error: 'Niche is required — tell the tool what your TikTok account is about (e.g. "skincare").' };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.` };
  }

  const rawPosts = values.postsPerWeek;
  let postsPerWeek = Number.NaN;
  if (typeof rawPosts === 'number') {
    postsPerWeek = rawPosts;
  } else if (isNonEmptyString(rawPosts) && rawPosts.trim() !== '') {
    postsPerWeek = Number(rawPosts.trim());
  }
  if (!Number.isInteger(postsPerWeek)) {
    return { ok: false, error: 'Posts per week must be a whole number.' };
  }
  if (postsPerWeek < MIN_POSTS_PER_WEEK || postsPerWeek > MAX_POSTS_PER_WEEK) {
    return { ok: false, error: `Posts per week must be between ${MIN_POSTS_PER_WEEK} and ${MAX_POSTS_PER_WEEK}.` };
  }

  // Spread posts across the week: weekday offset from hash, round-robin slots.
  const offset = hashStr(niche.toLowerCase()) % WEEKDAYS.length;
  interface Row { dayIdx: number; day: string; slotIdx: number; window: string; why: string }
  const rows: Row[] = [];
  for (let i = 0; i < postsPerWeek; i++) {
    const dayIdx = (offset + i) % WEEKDAYS.length;
    const slotIdx = i % TIME_SLOTS.length;
    const slot = TIME_SLOTS[slotIdx];
    rows.push({ dayIdx, day: WEEKDAYS[dayIdx], slotIdx, window: slot.window, why: slot.why });
  }
  rows.sort((a, b) => a.dayIdx - b.dayIdx || a.slotIdx - b.slotIdx);

  const table = {
    columns: ['Day', 'Time window (local)', 'Why this window'],
    rows: rows.map((r) => [r.day, `${r.window} (${timezone})`, r.why]),
  };

  const dayCount = new Set(rows.map((r) => r.day)).size;
  const planSummary =
    `A ${postsPerWeek}-post weekly plan for the "${niche}" niche across ${dayCount} day${dayCount === 1 ? '' : 's'}, ` +
    `times shown in ${timezone}. Every window above is a general-research estimate — this tool cannot see your TikTok ` +
    `audience, so treat the windows as a starting point and confirm with TikTok Analytics (Followers → follower activity).`;

  return {
    ok: true,
    values: {
      schedule: table,
      planSummary,
      tips: PLAN_TIPS.slice(),
    },
  };
}
