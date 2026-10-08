/**
 * Content Refresh Checklist (tool-314) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a FIXED DECISION-TREE CHECKLIST, not a generator.
 * Inventory type corrected generator -> checklist: nothing is generated
 * at runtime. runTool() takes the user's content type and returns the
 * matching fixed checklist branch as a list. Every step was written by a
 * human; the tool never invents advice, stats, or traffic claims.
 *
 * Generator contract: runTool(values: Record<string, unknown>)
 *   -> { ok, values, error }.
 * `values.checklist` is a string[]. Output ids match meta.ts outputs
 * ('checklist'). Input id matches meta.ts inputs ('contentType').
 *
 * Fixed branch sizes (documented per contract):
 *   - post:  12 steps
 *   - video: 11 steps
 *   - page:  10 steps
 *
 * Each branch ends with the keep / update / merge / delete decision step.
 */

export const CONTENT_TYPES = ["post", "video", "page"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export interface RefreshChecklistResult {
  ok: boolean;
  values?: { checklist: string[] };
  error?: string;
}

const POST_CHECKLIST: string[] = [
  "Check traffic: does the post still get steady search visits? If yes, it is worth refreshing.",
  "Check accuracy: are the facts, prices, screenshots, and examples still current? Flag everything outdated.",
  "Check cannibalization: does another post on your site target the same keyword? If yes, consider merging.",
  "Check intent match: does the content still match what searchers want today? If not, plan a rewrite.",
  "Update the title tag and meta description to reflect the refreshed content.",
  "Rewrite the intro so it restates the promise for today's reader.",
  "Replace outdated examples, stats, and images with current ones.",
  "Add subtopics competitors now cover that this post is missing.",
  "Fix or remove broken internal and external links.",
  "Tighten the structure: clearer H2s, shorter paragraphs, scannable lists.",
  "Update the publish/modified date after republishing, then re-promote the post.",
  "Decide: KEEP (steady traffic, still fresh) / UPDATE (traffic but stale) / MERGE (overlaps another post) / DELETE (no traffic, no links, no value — redirect the URL).",
];

const VIDEO_CHECKLIST: string[] = [
  "Check views: does the video still earn steady views or watch time? If yes, it is worth refreshing.",
  "Check accuracy: are the steps, prices, and on-screen claims still correct? Note what is wrong.",
  "Check comments: what are viewers confused about? Those questions shape the refresh.",
  "Check the title and thumbnail: do they still match the video and current search interest?",
  "Update the description with current links, timestamps, and a clear call to action.",
  "Re-record or patch outdated segments rather than leaving wrong information live.",
  "Add missing chapters/timestamps so viewers can jump to answers.",
  "Replace pinned comments or cards that point to dead or outdated links.",
  "Refresh the end screen to point at your current best related video.",
  "Re-promote: feature it in a playlist, link it from new videos and posts.",
  "Decide: KEEP (steady views, still accurate) / UPDATE (views but stale info) / MERGE (overlaps a newer video — unlist the weaker one) / DELETE (no views, no value — remove).",
];

const PAGE_CHECKLIST: string[] = [
  "Check traffic and conversions: does the page still earn visits or signups? If yes, refresh it carefully.",
  "Check accuracy: are offers, prices, contact details, and testimonials current?",
  "Check intent match: does the page still answer what visitors came for?",
  "Update the headline and intro to match the current offer or message.",
  "Replace outdated proof (old logos, dates, screenshots) with current proof.",
  "Fix broken links, forms, and buttons — test the page like a first-time visitor.",
  "Tighten the copy: one clear next step, scannable sections.",
  "Check mobile layout: the page must work perfectly on phones.",
  "Re-check the page's internal links from the rest of the site after any change.",
  "Decide: KEEP (traffic + conversions, still accurate) / UPDATE (valuable but stale) / MERGE (overlaps a stronger page — consolidate and redirect) / DELETE (no traffic, no conversions, no links — remove and redirect).",
];

const BRANCHES: Record<ContentType, string[]> = {
  post: POST_CHECKLIST,
  video: VIDEO_CHECKLIST,
  page: PAGE_CHECKLIST,
};

/**
 * Return the fixed checklist branch for the given content type.
 * values.contentType must be one of: post, video, page.
 */
export function runTool(values: Record<string, unknown>): RefreshChecklistResult {
  const raw = values?.contentType;
  const contentType = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!contentType) {
    return { ok: false, error: "Choose a content type: post, video, or page." };
  }
  if (!CONTENT_TYPES.includes(contentType as ContentType)) {
    return {
      ok: false,
      error: `Unknown content type "${contentType}". Choose: post, video, or page.`,
    };
  }
  // Fixed branch, copied (never mutated) so repeat runs stay identical.
  return { ok: true, values: { checklist: [...BRANCHES[contentType as ContentType]] } };
}
