/**
 * Sale/Promo Email Generator — pure logic (tool-423).
 *
 * ASSEMBLY, NOT AI: the email is assembled from FIXED template/template-part
 * banks bundled below — no network, no model, no randomness. Variant selection
 * is a deterministic hash of the inputs, so identical inputs always produce
 * identical output. The copy says "templates" and never "AI-generated".
 *
 * HONESTY GUARDRAIL (hard rule): generated urgency copy MUST NOT invent false
 * scarcity. Any deadline/countdown appears ONLY when the user supplies a
 * `deadline`; with no deadline the urgencyBlock output explicitly says no
 * urgency was generated, and the body draft contains no time-pressure claims.
 * The deadline, discount, and offer are echoed from user input — never invented.
 *
 * Bank sizes (documented for the honesty contract):
 * - SUBJECT_TEMPLATES: 12 subject-line patterns
 * - OPENERS: 12 (3 per tone x 4 tones)
 * - BODY_PATTERNS: 4 body paragraphs
 * - CTA_LINES: 12 (3 per tone x 4 tones)
 * - URGENCY_TEMPLATES: 6 deadline-based urgency lines (used only with a deadline)
 * - SIGNOFFS: 4 sign-offs
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK / RTL
 *   count as one character each.
 * - Over-long inputs are TRUNCATED with a visible notice in the body draft.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 * - Generated body is scanned for repeated-word/phrase patterns with a
 *   visible notice when found.
 */

export const SUBJECT_COUNT = 5;
export const TONES: readonly string[] = ["professional", "friendly", "playful", "urgent"];

/** Documented input length caps (Unicode code points). */
export const MAX_OFFER_CHARS = 120;
export const MAX_DISCOUNT_CHARS = 60;
export const MAX_DEADLINE_CHARS = 80;
export const MAX_AUDIENCE_CHARS = 120;

/** 12 subject-line patterns. Placeholders: {offer}, {discount}, {deadline?}. */
export const SUBJECT_TEMPLATES: readonly string[] = [
  "{discount} off {offer}",
  "A special deal on {offer}, just for you",
  "{offer} at {discount}: don't miss it",
  "Your exclusive {discount} discount is here",
  "Save {discount} on {offer}",
  "{offer} — now {discount} off",
  "Psst… {discount} off {offer} inside",
  "The {offer} deal you've been waiting for",
  "{discount} off ends {deadline}",
  "Last chance: {offer} at {discount}",
  "Treat yourself: {discount} off {offer}",
  "{offer} sale: {discount} for a short time",
];

/**
 * NOTE on SUBJECT_TEMPLATES entries 9, 10, 12 ("ends {deadline}", "Last
 * chance", "for a short time"): they imply time pressure and are used ONLY
 * when the user supplied a deadline. Without a deadline they are filtered out
 * (see runTool) — the honesty guardrail.
 */

/** 12 openers, 3 per tone: professional, friendly, playful, urgent. */
export const OPENERS: readonly string[][] = [
  [
    "We're pleased to share an exclusive offer with you.",
    "As a valued member of our community, you get first access.",
    "Here's a special offer we put together for you.",
  ],
  [
    "Great news — we've got a deal we think you'll love.",
    "We couldn't wait to share this one with you.",
    "Here's something special, just for you.",
  ],
  [
    "Psst… we've got a deal with your name on it.",
    "Warning: this deal may cause extreme happiness.",
    "Your wallet is about to thank you.",
  ],
  [
    "Stop scrolling — this one's big.",
    "This is the deal you've been waiting for.",
    "We don't do this often — take a look.",
  ],
];

/** 4 body paragraphs. Placeholders: {offer}, {discount}, {audience}. */
export const BODY_PATTERNS: readonly string[] = [
  "{offer} is now available at {discount} — exclusively for {audience}.",
  "Right now, {audience} can get {offer} for {discount}.",
  "We've dropped the price on {offer}: {discount} for {audience}, no code needed.",
  "{audience}, this is your chance to grab {offer} at {discount}.",
];

/** 12 CTA lines, 3 per tone (imperatives only — no invented time claims). */
export const CTA_LINES: readonly string[][] = [
  ["Shop the sale", "Claim this offer", "Browse the collection"],
  ["Grab the deal", "Treat yourself", "Shop now"],
  ["Snag the deal", "Get yours", "Start saving"],
  ["Claim it now", "Shop now", "Get started"],
];

/**
 * 6 urgency lines. Placeholders: {offer}, {discount}, {deadline}.
 * USED ONLY when the user supplied a deadline (honesty guardrail).
 */
export const URGENCY_TEMPLATES: readonly string[] = [
  "Heads up: this offer ends on {deadline}. After that, regular pricing returns.",
  "Don't miss out — the {discount} discount on {offer} ends {deadline}.",
  "Last call: {deadline} is the final day to get {offer} at {discount}.",
  "Mark your calendar: this deal expires on {deadline}.",
  "Time is running out — {offer} at {discount} ends {deadline}.",
  "Final reminder: after {deadline}, this offer is gone for good.",
];

/** Subject templates that imply time pressure (indexes into SUBJECT_TEMPLATES). */
export const URGENT_SUBJECT_INDEXES: ReadonlySet<number> = new Set([8, 9, 11]);

/** 4 sign-offs. */
export const SIGNOFFS: readonly string[] = [
  "Happy shopping",
  "Best",
  "Warm regards",
  "Cheers",
];

