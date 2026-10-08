/**
 * Editorial Calendar Generator — pure logic (tool-034).
 *
 * Zero imports, zero network, zero DOM. Builds a 4-week editorial calendar
 * from FIXED banks (never AI-generated):
 *
 *   - POST_IDEA_BANK: 28 post-title templates with a {niche} placeholder
 *     (sizes documented below). Titles cycle through the bank in order when
 *     more posts are needed than there are templates.
 *   - CONTENT_TYPES: 7 content-type labels, cycled in order per post.
 *
 * Posting rhythm: posts are spread evenly across the 7 days of each week.
 * postsPerWeek = p places posts on day offsets floor(i*7/p) for i in 0..p-1
 * measured from the start date (e.g. p=3 -> offsets 0, 2, 4; p=1 -> 0).
 *
 * Deterministic: same inputs always produce the same calendar. All date
 * math is done in UTC so results do not depend on the server timezone.
 *
 * ASSUMPTIONS (also surfaced in the calendar's notes):
 * - Post titles are generic templates filled with your niche — they are
 *   starting ideas, not researched headlines; rewrite for the SERP.
 * - 4 weeks is fixed; export the CSV and extend it for longer horizons.
 * - "Planned" status is just a label — this tool tracks nothing.
 * - Dates must be real calendar dates in YYYY-MM-DD form.
 */

/** Fixed post-title template bank: 28 entries. */
export const POST_IDEA_BANK: readonly string[] = [
  "{niche}: A Beginner's Guide to Getting Started",
  "10 Common {niche} Mistakes (and How to Fix Them)",
  "How to Choose the Right {niche} Tools",
  "{niche} Trends Worth Watching This Year",
  "The Ultimate {niche} Checklist",
  "How to Save Money on {niche}",
  "{niche} for Beginners: Key Terms Explained",
  "7 Pro Tips for Better {niche} Results",
  "{niche} Case Study: What Worked",
  "How to Plan Your First {niche} Project",
  "Top 10 {niche} Resources",
  "{niche} FAQ: Your Questions Answered",
  "How to Measure {niche} Success",
  "Advanced {niche} Strategies",
  "{niche} Myths Debunked",
  "How to Get Started with {niche} in 30 Days",
  "The History of {niche}: A Short Overview",
  "{niche} vs. Alternatives: An Honest Comparison",
  "How Experts Approach {niche}",
  "5 {niche} Workflows That Save Time",
  "{niche} on a Budget: Smart Shortcuts",
  "What Nobody Tells You About {niche}",
  "How to Troubleshoot Common {niche} Problems",
  "{niche} Templates You Can Copy",
  "A Week in the Life: {niche} in Practice",
  "How to Stay Consistent with {niche}",
  "{niche} Statistics and Benchmarks",
  "Your {niche} Questions, Answered by Pros",
];

/** Number of post-title templates in the fixed bank. */
export const POST_IDEA_BANK_SIZE = POST_IDEA_BANK.length; // 28

/** Fixed content-type labels, cycled in order. */
export const CONTENT_TYPES: readonly string[] = [
  "how-to",
  "listicle",
  "guide",
  "opinion",
  "case study",
  "review",
  "roundup",
];

/** Calendar always covers this many weeks. */
export const CALENDAR_WEEKS = 4;

/** Niche length bounds. */
export const MIN_NICHE_LENGTH = 2;
export const MAX_NICHE_LENGTH = 80;

/** postsPerWeek bounds. */
export const MIN_POSTS_PER_WEEK = 1;
export const MAX_POSTS_PER_WEEK = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export interface CalendarEntry {
  week: number;
  /** ISO date YYYY-MM-DD. */
  date: string;
  /** Day of week name (UTC). */
  day: string;
  /** Post title with the niche filled in. */
  title: string;
  /** Content-type label from the fixed CONTENT_TYPES cycle. */
  contentType: string;
  /** Always "planned" — this tool tracks nothing. */
  status: "planned";
}

function fillNiche(template: string, niche: string): string {
  return template.replace(/\{niche\}/g, niche);
}

/**
 * Parse a YYYY-MM-DD string into a UTC midnight timestamp.
 * Throws TypeError for malformed input and RangeError for impossible dates.
 */
export function parseDate(dateStr: string): number {
  if (typeof dateStr !== "string" || !/^(\d{4})-(\d{2})-(\d{2})$/.test(dateStr)) {
    throw new TypeError("Start date must be in YYYY-MM-DD format.");
  }
  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(5, 7));
  const day = Number(dateStr.slice(8, 10));
  const ts = Date.UTC(year, month - 1, day);
  const check = new Date(ts);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`"${dateStr}" is not a real calendar date.`);
  }
  return ts;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Day offsets within a week for a given posts-per-week, evenly spread. */
export function postingOffsets(postsPerWeek: number): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < postsPerWeek; i += 1) {
    offsets.push(Math.floor((i * 7) / postsPerWeek));
  }
  return offsets;
}

function csvEscape(cell: string): string {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/**
 * Build the calendar. Throws TypeError/RangeError on invalid input;
 * runTool() converts those into { ok: false }.
 */
export function buildCalendar(
  niche: string,
  postsPerWeek: number,
  startDate: string,
): { calendar: CalendarEntry[]; csv: string; totalPosts: number } {
  if (typeof niche !== "string" || niche.trim().length < MIN_NICHE_LENGTH) {
    throw new TypeError(
      `Niche is required (${MIN_NICHE_LENGTH}-${MAX_NICHE_LENGTH} characters).`,
    );
  }
  if (niche.trim().length > MAX_NICHE_LENGTH) {
    throw new RangeError(
      `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.`,
    );
  }
  if (
    typeof postsPerWeek !== "number" ||
    !Number.isInteger(postsPerWeek) ||
    postsPerWeek < MIN_POSTS_PER_WEEK ||
    postsPerWeek > MAX_POSTS_PER_WEEK
  ) {
    throw new RangeError(
      `Posts per week must be a whole number between ${MIN_POSTS_PER_WEEK} and ${MAX_POSTS_PER_WEEK}.`,
    );
  }
  const startTs = parseDate(startDate);
  const cleanNiche = niche.trim();

  const offsets = postingOffsets(postsPerWeek);
  const calendar: CalendarEntry[] = [];
  let postIndex = 0;
  for (let week = 1; week <= CALENDAR_WEEKS; week += 1) {
    for (const offset of offsets) {
      const ts = startTs + (week - 1) * 7 * DAY_MS + offset * DAY_MS;
      const d = new Date(ts);
      calendar.push({
        week,
        date: formatDate(ts),
        day: DAY_NAMES[d.getUTCDay()],
        title: fillNiche(POST_IDEA_BANK[postIndex % POST_IDEA_BANK_SIZE], cleanNiche),
        contentType: CONTENT_TYPES[postIndex % CONTENT_TYPES.length],
        status: "planned",
      });
      postIndex += 1;
    }
  }

  const csvLines = [
    "Week,Date,Day,Post title,Content type,Status",
    ...calendar.map((e) =>
      [String(e.week), e.date, e.day, csvEscape(e.title), e.contentType, e.status].join(","),
    ),
  ];

  return { calendar, csv: csvLines.join("\n"), totalPosts: calendar.length };
}

/**
 * runTool entry point (generator template contract).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const result = buildCalendar(
      values["niche"] as string,
      values["postsPerWeek"] as number,
      values["startDate"] as string,
    );
    return {
      ok: true,
      values: {
        calendar: result.calendar,
        csv: result.csv,
        totalPosts: result.totalPosts,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid input.",
    };
  }
}
