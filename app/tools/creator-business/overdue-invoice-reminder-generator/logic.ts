/**
 * Overdue Invoice Reminder Generator — pure logic (tool-468), zero
 * imports, zero network, zero DOM.
 *
 * HONESTY CONTRACT: fixed template assembly over 3 escalation levels
 * (polite | firm | final). The tool writes a reminder email draft only —
 * it does NOT send anything, add late fees, or make legal claims.
 * The "final" level suggests seeking independent advice; it never issues
 * legal threats (no mention of suing, court, or legal action).
 *
 * Word banks (documented sizes):
 *  - ESCALATION_LEVELS: 3 entries
 *  - Each level: 2 subject-line templates + 1 body template
 *    -> 6 subjects + 3 bodies total
 * Amounts are formatted with 2 decimals and no currency symbol: the
 * currency is whatever the user's invoice uses, and the tool never
 * assumes one.
 */

export const ESCALATION_LEVELS = ["polite", "firm", "final"] as const;

export type EscalationLevel = (typeof ESCALATION_LEVELS)[number];

export const DEFAULT_ESCALATION_LEVEL: EscalationLevel = "polite";
export const MAX_FIELD_CHARS = 300;

/** Subject-line banks: 2 fixed templates per escalation level. */
const SUBJECT_TEMPLATES: Record<EscalationLevel, string[]> = {
  polite: [
    "Friendly reminder: invoice {invoiceNumber} ({amountDue})",
    "Quick nudge on invoice {invoiceNumber}",
  ],
  firm: [
    "Payment overdue: invoice {invoiceNumber} — {daysOverdue} days",
    "Action needed: {amountDue} outstanding on invoice {invoiceNumber}",
  ],
  final: [
    "Final reminder: invoice {invoiceNumber} ({amountDue})",
    "Outstanding invoice {invoiceNumber} — please respond",
  ],
};

/** Body templates: 1 fixed template per escalation level. */
const BODY_TEMPLATES: Record<EscalationLevel, string> = {
  polite: [
    "Hi {clientName},",
    "",
    "I hope you're well. I'm writing with a friendly reminder that invoice {invoiceNumber} for {amountDue} was due {daysOverdue} days ago.",
    "",
    "If the payment is already on its way, please ignore this note. Otherwise, I'd appreciate it if you could take care of it this week.",
    "",
    "Thanks so much,",
    "{senderFallback}",
  ].join("\n"),
  firm: [
    "Hi {clientName},",
    "",
    "I'm following up on invoice {invoiceNumber} for {amountDue}, which is now {daysOverdue} days overdue.",
    "",
    "Could you please confirm when I can expect payment? If there's an issue with the invoice or your payment process, let me know and we can sort it out.",
    "",
    "I'd like to resolve this promptly so we can keep working together smoothly.",
    "",
    "Regards,",
    "{senderFallback}",
  ].join("\n"),
  final: [
    "Hi {clientName},",
    "",
    "This is a final reminder that invoice {invoiceNumber} for {amountDue} remains unpaid {daysOverdue} days after the due date.",
    "",
    "Please arrange payment within 7 days, or reply with a concrete payment date. If I don't hear from you, I may need to seek independent advice on my options for recovering the amount.",
    "",
    "I'd much rather resolve this directly — please get in touch.",
    "",
    "Regards,",
    "{senderFallback}",
  ].join("\n"),
};

export interface ReminderInput {
  clientName?: unknown;
  invoiceNumber?: unknown;
  amountDue?: unknown;
  daysOverdue?: unknown;
  escalationLevel?: unknown;
  senderName?: unknown;
}

export interface RunResult {
  ok: boolean;
  values?: { reminderEmailDraft: string };
  error?: string;
}

/** Trim, strip HTML tags + control chars, collapse whitespace, cap length. */
export function sanitize(value: unknown, maxChars: number = MAX_FIELD_CHARS): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars);
}

/** Normalize escalationLevel; unknown/empty -> polite. */
export function normalizeEscalationLevel(value: unknown): EscalationLevel {
  const v = sanitize(value).toLowerCase();
  const found = (ESCALATION_LEVELS as readonly string[]).find((l) => l === v);
  return (found as EscalationLevel | undefined) ?? DEFAULT_ESCALATION_LEVEL;
}

