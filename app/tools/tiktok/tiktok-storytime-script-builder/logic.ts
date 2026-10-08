/**
 * TikTok Storytime Script Builder (tool-165) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * BUILDER tool: runTool({ items }) where each item is one storytime
 * (storyTitle, niche, setup, conflict, twist?, resolution?). The tool
 * assembles a full storytime script per item from FIXED script templates —
 * per the spec honestyNote, these are templates, and the narration-time
 * figure is labeled an estimate, never a measurement.
 *
 * Fixed content banks (sizes documented per the builder contract):
 * - HOOK_BANK: 6 fixed opening hooks with {niche} placeholder.
 * - CTA_BANK: 6 fixed closing CTAs with {niche} placeholder.
 * - Script skeleton is one fixed template: HOOK -> SETUP -> CONFLICT ->
 *   TWIST (optional) -> RESOLUTION (optional) -> CTA, each beat wrapped
 *   with [On-screen text: ...] and [Beat: ...] pacing cues.
 *
 * Narration estimate: total words / WORDS_PER_SECOND (2.5), rounded to the
 * nearest 5 seconds. The spec's <=180s target is honored as a soft cap:
 * stories over it are NOT rejected — the seriesNote instead suggests
 * splitting into a multi-part series (spec edgeCase) and points at the
 * TikTok Series Episode Planner (/tools/tiktok/tiktok-series-episode-planner/).
 *
 * Validation: at least setup + conflict beats required (spec validation);
 * title 1-100 chars; niche 1-80; setup/conflict 20-1500 chars each;
 * twist/resolution optional, 10-1500 chars when present. Invalid items fail
 * the whole run with "Item N: <reason>".
 *
 * Deterministic: hook/CTA picked by FNV-1a hash of the item's text.
 * Same items always produce identical scripts.
 */

export const MAX_ITEMS = 10;
export const MAX_TITLE_LEN = 100;
export const MAX_NICHE_LEN = 80;
export const MIN_BEAT_LEN = 20;
export const MAX_BEAT_LEN = 1500;
export const MIN_OPTIONAL_BEAT_LEN = 10;

/** Average speaking pace used for the narration ESTIMATE (words/sec). */
export const WORDS_PER_SECOND = 2.5;
/** Narration-time target for a single TikTok (seconds). Stories over this
 *  trigger the multi-part series suggestion instead of failing. */
export const SINGLE_VIDEO_TARGET_SECS = 180;

export const SERIES_PLANNER_URL = "/tools/tiktok/tiktok-series-episode-planner/";

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** 6 fixed opening hooks. {niche} is filled. */
const HOOK_BANK: string[] = [
  "Stop scrolling — this {niche} story gets WILD.",
  "I was NOT ready for what happened next in my {niche} journey.",
  "Nobody believes this {niche} story, but I have proof.",
  "This is the {niche} story I was scared to post.",
  "POV: the craziest thing just happened in my {niche} business.",
  "Wait for the twist — this {niche} story broke my group chat.",
];

/** 6 fixed closing CTAs. {niche} is filled. */
const CTA_BANK: string[] = [
  "Follow for part 2 — it gets crazier.",
  "Comment what YOU would have done — I read them all.",
  "Save this if you're in {niche} too.",
  "Share this with someone who needs the laugh.",
  "Follow — I post a {niche} storytime every week.",
  'Comment "MORE" and I\'ll drop the behind-the-scenes.',
];

