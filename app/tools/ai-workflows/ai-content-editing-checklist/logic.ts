/**
 * AI Content Editing Checklist (tool-340) — pure logic, zero imports.
 *
 * FIXED CHECKLIST, NOT AI (inventory type corrected generator -> checklist):
 * 18 human-written editing checks in 5 fixed groups. The tool performs no
 * editing itself — the user works the list and the tracker reports progress.
 *
 * Groups (18 checks total):
 *   humanize     — Humanize the AI draft (4)
 *   verify       — Verify facts and claims (4)
 *   tone         — Tone and voice (3)
 *   structure    — Structure and readability (4)
 *   polish       — Final polish (3)
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/**
 * The full editing checklist. `detail` is the one-line guidance shown
 * under each check.
 */
export const TRACKER_ITEMS: TrackerItem[] = [
  // --- Humanize ---
  {
    id: "humanize-first-person",
    label: "Humanize: add your real experience",
    detail:
      "Add at least one thing only you could know — a story, example, or opinion from your own work.",
  },
  {
    id: "humanize-robot-phrases",
    label: "Humanize: cut robotic filler phrases",
    detail:
      "Delete phrases like 'in today's fast-paced world', 'delve into', 'it is important to note'.",
  },
  {
    id: "humanize-sentence-rhythm",
    label: "Humanize: vary sentence length",
    detail:
      "Mix short punchy sentences with longer ones so the rhythm reads like a person, not a model.",
  },
  {
    id: "humanize-contractions",
    label: "Humanize: use natural contractions",
    detail:
      "Use don't, can't, you'll where a human would — stiff formality is an AI tell.",
  },
  // --- Verify ---
  {
    id: "verify-claims",
    label: "Verify: check every factual claim",
    detail:
      "Flag every statistic, date, name, and 'studies show' line — verify each against a real source.",
  },
  {
    id: "verify-links",
    label: "Verify: open every link and source",
    detail:
      "Click each link. Confirm it loads, is current, and actually supports the claim next to it.",
  },
  {
    id: "verify-quotes",
    label: "Verify: confirm quotes and attributions",
    detail:
      "If the draft quotes someone, confirm the quote is real and attributed to the right person.",
  },
  {
    id: "verify-prices-dates",
    label: "Verify: prices, dates, and versions",
    detail:
      "Re-check every price, deadline, and product version — these go stale fastest in AI drafts.",
  },
  // --- Tone ---
  {
    id: "tone-brand-voice",
    label: "Tone: match your brand voice",
    detail:
      "Read the draft against your brand voice. Rewrite any sentence that sounds like generic AI.",
  },
  {
    id: "tone-audience",
    label: "Tone: match the audience's level",
    detail:
      "Confirm jargon is explained for beginners or dropped for experts — match who is reading.",
  },
  {
    id: "tone-hype",
    label: "Tone: remove hype and hedging",
    detail:
      "Cut 'revolutionary', 'game-changing', and 'in conclusion'. Cut empty hedging like 'arguably'.",
  },
  // --- Structure ---
  {
    id: "structure-intro",
    label: "Structure: rewrite the intro",
    detail:
      "Rewrite the first two paragraphs yourself — state the promise and why you are worth reading.",
  },
  {
    id: "structure-headings",
    label: "Structure: check every heading earns its place",
    detail:
      "Each H2 should answer a question the reader actually has. Merge or cut the rest.",
  },
  {
    id: "structure-scannable",
    label: "Structure: make it scannable",
    detail:
      "Break walls of text: bullets for lists, short paragraphs, bold on the key line per section.",
  },
  {
    id: "structure-cta",
    label: "Structure: one clear call to action",
    detail:
      "End with exactly one CTA. Delete secondary asks that compete with it.",
  },
  // --- Final polish ---
  {
    id: "polish-read-aloud",
    label: "Polish: read the whole thing aloud",
    detail:
      "Read every word out loud. Anywhere you stumble, rewrite — your readers would stumble too.",
  },
  {
    id: "polish-spellcheck",
    label: "Polish: spelling, grammar, formatting",
    detail:
      "Run a spellcheck, then eyeball formatting: consistent quotes, dashes, capitalization, lists.",
  },
  {
    id: "polish-fresh-eyes",
    label: "Polish: final fresh-eyes pass",
    detail:
      "Take a break, then do one last read as a stranger. Fix the one thing that still bugs you.",
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
    return `0 of ${safeTotal} editing checks done. Start at the top — humanize first.`;
  if (safeChecked >= safeTotal)
    return `All ${safeTotal} editing checks done. This draft is ready to publish.`;
  return `${safeChecked} of ${safeTotal} editing checks done.`;
}
