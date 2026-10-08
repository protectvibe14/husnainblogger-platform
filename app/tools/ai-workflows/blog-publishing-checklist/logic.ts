/**
 * Blog Publishing Checklist (tool-313) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: a FIXED, human-written checklist. No runTool — the tracker
 * template renders TRACKER_ITEMS and tracks checked state client-side
 * (localStorage + progress %). Nothing is generated, estimated, or
 * personalized; it is general pre-publish guidance, not SEO advice
 * tailored to any site.
 *
 * Tracker contract:
 *   export interface TrackerItem { id: string; label: string; detail?: string }
 *   export const TRACKER_ITEMS: TrackerItem[] = [ ... ];  // 18 items
 *   export function describeProgress(checked: number, total: number): string
 *
 * Item ids: lowercase kebab, unique. Each item carries a 1-line detail.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/** 18 fixed pre-publish checks, each with a 1-line detail. */
export const TRACKER_ITEMS: TrackerItem[] = [
  {
    id: "title-tag",
    label: "Title tag is 60 characters or fewer",
    detail: "Front-load the primary keyword and keep it unique across the site.",
  },
  {
    id: "meta-description",
    label: "Meta description is 140–155 characters",
    detail: "Include the primary keyword and end with a call to action.",
  },
  {
    id: "url-slug",
    label: "URL slug is short and keyword-rich",
    detail: "Lowercase with hyphens; no dates, IDs, or stop words.",
  },
  {
    id: "single-h1",
    label: "Exactly one H1 that matches the title's intent",
    detail: "H1 should mirror the title tag; never use two H1s on one page.",
  },
  {
    id: "heading-structure",
    label: "Headings follow a logical H2 → H3 hierarchy",
    detail: "Don't skip levels; put each subtopic under its own H2.",
  },
  {
    id: "keyword-placement",
    label: "Primary keyword in intro, one H2, and conclusion",
    detail: "Use it naturally — no stuffing or forced repetition.",
  },
  {
    id: "image-alt",
    label: "Every image has descriptive alt text",
    detail: "Describe the image for screen readers; file names use keywords.",
  },
  {
    id: "image-size",
    label: "Images are compressed for fast loading",
    detail: "Aim for small file sizes without visible quality loss.",
  },
  {
    id: "featured-image",
    label: "Featured image is set (1200×630 for sharing)",
    detail: "Check how it looks when shared on social platforms.",
  },
  {
    id: "internal-links",
    label: "3+ internal links to related posts",
    detail: "Use descriptive anchor text, not “click here”.",
  },
  {
    id: "external-links",
    label: "External links open in new tabs and work",
    detail: "Link credible sources; click every link before publishing.",
  },
  {
    id: "readability",
    label: "Short paragraphs and scannable formatting",
    detail: "2–3 sentence paragraphs; bullets and bold where they help.",
  },
  {
    id: "proofread",
    label: "Proofread for spelling and grammar",
    detail: "Read the post once aloud — it catches what eyes skip.",
  },
  {
    id: "facts-verified",
    label: "Claims, stats, and prices are verified",
    detail: "No invented numbers; link the source for every hard claim.",
  },
  {
    id: "categories-tags",
    label: "Category and tags are assigned",
    detail: "One primary category; a few relevant tags, no tag spam.",
  },
  {
    id: "mobile-preview",
    label: "Previewed on a mobile screen",
    detail: "Headings, images, and embeds must render correctly on phones.",
  },
  {
    id: "schema-markup",
    label: "Article / FAQ schema markup added",
    detail: "Valid JSON-LD helps eligibility for rich results.",
  },
  {
    id: "publish-date",
    label: "Publish date and schedule are correct",
    detail: "No accidental future drafts or wrong timezone scheduling.",
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
    return `${safeTotal} of ${safeTotal} done (${pct}%) — checklist complete. Ready to publish!`;
  }
  return `${safeChecked} of ${safeTotal} done (${pct}%) — keep going.`;
}
