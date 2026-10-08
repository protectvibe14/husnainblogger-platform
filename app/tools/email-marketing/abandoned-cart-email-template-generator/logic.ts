/**
 * Abandoned Cart Email Template Generator (tool-415) — pure logic, zero imports.
 *
 * FIXED TEMPLATE LIBRARY, NOT AI: each of the 3 cart-recovery emails is a
 * fixed template with {{placeholders}} the merchant fills in ({{firstName}},
 * {{storeName}}, {{productName}}, {{cartUrl}}, {{discountCode}}). Subject
 * options come from fixed per-email banks. Selection is deterministic: the
 * same inputs always produce the same template (a char-code hash of the
 * inputs picks the subject rotation). The UI must never claim AI generation
 * — copy must say "templates".
 *
 * Word banks (sizes documented for honest UI copy):
 *   TEMPLATES: 3 fixed email templates (one per emailNumber)
 *   SUBJECTS: 3 emails x 4 subjects = 12 subject templates
 *   TONES: 4 fixed tones (friendly, warm, professional, playful)
 *
 * Fixed 3-email cart recovery series:
 *   email 1 (~1 hour later): gentle reminder — "you left something behind"
 *   email 2 (~24 hours later): value / objection handling
 *   email 3 (~48–72 hours later): incentive + urgency (uses {{discountCode}})
 *
 * Input rules:
 *   - storeName, productName: required, non-empty after trim; max 100
 *     Unicode code points ([...s].length, so emoji count as one); overlong
 *     input is truncated with a visible notice, never silently dropped.
 *   - discountOffer: optional free text describing the offer. It is rendered
 *     as its own line in email 3 only; the {{discountCode}} placeholder is
 *     always left for the merchant's ESP merge tag / real code.
 *   - emailNumber: required, integer 1–3. NaN/Infinity rejected; anything
 *     else outside 1–3 is rejected with a human message (each email is a
 *     distinct template, so clamping would mislabel the email).
 *   - tone: one of the 4 fixed tones (default friendly).
 *
 * Output sanitization: user text interpolated into templates is HTML-escaped.
 * Placeholder tokens are never rendered empty — they stay as {{tokens}} with
 * a documented fallback list in placeholderList.
 */

export const TONES: readonly string[] = ["friendly", "warm", "professional", "playful"];
export const DEFAULT_TONE = "friendly";
export const MAX_INPUT_CHARS = 100;
export const MIN_EMAIL_NUMBER = 1;
export const MAX_EMAIL_NUMBER = 3;

/** Fixed label + send-timing note for each of the 3 emails. */
export const EMAIL_STAGES: readonly { label: string; timing: string }[] = [
  { label: "Reminder", timing: "send ~1 hour after abandonment" },
  { label: "Value / objection handling", timing: "send ~24 hours after abandonment" },
  { label: "Incentive + urgency", timing: "send ~48–72 hours after abandonment" },
];

/**
 * 3 fixed body templates (index 0 = email 1). Slots: {greeting}, {{firstName}},
 * {{storeName}}, {{productName}}, {{cartUrl}}, {{discountCode}}, {offerLine},
 * {signoff}. {{tokens}} are left intact for the merchant's ESP.
 */
export const TEMPLATES: readonly string[] = [
  // Email 1 — gentle reminder
  "{greeting}\n\nJust a friendly heads-up: you left {{productName}} in your cart at {{storeName}}.\n\nIt's still saved and waiting for you: {{cartUrl}}\n\nNo rush — but popular items do sell out. Complete your order here: {{cartUrl}}\n\n{signoff}",
  // Email 2 — value / objection handling
  "{greeting}\n\nStill thinking about {{productName}}? Totally fair — here's what other {{storeName}} shoppers asked before buying:\n\n• \"Is it worth it?\" — [one-line value answer]\n• \"What if it's not right for me?\" — [returns/guarantee answer]\n• \"How fast is shipping?\" — [shipping answer]\n\nYour cart is saved: {{cartUrl}}\n\nQuestions? Just reply to this email — a real human will answer.\n\n{signoff}",
  // Email 3 — incentive + urgency
  "{greeting}\n\nLast call on {{productName}} — your cart at {{storeName}} expires soon.\n\n{offerLine}Use code {{discountCode}} at checkout: {{cartUrl}}\n\nAfter this, your saved cart is released and the code stops working. Don't miss out.\n\n{signoff}",
];

/** 12 subject templates (3 emails x 4). Slots: {{productName}}, {{storeName}}. */
export const SUBJECTS: readonly (readonly string[])[] = [
  [
    "You left something behind…",
    "{{firstName}}, your {{productName}} is waiting",
    "Still want your {{productName}}?",
    "Your {{storeName}} cart is saved",
  ],
  [
    "Quick answers before you decide",
    "{{productName}}: worth it? (honest answers)",
    "Still on the fence about {{productName}}?",
    "What {{storeName}} shoppers ask us most",
  ],
  [
    "Last chance: {{productName}} + a little extra",
    "Your cart expires soon, {{firstName}}",
    "Don't let {{productName}} slip away",
    "Final call from {{storeName}}",
  ],
];

