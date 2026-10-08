/**
 * tool-235 — Highlights Audit Checklist (scorer)
 *
 * Fully client-side, manual self-audit. It cannot read real Instagram
 * highlights — the user answers each checklist question and the tool
 * applies the published rubric below. The score is an estimate.
 *
 * ─── PUBLISHED RUBRIC (also in meta.ts content.methodology) ───
 * Each criterion: Yes = 2, No = 0, N/A = excluded (denominator adjusted).
 *
 *   hl-start-here   w2  Has a "Start here / About" highlight
 *   hl-testimonials w2  Has a testimonials/reviews highlight
 *   hl-offers       w2  Has an offers/services highlight
 *   hl-faq          w1  Has an FAQ highlight
 *   hl-covers       w2  Clean, consistent highlight covers
 *   hl-names        w1  Highlights have clear names (not just emojis)
 *   hl-content      w1  Every highlight has 3+ stories (no empty ones)
 *   hl-fresh        w1  Highlights updated in the last 90 days
 *   hl-count        w1  Under 10 highlights (no clutter)
 *   hl-no-broken    w1  No broken/expired story content
 *
 * Total weight = 14, max points = 28 (N/A items excluded from both).
 * Score = round(earned / possible * 100).
 * Bands: 85–100 Highlight-Ready · 70–84 Good · 50–69 Gaps to fix · 0–49 Overhaul.
 *
 * missingElements = the elements answered "No" (what is absent).
 * fixList = fixed rule-based tip per "No" answer, weight descending.
 *
 * Deterministic: same answers → identical score, always.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface Criterion {
  id: string;
  label: string;
  element: string;
  weight: 1 | 2;
  tip: string;
}

const CRITERIA: Criterion[] = [
  { id: 'hl-start-here', label: 'Do you have a "Start here" or "About" highlight?', element: 'Start here / About highlight', weight: 2, tip: 'Create a "Start here" highlight: who you are, who you help, and where to begin — the first thing new visitors open.' },
  { id: 'hl-testimonials', label: 'Do you have a testimonials or reviews highlight?', element: 'Testimonials / reviews highlight', weight: 2, tip: 'Start a testimonials highlight and add every kind DM, review, or result screenshot you already have.' },
  { id: 'hl-offers', label: 'Do you have an offers or services highlight?', element: 'Offers / services highlight', weight: 2, tip: 'Build an offers highlight that explains what you sell, what is included, and how to buy — visitors should not have to ask.' },
  { id: 'hl-faq', label: 'Do you have an FAQ highlight?', element: 'FAQ highlight', weight: 1, tip: 'Collect the questions you get asked most and answer each in one story — this highlight saves you DMs every week.' },
  { id: 'hl-covers', label: 'Do your highlights have clean, consistent covers?', element: 'Consistent highlight covers', weight: 2, tip: 'Design matching covers (same background, simple icons or text) — mismatched covers make the profile look unfinished.' },
  { id: 'hl-names', label: 'Do your highlights have clear names (not just emojis)?', element: 'Clear highlight names', weight: 1, tip: 'Rename highlights with plain words ("Reviews", "Pricing") — emojis alone tell visitors nothing at a glance.' },
  { id: 'hl-content', label: 'Does every highlight have 3+ stories (no empty ones)?', element: 'Full highlights (3+ stories each)', weight: 1, tip: 'Delete or fill any highlight with fewer than 3 stories — a 1-story highlight looks abandoned.' },
  { id: 'hl-fresh', label: 'Were your highlights updated in the last 90 days?', element: 'Recently updated highlights', weight: 1, tip: 'Add one fresh story to your key highlights this week — stale highlights suggest an inactive business.' },
  { id: 'hl-count', label: 'Do you have fewer than 10 highlights (no clutter)?', element: 'Uncluttered highlight row', weight: 1, tip: 'Merge or delete down to under 10 highlights — the most important ones (start here, offers, reviews) must be visible without scrolling.' },
  { id: 'hl-no-broken', label: 'Are all highlights free of broken or expired content?', element: 'Clean, working highlights', weight: 1, tip: 'Open every highlight and remove expired links, dead offers, or stories that no longer represent you.' },
];

function normalizeAnswer(value: unknown): 'yes' | 'no' | 'na' | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (v === 'yes' || v === '2' || v === 'y') return 'yes';
  if (v === 'no' || v === '0' || v === 'n') return 'no';
  if (v === 'n/a' || v === 'na' || v === 'skip') return 'na';
  return null;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const answers = new Map<string, 'yes' | 'no' | 'na'>();
  for (const c of CRITERIA) {
    const raw = values[c.id];
    if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
      return { ok: false, error: 'Please answer: "' + c.label + '" (or choose N/A).' };
    }
    const a = normalizeAnswer(raw);
    if (a === null) {
      return {
        ok: false,
        error: 'Invalid answer for "' + c.label + '". Choose Yes, No, or N/A.',
      };
    }
    answers.set(c.id, a);
  }

  let earned = 0;
  let possible = 0;
  let naCount = 0;
  for (const c of CRITERIA) {
    const a = answers.get(c.id)!;
    if (a === 'na') {
      naCount++;
      continue;
    }
    earned += (a === 'yes' ? 2 : 0) * c.weight;
    possible += 2 * c.weight;
  }

  if (possible === 0) {
    return {
      ok: false,
      error: 'You marked every item N/A. Answer at least one question to get a score.',
    };
  }

  const score = Math.round((earned / possible) * 100);

  const missingElements = CRITERIA.filter((c) => answers.get(c.id) === 'no').map((c) => c.element);

  const fixOrder: { weight: number; order: number; tip: string }[] = [];
  CRITERIA.forEach((c, idx) => {
    if (answers.get(c.id) === 'no') {
      fixOrder.push({ weight: c.weight, order: idx, tip: c.tip });
    }
  });
  fixOrder.sort((x, y) => y.weight - x.weight || x.order - y.order);
  const fixList =
    fixOrder.length > 0
      ? fixOrder.map((f) => f.tip)
      : ['Your highlights cover every element — review them quarterly to keep them fresh.'];
  if (naCount > 0) {
    fixList.push(
      'Note: ' + naCount + ' item' + (naCount === 1 ? '' : 's') + ' marked N/A ' +
        (naCount === 1 ? 'was' : 'were') + ' excluded from the score.',
    );
  }

  return {
    ok: true,
    values: {
      score,
      missingElements,
      fixList,
    },
  };
}
