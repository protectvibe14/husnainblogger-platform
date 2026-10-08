/**
 * tool-370 — X Tweet Idea Generator (generator)
 *
 * Pure client-side tweet-draft generator. Fills fixed template banks with
 * the user's topic (per selected goal) and validates every draft against
 * a conservative weighted character count. NOT AI.
 *
 * TEMPLATE BANKS: 8 goal-specific templates × 3 goals (engagement,
 * traffic, followers) = 24 templates, plus 4 generic templates used to
 * round out the list. The tool returns 8 drafts: the 8 goal templates
 * (or 8 generic ones when no goal is picked). Deterministic order — same
 * topic and goal always produce the same drafts.
 *
 * WEIGHTED COUNT (conservative, documented — not claimed as X's current
 * official rule): each URL counts as 23 characters, each emoji counts as
 * 2, everything else counts as 1 code point. Every draft is guaranteed
 * ≤280 weighted characters: when the topic is long, it is cut at a word
 * boundary with an ellipsis so the draft fits.
 *
 * A topic that alone exceeds 280 weighted characters is rejected with a
 * pointer to the Thread Planner (tool-371) instead.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Draft cap in weighted characters. */
export const TWEET_MAX_WEIGHTED = 280;

/** Weighted cost of one URL (conservative). */
export const URL_WEIGHT = 23;

/** Weighted cost of one emoji (conservative). */
export const EMOJI_WEIGHT = 2;

/** Goals the generator supports. */
export const GOALS: ReadonlyArray<string> = ['engagement', 'traffic', 'followers'];

