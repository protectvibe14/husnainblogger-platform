/**
 * Facebook Post Idea Generator — pure logic (tool-390). Zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: assembles post drafts from hand-written ideas.
 * Each idea has {hook, body, cta}; the user's page type is inserted.
 *
 * Idea banks (8 ideas per goal):
 *   engagement — comment/like-driven post ideas.
 *   traffic    — link-click-driven post ideas (blog/product pages).
 *   community  — member-bonding post ideas.
 * Totals: 24 ideas. Nothing is written by AI.
 *
 * Front-loading: hooks are written short (<=120 chars) so the key
 * message lands before mobile feed truncation (~125–150 chars). This is
 * best-practice guidance, not a hard cap — the output's trimTip says so.
 * The technical 63,206-character post maximum is noted but never
 * targeted (per spec).
 *
 * Optional yourDraft input: if the user pastes their own draft (e.g. a
 * long 5,000-char draft per the spec edge case), it is kept verbatim in
 * the output and trimTip gains a "consider trimming" note when it is
 * long (> 2000 chars).
 *
 * Deterministic: same inputs -> same outputs (start index = char-code
 * sum of inputs, modulo 8; 5 consecutive ideas, wrapping).
 */

export type PostGoal = "engagement" | "traffic" | "community";

/** Supported goals, in canonical order. */
export const POST_GOALS: PostGoal[] = ["engagement", "traffic", "community"];

/** Input bounds. */
export const MAX_PAGE_TYPE_LENGTH = 60;
export const MAX_DRAFT_LENGTH = 20000;

/** Number of post drafts returned per run. */
export const DRAFT_COUNT = 5;

/** Hook length guidance: key message must survive mobile truncation. */
export const HOOK_GUIDE_LENGTH = 120;

/** Draft length above which the "consider trimming" note appears. */
export const LONG_DRAFT_NOTE_AT = 2000;

export interface PostIdea {
  hook: string;
  body: string;
  cta: string;
}

/** 8 engagement-goal ideas. Placeholder: {type}. */
export const ENGAGEMENT_IDEAS: PostIdea[] = [
  { hook: "Settle this debate: what's the #1 {type} tip?", body: "Our team is split down the middle, so we're asking you.", cta: "Comment your answer — the best one gets pinned." },
  { hook: "Caption this {type} moment.", body: "No wrong answers. Funniest caption wins.", cta: "Drop your caption below." },
  { hook: "Fill in the blank: the best {type} is ____.", body: "One word is enough. Let's see what wins.", cta: "Comment your word below." },
  { hook: "True or false? {type} myth-busting time.", body: "We'll post a common claim — you vote true or false, then we reveal the answer.", cta: "Vote in the comments, then share with a friend who needs this." },
  { hook: "Show us your {type} setup!", body: "Photo challenge: post a picture of yours in the comments.", cta: "Best photo gets featured on our page next week." },
  { hook: "Unpopular opinion: {type} edition.", body: "Share yours — keep it friendly.", cta: "Like the takes you agree with." },
  { hook: "This week in {type}: what did we miss?", body: "Roundup time — tell us the news, wins, or fails we should cover.", cta: "Comment below and we'll feature the best." },
  { hook: "Rate your {type} skills 1-10.", body: "Be honest. No judgment.", cta: "Reply to someone else's rating with one tip to level them up." },
];

/** 8 traffic-goal ideas. Placeholder: {type}. */
export const TRAFFIC_IDEAS: PostIdea[] = [
  { hook: "We wrote the ultimate {type} guide — free.", body: "Everything we know, in one place. No signup needed.", cta: "Read it here: [link]" },
  { hook: "The {type} checklist everyone keeps asking for.", body: "We finally published it. Bookmark this one.", cta: "Get the free checklist: [link]" },
  { hook: "5 {type} mistakes costing you money.", body: "Number 3 surprises everyone. Full breakdown on our site.", cta: "Read the full list: [link]" },
  { hook: "New on the blog: {type} for beginners.", body: "Start from zero with our step-by-step walkthrough.", cta: "Start reading: [link]" },
  { hook: "Our most-shared {type} post of the month.", body: "In case you missed it — here's why it took off.", cta: "Read it here: [link]" },
  { hook: "Free {type} template inside.", body: "The exact template our team uses every week.", cta: "Download it free: [link]" },
  { hook: "The {type} tool we can't live without.", body: "Full review plus pros, cons, and pricing on our site.", cta: "Read the review: [link]" },
  { hook: "{type} case study: what actually worked.", body: "Real numbers, real lessons. Full story on the blog.", cta: "See the results: [link]" },
];

