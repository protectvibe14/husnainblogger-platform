/**
 * Countdown Sticker Text Generator — pure logic (tool-224), zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * TEMPLATE BANK, NOT AI: builds countdown texts from a fixed, hand-written
 * bank of 12 templates split into three phases — 6 pre-event, 3 happening-
 * now, 3 post-event. The phase is picked from the whole-day difference
 * between the event date and today (UTC dates, so results don't shift with
 * the viewer's timezone). The user's event name and date are inserted
 * verbatim; {days} renders as "1 day" or "N days".
 *
 * Placeholders: {event} = event name, {date} = event date as entered,
 * {days} = "1 day" / "N days".
 *
 * Bank sizes: 6 pre + 3 during + 3 post = 12 templates total.
 *
 * Determinism: generateCountdown(event, dateISO, todayISO) is fully
 * deterministic. runTool defaults todayISO to the current UTC date.
 */

export type CountdownPhase = "pre" | "during" | "post";

export interface CountdownText {
  phase: CountdownPhase;
  text: string;
}

/** Pre-event templates — 6 total. Used when the event is in the future. */
const PRE_BANK: string[] = [
  "⏳ {days} until {event}!",
  "{event} drops in {days} — who's ready? 🙌",
  "The countdown is ON: {event} in {days} 🎉",
  "Mark your calendar 📅 {event} — {date} ({days} to go)",
  "{days}. {event}. Be there.",
  "Almost time ⏰ {event} starts in {days}",
];

/** Happening-now templates — 3 total. Used when the event date is today. */
const DURING_BANK: string[] = [
  "It's TODAY 🎉 {event} is happening now!",
  "{event} day is finally here — join us!",
  "🚨 LIVE NOW: {event}",
];

/** Post-event templates — 3 total. Used when the event date has passed. */
const POST_BANK: string[] = [
  "That's a wrap on {event} — thanks for joining! 💛",
  "Missed {event}? Highlights dropping soon 👀",
  "{event} is over — what should we do next? Tell us 👇",
];

export const BANK_SIZES = {
  preTemplates: PRE_BANK.length, // 6
  duringTemplates: DURING_BANK.length, // 3
  postTemplates: POST_BANK.length, // 3
  total: PRE_BANK.length + DURING_BANK.length + POST_BANK.length, // 12
};

export const PHASE_LABELS: Record<CountdownPhase, string> = {
  pre: "Before the event",
  during: "Happening now",
  post: "After the event",
};

export const ASSUMPTIONS: string[] = [
  "Texts are assembled from 12 hand-written templates, not AI generation.",
  "The phase (before / now / after) is computed from whole UTC days between today and the event date — it does not account for the event's time of day.",
  "Countdown texts are starting points — adapt the wording and emojis to your voice before posting.",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function fill(template: string, event: string, date: string, days: string): string {
  return template
    .replaceAll("{event}", event)
    .replaceAll("{date}", date)
    .replaceAll("{days}", days);
}

/** Parse "YYYY-MM-DD" into UTC midnight ms, or null when invalid. */
export function parseDateISO(dateISO: string): number | null {
  if (!DATE_PATTERN.test(dateISO)) return null;
  const [y, m, d] = dateISO.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    return null; // e.g. 2026-02-30
  }
  return ms;
}

/** Whole-day difference: positive = future, 0 = today, negative = past. */
export function daysBetween(eventISO: string, todayISO: string): number | null {
  const eventMs = parseDateISO(eventISO);
  const todayMs = parseDateISO(todayISO);
  if (eventMs === null || todayMs === null) return null;
  return Math.round((eventMs - todayMs) / 86_400_000);
}

export function phaseFor(daysLeft: number): CountdownPhase {
  if (daysLeft > 0) return "pre";
  if (daysLeft === 0) return "during";
  return "post";
}

/**
 * Pure countdown generator. todayISO is "YYYY-MM-DD"; when omitted, the
 * current UTC date is used. Returns null on invalid input (runTool maps
 * that to a human error message).
 */
export function generateCountdown(
  event: string,
  dateISO: string,
  todayISO?: string,
): { phase: CountdownPhase; daysLeft: number; texts: CountdownText[] } | null {
  const cleanEvent = event.trim();
  if (cleanEvent.length === 0) return null;
  const today = todayISO ?? new Date().toISOString().slice(0, 10);
  const daysLeft = daysBetween(dateISO, today);
  if (daysLeft === null) return null;

  const phase = phaseFor(daysLeft);
  const daysLabel = daysLeft === 1 ? "1 day" : `${daysLeft} days`;
  const bank = phase === "pre" ? PRE_BANK : phase === "during" ? DURING_BANK : POST_BANK;
  const texts: CountdownText[] = bank.map((t) => ({
    phase,
    text: fill(t, cleanEvent, dateISO, daysLabel),
  }));
  return { phase, daysLeft, texts };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Generate countdown sticker texts. Errors: missing/empty event; missing
 * or invalid date (must be YYYY-MM-DD). Never throws.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawEvent = values["event"];
  if (typeof rawEvent !== "string" || rawEvent.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter your event name first — e.g. “Summer Sale”, “Course Launch”.",
    };
  }

  const rawDate = values["date"];
  if (typeof rawDate !== "string" || rawDate.trim().length === 0) {
    return {
      ok: false,
      error: "Please pick the event date.",
    };
  }
  const dateISO = rawDate.trim();
  if (parseDateISO(dateISO) === null) {
    return {
      ok: false,
      error: "That date doesn't look valid — please use YYYY-MM-DD, e.g. 2026-11-19.",
    };
  }

  const result = generateCountdown(rawEvent, dateISO);
  if (result === null) {
    return { ok: false, error: "Could not build countdown texts from that date." };
  }

  const table = {
    columns: ["Phase", "Countdown text"],
    rows: result.texts.map((t) => [PHASE_LABELS[t.phase], t.text]),
  };
  const copyAll = result.texts.map((t, i) => `${i + 1}. ${t.text}`).join("\n\n");

  return {
    ok: true,
    values: {
      texts: table,
      copyAll,
      daysLeft: result.daysLeft,
      phase: PHASE_LABELS[result.phase],
    },
  };
}
