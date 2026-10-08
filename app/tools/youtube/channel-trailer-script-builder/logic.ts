/**
 * Channel Trailer Script Builder (tool-145) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * TEMPLATE SCAFFOLD, NOT AI: builds a channel-trailer script from 7 fixed
 * timed beats (hook / what / who / why subscribe / proof / schedule /
 * CTA) with the user's niche, target viewer, and upload schedule filled
 * into fixed template sentences. Word budget: 150 words per minute →
 * 30s = 75 words, 45s = 113 words, 60s = 150 words. The script is a
 * fixed-template assembly; actual word count is reported next to the
 * budget so the user can trim or expand to fit the target length.
 *
 * Deterministic: same items → same output, always.
 */

export interface TrailerItem {
  /** Channel niche, e.g. "budget travel". Required. */
  niche: string;
  /** Who the channel is for, e.g. "busy parents". Required. */
  targetViewer: string;
  /** Upload schedule, e.g. "every Tuesday and Friday". Required. */
  uploadSchedule: string;
  /** 30, 45, or 60 seconds. Required. */
  durationSec: number;
}

/** Allowed trailer durations in seconds. */
export const ALLOWED_DURATIONS = [30, 45, 60] as const;

/** Words-per-minute assumption used for the word budget. */
export const WPM = 150;

/** Beat name → share of the total word budget (sums to 1.0). */
export const BEAT_SHARES: { name: string; share: number }[] = [
  { name: "Hook — who you are", share: 0.1 },
  { name: "What — what the channel is about", share: 0.2 },
  { name: "Who — who it is for", share: 0.15 },
  { name: "Why — why subscribe", share: 0.2 },
  { name: "Proof — credibility line", share: 0.1 },
  { name: "Schedule — when new videos land", share: 0.1 },
  { name: "CTA — subscribe now", share: 0.15 },
];

export interface TimedBeat {
  beat: string;
  /** "0:00–0:06" style timestamp. */
  timestamp: string;
  /** Target words for this beat from the budget. */
  targetWords: number;
  line: string;
}

export interface TrailerScript {
  presetName: string;
  durationSec: number;
  /** Budget = durationSec × 150/60, rounded. */
  wordBudget: number;
  /** Actual words in the assembled script (template + user input). */
  actualWords: number;
  beats: TimedBeat[];
  fullScript: string;
  note: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const SCRIPT_NOTE =
  "Fixed-template scaffold, not AI copywriting. Word counts are approximate at 150 wpm speaking pace — trim filler or add a beat to hit your exact target length, and replace the proof line with your real numbers before recording.";

function wordBudget(durationSec: number): number {
  return Math.round((durationSec * WPM) / 60);
}

function countWords(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function validateItem(
  raw: Record<string, unknown>,
  index: number
): { item?: TrailerItem; error?: string } {
  const label = `Item ${index + 1}`;
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: `${label}: trailer item must be an object of fields.` };
  }
  const str = (k: string): string =>
    typeof raw[k] === "string" ? (raw[k] as string).trim() : "";

  const niche = str("niche");
  if (niche.length === 0) {
    return { error: `${label}: "niche" is required (e.g. "budget travel").` };
  }
  if (niche.length > 80) {
    return { error: `${label}: "niche" must be 80 characters or fewer.` };
  }
  const targetViewer = str("targetViewer");
  if (targetViewer.length === 0) {
    return {
      error: `${label}: "targetViewer" is required (e.g. "busy parents").`,
    };
  }
  if (targetViewer.length > 80) {
    return { error: `${label}: "targetViewer" must be 80 characters or fewer.` };
  }
  const uploadSchedule = str("uploadSchedule");
  if (uploadSchedule.length === 0) {
    return {
      error: `${label}: "uploadSchedule" is required (e.g. "every Tuesday and Friday").`,
    };
  }
  if (uploadSchedule.length > 80) {
    return {
      error: `${label}: "uploadSchedule" must be 80 characters or fewer.`,
    };
  }

