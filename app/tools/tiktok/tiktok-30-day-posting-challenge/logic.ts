/**
 * tool-184 — TikTok 30-Day Posting Challenge (template generator).
 *
 * Honesty: NOT AI. This tool generates a static 30-day posting calendar
 * from FIXED day templates. The video ideas are generic format frames with a
 * "{niche}" slot — they do not analyze your account, your audience, or live
 * TikTok trends, and they are not a growth guarantee. The check-off /
 * completed state mentioned in the spec is handled by the page UI
 * (localStorage); this file only produces the calendar.
 *
 * Fixed banks (sizes documented for QA):
 * - DAY_PLANS: 30 fixed day templates, each { idea, format, cta } with a
 *   "{niche}" slot. Days 7, 14, 21, 28 are rest days (engagement day).
 * - REST_ACTIVITIES: 4 fixed rest-day engagement activities, rotating.
 * - IDEA templates: 26 posting days + 4 rest days = 30 fixed rows.
 *
 * Deterministic: same niche + startDate → identical calendar, always.
 * Dates are computed in UTC from a strict YYYY-MM-DD parse.
 *
 * Contract: runTool({ niche: string, startDate: string }).
 * Output: calendar table { columns: [Day, Date, Video idea, Format, CTA], rows }.
 *
 * Zero imports, zero network, zero DOM, no Math.random.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NICHE_LENGTH = 120;
const TOTAL_DAYS = 30;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface DayPlan {
  idea: string;
  format: string;
  cta: string;
  rest: boolean;
}

const REST_ACTIVITIES: readonly string[] = [
  'Reply to 10 comments on your videos, then comment on 5 niche creators.',
  'Spend 30 minutes studying 5 viral niche videos — note their hooks.',
  'Answer 3 follower DMs/comments and save 5 video ideas for next week.',
  'Batch-film next week: shoot 3 videos, review drafts, rest your voice.',
];

const DAY_PLANS: readonly DayPlan[] = [
  { idea: 'Introduce yourself: who you are and what your {niche} content is about.', format: 'Talking head', cta: 'Follow for day 2 of the challenge.', rest: false },
  { idea: 'The #1 beginner mistake in {niche} (and how to avoid it).', format: 'Talking head + captions', cta: 'Comment if you have made this mistake.', rest: false },
  { idea: 'Duet or stitch a popular {niche} video and add your take.', format: 'Duet / Stitch', cta: 'Stitch this with your own answer.', rest: false },
  { idea: 'Quick {niche} tip in under 30 seconds — one tip only.', format: 'Fast tip', cta: 'Save this for later.', rest: false },
  { idea: 'Show your {niche} setup, tools, or workspace.', format: 'Show & tell', cta: 'Comment what setup you want to see next.', rest: false },
  { idea: 'Myth about {niche} that needs to die.', format: 'Myth-bust', cta: 'Share this with someone who believes it.', rest: false },
  { idea: REST_ACTIVITIES[0], format: 'Rest day', cta: 'No posting — engage only.', rest: true },
  { idea: 'Answer the most common {niche} question from your comments.', format: 'Q&A', cta: 'Drop your next question below.', rest: false },
  { idea: 'Day in the life of a {niche} creator.', format: 'Vlog montage', cta: 'Follow to see day 9.', rest: false },
  { idea: 'Before and after: your {niche} progress or a client result.', format: 'Before / After', cta: 'Comment "HOW" for the process video.', rest: false },
  { idea: 'React to a trending sound with a {niche} twist.', format: 'Trend-jack', cta: 'Use this sound and tag me.', rest: false },
  { idea: '3 tools every {niche} beginner needs.', format: 'List / carousel', cta: 'Save this list.', rest: false },
  { idea: 'Storytime: your biggest {niche} fail and what it taught you.', format: 'Storytime', cta: 'Comment your biggest fail.', rest: false },
  { idea: REST_ACTIVITIES[1], format: 'Rest day', cta: 'No posting — study only.', rest: true },
  { idea: 'Tutorial: do one {niche} task step by step on camera.', format: 'Tutorial', cta: 'Save this tutorial.', rest: false },
  { idea: 'Unpopular opinion about {niche} — defend it.', format: 'Hot take', cta: 'Agree or disagree? Fight me in the comments.', rest: false },
  { idea: 'Show a {niche} process nobody films (the messy middle).', format: 'Behind the scenes', cta: 'Follow for the full process.', rest: false },
  { idea: 'Reply to a comment with a full video answer about {niche}.', format: 'Comment reply', cta: 'Ask me anything below.', rest: false },
  { idea: 'Compare two {niche} options: which is better for beginners?', format: 'Comparison', cta: 'Vote in the comments.', rest: false },
  { idea: 'Film the same {niche} tip three ways — pick the best one to post.', format: 'Experiment', cta: 'Comment which version you like.', rest: false },
  { idea: REST_ACTIVITIES[2], format: 'Rest day', cta: 'No posting — engage only.', rest: true },
  { idea: 'Your {niche} hot take from 6 months ago — were you right?', format: 'Reflection', cta: 'Comment what changed your mind.', rest: false },
  { idea: 'POV: a beginner asks you the same {niche} question again.', format: 'POV skit', cta: 'Tag a beginner.', rest: false },
  { idea: 'Teach one {niche} term like the viewer is five years old.', format: 'Explain simply', cta: 'Save this explainer.', rest: false },
  { idea: 'The {niche} trend everyone is copying — your honest review.', format: 'Trend review', cta: 'Follow for honest reviews.', rest: false },
  { idea: 'Show your analytics: what worked in this {niche} challenge so far.', format: 'Analytics share', cta: 'Comment your best day.', rest: false },
  { idea: 'Collab-style: answer a {niche} question as two characters.', format: 'Skit', cta: 'Which character are you? Comment.', rest: false },
  { idea: REST_ACTIVITIES[3], format: 'Rest day', cta: 'No posting — batch-film.', rest: true },
  { idea: 'Recap: your 3 best {niche} videos from this challenge.', format: 'Recap', cta: 'Watch the full challenge playlist.', rest: false },
  { idea: 'The challenge finale: your #1 {niche} lesson from 30 days.', format: 'Finale', cta: 'Follow for the next 30-day challenge.', rest: false },
];

const REST_DAY_INDEXES: readonly number[] = [7, 14, 21, 28];

function fill(template: string, niche: string): string {
  return template.split('{niche}').join(niche);
}

/** Strict YYYY-MM-DD parse -> UTC midnight ms, or null. */
function parseStartDate(raw: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, mo - 1, d);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== mo - 1 ||
    check.getUTCDate() !== d
  ) {
    return null; // e.g. 2026-02-30
  }
  return ms;
}

