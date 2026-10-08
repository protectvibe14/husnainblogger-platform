/**
 * TikTok Viral Format Library (tool-189) — fixed evergreen format library.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY (per spec honestyNote): this is a STATIC, evergreen library of
 * proven video formats. It is NOT live virality data and never claims to
 * know what is viral right now. Selecting a category returns the fixed,
 * curated entries for that category; the [NICHE] slot is filled with the
 * user's niche for relevance. No AI, no trend feeds, no TikTok data.
 *
 * FIXED LIBRARY (documented — retrieval only, no generation):
 *   5 categories x 6 format entries = 30 total entries.
 *   Each entry: name, setup, beats, whenToUse.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_NICHE_LENGTH = 48;

export const FORMAT_CATEGORIES: readonly string[] = [
  'challenge',
  'story',
  'tutorial',
  'trend-jack',
  'series',
];

export interface FormatEntry {
  name: string;
  setup: string;
  beats: string;
  whenToUse: string;
}

const CHALLENGE: readonly FormatEntry[] = [
  {
    name: '30-Day [NICHE] Challenge',
    setup: 'Commit publicly to a 30-day [NICHE] goal and post the journey.',
    beats: 'Day 1: state the goal on camera. Weekly: 30-second check-ins with real numbers. Day 30: honest results, win or lose.',
    whenToUse: 'Use when you want accountability content that gives viewers a reason to follow for updates.',
  },
  {
    name: 'Try-It-First Challenge',
    setup: 'Attempt a hard [NICHE] task live with zero preparation.',
    beats: 'State the task. Attempt it unedited. React honestly to the result. Ask viewers to try it too.',
    whenToUse: 'Use when a trend or skill in your niche begs for an on-camera attempt.',
  },
  {
    name: 'POV Challenge Duet',
    setup: 'Duet a viral [NICHE] video from your own POV.',
    beats: 'Show the original clip. Cut to your reaction or opposite take. End with your [NICHE] verdict.',
    whenToUse: 'Use when a competitor or trend video is already getting views you can borrow.',
  },
  {
    name: 'One-Minute [NICHE] Makeover',
    setup: 'Fix a common [NICHE] problem in under 60 seconds on camera.',
    beats: 'Show the "before" problem. Apply the fix in fast cuts. Reveal the "after".',
    whenToUse: 'Use when your niche has visual problems with satisfying quick fixes.',
  },
  {
    name: 'Audience Dares Me',
    setup: 'Let comments pick your next [NICHE] challenge.',
    beats: 'Ask for dares in a pinned comment. Pick one and film the attempt. Credit the commenter on screen.',
    whenToUse: 'Use when engagement is low and you need comment-driven ideas.',
  },
  {
    name: '$0 vs $100 [NICHE]',
    setup: 'Compare the cheapest and priciest way to do the same [NICHE] thing.',
    beats: 'Show both options side by side. Test each. Declare the honest winner.',
    whenToUse: 'Use when your niche has products or tools at wildly different price points.',
  },
];

const STORY: readonly FormatEntry[] = [
  {
    name: 'Day-in-My-[NICHE]-Life',
    setup: 'A fast-cut vlog of one real day in your [NICHE] life.',
    beats: 'Morning routine clip. 3 work/process moments with text overlays. Evening reflection with a lesson.',
    whenToUse: 'Use to build trust and personality between high-effort content pieces.',
  },
  {
    name: 'Storytime Reveal',
    setup: 'Tell a personal [NICHE] story with the payoff withheld.',
    beats: 'Hook with the most dramatic line. Tell the story in 4 beats. Reveal the twist at the end.',
    whenToUse: 'Use when you have a real failure, win, or weird experience worth 60 seconds.',
  },
  {
    name: '[NICHE] Origin Story',
    setup: 'How you got into [NICHE] — the honest version.',
    beats: 'Where you started. The low point. The turning moment. Where you are now.',
    whenToUse: 'Use as a pinned intro video so new followers instantly know who you are.',
  },
  {
    name: 'My Biggest [NICHE] Fail',
    setup: 'Share your worst [NICHE] mistake and what it taught you.',
    beats: 'State the fail plainly. Show or describe the damage. Share the lesson. Warn viewers.',
    whenToUse: 'Use when you want relatable, save-worthy content that humanizes your expertise.',
  },
  {
    name: 'Customer / Follower Story',
    setup: 'Tell a follower’s [NICHE] win (with permission) as a mini case study.',
    beats: 'Introduce the person. Show their starting point. Reveal the result. Credit them.',
    whenToUse: 'Use when you have testimonials — social proof converts better than your own claims.',
  },
  {
    name: 'Underdog [NICHE] Journey',
    setup: 'Document starting from zero in [NICHE] with full honesty.',
    beats: 'Episode 1: "I have nothing". Weekly progress clips. Milestone celebrations with real numbers.',
    whenToUse: 'Use when you are genuinely new — viewers root for documented beginners.',
  },
];

const TUTORIAL: readonly FormatEntry[] = [
  {
    name: '3-Step [NICHE] Fix',
    setup: 'Solve one specific [NICHE] problem in exactly 3 steps.',
    beats: 'Name the problem. Step 1, 2, 3 with on-screen numbers. Show the fixed result.',
    whenToUse: 'Use for search-driven topics viewers will save and share.',
  },
  {
    name: '[NICHE] Mistakes Tutorial',
    setup: 'The 3 mistakes beginners make in [NICHE] — and the fixes.',
    beats: 'Mistake 1 + fix. Mistake 2 + fix. Mistake 3 + fix. CTA: save this.',
    whenToUse: 'Use when your niche has predictable beginner errors.',
  },
  {
    name: '[NICHE] Tool Teardown',
    setup: 'Review or break down one [NICHE] tool, product, or app.',
    beats: 'Show the tool. Test its main feature live. Give an honest verdict with a score.',
    whenToUse: 'Use for product-heavy niches where buyers research before spending.',
  },
  {
    name: 'First [NICHE] Ever',
    setup: 'Do a [NICHE] task for the very first time on camera.',
    beats: 'Admit you are a beginner. Attempt the task. Show the messy result. Share one learning.',
    whenToUse: 'Use to attract beginners — they trust someone one step ahead more than experts.',
  },
  {
    name: '[NICHE] Speed-Run',
    setup: 'Complete a [NICHE] process as fast as possible with a timer on screen.',
    beats: 'Start the timer. Fast-cut the process. Stop the timer. Compare to the "normal" time.',
    whenToUse: 'Use for process content that benefits from urgency and fast cuts.',
  },
  {
    name: 'Duet-This Tutorial',
    setup: 'Post a tutorial designed for viewers to duet with their attempt.',
    beats: 'Teach the move/step. Pause with "your turn" text. Ask viewers to duet their result.',
    whenToUse: 'Use when you want tutorial content that generates its own follow-up videos.',
  },
];

const TREND_JACK: readonly FormatEntry[] = [
  {
    name: '[NICHE] Sound Swap',
    setup: 'Take a trending sound and make it about [NICHE].',
    beats: 'Use the trending audio. Overlay [NICHE]-specific text or clips. Keep the meme structure intact.',
    whenToUse: 'Use when a sound is trending and your niche can wear its format.',
  },
  {
    name: 'Meme Template Fit',
    setup: 'Force a viral meme template onto a [NICHE] situation.',
    beats: 'Copy the meme’s exact structure. Swap in [NICHE] examples. End with the meme’s punchline beat.',
    whenToUse: 'Use for quick, low-effort posts that ride existing watch patterns.',
  },
  {
    name: '[NICHE] News Jack',
    setup: 'React to breaking news or a viral moment through a [NICHE] lens.',
    beats: 'Show the news clip. Give your expert take in 30 seconds. Predict what happens next.',
    whenToUse: 'Use within 24–48 hours of the news — speed beats polish here.',
  },
  {
    name: 'Comment-Bait Trend',
    setup: 'Post a deliberately debatable [NICHE] take in a trending format.',
    beats: 'State the hot take. Give 2 reasons. Ask "agree or disagree?" in the caption.',
    whenToUse: 'Use sparingly when engagement dips — debates boost comments fast.',
  },
  {
    name: 'POV Trend Remix',
    setup: 'Use the "POV:" format for a hyper-specific [NICHE] moment.',
    beats: 'POV text naming the exact situation. Act out the reaction. Relatable ending.',
    whenToUse: 'Use for relatable, shareable content your niche instantly recognizes.',
  },
  {
    name: 'Stitch the Debate',
    setup: 'Stitch a controversial [NICHE] opinion with your counter-take.',
    beats: 'Show the original claim. Cut to your rebuttal with evidence. Invite replies.',
    whenToUse: 'Use when a wrong or spicy take in your niche is already getting views.',
  },
];

const SERIES: readonly FormatEntry[] = [
  {
    name: '[NICHE] 101 — Part N',
    setup: 'A numbered beginner series covering [NICHE] fundamentals.',
    beats: 'Part 1: the single most important concept. Each part: one concept + one example. Recap previous parts in 5 seconds.',
    whenToUse: 'Use to turn one big topic into weeks of follow-worthy content.',
  },
  {
    name: 'Weekly [NICHE] Roundup',
    setup: 'A recurring segment: this week in [NICHE].',
    beats: '3 headlines with quick takes. One winner and one loser of the week. Tease next week.',
    whenToUse: 'Use in fast-moving niches where followers want a weekly digest.',
  },
  {
    name: '[NICHE] Glossary Series',
    setup: 'Define one [NICHE] term per video in 30 seconds.',
    beats: 'Say the term. Give the plain-English definition. Show one example. CTA: follow for the next term.',
    whenToUse: 'Use in jargon-heavy niches where beginners constantly Google terms.',
  },
  {
    name: '[NICHE] Myth vs Fact',
    setup: 'Debunk one [NICHE] myth per episode.',
    beats: 'State the myth. Show why people believe it. Present the fact with proof. End with the corrected takeaway.',
    whenToUse: 'Use when your niche is full of bad advice worth correcting.',
  },
  {
    name: '[NICHE] Case Study',
    setup: 'One real [NICHE] example per episode, broken down.',
    beats: 'Introduce the case. Show the numbers or outcome. Extract 2 lessons. Ask viewers for the next case.',
    whenToUse: 'Use when you have (or can find) real examples with measurable results.',
  },
  {
    name: '[NICHE] Q&A Series',
    setup: 'Answer one follower question per video, on camera.',
    beats: 'Read the comment on screen. Answer in 45 seconds. Pin a prompt for the next question.',
    whenToUse: 'Use when comments contain repeat questions — it rewards engagement with content.',
  },
];

export const FORMAT_LIBRARY: Record<string, readonly FormatEntry[]> = {
  challenge: CHALLENGE,
  story: STORY,
  tutorial: TUTORIAL,
  'trend-jack': TREND_JACK,
  series: SERIES,
};

export const LIBRARY_SIZE = 30; // 5 categories x 6 entries

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawNiche = values.niche;
  if (!isNonEmptyString(rawNiche)) {
    return { ok: false, error: 'Niche is required — tell the tool what your TikTok account is about (e.g. "skincare").' };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.` };
  }

  const rawCat = values.formatCategory;
  if (!isNonEmptyString(rawCat)) {
    return { ok: false, error: 'Format category is required — pick one of: challenge, story, tutorial, trend-jack, series.' };
  }
  const category = rawCat.trim().toLowerCase();
  if (!FORMAT_CATEGORIES.includes(category)) {
    return { ok: false, error: `Unknown format category "${rawCat}". Pick one of: challenge, story, tutorial, trend-jack, series.` };
  }

  const entries = FORMAT_LIBRARY[category];
  const table = {
    columns: ['Format', 'Setup', 'Beats', 'When to use'],
    rows: entries.map((e) => [
      e.name.replace(/\[NICHE\]/g, niche),
      e.setup.replace(/\[NICHE\]/g, niche),
      e.beats.replace(/\[NICHE\]/g, niche),
      e.whenToUse.replace(/\[NICHE\]/g, niche),
    ]),
  };

  return {
    ok: true,
    values: { formats: table },
  };
}
