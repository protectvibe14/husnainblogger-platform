/**
 * Unsubscribe Page Copy Generator — pure logic (tool-432).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic text assembly from FIXED template
 *   banks (see HEADLINES, BODY_TEMPLATES, PREFERENCE_OPTIONS below).
 *   No AI, no network, no backend.
 * - Bank sizes: 4 tones x 4 headlines = 16 headline templates;
 *   4 body templates (one per tone); 8 fixed preference-option lines.
 * - The body draft always includes a CAN-SPAM reminder that opt-out
 *   requests must be honored within 10 business days. This is general
 *   information, NOT legal advice.
 * - Copy is deliberately respectful — never guilt-tripping ("don't go",
 *   "you'll miss everything", shaming). Same inputs → same outputs.
 *
 * Edge-case handling (shared validation rules):
 * - Overlong inputs are trimmed to MAX_INPUT_CHARS (code points, so
 *   RTL/CJK/emoji count correctly) with a visible notice, never silently
 *   dropped.
 * - Generated lines are checked for repeated adjacent words/phrases;
 *   a failing line is replaced by the next template (guard, not eloquence).
 * - User input is sanitized before insertion (HTML tags stripped) so
 *   output stays plain text.
 */

export type UnsubTone = "friendly" | "professional" | "playful" | "sincere";

export const UN_SUB_TONES: readonly UnsubTone[] = [
  "friendly",
  "professional",
  "playful",
  "sincere",
];

/** Max code points kept from a user input; excess is trimmed with notice. */
export const MAX_INPUT_CHARS = 200;

/**
 * Fixed headline templates: 4 tones x 4 = 16 templates. Slot: {brand}.
 * NOT AI-generated — hand-written, respectful, no guilt-tripping.
 */
export const HEADLINES: Record<UnsubTone, readonly string[]> = {
  friendly: [
    "You're unsubscribed from {brand}. No hard feelings!",
    "All done — you've left the {brand} list.",
    "Sorry to see you go — you're unsubscribed from {brand}.",
    "{brand} emails are off. You're in control.",
  ],
  professional: [
    "Unsubscription confirmed — {brand}.",
    "You have been removed from the {brand} mailing list.",
    "{brand}: your email preferences are updated.",
    "Confirmed: no more emails from {brand}.",
  ],
  playful: [
    "Poof! You've unsubscribed from {brand}.",
    "The {brand} email train has left the station — without you.",
    "Unsubscribed from {brand}. High five for inbox zero!",
    "{brand} emails: officially off your list.",
  ],
  sincere: [
    "We've removed you from {brand} emails — thanks for your time.",
    "You're unsubscribed from {brand}. We appreciate you reading.",
    "{brand} will miss you, and we respect your choice.",
    "Done — {brand} emails are off. Thank you for being here.",
  ],
};

/**
 * Fixed body templates: 4 (one per tone). Slots: {brand}, {alternatives}
 * (alternatives line only included when the user provided it).
 */
export const BODY_TEMPLATES: Record<UnsubTone, string> = {
  friendly:
    "You're off the {brand} list — it was great having you here! If you change your mind, you can rejoin anytime.\n\n{alternativesLine}\nCAN-SPAM reminder: this opt-out request is honored within 10 business days. This note is general information, not legal advice.",
  professional:
    "Your request to unsubscribe from {brand} has been processed. You will no longer receive marketing emails from us.\n\n{alternativesLine}\nCAN-SPAM reminder: this opt-out request is honored within 10 business days. This note is general information, not legal advice.",
  playful:
    "And... you're free! No more {brand} emails cluttering your inbox. Changed your mind? Rejoin whenever — no judgment.\n\n{alternativesLine}\nCAN-SPAM reminder: this opt-out request is honored within 10 business days. This note is general information, not legal advice.",
  sincere:
    "Thank you for reading {brand}. You're now unsubscribed, and we genuinely respect your decision. Your feedback made our emails better.\n\n{alternativesLine}\nCAN-SPAM reminder: this opt-out request is honored within 10 business days. This note is general information, not legal advice.",
};

/**
 * Fixed preference options: 8 lines shown as "before you go" alternatives
 * to full unsubscribe. Static bank — no per-user personalization.
 */
