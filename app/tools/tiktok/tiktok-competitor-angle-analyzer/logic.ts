/**
 * TikTok Competitor Angle Analyzer (tool-188) — pure keyword-scan text analyzer.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY (per spec honestyNote): this tool analyzes ONLY the text/notes the
 * user pastes (caption or transcript). It cannot look up TikTok accounts,
 * fetch posts, or scrape anything — a pasted "@handle" alone is refused with
 * an explanatory error. Classifications come from FIXED taxonomies matched by
 * keyword counting; nothing is "AI". Gaps come from a FIXED bank of 12
 * opportunity prompts.
 *
 * FIXED TAXONOMIES (documented sizes — scoring is deterministic keyword hits):
 *   HOOK_TYPES    10 — each with a fixed keyword-signal list
 *   CONTENT_ANGLES 6 — each with a fixed keyword-signal list
 *   CTA_KEYWORDS  10 — presence scan only
 *   GAP_BANK      12 — fixed opportunity prompts, [ANGLE]/[HOOK] slots
 *
 * Tie-break: highest score wins; ties resolve to the earliest taxonomy entry,
 * so results are fully deterministic (same text -> same analysis).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_POST_LENGTH = 30;
export const MAX_POST_LENGTH = 5000;
export const MAX_NICHE_LENGTH = 48;

export interface TaxonomyEntry {
  id: string;
  label: string;
  description: string;
  keywords: readonly string[];
}

export const HOOK_TYPES: readonly TaxonomyEntry[] = [
  {
    id: 'question-hook',
    label: 'Question Hook',
    description: 'Opens with a direct question that promises an answer in the video.',
    keywords: ['what if', 'have you ever', 'did you know', 'why does', 'how do you', 'question for', 'quick question', 'wondering why', '?'],
  },
  {
    id: 'bold-claim',
    label: 'Bold Claim',
    description: 'Opens with a strong, opinionated statement designed to stop the scroll.',
    keywords: ['secret', 'nobody', 'stop doing', 'never', 'guaranteed', 'best ever', 'changed my life', 'the truth about', 'i was wrong'],
  },
  {
    id: 'curiosity-gap',
    label: 'Curiosity Gap',
    description: 'Withholds the payoff so the viewer must watch to find out.',
    keywords: ["you won't believe", 'wait for it', 'what happened next', 'the ending', 'until the end', 'part 2', 'keep watching', 'reveal'],
  },
  {
    id: 'story-opening',
    label: 'Story Opening',
    description: 'Opens in the middle of a personal story (storytime format).',
    keywords: ['storytime', 'i was', 'once i', 'last year', 'when i', 'my boss', 'my mom', 'true story'],
  },
  {
    id: 'listicle',
    label: 'Listicle Hook',
    description: 'Promises a numbered list of tips, ways, or mistakes.',
    keywords: ['3 ways', '5 tips', '10 things', 'mistakes', 'reasons why', 'signs you', 'things i wish', 'hacks'],
  },
  {
    id: 'tutorial',
    label: 'Tutorial Hook',
    description: 'Promises to teach a skill or process step by step.',
    keywords: ['how to', 'step by step', 'tutorial', "here's how", 'let me show', 'follow along', 'beginner guide'],
  },
  {
    id: 'challenge',
    label: 'Challenge Hook',
    description: 'Frames the video as a timed challenge or experiment.',
    keywords: ['day 1', 'day 30', 'challenge', 'trying', '30 days', 'experiment', 'for a week'],
  },
  {
    id: 'testimonial',
    label: 'Testimonial Hook',
    description: 'Opens with a personal test, review, or before/after.',
    keywords: ['i tried', 'honest review', 'before and after', 'results', 'rating', 'worth it', 'my results', 'unboxing'],
  },
  {
    id: 'comparison',
    label: 'Comparison Hook',
    description: 'Sets up a versus / instead-of / before-vs-after frame.',
    keywords: [' vs ', 'versus', 'instead of', 'better than', 'worse than', 'which one', 'cheap vs expensive'],
  },
  {
    id: 'trend-jack',
    label: 'Trend Jack',
    description: 'Rides an existing sound, meme, or POV trend format.',
    keywords: ['pov', 'trend', 'duet this', 'stitch this', 'dance', 'sound on', 'viral sound'],
  },
];

export const CONTENT_ANGLES: readonly TaxonomyEntry[] = [
  {
    id: 'educational',
    label: 'Educational',
    description: 'Teaches the viewer something concrete (tips, how-tos, facts).',
    keywords: ['tip', 'how to', 'learn', 'guide', 'tutorial', 'explain', 'mistake', 'beginner', 'hack'],
  },
  {
    id: 'entertaining',
    label: 'Entertaining',
    description: 'Optimized for laughs, drama, or pure watch time.',
    keywords: ['funny', 'lol', 'hilarious', 'drama', 'skit', 'comedy', 'relatable', 'memes'],
  },
  {
    id: 'inspirational',
    label: 'Inspirational',
    description: 'Motivates or tells a transformation / success story.',
    keywords: ['motivation', 'inspired', 'journey', 'transformation', 'mindset', 'believe', 'dream', 'success'],
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Invites replies, opinions, or audience participation.',
    keywords: ['comment', 'agree or disagree', 'your thoughts', 'debate', 'duet', 'stitch', 'reply'],
  },
  {
    id: 'product-promo',
    label: 'Product Promo',
    description: 'Showcases or sells a product (demo, review, affiliate).',
    keywords: ['link in bio', 'discount', 'code', 'buy', 'shop', 'affiliate', 'sponsored', 'sale', 'product'],
  },
  {
    id: 'behind-the-scenes',
    label: 'Behind the Scenes',
    description: 'Shows process, workspace, or unpolished real life.',
    keywords: ['behind the scenes', 'bts', 'process', 'day in my life', 'vlog', 'workspace', 'grwm', 'real life'],
  },
];

export const CTA_KEYWORDS: readonly string[] = [
  'follow', 'comment', 'share', 'save', 'link in bio', 'duet', 'stitch', 'subscribe', 'tap the', 'click the',
];

export const GAP_BANK: readonly string[] = [
  'The pasted post barely uses the [ANGLE] angle — a video in that angle would stand apart from this competitor.',
  'The [HOOK] hook is common in this niche: try the inverse opening (state the outcome first, then rewind) for contrast.',
  'No clear CTA was detected — most competitors forget this; add one explicit action (follow, comment, or save) to your version.',
  'This post leans on one format: answer the same topic as a different format (duet, stitch, or listicle) to differentiate.',
  'Add a proof moment competitors skip: show a real result, screenshot, or before/after on screen.',
  'The post targets beginners — a version for intermediate viewers ([NICHE] level 2) would face less competition.',
  'Speed up the value delivery: promise and deliver the first tip within 5 seconds instead of a long intro.',
  'Turn the single tip into a series (Part 1, Part 2…) — serial content wins returning viewers competitors miss.',
  'Add a comment-bait question at the end; community-angle replies cost nothing and feed the algorithm.',
  'Localize it: the pasted post is generic — a version with local examples or prices would feel fresher.',
  'Counter the claim: if the competitor’s hook is a bold claim, post the respectful counter-take — debates travel.',
  'Show your face earlier: talking-head delivery of this topic builds more trust than text-only slides.',
];

function scoreEntry(text: string, entry: TaxonomyEntry): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of entry.keywords) {
    if (lower.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

function detectCtas(text: string): string[] {
  const lower = text.toLowerCase();
  return CTA_KEYWORDS.filter((kw) => lower.includes(kw));
}

function looksLikeHandleOnly(text: string): boolean {
  const t = text.trim();
  if (/^(analyze\s+)?@[\w.]{1,30}$/i.test(t)) return true;
  if (/https?:\/\//.test(t) && t.length < 120) return true;
  if (/^analyze\s+@[\w.]{1,30}\s*$/i.test(t)) return true;
  return false;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const raw = values.pastedCompetitorPost;
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { ok: false, error: 'Paste the competitor’s caption or transcript text to analyze — the tool cannot fetch TikTok accounts.' };
  }
  const text = raw.trim();
  if (looksLikeHandleOnly(text)) {
    return {
      ok: false,
      error: 'I can’t look up TikTok accounts or fetch posts. Paste the actual caption or transcript text of the competitor post instead of a @handle or link.',
    };
  }
  if (text.length < MIN_POST_LENGTH) {
    return { ok: false, error: `The pasted text is too short to analyze (minimum ${MIN_POST_LENGTH} characters). Paste the full caption or transcript.` };
  }
  if (text.length > MAX_POST_LENGTH) {
    return { ok: false, error: `The pasted text is too long (maximum ${MAX_POST_LENGTH} characters). Paste a shorter excerpt.` };
  }

  const rawNiche = values.niche;
  let niche = 'your niche';
  if (rawNiche !== undefined && rawNiche !== null && rawNiche !== '') {
    if (typeof rawNiche !== 'string') {
      return { ok: false, error: 'Niche must be text.' };
    }
    const n = rawNiche.trim();
    if (n.length > MAX_NICHE_LENGTH) {
      return { ok: false, error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.` };
    }
    if (n.length > 0) niche = n;
  }

  // Score hook types and angles (deterministic; ties -> taxonomy order).
  let bestHook: TaxonomyEntry = HOOK_TYPES[0];
  let bestHookScore = -1;
  for (const entry of HOOK_TYPES) {
    const s = scoreEntry(text, entry);
    if (s > bestHookScore) { bestHookScore = s; bestHook = entry; }
  }
  let bestAngle: TaxonomyEntry = CONTENT_ANGLES[0];
  let bestAngleScore = -1;
  const angleScores: number[] = [];
  for (const entry of CONTENT_ANGLES) {
    const s = scoreEntry(text, entry);
    angleScores.push(s);
    if (s > bestAngleScore) { bestAngleScore = s; bestAngle = entry; }
  }

  const ctas = detectCtas(text);
  const ctaDetected = ctas.length > 0
    ? `Detected CTA keyword(s): ${ctas.join(', ')}.`
    : 'No CTA detected in the pasted text.';

  // Build gaps: two weakest angles + fixed prompts + CTA gap if none found.
  const weakAngles = CONTENT_ANGLES
    .map((e, i) => ({ e, s: angleScores[i] }))
    .sort((a, b) => a.s - b.s || CONTENT_ANGLES.indexOf(a.e) - CONTENT_ANGLES.indexOf(b.e))
    .slice(0, 2)
    .map((x) => x.e.label.toLowerCase());
  const gaps: string[] = [
    GAP_BANK[0].replace('[ANGLE]', weakAngles[0]).replace('[HOOK]', bestHook.label).replace('[NICHE]', niche),
    GAP_BANK[1].replace('[ANGLE]', weakAngles[1]).replace('[HOOK]', bestHook.label).replace('[NICHE]', niche),
    GAP_BANK[5].replace('[ANGLE]', weakAngles[0]).replace('[HOOK]', bestHook.label).replace('[NICHE]', niche),
    GAP_BANK[7].replace('[ANGLE]', weakAngles[1]).replace('[HOOK]', bestHook.label).replace('[NICHE]', niche),
    (ctas.length === 0 ? GAP_BANK[2] : GAP_BANK[8])
      .replace('[ANGLE]', weakAngles[0]).replace('[HOOK]', bestHook.label).replace('[NICHE]', niche),
    GAP_BANK[10].replace('[ANGLE]', bestAngle.label.toLowerCase()).replace('[HOOK]', bestHook.label).replace('[NICHE]', niche),
  ];

  return {
    ok: true,
    values: {
      hookType: `${bestHook.label} — ${bestHook.description}`,
      contentAngle: `${bestAngle.label} — ${bestAngle.description}`,
      ctaDetected,
      gaps,
    },
  };
}
