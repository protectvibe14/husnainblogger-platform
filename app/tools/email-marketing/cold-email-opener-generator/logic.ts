/**
 * Cold Email Opener Generator — pure logic (tool-409).
 *
 * WHAT THIS IS (honesty, enforced):
 * - OPENERS ONLY: generates first-line opener options for a cold email,
 *   not full sequences, follow-ups, or sending infrastructure.
 * - Pure client-side deterministic text assembly from a FIXED pattern
 *   library (see OPENER_PATTERNS below). No AI, no network, no backend.
 * - Bank size: 4 tones x 6 patterns = 24 patterns. Returns up to 6 openers
 *   by cycling the selected tone's 6 patterns in order. Same inputs always
 *   produce the same openers.
 * - Every pattern carries a `personalizationSlot` — a token like
 *   {{company}} that the user MUST replace with real, verified information
 *   about the actual prospect. The tool never verifies prospect data.
 *
 * COMPLIANCE (CAN-SPAM / GDPR caution): this tool cannot verify that you
 * have consent or a legitimate basis to contact anyone. YOU are responsible
 * for complying with CAN-SPAM, GDPR, CASL, and any other applicable law:
 * identify yourself, include a real postal address where required, honor
 * opt-outs promptly, and do not email purchased or scraped lists. The
 * caution ships in the UI copy (meta assumptions/methodology) and is
 * restated here because the tool cannot enforce it.
 *
 * Edge-case handling (shared validation rules):
 * - Overlong inputs are trimmed to MAX_INPUT_CHARS with a visible notice
 *   in the output, never dropped silently.
 * - Generated lines are guarded against accidental repeated adjacent words.
 */

export type OpenerTone = "friendly" | "professional" | "playful" | "direct";

export const OPENER_TONES: readonly OpenerTone[] = [
  "friendly",
  "professional",
  "playful",
  "direct",
];

/** Max code points kept from a user input; excess is trimmed with a notice. */
export const MAX_INPUT_CHARS = 200;

/** Number of openers returned per run. */
export const OPENER_COUNT = 6;

export interface OpenerPattern {
  /** Pattern text with {context} and/or {industry} slots. */
  template: string;
  /** The token the user must replace with real prospect info. */
  personalizationSlot: string;
  /** Which slots this pattern uses. */
  slots: ("context" | "industry")[];
}

/**
 * Fixed opener pattern library: 4 tones x 6 patterns = 24 patterns.
 * Hand-written templates assembled deterministically — NOT AI copy.
 */
export const OPENER_PATTERNS: Record<OpenerTone, readonly OpenerPattern[]> = {
  friendly: [
    { template: "I noticed {context} — congrats on the progress at {{company}}.", personalizationSlot: "{{company}}", slots: ["context"] },
    { template: "Your work in {industry} stood out, {{firstName}} — especially {context}.", personalizationSlot: "{{firstName}}", slots: ["industry", "context"] },
    { template: "Saw your recent post about {context} and had to reach out.", personalizationSlot: "{{recentPost}}", slots: ["context"] },
    { template: "Quick question about how {context} fits into your plans at {{company}}.", personalizationSlot: "{{company}}", slots: ["context"] },
    { template: "{{firstName}}, most {industry} teams I talk to struggle with the same thing you're solving.", personalizationSlot: "{{firstName}}", slots: ["industry"] },
    { template: "Loved what {{company}} did with {context} — wanted to share an idea.", personalizationSlot: "{{company}}", slots: ["context"] },
  ],
  professional: [
    { template: "I'm reaching out because {context} suggests {{company}} is investing in growth.", personalizationSlot: "{{company}}", slots: ["context"] },
    { template: "{{firstName}}, your team's approach to {context} in {industry} is notable.", personalizationSlot: "{{firstName}}", slots: ["context", "industry"] },
    { template: "Given {{company}}'s recent focus on {context}, this seemed worth a brief note.", personalizationSlot: "{{company}}", slots: ["context"] },
    { template: "I work with {industry} teams on challenges like {context} — a quick thought.", personalizationSlot: "{{role}}", slots: ["industry", "context"] },
    { template: "{{mutualConnection}} mentioned your work on {context} — impressive.", personalizationSlot: "{{mutualConnection}}", slots: ["context"] },
    { template: "Noticed {{company}}'s {industry} expansion; {context} caught my attention.", personalizationSlot: "{{company}}", slots: ["industry", "context"] },
  ],
  playful: [
    { template: "I promise this isn't another boring cold email, {{firstName}} — {context} genuinely impressed me.", personalizationSlot: "{{firstName}}", slots: ["context"] },
    { template: "{{company}}'s take on {context} deserves a standing ovation. Or at least this email.", personalizationSlot: "{{company}}", slots: ["context"] },
    { template: "Confession: I stalked your {industry} content for 10 minutes before writing this.", personalizationSlot: "{{recentPost}}", slots: ["industry"] },
    { template: "If {context} is the future of {industry}, {{firstName}}, I want front-row seats.", personalizationSlot: "{{firstName}}", slots: ["context", "industry"] },
    { template: "Plot twist: a cold email that's actually about {context}, not about me.", personalizationSlot: "{{recentWin}}", slots: ["context"] },
    { template: "{{firstName}} — your {context} post made my Monday. Here's why it matters.", personalizationSlot: "{{firstName}}", slots: ["context"] },
  ],
  direct: [
    { template: "{{firstName}}, I'll keep this to 20 seconds: {context} is exactly what we help with.", personalizationSlot: "{{firstName}}", slots: ["context"] },
    { template: "We help {industry} teams dealing with {context}. Worth a 15-minute look?", personalizationSlot: "{{role}}", slots: ["industry", "context"] },
    { template: "{{company}} + {context} = a 10-minute conversation that could pay off.", personalizationSlot: "{{company}}", slots: ["context"] },
    { template: "Straight to it, {{firstName}}: {context} is costing {industry} teams real money.", personalizationSlot: "{{firstName}}", slots: ["context", "industry"] },
    { template: "One line: we solve {context} for {industry} companies like {{company}}.", personalizationSlot: "{{company}}", slots: ["context", "industry"] },
    { template: "No fluff — {context} is a problem we fix weekly for {industry} teams.", personalizationSlot: "{{recentWin}}", slots: ["context", "industry"] },
  ],
};

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