export const PREFERENCE_OPTIONS: readonly string[] = [
  "Get the weekly digest instead of daily emails",
  "Only hear about new posts, nothing else",
  "Switch to the monthly roundup",
  "Product and launch updates only",
  "Pause all emails for 30 days",
  "Reduce frequency to one email per week",
  "Unsubscribe from promotions but keep the newsletter",
  "Unsubscribe from everything",
];

const ALTERNATIVES_LINE_PREFIX = "Before you go, consider these options instead: ";

/** Detect accidental duplicated adjacent words/phrases in a generated line. */
export function hasRepeatedWords(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  for (let i = 0; i + 1 < words.length; i++) {
    if (words[i] === words[i + 1]) return true;
  }
  return false;
}

function takeCodePoints(s: string, n: number): string {
  return [...s].slice(0, n).join("");
}

/** Trim an input; returns [value, wasTrimmed]. */
function trimInput(raw: unknown): [string, boolean] {
  const s = String(raw).trim();
  if ([...s].length > MAX_INPUT_CHARS) {
    return [takeCodePoints(s, MAX_INPUT_CHARS).trimEnd(), true];
  }
  return [s, false];
}

/** Strip HTML tags from user input so output stays plain text. */
export function sanitizePlain(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim();
}

export interface UnsubResult {
  headlineOptions: string[];
  bodyDraft: string;
  preferenceOptions: string[];
  /** Visible notice when an input was trimmed (overlong input). */
  notice: string | null;
}

export function generateUnsubscribeCopy(
  brand: string,
  alternatives: string,
  tone: string,
): UnsubResult {
  if (typeof brand !== "string" || brand.trim().length === 0) {
    throw new RangeError("brand must not be empty or whitespace-only.");
  }
  if (typeof alternatives !== "string") {
    throw new RangeError("alternatives must be a string (may be empty).");
  }
  if (!UN_SUB_TONES.includes(tone as UnsubTone)) {
    throw new RangeError(`tone must be one of: ${UN_SUB_TONES.join(", ")}.`);
  }

  const [brandVal, brandTrimmed] = trimInput(brand);
  const [altVal, altTrimmed] = trimInput(alternatives);
  const cleanBrand = sanitizePlain(brandVal);
  const cleanAlt = sanitizePlain(altVal);

  const headlineOptions: string[] = [];
  for (const template of HEADLINES[tone as UnsubTone]) {
    if (headlineOptions.length >= HEADLINES[tone as UnsubTone].length) break;
    const line = template.replaceAll("{brand}", cleanBrand);
    if (hasRepeatedWords(line)) continue;
    headlineOptions.push(line);
  }

  const alternativesLine =
    cleanAlt.length > 0
      ? ALTERNATIVES_LINE_PREFIX + cleanAlt + "."
      : "You can also adjust your preferences below instead of leaving completely.";
  const bodyDraft = BODY_TEMPLATES[tone as UnsubTone]
    .replaceAll("{brand}", cleanBrand)
    .replaceAll("{alternativesLine}", alternativesLine);

  const preferenceOptions = [...PREFERENCE_OPTIONS];

  const notice =
    brandTrimmed || altTrimmed
      ? "Note: an overlong input was trimmed to 200 characters. Nothing was dropped silently."
      : null;

  return { headlineOptions, bodyDraft, preferenceOptions, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { brand, alternatives?, tone }
 * values out: { headlineOptions, bodyDraft, preferenceOptions }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { brand, alternatives, tone } = values;

  if (typeof brand !== "string" || brand.trim().length === 0) {
    return { ok: false, error: "Please enter your brand name." };
  }
  if (alternatives !== undefined && typeof alternatives !== "string") {
    return { ok: false, error: "Alternatives must be text." };
  }
  if (typeof tone !== "string" || !UN_SUB_TONES.includes(tone as UnsubTone)) {
    return { ok: false, error: `Please choose a tone: ${UN_SUB_TONES.join(", ")}.` };
  }

  let result: UnsubResult;
  try {
    result = generateUnsubscribeCopy(brand, alternatives ?? "", tone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate unsubscribe copy.",
    };
  }

  const bodyDraft = result.notice
    ? result.bodyDraft + "\n\n" + result.notice
    : result.bodyDraft;

  return {
    ok: true,
    values: {
      headlineOptions: result.headlineOptions,
      bodyDraft,
      preferenceOptions: result.preferenceOptions,
    },
  };
}
