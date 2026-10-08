/**
 * AI Fact-Check Checklist (tool-341) — pure logic, zero imports.
 *
 * FIXED CHECKLIST, NOT AI (inventory type corrected generator -> checklist):
 * 16 human-written verification STEPS in 5 fixed groups. This tool does not
 * verify facts — it gives you the workflow to verify them yourself. The UI
 * must never imply automated fact-checking.
 *
 * Groups (16 steps total):
 *   inventory — Extract the claims (4)
 *   numbers   — Verify numbers, dates, prices (3)
 *   sources   — Verify sources and citations (3)
 *   media     — Verify quotes, people, images (3)
 *   gate      — Publish gate (3)
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/**
 * The full verification workflow. `detail` is the one-line guidance
 * shown under each step.
 */
export const TRACKER_ITEMS: TrackerItem[] = [
  // --- Inventory ---
  {
    id: "inventory-list-claims",
    label: "Inventory: list every claim in the draft",
    detail:
      "Highlight every statement of fact: statistics, dates, names, rankings, 'studies show', cause-and-effect.",
  },
  {
    id: "inventory-separate-opinion",
    label: "Inventory: separate claims from opinions",
    detail:
      "Mark which highlighted lines are opinions or advice — opinions do not need sources, claims do.",
  },
  {
    id: "inventory-rank-risk",
    label: "Inventory: rank claims by risk",
    detail:
      "Circle the claims that could harm trust or money if wrong (medical, legal, financial, prices) — check those first.",
  },
  {
    id: "inventory-note-sources",
    label: "Inventory: write down the claimed source",
    detail:
      "Next to each claim, note where the AI says the fact came from — you will verify each one.",
  },
  // --- Numbers ---
  {
    id: "numbers-statistics",
    label: "Numbers: verify every statistic",
    detail:
      "Search each statistic yourself. Confirm the number, the year, and that it is not misquoted.",
  },
  {
    id: "numbers-dates-versions",
    label: "Numbers: verify dates and product versions",
    detail:
      "Confirm every date, deadline, and product version against the official source — AI invents these often.",
  },
  {
    id: "numbers-prices",
    label: "Numbers: verify prices and fees",
    detail:
      "Open the vendor's own pricing page. Confirm amounts, currencies, and what is included.",
  },
  // --- Sources ---
  {
    id: "sources-open-links",
    label: "Sources: open every citation",
    detail:
      "Click each link. It must load, be current, and actually support the sentence it sits behind.",
  },
  {
    id: "sources-primary",
    label: "Sources: prefer primary sources",
    detail:
      "For anything important, trace back to the original study, report, or official announcement.",
  },
  {
    id: "sources-no-hallucinated",
    label: "Sources: reject sources you cannot find",
    detail:
      "If a cited study or article does not exist in search, the AI hallucinated it — remove the claim.",
  },
  // --- Media / people ---
  {
    id: "media-quotes",
    label: "Quotes: confirm every quote is real",
    detail:
      "Search the exact quote. It must exist, be attributed to the right person, and not be altered.",
  },
  {
    id: "media-people",
    label: "People: confirm names, titles, roles",
    detail:
      "Check that each named person exists, holds the stated title, and is still in that role.",
  },
  {
    id: "media-images",
    label: "Images: confirm captions and rights",
    detail:
      "Every image needs an accurate caption and a license you actually hold — AI cannot grant image rights.",
  },
  // --- Publish gate ---
  {
    id: "gate-unverified",
    label: "Gate: decide on unverifiable claims",
    detail:
      "Any claim you could not verify must be deleted, clearly labeled as an estimate, or backed by your own data.",
  },
  {
    id: "gate-risk-review",
    label: "Gate: re-read the high-risk claims",
    detail:
      "Do a final read of the circled high-risk claims. If any is shaky, cut it — one wrong fact kills trust.",
  },
  {
    id: "gate-signoff",
    label: "Gate: sign off before publishing",
    detail:
      "Confirm in your notes: who verified what, and which sources were used. Then publish.",
  },
];

/**
 * Human-readable progress for the checklist UI.
 */
export function describeProgress(checked: number, total: number): string {
  const safeChecked = Math.max(0, Math.min(Math.floor(checked), Math.max(0, total)));
  const safeTotal = Math.max(0, total);
  if (safeTotal === 0) return "The checklist is empty.";
  if (safeChecked === 0)
    return `0 of ${safeTotal} verification steps done. Start by listing every claim.`;
  if (safeChecked >= safeTotal)
    return `All ${safeTotal} verification steps done. Publish with confidence.`;
  return `${safeChecked} of ${safeTotal} verification steps done.`;
}
