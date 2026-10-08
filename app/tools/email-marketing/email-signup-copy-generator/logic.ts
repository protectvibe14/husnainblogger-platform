/**
 * Email Signup Copy Generator — pure logic (tool-430).
 *
 * ASSEMBLY, NOT AI: headline, subtext, and button copy are assembled from
 * FIXED pattern banks bundled below — no network, no model, no randomness.
 * Selection is a deterministic hash of the inputs (incentive, placement,
 * tone), so identical inputs always produce identical output. Copy says
 * "templates", never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - HEADLINE_PATTERNS: 20 headline patterns (placeholder: {incentive})
 * - SUBTEXT_PATTERNS: 14 subtext patterns (placeholder: {incentive})
 * - BUTTON_PATTERNS: 16 button-text patterns (placeholder: {incentive})
 *
 * Per run the tool emits 4 headline options, 3 subtext options, and 5
 * button texts, picked deterministically by stepping through each bank with
 * a stride coprime to its size.
 *
 * Honesty notes:
 * - The copy is template-based and generic; it knows nothing about the
 *   user's brand, audience, or conversion data, and makes no performance
 *   claims.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK /
 *   RTL count as one character each.
 * - Over-long incentive text is TRUNCATED with a visible notice — never
 *   silently dropped.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 * - Consecutive duplicate words introduced by filling are collapsed.
 */

export const MAX_INCENTIVE_CHARS = 100;

/** Number of options produced per output list (fixed, documented). */
export const HEADLINE_OPTIONS = 4;
export const SUBTEXT_OPTIONS = 3;
export const BUTTON_OPTIONS = 5;

/** 4 supported signup placements. */
export const PLACEMENTS: readonly string[] = ["popup", "inline", "landing", "sidebar"];

/** Display labels for the placements. */
export const PLACEMENT_LABELS: Record<string, string> = {
  "popup": "Popup",
  "inline": "Inline form",
  "landing": "Landing page",
  "sidebar": "Sidebar",
};

/** 4 supported tones. */
export const TONES: readonly string[] = ["friendly", "professional", "playful", "urgent"];

/** Display labels for the tones. */
export const TONE_LABELS: Record<string, string> = {
  "friendly": "Friendly",
  "professional": "Professional",
  "playful": "Playful",
  "urgent": "Urgent",
};

/** 20 headline patterns. Placeholder: {incentive}. */
export const HEADLINE_PATTERNS: readonly string[] = [
  "Get Your Free {incentive}",
  "Download the {incentive} — Free",
  "Want the {incentive}?",
  "Steal Our {incentive}",
  "Your {incentive} Is Waiting",
  "Unlock the Free {incentive}",
  "Start With the {incentive}",
  "Claim Your {incentive} Today",
  "Grab the {incentive} in Seconds",
  "Free Download: {incentive}",
  "The {incentive} — Yours Free",
  "Don't Miss the {incentive}",
  "Get Instant Access to the {incentive}",
  "Your Shortcut: The Free {incentive}",
  "Ready for the {incentive}?",
  "The {incentive}, Free for Subscribers",
  "Take the {incentive} With You",
  "One Click to Your {incentive}",
  "The {incentive} Worth Your Inbox",
  "Skip the Guesswork — Get the {incentive}",
];

/** 14 subtext patterns. Placeholder: {incentive}. */
export const SUBTEXT_PATTERNS: readonly string[] = [
  "Join the newsletter and get the {incentive} delivered straight to your inbox.",
  "One email a week, plus your free {incentive} the moment you sign up.",
  "Enter your email below and the {incentive} is yours — no spam, ever.",
  "Subscribe for practical tips and instant access to the {incentive}.",
  "Get the {incentive} free when you join — unsubscribe anytime.",
  "Drop your email and I'll send the {incentive} right over.",
  "Sign up in seconds and start using the {incentive} today.",
  "The {incentive} is free for subscribers — join below.",
  "Fresh ideas weekly, starting with your free {incentive}.",
  "No fluff, no spam — just the {incentive} and useful emails.",
  "Join now: the {incentive} lands in your inbox immediately.",
  "Subscribe and download the {incentive} in under a minute.",
  "Get the {incentive} plus a short weekly email you'll actually read.",
  "Your email stays private. Your {incentive} arrives instantly.",
];

/** 16 button-text patterns. Placeholder: {incentive}. */
export const BUTTON_PATTERNS: readonly string[] = [
  "Get Instant Access",
  "Send Me the {incentive}",
  "Download Now",
  "Yes, I Want It",
  "Claim My Free Copy",
  "Subscribe & Download",
  "Get the {incentive}",
  "Count Me In",
  "Send It Over",
  "Join Free",
  "Grab My {incentive}",
  "Sign Me Up",
  "Download the {incentive}",
  "Get It Free",
  "Yes — Send It",
  "Unlock Access",
];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers (all local — logic.ts has zero imports by contract)
// ---------------------------------------------------------------------------

