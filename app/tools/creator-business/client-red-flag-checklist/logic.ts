/**
 * Client Red Flag Checklist (tool-486) — pure engine.
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * HONESTY: this is COUNT-BASED SCORING over user-selected signals. The user
 * picks which observable warning signs apply from a fixed list; the tool
 * adds up their fixed weights and applies a fixed band rule. No AI, no
 * external data, no prediction — the score is an organizing aid for the
 * freelancer's own judgment, not a forecast of the client's behavior.
 *
 * SIGNAL BANK: 24 fixed signals, each with a fixed severity weight (1-3).
 * Weights and bands are arbitrary fixed rules chosen by the tool author,
 * documented here and in meta.ts `methodology`. They are NOT calibrated
 * against real outcomes.
 *
 *   riskScore = sum of the weights of the matched signals.
 *   riskBand : 0-2 -> "Low" | 3-6 -> "Caution" | 7+ -> "High".
 *
 * EDGE CASES (from spec): signals are the user's own subjective
 * observations — the output is explicitly labeled "your assessment aid, not
 * a factual claim about the client". Signal labels describe observable
 * behaviors, not accusations; no defamation-adjacent language.
 */

export interface RedFlagSignal {
  /** lowercase-kebab stable id. */
  id: string;
  /** Observable behavior, phrased neutrally (what the freelancer saw). */
  label: string;
  /** Fixed severity weight 1 (mild) .. 3 (serious). */
  weight: 1 | 2 | 3;
}

/** Fixed bank of 24 curated red-flag signals. */
export const SIGNALS: RedFlagSignal[] = [
  { id: "no-written-contract", label: "Client refuses to sign a written contract or agreement", weight: 3 },
  { id: "free-spec-work", label: "Asks for free trial work or unpaid 'spec' work before hiring", weight: 3 },
  { id: "pressure-start-no-deposit", label: "Pressures you to start work before any deposit is paid", weight: 3 },
  { id: "late-payment-history", label: "Known to have paid other freelancers late or not at all", weight: 3 },
  { id: "exposure-payment", label: "Offers 'exposure' or vague future work instead of real payment", weight: 3 },
  { id: "equity-only", label: "Wants to pay only in equity or revenue share, with no cash", weight: 3 },
  { id: "payment-terms-changed", label: "Changes payment terms after you already agreed on them", weight: 3 },
  { id: "payment-excuses", label: "Repeated payment excuses: expired cards, 'accounting delays'", weight: 3 },
  { id: "dishonest-requests", label: "Asks you to mislead others: fake reviews, fake stats, fake testimonials", weight: 3 },
  { id: "copy-competitor", label: "Asks you to copy a competitor's work outright", weight: 3 },
  { id: "scope-creep", label: "Expands the scope after the price was already agreed", weight: 2 },
  { id: "vague-requirements", label: "Requirements are vague and keep shifting", weight: 2 },
  { id: "ghosts-then-urgent", label: "Goes silent for days, then demands instant turnaround", weight: 2 },
  { id: "rate-hostility", label: "Aggressively disputes or disrespects your rates", weight: 2 },
  { id: "no-decision-maker", label: "No clear decision-maker — approvals stall or get reversed", weight: 2 },
  { id: "unlimited-revisions", label: "Insists on unlimited revisions in the agreement", weight: 2 },
  { id: "all-hours-expectation", label: "Expects instant replies at all hours, including nights", weight: 2 },
  { id: "trashes-previous-freelancers", label: "Bad-mouths every freelancer they worked with before", weight: 2 },
  { id: "demands-source-files-early", label: "Demands source files or your full process before payment", weight: 2 },
  { id: "skips-discovery", label: "Rushes you to skip questions, discovery, or onboarding", weight: 2 },
  { id: "no-assets-on-time", label: "Never delivers brand assets or logins on time", weight: 1 },
  { id: "no-team-access", label: "Won't introduce you to the team you would work with", weight: 1 },
  { id: "secretive-goal", label: "Overly secretive about the business or the project goal", weight: 1 },
  { id: "starts-tomorrow-no-brief", label: "Wants you to start tomorrow with no brief at all", weight: 1 },
];

/** Generic, informational next steps — the same fixed list for every run. */
export const NEXT_STEPS: string[] = [
  "Put scope, timeline, deliverables, and payment terms in a written agreement before starting any work.",
  "Ask for a deposit before work begins (30-50% is a common starting point; adjust to your own comfort).",
  "Set a revision limit and a late-payment clause in writing.",
  "Keep all decisions, changes, and approvals in email or chat — never verbal-only.",
  "Slow down when you feel rushed: pressure to skip steps is itself a signal worth noting.",
];

export const DISCLAIMER: string =
  "This checklist is your personal assessment aid based on signals you observed " +
  "— it is not a factual claim about the client, not a prediction of how they will " +
  "behave, and not legal or financial advice. Only you can decide whether to take " +
  "on a client.";

export const MAX_NOTES_LENGTH = 2000;

export interface RedFlagResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const BANDS: Array<{ max: number; band: string }> = [
  { max: 2, band: "Low" },
  { max: 6, band: "Caution" },
  { max: Number.POSITIVE_INFINITY, band: "High" },
];

function weightLabel(weight: number): string {
  return weight === 3 ? "High" : weight === 2 ? "Medium" : "Low";
}

function parseSignals(raw: unknown): string[] {
  let entries: string[];
  if (Array.isArray(raw)) {
    entries = raw.map((entry) => String(entry));
  } else if (typeof raw === "string") {
    entries = raw.split(/[\n,;]+/);
  } else {
    return [];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of entries) {
    const key = entry.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

/**
 * Generator entry point. Input: { observedSignals: string[] | string,
 * notes?: string }. Output ids: riskScore, riskBand, flaggedSignals,
 * nextSteps, disclaimer.
 */
export function runTool(values: Record<string, unknown>): RedFlagResult {
  const keys = parseSignals(values["observedSignals"]);
  if (keys.length === 0) {
    return {
      ok: false,
      error: "Select at least one observed signal from the curated list to run the checklist.",
    };
  }

  const matched: RedFlagSignal[] = [];
  const unknown: string[] = [];
  for (const key of keys) {
    const signal = SIGNALS.find(
      (s) => s.id === key || s.label.toLowerCase() === key,
    );
    if (signal) {
      matched.push(signal);
    } else {
      unknown.push(key);
    }
  }
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Unrecognized signal${unknown.length > 1 ? "s" : ""}: "${unknown.join('", "')}". Choose from the curated signal list.`,
    };
  }

  const notesRaw = values["notes"];
  let notes = "";
  if (notesRaw !== undefined && notesRaw !== null && String(notesRaw).trim() !== "") {
    notes = String(notesRaw).trim();
    if (notes.length > MAX_NOTES_LENGTH) {
      return {
        ok: false,
        error: `Notes are too long (${notes.length} characters). Keep notes under ${MAX_NOTES_LENGTH} characters.`,
      };
    }
  }

  const riskScore = matched.reduce((sum, s) => sum + s.weight, 0);
  const riskBand = BANDS.find((b) => riskScore <= b.max)?.band ?? "High";

  const flaggedSignals = matched.map(
    (s) => `[${weightLabel(s.weight)} weight] ${s.label}`,
  );

  return {
    ok: true,
    values: {
      riskScore,
      riskBand,
      flaggedSignals,
      nextSteps: [...NEXT_STEPS],
      disclaimer: DISCLAIMER,
    },
  };
}
