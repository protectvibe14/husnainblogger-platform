/**
 * tool-185 — TikTok Account Audit Checklist (scoring).
 *
 * FEASIBILITY NOTE (from the spec): this tool cannot pull real TikTok
 * account data — there is no API access and nothing is fetched. It is a
 * self-scored checklist: the user answers 16 questions on a 0–5 scale and
 * the tool applies the published rubric below. The score is guidance from
 * the user's own answers — it never claims to measure real account
 * performance, reach, or analytics. Every result text carries the label
 * "self-audit estimate, not TikTok analytics".
 *
 * ─── PUBLISHED RUBRIC (also in meta.ts content.methodology) ───
 * 4 sections × 4 criteria = 16 fixed criteria. Each criterion has a
 * weight (1 or 2). Each answer is 0–5 points.
 *   earned   += answer × weight
 *   possible += 5 × weight
 * Section score = round(earned / possible × 100)  (0–100 per section)
 * Overall score = round(mean of the 4 section scores)
 * Bands: 85–100 Audit-Ready · 70–84 Solid · 50–69 Needs work · 0–49 Rebuild.
 * Fix tips are FIXED, rule-based suggestions attached to each criterion —
 * never generated. Gaps = criteria scored 0–2. Fixes are ordered by
 * lowest score first, then highest weight (biggest impact first).
 *
 * Total weight = 24 (Bio 6, Content 6, Consistency 5, Engagement 7).
 *
 * Deterministic: same answers → identical scores, always.
 * Zero imports, zero network, zero DOM, no Math.random.
 */

export interface RunResult {
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
  // BIO — weight 6
  { id: 'bio-who-help', section: 'Bio & profile', label: 'Bio says who you help and what you post about', weight: 2, tip: 'Rewrite your bio so a stranger knows in 3 seconds who you help and what you post — drop vague lines like "content creator".' },
  { id: 'bio-name-keyword', section: 'Bio & profile', label: 'Display name contains a searchable keyword', weight: 2, tip: 'Add a niche keyword to your display name (e.g. "Sara | Sourdough Tips") so you show up in TikTok search.' },
  { id: 'bio-link', section: 'Bio & profile', label: 'Bio has one link and a clear next step', weight: 1, tip: 'Put one focused link in your bio and tell viewers exactly what to do next ("Tap the link for the free guide").' },
  { id: 'bio-photo', section: 'Bio & profile', label: 'Profile photo is clear and recognizable', weight: 1, tip: 'Switch to a bright close-up face photo or simple logo — tiny text and busy graphics fail at thumbnail size.' },
  // CONTENT — weight 6
  { id: 'content-hook', section: 'Content quality', label: 'Most videos hook in the first 2 seconds', weight: 2, tip: 'Open every video with the payoff or the boldest claim — cut slow intros, logos, and "hey guys".' },
  { id: 'content-niche', section: 'Content quality', label: 'Your last 9 videos fit one clear niche', weight: 2, tip: 'Audit your last 9 videos; archive or delete the ones that break your niche so new visitors see a clear theme.' },
  { id: 'content-captions', section: 'Content quality', label: 'You use on-screen text/captions on most videos', weight: 1, tip: 'Add burned-in captions or keyword text overlays — most TikTok viewers watch with sound off at least some of the time.' },
  { id: 'content-quality', section: 'Content quality', label: 'Videos are well-lit with clear audio', weight: 1, tip: 'Face a window or a cheap ring light and record in a quiet room — lighting and audio are the cheapest upgrades.' },
  // CONSISTENCY — weight 5
  { id: 'consistency-posting', section: 'Consistency', label: 'You posted at least 3 times in the last 7 days', weight: 2, tip: 'Commit to 3 posts a week minimum and batch-film on one day — consistency beats occasional viral attempts.' },
  { id: 'consistency-rhythm', section: 'Consistency', label: 'You have a posting rhythm you can actually keep', weight: 1, tip: 'Pick a rhythm you can sustain for 90 days (e.g. Mon/Wed/Fri) — a schedule you keep beats an ambitious one you drop.' },
  { id: 'consistency-engage', section: 'Consistency', label: 'You reply to comments within 24 hours', weight: 1, tip: 'Spend 15 minutes after each post replying to every comment — early replies double as engagement signals.' },
  { id: 'consistency-analytics', section: 'Consistency', label: 'You check TikTok analytics at least weekly', weight: 1, tip: 'Open Creator Tools → Analytics weekly and note which videos kept watch time — make more of those.' },
  // ENGAGEMENT — weight 7
  { id: 'engagement-comments', section: 'Engagement', label: 'Your videos get real comments (not just emojis)', weight: 2, tip: 'End videos with a real question or a mild debate — questions get comments, statements get scrolls.' },
  { id: 'engagement-saves', section: 'Engagement', label: 'Viewers save or share your videos', weight: 2, tip: 'Make save-worthy content: checklists, recipes, tutorials, lists — add a "save this" reminder on screen.' },
  { id: 'engagement-replies', section: 'Engagement', label: 'You reply to most comments on your videos', weight: 1, tip: 'Reply to every comment in the first hour after posting with substance, not just emojis.' },
  { id: 'engagement-growth', section: 'Engagement', label: 'Your followers grew in the last 30 days', weight: 1, tip: 'If growth stalled, post 5 videos in 5 days testing 5 different hooks — hooks are the usual bottleneck.' },
];

