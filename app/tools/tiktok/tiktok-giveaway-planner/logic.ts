/**
 * TikTok Giveaway Planner — pure logic (tool-195).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: plans are assembled from FIXED templates — no AI, no invented
 * dates, costs, or legal conclusions. Entry mechanics are fixed per method;
 * the timeline is computed arithmetically from durationDays; rules text and
 * scripts contain [bracketed] placeholders the user must fill in. A legal
 * reminder is ALWAYS included: giveaway/sweepstakes rules differ by country
 * and this tool is not legal advice.
 * Bank sizes:
 *   - ENTRY_METHODS: 5 (fixed mechanics + announcement line each)
 *   - SCRIPT_TEMPLATES: 2 (announcement + winner-announcement)
 * Determinism: same inputs -> same outputs (timeline derived from durationDays).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_PRIZE_LEN = 150;
const MIN_DAYS = 1;
const MAX_DAYS = 30;

/** Entry-method ids (also the select option values in meta.ts). */
export const ENTRY_METHOD_IDS: readonly string[] = [
  "Follow + comment",
  "Follow + like + comment",
  "Tag a friend",
  "Duet / Stitch entry",
  "Comment a keyword",
];

interface EntryMethod {
  mechanics: string[];
  announcementLine: string;
}

/** 5 fixed entry-method definitions. */
export const ENTRY_METHODS: Record<string, EntryMethod> = {
  "Follow + comment": {
    mechanics: [
      "Follow your account — must stay followed until the winner is drawn.",
      "Leave one comment on the giveaway video.",
      "Extra comments do not add entries (say this up front).",
    ],
    announcementLine: "Follow me and drop one comment below — that is your entry.",
  },
  "Follow + like + comment": {
    mechanics: [
      "Follow your account.",
      "Like the giveaway video.",
      "Comment your answer to the prompt in the caption.",
    ],
    announcementLine: "Follow, like this video, and comment your answer — all three to enter.",
  },
  "Tag a friend": {
    mechanics: [
      "Follow your account.",
      "Tag one real friend per comment — each tag is one entry (cap at 5).",
      "Fake or spam tags are disqualified (say this up front).",
    ],
    announcementLine: "Follow me and tag a friend who would love this — each tag is an entry.",
  },
  "Duet / Stitch entry": {
    mechanics: [
      "Follow your account.",
      "Duet or Stitch the giveaway video showing why you want the prize.",
      "Use the giveaway hashtag so entries are findable: #[your-hashtag].",
    ],
    announcementLine: "Duet or Stitch this video telling me why you want it — most creative entry wins.",
  },
  "Comment a keyword": {
    mechanics: [
      "Follow your account.",
      "Comment the exact keyword from the video caption.",
      "One keyword comment is one entry.",
    ],
    announcementLine: "Follow me and comment the secret keyword from this video — that is your entry.",
  },
};

const LEGAL_REMINDER =
  "Not legal advice: giveaway and sweepstakes rules differ by country and by US state — " +
  "some require written official rules, eligibility limits, or tax paperwork for prizes above a " +
  "threshold. Confirm your local requirements before launching, keep “No purchase necessary” in " +
  "your rules, and never ask entrants for payment to enter.";

function err(error: string): RunResult {
  return { ok: false, error };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawPrize = values["prize"];
  if (typeof rawPrize !== "string" || rawPrize.trim().length === 0) {
    return err(
      'Please enter the prize — for example "a $50 skincare bundle" — so the plan fits your giveaway.',
    );
  }
  const prize = rawPrize.trim().replace(/\s+/g, " ");
  if (prize.length > MAX_PRIZE_LEN) {
    return err(
      `Prize must be ${MAX_PRIZE_LEN} characters or fewer — shorten it and try again.`,
    );
  }

  const rawDays = values["durationDays"];
  const days =
    typeof rawDays === "number"
      ? rawDays
      : typeof rawDays === "string" && rawDays.trim() !== ""
        ? Number(rawDays.trim())
        : NaN;
  if (!Number.isInteger(days) || days < MIN_DAYS || days > MAX_DAYS) {
    return err(
      `Duration must be a whole number of days between ${MIN_DAYS} and ${MAX_DAYS} — pick how long entries stay open.`,
    );
  }

  const rawMethod = values["entryMethod"];
  if (typeof rawMethod !== "string" || rawMethod.trim().length === 0) {
    return err("Pick an entry method — for example “Follow + comment”.");
  }
  const method = ENTRY_METHODS[rawMethod.trim()];
  if (!method) {
    return err(
      `Entry method must be one of: ${ENTRY_METHOD_IDS.join(", ")}.`,
    );
  }

  const mechanics = method.mechanics.map((m, i) => `${i + 1}. ${m}`).join("\n");

  const planRules =
    `GIVEAWAY OFFICIAL RULES (edit the [bracketed] parts before posting)\n\n` +
    `Prize: ${prize} (1 winner, unless you state otherwise)\n` +
    `Duration: ${days} day${days === 1 ? "" : "s"} — entries close on [DATE, TIME, TIMEZONE]\n` +
    `Eligibility: [country/region, minimum age — check your local rules]\n` +
    `How to enter:\n${mechanics}\n` +
    `No purchase necessary to enter or win.\n` +
    `Winner picked at random on day ${days + 1} and announced within 48 hours.\n` +
    `This giveaway is not sponsored, endorsed, or run by TikTok.`;

  const timeline: string[] = [
    `Day 1 — Launch: post the announcement video with the prize on camera and the entry steps in the caption. Pin it to your profile.`,
  ];
  if (days >= 3) {
    const mid = Math.max(2, Math.round(days / 2));
    timeline.push(
      `Day ${mid} — Midpoint reminder: post a reminder video or Story-style clip (“${Math.max(1, days - mid)} days left to enter”). Reply to entry comments to boost reach.`,
    );
  }
  if (days >= 2) {
    timeline.push(
      `Day ${days} — Final 24 hours: post a last-call video (“entries close tomorrow”). Stop accepting entries at the posted deadline.`,
    );
  } else {
    timeline.push(
      `Day 1 (evening) — Entries close: stop accepting entries at the posted deadline.`,
    );
  }
  timeline.push(
    `Day ${days + 1} — Winner selection: export the entry list, pick one winner at random (screen-record the draw for transparency), verify they followed all steps.`,
    `Day ${days + 2} — Winner announcement: post the winner video; the winner has 48 hours to DM you to claim. If unclaimed, redraw.`,
  );

  const scripts =
    `ANNOUNCEMENT VIDEO SCRIPT (30–45 seconds)\n` +
    `Hook (0–3s): "I am giving away ${prize} — here is how to enter in 10 seconds."\n` +
    `Body: ${method.announcementLine} Show the prize on camera.\n` +
    `CTA: "Follow so you do not miss the winner announcement on day ${days + 1}."\n\n` +
    `WINNER ANNOUNCEMENT SCRIPT (15–30 seconds)\n` +
    `"Thank you to everyone who entered the ${prize} giveaway — we had [number] entries! ` +
    `The winner, picked at random, is @[winner handle]. @[winner], DM me within 48 hours to claim. ` +
    `Did not win? Follow for the next one."`;

  return {
    ok: true,
    values: { planRules, timeline, scripts, legalReminder: LEGAL_REMINDER },
  };
}
