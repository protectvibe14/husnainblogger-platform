/**
 * Lead Magnet Idea Generator — pure logic (tool-425).
 *
 * ASSEMBLY, NOT AI: ideas are assembled from FIXED title-pattern and
 * conversion-reason banks bundled below — no network, no model, no randomness.
 * Selection is a deterministic hash of the inputs, so identical inputs always
 * produce identical output. The copy says "templates" and never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - TITLE_PATTERNS: 24 idea-title patterns (placeholders: {niche}, {audience}, {fmt})
 * - WHY_CONVERTS: 20 conversion reasons (4 per format x 5 formats)
 * - FORMATS: 5 lead-magnet formats
 *
 * Honesty notes:
 * - "Why it converts" reasons are fixed, general best-practice explanations —
 *   not predictions or guarantees about any specific audience.
 * - Sibling tools 426/427/428 cover titles, content upgrades, and quizzes;
 *   this tool covers general lead-magnet ideation only.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK / RTL
 *   count as one character each.
 * - Over-long text inputs are TRUNCATED; `count` is clamped to 1–20.
 *   Truncation/clamp notices are appended as a table note row — never silent.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 */

export const MIN_COUNT = 1;
export const MAX_COUNT = 20;

/** Documented input length caps (Unicode code points). */
export const MAX_NICHE_CHARS = 80;
export const MAX_AUDIENCE_CHARS = 80;

/** 5 supported lead-magnet formats. */
export const FORMATS: readonly string[] = ["ebook", "checklist", "template", "video", "email-course"];

/** Display labels for the formats. */
export const FORMAT_LABELS: Record<string, string> = {
  "ebook": "Ebook",
  "checklist": "Checklist",
  "template": "Template",
  "video": "Video",
  "email-course": "Email course",
};

/** 24 idea-title patterns. Placeholders: {niche}, {audience}, {fmt}. */
export const TITLE_PATTERNS: readonly string[] = [
  "The {audience}'s Guide to {niche}",
  "{niche} Starter Kit for {audience}",
  "10 {niche} Mistakes {audience} Should Avoid",
  "The {niche} Playbook for Busy {audience}",
  "{niche} in 7 Days: A Beginner's Roadmap",
  "50 {niche} Ideas for {audience}",
  "The Ultimate {niche} {fmt} for {audience}",
  "{audience}'s First {niche} Win: Step-by-Step",
  "{niche} Shortcuts Every {audience} Needs",
  "From Zero to {niche}: The {audience} Edition",
  "The {niche} Toolkit: Done-for-You {fmt}",
  "{niche} Made Simple for {audience}",
  "7-Day {niche} Challenge for {audience}",
  "The {audience}'s {niche} Cheat Sheet",
  "{niche} Templates That Save {audience} Hours",
  "What Every {audience} Gets Wrong About {niche}",
  "The Lazy {audience}'s Guide to {niche}",
  "{niche} Quick Wins: 15-Minute Tactics",
  "Build Your First {niche} System This Weekend",
  "The {niche} Audit: Find Your Gaps in 20 Minutes",
  "{audience}-Approved {niche} Resources",
  "Stop Guessing: A Data-Backed {niche} Primer",
  "The {niche} Swipe File for {audience}",
  "{niche} on Autopilot: A {audience}'s Manual",
];

/**
 * 20 fixed "why it converts" reasons, 4 per format. These are general
 * best-practice explanations, not predictions about a specific audience.
 */
export const WHY_CONVERTS: Record<string, readonly string[]> = {
  "ebook": [
    "In-depth format builds authority — readers trust you before they buy.",
    "Perceived high value makes the email opt-in feel like a fair trade.",
    "Long shelf life: an ebook keeps generating leads for months.",
    "Easy to skim with a good table of contents, so busy readers finish it.",
  ],
  "checklist": [
    "Short and actionable — people actually finish checklists.",
    "Prints well and gets pinned to desks, keeping your brand visible.",
    "Low commitment to consume, so opt-in rates stay high.",
    "Positions you as the organized expert in your niche.",
  ],
  "template": [
    "Done-for-you value: people opt in to save time, not to learn.",
    "Gets used repeatedly, so your brand shows up in their workflow.",
    "Easy to customize, which makes the win feel personal.",
    "High perceived value for very little reading effort.",
  ],
  "video": [
    "Video builds trust fast — they see and hear a real person.",
    "Higher engagement than text; viewers remember more.",
    "Feels premium, so the email exchange feels worthwhile.",
    "Easy to consume on a phone in a few spare minutes.",
  ],
  "email-course": [
    "Multi-day format builds a habit — they open your emails daily.",
    "Drip delivery keeps you top-of-mind all week.",
    "Each lesson is a chance to soft-sell your paid offer.",
    "Low pressure: one short lesson a day fits any schedule.",
  ],
};

