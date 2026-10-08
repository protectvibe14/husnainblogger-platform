/**
 * Brand Pitch Email Generator — pure logic (tool-467), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY CONTRACT: fixed template assembly over 5 pitch angles. Metrics
 * (follower count, engagement rate, past results) are inserted EXACTLY as
 * the user typed them and are never verified, researched, or embellished —
 * the methodology and output both label them as user-provided.
 * Nothing is produced by an AI model.
 *
 * Word banks (documented sizes):
 *  - PITCH_ANGLES: 5 entries (value-first | data-driven | creative-concept
 *    | ugc-offer | long-term-partnership)
 *  - Each angle: 3 subject-line templates -> 15 subjects total
 *  - Each angle: 1 body template -> 5 body templates total
 * Output = 3 subject options + 1 assembled body, fully deterministic.
 */

export const PITCH_ANGLES = [
  "value-first",
  "data-driven",
  "creative-concept",
  "ugc-offer",
  "long-term-partnership",
] as const;

export type PitchAngle = (typeof PITCH_ANGLES)[number];

export const DEFAULT_PITCH_ANGLE: PitchAngle = "value-first";
export const DEFAULT_CALL_TO_ACTION = "a quick 15-minute intro call next week";
export const MAX_FIELD_CHARS = 300;
export const MAX_RESULTS_LINES = 12;

/** Subject-line banks: 3 fixed templates per pitch angle. */
const SUBJECT_TEMPLATES: Record<PitchAngle, string[]> = {
  "value-first": [
    "Partnership idea for {brandName} x {creatorName}",
    "How I can help {brandName} reach {niche} buyers",
    "Quick collaboration idea for {brandName}",
  ],
  "data-driven": [
    "{engagementRate}% engagement in {niche} — partnership proposal for {brandName}",
    "Data-backed pitch: {creatorName} x {brandName}",
    "{followerCount} {niche} followers, {engagementRate}% engagement — let's talk",
  ],
  "creative-concept": [
    "A campaign concept built for {brandName}",
    "Content idea: {creatorName} x {brandName}",
    "Creative pitch for {brandName}'s next {niche} campaign",
  ],
  "ugc-offer": [
    "UGC creator for {brandName} — {niche} content that converts",
    "Done-for-you {niche} content for {brandName}",
    "{creatorName}: UGC partnership offer for {brandName}",
  ],
  "long-term-partnership": [
    "Long-term ambassador pitch: {creatorName} x {brandName}",
    "Beyond one post: a partnership proposal for {brandName}",
    "Becoming {brandName}'s go-to {niche} creator",
  ],
};

/** Body templates: 1 fixed template per pitch angle. */
const BODY_TEMPLATES: Record<PitchAngle, string> = {
  "value-first": [
    "Hi {brandName} team,",
    "",
    "I'm {creatorName}, a {niche} creator. I've been following {brandName} for a while, and I have a specific idea for how my audience could drive real results for you.",
    "",
    "My audience ({followerCount}, self-reported) is made up of exactly the kind of buyers {brandName} serves, and my content consistently sparks purchase conversations in the comments.",
    "{pastResultsBlock}",
    "Here's what I'm proposing: {callToAction}, where I'll walk you through the concept, the deliverables, and what a partnership could look like.",
    "",
    "No pressure at all — if the timing isn't right, I'm happy to stay in touch for a future campaign.",
    "",
    "Best,",
    "{creatorName}",
  ].join("\n"),
  "data-driven": [
    "Hi {brandName} team,",
    "",
    "I'm {creatorName}, a {niche} creator, and I'm reaching out with numbers first because I know partnership decisions run on data.",
    "",
    "My current metrics (self-reported, provided by me):",
    "- Audience: {followerCount}",
    "- Engagement rate: {engagementRate}%",
    "- Niche: {niche}",
    "{pastResultsBlock}",
    "Based on these numbers, I'd love to discuss a sponsored collaboration: {callToAction} to go through deliverables, usage rights, and pricing.",
    "",
    "Happy to share screenshots of my analytics on the call.",
    "",
    "Best,",
    "{creatorName}",
  ].join("\n"),
  "creative-concept": [
    "Hi {brandName} team,",
    "",
    "I'm {creatorName}, a {niche} creator — and instead of a generic pitch, I built you a campaign concept.",
    "",
    "The idea: a short-form series where I put {brandName} through a real {niche} use-case my audience keeps asking about, ending with an honest verdict. It's the format my followers trust most, and it's built to be reposted across your own channels.",
    "{pastResultsBlock}",
    "I'd love to walk you through the full concept: {callToAction}.",
    "",
    "If the concept isn't a fit, no worries — I appreciate you reading this far.",
    "",
    "Best,",
    "{creatorName}",
  ].join("\n"),
  "ugc-offer": [
    "Hi {brandName} team,",
    "",
    "I'm {creatorName}, a {niche} UGC creator. Quick pitch: I create scroll-stopping product content for brands to use in their own ads and organic posts — no posting on my account required unless you want it.",
    "",
    "What you'd get: native-feeling {niche} videos and photos featuring {brandName}, delivered with full usage rights and fast turnaround.",
    "{pastResultsBlock}",
    "Interested? {callToAction} — I'll bring 3 content angles tailored to {brandName}.",
    "",
    "Thanks for your time,",
    "{creatorName}",
  ].join("\n"),
  "long-term-partnership": [
    "Hi {brandName} team,",
    "",
    "I'm {creatorName}, a {niche} creator, and I'm not pitching a one-off post — I'm pitching a partnership.",
    "",
    "Here's my thinking: one-off sponsorships get one spike of attention. A longer-term collaboration (monthly content, honest product integration, affiliate or ambassador structure) compounds trust with my {followerCount} {niche} followers (self-reported) and gives {brandName} a consistent voice in the space.",
    "{pastResultsBlock}",
    "I'd love to explore what a 3–6 month partnership could look like: {callToAction}.",
    "",
    "Either way, I'm a genuine fan of what you're building.",
    "",
    "Best,",
    "{creatorName}",
  ].join("\n"),
};

