/**
 * Script Length Planner — pure logic (tool-111).
 *
 * Converts between video duration and script word count at a chosen speaking
 * rate, and splits the result into per-section word budgets.
 *
 * ASSUMPTIONS (documented for honesty):
 * - Zero imports, no DOM, no network, no Date.now(), no Math.random.
 *   Deterministic: same inputs -> same outputs.
 * - FORMULA: words = minutes * wpm; minutes = words / wpm.
 * - DEFAULT_WPM = 150 is a narration convention (an ESTIMATE), not a YouTube
 *   rule. It must stay user-adjustable; budgets are only as good as the rate.
 * - SECTION_SHARES is a fixed 5-section structure template
 *   (hook 5% / setup 10% / value 60% / payoff 15% / cta 10%). It is a planning
 *   convention, not a YouTube requirement — percentages always sum to 1.
 * - WPM_WARN_LOW/HIGH (100/200) bound the sane narration range; a rate
 *   outside it is allowed but flagged as a warning, never an error.
 * - SHORTS_MAX_MINUTES = 3: a YouTube Short must be 3 minutes or less.
 * - Pauses, B-roll, silence and on-screen demos add UNSCRIPTED time, so real
 *   runtime usually exceeds the script math — reported as a disclaimer, never
 *   folded silently into the numbers.
 */

/** Narration convention (estimate), words per minute. Not a YouTube rule. */
export const DEFAULT_WPM = 150;
/** Sane narration range; outside it we warn, not fail. */
export const WPM_WARN_LOW = 100;
export const WPM_WARN_HIGH = 200;
/** YouTube Shorts must be <= 3 minutes to qualify as a Short. */
export const SHORTS_MAX_MINUTES = 3;

export type PlannerMode = "duration_to_words" | "words_to_duration";

interface SectionShare {
  key: string;
  label: string;
  share: number;
  tip: string;
}

/** Fixed structure template — planning convention, sums to 1.00. */
export const SECTION_SHARES: ReadonlyArray<SectionShare> = [
  { key: "hook", label: "Hook", share: 0.05, tip: "state the payoff in the first 5 seconds — no greeting, no intro" },
  { key: "setup", label: "Setup / intro", share: 0.1, tip: "who this is for and what the video will deliver" },
  { key: "value", label: "Main value", share: 0.6, tip: "the steps, arguments or beats that deliver the promise" },
  { key: "payoff", label: "Payoff / recap", share: 0.15, tip: "restate the result so viewers leave with it" },
  { key: "cta", label: "CTA / outro", share: 0.1, tip: "one clear ask: subscribe, next video, or link" },
];

export interface PlanResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Words <-> minutes conversion with section budgets.
 * values: { mode, targetMinutes?, wordCount?, wpm? }
 */
export function runTool(values: Record<string, unknown>): PlanResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No inputs were provided." };
  }

  const rawMode = values["mode"];
  const mode: PlannerMode = rawMode === "words_to_duration" ? "words_to_duration" : "duration_to_words";
  if (typeof rawMode === "string" && rawMode !== "duration_to_words" && rawMode !== "words_to_duration") {
    return { ok: false, error: 'Mode must be "duration_to_words" or "words_to_duration".' };
  }

  const wpmRaw = values["wpm"];
  const wpm = wpmRaw === undefined || wpmRaw === null || wpmRaw === "" ? DEFAULT_WPM : asNumber(wpmRaw);
  if (wpm === null || wpm <= 0) {
    return { ok: false, error: "Speaking rate must be a positive number of words per minute." };
  }

  let totalWords: number;
  let durationMinutes: number;
  if (mode === "duration_to_words") {
    const mins = asNumber(values["targetMinutes"]);
    if (mins === null || mins <= 0) {
      return { ok: false, error: "Target duration must be a positive number of minutes." };
    }
    totalWords = Math.round(mins * wpm);
    durationMinutes = Math.round(mins * 10) / 10;
  } else {
    const words = asNumber(values["wordCount"]);
    if (words === null || words <= 0) {
      return { ok: false, error: "Word count must be a positive number." };
    }
    totalWords = Math.round(words);
    durationMinutes = Math.round((words / wpm) * 10) / 10;
  }

  const segmentBudgets: string[] = SECTION_SHARES.map((s) => {
    const words = Math.round(totalWords * s.share);
    const seconds = Math.round((words / wpm) * 60);
    return `${s.label} — ~${words.toLocaleString("en-US")} words (~${seconds}s): ${s.tip}.`;
  });

  const notes: string[] = [];
  if (wpm < WPM_WARN_LOW || wpm > WPM_WARN_HIGH) {
    notes.push(
      `Warning: ${wpm} wpm is outside the usual narration range (${WPM_WARN_LOW}-${WPM_WARN_HIGH} wpm). ` +
        "Budgets are still computed, but double-check the rate against a real read-through.",
    );
  }
  notes.push(
    "Estimate, not a promise: pauses, B-roll, silence and on-screen demos add unscripted time, " +
      "so the finished video usually runs 10-20% longer than the script math.",
  );
  if (durationMinutes <= SHORTS_MAX_MINUTES) {
    notes.push(
      `Shorts check: ${durationMinutes} min is within the ${SHORTS_MAX_MINUTES}:00 limit — the final upload ` +
        "qualifies as a YouTube Short only if it stays at or under 3 minutes.",
    );
  }

  const summary =
    mode === "duration_to_words"
      ? `A ${durationMinutes}-minute video needs ~${totalWords.toLocaleString("en-US")} words at ${wpm} wpm (spoken-rate estimate).`
      : `${totalWords.toLocaleString("en-US")} words take ~${durationMinutes} minutes at ${wpm} wpm (spoken-rate estimate).`;

  return {
    ok: true,
    values: {
      words: totalWords,
      durationMinutes,
      segmentBudgets,
      notes,
      summary,
    },
  };
}