/** Message shown in urgencyBlock when no deadline was provided. */
export const NO_DEADLINE_MESSAGE =
  "No deadline was entered, so no urgency copy was generated. " +
  "This tool never invents deadlines, countdowns, or scarcity claims — " +
  "add your real deadline above to get urgency copy.";

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
  optional = false,
): TextRead | TextFail {
  const raw = values[id];
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    if (optional) return { ok: true, value: "" };
    return { ok: false, error: `${label} is required — please fill it in.` };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: `${label} must be text.` };
  }
  const trimmed = raw.trim();
  if (trimmed === "") {
    if (optional) return { ok: true, value: "" };
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

const STOPWORDS: ReadonlySet<string> = new Set([
  "the", "a", "an", "to", "of", "and", "for", "in", "on", "is", "are",
  "you", "your", "we", "our", "it", "this", "that", "with", "will",
  "at", "as", "be", "or", "by", "from", "so", "if", "it's",
]);

/**
 * Heuristic duplicate-word/phrase scan of generated copy. Returns a notice
 * string when a word repeats 3+ times in a row or a non-stopword bigram
 * appears 4+ times; otherwise null.
 */
export function repeatedPhraseNotice(text: string): string | null {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  for (let i = 0; i + 2 < words.length; i++) {
    if (words[i] === words[i + 1] && words[i] === words[i + 2] && words[i].length > 2) {
      return `The word "${words[i]}" repeats 3+ times in a row — consider varying it.`;
    }
  }
  const counts = new Map<string, number>();
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (STOPWORDS.has(a) || STOPWORDS.has(b)) continue;
    const key = `${a} ${b}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let top = "";
  let topN = 0;
  for (const [key, n] of counts) {
    if (n > topN) {
      top = key;
      topN = n;
    }
  }
  if (topN >= 4) {
    return `The phrase "${top}" appears ${topN} times — consider varying it.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Generate a sale/promo email from fixed templates, with the honesty guardrail:
 * urgency copy is generated ONLY from a user-supplied deadline.
 *
 * Inputs (values): offer, discount, audience (required text), deadline
 * (optional text), tone (required select: professional|friendly|playful|urgent).
 * Outputs (values): subjectOptions (string[5]), bodyDraft (string),
 * urgencyBlock (string).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const offer = readText(values, "offer", "Offer", MAX_OFFER_CHARS);
  if (!offer.ok) return { ok: false, error: offer.error };
  const discount = readText(values, "discount", "Discount", MAX_DISCOUNT_CHARS);
  if (!discount.ok) return { ok: false, error: discount.error };
  const audience = readText(values, "audience", "Audience", MAX_AUDIENCE_CHARS);
  if (!audience.ok) return { ok: false, error: audience.error };
  const deadline = readText(values, "deadline", "Deadline", MAX_DEADLINE_CHARS, true);
  if (!deadline.ok) return { ok: false, error: deadline.error };

  const toneRaw = values["tone"];
  if (typeof toneRaw !== "string" || !TONES.includes(toneRaw)) {
    return {
      ok: false,
      error: `Tone must be one of: ${TONES.join(", ")}.`,
    };
  }
  const toneIndex = TONES.indexOf(toneRaw);

  const notices: string[] = [];
  for (const r of [offer, discount, audience, deadline]) {
    if (r.ok && r.notice) notices.push(r.notice);
  }

  const hasDeadline = deadline.value !== "";
  const map: Record<string, string> = {
    offer: offer.value,
    discount: discount.value,
    audience: audience.value,
    deadline: deadline.value,
  };
  const h = hashString(
    [offer.value, discount.value, deadline.value, audience.value, toneRaw].join(" "),
  );

  // Subject options: 5 distinct picks, step 7 is coprime to 12.
  // Without a deadline, urgency-implying subjects are filtered out (guardrail).
  const subjectOptions: string[] = [];
  let i = 0;
  let guard = 0;
  while (subjectOptions.length < SUBJECT_COUNT && guard < 60) {
    const idx = (h + 7 * i) % SUBJECT_TEMPLATES.length;
    i++;
    guard++;
    if (!hasDeadline && URGENT_SUBJECT_INDEXES.has(idx)) continue;
    subjectOptions.push(fill(SUBJECT_TEMPLATES[idx], map));
  }

  const opener = OPENERS[toneIndex][h % OPENERS[toneIndex].length];
  const bodyPattern = fill(BODY_PATTERNS[Math.floor(h / 3) % BODY_PATTERNS.length], map);
  const ctaLine = CTA_LINES[toneIndex][Math.floor(h / 5) % CTA_LINES[toneIndex].length];
  const signoff = SIGNOFFS[Math.floor(h / 7) % SIGNOFFS.length];

  // Urgency: ONLY from the user's deadline. Never invented.
  const urgencyBlock = hasDeadline
    ? fill(URGENCY_TEMPLATES[Math.floor(h / 11) % URGENCY_TEMPLATES.length], map)
    : NO_DEADLINE_MESSAGE;

  let bodyDraft =
    `Subject: ${subjectOptions[0]}\n` +
    `\n` +
    `${opener}\n` +
    `\n` +
    `${bodyPattern}\n`;
  if (hasDeadline) {
    bodyDraft += `\n${urgencyBlock}\n`;
  }
  bodyDraft +=
    `\n` +
    `${ctaLine}: ${offer.value} — ${discount}.\n` +
    `\n` +
    `${signoff},\n` +
    `[Your Brand]`;

  const dupNotice = repeatedPhraseNotice(bodyDraft);
  if (dupNotice) notices.push(dupNotice);
  if (notices.length > 0) {
    bodyDraft += `\n\n—\nNotes: ${notices.join(" ")}`;
  }

  return { ok: true, values: { subjectOptions, bodyDraft, urgencyBlock } };
}
