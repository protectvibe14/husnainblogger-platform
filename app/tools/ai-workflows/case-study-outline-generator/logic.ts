/**
 * Case Study Outline Generator (tool-339) — pure logic, zero imports.
 *
 * HONESTY: this is a FIXED TEMPLATE outline builder, not AI. It assembles a
 * case-study skeleton from fixed headline formulas and fixed section
 * templates. It NEVER invents client results, metrics, names, or quotes —
 * every unknowable fact is a [PROOF NEEDED] placeholder the user must fill
 * with verified data before publishing.
 *
 * Fixed word banks (documented per contract):
 *   - HEADLINE_FORMULAS: 4 headline formulas
 *   - CHALLENGE_OPENERS: 3 challenge-section framing lines
 *   - CTA_LINES:         3 call-to-action lines
 * Selection is deterministic: a simple string hash of the normalized
 * client type picks the bank entries, so the same inputs always produce
 * the same outline.
 *
 * Contract: runTool(values) -> { ok, values, error }.
 * values in:  { clientType (required), industry?, knownResult? }
 * values out: { outline (copy text), sections (list of section names) }
 */

export const HEADLINE_FORMULAS: readonly string[] = [
  "Case Study: From [CHALLENGE] to [OUTCOME] — A [CLIENT TYPE] Success Story",
  "How [CLIENT TYPE] Solved [PROBLEM] with [SOLUTION NAME]",
  "[OUTCOME] in [TIMEFRAME]: Inside [CLIENT NAME]'s Turnaround",
  "The [CLIENT TYPE] Playbook: From [PROBLEM] to [OUTCOME]",
] as const;

export const CHALLENGE_OPENERS: readonly string[] = [
  "Start with the single most painful symptom the client described in their own words.",
  "Quantify the cost of doing nothing: lost revenue, wasted hours, or missed opportunities.",
  "Name the previous attempts that failed — this sets up why your solution was different.",
] as const;

export const CTA_LINES: readonly string[] = [
  "End with one action: book a call, request a quote, or download the full breakdown.",
  "Mirror the client's win: invite readers who face the same problem to start the same process.",
  "Keep the CTA about the reader's next step, not about you — one sentence, one button.",
] as const;

export interface CaseStudyOutlineResult {
  ok: boolean;
  values?: { outline: string; sections: string[] };
  error?: string;
}

/** Deterministic hash: same string -> same non-negative integer. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function cleanField(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, max);
}

/**
 * Build the fixed case-study outline. Returns { ok: false, error } when
 * clientType is missing or invalid.
 */
export function runTool(values: Record<string, unknown>): CaseStudyOutlineResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter your client type to build the outline." };
  }

  const clientType = cleanField(values.clientType, 120);
  if (!clientType) {
    return {
      ok: false,
      error:
        "Client type is required — for example: dental clinic, SaaS startup, real estate agency.",
    };
  }

  const industry = cleanField(values.industry, 120);
  const knownResult = cleanField(values.knownResult, 200);

  const key = clientType.toLowerCase();
  const headline = HEADLINE_FORMULAS[hashString(key) % HEADLINE_FORMULAS.length];
  const challengeOpener = CHALLENGE_OPENERS[hashString("c:" + key) % CHALLENGE_OPENERS.length];
  const cta = CTA_LINES[hashString("t:" + key) % CTA_LINES.length];

  const resultLine = knownResult
    ? `Verified result you reported: ${knownResult}`
    : "[PROOF NEEDED] Insert the real, verified result here. Never publish an invented number.";

  const industryLine = industry ? `Industry: ${industry}` : "Industry: [INDUSTRY]";

  const sections: string[] = [
    "1. Headline",
    "2. Subheading",
    "3. Client snapshot",
    "4. The challenge",
    "5. The solution",
    "6. Implementation timeline",
    "7. Results (verified data only)",
    "8. Client quote",
    "9. Call to action",
  ];

  const lines: string[] = [
    "CASE STUDY OUTLINE",
    "Client type: " + clientType,
    industryLine,
    "",
    "1. HEADLINE (pick one, then fill the brackets)",
    headline.replace("[CLIENT TYPE]", clientType),
    "",
    "2. SUBHEADING",
    `One sentence on what changed for this ${clientType}, and for whom this case study is proof.`,
    "",
    "3. CLIENT SNAPSHOT",
    "Client: [CLIENT NAME] — [LOCATION / SIZE].",
    industryLine + ".",
    "Starting point: what the business looked like before the engagement.",
    "",
    "4. THE CHALLENGE",
    challengeOpener,
    "State the problem in 2-3 specific bullets: what was broken, who felt it, what it cost.",
    "",
    "5. THE SOLUTION",
    "What you delivered, in plain language: the service, product, or process.",
    "Why this approach fit this client's problem (not a feature list).",
    "",
    "6. IMPLEMENTATION TIMELINE",
    "Week-by-week or phase-by-phase: what happened, in order.",
    "Call out one decision that made the difference.",
    "",
    "7. RESULTS (VERIFIED DATA ONLY)",
    resultLine,
    "[PROOF NEEDED] Metric 1 (e.g. revenue, leads, hours saved): real number + timeframe + source.",
    "[PROOF NEEDED] Metric 2: real number + timeframe + source.",
    "[PROOF NEEDED] Metric 3: real number + timeframe + source.",
    "Never publish a case study with invented metrics — placeholders stay until you verify.",
    "",
    "8. CLIENT QUOTE",
    '[PROOF NEEDED] One real quote from the client, with their name and role, approved for publication.',
    "",
    "9. CALL TO ACTION",
    cta,
    "",
    "HONESTY CHECK BEFORE PUBLISHING:",
    "- Every [PROOF NEEDED] placeholder is replaced with verified client data.",
    "- The client has approved the draft and the quote in writing.",
    "- No metrics, dates, or outcomes were invented or rounded up.",
  ];

  return { ok: true, values: { outline: lines.join("\n"), sections } };
}
