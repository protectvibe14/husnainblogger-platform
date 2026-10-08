/**
 * Testimonial Request Email Generator — pure logic (tool-424).
 *
 * ASSEMBLY, NOT AI: the email is assembled from FIXED template/template-part
 * banks bundled below — no network, no model, no randomness. Variant selection
 * is a deterministic hash of the inputs, so identical inputs always produce
 * identical output. The copy says "templates" and never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - SUBJECT_TEMPLATES: 10 subject-line patterns
 * - OPENERS: 6 greeting openers
 * - ASK_FRAMINGS: 5 ways to phrase the testimonial ask
 * - EASE_LINES: 5 "make it easy" lines
 * - INCENTIVE_LINES: 5 thank-you-gift lines (used only when an incentive is given)
 * - CLOSERS: 5 closers
 * - SIGNOFFS: 4 sign-offs (fixed set; "[Your Name]" is the editable fallback,
 *   never rendered empty)
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

/** Documented input length caps (Unicode code points). */
export const MAX_CLIENT_NAME_CHARS = 80;
export const MAX_PRODUCT_CHARS = 120;
export const MAX_SPECIFIC_ASK_CHARS = 200;
export const MAX_INCENTIVE_CHARS = 120;

/** 10 subject-line patterns. Placeholders: {clientName}, {product}. */
export const SUBJECT_TEMPLATES: readonly string[] = [
  "Quick favor, {clientName}?",
  "How was {product}?",
  "Can you help us with a 2-minute review?",
  "Your feedback on {product} would mean a lot",
  "{clientName}, mind sharing your experience?",
  "A small ask about {product}",
  "Loved {product}? Tell others",
  "Your story could help others like you",
  "2 minutes of your time, {clientName}?",
  "We'd love your honest feedback",
];

/** 6 greeting openers. Placeholder: {product}. */
export const OPENERS: readonly string[] = [
  "Thanks again for choosing {product} — it means the world to our small team.",
  "I hope {product} has been working well for you.",
  "It's been great working with you, and I'd love to hear how {product} turned out.",
  "Thank you for being a {product} customer — your support keeps us going.",
  "I wanted to reach out personally because your experience with {product} matters.",
  "Hope you're enjoying {product}! I have a small favor to ask.",
];

/** 5 ways to phrase the ask. Placeholder: {product}. */
export const ASK_FRAMINGS: readonly string[] = [
  "Would you be willing to share a short testimonial about your experience?",
  "Could you write a few sentences about how {product} helped you?",
  "Would you mind leaving an honest review of {product}?",
  "I'd love to feature your story — would you share what {product} did for you?",
  "Could you tell others, in your own words, what using {product} was like?",
];

/** 5 "make it easy" lines. */
export const EASE_LINES: readonly string[] = [
  "It only takes 2 minutes — even two or three sentences help.",
  "No need to overthink it: a sentence or two is perfect.",
  "Just reply to this email — I'll take care of the formatting.",
  "Short and honest beats long and polished — write whatever comes to mind.",
  "There's no wrong answer here; your honest words are what count.",
];

/** 5 thank-you-gift lines, used only when an incentive is provided. Placeholder: {incentive}. */
export const INCENTIVE_LINES: readonly string[] = [
  "As a thank-you, we'd love to send you {incentive}.",
  "To show our appreciation, you'll receive {incentive}.",
  "We'll send {incentive} your way as a small thank-you.",
  "As a token of our thanks: {incentive}.",
  "You'll get {incentive} from us as a thank-you gift.",
];

/** 5 closers. Placeholder: {product}. */
export const CLOSERS: readonly string[] = [
  "Thanks so much for considering it.",
  "I really appreciate your time.",
  "Thank you — reviews like yours help us grow.",
  "Grateful for your support, whatever you decide.",
  "Thanks for helping others discover {product}.",
];

/** 4 sign-offs. */
export const SIGNOFFS: readonly string[] = [
  "Best regards",
  "Warmly",
  "With thanks",
  "Kind regards",
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
 * Generate a testimonial-request email from fixed templates.
 *
 * Inputs (values): clientName, product, specificAsk (required text),
 * incentive (optional text).
 * Outputs (values): subjectOptions (string[5]), bodyDraft (string).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const clientName = readText(values, "clientName", "Client name", MAX_CLIENT_NAME_CHARS);
  if (!clientName.ok) return { ok: false, error: clientName.error };
  const product = readText(values, "product", "Product", MAX_PRODUCT_CHARS);
  if (!product.ok) return { ok: false, error: product.error };
  const specificAsk = readText(values, "specificAsk", "Specific ask", MAX_SPECIFIC_ASK_CHARS);
  if (!specificAsk.ok) return { ok: false, error: specificAsk.error };
  const incentive = readText(values, "incentive", "Incentive", MAX_INCENTIVE_CHARS, true);
  if (!incentive.ok) return { ok: false, error: incentive.error };

  const notices: string[] = [];
  for (const r of [clientName, product, specificAsk, incentive]) {
    if (r.ok && r.notice) notices.push(r.notice);
  }

  const map = {
    clientName: clientName.value,
    product: product.value,
    incentive: incentive.value,
  };
  // Deterministic variant selection from the joined inputs.
  const h = hashString(
    [clientName.value, product.value, specificAsk.value, incentive.value].join(" "),
  );

  const subjectOptions: string[] = [];
  for (let i = 0; i < SUBJECT_COUNT; i++) {
    // Step 3 is coprime to 10, so 5 picks are always distinct.
    subjectOptions.push(fill(SUBJECT_TEMPLATES[(h + 3 * i) % SUBJECT_TEMPLATES.length], map));
  }

  const opener = fill(OPENERS[h % OPENERS.length], map);
  const askFraming = fill(ASK_FRAMINGS[Math.floor(h / 3) % ASK_FRAMINGS.length], map);
  const easeLine = EASE_LINES[Math.floor(h / 5) % EASE_LINES.length];
  const closer = fill(CLOSERS[Math.floor(h / 7) % CLOSERS.length], map);
  const signoff = SIGNOFFS[Math.floor(h / 9) % SIGNOFFS.length];
  const incentiveLine =
    incentive.value !== ""
      ? fill(INCENTIVE_LINES[Math.floor(h / 11) % INCENTIVE_LINES.length], map)
      : "";

  let bodyDraft =
    `Subject: ${subjectOptions[0]}\n` +
    `\n` +
    `Hi ${clientName.value},\n` +
    `\n` +
    `${opener}\n` +
    `\n` +
    `${askFraming}\n` +
    `\n` +
    `If you're stuck, here's a prompt to get you started: ${specificAsk.value}\n` +
    `\n` +
    `${easeLine}\n`;
  if (incentiveLine !== "") {
    bodyDraft += `\n${incentiveLine}\n`;
  }
  bodyDraft +=
    `\n` +
    `${closer}\n` +
    `\n` +
    `${signoff},\n` +
    `[Your Name]`;

  const dupNotice = repeatedPhraseNotice(bodyDraft);
  if (dupNotice) notices.push(dupNotice);
  if (notices.length > 0) {
    bodyDraft += `\n\n—\nNotes: ${notices.join(" ")}`;
  }

  return { ok: true, values: { subjectOptions, bodyDraft } };
}
