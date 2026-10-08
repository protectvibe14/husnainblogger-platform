/**
 * Sponsorship Pitch Email Generator — pure logic (tool-436).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic pitch-email assembly from FIXED
 *   template banks (see SUBJECTS, PITCH_TEMPLATES, FOLLOW_UP_TEMPLATES).
 *   No AI, no network, no backend.
 * - This is the general sponsorship ASK: YOU seek a sponsor for your
 *   asset. The opposite direction (you SELL newsletter ad slots) is
 *   the Newsletter Sponsorship Pitch Generator (tool-419).
 * - Bank sizes: 6 fixed subject templates; 4 tones x 2 pitch templates
 *   = 8 pitch templates; 4 follow-up nudge templates (one per tone).
 * - Slots: {asset} (from the yourAsset enum), {sponsorType}, {ask}.
 *   No follower counts, rates, or performance stats are invented — the
 *   tool never inserts numbers you did not type.
 *
 * Edge-case handling (shared validation rules):
 * - Overlong inputs trimmed to MAX_INPUT_CHARS (code points) with a
 *   visible notice, never silently dropped.
 * - Repeated-word guard on generated lines; user input sanitized to
 *   plain text before insertion.
 */

export type AssetKind = "blog" | "podcast" | "event" | "newsletter";
export type PitchTone = "friendly" | "professional" | "playful" | "urgent";

export const ASSET_KINDS: readonly AssetKind[] = [
  "blog",
  "podcast",
  "event",
  "newsletter",
];

export const PITCH_TONES: readonly PitchTone[] = [
  "friendly",
  "professional",
  "playful",
  "urgent",
];

/** Max code points kept from a user input; excess is trimmed with notice. */
export const MAX_INPUT_CHARS = 200;

/** Asset display labels used inside templates. */
export const ASSET_LABELS: Record<AssetKind, string> = {
  blog: "blog",
  podcast: "podcast",
  event: "event",
  newsletter: "newsletter",
};

/**
 * Fixed subject templates: 6. Slots: {sponsorType}, {asset}.
 * NOT AI-generated copy.
 */
export const SUBJECTS: readonly string[] = [
  "Sponsorship opportunity for {sponsorType} on my {asset}",
  "Quick pitch: partnering with my {asset} ({sponsorType})",
  "Interested in sponsoring my {asset}, {sponsorType}?",
  "A {asset} sponsorship idea for {sponsorType}",
  "Partnership proposal: my {asset} x {sponsorType}",
  "{sponsorType} + my {asset}: a sponsorship worth 5 minutes",
];

/**
 * Fixed pitch email templates: 4 tones x 2 = 8.
 * Slots: {asset}, {sponsorType}, {ask}.
 */
export const PITCH_TEMPLATES: Record<PitchTone, readonly string[]> = {
  friendly: [
    "Hi {sponsorType} team,\n\nI run a {asset} that your customers already read/listen to/attend, and I think we'd be a great fit.\n\nHere's what I have in mind: {ask}. Simple, honest, and built around your goals.\n\nWould you be open to a quick 15-minute chat this week? I'd love to share a few ideas tailored to {sponsorType}.\n\nWarm regards",
    "Hello!\n\nI'm reaching out because my {asset} speaks directly to the audience {sponsorType} serves.\n\nMy proposal: {ask}.\n\nIf that sounds interesting, I'd love to send over a one-page summary. Are you the right person to talk to?\n\nThanks so much",
  ],
  professional: [
    "Dear {sponsorType} partnerships team,\n\nI am writing to propose a sponsorship collaboration between {sponsorType} and my {asset}.\n\nProposal summary: {ask}.\n\nI would welcome a brief call to discuss audience alignment, deliverables, and measurement. Please let me know a convenient time.\n\nKind regards",
    "Hello {sponsorType},\n\nMy {asset} reaches an engaged audience in your market, and I would like to explore a sponsorship partnership.\n\nWhat I am proposing: {ask}.\n\nI can provide audience details and past partnership examples on request. May I send a short deck?\n\nBest regards",
  ],
  playful: [
    "Hey {sponsorType}!\n\nPlot twist: your next favorite marketing channel is my {asset}.\n\nHere's the pitch, short and sweet: {ask}.\n\nWant the fun version with all the details? Reply \"tell me more\" and I'll send it over.\n\nCheers",
    "Hi there, {sponsorType} team!\n\nWhat if your brand showed up exactly where your customers already hang out — my {asset}?\n\nThe idea: {ask}.\n\nNo boring decks, I promise. Just a quick chat about what could work for {sponsorType}.\n\nTalk soon",
  ],
  urgent: [
    "Hi {sponsorType},\n\nQuick one: I have a sponsorship slot opening on my {asset}, and {sponsorType} is my first choice.\n\nThe opportunity: {ask}.\n\nSlots like this go fast — can we talk this week before I open it up elsewhere?\n\nThanks",
    "Hello {sponsorType} team,\n\nI'm finalizing sponsors for my {asset} this month, and I'd love {sponsorType} on board.\n\nHere's what's on the table: {ask}.\n\nIf you're interested, let's lock in a call in the next few days — happy to move at your pace after that.\n\nBest",
  ],
};