  const durRaw = str("durationSec");
  const durationSec = Number(durRaw);
  if (
    durRaw.length === 0 ||
    !Number.isInteger(durationSec) ||
    !((ALLOWED_DURATIONS as readonly number[]) as number[]).includes(durationSec)
  ) {
    return {
      error: `${label}: "durationSec" must be one of 30, 45, 60 (got "${durRaw}").`,
    };
  }

  return { item: { niche, targetViewer, uploadSchedule, durationSec } };
}

function buildScript(item: TrailerItem): TrailerScript {
  const budget = wordBudget(item.durationSec);
  const lines: Record<string, string> = {
    "Hook — who you are": `I'm [Your Name], and I make ${item.niche} videos.`,
    "What — what the channel is about": `On this channel, you'll find practical ${item.niche} content — no fluff, just the stuff that actually works.`,
    "Who — who it is for": `This channel is made for ${item.targetViewer} who want real results without wasting time.`,
    "Why — why subscribe": `Subscribe if you want ${item.niche} explained simply, with examples you can use the same day.`,
    "Proof — credibility line": `I've helped [your viewers / clients / community] get real results in ${item.niche} — and I'm just getting started.`,
    "Schedule — when new videos land": `New videos drop ${item.uploadSchedule}, so there's always something fresh to watch.`,
    "CTA — subscribe now": `Hit subscribe and turn on the bell — your next ${item.niche} breakthrough starts here.`,
  };

  const beats: TimedBeat[] = [];
  let cursor = 0;
  let usedWords = 0;
  BEAT_SHARES.forEach((b, i) => {
    const targetWords = Math.max(1, Math.round(budget * b.share));
    const line = lines[b.name];
    const beatSeconds =
      i === BEAT_SHARES.length - 1
        ? item.durationSec - cursor
        : (item.durationSec * b.share);
    const start = cursor;
    const end = i === BEAT_SHARES.length - 1 ? item.durationSec : cursor + beatSeconds;
    cursor = end;
    beats.push({
      beat: b.name,
      timestamp: `${fmtTime(start)}–${fmtTime(end)}`,
      targetWords,
      line,
    });
    usedWords += targetWords;
  });

  const fullScript = beats
    .map((b) => `[${b.timestamp}] ${b.line}`)
    .join("\n");

  return {
    presetName: item.niche,
    durationSec: item.durationSec,
    wordBudget: budget,
    actualWords: countWords(
      Object.values(lines).join(" ")
    ),
    beats,
    fullScript,
    note: SCRIPT_NOTE,
  };
}

/**
 * Builder entry point. `args.items` is the array of trailer items.
 * Invalid items → `{ ok: false, error: "Item N: ..." }`.
 *
 * Output keys (must match meta.ts outputs): scripts, wordBudgets, count.
 */
export function runTool(args: {
  items: Record<string, unknown>[];
}): RunToolResult {
  if (!args || !Array.isArray(args.items) || args.items.length === 0) {
    return {
      ok: false,
      error: "Add at least one trailer item before running.",
    };
  }
  if (args.items.length > 20) {
    return {
      ok: false,
      error: "Maximum 20 trailer items per run — split larger sets into multiple runs.",
    };
  }

  const scripts: string[] = [];
  const wordBudgets: string[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const { item, error } = validateItem(args.items[i], i);
    if (error) {
      return { ok: false, error };
    }
    const built = buildScript(item as TrailerItem);
    scripts.push(built.fullScript);
    wordBudgets.push(
      `${built.durationSec}s @ ${WPM}wpm = ${built.wordBudget} words budget; script has ~${built.actualWords} words — ${SCRIPT_NOTE}`
    );
  }

  return {
    ok: true,
    values: {
      scripts,
      wordBudgets,
      count: scripts.length,
    },
  };
}