/** Rough emoji detection for weighting (counts each match as 2). */
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;
const EMOJI_GLOBAL_RE = new RegExp(EMOJI_RE.source, 'gu');
const URL_RE = /https?:\/\/[^\s<>"']+/gi;

/**
 * Weighted length: URLs → 23 each, emoji → 2 each, everything else 1
 * code point. Deterministic and dependency-free.
 */
export function weightedLength(text: string): number {
  const withoutUrls = text.replace(URL_RE, () => 'x'.repeat(URL_WEIGHT));
  const emojis = withoutUrls.match(EMOJI_GLOBAL_RE);
  const emojiCount = emojis ? emojis.length : 0;
  const rest = withoutUrls.replace(EMOJI_GLOBAL_RE, '');
  return [...rest].length + emojiCount * EMOJI_WEIGHT;
}

type TweetTemplate = (topic: string) => string;

/** Bank: 8 engagement-goal templates. */
const ENGAGEMENT_TEMPLATES: ReadonlyArray<TweetTemplate> = [
  (t) => `Unpopular opinion about ${t}:`,
  (t) => `Nobody talks about this side of ${t} 👇`,
  (t) => `I spent 30 days obsessing over ${t}. Here's what surprised me:`,
  (t) => `What's the ONE thing you wish you knew before starting ${t}?`,
  (t) => `Stop doing ${t} like this ❌\nDo it like this instead ✅`,
  (t) => `Hot take: most ${t} advice is wrong. Here's why:`,
  (t) => `POV: you finally figured out ${t}`,
  (t) => `Reply with your biggest ${t} struggle — I'll answer every one 👇`,
];

/** Bank: 8 traffic-goal templates. */
const TRAFFIC_TEMPLATES: ReadonlyArray<TweetTemplate> = [
  (t) => `I wrote a full breakdown of ${t} (link in reply) 🧵`,
  (t) => `Everything I know about ${t}, in one thread 👇 (link in reply)`,
  (t) => `Free guide: ${t} for beginners — link in the first reply 🔗`,
  (t) => `This ${t} resource changed how I work. Link in reply 👇`,
  (t) => `Bookmark this: my complete ${t} playbook (link in reply) 📌`,
  (t) => `Want the ${t} checklist I use every week? It's in the reply 👇`,
  (t) => `New post: ${t}, explained simply. Link in first reply 🔗`,
  (t) => `I turned my ${t} notes into a free guide — grab it in the reply 👇`,
];

/** Bank: 8 follower-goal templates. */
const FOLLOWER_TEMPLATES: ReadonlyArray<TweetTemplate> = [
  (t) => `I post about ${t} every day. Follow for more 👇`,
  (t) => `Day 1 of sharing everything I learn about ${t}. Follow along 🚀`,
  (t) => `If you're into ${t}, you're in the right place. Follow me for daily posts 💡`,
  (t) => `Building in public: my ${t} journey starts today. Follow to watch 📈`,
  (t) => `${t} tips, mistakes, and wins — daily. Hit follow 👇`,
  (t) => `I break down ${t} so you don't have to. New posts daily — follow ✨`,
  (t) => `Follow me if ${t} is your thing. You'll like what's coming 👀`,
  (t) => `Turning my ${t} experiments into daily posts. Follow along 🧪`,
];

/** Bank: 4 generic templates (used when no goal is selected). */
const GENERIC_TEMPLATES: ReadonlyArray<TweetTemplate> = [
  (t) => `Quick thought on ${t}:`,
  (t) => `3 things I learned about ${t} this week 🧵`,
  (t) => `${t} — underrated or overhyped?`,
  (t) => `My ${t} hot take, in one line:`,
];

/** How many drafts the tool returns. */
export const DRAFT_COUNT = 8;

function templatesFor(goal: string): ReadonlyArray<TweetTemplate> {
  if (goal === 'engagement') return ENGAGEMENT_TEMPLATES;
  if (goal === 'traffic') return TRAFFIC_TEMPLATES;
  if (goal === 'followers') return FOLLOWER_TEMPLATES;
  return GENERIC_TEMPLATES.concat(ENGAGEMENT_TEMPLATES.slice(0, 4));
}

/** Cut the topic at a word boundary so the filled draft fits the cap. */
function fitTopic(tpl: TweetTemplate, topic: string): string {
  let draft = tpl(topic);
  if (weightedLength(draft) <= TWEET_MAX_WEIGHTED) return draft;
  const words = topic.split(/\s+/);
  let short = topic;
  while (words.length > 1 && weightedLength(tpl(short + '…')) > TWEET_MAX_WEIGHTED) {
    words.pop();
    short = words.join(' ');
  }
  draft = tpl(short + '…');
  if (weightedLength(draft) > TWEET_MAX_WEIGHTED) {
    // Absolute fallback: hard cut of the whole draft.
    const cps = [...draft];
    draft = cps.slice(0, TWEET_MAX_WEIGHTED - 1).join('') + '…';
  }
  return draft;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const rawTopic = values['topic'];
  const rawGoal = values['goal'];

  if (typeof rawTopic !== 'string' || !rawTopic.trim()) {
    return { ok: false, error: 'Enter a topic to generate tweet ideas about.' };
  }
  const topic = rawTopic.replace(/\s+/g, ' ').trim();

  if (weightedLength(topic) > TWEET_MAX_WEIGHTED) {
    return {
      ok: false,
      error:
        'This topic needs more than 280 characters on its own — try the Thread Planner (tool-371) instead of a single tweet.',
    };
  }

  let goal = typeof rawGoal === 'string' ? rawGoal.trim().toLowerCase() : '';
  const notes: string[] = [];
  if (goal && GOALS.indexOf(goal) === -1) {
    notes.push('Goal "' + goal + '" is not supported — using general tweet ideas instead.');
    goal = '';
  }

  const templates = templatesFor(goal);
  const tweets: string[] = [];
  for (let i = 0; i < Math.min(DRAFT_COUNT, templates.length); i++) {
    tweets.push(fitTopic(templates[i], topic));
  }

  notes.push(
    'Link-in-reply best practice: keep links out of the tweet text and post the link as the first reply, so the main tweet reads clean.',
  );
  notes.push(
    'Weighted count used here: links = 23 characters, emoji = 2 each, everything else = 1 (a conservative client-side rule, not X\u2019s official counter).',
  );

  return {
    ok: true,
    values: {
      tweets,
      notes,
    },
  };
}
