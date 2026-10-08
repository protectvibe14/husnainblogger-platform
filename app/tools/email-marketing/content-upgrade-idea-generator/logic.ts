/**
 * Content Upgrade Idea Generator — pure logic (tool-427).
 *
 * ASSEMBLY, NOT AI: ideas are assembled from a FIXED bank of 24 upgrade
 * idea templates bundled below — no network, no model, no randomness.
 * Selection is a deterministic hash of the inputs, so identical inputs
 * always produce identical output. Copy says "templates", never
 * "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - UPGRADE_TEMPLATES: 24 idea templates (4 per format x 6 formats).
 *   Placeholders: {blogTopic}, {audience}.
 *
 * Honesty notes:
 * - A content upgrade is a post-specific bonus (a subset of lead magnets);
 *   this tool covers upgrades only — standalone lead magnets live in
 *   sibling tool 425, quiz lead magnets in tool 428.
 * - "Placement" suggestions are general best-practice signup locations,
 *   not guarantees about conversion rates.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK /
 *   RTL count as one character each.
 * - Over-long text inputs are TRUNCATED and `count` is clamped to 1–10;
 *   notices are appended as a table note row — never silent.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 * - Consecutive duplicate words introduced by filling (e.g. topic already
 *   ending in the pattern's final word) are collapsed to one.
 */

export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** Documented input length caps (Unicode code points). */
export const MAX_TOPIC_CHARS = 80;
export const MAX_AUDIENCE_CHARS = 80;

/** 6 supported content-upgrade formats. */
export const FORMATS: readonly string[] = [
  "Checklist",
  "Worksheet",
  "Template pack",
  "Swipe file",
  "Bonus chapter",
  "Resource list",
];

export interface UpgradeTemplate {
  pattern: string;
  format: string;
  placement: string;
}

/**
 * 24 fixed content-upgrade idea templates (4 per format). Placeholders:
 * {blogTopic}, {audience}.
 */
export const UPGRADE_TEMPLATES: readonly UpgradeTemplate[] = [
  // Checklist
  {
    pattern: "The {audience}'s Printable {blogTopic} Checklist",
    format: "Checklist",
    placement: "Inline download box after the intro",
  },
  {
    pattern: "{blogTopic} Quick-Start Checklist for {audience}",
    format: "Checklist",
    placement: "End-of-post signup box",
  },
  {
    pattern: "The {audience}'s One-Page {blogTopic} Cheat Sheet",
    format: "Checklist",
    placement: "Popup on 50% scroll depth",
  },
  {
    pattern: "10-Point {blogTopic} Self-Audit for {audience}",
    format: "Checklist",
    placement: "Sidebar signup widget",
  },
  // Worksheet
  {
    pattern: "The {blogTopic} Fill-in-the-Blank Worksheet for {audience}",
    format: "Worksheet",
    placement: "Inline form in the middle of the post",
  },
  {
    pattern: "{audience}'s {blogTopic} Planning Worksheet",
    format: "Worksheet",
    placement: "End-of-post signup box",
  },
  {
    pattern: "The 30-Minute {blogTopic} Workbook for {audience}",
    format: "Worksheet",
    placement: "Exit-intent popup",
  },
  {
    pattern: "{blogTopic} Scorecard: Grade Your Setup",
    format: "Worksheet",
    placement: "Inline quiz-style embed",
  },
  // Template pack
  {
    pattern: "7 Copy-Paste {blogTopic} Templates for {audience}",
    format: "Template pack",
    placement: "Inline download box after the intro",
  },
  {
    pattern: "The {audience}'s {blogTopic} Template Bundle",
    format: "Template pack",
    placement: "End-of-post signup box",
  },
  {
    pattern: "{blogTopic} Starter Templates: {audience} Edition",
    format: "Template pack",
    placement: "Popup on 50% scroll depth",
  },
  {
    pattern: "Plug-and-Play {blogTopic} Scripts for {audience}",
    format: "Template pack",
    placement: "In-content text link",
  },
  // Swipe file
  {
    pattern: "50 {blogTopic} Examples {audience} Can Swipe",
    format: "Swipe file",
    placement: "Inline download box in the middle of the post",
  },
  {
    pattern: "The {audience}'s {blogTopic} Inspiration Swipe File",
    format: "Swipe file",
    placement: "End-of-post signup box",
  },
  {
    pattern: "Real {blogTopic} Breakdowns for {audience}",
    format: "Swipe file",
    placement: "Popup on 50% scroll depth",
  },
  {
    pattern: "{blogTopic} Before-and-After Examples for {audience}",
    format: "Swipe file",
    placement: "Sidebar signup widget",
  },
  // Bonus chapter
  {
    pattern: "Bonus Chapter: Advanced {blogTopic} for {audience}",
    format: "Bonus chapter",
    placement: "Inline locked-content gate",
  },
  {
    pattern: "{blogTopic} Case Study: How One Reader Won",
    format: "Bonus chapter",
    placement: "End-of-post signup box",
  },
  {
    pattern: "The {audience}'s {blogTopic} FAQ Bonus Pack",
    format: "Bonus chapter",
    placement: "Exit-intent popup",
  },
  {
    pattern: "{blogTopic} Deep Dive: Beyond the Basics",
    format: "Bonus chapter",
    placement: "Inline form in the middle of the post",
  },
  // Resource list
  {
    pattern: "The {audience}'s {blogTopic} Resource Vault",
    format: "Resource list",
    placement: "Inline download box after the intro",
  },
  {
    pattern: "25 {blogTopic} Tools {audience} Will Love",
    format: "Resource list",
    placement: "End-of-post signup box",
  },
  {
    pattern: "{blogTopic} Reading List for Serious {audience}",
    format: "Resource list",
    placement: "Sidebar signup widget",
  },
  {
    pattern: "The Ultimate {blogTopic} Toolkit for {audience}",
    format: "Resource list",
    placement: "Exit-intent popup",
  },
];

