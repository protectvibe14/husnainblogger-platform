/**
 * LinkedIn Headline Generator (tool-494) — pure logic, zero imports, zero
 * network, zero DOM, no randomness.
 *
 * HONESTY: this is a TEMPLATE-BASED headline assembler, not an AI
 * copywriter. Headlines are built by inserting your role, specialties, and
 * optional proof point into fixed sentence templates grouped by style.
 * Proof points are echoed exactly as you type them — the tool does not
 * verify any claim you make. Every headline is counted and forced to fit
 * LinkedIn's 220-character headline limit (a widely documented platform
 * limit; confirm it in LinkedIn's current UI, as platforms change).
 *
 * Word banks (all fixed, documented here):
 *   - TEMPLATES: 3 styles x 8 fixed template functions = 24 templates.
 *     Slots: {role}, {s1..s3} (first three specialties), {proof}.
 *     Templates that need a slot you did not fill are skipped; every style
 *     ends with generic fallbacks so you always get options.
 *   - Specialties are capped at MAX_SPECIALTIES (20); only the first three
 *     are used in any one headline.
 *   - HEADLINE_LIMIT = 220. A headline over the limit is rebuilt without the
 *     proof point; if still over, it is truncated to 219 chars + "…".
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * values in  = { role, specialties?, proofPoint?, style }
 * values out = { headlineOptions, limitNote }
 * Output ids match meta.ts outputs. Deterministic: same inputs -> same
 * headlines, in the same order, every time.
 */

export interface HeadlineValues {
  /** Headline options, each suffixed with its character count "(n/220)". */
  headlineOptions: string[];
  /** Fixed note about the 220-char limit and user-provided proof points. */
  limitNote: string;
}

export interface HeadlineResult {
  ok: boolean;
  values?: HeadlineValues;
  error?: string;
}

/** Style options shown in the UI select; keys of TEMPLATES. */
export const STYLES: string[] = [
  "keyword-focused",
  "outcome-driven",
  "conversational",
];

/** LinkedIn's headline character limit (platform UI knowledge). */
const HEADLINE_LIMIT = 220;

/** Max specialties read from the textarea; bounds total work. */
const MAX_SPECIALTIES = 20;

interface Ctx {
  role: string;
  s: string[];
  proof: string | null;
}

type TemplateFn = (c: Ctx) => string | null;

/** 24 fixed template functions, 8 per style. */
const TEMPLATES: Record<string, TemplateFn[]> = {
  "keyword-focused": [
    (c) => (c.s[0] ? c.role + " | " + c.s.slice(0, 3).join(" · ") : null),
    (c) =>
      c.s[0]
        ? c.role + " specializing in " + c.s.slice(0, 2).join(" and ")
        : null,
    (c) => (c.s[0] ? c.role + " | " + c.s[0] + " expert" : null),
    (c) =>
      c.s[1]
        ? c.role + " — " + c.s[0] + ", " + c.s[1] + (c.s[2] ? " & " + c.s[2] : "")
        : null,
    (c) =>
      c.proof && c.s[0] ? c.proof + " | " + c.role + " | " + c.s[0] : null,
    (c) => (c.proof ? c.role + " | " + c.proof : null),
    (c) =>
      c.s[1] ? "Freelance " + c.role + " | " + c.s[0] + " · " + c.s[1] : null,
    (c) => c.role + " | Open to new projects",
  ],
  "outcome-driven": [
    (c) => (c.s[0] ? "I help clients win with " + c.s[0] + " | " + c.role : null),
    (c) =>
      c.s[0] ? c.role + " turning " + c.s[0] + " into real results" : null,
    (c) =>
      c.s[1]
        ? "Helping businesses grow through " + c.s[0] + " & " + c.s[1] + " | " + c.role
        : null,
    (c) => (c.proof ? c.role + " | " + c.proof : null),
    (c) => (c.s[0] ? "I turn " + c.s[0] + " into revenue | " + c.role : null),
    (c) => (c.s[0] ? c.role + " — " + c.s[0] + " that delivers" : null),
    (c) => (c.proof ? c.proof + " — now helping clients as a " + c.role : null),
    (c) => c.role + " | Helping clients get results",
  ],
  conversational: [
    (c) =>
      c.s[1] ? "Hi, I'm a " + c.role + " — I do " + c.s[0] + " and " + c.s[1] : null,
    (c) =>
      c.s[0] ? "I help with " + c.s.slice(0, 2).join(", ") + " | " + c.role : null,
    (c) =>
      c.s[0] ? c.role + " who actually replies fast | " + c.s[0] : null,
    (c) => (c.s[0] ? "Let's talk " + c.s[0] + " | " + c.role : null),
    (c) => (c.s[0] ? "Ask me about " + c.s[0] + " | " + c.role : null),
    (c) => (c.proof ? c.proof + " | " + c.role + " for hire" : null),
    (c) => "Coffee first, then great work | " + c.role,
    (c) => c.role + " | Open to new projects",
  ],
};

const LIMIT_NOTE =
  "Each headline above is counted against LinkedIn's 220-character headline " +
  "limit (a widely documented platform limit — confirm it in LinkedIn's " +
  "current UI, as platforms change). Proof points are your own words, echoed " +
  "as typed — this tool does not verify any claim. Shorten or rephrase " +
  "before pasting.";

/** Split a textarea into a specialty list (commas, semicolons, newlines). */
function parseList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, MAX_SPECIALTIES);
}

/**
 * Build one headline and force it within the limit: try with the proof
 * point, then without it, then truncate to 219 chars + "…".
 */
function fit(fn: TemplateFn, c: Ctx): string | null {
  let headline = fn(c);
  if (headline === null) return null;
  if (headline.length > HEADLINE_LIMIT && c.proof !== null) {
    const withoutProof = fn({ role: c.role, s: c.s, proof: null });
    if (withoutProof === null) return null;
    headline = withoutProof;
  }
  if (headline.length > HEADLINE_LIMIT) {
    headline = headline.slice(0, HEADLINE_LIMIT - 1) + "…";
  }
  return headline;
}

/**
 * Assemble headline options from the fixed templates. Deterministic: same
 * inputs always produce the same headlines in the same order.
 */
export function runTool(values: Record<string, unknown>): HeadlineResult {
  const source = values ?? {};

  const role = typeof source.role === "string" ? source.role.trim() : "";
  if (role === "") {
    return {
      ok: false,
      error: "Enter your role (for example: Web Designer, Copywriter).",
    };
  }

  const rawStyle =
    typeof source.style === "string" ? source.style.trim().toLowerCase() : "";
  if (STYLES.indexOf(rawStyle) === -1) {
    return {
      ok: false,
      error: "Choose a style: " + STYLES.join(", ") + ".",
    };
  }

  const specialties = parseList(source.specialties);
  const proofRaw =
    typeof source.proofPoint === "string" ? source.proofPoint.trim() : "";
  const proof = proofRaw === "" ? null : proofRaw;

  const ctx: Ctx = { role, s: specialties, proof };
  const options: string[] = [];
  const seen: Record<string, boolean> = {};

  for (const fn of TEMPLATES[rawStyle]) {
    const headline = fit(fn, ctx);
    if (headline === null) continue;
    const key = headline.toLowerCase();
    if (!seen[key]) {
      seen[key] = true;
      options.push(headline + " (" + headline.length + "/" + HEADLINE_LIMIT + ")");
    }
  }

  return {
    ok: true,
    values: {
      headlineOptions: options,
      limitNote: LIMIT_NOTE,
    },
  };
}
