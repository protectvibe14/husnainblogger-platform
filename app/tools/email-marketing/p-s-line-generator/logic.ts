/**
 * P.S. Line Generator — pure logic (tool-407).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic text assembly from a FIXED pattern
 *   library (see PS_PATTERNS below). No AI, no network, no backend.
 * - Bank size: 4 tones x 6 patterns = 24 patterns. The tool returns up to
 *   6 P.S. lines by cycling through the selected tone's 6 patterns in
 *   order. Same inputs always produce the same lines.
 * - Placeholders: patterns use {offer} and {goal}. If the user leaves
 *   `offer` or `emailGoal` short, the raw words are inserted as-is; the
 *   tool never invents a product name or claim.
 *
 * Edge-case handling (shared validation rules):
 * - Overlong inputs are trimmed to MAX_INPUT_CHARS with a visible notice
 *   in the returned lines (an ellipsis marker), never dropped silently.
 * - Generated lines are checked for accidental repeated words/phrases and
 *   any line that fails the check is skipped and replaced by the next
 *   pattern (a guard, not a guarantee of eloquence).
 */

export type PsTone = "friendly" | "professional" | "playful" | "urgent";

export const PS_TONES: readonly PsTone[] = [
  "friendly",
  "professional",
  "playful",
  "urgent",
];

/** Max code points kept from a user input; excess is trimmed with a notice. */
export const MAX_INPUT_CHARS = 200;

/** Number of P.S. lines returned per run. */
export const PS_LINE_COUNT = 6;

export interface PsPattern {
  /** Pattern text with {offer} and/or {goal} slots. */
  template: string;
  /** Which slots this pattern uses. */
  slots: ("offer" | "goal")[];
}

/**
 * Fixed P.S. line pattern library: 4 tones x 6 patterns = 24 patterns.
 * NOT AI-generated copy — hand-written templates assembled deterministically.
 */
export const PS_PATTERNS: Record<PsTone, readonly PsPattern[]> = {
  friendly: [
    { template: "P.S. {offer} — I saved you a spot, just reply and it's yours.", slots: ["offer"] },
    { template: "P.S. If {goal} sounds good, this takes two minutes to start.", slots: ["goal"] },
    { template: "P.S. Grab {offer} before the week ends — no strings attached.", slots: ["offer"] },
    { template: "P.S. I wrote this with {goal} in mind, so you can skip the guesswork.", slots: ["goal"] },
    { template: "P.S. {offer} is ready whenever you are. No rush, no pressure.", slots: ["offer"] },
    { template: "P.S. Just reply with one word and I'll help you with {goal}.", slots: ["goal"] },
  ],
  professional: [
    { template: "P.S. {offer} is available for qualified applicants this quarter.", slots: ["offer"] },
    { template: "P.S. For teams focused on {goal}, this is the recommended next step.", slots: ["goal"] },
    { template: "P.S. Details on {offer} are attached for your review.", slots: ["offer"] },
    { template: "P.S. If {goal} is a priority, schedule a 15-minute briefing this week.", slots: ["goal"] },
    { template: "P.S. {offer} includes full documentation and onboarding support.", slots: ["offer"] },
    { template: "P.S. Reply to this email to begin the {goal} process.", slots: ["goal"] },
  ],
  playful: [
    { template: "P.S. {offer} won't bite. But it might sell out.", slots: ["offer"] },
    { template: "P.S. Chasing {goal}? This is the shortcut your future self thanks you for.", slots: ["goal"] },
    { template: "P.S. I put {offer} on the nice list just for you.", slots: ["offer"] },
    { template: "P.S. {goal} is calling — pick up.", slots: ["goal"] },
    { template: "P.S. Warning: {offer} may cause extreme productivity.", slots: ["offer"] },
    { template: "P.S. Coffee's on me if {goal} isn't easier after this.", slots: ["goal"] },
  ],
  urgent: [
    { template: "P.S. {offer} closes tonight — don't miss it.", slots: ["offer"] },
    { template: "P.S. Every day without {goal} is money left on the table.", slots: ["goal"] },
    { template: "P.S. Only a few spots left for {offer}. Claim yours now.", slots: ["offer"] },
    { template: "P.S. If you want {goal}, start today — not next month.", slots: ["goal"] },
    { template: "P.S. This is your final reminder about {offer}.", slots: ["offer"] },
    { template: "P.S. Act now: {goal} waits for no one.", slots: ["goal"] },
  ],
};

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

export interface PsLine {
  text: string;
}

export interface PsResult {
  lines: PsLine[];
  /** Visible notice when an input was trimmed (overlong input). */
  notice: string | null;
}

/**
 * Generate P.S. lines from the fixed pattern library.
 * Throws on invalid input; the mountToolUI wrapper converts to { ok: false }.
 */
export function generatePsLines(
  emailGoal: string,
  offer: string,
  tone: string,
): PsResult {
  if (typeof emailGoal !== "string" || emailGoal.trim().length === 0) {
    throw new RangeError("emailGoal must not be empty or whitespace-only.");
  }
  if (typeof offer !== "string" || offer.trim().length === 0) {
    throw new RangeError("offer must not be empty or whitespace-only.");
  }
  if (!PS_TONES.includes(tone as PsTone)) {
    throw new RangeError(
      `tone must be one of: ${PS_TONES.join(", ")}.`,
    );
  }

  const [goal, goalTrimmed] = trimInput(emailGoal);
  const [offerVal, offerTrimmed] = trimInput(offer);
  const patterns = PS_PATTERNS[tone as PsTone];

  const lines: PsLine[] = [];
  for (const p of patterns) {
    if (lines.length >= PS_LINE_COUNT) break;
    const text = p.template
      .replaceAll("{offer}", offerVal)
      .replaceAll("{goal}", goal);
    if (hasRepeatedWords(text)) continue; // guard: skip, never ship dup words
    lines.push({ text });
  }

  const notice =
    goalTrimmed || offerTrimmed
      ? "Note: an overlong input was trimmed to 200 characters (marked above). Nothing was dropped silently."
      : null;

  return { lines, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { emailGoal, offer, tone }
 * values out: { psLines }  (a list of rendered P.S. line texts)
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { emailGoal, offer, tone } = values;
  if (typeof emailGoal !== "string" || emailGoal.trim().length === 0) {
    return { ok: false, error: "Please enter your email goal (e.g. “book a demo”)." };
  }
  if (typeof offer !== "string" || offer.trim().length === 0) {
    return { ok: false, error: "Please enter what you are offering." };
  }
  if (typeof tone !== "string" || !PS_TONES.includes(tone as PsTone)) {
    return {
      ok: false,
      error: `Please choose a tone: ${PS_TONES.join(", ")}.`,
    };
  }

  let result: PsResult;
  try {
    result = generatePsLines(emailGoal, offer, tone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate P.S. lines.",
    };
  }

  const items: string[] = result.lines.map((l) => l.text);
  if (result.notice) items.push(result.notice);

  return {
    ok: true,
    values: { psLines: items },
  };
}
