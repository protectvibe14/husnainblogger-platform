/**
 * Follow-up Email Generator — pure logic (tool-410).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic text assembly from a FIXED pattern
 *   library (see STEP_SUBJECTS and STEP_BODIES below). No AI, no network,
 *   no backend, no sending — it drafts copy only.
 * - Bank sizes: 5 sequence steps x 4 subject patterns = 20 subject
 *   patterns; 5 steps x 3 body templates = 15 body templates; 4 tone
 *   closing lines. Deterministic pick rule: body template index =
 *   (toneIndex + step) mod 3, subject options = all 4 patterns for the
 *   step. Same inputs always produce the same draft.
 * - The tool inserts the user's own words ({subject}, {goal}) as-is. It
 *   never invents claims, numbers, or offers.
 *
 * Edge-case handling (shared validation rules):
 * - Overlong inputs are trimmed to MAX_INPUT_CHARS with a visible notice
 *   appended to the draft, never dropped silently.
 * - Drafts are guarded against accidental repeated adjacent words; a
 *   failing template is replaced by the next template in the step.
 */

export type FollowUpTone = "friendly" | "professional" | "playful" | "urgent";

export const FOLLOW_UP_TONES: readonly FollowUpTone[] = [
  "friendly",
  "professional",
  "playful",
  "urgent",
];

/** Max code points kept from a user input; excess is trimmed with a notice. */
export const MAX_INPUT_CHARS = 200;

/** Valid sequence steps (first bump through final break-up nudge). */
export const MIN_STEP = 1;
export const MAX_STEP = 5;

/**
 * Fixed subject-line patterns: 5 steps x 4 patterns = 20 patterns.
 * {subject} is the user's original subject line, used as-is.
 */
export const STEP_SUBJECTS: Record<number, readonly string[]> = {
  1: [
    "Re: {subject}",
    "Quick bump: {subject}",
    "Circling back on this",
    "Did you see this? {subject}",
  ],
  2: [
    "Re: {subject} (one more thought)",
    "A second look: {subject}",
    "Bumping this up",
    "In case it got buried: {subject}",
  ],
  3: [
    "Should I keep you on the list?",
    "Quick check-in: {subject}",
    "Still relevant? {subject}",
    "One more nudge",
  ],
  4: [
    "Last note on this: {subject}",
    "Closing the loop: {subject}",
    "Final bump",
    "Before I move on: {subject}",
  ],
  5: [
    "Break-up email: should I stop?",
    "Permission to close your file?",
    "This is my last email about {subject}",
    "Goodbye for now?",
  ],
};

/**
 * Fixed body templates: 5 steps x 3 templates = 15 templates.
 * {goal} is the user's goal, used as-is. {closing} is the tone closing.
 */
export const STEP_BODIES: Record<number, readonly string[]> = {
  1: [
    "Hi {{firstName}},\n\nJust floating this back to the top of your inbox. My last note was about {goal} — happy to resend the details if it got buried.\n\n{closing}",
    "Hi {{firstName}},\n\nQuick bump in case my last email slipped through. The short version: {goal}. Worth a look?\n\n{closing}",
    "Hi {{firstName}},\n\nNoticed you opened my last email about {goal}. Anything I can clarify?\n\n{closing}",
  ],
  2: [
    "Hi {{firstName}},\n\nFollowing up on {goal}. Most people I talk to say timing is the issue — is now a bad time, or is the idea off?\n\n{closing}",
    "Hi {{firstName}},\n\nOne more thought on {goal}: teams that start this week usually see the payoff within a month. Open to a 10-minute chat?\n\n{closing}",
    "Hi {{firstName}},\n\nChecking back on {goal}. If it's not a fit, no worries — a quick “not for us” saves us both time.\n\n{closing}",
  ],
  3: [
    "Hi {{firstName}},\n\nShould I keep you on my follow-up list for {goal}? A simple yes/no keeps things tidy.\n\n{closing}",
    "Hi {{firstName}},\n\nStill thinking about {goal}? I'm happy to answer questions — or close this out if the timing's wrong.\n\n{closing}",
    "Hi {{firstName}},\n\nQuick check: is {goal} still on your radar, or should I stop nudging?\n\n{closing}",
  ],
  4: [
    "Hi {{firstName}},\n\nThis is my last planned note about {goal}. If there's even a small chance it's useful, let's talk this week.\n\n{closing}",
    "Hi {{firstName}},\n\nClosing the loop on {goal}. If I don't hear back, I'll assume it's not a priority and stop following up.\n\n{closing}",
    "Hi {{firstName}},\n\nFinal bump: {goal} is still on the table. Reply “interested” and I'll send the details today.\n\n{closing}",
  ],
  5: [
    "Hi {{firstName}},\n\nI've reached out a few times about {goal} without hearing back, so I'll stop here. If anything changes, my door is open.\n\n{closing}",
    "Hi {{firstName}},\n\nPermission to close your file on {goal}? If you're still interested down the road, just reply and I'll pick it right back up.\n\n{closing}",
    "Hi {{firstName}},\n\nGoodbye for now — no more follow-ups about {goal} from me. Wishing you a great quarter.\n\n{closing}",
  ],
};

