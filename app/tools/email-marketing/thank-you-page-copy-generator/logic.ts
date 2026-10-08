/**
 * Thank You Page Copy Generator — pure logic (tool-431).
 *
 * ASSEMBLY, NOT AI: headlines, body draft, and next-step CTA are assembled
 * from FIXED pattern banks bundled below — no network, no model, no
 * randomness. Selection is a deterministic hash of the inputs, so identical
 * inputs always produce identical output. Copy says "templates", never
 * "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - HEADLINE_PATTERNS: 16 headline patterns
 *   (placeholders: {completedAction}, {brand})
 * - BODY_PATTERNS: 8 body-paragraph patterns
 *   (placeholders: {completedAction}, {brand}, {nextStep})
 * - NEXT_STEP_CTA_PATTERNS: 8 next-step CTA patterns
 *   (placeholder: {nextStep})
 * - TONE_INTROS: 4 fixed opening lines, one per tone
 *
 * Per run the tool emits 3 headline options, 1 body draft (tone intro +
 * one body paragraph), and 1 next-step CTA line.
 *
 * Honesty notes:
 * - The copy is template-based and generic; it knows nothing about the
 *   user's brand, audience, or conversion data, and makes no performance
 *   claims.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK /
 *   RTL count as one character each.
 * - Over-long text inputs are TRUNCATED with a visible notice — never
 *   silently dropped.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 * - Consecutive duplicate words introduced by filling are collapsed.
 */

export const MAX_ACTION_CHARS = 100;
export const MAX_NEXT_STEP_CHARS = 120;
export const MAX_BRAND_CHARS = 60;

/** Number of options produced per output (fixed, documented). */
export const HEADLINE_OPTIONS = 3;

/** 4 supported tones. */
export const TONES: readonly string[] = ["friendly", "professional", "playful", "warm"];

/** Display labels for the tones. */
export const TONE_LABELS: Record<string, string> = {
  "friendly": "Friendly",
  "professional": "Professional",
  "playful": "Playful",
  "warm": "Warm",
};

/** 4 fixed tone opening lines used at the start of the body draft. */
export const TONE_INTROS: Record<string, string> = {
  "friendly": "We're so glad you're here.",
  "professional": "Thank you for taking this step.",
  "playful": "High five — you did it!",
  "warm": "Welcome aboard — we're thrilled you joined.",
};

/** 16 headline patterns. Placeholders: {completedAction}, {brand}. */
export const HEADLINE_PATTERNS: readonly string[] = [
  "You're In! {completedAction} Complete",
  "Thanks — Your {completedAction} Is Confirmed",
  "{completedAction} Received. Welcome to {brand}!",
  "Success! Your {completedAction} Went Through",
  "All Set — {completedAction} Confirmed",
  "Welcome to {brand}!",
  "Thank You for Your {completedAction}",
  "Done! Here's What Happens Next",
  "Your {completedAction} Is Locked In",
  "{brand} Thanks You!",
  "Confirmed: {completedAction}",
  "You're Officially In",
  "Great News — {completedAction} Complete",
  "Welcome Aboard",
  "Thank You — You're All Set",
  "Mission Accomplished: {completedAction}",
];

/** 8 body-paragraph patterns. Placeholders: {completedAction}, {brand}, {nextStep}. */
export const BODY_PATTERNS: readonly string[] = [
  "Your {completedAction} is confirmed, and {brand} has everything ready for you. Your next move: {nextStep}. It only takes a minute, and it makes sure you get the full benefit.",
  "Thanks for completing your {completedAction}. At {brand}, we don't leave you hanging — so here's the next step: {nextStep}. Do it now while it's fresh.",
  "Good news: your {completedAction} went through. Here's what {brand} recommends next: {nextStep}. This is the step that turns a signup into a result.",
  "Your {completedAction} is done. To get the most from {brand}, your next step is: {nextStep}. Most people finish it in under a couple of minutes.",
  "Confirmed — your {completedAction} is on record with {brand}. One more thing unlocks everything: {nextStep}. Don't skip it.",
  "Welcome in! Your {completedAction} was successful. {brand} prepared one quick next step for you: {nextStep}. Take care of it now and you're fully set up.",
  "Your {completedAction} is complete. Now the fun part begins at {brand} — start here: {nextStep}. That's the fastest path to your first win.",
  "Done and dusted: your {completedAction} is confirmed with {brand}. Before you go, finish this: {nextStep}. It takes moments and changes everything.",
];

/** 8 next-step CTA patterns. Placeholder: {nextStep}. */
export const NEXT_STEP_CTA_PATTERNS: readonly string[] = [
  "Take the next step: {nextStep}",
  "Next up: {nextStep}",
  "Your next step: {nextStep}",
  "Continue — {nextStep}",
  "Do this next: {nextStep}",
  "Ready when you are: {nextStep}",
  "One last thing: {nextStep}",
  "Start here: {nextStep}",
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
 * introduce when an input already ends in the pattern's neighboring word.
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
 * coprime to the bank size, so picks are always distinct.
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
 * Generate thank-you page copy from the fixed pattern banks.
 *
 * Inputs (values): completedAction (required text), nextStep (required
 * text), brand (required text), tone (required select: friendly |
 * professional | playful | warm).
 * Outputs (values): headlines (string[]), body (string), nextCta (string),
 * notices (string[]).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const completedAction = readText(values, "completedAction", "Completed action", MAX_ACTION_CHARS);
  if (!completedAction.ok) return { ok: false, error: completedAction.error };
  const nextStep = readText(values, "nextStep", "Next step", MAX_NEXT_STEP_CHARS);
  if (!nextStep.ok) return { ok: false, error: nextStep.error };
  const brand = readText(values, "brand", "Brand", MAX_BRAND_CHARS);
  if (!brand.ok) return { ok: false, error: brand.error };

  const toneRaw = values["tone"];
  if (toneRaw === undefined || toneRaw === null || toneRaw === "") {
    return { ok: false, error: "Tone is required — pick friendly, professional, playful, or warm." };
  }
  if (typeof toneRaw !== "string" || !TONES.includes(toneRaw)) {
    return { ok: false, error: `Tone must be one of: ${TONES.join(", ")}.` };
  }
  const tone = toneRaw as string;

  const notices: string[] = [];
  if (completedAction.notice) notices.push(completedAction.notice);
  if (nextStep.notice) notices.push(nextStep.notice);
  if (brand.notice) notices.push(brand.notice);

  const h = hashString(
    [completedAction.value, nextStep.value, brand.value, tone].join(" "),
  );
  const map = {
    completedAction: completedAction.value,
    brand: brand.value,
    nextStep: nextStep.value,
  };

  // Strides coprime to bank sizes (16, 8, 8) → always distinct picks.
  const headlines = pickDistinct(HEADLINE_PATTERNS, 5, h, HEADLINE_OPTIONS).map((p) =>
    collapseDuplicateWords(fill(p, map)),
  );
  const bodyParagraph = collapseDuplicateWords(
    fill(BODY_PATTERNS[(h + 3) % BODY_PATTERNS.length], map),
  );
  const body = `${TONE_INTROS[tone]} ${bodyParagraph}`;
  const nextCta = collapseDuplicateWords(
    fill(NEXT_STEP_CTA_PATTERNS[(h + 5) % NEXT_STEP_CTA_PATTERNS.length], map),
  );

  return {
    ok: true,
    values: { headlines, body, nextCta, notices },
  };
}