/** Table columns for the `ideas` output. */
export const IDEAS_COLUMNS: readonly string[] = ["#", "Idea title", "Format", "Why it converts"];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers (all local — logic.ts has zero imports by contract)
// ---------------------------------------------------------------------------

/** djb2 hash, returned as an unsigned 32-bit int. Deterministic pick source. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Length in Unicode code points (emoji / CJK / RTL count as one each). */
function codePoints(s: string): number {
  return [...s].length;
}

/** Escape HTML so user input stays plain text in the output. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface TextRead {
  ok: true;
  value: string;
  notice?: string;
}

interface TextFail {
  ok: false;
  error: string;
}

function readText(
  values: Record<string, unknown>,
  id: string,
  label: string,
  maxChars: number,
): TextRead | TextFail {
  const raw = values[id];
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return { ok: false, error: `${label} is required — please fill it in.` };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: `${label} must be text.` };
  }
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: false, error: `${label} must not be empty.` };
  }
  let notice: string | undefined;
  let value = trimmed;
  if (codePoints(trimmed) > maxChars) {
    value = [...trimmed].slice(0, maxChars).join("");
    notice =
      `${label} was shortened from ${codePoints(trimmed)} to ${maxChars} characters.`;
  }
  return { ok: true, value: escapeHtml(value), notice };
}

/** Fill {token} placeholders from a map. */
function fill(template: string, map: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m,
  );
}

/**
 * Read the idea count: accepts a number or numeric string, rejects
 * NaN/Infinity/non-numeric, and clamps to [MIN_COUNT, MAX_COUNT] with a
 * notice when clamping changes the value.
 */
export function readCount(
  values: Record<string, unknown>,
): { ok: true; value: number; notice?: string } | { ok: false; error: string } {
  const raw = values["count"];
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Number of ideas is required — enter a number from 1 to 20." };
  }
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.trim()) : NaN;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: "Number of ideas must be a number from 1 to 20." };
  }
  const rounded = Math.round(n);
  if (rounded < MIN_COUNT) {
    return {
      ok: true,
      value: MIN_COUNT,
      notice: `Number of ideas was raised to the minimum of ${MIN_COUNT}.`,
    };
  }
  if (rounded > MAX_COUNT) {
    return {
      ok: true,
      value: MAX_COUNT,
      notice: `Number of ideas was capped at the maximum of ${MAX_COUNT}.`,
    };
  }
  return { ok: true, value: rounded };
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Generate lead-magnet ideas from fixed pattern banks.
 *
 * Inputs (values): niche, audience (required text), format (optional select:
 * any|ebook|checklist|template|video|email-course), count (required number 1–20).
 * Outputs (values): ideas ({ columns: string[]; rows: string[][] }).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const niche = readText(values, "niche", "Niche", MAX_NICHE_CHARS);
  if (!niche.ok) return { ok: false, error: niche.error };
  const audience = readText(values, "audience", "Audience", MAX_AUDIENCE_CHARS);
  if (!audience.ok) return { ok: false, error: audience.error };

  const formatRaw = values["format"];
  let formatFilter: string | null = null;
  if (formatRaw !== undefined && formatRaw !== null && formatRaw !== "") {
    if (typeof formatRaw !== "string" || (!FORMATS.includes(formatRaw) && formatRaw !== "any")) {
      return {
        ok: false,
        error: `Format must be one of: any, ${FORMATS.join(", ")}.`,
      };
    }
    formatFilter = formatRaw === "any" ? null : formatRaw;
  }

  const count = readCount(values);
  if (!count.ok) return { ok: false, error: count.error };

  const notices: string[] = [];
  if (niche.notice) notices.push(niche.notice);
  if (audience.notice) notices.push(audience.notice);
  if (count.notice) notices.push(count.notice);

  // Deterministic variant selection from the joined inputs.
  const h = hashString(
    [niche.value, audience.value, formatRaw ?? "any", String(count.value)].join(" "),
  );

  const rows: string[][] = [];
  for (let i = 0; i < count.value; i++) {
    // Step 7 is coprime to 24, so up to 20 picks are always distinct.
    const pattern = TITLE_PATTERNS[(h + 7 * i) % TITLE_PATTERNS.length];
    const format = formatFilter ?? FORMATS[(h + i) % FORMATS.length];
    const reasons = WHY_CONVERTS[format];
    const why = reasons[(h + 3 * i) % reasons.length];
    const title = fill(pattern, {
      niche: niche.value,
      audience: audience.value,
      fmt: FORMAT_LABELS[format].toLowerCase(),
    });
    rows.push([String(i + 1), title, FORMAT_LABELS[format], why]);
  }

  if (notices.length > 0) {
    rows.push(["", `Note: ${notices.join(" ")}`, "", ""]);
  }

  return {
    ok: true,
    values: { ideas: { columns: [...IDEAS_COLUMNS], rows } },
  };
}