export interface PitchInput {
  brandName?: unknown;
  creatorName?: unknown;
  niche?: unknown;
  followerCount?: unknown;
  engagementRate?: unknown;
  pastResults?: unknown;
  pitchAngle?: unknown;
  callToAction?: unknown;
}

export interface RunResult {
  ok: boolean;
  values?: { pitchEmailDraft: string };
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

/** Normalize pitchAngle against the fixed list; unknown/empty -> default. */
export function normalizePitchAngle(value: unknown): PitchAngle {
  const v = sanitize(value).toLowerCase().replace(/[\s_]+/g, "-");
  const found = (PITCH_ANGLES as readonly string[]).find((a) => a === v);
  return (found as PitchAngle | undefined) ?? DEFAULT_PITCH_ANGLE;
}

/**
 * Parse engagementRate: empty -> null (omitted); otherwise a number 0–100.
 * Returns { rate, error } — error is a human message or null.
 */
export function parseEngagementRate(value: unknown): { rate: number | null; error: string | null } {
  if (value === undefined || value === null) return { rate: null, error: null };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return { rate: null, error: "Engagement rate must be a number between 0 and 100." };
    }
    if (value < 0 || value > 100) {
      return { rate: null, error: "Engagement rate must be between 0 and 100." };
    }
    return { rate: value, error: null };
  }
  const v = sanitize(value);
  if (v === "") return { rate: null, error: null };
  const n = Number(v);
  if (!Number.isFinite(n)) return { rate: null, error: "Engagement rate must be a number between 0 and 100." };
  if (n < 0 || n > 100) return { rate: null, error: "Engagement rate must be between 0 and 100." };
  return { rate: n, error: null };
}

/** Split pastResults into up to MAX_RESULTS_LINES non-empty lines. */
export function parsePastResults(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n|,/)
    .map((s) => sanitize(s, 200))
    .filter((s) => s !== "")
    .slice(0, MAX_RESULTS_LINES);
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

/**
 * Assemble the full draft: 3 subject options + the angle's body template.
 * All metrics are user-provided verbatim and labeled as such.
 */
export function assembleDraft(input: {
  brandName: string;
  creatorName: string;
  niche: string;
  followerCount: string;
  engagementRate: number | null;
  pastResults: string[];
  pitchAngle: PitchAngle;
  callToAction: string;
}): string {
  const pastResultsBlock =
    input.pastResults.length > 0
      ? "\n\nSome past results (self-reported):\n" +
        input.pastResults.map((r) => `- ${r}`).join("\n")
      : "";

  const vars: Record<string, string> = {
    brandName: input.brandName,
    creatorName: input.creatorName,
    niche: input.niche,
    followerCount: input.followerCount === "" ? "[your follower count]" : input.followerCount,
    engagementRate: input.engagementRate === null ? "[your engagement rate]" : String(input.engagementRate),
    pastResultsBlock,
    callToAction: input.callToAction,
  };

  const subjects = SUBJECT_TEMPLATES[input.pitchAngle].map((t) => fill(t, vars));
  const body = fill(BODY_TEMPLATES[input.pitchAngle], vars);

  const lines = [
    "SUBJECT OPTIONS (pick one):",
    ...subjects.map((s, i) => `${i + 1}. ${s}`),
    "",
    "---",
    "",
    "EMAIL BODY:",
    "",
    body,
    "",
    "---",
    "Note: follower count, engagement rate, and past results above are exactly",
    "as you entered them — this tool does not verify metrics.",
  ];
  return lines.join("\n");
}

/**
 * Tool entry point. Validates required names, assembles the draft.
 */
export function runTool(values: Record<string, unknown>): RunResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your pitch details." };
  }
  const v = values as PitchInput;

  const brandName = sanitize(v.brandName);
  const creatorName = sanitize(v.creatorName);
  if (brandName === "") {
    return { ok: false, error: "Please enter the brand name." };
  }
  if (creatorName === "") {
    return { ok: false, error: "Please enter your name (or creator name)." };
  }

  const rate = parseEngagementRate(v.engagementRate);
  if (rate.error) {
    return { ok: false, error: rate.error };
  }

  const niche = sanitize(v.niche) === "" ? "content creation" : sanitize(v.niche);
  const followerCount = sanitize(v.followerCount);
  const pastResults = parsePastResults(v.pastResults);
  const pitchAngle = normalizePitchAngle(v.pitchAngle);
  const callToAction =
    sanitize(v.callToAction, 200) === "" ? DEFAULT_CALL_TO_ACTION : sanitize(v.callToAction, 200);

  const pitchEmailDraft = assembleDraft({
    brandName,
    creatorName,
    niche,
    followerCount,
    engagementRate: rate.rate,
    pastResults,
    pitchAngle,
    callToAction,
  });

  return { ok: true, values: { pitchEmailDraft } };
}
