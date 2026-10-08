/**
 * Re-engagement Email Generator (tool-414) — pure logic, zero imports.
 *
 * FIXED TEMPLATE LIBRARY, NOT AI: every subject line and the body draft are
 * assembled from fixed template banks documented below. Selection is
 * deterministic: the same inputs always produce the same email (a char-code
 * hash of the inputs picks the bank indices). The UI must never claim AI
 * generation — copy must say "templates".
 *
 * Word banks (sizes documented for honest UI copy):
 *   SUBJECTS: 10 fixed subject-line templates (5 returned per run)
 *   BODIES: 4 fixed body templates (1 returned per run)
 *   TONES: 4 fixed tones (friendly, warm, professional, playful)
 *
 * Input rules:
 *   - segmentName: required, non-empty after trim; max 100 Unicode code
 *     points ([...s].length, so emoji count as one); overlong input is
 *     truncated with a visible notice, never silently dropped.
 *   - inactiveDays: required, finite number, 30–730 days. NaN/Infinity are
 *     rejected; out-of-range values are clamped with a notice.
 *   - incentive: optional free text (e.g. "20% off your next order"). When
 *     omitted, the win-back offer block explains that no offer was added.
 *   - tone: one of the 4 fixed tones (default friendly).
 *
 * Output sanitization: user text interpolated into templates is HTML-escaped.
 * The {{firstName}} placeholder is left in place with a documented fallback
 * ("there") — never rendered empty.
 */

export const TONES: readonly string[] = ["friendly", "warm", "professional", "playful"];
export const DEFAULT_TONE = "friendly";
export const MAX_INPUT_CHARS = 100;
export const MIN_INACTIVE_DAYS = 30;
export const MAX_INACTIVE_DAYS = 730;
export const SUBJECT_OPTION_COUNT = 5;

/** 10 fixed re-engagement subject templates. Slots: {segmentName}, {inactiveDays}, {{firstName}}. */
export const SUBJECTS: readonly string[] = [
  "We miss you, {{firstName}}",
  "It's been {inactiveDays} days…",
  "Still interested in {segmentName}?",
  "A little something to welcome you back",
  "{{firstName}}, did we lose you?",
  "Before you go — one last email",
  "Your {segmentName} favorites are waiting",
  "Let's fix this: what do you want to hear about?",
  "We saved your spot, {{firstName}}",
  "Is this goodbye?",
];

/** 4 fixed body templates. Slots: {greeting}, {segmentName}, {inactiveDays}, {{firstName}}, {offerSentence}, {signoff}. */
export const BODIES: readonly string[] = [
  "{greeting}\n\nIt's been {inactiveDays} days since we last connected, and I wanted to check in personally.\n\nA lot has changed in {segmentName} since you've been away. {offerSentence}\n\nIf our emails aren't useful anymore, you can update your preferences or unsubscribe below — no hard feelings, and no guilt trip.\n\nBut if you're still interested, just hit reply and tell me what you'd like to hear about. I read every response.\n\n{signoff}",
  "{greeting}\n\nQuick question: is {segmentName} still on your radar?\n\nYou joined us {inactiveDays} days ago, and I'd hate for you to miss what's new. {offerSentence}\n\nWant fewer emails instead of none? Update your preferences here: [preferences link]. Want out entirely? Unsubscribe below — it takes 10 seconds.\n\n{signoff}",
  "{greeting}\n\nWe noticed you haven't opened our emails in a while — {inactiveDays} days, to be exact. Rather than keep filling your inbox, I wanted to ask directly:\n\nWhat would make our {segmentName} emails worth opening again? Reply and tell me — one sentence is plenty.\n\n{offerSentence}\n\nEither way, thanks for being part of this list.\n\n{signoff}",
  "{greeting}\n\nThis is the \"we miss you\" email — but with a twist. Instead of begging you to stay, here's what's new in {segmentName} since you went quiet:\n\n• [New thing one]\n• [New thing two]\n• [New thing three]\n\n{offerSentence}\n\nIf none of that interests you, the unsubscribe link is below. No hard feelings.\n\n{signoff}",
];

/** 12 greetings (4 tones x 3). */
export const GREETINGS: Record<string, readonly string[]> = {
  friendly: ["Hey {{firstName}},", "Hi {{firstName}},", "Hello {{firstName}},"],
  warm: ["A warm hello, {{firstName}},", "It's good to write to you, {{firstName}},", "Hello again, {{firstName}},"],
  professional: ["Hello {{firstName}},", "Dear {{firstName}},", "Good day {{firstName}},"],
  playful: ["Hey hey, {{firstName}}!", "Long time no see, {{firstName}}!", "Psst… {{firstName}},"],
};

/** 8 sign-offs (4 tones x 2). */
export const SIGNOFFS: Record<string, readonly string[]> = {
  friendly: ["Cheers,\n[Your name]", "Talk soon,\n[Your name]"],
  warm: ["Warmly,\n[Your name]", "With gratitude,\n[Your name]"],
  professional: ["Best regards,\n[Your name]", "Sincerely,\n[Your name]"],
  playful: ["Miss you already,\n[Your name]", "Catch you soon,\n[Your name]"],
};

