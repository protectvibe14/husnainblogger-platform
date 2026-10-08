/**
 * Webinar Invitation Email Generator — pure logic (tool-422).
 *
 * ASSEMBLY, NOT AI: the email is assembled from FIXED template/template-part
 * banks bundled below — no network, no model, no randomness. Variant selection
 * is a deterministic hash of the inputs, so identical inputs always produce
 * identical output. The copy says "templates" and never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - SUBJECT_TEMPLATES: 12 subject-line patterns
 * - OPENERS: 6 greeting openers
 * - BODY_PATTERNS: 4 body paragraphs
 * - BENEFIT_INTROS: 4 "what you'll learn" intros
 * - CTA_LINES: 6 call-to-action lines
 * - PS_LINES: 6 postscript lines
 * - SIGNOFFS: 4 sign-offs
 *
 * Honesty / edge-case handling:
 * - Lengths are measured in Unicode code points ([...s].length), so emoji and
 *   CJK/RTL text count as one character each.
 * - Inputs longer than the documented caps are TRUNCATED and a visible notice
 *   is appended to the body draft — never silently dropped.
 * - Output is plain text: user input is HTML-escaped so no markup is rendered.
 * - Generated body is scanned for repeated-word/phrase patterns; a visible
 *   notice is appended when found.
 */

export const SUBJECT_COUNT = 5;
export const MAX_BENEFITS = 6;

/** Documented input length caps (Unicode code points). */
export const MAX_TITLE_CHARS = 120;
export const MAX_DATETIME_CHARS = 80;
export const MAX_SPEAKER_CHARS = 80;
export const MAX_BENEFITS_CHARS = 1000;
export const MAX_CTA_CHARS = 160;

/** 12 subject-line patterns. Placeholders: {title}, {speaker}, {dateTime}. */
export const SUBJECT_TEMPLATES: readonly string[] = [
  "You're invited: {title}",
  "Live webinar: {title} with {speaker}",
  "{title} — save your seat",
  "Join {speaker} live: {title}",
  "Don't miss {title} ({dateTime})",
  "Free webinar: {title}",
  "{title}: what you'll learn, live with {speaker}",
  "Reminder: {title} is on {dateTime}",
  "Your invitation to {title}",
  "{speaker} is going live: {title}",
  "{title} — seats are open",
  "Learn live: {title} with {speaker}",
];

/** 6 greeting openers. */
export const OPENERS: readonly string[] = [
  "I'm excited to invite you to something special.",
  "I wanted to personally invite you to an upcoming live session.",
  "Here's an invitation I didn't want you to miss.",
  "We're hosting a live session soon, and you're invited.",
  "Mark your calendar — this one is worth attending live.",
  "I'd love for you to join us for this live event.",
];

/** 4 body paragraphs. Placeholders: {speaker}. */
export const BODY_PATTERNS: readonly string[] = [
  "During this live session, {speaker} will walk you through the key ideas step by step, and you'll be able to ask questions in real time.",
  "This isn't a pre-recorded video — it's a live, interactive session where {speaker} answers your questions as they come.",
  "{speaker} will share practical strategies you can apply right away, with a live Q&A at the end.",
  "Join live to learn directly from {speaker}, see real examples, and get your questions answered on the spot.",
];

/** 4 "what you'll learn" intros. */
export const BENEFIT_INTROS: readonly string[] = [
  "Here's what you'll take away:",
  "By the end of the session, you'll know how to:",
  "What you'll learn:",
  "Here's what's in it for you:",
];

/** 6 call-to-action lines (no false scarcity — no seat-count claims). */
export const CTA_LINES: readonly string[] = [
  "Reserve your spot here",
  "Register now — it takes less than a minute",
  "Click here to sign up for free",
  "Save your seat here",
  "Register here to join us live",
  "Sign up here to get the joining link",
];

/** 6 postscript lines. Placeholder: {dateTime}. */
export const PS_LINES: readonly string[] = [
  "P.S. Can't attend live? Register anyway — we'll send you the replay link.",
  "P.S. Bring your questions — there's a live Q&A at the end.",
  "P.S. Feel free to forward this invitation to anyone who'd benefit.",
  "P.S. Add {dateTime} to your calendar so you don't forget.",
  "P.S. Registration is free and takes less than a minute.",
  "P.S. Join a few minutes early to grab a good spot in the chat.",
];

/** 4 sign-offs. */
export const SIGNOFFS: readonly string[] = [
  "Best regards",
  "Warm regards",
  "See you there",
  "Looking forward to seeing you",
];

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

/**
 * Read + validate a text input: required unless `optional`, trims,
 * rejects whitespace-only, truncates over-long input with a notice,
 * and HTML-escapes for plain-text output.
 */
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

