/**
 * Newsletter Issue Planner (tool-309) — pure logic.
 *
 * Honesty: this is a TEMPLATE LAYOUT tool, not AI writing. The user's chosen
 * sections are placed into a fixed issue template: each section gets a slot
 * purpose and a word-count target from a fixed map. No newsletter content is
 * written for the user.
 *
 * Fixed rules (documented):
 * - SECTION_PRESETS: 6 named section types matched by keyword, each with a
 *   fixed word-count target and a fixed slot-purpose line.
 * - Unmatched sections get GENERIC_TARGET (125 words) and the generic slot line.
 * - Duplicate sections are deduplicated case-insensitively (first wins).
 * - FREQUENCY_ISSUES: weekly -> 52, biweekly -> 26, monthly -> 12 issues/year.
 * - Total words per issue = sum of section targets (planning guide, not a rule).
 *
 * Deterministic: same inputs -> same issue template, always. Zero imports.
 */

export const GENERIC_TARGET = 125;

export interface SectionPreset {
  /** Stable key. */
  key: string;
  /** Keywords that identify this section type (case-insensitive substring match). */
  keywords: string[];
  /** Fixed word-count target. */
  words: number;
  /** Fixed slot-purpose line shown in the template. */
  slot: string;
}

/** 6 named section presets; matching order = array order. */
export const SECTION_PRESETS: SectionPreset[] = [
  {
    key: "intro",
    keywords: ["intro", "welcome", "hello", "kickoff"],
    words: 100,
    slot: "Warm welcome — remind readers what this newsletter delivers.",
  },
  {
    key: "feature",
    keywords: ["feature", "main", "deep dive", "deep-dive", "lead"],
    words: 400,
    slot: "Lead story — the one idea or story this issue is about.",
  },
  {
    key: "tips",
    keywords: ["tip", "hack", "quick win"],
    words: 150,
    slot: "Quick wins — 3–5 short, actionable tips.",
  },
  {
    key: "news",
    keywords: ["news", "roundup", "round-up", "links", "curated"],
    words: 200,
    slot: "Curated links — the best reads you found this week.",
  },
  {
    key: "promo",
    keywords: ["promo", "cta", "offer", "sponsor", "ad"],
    words: 75,
    slot: "One offer — a single clear call to action.",
  },
  {
    key: "signoff",
    keywords: ["ps", "signoff", "sign-off", "goodbye", "closing"],
    words: 50,
    slot: "Sign-off — a personal note and what's next.",
  },
];

export const GENERIC_SLOT = "Custom section — fill with your own content.";

/** Issues per year per frequency. */
export const FREQUENCY_ISSUES: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export interface IssuePlannerResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Find the preset whose keyword matches the section name, or null.
 * Matches on whole words (a keyword may match its plural) or, for multi-word
 * keywords, on an exact phrase — never on raw substrings (so "spotlight"
 * does not match the "ps" sign-off keyword). */
function matchPreset(section: string): SectionPreset | null {
  const lower = section.toLowerCase();
  const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length > 0);
  const tokenSet = new Set(tokens);
  for (const preset of SECTION_PRESETS) {
    for (const kw of preset.keywords) {
      if (kw.includes(" ")) {
        if (lower.includes(kw)) return preset;
      } else if (tokenSet.has(kw) || tokenSet.has(kw + "s")) {
        return preset;
      }
    }
  }
  return null;
}

/**
 * runTool({ newsletterName, sections, frequency })
 * `sections` is one section per line (textarea).
 * -> { ok: true, values: { issueTemplate: {columns, rows}, summary: string } }
 * -> { ok: false, error: '...' } on invalid/missing input.
 */
export function runTool(values: Record<string, unknown>): IssuePlannerResult {
  if (!isRecord(values)) {
    return { ok: false, error: "Provide your inputs as an object." };
  }

  const newsletterName = readString(values.newsletterName);
  if (newsletterName.length === 0) {
    return { ok: false, error: "Enter your newsletter's name." };
  }

  const sectionsRaw = readString(values.sections);
  const seen = new Set<string>();
  const sections: string[] = [];
  for (const line of sectionsRaw.split("\n")) {
    const s = line.trim();
    if (s.length === 0) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue; // dedupe case-insensitively
    seen.add(key);
    sections.push(s);
  }
  if (sections.length === 0) {
    return { ok: false, error: "Add at least one section (one per line)." };
  }

  const frequency = readString(values.frequency).toLowerCase();
  const issuesPerYear = FREQUENCY_ISSUES[frequency];
  if (issuesPerYear === undefined) {
    return { ok: false, error: "Frequency must be weekly, biweekly, or monthly." };
  }

  let totalWords = 0;
  const rows: string[][] = sections.map((section) => {
    const preset = matchPreset(section);
    const words = preset ? preset.words : GENERIC_TARGET;
    const slot = preset ? preset.slot : GENERIC_SLOT;
    totalWords += words;
    return [section, slot, `${words} words`];
  });

  const issueTemplate = {
    columns: ["Section", "Slot purpose", "Target words"],
    rows,
  };

  const summary =
    `${newsletterName}: ${sections.length} section${sections.length === 1 ? "" : "s"} · ` +
    `≈${totalWords} words per issue · ${issuesPerYear} issues/year on a ${frequency} cadence. ` +
    "Word targets are planning guides, not rules — no content is written for you.";

  return { ok: true, values: { issueTemplate, summary } };
}