/** djb2 hash, returned as an unsigned 32-bit int. Deterministic pick source. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Length in Unicode code points (emoji / CJK / RTL count as one each). */
function codePoints(s: string): number {
  return [...s].length;
}

/** Escape HTML so user input stays plain text in the output. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface TextRead {
  ok: true;
  value: string;
  notice?: string;
}

interface TextFail {
  ok: false;
  error: string;
}

function readText(
  values: Record<string, unknown>,
  id: string,
  label: string,
  maxChars: number,
): TextRead | TextFail {
  const raw = values[id];
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return { ok: false, error: `${label} is required — please fill it in.` };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: `${label} must be text.` };
  }
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: false, error: `${label} must not be empty.` };
  }
  let notice: string | undefined;
  let value = trimmed;
  if (codePoints(trimmed) > maxChars) {
    value = [...trimmed].slice(0, maxChars).join("");
    notice =
      `${label} was shortened from ${codePoints(trimmed)} to ${maxChars} characters.`;
  }
  return { ok: true, value: escapeHtml(value), notice };
}

/** Fill {token} placeholders from a map. */
function fill(template: string, map: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m,
  );
}

/**
 * Collapse consecutive duplicate words (case-insensitive) that filling can
 * introduce when the incentive already ends in the pattern's neighboring
 * word.
 */
export function collapseDuplicateWords(s: string): string {
  // Split on whitespace runs and rejoin with single spaces, so collapsing a
  // duplicate never leaves double spaces behind.
  const words = s.split(/\s+/);
  const out: string[] = [];
  let prevWord = "";
  for (const word of words) {
    if (word.toLowerCase() === prevWord && prevWord !== "") {
      continue;
    }
    out.push(word);
    prevWord = word.toLowerCase();
  }
  return out.join(" ");
}

/**
 * Deterministically pick `n` distinct patterns from a bank using a stride
 * coprime to the bank size. The stride is documented per bank so picks are
 * always distinct.
 */
export function pickDistinct(
  bank: readonly string[],
  stride: number,
  start: number,
  n: number,
): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(bank[(start + stride * i) % bank.length]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Generate signup-form copy from the fixed pattern banks.
 *
 * Inputs (values): incentive (required text), placement (required select:
 * popup | inline | landing | sidebar), tone (required select: friendly |
 * professional | playful | urgent).
 * Outputs (values): headlines (string[]), subtexts (string[]), buttons
 * (string[]).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const incentive = readText(values, "incentive", "Incentive", MAX_INCENTIVE_CHARS);
  if (!incentive.ok) return { ok: false, error: incentive.error };

  const placementRaw = values["placement"];
  if (placementRaw === undefined || placementRaw === null || placementRaw === "") {
    return { ok: false, error: "Placement is required — pick popup, inline, landing, or sidebar." };
  }
  if (typeof placementRaw !== "string" || !PLACEMENTS.includes(placementRaw)) {
    return { ok: false, error: `Placement must be one of: ${PLACEMENTS.join(", ")}.` };
  }

  const toneRaw = values["tone"];
  if (toneRaw === undefined || toneRaw === null || toneRaw === "") {
    return { ok: false, error: "Tone is required — pick friendly, professional, playful, or urgent." };
  }
  if (typeof toneRaw !== "string" || !TONES.includes(toneRaw)) {
    return { ok: false, error: `Tone must be one of: ${TONES.join(", ")}.` };
  }

  const notices: string[] = [];
  if (incentive.notice) notices.push(incentive.notice);

  const h = hashString([incentive.value, placementRaw, toneRaw].join(" "));

  const headlines = pickDistinct(HEADLINE_PATTERNS, 7, h, HEADLINE_OPTIONS).map((p) =>
    collapseDuplicateWords(fill(p, { incentive: incentive.value })),
  );
  const subtexts = pickDistinct(SUBTEXT_PATTERNS, 5, h + 1, SUBTEXT_OPTIONS).map((p) =>
    collapseDuplicateWords(fill(p, { incentive: incentive.value })),
  );
  const buttons = pickDistinct(BUTTON_PATTERNS, 5, h + 2, BUTTON_OPTIONS).map((p) =>
    collapseDuplicateWords(fill(p, { incentive: incentive.value })),
  );

  const result: Record<string, unknown> = {
    headlines,
    subtexts,
    buttons,
    notices,
  };

  return { ok: true, values: result };
}