/** Placeholder tokens used in the templates, with documented meanings. */
export const PLACEHOLDERS: readonly string[] = [
  "{{firstName}} — the shopper's first name (falls back to \"there\" if unknown)",
  "{{storeName}} — your store name",
  "{{productName}} — the product left in the cart",
  "{{cartUrl}} — the link that restores the shopper's cart (from your ESP or platform)",
  "{{discountCode}} — the discount code for email 3 (replace with your real code)",
];

/** 12 greetings (4 tones x 3). */
export const GREETINGS: Record<string, readonly string[]> = {
  friendly: ["Hey {{firstName}},", "Hi {{firstName}},", "Hello {{firstName}},"],
  warm: ["A warm hello, {{firstName}},", "Hello {{firstName}},", "Hi there, {{firstName}},"],
  professional: ["Hello {{firstName}},", "Dear {{firstName}},", "Good day {{firstName}},"],
  playful: ["Hey hey, {{firstName}}!", "Oops — {{firstName}}, you forgot something!", "Psst… {{firstName}},"],
};

/** 8 sign-offs (4 tones x 2). {storeName} is filled at build time (single braces). */
export const SIGNOFFS: Record<string, readonly string[]> = {
  friendly: ["Cheers,\nThe {storeName} team", "Happy shopping,\n{storeName}"],
  warm: ["Warmly,\nThe {storeName} team", "With care,\n{storeName}"],
  professional: ["Best regards,\nThe {storeName} team", "Sincerely,\n{storeName}"],
  playful: ["Catch you at checkout,\nTeam {storeName}", "Happy cart-rescuing,\n{storeName}"],
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

/**
 * emailNumber must be the integer 1, 2, or 3. Each number selects a distinct
 * template, so out-of-range values are rejected (not clamped) to avoid
 * mislabeling which email the merchant is building.
 */
function validatedEmailNumber(raw: unknown): number {
  if (typeof raw === "undefined" || raw === null || raw === "") {
    throw new Error("Please choose which email to build: 1, 2, or 3.");
  }
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error("Email number must be 1, 2, or 3.");
  }
  if (n < MIN_EMAIL_NUMBER || n > MAX_EMAIL_NUMBER) {
    throw new Error("Email number must be 1, 2, or 3.");
  }
  return n;
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
  let storeName: string;
  let productName: string;
  let discountOffer: string;
  let emailNumber: number;
  let tone: string;
  try {
    storeName = requiredText(values, "storeName", "your store name");
    productName = requiredText(values, "productName", "the product name");
    discountOffer = optionalText(values, "discountOffer");
    emailNumber = validatedEmailNumber(values.emailNumber);
    tone = validatedTone(values.tone);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }

  storeName = escapeHtml(truncateWithNotice(storeName, "storeName", notices));
  productName = escapeHtml(truncateWithNotice(productName, "productName", notices));
  discountOffer = escapeHtml(truncateWithNotice(discountOffer, "discountOffer", notices));

  const idx = emailNumber - 1;
  const stage = EMAIL_STAGES[idx];
  const seed = hashStr(`${storeName}|${productName}|${emailNumber}|${tone}`);

  // {{firstName}} is intentionally NOT filled: it stays as a placeholder for
  // the merchant's ESP merge tag, with the documented fallback "there".
  const slots = {
    greeting: pick(GREETINGS[tone], seed),
    signoff: fill(pick(SIGNOFFS[tone], seed + 4), { storeName }),
    offerLine: discountOffer ? `${discountOffer}\n\n` : "",
  };

  let bodyTemplate = fill(TEMPLATES[idx], slots);
  if (emailNumber === 3 && !discountOffer) {
    notices.push(
      "Note: no discount offer was provided, so email 3 has no offer line — only the {{discountCode}} placeholder. Add your real offer before sending.",
    );
  }

  // Rotate the 4 subject options deterministically so different stores see
  // different orderings; all 4 are always returned.
  const bank = SUBJECTS[idx];
  const start = seed % bank.length;
  const subjectOptions: string[] = [];
  for (let k = 0; k < bank.length; k++) {
    subjectOptions.push(bank[(start + k) % bank.length]);
  }

  const dup = findRepeatedWord(bodyTemplate);
  if (dup) {
    notices.push(
      `Note: the template contains a repeated word ("${dup} ${dup}") — review the copy before sending.`,
    );
  }

  const valuesOut: Record<string, unknown> = {
    subjectOptions,
    bodyTemplate: `Email ${emailNumber} of 3 — ${stage.label} (${stage.timing}):\n\n${bodyTemplate}`,
    placeholderList: [...PLACEHOLDERS],
  };
  if (notices.length > 0) {
    valuesOut.notices = notices.join(" ");
  }
  return { ok: true, values: valuesOut };
}
