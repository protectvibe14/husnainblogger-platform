/**
 * Referral Email Generator — pure logic (tool-433).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic REFERRAL EMAIL copy assembly from
 *   FIXED template banks (see SUBJECTS, BODY_TEMPLATES, SHARE_BLOCK).
 *   No AI, no network, no backend. This is email copy only — it is NOT
 *   the Referral Program Planner (tool-491), which plans program
 *   mechanics like reward tiers and rules.
 * - Bank sizes: 4 tones x 5 subject templates = 20 subjects;
 *   4 body templates (one per tone); 1 fixed share-block template.
 * - Slots: {programName}, {reward}, {audience}. The share block uses a
 *   visible "[your referral link here]" placeholder — it is never left
 *   as an unresolved token.
 *
 * Edge-case handling (shared validation rules):
 * - Overlong inputs trimmed to MAX_INPUT_CHARS (code points) with a
 *   visible notice, never silently dropped.
 * - Repeated-word guard on generated lines; user input sanitized to
 *   plain text before insertion.
 */

export type ReferralTone = "friendly" | "professional" | "playful" | "urgent";

export const REFERRAL_TONES: readonly ReferralTone[] = [
  "friendly",
  "professional",
  "playful",
  "urgent",
];

/** Max code points kept from a user input; excess is trimmed with notice. */
export const MAX_INPUT_CHARS = 200;

/**
 * Fixed subject-line templates: 4 tones x 5 = 20 templates.
 * Slots: {programName}, {reward}. NOT AI-generated copy.
 */
export const SUBJECTS: Record<ReferralTone, readonly string[]> = {
  friendly: [
    "Share {programName} with a friend — you both get {reward}",
    "Your friends would love {programName} (and you'll get {reward})",
    "{programName} is better with friends — earn {reward}",
    "Invite a friend to {programName}, get {reward} together",
    "Pass it on: {reward} is waiting for you and a friend",
  ],
  professional: [
    "Refer a colleague to {programName} and receive {reward}",
    "The {programName} referral program: earn {reward}",
    "Invite your network to {programName} — {reward} per referral",
    "{programName} rewards you with {reward} for each referral",
    "Your {programName} referral link is ready — earn {reward}",
  ],
  playful: [
    "Don't hog {programName} — share it, snag {reward}",
    "{programName} + your best friend = {reward} for both",
    "Spread the word, stack the rewards: {reward} inside",
    "Your friends are missing out on {programName} (and you're missing {reward})",
    "One share = {reward}. That's the {programName} deal.",
  ],
  urgent: [
    "Last chance: refer to {programName} and claim {reward}",
    "{programName} referral bonus {reward} ends soon — invite now",
    "Don't leave {reward} on the table — share {programName} today",
    "Refer a friend to {programName} before this {reward} expires",
    "Quick: your {programName} referral earns {reward} — today only",
  ],
};

/**
 * Fixed body templates: 4 (one per tone).
 * Slots: {programName}, {reward}, {audience}.
 */
export const BODY_TEMPLATES: Record<ReferralTone, string> = {
  friendly:
    "Hi there!\n\nLove {programName}? As one of our favorite {audience}, we'd love your help spreading the word.\n\nHere's how it works: share your personal referral link with a friend. When they join {programName}, you BOTH get {reward}. No limit on how many friends you can invite.\n\nThanks for being part of the community!",
  professional:
    "Hello,\n\nWe invite you to participate in the {programName} referral program, designed for our {audience}.\n\nProcess: share your unique referral link. For each new member who joins {programName} through your link, you will receive {reward}, and your referral receives {reward} as well.\n\nThank you for your continued trust.",
  playful:
    "Psst — got a minute?\n\nYou're officially one of our favorite {audience}, so we're handing you the keys to the {programName} referral vault.\n\nShare your link. Friend joins. You both pocket {reward}. It's basically free stuff for being popular.\n\nGo on, be the hero of your group chat.",
  urgent:
    "Quick heads-up:\n\nThe {programName} referral bonus is live for our {audience} — but not forever.\n\nShare your link now: every friend who joins {programName} through you earns you {reward}, and they get {reward} too.\n\nDon't wait — send your first invite today.",
};