function formatDate(ms: number): string {
  const dt = new Date(ms);
  return `${WEEKDAYS[dt.getUTCDay()]}, ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const nicheRaw = values.niche;
  if (typeof nicheRaw !== 'string' || nicheRaw.trim().length === 0) {
    return { ok: false, error: 'Enter your niche (e.g. "sourdough baking").' };
  }
  const niche = nicheRaw.trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return {
      ok: false,
      error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.`,
    };
  }

  const dateRaw = values.startDate;
  if (typeof dateRaw !== 'string' || dateRaw.trim().length === 0) {
    return { ok: false, error: 'Pick a start date for the challenge.' };
  }
  const startMs = parseStartDate(dateRaw);
  if (startMs === null) {
    return {
      ok: false,
      error: 'Start date is not a valid calendar date. Use YYYY-MM-DD.',
    };
  }

  const rows: string[][] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const day = i + 1;
    const plan = DAY_PLANS[i];
    rows.push([
      String(day),
      formatDate(startMs + i * 86400000),
      fill(plan.idea, niche),
      plan.format,
      plan.cta,
    ]);
  }

  return {
    ok: true,
    values: {
      calendar: {
        columns: ['Day', 'Date', 'Video idea', 'Format', 'CTA'],
        rows,
      },
    },
  };
}

/** Exported for tests: which day numbers are rest days (1-based). */
export const REST_DAYS = REST_DAY_INDEXES;
export const TOTAL_CHALLENGE_DAYS = TOTAL_DAYS;
