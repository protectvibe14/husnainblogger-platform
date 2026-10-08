/**
 * TikTok Behind-the-Scenes Planner (tool-197) — template BTS content planner.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: builds a BTS content plan from FIXED moment templates, fixed
 * caption templates, and a fixed weekly cadence — templated, not AI-written,
 * and uses no TikTok data. No reach or virality claims anywhere; "authentic"
 * here only means "unpolished, real-process moments", never a guarantee of
 * performance.
 *
 * EDGE CASE: if the business field says "no business" (or none/n/a/personal/
 * just a creator), the planner switches to a creator-personal BTS track
 * (process-of-a-creator moments instead of product/storefront moments).
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   BUSINESS_MOMENTS  12 BTS moments for businesses/brands
 *   PERSONAL_MOMENTS  12 BTS moments for individual creators
 *   CAPTION_TEMPLATES  8 caption frames with {business}/{niche} slots
 *   WEEK_DAYS           7 day labels used in the weekly schedule table
 *   TOTAL: 39 fixed bank entries.
 *
 * Determinism: FNV-1a seed from (business|track); same inputs -> same outputs.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_BUSINESS_LEN = 80;
const MAX_NICHE_LEN = 60;

/** Matches "no business" style answers -> creator-personal track. */
const NO_BUSINESS_PATTERN =
  /^(no(t a)?\s*business|no|none|n\/?a|not really|personal(\s*creator)?|just\s*(a\s*)?creator|creator|myself|me)$/i;

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fill(template: string, business: string, niche: string): string {
  return template.split("{business}").join(business).split("{niche}").join(niche);
}

const BUSINESS_MOMENTS: readonly string[] = [
  "Film the morning setup: opening the {business} space, first task of the day, one honest line about the to-do list.",
  "Show one order being packed from start to finish at {business} — hands on the box, tape, label, one customer-thank-you line.",
  "Film a 'messy middle' moment: the part of {business} work that is never pretty (restocking, cleaning, admin).",
  "Ask a {business} customer (or stage a self-interview) for one real reaction to your product or service.",
  "Film yourself making one small decision for {business} today — price, restock, design — and show the reasoning.",
  "Show a time-lapse of one full work session at {business}, then react to it honestly.",
  "Film the 'almost' moment: something that nearly went wrong at {business} and how you fixed it.",
  "Show what {business} looks like after hours — the reset routine nobody sees.",
  "Film one supplier delivery or supply run for {business} and react to what's inside.",
  "Share one thing about {business} you wish you knew when you started — film it in the actual workspace.",
  "Film a 'day one vs today' comparison of your {business} workspace or process.",
  "Show your team member (or your second pair of hands) doing one {business} task — credit them on camera.",
];

const PERSONAL_MOMENTS: readonly string[] = [
  "Film your real creative setup — messy desk, notes, tabs open — and narrate what you're about to make.",
  "Show the 'before filming' ritual: how you get ready, set the camera, and pick the topic.",
  "Film one blooper or retake honestly — keep the stumble in, it builds trust.",
  "Show your planning process: the list, the draft, or the script for your next {niche} video.",
  "Film a 'thinking out loud' walk: talk through one {niche} idea while walking somewhere real.",
  "Show the learning moment: a tutorial, course, or experiment you are doing to get better at {niche}.",
  "Film your workspace reset — cleaning, organizing, deleting — with one honest line about burnout.",
  "Share one comment or DM that changed how you see your {niche} content (blur names).",
  "Film the 'day one vs today' comparison of your own {niche} journey.",
  "Show what a slow day looks like — no fake hustle, just the honest pace of {niche} work.",
  "Film yourself reviewing analytics or comments and reacting to one surprise.",
  "Show the unfinished version: a draft, a sketch, or a half-edited {niche} video before it's polished.",
];

