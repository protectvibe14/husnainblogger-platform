/**
 * Community Post Idea Bank — pure logic (tool-128), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a FIXED TEMPLATE LIBRARY, not AI. It assembles post
 * ideas from 40 hand-written templates bundled in this file (10 per post
 * type: poll / image / text / quiz). The user's niche is substituted into
 * the {niche} placeholder. It cannot publish to the YouTube Community tab
 * (no YouTube API) — ideas are copy-paste drafts only.
 *
 * Bank sizes:
 *   4 post types x 10 templates = 40 templates total.
 *   Poll templates ship with 4 fixed poll options each.
 *   Quiz templates use open-ended/discussion answers — no invented facts.
 *
 * Selection: deterministic hash of (niche + post type) picks a start
 * offset; the requested count of templates is taken in order, wrapping
 * around the type's 10. Same inputs -> same outputs, always.
 *
 * Character guidance: idea lengths are counted locally and shown next to
 * each idea. The YouTube community post character limit is an UNVERIFIED
 * ESTIMATE (published sources vary between ~1000 and ~1500 characters), so
 * the tool shows SOFT guidance only, never a hard limit.
 */

export const POST_TYPES = ['poll', 'image', 'text', 'quiz'] as const;
export type PostTypeId = (typeof POST_TYPES)[number];

export const TEMPLATES_PER_TYPE = 10;
export const TOTAL_TEMPLATES = 40;
export const MIN_COUNT = 1;
export const MAX_COUNT = 8;
export const DEFAULT_COUNT = 5;
/** Soft, unverified estimate of the community post character limit — guidance only. */
export const SOFT_CHAR_GUIDANCE = 'Community post character limits are an unverified estimate (sources vary ~1000-1500); this is soft guidance only.';