/** Table columns for the `ideas` output. */
export const IDEAS_COLUMNS: readonly string[] = ["#", "Content upgrade idea", "Format", "Placement"];

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
 * Collapse consecutive duplicate words (case-insensitive) that filling can
 * introduce when an input already ends in the pattern's neighboring word.
 * Only collapses exact consecutive repeats, so "very very" typed by the
 * user mid-sentence is untouched — only a word repeating itself directly.
 */
export function collapseDuplicateWords(s: string): string {
  // Split on whitespace runs and rejoin with single spaces, so collapsing a
  // duplicate never leaves double spaces behind.
  const words = s.split(/\s+/);
  const out: string[] = [];
  let prevWord = "";
  for (const word of words) {
    if (word.toLowerCase() === prevWord && prevWord !== "") {
      continue;
    }
    out.push(word);
    prevWord = word.toLowerCase();
  }
  return out.join(" ");
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
    return { ok: false, error: "Number of ideas is required — enter a number from 1 to 10." };
  }
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.trim()) : NaN;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: "Number of ideas must be a number from 1 to 10." };
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
 * Generate content-upgrade ideas from the fixed template bank.
 *
 * Inputs (values): blogTopic, audience (required text), count (required
 * number 1–10).
 * Outputs (values): ideas ({ columns: string[]; rows: string[][] }).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const blogTopic = readText(values, "blogTopic", "Blog topic", MAX_TOPIC_CHARS);
  if (!blogTopic.ok) return { ok: false, error: blogTopic.error };
  const audience = readText(values, "audience", "Audience", MAX_AUDIENCE_CHARS);
  if (!audience.ok) return { ok: false, error: audience.error };
  const count = readCount(values);
  if (!count.ok) return { ok: false, error: count.error };

  const notices: string[] = [];
  if (blogTopic.notice) notices.push(blogTopic.notice);
  if (audience.notice) notices.push(audience.notice);
  if (count.notice) notices.push(count.notice);

  // Deterministic template selection from the joined inputs.
  const h = hashString(
    [blogTopic.value, audience.value, String(count.value)].join(" "),
  );

  const rows: string[][] = [];
  for (let i = 0; i < count.value; i++) {
    // Step 5 is coprime to 24, so up to 10 picks are always distinct.
    const tpl = UPGRADE_TEMPLATES[(h + 5 * i) % UPGRADE_TEMPLATES.length];
    const idea = collapseDuplicateWords(
      fill(tpl.pattern, { blogTopic: blogTopic.value, audience: audience.value }),
    );
    rows.push([String(i + 1), idea, tpl.format, tpl.placement]);
  }

  if (notices.length > 0) {
    rows.push(["", `Note: ${notices.join(" ")}`, "", ""]);
  }

  return {
    ok: true,
    values: { ideas: { columns: [...IDEAS_COLUMNS], rows } },
  };
}