/** FNV-1a 32-bit hash — deterministic seed for hook/CTA rotation. */
function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function wordCount(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/** First ~7 words of a beat, used as the on-screen-text cue. */
function cueOf(beat: string): string {
  const words = beat.split(/\s+/).filter((w) => w.length > 0).slice(0, 7);
  return words.join(" ") + (wordCount(beat) > 7 ? "…" : "");
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = Math.round(totalSecs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface ValidatedItem {
  storyTitle: string;
  niche: string;
  setup: string;
  conflict: string;
  twist: string;
  resolution: string;
}

function validateItem(raw: Record<string, unknown>, itemNo: number): ValidatedItem | string {
  const fail = (why: string): string => `Item ${itemNo}: ${why}`;
  const storyTitle = clean(raw["storyTitle"]);
  const niche = clean(raw["niche"]);
  const setup = clean(raw["setup"]);
  const conflict = clean(raw["conflict"]);
  const twist = clean(raw["twist"]);
  const resolution = clean(raw["resolution"]);

  if (!storyTitle) return fail("story title is required.");
  if (storyTitle.length > MAX_TITLE_LEN) return fail(`story title must be ${MAX_TITLE_LEN} characters or fewer.`);
  if (!niche) return fail("niche is required.");
  if (niche.length > MAX_NICHE_LEN) return fail(`niche must be ${MAX_NICHE_LEN} characters or fewer.`);
  if (!setup) return fail("the setup beat is required (at least setup + conflict).");
  if (setup.length < MIN_BEAT_LEN) return fail(`setup is too short — write at least ${MIN_BEAT_LEN} characters.`);
  if (setup.length > MAX_BEAT_LEN) return fail(`setup must be ${MAX_BEAT_LEN} characters or fewer.`);
  if (!conflict) return fail("the conflict beat is required (at least setup + conflict).");
  if (conflict.length < MIN_BEAT_LEN) return fail(`conflict is too short — write at least ${MIN_BEAT_LEN} characters.`);
  if (conflict.length > MAX_BEAT_LEN) return fail(`conflict must be ${MAX_BEAT_LEN} characters or fewer.`);
  if (twist && twist.length < MIN_OPTIONAL_BEAT_LEN)
    return fail(`twist is too short — write at least ${MIN_OPTIONAL_BEAT_LEN} characters or leave it empty.`);
  if (twist.length > MAX_BEAT_LEN) return fail(`twist must be ${MAX_BEAT_LEN} characters or fewer.`);
  if (resolution && resolution.length < MIN_OPTIONAL_BEAT_LEN)
    return fail(`resolution is too short — write at least ${MIN_OPTIONAL_BEAT_LEN} characters or leave it empty.`);
  if (resolution.length > MAX_BEAT_LEN) return fail(`resolution must be ${MAX_BEAT_LEN} characters or fewer.`);

  return { storyTitle, niche, setup, conflict, twist, resolution };
}

function estimateSecs(item: ValidatedItem): number {
  const words = wordCount(item.setup) + wordCount(item.conflict) + wordCount(item.twist) + wordCount(item.resolution) + 40; // +40 for hook + CTA
  return Math.round(words / WORDS_PER_SECOND / 5) * 5;
}

export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  const items = args && Array.isArray(args.items) ? args.items : null;
  if (!items || items.length === 0) {
    return { ok: false, error: "Add at least one story item to build a script." };
  }
  if (items.length > MAX_ITEMS) {
    return { ok: false, error: `Build at most ${MAX_ITEMS} scripts at a time.` };
  }

  const validated: ValidatedItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const v = validateItem(items[i], i + 1);
    if (typeof v === "string") return { ok: false, error: v };
    validated.push(v);
  }

  const scripts: string[] = [];
  const narrationEstimates: string[] = [];
  const pacingSummaries: string[] = [];
  const longItems: { no: number; title: string; secs: number }[] = [];

  validated.forEach((item, idx) => {
    const itemNo = idx + 1;
    const seed = hash32(`${item.storyTitle}|${item.niche}|${item.setup}|${item.conflict}`);
    const hook = HOOK_BANK[seed % HOOK_BANK.length].split("{niche}").join(item.niche);
    const cta = CTA_BANK[(seed * 3) % CTA_BANK.length].split("{niche}").join(item.niche);

    const beats: { label: string; text: string; cue: string; beatNote: string }[] = [
      {
        label: "SETUP",
        text: item.setup,
        cue: cueOf(item.setup),
        beatNote: "Pause 1 second — let viewers guess what happens next.",
      },
      {
        label: "CONFLICT",
        text: item.conflict,
        cue: cueOf(item.conflict),
        beatNote: "Read one comment out loud here — it doubles watch time.",
      },
    ];
    if (item.twist) {
      beats.push({
        label: "TWIST",
        text: item.twist,
        cue: "PLOT TWIST",
        beatNote: "Hold the reveal for a full beat before the twist lands.",
      });
    }
    if (item.resolution) {
      beats.push({
        label: "RESOLUTION",
        text: item.resolution,
        cue: cueOf(item.resolution),
        beatNote: "Land the moral clearly — this is the part people quote.",
      });
    }

    const secs = estimateSecs(item);
    if (secs > SINGLE_VIDEO_TARGET_SECS) {
      longItems.push({ no: itemNo, title: item.storyTitle, secs });
    }

    // Pacing summary: proportional timestamps per beat from word counts.
    let cursor = 3; // hook takes the first ~3 seconds
    const stamps: string[] = [`hook 0:00`];
    const beatWords = beats.map((b) => Math.max(wordCount(b.text), 1));
    const totalBeatWords = beatWords.reduce((a, b) => a + b, 0);
    const bodySecs = Math.max(secs - 8, 10); // 3s hook + 5s CTA reserved
    beats.forEach((b, bi) => {
      stamps.push(`${b.label.toLowerCase()} ${formatTime(cursor)}`);
      cursor += Math.max(3, Math.round((beatWords[bi] / totalBeatWords) * bodySecs));
    });
    stamps.push(`CTA ${formatTime(cursor)}`);

    const beatScripts = beats
      .map(
        (b) =>
          `${b.label} — say this:\n${b.text}\n[On-screen text: "${b.cue}"]\n[Beat: ${b.beatNote}]`
      )
      .join("\n\n");

    scripts.push(
      `"${item.storyTitle}" — ${item.niche} storytime\n\n` +
        `HOOK (say in the first 3 seconds):\n${hook}\n[On-screen text: "WAIT FOR IT"]\n\n` +
        `${beatScripts}\n\n` +
        `CTA — say this:\n${cta}`
    );

    narrationEstimates.push(
      `Item ${itemNo} "${item.storyTitle}": ~${secs} seconds of narration (estimate — based on ~${WORDS_PER_SECOND} words/sec; your pace will differ).` +
        (secs > SINGLE_VIDEO_TARGET_SECS
          ? ` Over the ~${SINGLE_VIDEO_TARGET_SECS}s single-video target — see the series note.`
          : " Fits one TikTok.")
    );
    pacingSummaries.push(`Item ${itemNo}: ${stamps.join(" → ")}`);
  });

  const seriesNote =
    longItems.length > 0
      ? longItems
          .map(
            (l) =>
              `Item ${l.no} ("${l.title}") is long (~${l.secs}s estimated narration): split it into a 2–3 part series — end part 1 on the conflict cliffhanger — and plan the episodes with the TikTok Series Episode Planner (${SERIES_PLANNER_URL}).`
          )
          .join(" ")
      : `Every story fits comfortably in one TikTok (all under the ~${SINGLE_VIDEO_TARGET_SECS}-second narration target) — no series split needed.`;

  return {
    ok: true,
    values: {
      scripts,
      narrationEstimates,
      pacingSummaries,
      seriesNote,
    },
  };
}