/**
 * Split the benefits textarea into a list. Documented rule: split on
 * newlines, semicolons, or pipes; if a single segment remains, split on
 * commas. Capped at MAX_BENEFITS with a notice.
 */
export function parseBenefits(raw: string): { benefits: string[]; notice?: string } {
  let parts = raw.split(/\r?\n|;|\|/).map((p) => p.trim()).filter((p) => p !== "");
  if (parts.length <= 1 && parts.length > 0) {
    parts = parts[0].split(",").map((p) => p.trim()).filter((p) => p !== "");
  }
  // Dedupe (case-insensitive) while preserving order.
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
  }
  let notice: string | undefined;
  let benefits = deduped;
  if (deduped.length > MAX_BENEFITS) {
    benefits = deduped.slice(0, MAX_BENEFITS);
    notice = `Only the first ${MAX_BENEFITS} benefits were used (${deduped.length} given).`;
  }
  return { benefits, notice };
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Generate a webinar invitation email from fixed templates.
 *
 * Inputs (values): webinarTitle, dateTime, speaker, benefits, cta — all
 * required text.
 * Outputs (values): subjectOptions (string[5]), bodyDraft (string).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const title = readText(values, "webinarTitle", "Webinar title", MAX_TITLE_CHARS);
  if (!title.ok) return { ok: false, error: title.error };
  const dateTime = readText(values, "dateTime", "Date and time", MAX_DATETIME_CHARS);
  if (!dateTime.ok) return { ok: false, error: dateTime.error };
  const speaker = readText(values, "speaker", "Speaker", MAX_SPEAKER_CHARS);
  if (!speaker.ok) return { ok: false, error: speaker.error };
  const benefitsRaw = readText(values, "benefits", "Benefits", MAX_BENEFITS_CHARS);
  if (!benefitsRaw.ok) return { ok: false, error: benefitsRaw.error };
  const cta = readText(values, "cta", "Call to action", MAX_CTA_CHARS);
  if (!cta.ok) return { ok: false, error: cta.error };

  const notices: string[] = [];
  for (const r of [title, dateTime, speaker, benefitsRaw, cta]) {
    if (r.ok && r.notice) notices.push(r.notice);
  }

  const parsed = parseBenefits(benefitsRaw.value);
  if (parsed.notice) notices.push(parsed.notice);
  if (parsed.benefits.length === 0) {
    return { ok: false, error: "Benefits must contain at least one benefit." };
  }

  const map = { title: title.value, dateTime: dateTime.value, speaker: speaker.value };
  // Deterministic variant selection from the joined inputs.
  const h = hashString([title.value, dateTime.value, speaker.value, benefitsRaw.value, cta.value].join(""));

  const subjectOptions: string[] = [];
  for (let i = 0; i < SUBJECT_COUNT; i++) {
    // Step 5 is coprime to 12, so 5 picks are always distinct.
    subjectOptions.push(fill(SUBJECT_TEMPLATES[(h + 5 * i) % SUBJECT_TEMPLATES.length], map));
  }

  const opener = OPENERS[h % OPENERS.length];
  const bodyPattern = fill(BODY_PATTERNS[Math.floor(h / 3) % BODY_PATTERNS.length], map);
  const benefitIntro = BENEFIT_INTROS[Math.floor(h / 7) % BENEFIT_INTROS.length];
  const ctaLine = CTA_LINES[Math.floor(h / 11) % CTA_LINES.length];
  const psLine = fill(PS_LINES[Math.floor(h / 13) % PS_LINES.length], map);
  const signoff = SIGNOFFS[Math.floor(h / 17) % SIGNOFFS.length];

  const bullets = parsed.benefits.map((b) => `- ${b}`).join("\n");

  let bodyDraft =
    `Subject: ${subjectOptions[0]}\n` +
    `\n` +
    `Hi there,\n` +
    `\n` +
    `${opener}\n` +
    `\n` +
    `You're invited to "${title.value}" — a live webinar with ${speaker.value} on ${dateTime.value}.\n` +
    `\n` +
    `${bodyPattern}\n` +
    `\n` +
    `${benefitIntro}\n` +
    `${bullets}\n` +
    `\n` +
    `${ctaLine}: ${cta.value}\n` +
    `\n` +
    `${psLine}\n` +
    `\n` +
    `${signoff},\n` +
    `${speaker.value}`;

  const dupNotice = repeatedPhraseNotice(bodyDraft);
  if (dupNotice) notices.push(dupNotice);
  if (notices.length > 0) {
    bodyDraft += `\n\n—\nNotes: ${notices.join(" ")}`;
  }

  return { ok: true, values: { subjectOptions, bodyDraft } };
}
