/**
 * Pinned Comment Idea Bank — pure logic (tool-109).
 *
 * GENERATOR tool: runTool(values) with { topic, goal }.
 * Pure TypeScript, zero imports, zero network, zero DOM, zero Date.now().
 * Deterministic: same inputs -> same comments, in bank order.
 *
 * ## What this does (and does NOT do)
 * A fixed template bank of 12 hand-written pinned-comment templates (4 per
 * goal: engagement, corrections, links). The chosen goal's 4 templates are
 * returned with the {topic} placeholder filled. It is template assembly —
 * NOT AI generation. It cannot post or pin comments to YouTube (no API or
 * OAuth per locked rules); output is copy-paste only, and every surfaced
 * string says so.
 *
 * ## Bank layout (documented sizes)
 *   engagement  (4) — question prompts and polls that invite replies
 *   corrections (4) — correction / update notes with timestamp placeholders
 *   links       (4) — resource/link comments with paste placeholders
 *
 * @module pinned-comment-idea-bank/logic
 */

export type CommentGoal = "engagement" | "corrections" | "links";

/** One template; {topic} is filled from the user's input. */
export interface CommentTemplate {
  id: string;
  goal: CommentGoal;
  template: string;
}

/** Fixed 12-template bank (4 per goal). */
export const COMMENT_BANK: CommentTemplate[] = [
  // engagement (4)
  {
    id: "engagement-question",
    goal: "engagement",
    template:
      "What's your biggest struggle with {topic}? I'll reply to the top comments 👇",
  },
  {
    id: "engagement-takeaway",
    goal: "engagement",
    template:
      "I read every comment — drop your #1 takeaway about {topic} below 👇",
  },
  {
    id: "engagement-next-video",
    goal: "engagement",
    template:
      "Which part of {topic} should I cover next? The most-liked comment decides the next video 🎬",
  },
  {
    id: "engagement-poll",
    goal: "engagement",
    template:
      "Quick poll: are you team BEGINNER or team PRO when it comes to {topic}? Vote below ⬇️",
  },
  // corrections (4)
  {
    id: "corrections-fix",
    goal: "corrections",
    template:
      "CORRECTION: at (timestamp) I said X — the correct info about {topic} is: (add the correct details here)",
  },
  {
    id: "corrections-small-fix",
    goal: "corrections",
    template:
      "Small fix for this video on {topic}: (describe the correction). Pinned so nobody misses it 📌",
  },
  {
    id: "corrections-update",
    goal: "corrections",
    template:
      "Update on {topic}: since filming, this changed — (add the update). Full details in the description.",
  },
  {
    id: "corrections-misspoke",
    goal: "corrections",
    template:
      "Heads-up: at (timestamp) I misspoke about {topic}. The correct version: (add it here). Thanks to everyone who flagged it!",
  },
  // links (4)
  {
    id: "links-mentioned",
    goal: "links",
    template:
      "Everything I mentioned about {topic} is linked in the description 🔗 — start here: (paste your link)",
  },
  {
    id: "links-free-resource",
    goal: "links",
    template:
      "Free resource for {topic}: (paste your link). Grab it before you forget 👆",
  },
  {
    id: "links-extended-guide",
    goal: "links",
    template:
      "Want the full breakdown on {topic}? I put the extended guide here: (paste your link)",
  },
  {
    id: "links-tools",
    goal: "links",
    template:
      "My recommended tools for {topic}: (paste your link). Full list + discounts in the description.",
  },
];

/** Fixed how-to-pin steps (the tool cannot pin for you — copy-paste only). */
export const PIN_TIPS: string[] = [
  "Open your video in YouTube Studio → Comments, find your comment, click the three dots, then Pin.",
  "Only one comment can be pinned per video — pin the one that serves your goal.",
  "Copy-paste only: this tool cannot post or pin comments for you (no YouTube API connection).",
  "Edit your pinned comment later from the same menu if details change.",
];

export const HONESTY_NOTE =
  "Template library — these comments come from a fixed bank of 12 hand-written templates, not AI. " +
  "The tool cannot post or pin comments to YouTube; copy the text and pin it manually in YouTube Studio.";

const GOALS: CommentGoal[] = ["engagement", "corrections", "links"];

/** Fill {topic} in a template. Trims and collapses whitespace in the topic. */
export function fillTemplate(template: string, topic: string): string {
  const clean = topic.trim().replace(/\s+/g, " ");
  return template.split("{topic}").join(clean);
}

/** All templates for one goal, in fixed bank order. */
export function templatesForGoal(goal: CommentGoal): CommentTemplate[] {
  return COMMENT_BANK.filter((t) => t.goal === goal);
}

function parseGoal(value: unknown): CommentGoal | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim().toLowerCase();
  return (GOALS as string[]).includes(s) ? (s as CommentGoal) : null;
}

/**
 * Template entry point (generator dispatch).
 * values: { topic: string, goal: "engagement" | "corrections" | "links" }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter a video topic and pick a goal." };
  }
  const topic = String(values.topic ?? "").trim();
  if (topic === "") {
    return { ok: false, error: "Enter a video topic." };
  }
  const goal = parseGoal(values.goal);
  if (goal === null) {
    return {
      ok: false,
      error: 'Pick a goal: "engagement", "corrections", or "links".',
    };
  }
  const comments = templatesForGoal(goal).map((t) => fillTemplate(t.template, topic));
  const copyAll = comments.map((c, i) => `${i + 1}. ${c}`).join("\n\n");
  return {
    ok: true,
    values: {
      comments,
      copyAll,
      pinTips: [...PIN_TIPS],
      honestyNote: HONESTY_NOTE,
      count: comments.length,
    },
  };
}
