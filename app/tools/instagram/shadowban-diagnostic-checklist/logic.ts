/**
 * Shadowban Diagnostic Checklist — core logic (tool-203).
 *
 * TRACKER tool (trackerMode: 'checklist'). NO runTool.
 * Pure TypeScript, zero imports, zero network, zero DOM. Deterministic.
 *
 * ## What this does (and does NOT do)
 * A fixed 14-item self-assessment checklist of common Instagram shadowban
 * warning signs. The UI persists checked items in localStorage and calls
 * describeProgress(checked, total) to show an honest risk band.
 *
 * HONESTY (do not remove): this is SELF-ASSESSMENT ONLY. It CANNOT detect
 * an actual shadowban — there is no API access to Instagram reach data, and
 * Instagram does not expose a shadowban status. The risk band is a plain
 * count-based band over user-checked symptoms, not a diagnosis. Every
 * surfaced string says so.
 *
 * ## Risk bands (count-based, fixed)
 *   LOW      = 0–4 of 14 symptoms checked
 *   MODERATE = 5–8 of 14 symptoms checked
 *   HIGH     = 9–14 of 14 symptoms checked
 *
 * ## Item groups (id prefixes)
 *   reach-*   (3) — reach drop symptoms
 *   tag-*     (3) — hashtag visibility symptoms
 *   engage-*  (3) — engagement symptoms
 *   account-* (5) — account/restriction symptoms
 *
 * @module shadowban-diagnostic-checklist/logic
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

export const TRACKER_ITEMS: TrackerItem[] = [
  {
    id: "reach-drop-sudden",
    label: "Sudden reach drop",
    detail: "Views on recent posts or reels fell sharply with no change in posting habits.",
  },
  {
    id: "reach-drop-sustained",
    label: "Drop lasts 2+ weeks",
    detail: "Lower reach has continued across multiple posts, not just one flop.",
  },
  {
    id: "reach-nonfollowers-collapsed",
    label: "Non-follower reach collapsed",
    detail: "Insights show reach now comes almost entirely from existing followers.",
  },
  {
    id: "tag-search-invisible",
    label: "Posts missing from hashtag search",
    detail: "A non-follower cannot find your post on a small hashtag page.",
  },
  {
    id: "tag-followers-only",
    label: "Only followers see your hashtags",
    detail: "Non-followers report not finding your content via hashtag search.",
  },
  {
    id: "tag-explore-missing",
    label: "Missing from Explore/Reels feeds",
    detail: "Non-follower discovery in Insights has dropped to near zero.",
  },
  {
    id: "engage-followers-only",
    label: "Engagement only from followers",
    detail: "Likes and comments from new accounts have dried up.",
  },
  {
    id: "engage-comments-hidden",
    label: "Comments getting hidden",
    detail: "Followers say their comments disappear or need approval.",
  },
  {
    id: "engage-reach-down-followers-too",
    label: "Even followers see less",
    detail: "Reach fell among your own followers, not just new audiences.",
  },
  {
    id: "account-content-flagged",
    label: "Posts removed or flagged",
    detail: "You received content warnings or takedowns recently.",
  },
  {
    id: "account-action-blocked",
    label: "Actions temporarily blocked",
    detail: "Instagram limited likes, follows, or comments for spam-like behavior.",
  },
  {
    id: "account-status-warning",
    label: "Account Status shows issues",
    detail: "Settings → Account Status lists content against guidelines.",
  },
  {
    id: "account-restricted-tags-used",
    label: "Used restricted hashtags",
    detail: "You used tags from a banned or restricted list recently.",
  },
  {
    id: "account-automation-used",
    label: "Third-party apps or automation",
    detail: "Bots, auto-follow tools, or growth services touched this account.",
  },
];

/** Fixed count-based risk bands. */
export const RISK_BANDS = {
  LOW: { min: 0, max: 4, label: "LOW" },
  MODERATE: { min: 5, max: 8, label: "MODERATE" },
  HIGH: { min: 9, max: 14, label: "HIGH" },
} as const;

const HONESTY_SUFFIX =
  "This is a self-assessment checklist only — it cannot detect a real shadowban. Verify in Instagram Insights and Account Status, and test hashtag visibility from a non-follower account.";

/**
 * Describe checklist progress as an honest risk band.
 * checked = symptoms the user confirmed; total = TRACKER_ITEMS.length.
 */
export function describeProgress(checked: number, total: number): string {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeChecked = Math.max(0, Math.min(Math.floor(checked), safeTotal));
  if (safeTotal === 0) return "The checklist is empty.";
  const band =
    safeChecked <= RISK_BANDS.LOW.max
      ? RISK_BANDS.LOW.label
      : safeChecked <= RISK_BANDS.MODERATE.max
        ? RISK_BANDS.MODERATE.label
        : RISK_BANDS.HIGH.label;
  if (safeChecked === 0) {
    return `0 of ${safeTotal} warning signs checked — Risk band: ${band}. ${HONESTY_SUFFIX}`;
  }
  if (safeChecked >= safeTotal) {
    return `All ${safeTotal} warning signs checked — Risk band: ${band}. ${HONESTY_SUFFIX}`;
  }
  return `${safeChecked} of ${safeTotal} warning signs checked — Risk band: ${band}. ${HONESTY_SUFFIX}`;
}
