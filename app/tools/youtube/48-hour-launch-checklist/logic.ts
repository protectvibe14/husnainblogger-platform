/**
 * 48-Hour Launch Checklist (tool-135) — pure logic, zero imports.
 *
 * HONESTY: a FIXED, human-written checklist of 18 timed launch steps
 * across 7 phases (T-48h … T+48h). No runTool — the tracker template
 * renders TRACKER_ITEMS and tracks checked state client-side
 * (localStorage + progress %). Nothing is generated, estimated, or
 * personalized; the checklist is general launch guidance, not a
 * guarantee of performance, and it never posts or automates anything.
 *
 * Tracker contract:
 *   export interface TrackerItem { id: string; label: string; detail?: string }
 *   export const TRACKER_ITEMS: TrackerItem[] = [ ... ];  // 18 items
 *   export function describeProgress(checked: number, total: number): string
 *
 * Item ids: lowercase kebab, unique. Each item carries a 1-line detail.
 * Phase timing lives in the label prefix ("T-48h", …) — anchor each phase
 * to the publish datetime you set in YouTube Studio.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/** 18 fixed launch steps in 7 timed phases, each with a 1-line detail. */
export const TRACKER_ITEMS: TrackerItem[] = [
  // ---- T-48h: preparation ----
  {
    id: "schedule-upload",
    label: "T-48h — Schedule the upload or premiere",
    detail: "Set your publish datetime in YouTube Studio; add a premiere if you want a live-chat moment.",
  },
  {
    id: "title-tags-description",
    label: "T-48h — Finalize title, tags, and description",
    detail: "Front-load the keyword in the title; fill the description with links, timestamps, and chapters.",
  },
  {
    id: "thumbnail-lock",
    label: "T-48h — Upload and lock the thumbnail",
    detail: "Check it at phone size — big text must still read at a glance.",
  },
  {
    id: "end-screens-cards",
    label: "T-48h — Add end screens and cards",
    detail: "Point viewers to one next video and your subscribe button.",
  },
  // ---- T-24h: pre-launch buzz ----
  {
    id: "pinned-comment-draft",
    label: "T-24h — Draft your pinned comment",
    detail: "Write the one question or CTA you will pin in the first hour.",
  },
  {
    id: "community-announcement",
    label: "T-24h — Write the community announcement",
    detail: "A short post telling subscribers the video drops tomorrow.",
  },
  {
    id: "shorts-teaser-cut",
    label: "T-24h — Cut a Shorts teaser",
    detail: "15–30 seconds of the strongest hook, linking to the full video.",
  },
  {
    id: "cross-promo-queue",
    label: "T-24h — Queue social promo posts",
    detail: "Draft posts for your other platforms pointing at the premiere link.",
  },
  // ---- T-2h: final QA ----
  {
    id: "processing-check",
    label: "T-2h — Confirm HD processing finished",
    detail: "1080p/4K must be ready — re-upload if the video is stuck in SD.",
  },
  {
    id: "description-links-verify",
    label: "T-2h — Verify every description link",
    detail: "Click each one; fix affiliate links and broken timestamps.",
  },
  // ---- T+0: launch ----
  {
    id: "go-live",
    label: "T+0 — Publish / start the premiere",
    detail: "Be present in live chat for at least the first 15 minutes.",
  },
  {
    id: "pin-comment-live",
    label: "T+0 — Pin your comment in the first 30 minutes",
    detail: "Ask one clear question to seed discussion early.",
  },
  {
    id: "reply-first-comments",
    label: "T+0 — Reply to the first comments",
    detail: "Early creator replies signal an active comments section.",
  },
  // ---- T+6h to T+24h: amplification ----
  {
    id: "shorts-teaser-publish",
    label: "T+24h — Publish the Shorts teaser",
    detail: "Pin a comment under the Short linking to the full video.",
  },
  {
    id: "analytics-24h",
    label: "T+24h — Check CTR and retention at 24 hours",
    detail: "Note click-through rate; if below your average, test a new thumbnail.",
  },
  {
    id: "community-followup",
    label: "T+24h — Post a follow-up community update",
    detail: "Share one highlight or result from the video to pull late viewers in.",
  },
  // ---- T+48h: review ----
  {
    id: "review-48h-analytics",
    label: "T+48h — Review 48-hour analytics",
    detail: "Compare views, CTR, and retention with your last 3 videos; write down one lesson.",
  },
  {
    id: "repurpose-plan",
    label: "T+48h — Plan repurposing",
    detail: "Decide which clip becomes a Short and which quote becomes a post.",
  },
];

/**
 * Human-readable progress line for the tracker UI.
 * Clamps out-of-range counts so the text never lies.
 */
export function describeProgress(checked: number, total: number): string {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeChecked = Math.min(safeTotal, Math.max(0, Math.floor(checked)));
  const pct = safeTotal === 0 ? 0 : Math.round((safeChecked / safeTotal) * 100);
  if (safeChecked <= 0) {
    return `0 of ${safeTotal} done — nothing checked yet. Start with the T-48h phase.`;
  }
  if (safeChecked >= safeTotal) {
    return `${safeTotal} of ${safeTotal} done (${pct}%) — launch sequence complete. Review the T+48h analytics item.`;
  }
  return `${safeChecked} of ${safeTotal} done (${pct}%) — keep going.`;
}