/** 8 community-goal ideas. Placeholder: {type}. */
export const COMMUNITY_IDEAS: PostIdea[] = [
  { hook: "Welcome! Introduce yourself.", body: "New here? Tell us who you are and what brought you.", cta: "Say hi in the comments — we'll reply to every intro." },
  { hook: "Member spotlight: nominate someone.", body: "Know a {type} star in this community? Tag them.", cta: "Tag your nominee below." },
  { hook: "What should we talk about next week?", body: "This page is yours — pitch the topic.", cta: "Comment your idea; top-voted becomes next week's post." },
  { hook: "Share your {type} win — big or small.", body: "Wins deserve applause. Tell us yours.", cta: "Post your win below; we'll cheer you on." },
  { hook: "Help a fellow member out.", body: "Someone asked a great {type} question — can you answer it?", cta: "Drop your advice in the comments." },
  { hook: "Throwback: your first {type} memory.", body: "Where were you when you started? Share the story.", cta: "Tell us below — nostalgia welcome." },
  { hook: "Local {type} meetup? Let's gauge interest.", body: "Would you show up if we organized one?", cta: "Comment your city if you're in." },
  { hook: "Thank you — 1,000 of you and counting.", body: "This community runs on your posts and replies.", cta: "Tag someone who makes this group great." },
];

export interface PostDraftResultValues {
  ok: boolean;
  values?: {
    postDrafts: string[];
    copyAll: string;
    trimTip: string;
    yourDraft: string;
  };
  error?: string;
}

function sumChars(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

/** Render one idea as HOOK / BODY / CTA lines. */
export function formatDraft(idea: PostIdea): string {
  return `HOOK: ${idea.hook}\nBODY: ${idea.body}\nCTA: ${idea.cta}`;
}

export function runTool(values: Record<string, unknown>): PostDraftResultValues {
  const typeRaw = values["pageType"];
  if (typeof typeRaw !== "string" || typeRaw.trim().length === 0) {
    return { ok: false, error: "Please enter your page type (e.g. bakery, fitness coaching, local news)." };
  }
  const pageType = typeRaw.trim();

  if (pageType.length > MAX_PAGE_TYPE_LENGTH) {
    return { ok: false, error: `Keep your page type under ${MAX_PAGE_TYPE_LENGTH} characters (yours is ${pageType.length}).` };
  }

  let goal: PostGoal = "engagement"; // default per spec (optional input)
  const goalRaw = values["goal"];
  if (typeof goalRaw === "string" && goalRaw.trim().length > 0) {
    const g = goalRaw.trim().toLowerCase();
    if (g === "engagement" || g === "traffic" || g === "community") {
      goal = g;
    } else {
      return { ok: false, error: "Goal must be 'engagement', 'traffic', or 'community'." };
    }
  }

  let yourDraft = "";
  const draftRaw = values["yourDraft"];
  if (typeof draftRaw === "string" && draftRaw.length > 0) {
    if (draftRaw.length > MAX_DRAFT_LENGTH) {
      return { ok: false, error: `Your pasted draft is over ${MAX_DRAFT_LENGTH} characters — Facebook posts cap at 63,206, so trim it and try again.` };
    }
    yourDraft = draftRaw; // kept verbatim per spec edge case
  }

  const bank = goal === "engagement" ? ENGAGEMENT_IDEAS : goal === "traffic" ? TRAFFIC_IDEAS : COMMUNITY_IDEAS;
  const seed = sumChars(pageType + "|" + goal);
  const start = seed % bank.length;

  const fill = (t: string): string => t.split("{type}").join(pageType);

  const postDrafts: string[] = [];
  for (let i = 0; i < DRAFT_COUNT; i++) {
    const idea = bank[(start + i) % bank.length];
    postDrafts.push(formatDraft({ hook: fill(idea.hook), body: fill(idea.body), cta: fill(idea.cta) }));
  }

  let trimTip =
    "Front-load the key message: mobile feeds truncate posts around 125–150 characters, so every hook above carries the point up front. " +
    "Facebook's technical maximum is 63,206 characters — it exists, but never target it.";
  if (yourDraft.length > LONG_DRAFT_NOTE_AT) {
    trimTip += ` Your pasted draft is ${yourDraft.length} characters — consider trimming it; most readers never expand long posts.`;
  }

  return {
    ok: true,
    values: {
      postDrafts,
      copyAll: postDrafts.map((d, i) => `--- Draft ${i + 1} ---\n${d}`).join("\n\n"),
      trimTip,
      yourDraft,
    },
  };
}