export interface PostIdea {
  /** 1-based template number within its post type (1-10) for attribution. */
  templateNo: number;
  postType: PostTypeId;
  text: string;
  /** Locally counted character length of the idea text. */
  charCount: number;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const TEMPLATES: Record<PostTypeId, string[]> = {
  poll: [
    'Which {niche} topic should my next video cover? — Options: Beginner basics / Advanced tactics / Gear & tools / Behind-the-scenes',
    'How long have you been into {niche}? — Options: Just starting / Under a year / 1-3 years / 3+ years',
    'Pick my next {niche} upload day — Options: Monday / Wednesday / Friday / Sunday',
    'What is your biggest {niche} struggle right now? — Options: Getting started / Staying consistent / Finding the time / Knowing what works',
    'Which {niche} format do you watch most? — Options: Long videos / Shorts / Live streams / Community posts like this one',
    'Rate my latest {niche} video — Options: Loved it / Good / Okay / Needs work',
    'Would you join a live {niche} Q&A this week? — Options: Yes, definitely / Maybe / No, too busy / Depends on the time',
    'Which {niche} guest should I invite on the channel? — Options: A beginner / A pro / A fellow creator / You, the audience',
    'What time should I post my {niche} videos? — Options: Morning / Afternoon / Evening / Late night',
    'Should I start a weekly {niche} series? — Options: Yes, weekly / Yes, monthly / No, keep one-offs / Not sure yet',
  ],
  image: [
    'Behind-the-scenes: my {niche} setup today. What should I upgrade first?',
    'Sneak peek: the thumbnail for tomorrow\'s {niche} video. Would you click it?',
    'My {niche} workspace right now — organized chaos or clean setup?',
    'Before and after: a {niche} project I just finished. Full video soon!',
    'Packing my bag for a {niche} shoot — what am I forgetting?',
    'Throwback to my first {niche} video vs today. Thank you for the journey!',
    'Testing a new {niche} idea today — if this photo gets 100 likes, I will film it.',
    'My {niche} inspiration board this week — which one should I try first?',
    'Unboxing something special for the channel\'s {niche} series. Guesses?',
    'A quiet moment before recording my next {niche} video — wish me luck!',
  ],
  text: [
    'Quick question for my {niche} community: what video should I make next?',
    'I have been thinking about {niche} all week — here is what I learned: ...',
    'Unpopular {niche} opinion: ...',
    'Three things I wish I knew before starting {niche}: ...',
    'Thank you for the recent milestone — tell me your favorite {niche} moment on this channel!',
    'Poll results are in! You voted for more {niche} content about ...',
    'A short story about my worst {niche} fail (and what it taught me)...',
    'If you are new here: I post {niche} videos every week. What brought you to the channel?',
    'Reminder: the next {niche} live stream is on [day] at [time] — drop your questions below!',
    'One {niche} tip that changed everything for me: ...',
  ],
  quiz: [
    'Quiz: I describe a {niche} scenario, you guess what I did wrong. Answer revealed in Friday\'s video!',
    'True or false: [a common {niche} myth]. My answer and the explanation drop tomorrow!',
    'Guess the {niche} tool from this blurred photo — first correct guess gets a shoutout!',
    'Riddle: I am used in every {niche} setup but rarely talked about. What am I? Answer in the comments!',
    'Spot the mistake: this {niche} photo has one deliberate error. Can you find it?',
    'Two truths and a lie — {niche} edition. Which one is the lie?',
    'Guess my next {niche} video topic from these three emojis: ...',
    'Memory test: what was the first {niche} video I ever posted? No cheating!',
    'Finish the sentence: "Every {niche} beginner should ..." — best answer gets pinned!',
    'Quiz: which of these {niche} statements did I actually say in a video? Answer tonight!',
  ],
};

/** FNV-1a 32-bit hash — deterministic string -> uint32. */
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function asText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function parseCount(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return DEFAULT_COUNT;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const niche = asText(values['niche']);
  if (!niche) return { ok: false, error: 'Enter your niche to generate post ideas.' };
  if (niche.length > 80) return { ok: false, error: 'Niche must be 80 characters or fewer.' };

  const postTypeRaw = asText(values['postType']).toLowerCase();
  if (!postTypeRaw) return { ok: false, error: 'Choose a post type: poll, image, text or quiz.' };
  if (!(POST_TYPES as readonly string[]).includes(postTypeRaw)) {
    return { ok: false, error: `Post type must be one of: ${POST_TYPES.join(', ')}.` };
  }
  const postType = postTypeRaw as PostTypeId;

  const count = parseCount(values['count']);
  if (count === null) return { ok: false, error: 'Ideas wanted must be a whole number.' };
  if (count < MIN_COUNT || count > MAX_COUNT) {
    return { ok: false, error: `Ask for between ${MIN_COUNT} and ${MAX_COUNT} ideas.` };
  }

  const bank = TEMPLATES[postType];
  const start = hashString(niche.toLowerCase() + '|' + postType) % TEMPLATES_PER_TYPE;

  const ideas: PostIdea[] = [];
  for (let i = 0; i < count; i++) {
    const templateNo = ((start + i) % TEMPLATES_PER_TYPE) + 1;
    const text = bank[(start + i) % TEMPLATES_PER_TYPE].split('{niche}').join(niche);
    ideas.push({ templateNo, postType, text, charCount: text.length });
  }

  const ideaLines = ideas.map(
    (idea) => `[${idea.postType} #${idea.templateNo} · ${idea.charCount} chars] ${idea.text}`,
  );

  return {
    ok: true,
    values: {
      ideas: ideaLines,
      note:
        `Fixed template bank: ${TOTAL_TEMPLATES} templates (${TEMPLATES_PER_TYPE} per post type). ` +
        `Ideas are copy-paste drafts — this tool cannot publish to your YouTube Community tab. ` +
        SOFT_CHAR_GUIDANCE,
    },
  };
}

/** Exposed for tests: bank size bookkeeping. */
export const BANK_SIZES: Record<PostTypeId, number> = {
  poll: TEMPLATES.poll.length,
  image: TEMPLATES.image.length,
  text: TEMPLATES.text.length,
  quiz: TEMPLATES.quiz.length,
};