function trimInput(raw: unknown): [string, boolean] {
  const s = String(raw).trim();
  if ([...s].length > MAX_INPUT_CHARS) {
    return [takeCodePoints(s, MAX_INPUT_CHARS).trimEnd(), true];
  }
  return [s, false];
}

export interface Opener {
  text: string;
  personalizationSlot: string;
}

export interface OpenerResult {
  openers: Opener[];
  notice: string | null;
}

/**
 * Generate cold email openers from the fixed pattern library.
 * Throws on invalid input; the mountToolUI wrapper converts to { ok: false }.
 */
export function generateOpeners(
  prospectContext: string,
  industry: string,
  tone: string,
): OpenerResult {
  if (typeof prospectContext !== "string" || prospectContext.trim().length === 0) {
    throw new RangeError("prospectContext must not be empty or whitespace-only.");
  }
  if (typeof industry !== "string" || industry.trim().length === 0) {
    throw new RangeError("industry must not be empty or whitespace-only.");
  }
  if (!OPENER_TONES.includes(tone as OpenerTone)) {
    throw new RangeError(`tone must be one of: ${OPENER_TONES.join(", ")}.`);
  }

  const [context, contextTrimmed] = trimInput(prospectContext);
  const [industryVal, industryTrimmed] = trimInput(industry);
  const patterns = OPENER_PATTERNS[tone as OpenerTone];

  const openers: Opener[] = [];
  for (const p of patterns) {
    if (openers.length >= OPENER_COUNT) break;
    const text = p.template
      .replaceAll("{context}", context)
      .replaceAll("{industry}", industryVal);
    if (hasRepeatedWords(text)) continue; // guard: skip, never ship dup words
    openers.push({ text, personalizationSlot: p.personalizationSlot });
  }

  const notice =
    contextTrimmed || industryTrimmed
      ? "Note: an overlong input was trimmed to 200 characters (visible above). Nothing was dropped silently."
      : null;

  return { openers, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { prospectContext, industry, tone }
 * values out: { openers }  (a table of opener text + personalization slot)
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { prospectContext, industry, tone } = values;
  if (typeof prospectContext !== "string" || prospectContext.trim().length === 0) {
    return { ok: false, error: "Please describe the prospect context (e.g. “just raised Series A”)." };
  }
  if (typeof industry !== "string" || industry.trim().length === 0) {
    return { ok: false, error: "Please enter the prospect's industry." };
  }
  if (typeof tone !== "string" || !OPENER_TONES.includes(tone as OpenerTone)) {
    return {
      ok: false,
      error: `Please choose a tone: ${OPENER_TONES.join(", ")}.`,
    };
  }

  let result: OpenerResult;
  try {
    result = generateOpeners(prospectContext, industry, tone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate openers.",
    };
  }

  const rows: string[][] = result.openers.map((o) => [o.text, o.personalizationSlot]);
  if (result.notice) rows.push([result.notice, "—"]);

  return {
    ok: true,
    values: {
      openers: {
        columns: ["Opener", "Personalize this slot"],
        rows,
      },
    },
  };
}