/** Fixed share block appended to the email. Visible fallback placeholder, never empty. */
export const SHARE_BLOCK =
  "Know someone who'd love {programName}? Forward this email or share your personal link:\n[your referral link here]\n\nWhen they join using your link, you both get {reward}.";

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

function trimInput(raw: unknown): [string, boolean] {
  const s = String(raw).trim();
  if ([...s].length > MAX_INPUT_CHARS) {
    return [takeCodePoints(s, MAX_INPUT_CHARS).trimEnd(), true];
  }
  return [s, false];
}

/** Strip HTML tags from user input so output stays plain text. */
export function sanitizePlain(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim();
}

export interface ReferralResult {
  subjectOptions: string[];
  bodyDraft: string;
  shareBlock: string;
  notice: string | null;
}

export function generateReferralEmail(
  programName: string,
  reward: string,
  audience: string,
  tone: string,
): ReferralResult {
  if (typeof programName !== "string" || programName.trim().length === 0) {
    throw new RangeError("programName must not be empty or whitespace-only.");
  }
  if (typeof reward !== "string" || reward.trim().length === 0) {
    throw new RangeError("reward must not be empty or whitespace-only.");
  }
  if (typeof audience !== "string" || audience.trim().length === 0) {
    throw new RangeError("audience must not be empty or whitespace-only.");
  }
  if (!REFERRAL_TONES.includes(tone as ReferralTone)) {
    throw new RangeError(`tone must be one of: ${REFERRAL_TONES.join(", ")}.`);
  }

  const [nameVal, nTrim] = trimInput(programName);
  const [rewardVal, rTrim] = trimInput(reward);
  const [audienceVal, aTrim] = trimInput(audience);
  const name = sanitizePlain(nameVal);
  const rew = sanitizePlain(rewardVal);
  const aud = sanitizePlain(audienceVal);

  const subjectOptions: string[] = [];
  for (const t of SUBJECTS[tone as ReferralTone]) {
    const line = t.replaceAll("{programName}", name).replaceAll("{reward}", rew);
    if (hasRepeatedWords(line)) continue;
    subjectOptions.push(line);
  }

  const bodyDraft = BODY_TEMPLATES[tone as ReferralTone]
    .replaceAll("{programName}", name)
    .replaceAll("{reward}", rew)
    .replaceAll("{audience}", aud);

  const shareBlock = SHARE_BLOCK
    .replaceAll("{programName}", name)
    .replaceAll("{reward}", rew);

  const notice =
    nTrim || rTrim || aTrim
      ? "Note: an overlong input was trimmed to 200 characters. Nothing was dropped silently."
      : null;

  return { subjectOptions, bodyDraft, shareBlock, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { programName, reward, audience, tone }
 * values out: { subjectOptions, bodyDraft, shareBlock }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { programName, reward, audience, tone } = values;

  if (typeof programName !== "string" || programName.trim().length === 0) {
    return { ok: false, error: "Please enter your referral program's name." };
  }
  if (typeof reward !== "string" || reward.trim().length === 0) {
    return { ok: false, error: "Please enter the reward (e.g. “$20 credit”)." };
  }
  if (typeof audience !== "string" || audience.trim().length === 0) {
    return { ok: false, error: "Please describe your audience (e.g. “loyal customers”)." };
  }
  if (typeof tone !== "string" || !REFERRAL_TONES.includes(tone as ReferralTone)) {
    return { ok: false, error: `Please choose a tone: ${REFERRAL_TONES.join(", ")}.` };
  }

  let result: ReferralResult;
  try {
    result = generateReferralEmail(programName, reward, audience, tone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate referral email.",
    };
  }

  const bodyDraft = result.notice
    ? result.bodyDraft + "\n\n" + result.notice
    : result.bodyDraft;

  return {
    ok: true,
    values: {
      subjectOptions: result.subjectOptions,
      bodyDraft,
      shareBlock: result.shareBlock,
    },
  };
}
