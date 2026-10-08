/**
 * Facebook Bio Generator — pure logic (tool-386). Zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: assembles bios from hand-written templates with
 * the user's "who you are" and "what you do" inserted.
 *
 * Template banks:
 *   PERSONAL_TEMPLATES — 6 templates for personal profiles (<=101 chars).
 *   PAGE_TEMPLATES     — 6 templates for Facebook Page short descriptions
 *                        (<=255 chars).
 * Totals: 12 templates across 2 banks. Nothing is written by AI.
 *
 * Modes: "personal" (101-char cap) and "page" (255-char cap).
 * Caps are enforced by truncation at a word boundary with an ellipsis;
 * the output reports whether truncation happened.
 *
 * Edge case from spec: when the user is unsure of the mode, the UI
 * defaults to "personal" — this engine therefore ALWAYS also returns
 * pageBio (the page-mode variant) as a bonus.
 *
 * Deterministic: same inputs -> same outputs (bank index = char-code
 * sum of inputs, modulo bank size).
 */

export type BioMode = "personal" | "page";

/** Supported modes, in canonical order. */
export const BIO_MODES: BioMode[] = ["personal", "page"];

/** Facebook personal-profile bio character limit. */
export const PERSONAL_BIO_LIMIT = 101;
/** Facebook Page short-description character limit. */
export const PAGE_BIO_LIMIT = 255;

/** Input bounds. */
export const MAX_WHO_LENGTH = 60;
export const MAX_WHAT_LENGTH = 120;

/** 6 personal-profile bio templates. Placeholders: {who}, {what}. */
export const PERSONAL_TEMPLATES: string[] = [
  "{who} · {what}",
  "{who} | {what}",
  "Hi, I'm {who}. {what}",
  "{who} — {what}",
  "{what} · {who}",
  "{who}: {what}",
];

/** 6 Facebook Page short-description templates. Placeholders: {who}, {what}. */
export const PAGE_TEMPLATES: string[] = [
  "Welcome to {who}! {what}",
  "{who} — {what}",
  "{what} by {who}.",
  "{who}: {what}.",
  "Your home for {what} — {who}.",
  "{who}. {what}.",
];

/** Number of extra variants shown per run. */
export const VARIANT_COUNT = 3;

export interface BioResultValues {
  ok: boolean;
  values?: {
    bio: string;
    variants: string[];
    pageBio: string;
    modeUsed: string;
    capNote: string;
  };
  error?: string;
}

function sumChars(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

function fill(template: string, who: string, what: string): string {
  return template.split("{who}").join(who).split("{what}").join(what);
}

/**
 * Truncate at a word boundary so the result is <= limit chars.
 * Returns the (possibly truncated) text and whether truncation happened.
 */
export function truncateToLimit(text: string, limit: number): { text: string; truncated: boolean } {
  if (text.length <= limit) return { text, truncated: false };
  const cut = text.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > limit / 2 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return { text: trimmed + "…", truncated: true };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function runTool(values: Record<string, unknown>): BioResultValues {
  const whoRaw = values["whoYouAre"];
  const whatRaw = values["whatYouDo"];

  if (!isNonEmptyString(whoRaw)) {
    return { ok: false, error: "Please enter who you are (your name or page name)." };
  }
  if (!isNonEmptyString(whatRaw)) {
    return { ok: false, error: "Please enter what you do (a short phrase)." };
  }

  const who = whoRaw.trim();
  const what = whatRaw.trim();

  if (who.length > MAX_WHO_LENGTH) {
    return { ok: false, error: `Keep "who you are" under ${MAX_WHO_LENGTH} characters (yours is ${who.length}).` };
  }
  if (what.length > MAX_WHAT_LENGTH) {
    return { ok: false, error: `Keep "what you do" under ${MAX_WHAT_LENGTH} characters (yours is ${what.length}).` };
  }

  let mode: BioMode = "personal"; // default per spec edge case
  const modeRaw = values["mode"];
  if (typeof modeRaw === "string" && modeRaw.trim().length > 0) {
    const m = modeRaw.trim().toLowerCase();
    if (m === "personal" || m === "page") {
      mode = m;
    } else {
      return { ok: false, error: "Mode must be 'personal' or 'page'." };
    }
  }

  const limit = mode === "personal" ? PERSONAL_BIO_LIMIT : PAGE_BIO_LIMIT;
  const templates = mode === "personal" ? PERSONAL_TEMPLATES : PAGE_TEMPLATES;

  const seed = sumChars(who + "|" + what + "|" + mode);
  const start = seed % templates.length;

  const make = (idx: number): { text: string; truncated: boolean } =>
    truncateToLimit(fill(templates[idx % templates.length], who, what), limit);

  const primary = make(start);
  const variants: string[] = [];
  for (let i = 1; i <= VARIANT_COUNT; i++) {
    variants.push(make(start + i).text);
  }

  // Bonus page-mode variant (always returned; equals the bio in page mode).
  const pageStart = sumChars(who + "|" + what + "|page") % PAGE_TEMPLATES.length;
  const pageBio = truncateToLimit(fill(PAGE_TEMPLATES[pageStart], who, what), PAGE_BIO_LIMIT).text;

  const modeLabel = mode === "personal" ? "Personal profile" : "Facebook Page";
  const modeUsed = `${modeLabel} · ${limit} characters max`;
  const capNote =
    `Bio is ${primary.text.length} characters` +
    (primary.truncated ? ` (trimmed to fit the ${limit}-character limit).` : ` — within the ${limit}-character limit.`);

  return {
    ok: true,
    values: {
      bio: primary.text,
      variants,
      pageBio,
      modeUsed,
      capNote,
    },
  };
}
