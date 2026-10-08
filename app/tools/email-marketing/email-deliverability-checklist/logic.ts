/**
 * Email Deliverability Checklist (tool-445) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY (NON-NEGOTIABLE, from the spec's honestyNote):
 * - GUIDANCE CHECKLIST ONLY. This tool CANNOT test deliverability. It
 *   performs no DNS lookups, no SPF/DKIM/DMARC verification, no
 *   inbox-placement tests, and no live verification of any kind.
 * - Every item's detail is labeled "Guidance:" and cites real, publicly
 *   documented platform rules (Gmail/Yahoo bulk-sender requirements,
 *   CAN-SPAM opt-out rules, GDPR consent rules). Nothing is measured or
 *   claimed as a test result.
 *
 * Tracker contract:
 *   export interface TrackerItem { id: string; label: string; detail?: string }
 *   export const TRACKER_ITEMS: TrackerItem[] = [ ... ];  // 18 items
 *   export function describeProgress(checked: number, total: number): string
 *
 * Item ids: lowercase kebab, unique. Each item carries a 1-line guidance
 * detail. The tracker template renders TRACKER_ITEMS and tracks checked
 * state client-side (localStorage + progress %). Nothing is generated,
 * estimated, or personalized.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/** 18 fixed deliverability guidance checks, each with a 1-line detail. */
export const TRACKER_ITEMS: TrackerItem[] = [
  {
    id: "authenticate-spf-dkim-dmarc",
    label: "Authenticate with SPF, DKIM, and DMARC",
    detail: "Guidance: Gmail and Yahoo's published bulk-sender rules require SPF or DKIM authentication with DMARC alignment — this list cannot verify your DNS records.",
  },
  {
    id: "keep-spam-rate-low",
    label: "Keep the spam complaint rate low",
    detail: "Guidance: Google publishes a 0.3% spam-rate ceiling for bulk senders; aim well below it and never let it climb.",
  },
  {
    id: "one-click-unsubscribe",
    label: "Add one-click unsubscribe to marketing mail",
    detail: "Guidance: Gmail's published rules require bulk marketing senders to support List-Unsubscribe with one-click.",
  },
  {
    id: "permission-based-lists",
    label: "Only email people who gave permission",
    detail: "Guidance: never buy or scrape lists; GDPR requires consent in the EU and CAN-SPAM requires a working opt-out on every commercial email.",
  },
  {
    id: "custom-sending-domain",
    label: "Send from a custom domain, not a free address",
    detail: "Guidance: bulk senders on free domains (like gmail.com) cannot meet the authentication requirements above.",
  },
  {
    id: "warm-up-new-domains",
    label: "Warm up new domains and IPs gradually",
    detail: "Guidance: ramp volume over several weeks; sudden spikes from a new sender look like spam to filters.",
  },
  {
    id: "remove-hard-bounces",
    label: "Remove hard bounces immediately",
    detail: "Guidance: repeated bounces damage sender reputation; take invalid addresses off the list after one hard bounce.",
  },
  {
    id: "suppress-unengaged",
    label: "Suppress chronically unengaged subscribers",
    detail: "Guidance: mail nobody opens hurts placement; re-engage inactive subscribers or remove them.",
  },
  {
    id: "clean-subject-lines",
    label: "Keep subject lines clean",
    detail: "Guidance: excessive caps, extra symbols, and bait words raise spam-filter scores — write subjects a human would trust.",
  },
  {
    id: "plain-text-version",
    label: "Include a plain-text version of every email",
    detail: "Guidance: image-only emails with no text are a common spam flag; always send multipart (HTML + text).",
  },
  {
    id: "check-links-images",
    label: "Check links and images before sending",
    detail: "Guidance: broken links, redirect chains, and URL shorteners erode trust with filters and readers.",
  },
  {
    id: "real-reply-address",
    label: "Use a real reply-to address",
    detail: "Guidance: no-reply addresses reduce engagement, and replies are a positive reputation signal.",
  },
  {
    id: "confirmed-opt-in",
    label: "Consider confirmed (double) opt-in for signups",
    detail: "Guidance: confirmed opt-in keeps list quality high and is the expected standard in some regions, such as Germany under GDPR.",
  },
  {
    id: "segment-personalize",
    label: "Segment and personalize your sends",
    detail: "Guidance: relevant mail gets opened; consistent engagement is the strongest sender-reputation signal.",
  },
  {
    id: "manual-seed-test",
    label: "Preview placement with your own seed inboxes",
    detail: "Guidance: send to your own Gmail, Outlook, and Yahoo addresses first and check the spam folder manually — this tool cannot test placement for you.",
  },
  {
    id: "postmaster-tools",
    label: "Monitor Google Postmaster Tools",
    detail: "Guidance: Google's free dashboard shows your domain's spam rate, reputation, and authentication status.",
  },
  {
    id: "complaint-feedback-loops",
    label: "Set up complaint feedback loops where offered",
    detail: "Guidance: providers like Yahoo and Outlook offer complaint loops; remove complainers immediately.",
  },
  {
    id: "consistent-cadence",
    label: "Send on a consistent schedule",
    detail: "Guidance: erratic volume and long silent gaps make filters re-evaluate your domain each time.",
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
    return `0 of ${safeTotal} done — nothing checked yet. Start at the top.`;
  }
  if (safeChecked >= safeTotal) {
    return `${safeTotal} of ${safeTotal} done (${pct}%) — checklist complete. Work through it again before your next send.`;
  }
  return `${safeChecked} of ${safeTotal} done (${pct}%) — keep going.`;
}
