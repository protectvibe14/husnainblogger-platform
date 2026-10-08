/**
 * Social Profile Completeness Checker — pure logic (Lane C, rule-based).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Pure checklist math.
 * - The user self-reports each item via checkboxes (the tool cannot fetch
 *   their social profiles — client-side JS has no access, and scraping is
 *   against platform ToS). Honesty about self-reporting is surfaced in UI.
 * - CHECKLIST (8 items, weighted — weights reflect how often creator-growth
 *   guides cite each element as table stakes; labeled as editorial weights,
 *   not platform-published requirements):
 *
 *   Item                          Weight  Why it matters (guide consensus)
 *   ───────────────────────────── ──────  ────────────────────────────────
 *   1. Clear profile photo/logo      15    Recognition in feeds/comments.
 *   2. Descriptive bio w/ keywords   15    Searchability + first impression.
 *   3. Link in bio / link page       15    Traffic capture (only clickable
 *                                          link on most platforms).
 *   4. Clear call-to-action          10    Tells visitors what to do next.
 *   5. Pinned/featured content       10    Showcases best work on arrival.
 *   6. Contact info / email          10    Brand-deal accessibility.
 *   7. Consistent handle/username    15    Cross-platform findability.
 *   8. Highlights/covers organized   10    (IG) / banner set (YT/X) —
 *                                          visual completeness signal.
 *
 *   Total: 100. Grades: Complete ≥90, Strong ≥75, Needs work ≥50,
 *   Incomplete <50.
 * - Score = sum of weights for checked items. Each unchecked item produces
 *   a prioritized fix suggestion (highest weight first).
 */

/** Checklist items with editorial weights (documented above — not platform requirements). */
export const CHECKLIST: ReadonlyArray<{ id: string; label: string; weight: number; fix: string }> = [
  {
    id: "photo",
    label: "Clear profile photo or logo",
    weight: 15,
    fix: "Upload a sharp, recognizable photo or logo — it appears next to every comment and post you make.",
  },
  {
    id: "bio",
    label: "Descriptive bio with keywords",
    weight: 15,
    fix: "Rewrite your bio: who you help + what you post + 1–2 searchable keywords in your niche.",
  },
  {
    id: "link",
    label: "Link in bio (or link page)",
    weight: 15,
    fix: "Add your most important link — or a link-in-bio page if you promote multiple destinations.",
  },
  {
    id: "handle",
    label: "Consistent handle across platforms",
    weight: 15,
    fix: "Align your username across platforms so fans can find you everywhere with one search.",
  },
  {
    id: "cta",
    label: "Clear call-to-action",
    weight: 10,
    fix: "Add one clear CTA (e.g. 'New videos every Tue', 'DM for collabs') so visitors know what to do next.",
  },
  {
    id: "pinned",
    label: "Pinned or featured content",
    weight: 10,
    fix: "Pin your 2–3 best posts so new visitors instantly see your best work.",
  },
  {
    id: "contact",
    label: "Contact info or email visible",
    weight: 10,
    fix: "Add a business email or contact button — brands can't pay you if they can't reach you.",
  },
  {
    id: "highlights",
    label: "Highlights / banner organized",
    weight: 10,
    fix: "Organize story highlights (IG) or set a channel banner (YouTube/X) — an empty one looks abandoned.",
  },
];

export type ProfileGrade = "Complete" | "Strong" | "Needs work" | "Incomplete";

export interface ProfileItem {
  id: string;
  label: string;
  weight: number;
  done: boolean;
  fix: string;
}

export interface ProfileScore {
  /** 0–100 completeness score (sum of weights). */
  score: number;
  grade: ProfileGrade;
  /** True when the tool makes no claim beyond the documented checklist. */
  heuristic: true;
  doneCount: number;
  totalCount: number;
  items: ProfileItem[];
  /** Fix suggestions for unchecked items, highest weight first. */
  priorities: string[];
}

function gradeFor(score: number): ProfileGrade {
  if (score >= 90) return "Complete";
  if (score >= 75) return "Strong";
  if (score >= 50) return "Needs work";
  return "Incomplete";
}

/**
 * Score a self-reported profile checklist.
 * @throws {TypeError} on non-object input.
 */
export function scoreProfile(done: Record<string, boolean>): ProfileScore {
  if (typeof done !== "object" || done === null) {
    throw new TypeError("scoreProfile expects an object of checklist answers");
  }

  const items: ProfileItem[] = CHECKLIST.map((c) => ({
    id: c.id,
    label: c.label,
    weight: c.weight,
    done: done[c.id] === true,
    fix: c.fix,
  }));

  const score = items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0);
  const priorities = items
    .filter((i) => !i.done)
    .sort((a, b) => b.weight - a.weight)
    .map((i) => `${i.label} (+${i.weight} pts): ${i.fix}`);

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    doneCount: items.filter((i) => i.done).length,
    totalCount: items.length,
    items,
    priorities,
  };
}

/**
 * Contract adapter for the tool template.
 * Output keys: score | grade | itemStatus | priorities | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const done: Record<string, boolean> = {};
  for (const c of CHECKLIST) {
    done[c.id] = values[c.id] === true;
  }

  let result: ProfileScore;
  try {
    result = scoreProfile(done);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not score this checklist." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      itemStatus: result.items.map(
        (i) => `${i.done ? "DONE" : "MISSING"} — ${i.label} (${i.weight} pts)`,
      ),
      priorities: result.priorities.length > 0
        ? result.priorities
        : ["Nothing missing — your profile covers all 8 completeness items."],
      heuristicNote:
        "Self-reported checklist — the tool cannot fetch your profiles. Weights are editorial (based on creator-growth guide consensus), not requirements published by any platform.",
    },
  };
}
