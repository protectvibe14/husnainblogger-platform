/**
 * Rate Negotiation Email Generator — pure logic (tool-466).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Deterministic template assembly
 *   from 3 FIXED tone templates (firm, friendly, walk-away). Nothing is
 *   written by AI — every sentence comes from the template bank with the
 *   user's values interpolated.
 * - The tool generates a DRAFT (subject + body) the user must edit before
 *   sending. It never sends email — sending is out of scope.
 * - If counterOffer < currentOffer, the draft is flagged as a CONCESSION
 *   (still generated).
 * - Money is formatted as USD (e.g. $1,500.00) with a fixed formatter —
 *   thousands grouped, two decimals. No FX conversion.
 * - valuePoints accepts a string[] or a newline/semicolon-separated string.
 * - runTool validates every input and returns { ok:false, error } with a
 *   human-readable message on any invalid or missing input.
 */

export const TONES = ["firm", "friendly", "walk-away"] as const;
export type NegotiationTone = (typeof TONES)[number];

/** Fixed formatter: $1,234.50 — no locale dependence. */
export function formatMoney(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const cents = Math.round(abs * 100);
  const dollars = Math.floor(cents / 100);
  const centPart = String(cents % 100).padStart(2, "0");
  const grouped = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${grouped}.${centPart}`;
}

function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

/** Accept a string[] or a newline/semicolon-separated string. */
export function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? "").trim()).filter((v) => v !== "");
  }
  if (typeof value === "string") {
    return value
      .split(/[\r\n]+/)
      .flatMap((line) => line.split(";"))
      .map((v) => v.trim())
      .filter((v) => v !== "");
  }
  return [];
}

export interface NegotiationInputs {
  clientName: string;
  yourName: string;
  currentOffer: number;
  counterOffer: number;
  tone: NegotiationTone;
  valuePoints: string[];
}

const SUBJECTS: Record<NegotiationTone, string> = {
  firm: "Re: Project fee — my rate proposal",
  friendly: "Quick chat about the project rate?",
  "walk-away": "Thank you — I'll have to pass on this one",
};

export function generateEmail(input: NegotiationInputs): string {
  const { clientName, yourName, currentOffer, counterOffer, tone, valuePoints } =
    input;

  const current = formatMoney(currentOffer);
  const counter = formatMoney(counterOffer);
  const isConcession = counterOffer < currentOffer;
  const isRaise = counterOffer > currentOffer;

  const valueBlock =
    valuePoints.length > 0
      ? [
          "",
          "What this rate reflects:",
          ...valuePoints.map((p) => `- ${p}`),
        ].join("\n")
      : "";

  const concessionNote = isConcession
    ? `\n\n(Flagged as a concession: your counter of ${counter} is below their offer of ${current}.)`
    : "";

  let body: string;
  if (tone === "firm") {
    body = [
      `Hi ${clientName},`,
      "",
      `Thanks for the offer of ${current}. After reviewing the scope, my rate for this project is ${counter}${isRaise ? ` — ${formatMoney(counterOffer - currentOffer)} above your offer` : ""}.`,
      "",
      "I'm confident in the value I'll deliver, and I'd rather be upfront about my rate than cut corners on quality.",
      valueBlock,
      "",
      "If this works, I'm happy to get started this week. If not, I completely understand — happy to revisit if the budget changes.",
      "",
      `Best,`,
      yourName,
      concessionNote,
    ]
      .filter((s) => s !== "")
      .join("\n")
      .trimEnd();
  } else if (tone === "friendly") {
    body = [
      `Hi ${clientName},`,
      "",
      `Really excited about this project! I wanted to talk through the rate — your offer of ${current} is a little under where I can comfortably do my best work, so I'd love to land at ${counter}.`,
      "",
      "Here's what I bring to the table:",
      valueBlock,
      "",
      "I'm flexible on structure (milestones, net terms, phased delivery) if that helps us meet in the middle. What do you think?",
      "",
      `Thanks so much,`,
      yourName,
      concessionNote,
    ]
      .filter((s) => s !== "")
      .join("\n")
      .trimEnd();
  } else {
    body = [
      `Hi ${clientName},`,
      "",
      `Thank you for thinking of me and for the offer of ${current}. I've looked at the scope carefully, and ${counter} is the minimum I can accept while delivering the quality this project deserves.`,
      "",
      "I don't want to take on work at a rate where I can't give it my best, so I'll have to pass for now. The door is always open if the budget changes down the line.",
      valueBlock,
      "",
      `Wishing you a great launch,`,
      yourName,
      concessionNote,
    ]
      .filter((s) => s !== "")
      .join("\n")
      .trimEnd();
  }

  return `Subject: ${SUBJECTS[tone]}\n\n${body}`;
}

export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const clientName = nonEmpty(values.clientName);
  if (!clientName) {
    return { ok: false, error: "Enter the client name." };
  }
  const yourName = nonEmpty(values.yourName);
  if (!yourName) {
    return { ok: false, error: "Enter your name (the email signature)." };
  }
  const currentOffer = coerceNumber(values.currentOffer);
  if (currentOffer === null || currentOffer < 0) {
    return {
      ok: false,
      error: "Enter the client's current offer as a number of 0 or more.",
    };
  }
  const counterOffer = coerceNumber(values.counterOffer);
  if (counterOffer === null || counterOffer < 0) {
    return {
      ok: false,
      error: "Enter your counter offer as a number of 0 or more.",
    };
  }
  const tone = String(values.tone ?? "").trim();
  if (!(TONES as readonly string[]).includes(tone)) {
    return {
      ok: false,
      error: "Select a tone: firm, friendly, or walk-away.",
    };
  }
  const valuePoints = parseList(values.valuePoints);

  return {
    ok: true,
    values: {
      negotiationEmailDraft: generateEmail({
        clientName,
        yourName,
        currentOffer,
        counterOffer,
        tone: tone as NegotiationTone,
        valuePoints,
      }),
    },
  };
}