const CAPTION_TEMPLATES: readonly string[] = [
  "the unglamorous side of {business} that nobody posts 👀",
  "not aesthetic, just real {business} life",
  "pov: the {niche} grind looks like THIS today",
  "someone had to show the messy middle of {business}",
  "day in the life: {business} edition (the honest one)",
  "what {business} actually looks like behind the camera",
  "this {niche} moment did NOT go as planned 😅",
  "the {business} reset nobody talks about",
];

const WEEK_DAYS: readonly string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MOMENTS_SHOWN = 8;
const CAPTIONS_SHOWN = 4;

/** Pick `count` templates from `bank` deterministically using seed.
 * NOTE: step 1 is deliberate — a step sharing a factor with bank.length
 * (e.g. step 3 with length 12) would only cycle a subset of indices and
 * could loop forever when count exceeds that subset. */
function pick(bank: readonly string[], count: number, seed: number, business: string, niche: string): string[] {
  const out: string[] = [];
  const used = new Set<number>();
  let i = 0;
  while (out.length < count && used.size < bank.length) {
    const idx = (seed + i) % bank.length;
    i++;
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(fill(bank[idx], business, niche));
  }
  return out;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawBusiness = values["businessType"];
  if (typeof rawBusiness !== "string" || rawBusiness.trim().length === 0) {
    return {
      ok: false,
      error: 'Please tell us your business type — for example "coffee shop", "clothing store" — or type "no business" for a creator-personal plan.',
    };
  }
  const businessType = rawBusiness.trim();
  if (businessType.length > MAX_BUSINESS_LEN) {
    return { ok: false, error: "Business type must be 80 characters or fewer — shorten it and try again." };
  }

  let niche = "";
  const rawNiche = values["niche"];
  if (rawNiche !== undefined && rawNiche !== null && String(rawNiche).trim().length > 0) {
    niche = String(rawNiche).trim();
    if (niche.length > MAX_NICHE_LEN) {
      return { ok: false, error: "Niche must be 60 characters or fewer — shorten it and try again." };
    }
  }
  const nicheForCopy = niche.length > 0 ? niche : "content creation";

  // Edge case: no business -> creator-personal BTS track.
  const personalTrack = NO_BUSINESS_PATTERN.test(businessType);
  const track = personalTrack ? "creator-personal" : "business";
  const businessForCopy = personalTrack ? "your creator life" : businessType;

  const seed = hashString((businessType + "|" + track).toLowerCase());
  const bank = personalTrack ? PERSONAL_MOMENTS : BUSINESS_MOMENTS;
  const moments = pick(bank, MOMENTS_SHOWN, seed, businessForCopy, nicheForCopy);
  const captions = pick(CAPTION_TEMPLATES, CAPTIONS_SHOWN, seed + 5, businessForCopy, nicheForCopy);

  const postingCadence = personalTrack
    ? "Creator-personal track: post 3 BTS videos per week (Monday, Wednesday, Friday) — process clips, bloopers, and reset moments. " +
      "BTS works as the 'trust layer' between your polished videos; keep each clip under 30 seconds and film on the same day you post."
    : `Business track: post 3 BTS videos per week (Monday, Wednesday, Friday) about ${businessForCopy} — one customer/order ` +
      "moment, one messy-middle moment, one after-hours reset moment. Keep each clip under 30 seconds and film on the same day you post.";

  const scheduleRows: string[][] = [];
  for (let i = 0; i < WEEK_DAYS.length; i++) {
    if (i === 0 || i === 2 || i === 4) {
      const m = moments[(i / 2) % moments.length];
      const c = captions[(i / 2) % captions.length];
      scheduleRows.push([WEEK_DAYS[i], "Post a BTS video", `${m} | Caption: "${c}"`]);
    } else {
      scheduleRows.push([WEEK_DAYS[i], "Film or rest", "Batch-film the next BTS moment, or rest — consistency beats daily posting."]);
    }
  }
  const weeklySchedule = {
    columns: ["Day", "Task", "Plan"],
    rows: scheduleRows,
  };

  return {
    ok: true,
    values: { momentsToFilm: moments, captionTemplates: captions, postingCadence, weeklySchedule },
  };
}