// ---------------------------------------------------------------------------
// Helpers (pure, no imports)
// ---------------------------------------------------------------------------

function codePoints(s: string): number {
  return [...s].length;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(bank: readonly T[], seed: number): T {
  return bank[((seed % bank.length) + bank.length) % bank.length];
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fill(template: string, slots: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(slots)) {
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

function requiredText(values: Record<string, unknown>, id: string, label: string): string {
  const raw = values[id];
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error(`Please enter ${label}.`);
  }
  return raw.trim();
}

function optionalText(values: Record<string, unknown>, id: string): string {
  const raw = values[id];
  if (typeof raw !== "string") return "";
  return raw.trim();
}

function truncateWithNotice(s: string, id: string, notices: string[]): string {
  if (codePoints(s) > MAX_INPUT_CHARS) {
    notices.push(
      `Note: ${id} was over ${MAX_INPUT_CHARS} characters, so it was shortened. The full text was not silently dropped — edit it down to what matters most.`,
    );
    return [...s].slice(0, MAX_INPUT_CHARS).join("");
  }
  return s;
}

function validatedInactiveDays(raw: unknown, notices: string[]): number {
  if (typeof raw === "undefined" || raw === null || raw === "") {
    throw new Error("Please enter how many days the segment has been inactive (30–730).");
  }
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new Error("Inactive days must be a number between 30 and 730.");
  }
  const rounded = Math.round(n);
  if (rounded < MIN_INACTIVE_DAYS) {
    notices.push(`Note: inactive days was raised to the minimum of ${MIN_INACTIVE_DAYS}.`);
    return MIN_INACTIVE_DAYS;
  }
  if (rounded > MAX_INACTIVE_DAYS) {
    notices.push(`Note: inactive days was lowered to the maximum of ${MAX_INACTIVE_DAYS}.`);
    return MAX_INACTIVE_DAYS;
  }
  return rounded;
}

function validatedTone(raw: unknown): string {
  if (typeof raw === "undefined" || raw === null || raw === "") return DEFAULT_TONE;
  if (typeof raw !== "string" || !TONES.includes(raw)) {
    throw new Error(`Please choose a tone: ${TONES.join(", ")}.`);
  }
  return raw;
}

function findRepeatedWord(text: string): string | null {
  const m = text.match(/\b([A-Za-z]{3,})\s+\1\b/i);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const notices: string[] = [];
  let segmentName: string;
  let inactiveDays: number;
  let incentive: string;
  let tone: string;
  try {
    segmentName = requiredText(values, "segmentName", "the segment name (e.g. Lapsed buyers)");
    inactiveDays = validatedInactiveDays(values.inactiveDays, notices);
    incentive = optionalText(values, "incentive");
    tone = validatedTone(values.tone);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }

  segmentName = escapeHtml(truncateWithNotice(segmentName, "segmentName", notices));
  incentive = escapeHtml(truncateWithNotice(incentive, "incentive", notices));

  const seed = hashStr(`${segmentName}|${inactiveDays}|${incentive}|${tone}`);

  const slots = {
    greeting: pick(GREETINGS[tone], seed),
    segmentName,
    inactiveDays: String(inactiveDays),
    signoff: pick(SIGNOFFS[tone], seed + 7),
    offerSentence: incentive
      ? `As a welcome-back gift: ${incentive}.`
      : `Reply and tell me what would make these emails worth opening — your answer shapes what we send next.`,
  };

  // Deterministic rotation through the 10 subjects: start at hash offset,
  // take 5 consecutive (wrapping), so different inputs surface different sets.
  const start = seed % SUBJECTS.length;
  const subjectOptions: string[] = [];
  for (let k = 0; k < SUBJECT_OPTION_COUNT; k++) {
    subjectOptions.push(fill(SUBJECTS[(start + k) % SUBJECTS.length], slots));
  }

  const bodyDraft = fill(pick(BODIES, seed + 3), slots);

  const winbackOfferBlock = incentive
    ? `P.S. A welcome-back gift, just for you: ${incentive}.\n\n[Claim it here: link]`
    : "No incentive was provided, so no offer block was added to this draft. Win-back emails perform best with a concrete reason to return — add a discount, free bonus, or exclusive perk here before sending.";

  const dup = findRepeatedWord(bodyDraft);
  if (dup) {
    notices.push(
      `Note: the body draft contains a repeated word ("${dup} ${dup}") — review the copy before sending.`,
    );
  }

  const valuesOut: Record<string, unknown> = {
    subjectOptions,
    bodyDraft,
    winbackOfferBlock,
  };
  if (notices.length > 0) {
    valuesOut.notices = notices.join(" ");
  }
  return { ok: true, values: valuesOut };
}