/**
 * Fixed follow-up nudge templates: 4 (one per tone).
 * Slots: {sponsorType}, {asset}.
 */
export const FOLLOW_UP_TEMPLATES: Record<PitchTone, string> = {
  friendly:
    "Hi again! Just floating my sponsorship note back to the top of your inbox. My {asset} would love to feature {sponsorType} — still open to a quick chat?",
  professional:
    "Following up on my sponsorship proposal for {sponsorType} on my {asset}. Please let me know if you would like the one-page summary or a brief call.",
  playful:
    "Bumping this up — my {asset} x {sponsorType} idea is too good to lose to inbox zero. Still game for a quick chat?",
  urgent:
    "Quick follow-up: the {asset} sponsorship slot I mentioned for {sponsorType} is still open this week. Shall we talk before it closes?",
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

export interface PitchResult {
  subjectOptions: string[];
  pitchEmail: string;
  followUpNudge: string;
  notice: string | null;
}

export function generatePitchEmail(
  yourAsset: string,
  sponsorType: string,
  ask: string,
  tone: string,
): PitchResult {
  if (!ASSET_KINDS.includes(yourAsset as AssetKind)) {
    throw new RangeError(`yourAsset must be one of: ${ASSET_KINDS.join(", ")}.`);
  }
  if (typeof sponsorType !== "string" || sponsorType.trim().length === 0) {
    throw new RangeError("sponsorType must not be empty or whitespace-only.");
  }
  if (typeof ask !== "string" || ask.trim().length === 0) {
    throw new RangeError("ask must not be empty or whitespace-only.");
  }
  if (!PITCH_TONES.includes(tone as PitchTone)) {
    throw new RangeError(`tone must be one of: ${PITCH_TONES.join(", ")}.`);
  }

  const [sponsorVal, sTrim] = trimInput(sponsorType);
  const [askVal, aTrim] = trimInput(ask);
  const sponsor = sanitizePlain(sponsorVal);
  const askClean = sanitizePlain(askVal);
  const asset = ASSET_LABELS[yourAsset as AssetKind];

  const subjectOptions: string[] = [];
  for (const t of SUBJECTS) {
    const line = t.replaceAll("{sponsorType}", sponsor).replaceAll("{asset}", asset);
    if (hasRepeatedWords(line)) continue;
    subjectOptions.push(line);
  }

  // Pick the pitch template deterministically from a code-point hash of inputs.
  let h = 0;
  for (const ch of sponsor + askClean) {
    h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  }
  const toneTemplates = PITCH_TEMPLATES[tone as PitchTone];
  const pitchEmail = toneTemplates[h % toneTemplates.length]
    .replaceAll("{asset}", asset)
    .replaceAll("{sponsorType}", sponsor)
    .replaceAll("{ask}", askClean);

  const followUpNudge = FOLLOW_UP_TEMPLATES[tone as PitchTone]
    .replaceAll("{sponsorType}", sponsor)
    .replaceAll("{asset}", asset);

  const notice =
    sTrim || aTrim
      ? "Note: an overlong input was trimmed to 200 characters. Nothing was dropped silently."
      : null;

  return { subjectOptions, pitchEmail, followUpNudge, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { yourAsset, sponsorType, ask, tone }
 * values out: { subjectOptions, pitchEmail, followUpNudge }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { yourAsset, sponsorType, ask, tone } = values;

  if (typeof yourAsset !== "string" || !ASSET_KINDS.includes(yourAsset as AssetKind)) {
    return { ok: false, error: `Please choose your asset: ${ASSET_KINDS.join(", ")}.` };
  }
  if (typeof sponsorType !== "string" || sponsorType.trim().length === 0) {
    return { ok: false, error: "Please enter the sponsor type (e.g. “meal-kit brands”)." };
  }
  if (typeof ask !== "string" || ask.trim().length === 0) {
    return { ok: false, error: "Please describe your ask (e.g. “a 60-second mid-roll mention”)." };
  }
  if (typeof tone !== "string" || !PITCH_TONES.includes(tone as PitchTone)) {
    return { ok: false, error: `Please choose a tone: ${PITCH_TONES.join(", ")}.` };
  }

  let result: PitchResult;
  try {
    result = generatePitchEmail(yourAsset, sponsorType, ask, tone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate sponsorship pitch.",
    };
  }

  const pitchEmail = result.notice
    ? result.pitchEmail + "\n\n" + result.notice
    : result.pitchEmail;

  return {
    ok: true,
    values: {
      subjectOptions: result.subjectOptions,
      pitchEmail,
      followUpNudge: result.followUpNudge,
    },
  };
}
