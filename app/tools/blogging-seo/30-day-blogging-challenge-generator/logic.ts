/**
 * 30-Day Blogging Challenge Generator — pure logic (tool-035).
 *
 * Zero imports, zero network, zero DOM. Builds a 30-day daily blogging
 * challenge from a FIXED bank of 30 daily prompts (never AI-generated):
 *
 *   - CHALLENGE_BANK: exactly 30 entries, one per day, each with a task
 *     template ({niche} placeholder) and a focus label. Day N always gets
 *     bank entry N — fixed order, no randomness, fully deterministic.
 *
 * startDate is optional; when omitted the challenge starts on the current
 * UTC date. All date math is done in UTC so results do not depend on the
 * server timezone.
 *
 * ASSUMPTIONS (also surfaced in the checklist footer):
 * - Daily tasks are generic blogging prompts filled with your niche —
 *   starting ideas, not personalized coaching.
 * - The checklist is a Markdown document — this tool tracks nothing; copy
 *   it into your notes app to tick days off.
 * - Dates must be real calendar dates in YYYY-MM-DD form.
 */

/** Fixed 30-day challenge bank: exactly 30 entries, one per day. */
export const CHALLENGE_BANK: ReadonlyArray<{
  /** Task template with a {niche} placeholder. */
  task: string;
  /** Focus label for the day. */
  focus: string;
}> = [
  { task: "Set up (or refresh) your blog and write your 'Start here' page.", focus: "Setup" },
  { task: "Publish your about-me post: who you are and what {niche} readers will get here.", focus: "Introduction" },
  { task: "Write a listicle: '7 things I wish I knew about {niche}'.", focus: "Writing" },
  { task: "Pick your 3 content pillars for {niche} and write them down.", focus: "Planning" },
  { task: "Publish a beginner guide: '{niche} basics every newcomer should know'.", focus: "Writing" },
  { task: "Create a simple lead magnet idea for your {niche} audience (checklist or template).", focus: "Growth" },
  { task: "Rest or batch: outline your next 3 {niche} posts.", focus: "Planning" },
  { task: "Write a how-to post solving one specific {niche} problem.", focus: "Writing" },
  { task: "Learn one on-page SEO basic and apply it to your last {niche} post.", focus: "SEO" },
  { task: "Publish a personal story: your biggest {niche} lesson so far.", focus: "Writing" },
  { task: "Comment thoughtfully on 5 {niche} blogs you admire.", focus: "Engagement" },
  { task: "Write a comparison post: two popular {niche} approaches, compared honestly.", focus: "Writing" },
  { task: "Update your oldest post with a better headline and intro.", focus: "SEO" },
  { task: "Share your latest {niche} post in one community where your readers hang out.", focus: "Promotion" },
  { task: "Rest or batch: draft headlines for your next 5 {niche} posts.", focus: "Planning" },
  { task: "Publish an FAQ post: answer 5 common {niche} questions.", focus: "Writing" },
  { task: "Add internal links between your {niche} posts (each post links to 2 others).", focus: "SEO" },
  { task: "Interview (or quote) someone in the {niche} space and publish it.", focus: "Writing" },
  { task: "Write a myth-busting post: 3 {niche} myths, debunked.", focus: "Writing" },
  { task: "Set up a simple email signup form on your blog.", focus: "Growth" },
  { task: "Publish a case study or personal experiment in {niche}.", focus: "Writing" },
  { task: "Repurpose one post into a short thread or social post about {niche}.", focus: "Promotion" },
  { task: "Rest or batch: review your analytics and note your top 3 posts.", focus: "Review" },
  { task: "Write an advanced guide for readers who finished your beginner {niche} posts.", focus: "Writing" },
  { task: "Create a resource page: your 10 best {niche} links and tools.", focus: "SEO" },
  { task: "Ask your readers one question (post or email) and publish the answers.", focus: "Engagement" },
  { task: "Write a 'what I learned' post: your {niche} journey this month.", focus: "Writing" },
  { task: "Optimize images: compress and add alt text to your {niche} posts.", focus: "SEO" },
  { task: "Plan your next 30 days of {niche} content in one sitting.", focus: "Planning" },
  { task: "Publish a celebration post: 30 days of blogging — what changed.", focus: "Review" },
];

/** Number of daily prompts in the fixed bank (one per day of the challenge). */
export const CHALLENGE_BANK_SIZE = CHALLENGE_BANK.length; // 30

/** The challenge always runs this many days. */
export const CHALLENGE_DAYS = 30;

/** Niche length bounds. */
export const MIN_NICHE_LENGTH = 2;
export const MAX_NICHE_LENGTH = 80;

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

export interface ChallengeDay {
  /** 1-30. */
  day: number;
  /** ISO date YYYY-MM-DD. */
  date: string;
  /** Day of week name (UTC). */
  dayName: string;
  /** Daily task with the niche filled in. */
  task: string;
  /** Focus label from the fixed bank. */
  focus: string;
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

/** Today's date in UTC as YYYY-MM-DD (used only when startDate is omitted). */
export function todayUtc(): string {
  return formatDate(Date.now());
}

export function buildChecklistMarkdown(
  niche: string,
  startDate: string,
  days: ChallengeDay[],
): string {
  const lines = [
    `# 30-Day Blogging Challenge: ${niche}`,
    "",
    `Start date: ${startDate}`,
    "",
  ];
  for (const d of days) {
    lines.push(`- [ ] Day ${d.day} (${d.date}, ${d.dayName}) — ${d.task} [${d.focus}]`);
  }
  lines.push(
    "",
    "---",
    "",
    "_These 30 daily prompts come from a fixed task bank — they are generic blogging prompts, not personalized coaching and not AI-generated. Copy this checklist into your notes app to tick days off._",
  );
  return lines.join("\n");
}

/**
 * Build the challenge. Throws TypeError/RangeError on invalid input;
 * runTool() converts those into { ok: false }.
 */
export function buildChallenge(
  niche: string,
  startDate?: string,
): { challenge: ChallengeDay[]; checklistMarkdown: string } {
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
  const cleanNiche = niche.trim();
  const start = startDate === undefined ? todayUtc() : startDate;
  const startTs = parseDate(start);

  const challenge: ChallengeDay[] = [];
  for (let i = 0; i < CHALLENGE_DAYS; i += 1) {
    const ts = startTs + i * DAY_MS;
    const bankEntry = CHALLENGE_BANK[i];
    challenge.push({
      day: i + 1,
      date: formatDate(ts),
      dayName: DAY_NAMES[new Date(ts).getUTCDay()],
      task: fillNiche(bankEntry.task, cleanNiche),
      focus: bankEntry.focus,
    });
  }

  return {
    challenge,
    checklistMarkdown: buildChecklistMarkdown(cleanNiche, start, challenge),
  };
}

/**
 * runTool entry point (generator template contract).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawStart = values["startDate"];
  if (
    rawStart !== undefined &&
    (typeof rawStart !== "string" || rawStart.trim().length === 0)
  ) {
    return { ok: false, error: "Start date must be in YYYY-MM-DD format." };
  }
  try {
    const result = buildChallenge(
      values["niche"] as string,
      rawStart === undefined ? undefined : (rawStart as string).trim(),
    );
    return {
      ok: true,
      values: {
        challenge: result.challenge,
        checklistMarkdown: result.checklistMarkdown,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid input.",
    };
  }
}