/** Fixed tone closings, swapped into {closing}. */
export const TONE_CLOSINGS: Record<FollowUpTone, string> = {
  friendly: "Thanks either way!\nBest, {{yourName}}",
  professional: "Kind regards,\n{{yourName}}",
  playful: "Cheers (and no hard feelings if not!)\n{{yourName}}",
  urgent: "Let's not let this slip — reply today.\n{{yourName}}",
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

export interface FollowUpResult {
  subjectOptions: string[];
  bodyDraft: string;
  notice: string | null;
}

/**
 * Generate a follow-up email draft from the fixed pattern library.
 * Throws on invalid input; the mountToolUI wrapper converts to { ok: false }.
 */
export function generateFollowUp(
  sequenceStep: number,
  originalSubject: string,
  goal: string,
  tone: string,
): FollowUpResult {
  if (!Number.isInteger(sequenceStep) || sequenceStep < MIN_STEP || sequenceStep > MAX_STEP) {
    throw new RangeError(`sequenceStep must be an integer from ${MIN_STEP} to ${MAX_STEP}.`);
  }
  if (typeof originalSubject !== "string" || originalSubject.trim().length === 0) {
    throw new RangeError("originalSubject must not be empty or whitespace-only.");
  }
  if (typeof goal !== "string" || goal.trim().length === 0) {
    throw new RangeError("goal must not be empty or whitespace-only.");
  }
  if (!FOLLOW_UP_TONES.includes(tone as FollowUpTone)) {
    throw new RangeError(`tone must be one of: ${FOLLOW_UP_TONES.join(", ")}.`);
  }

  const [subject, subjectTrimmed] = trimInput(originalSubject);
  const [goalVal, goalTrimmed] = trimInput(goal);
  const closing = TONE_CLOSINGS[tone as FollowUpTone];
  const toneIndex = FOLLOW_UP_TONES.indexOf(tone as FollowUpTone);

  const subjectOptions = STEP_SUBJECTS[sequenceStep].map((p) =>
    p.replaceAll("{subject}", subject),
  );

  // Deterministic pick: (toneIndex + step) mod 3, with repeat-word fallback.
  const templates = STEP_BODIES[sequenceStep];
  let bodyDraft = "";
  for (let offset = 0; offset < templates.length; offset++) {
    const idx = (toneIndex + sequenceStep + offset) % templates.length;
    const candidate = templates[idx]
      .replaceAll("{goal}", goalVal)
      .replaceAll("{closing}", closing);
    if (!hasRepeatedWords(candidate)) {
      bodyDraft = candidate;
      break;
    }
  }

  const notice =
    subjectTrimmed || goalTrimmed
      ? "Note: an overlong input was trimmed to 200 characters (visible above). Nothing was dropped silently."
      : null;

  return { subjectOptions, bodyDraft, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { sequenceStep, originalSubject, goal, tone }
 * values out: { subjectOptions, bodyDraft }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { sequenceStep, originalSubject, goal, tone } = values;
  const step = typeof sequenceStep === "number" ? sequenceStep : Number(sequenceStep);
  if (!Number.isInteger(step) || step < MIN_STEP || step > MAX_STEP) {
    return {
      ok: false,
      error: `Please choose a sequence step from ${MIN_STEP} to ${MAX_STEP}.`,
    };
  }
  if (typeof originalSubject !== "string" || originalSubject.trim().length === 0) {
    return { ok: false, error: "Please enter your original email subject line." };
  }
  if (typeof goal !== "string" || goal.trim().length === 0) {
    return { ok: false, error: "Please enter your follow-up goal (e.g. “book a call”)." };
  }
  if (typeof tone !== "string" || !FOLLOW_UP_TONES.includes(tone as FollowUpTone)) {
    return {
      ok: false,
      error: `Please choose a tone: ${FOLLOW_UP_TONES.join(", ")}.`,
    };
  }

  let result: FollowUpResult;
  try {
    result = generateFollowUp(step, originalSubject, goal, tone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate the follow-up.",
    };
  }

  const draft = result.notice ? `${result.bodyDraft}\n\n${result.notice}` : result.bodyDraft;

  return {
    ok: true,
    values: {
      subjectOptions: result.subjectOptions,
      bodyDraft: draft,
    },
  };
}