const SECTION_ORDER: readonly string[] = ['Bio & profile', 'Content quality', 'Consistency', 'Engagement'];

const ESTIMATE_LABEL = 'self-audit estimate, not TikTok analytics';

function gradeFor(score: number): string {
  if (score >= 85) return 'Audit-Ready';
  if (score >= 70) return 'Solid';
  if (score >= 50) return 'Needs work';
  return 'Rebuild';
}

function parseAnswer(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw <= 5) {
    return raw;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (/^[0-5]$/.test(t)) return Number(t);
  }
  return null;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const answers = new Map<string, number>();
  for (const c of CRITERIA) {
    const raw = values[c.id];
    if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
      return { ok: false, error: `Please answer: "${c.label}" (0–5).` };
    }
    const a = parseAnswer(raw);
    if (a === null) {
      return {
        ok: false,
        error: `Invalid answer for "${c.label}". Pick a whole number from 0 to 5.`,
      };
    }
    answers.set(c.id, a);
  }

  // Per-section scores 0–100.
  const sectionScores: { section: string; earned: number; possible: number; score: number }[] = [];
  for (const section of SECTION_ORDER) {
    const list = CRITERIA.filter((c) => c.section === section);
    let earned = 0;
    let possible = 0;
    for (const c of list) {
      earned += answers.get(c.id)! * c.weight;
      possible += 5 * c.weight;
    }
    sectionScores.push({ section, earned, possible, score: Math.round((earned / possible) * 100) });
  }
  const totalScore = Math.round(
    sectionScores.reduce((s, x) => s + x.score, 0) / sectionScores.length,
  );
  const gradeLabel = gradeFor(totalScore);
  const grade = `${gradeLabel} (${totalScore}/100) — ${ESTIMATE_LABEL}.`;

  // Gap list: criteria scored 0–2.
  const gapList = CRITERIA.filter((c) => answers.get(c.id)! <= 2).map(
    (c) => `${c.section} — ${c.label} (you scored ${answers.get(c.id)!}/5)`,
  );

  // Prioritized fixes: lowest score first, then highest weight.
  const fixCandidates = CRITERIA.filter((c) => answers.get(c.id)! <= 4)
    .map((c, idx) => ({ c, score: answers.get(c.id)!, idx }))
    .sort((a, b) => a.score - b.score || b.c.weight - a.c.weight || a.idx - b.idx);
  const prioritizedFixes: string[] =
    fixCandidates.length > 0
      ? fixCandidates.map(
          ({ c, score }) =>
            `${score <= 2 ? 'Fix' : 'Improve'} (${score}/5): ${c.tip}`,
        )
      : [
          `Nothing to fix — you scored 5/5 everywhere. Re-audit monthly; this is a ${ESTIMATE_LABEL}.`,
        ];

  const rows = sectionScores.map((s) => [
    s.section,
    `${s.score}/100`,
    `${s.earned}/${s.possible} points — ${gradeFor(s.score)}`,
  ]);

  return {
    ok: true,
    values: {
      totalScore,
      grade,
      sectionScores: {
        columns: ['Section', 'Score', 'Details'],
        rows,
      },
      gapList:
        gapList.length > 0
          ? gapList
          : ['No critical gaps — every criterion scored 3/5 or higher.'],
      prioritizedFixes,
    },
  };
}
