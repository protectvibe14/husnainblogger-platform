/**
 * Launch Content Planner — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds a launch content timeline from a launch date using pure date math
 * plus FIXED task banks — no AI, no generated copy.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - TEASE_TASKS: 12 fixed teaser tasks (cycled by day offset)
 * - LAUNCH_TASKS: 5 fixed launch-day tasks
 * - POST_TASKS: 6 fixed post-launch tasks (cycled by day offset)
 * - Total bank: 23 fixed task strings; {offer} filled from the input
 *
 * Timeline structure (offsets are calendar days from launch, UTC):
 * - T-teaseDays .. T-1 : "Tease" phase, one task per day
 * - T-0               : "Launch day" phase, all 5 launch tasks
 * - T+1 .. T+3        : "Post-launch" phase, one task per day
 * teaseDays = 0 skips the tease phase. Deterministic for a given
 * (launchDate, offer, teaseDays): same inputs -> identical timeline.
 */

export const MIN_TEASE_DAYS = 0;
export const MAX_TEASE_DAYS = 30;
export const DEFAULT_TEASE_DAYS = 7;
export const MAX_OFFER_LEN = 100;
export const POST_LAUNCH_DAYS = 3;

const DAY_MS = 86_400_000;

/** 12 fixed teaser tasks. */
const TEASE_TASKS: string[] = [
  "Post a behind-the-scenes reel: show what you are building (no reveal yet).",
  "Story poll: ask followers to guess what you are launching.",
  "Share the problem your {offer} solves — founder talking-head story.",
  "Post a sneak-peek carousel: 3 cropped close-ups of the product.",
  "Add a countdown sticker to your stories, set to launch day.",
  "Share a follower pain point from your DMs (anonymized) as a text story.",
  "Reel: '3 mistakes people make here' — tease how your launch fixes them.",
  "Story Q&A box: 'What do you want to know about what is coming?'",
  "Post a testimonial or beta result — keep the product name blurred.",
  "Story: unboxing or first-look clip with an 'almost here' caption.",
  "Reel: day-in-the-life while preparing the launch.",
  "Story: '48 hours left' reminder with the countdown sticker.",
];

/** 5 fixed launch-day tasks. */
const LAUNCH_TASKS: string[] = [
  "Publish the launch announcement reel — lead with the transformation, not the features.",
  "Post the launch story series (3 slides): problem, product, link sticker.",
  "Pin the announcement post to the top of your profile.",
  "Manually DM your warmest followers with the launch link — no mass automation.",
  "Go live or post a founder story explaining why you built {offer}.",
];

/** 6 fixed post-launch tasks. */
const POST_TASKS: string[] = [
  "Story Q&A: answer the top 3 questions about the offer.",
  "Post a carousel: 'Everything included' breakdown of {offer}.",
  "Share early buyer feedback or screenshots as stories.",
  "Story: 'doors close soon' reminder with the countdown sticker.",
  "Reel: objection-buster — address the #1 hesitation publicly.",
  "Final call-to-action post: recap the offer and the deadline.",
];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function toISODate(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function parseISODate(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, mo - 1, d);
  // Round-trip check rejects e.g. Feb 30.
  return toISODate(ms) === `${m[1]}-${m[2]}-${m[3]}` ? ms : null;
}

function todayISO(): string {
  const n = new Date();
  return `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}`;
}

function fill(task: string, offer: string): string {
  return task.split("{offer}").join(offer);
}

function dayLabel(offset: number): string {
  if (offset === 0) return "Launch day";
  return offset < 0 ? `T${offset}` : `T+${offset}`;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const dateRaw = values["launchDate"];
  const offerRaw = values["offer"];
  const teaseRaw = values["teaseDays"];

  const dateStr = typeof dateRaw === "string" ? dateRaw.trim() : "";
  const launchMs = dateStr ? parseISODate(dateStr) : null;
  if (launchMs === null) {
    return { ok: false, error: "Please enter a valid launch date (YYYY-MM-DD)." };
  }
  const launchISO = toISODate(launchMs);
  if (launchISO <= todayISO()) {
    return { ok: false, error: "Launch date must be in the future." };
  }

  const offer = typeof offerRaw === "string" ? offerRaw.trim() : "";
  if (!offer) {
    return { ok: false, error: "Please describe the offer you are launching." };
  }
  if (offer.length > MAX_OFFER_LEN) {
    return { ok: false, error: `Offer is too long (max ${MAX_OFFER_LEN} characters).` };
  }

  let teaseDays = DEFAULT_TEASE_DAYS;
  if (teaseRaw !== undefined && teaseRaw !== null && teaseRaw !== "") {
    const parsed = typeof teaseRaw === "number" ? teaseRaw : Number(String(teaseRaw).trim());
    if (!Number.isInteger(parsed) || parsed < MIN_TEASE_DAYS || parsed > MAX_TEASE_DAYS) {
      return { ok: false, error: `Tease days must be a whole number from ${MIN_TEASE_DAYS} to ${MAX_TEASE_DAYS}.` };
    }
    teaseDays = parsed;
  }

  const rows: string[][] = [];
  const checklist: string[] = [];

  // Tease phase: T-teaseDays .. T-1
  if (teaseDays > 0) {
    checklist.push(`TEASE (T-${teaseDays} to T-1)`);
    for (let d = -teaseDays; d <= -1; d++) {
      const task = fill(TEASE_TASKS[(d + teaseDays) % TEASE_TASKS.length], offer);
      const date = toISODate(launchMs + d * DAY_MS);
      const label = dayLabel(d);
      rows.push([date, label, "Tease", task]);
      checklist.push(`[ ] ${date} (${label}): ${task}`);
    }
  }

  // Launch day: all 5 launch tasks
  checklist.push("LAUNCH DAY");
  for (const t of LAUNCH_TASKS) {
    const task = fill(t, offer);
    rows.push([launchISO, dayLabel(0), "Launch day", task]);
    checklist.push(`[ ] ${launchISO} (Launch day): ${task}`);
  }

  // Post-launch: T+1 .. T+3
  checklist.push(`POST-LAUNCH (T+1 to T+${POST_LAUNCH_DAYS})`);
  for (let d = 1; d <= POST_LAUNCH_DAYS; d++) {
    const task = fill(POST_TASKS[(d - 1) % POST_TASKS.length], offer);
    const date = toISODate(launchMs + d * DAY_MS);
    const label = dayLabel(d);
    rows.push([date, label, "Post-launch", task]);
    checklist.push(`[ ] ${date} (${label}): ${task}`);
  }

  const checklistExport = `Instagram Product Launch Plan — ${offer}\nLaunch date: ${launchISO}\n\n${checklist.join("\n")}`;

  return {
    ok: true,
    values: {
      timeline: { columns: ["Date", "Day", "Phase", "Task"], rows },
      checklistExport,
    },
  };
}