/**
 * Parse a money amount: accepts numbers or numeric strings; must be
 * finite and >= 0. Returns { amount, error }.
 */
export function parseAmount(value: unknown): { amount: number; error: string | null } {
  const v = typeof value === "number" ? value : sanitize(String(value ?? ""));
  if (v === "" || v === null) {
    return { amount: 0, error: "Please enter the amount due." };
  }
  const n = typeof v === "number" ? v : Number(v);
  if (typeof v !== "number" && !/^\d+(\.\d+)?$/.test(v)) {
    return { amount: 0, error: "Amount due must be a number (e.g. 250 or 250.00)." };
  }
  if (!Number.isFinite(n)) {
    return { amount: 0, error: "Amount due must be a finite number." };
  }
  if (n < 0) {
    return { amount: 0, error: "Amount due cannot be negative." };
  }
  return { amount: n, error: null };
}

/**
 * Parse days overdue: accepts numbers or integer strings; must be a
 * finite integer >= 0. Returns { days, error }.
 */
export function parseDaysOverdue(value: unknown): { days: number; error: string | null } {
  const v = typeof value === "number" ? value : sanitize(String(value ?? ""));
  if (v === "" || v === null) {
    return { days: 0, error: "Please enter how many days overdue the invoice is." };
  }
  if (typeof v !== "number" && !/^\d+$/.test(v)) {
    return { days: 0, error: "Days overdue must be a whole number (e.g. 14)." };
  }
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { days: 0, error: "Days overdue must be a whole number (e.g. 14)." };
  }
  if (n < 0) {
    return { days: 0, error: "Days overdue cannot be negative." };
  }
  return { days: n, error: null };
}

/** Format an amount with thousands separators and 2 decimals, no currency symbol. */
export function formatAmount(n: number): string {
  const [int, dec] = n.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${dec}`;
}

/**
 * Assemble the full draft: 2 subject options + a send-ready body that
 * opens with the recommended subject line.
 */
export function assembleDraft(input: {
  clientName: string;
  invoiceNumber: string;
  amountDue: number;
  daysOverdue: number;
  escalationLevel: EscalationLevel;
  senderName: string;
}): string {
  const vars: Record<string, string> = {
    clientName: input.clientName,
    invoiceNumber: input.invoiceNumber,
    amountDue: formatAmount(input.amountDue),
    daysOverdue: String(input.daysOverdue),
    senderFallback: input.senderName === "" ? "[Your name]" : input.senderName,
  };
  const fill = (t: string): string => t.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

  const subjects = SUBJECT_TEMPLATES[input.escalationLevel].map(fill);
  const body = fill(BODY_TEMPLATES[input.escalationLevel]);

  return [
    "SUBJECT OPTIONS (pick one):",
    ...subjects.map((s, i) => `${i + 1}. ${s}`),
    "",
    "---",
    "",
    "EMAIL BODY:",
    "",
    `Subject: ${subjects[0]}`,
    "",
    body,
    "",
    "---",
    "Note: this is a draft reminder only — the tool does not send emails,",
    "add late fees, or take any legal position on your behalf.",
  ].join("\n");
}

/** Tool entry point. */
export function runTool(values: Record<string, unknown>): RunResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide the invoice details." };
  }
  const v = values as ReminderInput;

  const clientName = sanitize(v.clientName);
  if (clientName === "") {
    return { ok: false, error: "Please enter the client name." };
  }
  const invoiceNumber = sanitize(v.invoiceNumber);
  if (invoiceNumber === "") {
    return { ok: false, error: "Please enter the invoice number." };
  }
  const amount = parseAmount(v.amountDue);
  if (amount.error) {
    return { ok: false, error: amount.error };
  }
  const days = parseDaysOverdue(v.daysOverdue);
  if (days.error) {
    return { ok: false, error: days.error };
  }

  const escalationLevel = normalizeEscalationLevel(v.escalationLevel);
  const senderName = sanitize(v.senderName);

  const reminderEmailDraft = assembleDraft({
    clientName,
    invoiceNumber,
    amountDue: amount.amount,
    daysOverdue: days.days,
    escalationLevel,
    senderName,
  });

  return { ok: true, values: { reminderEmailDraft } };
}
