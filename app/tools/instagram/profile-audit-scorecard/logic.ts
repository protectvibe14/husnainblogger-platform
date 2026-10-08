/**
 * tool-233 — Profile Audit Scorecard (scorer)
 *
 * Fully client-side, manual self-audit. It cannot fetch real profile data —
 * the user answers each checklist question and the tool applies the
 * published rubric below. The score is an estimate, not a guarantee.
 *
 * ─── PUBLISHED RUBRIC (also in meta.ts content.methodology) ───
 * Each criterion: Yes = 2, Partially = 1, No = 0, N/A = excluded
 * (denominator adjusted, N/A count reported).
 *
 *   NAME & IDENTITY (max 6)
 *     name-keyword   w2  Name field contains a searchable keyword (who you help)
 *     profile-photo  w1  Profile photo is clear and recognizable
 *   BIO (max 12)
 *     bio-who-help   w2  Bio says who you help and what you do
 *     bio-niche      w2  Bio focuses on one clear niche, not generic claims
 *     bio-readable   w1  Bio is readable (line breaks, no clutter)
 *     bio-link-cta   w1  Bio has one link and a clear next step
 *   GRID (max 8)
 *     grid-recent    w1  Posted in the last 14 days
 *     grid-consistent w2 Grid looks consistent and on-brand
 *     grid-pinned    w1  Pinned posts used strategically (start-here, proof, offer)
 *   HIGHLIGHTS (max 8)
 *     hl-covers      w1  Highlights have clean, consistent covers
 *     hl-organized   w2  Highlights organized by topic (services, reviews, FAQ)
 *     hl-fresh       w1  Highlights updated in the last 60 days
 *   CTA (max 8)
 *     cta-clear      w2  Profile has one clear call to action
 *     cta-contact    w1  Contact method visible (DM prompt, email, action buttons)
 *     cta-single-link w1 One focused link in bio, not a cluttered list
 *
 * Total weight = 21, max points = 42 (N/A items excluded from both).
 * Score = round(earned / possible * 100).
 * Bands: 85–100 Profile-Ready · 70–84 Solid · 50–69 Needs work · 0–49 Rebuild.
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
  section: string;
  label: string;
  weight: 1 | 2;
  tip: string;
}

const CRITERIA: Criterion[] = [
  // Name & identity
  { id: 'name-keyword', section: 'Name & identity', label: 'Name field contains a searchable keyword (who you help)', weight: 2, tip: 'Add what you do or who you serve to your Name field — not just your brand name, so people can find you in search.' },
  { id: 'profile-photo', section: 'Name & identity', label: 'Profile photo is clear and recognizable', weight: 1, tip: 'Switch to a bright, close-up face photo or a simple logo — avoid tiny text that is unreadable at thumbnail size.' },
  // Bio
  { id: 'bio-who-help', section: 'Bio', label: 'Bio says who you help and what you do', weight: 2, tip: 'Rewrite line 1 of your bio as "I help [who] get [result]" — a visitor should know in 3 seconds.' },
  { id: 'bio-niche', section: 'Bio', label: 'Bio focuses on one clear niche, not generic claims', weight: 2, tip: 'Cut generic claims ("passionate creator") and name one specific niche — specificity converts better than breadth.' },
  { id: 'bio-readable', section: 'Bio', label: 'Bio is readable (line breaks, no clutter)', weight: 1, tip: 'Split your bio into 3–4 short lines with line breaks; remove cluttered emojis that add no meaning.' },
  { id: 'bio-link-cta', section: 'Bio', label: 'Bio has one link and a clear next step', weight: 1, tip: 'Keep a single focused link in bio and tell visitors exactly what to do next (e.g. "Tap below to book a call").' },
  // Grid
  { id: 'grid-recent', section: 'Grid', label: 'Posted in the last 14 days', weight: 1, tip: 'Publish something this week — an inactive-looking profile makes visitors hesitate to follow.' },
  { id: 'grid-consistent', section: 'Grid', label: 'Grid looks consistent and on-brand', weight: 2, tip: 'Pick 2–3 brand colors and one cover style, then apply them to your next 9 posts for a cohesive first screen.' },
  { id: 'grid-pinned', section: 'Grid', label: 'Pinned posts used strategically (start-here, proof, offer)', weight: 1, tip: 'Pin 3 posts: who you are, social proof, and your current offer — so the top row sells for you.' },
  // Highlights
  { id: 'hl-covers', section: 'Highlights', label: 'Highlights have clean, consistent covers', weight: 1, tip: 'Design matching highlight covers (same background, simple icons) — mismatched covers look unfinished.' },
  { id: 'hl-organized', section: 'Highlights', label: 'Highlights organized by topic (services, reviews, FAQ)', weight: 2, tip: 'Organize highlights by buyer journey: Start here, Services, Reviews, FAQ — and delete random leftovers.' },
  { id: 'hl-fresh', section: 'Highlights', label: 'Highlights updated in the last 60 days', weight: 1, tip: 'Refresh at least one highlight with a recent story — stale highlights suggest an inactive business.' },
  // CTA
  { id: 'cta-clear', section: 'CTA', label: 'Profile has one clear call to action', weight: 2, tip: 'Choose ONE action you want visitors to take (book, DM, shop) and repeat it in your bio, link, and pinned posts.' },
  { id: 'cta-contact', section: 'CTA', label: 'Contact method visible (DM prompt, email, or action buttons)', weight: 1, tip: 'Turn on the contact/email action button and add a line in your bio telling people how to reach you.' },
  { id: 'cta-single-link', section: 'CTA', label: 'One focused link in bio, not a cluttered list', weight: 1, tip: 'Replace a cluttered link list with one focused page that routes to your top 5–8 destinations.' },
];

const ANSWER_POINTS: Record<string, number> = { yes: 2, partially: 1, no: 0 };
const ANSWER_LABELS: Record<string, string> = { yes: 'Yes', partially: 'Partially', no: 'No' };

function normalizeAnswer(value: unknown): 'yes' | 'partially' | 'no' | 'na' | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (v === 'yes' || v === '2' || v === 'y') return 'yes';
  if (v === 'partially' || v === 'partial' || v === '1' || v === 'p') return 'partially';
  if (v === 'no' || v === '0' || v === 'n') return 'no';
  if (v === 'n/a' || v === 'na' || v === 'skip') return 'na';
  return null;
}

function gradeFor(score: number): string {
  if (score >= 85) return 'Profile-Ready';
  if (score >= 70) return 'Solid';
  if (score >= 50) return 'Needs work';
  return 'Rebuild';
}

export function runTool(values: Record<string, unknown>): ToolResult {
  // Validate every criterion has an allowed answer.
  const answers = new Map<string, 'yes' | 'partially' | 'no' | 'na'>();
  for (const c of CRITERIA) {
    const raw = values[c.id];
    if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
      return { ok: false, error: 'Please answer: "' + c.label + '" (or choose N/A).' };
    }
    const a = normalizeAnswer(raw);
    if (a === null) {
      return {
        ok: false,
        error: 'Invalid answer for "' + c.label + '". Choose Yes, Partially, No, or N/A.',
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
    earned += ANSWER_POINTS[a] * c.weight;
    possible += 2 * c.weight;
  }

  if (possible === 0) {
    return {
      ok: false,
      error: 'You marked every item N/A. Answer at least one question to get a score.',
    };
  }

  const totalScore = Math.round((earned / possible) * 100);
  const gradeLabel = gradeFor(totalScore);
  const grade =
    gradeLabel + ' (' + totalScore + '/100) — manual self-audit estimate, not a guarantee.';

  // Per-section breakdown table.
  const sectionOrder: string[] = [];
  const bySection = new Map<string, Criterion[]>();
  for (const c of CRITERIA) {
    if (!bySection.has(c.section)) {
      bySection.set(c.section, []);
      sectionOrder.push(c.section);
    }
    bySection.get(c.section)!.push(c);
  }
  const rows: string[][] = [];
  for (const section of sectionOrder) {
    const list = bySection.get(section)!;
    let sEarned = 0;
    let sPossible = 0;
    let sNa = 0;
    let answered = 0;
    for (const c of list) {
      const a = answers.get(c.id)!;
      if (a === 'na') {
        sNa++;
        continue;
      }
      answered++;
      sEarned += ANSWER_POINTS[a] * c.weight;
      sPossible += 2 * c.weight;
    }
    const scoreCell = sPossible === 0 ? 'N/A' : sEarned + '/' + sPossible;
    const detail =
      answered + ' of ' + list.length + ' answered' + (sNa > 0 ? ' · ' + sNa + ' N/A' : '');
    rows.push([section, scoreCell, detail]);
  }
  const perSectionBreakdown = {
    columns: ['Section', 'Score', 'Details'],
    rows,
  };

  // Prioritized fixes: No/Partially answers, weight descending, section order.
  const fixes: { weight: number; order: number; text: string }[] = [];
  CRITERIA.forEach((c, idx) => {
    const a = answers.get(c.id)!;
    if (a === 'na' || a === 'yes') return;
    const prefix = a === 'no' ? 'Fix: ' : 'Improve: ';
    fixes.push({ weight: c.weight, order: idx, text: prefix + c.tip });
  });
  fixes.sort((x, y) => y.weight - x.weight || x.order - y.order);
  const prioritizedFixes =
    fixes.length > 0
      ? fixes.map((f) => f.text)
      : ['No fixes needed — your profile answers everything. Review it monthly to stay fresh.'];
  if (naCount > 0) {
    prioritizedFixes.push(
      'Note: ' + naCount + ' item' + (naCount === 1 ? '' : 's') + ' marked N/A ' +
        (naCount === 1 ? 'was' : 'were') + ' excluded from the score.',
    );
  }

  return {
    ok: true,
    values: {
      totalScore,
      grade,
      perSectionBreakdown,
      prioritizedFixes,
    },
  };
}
