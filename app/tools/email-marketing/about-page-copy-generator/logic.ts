/**
 * About Page Copy Generator (tool-442) — pure logic, zero imports,
 * zero network, zero DOM, no randomness.
 *
 * WHAT THIS IS (honesty, enforced):
 * - Generates a first-draft "about page" blurb from FIXED hand-written
 *   templates. NOT AI copy, NOT personalized beyond slot substitution.
 * - Bank sizes: 4 tones (professional, friendly, bold, playful) x 3 lengths
 *   (short, medium, long) = 12 about-copy templates, plus a fixed bank of
 *   10 headline templates (8 returned per run, start index rotated by a
 *   deterministic hash of the name). Same inputs always produce the same
 *   outputs — verified by tests.
 * - Slots: {name}, {firstName}, {role}, {roleLower}, {credSentence},
 *   {credPhrase}. Placeholder tokens are never rendered empty: credentials
 *   fall back to a per-tone generic phrase.
 * - Sanitization: HTML tags are stripped from user inputs before insertion,
 *   so no unescaped markup can reach the plain-text output.
 *
 * Edge-case handling (shared validation rules):
 * - Lengths are measured in Unicode code points ([...s].length), so emoji
 *   and CJK/RTL text are counted correctly, never split mid-surrogate.
 * - Overlong inputs are trimmed to MAX_INPUT_CHARS with a visible notice
 *   appended to the copy — never dropped silently.
 * - Generated copy is scanned for accidental adjacent duplicate words;
 *   any hit is reported in a visible "[Review flags]" line.
 */

export type AboutTone = "professional" | "friendly" | "bold" | "playful";
export type AboutLength = "short" | "medium" | "long";

export const ABOUT_TONES: readonly AboutTone[] = [
  "professional",
  "friendly",
  "bold",
  "playful",
];
export const ABOUT_LENGTHS: readonly AboutLength[] = ["short", "medium", "long"];

/** Max Unicode code points kept from a user input; excess is trimmed. */
export const MAX_INPUT_CHARS = 300;

/** Number of headline options returned per run. */
export const HEADLINE_COUNT = 8;

interface CopySlots {
  name: string;
  firstName: string;
  role: string;
  roleLower: string;
  credSentence: string;
  credPhrase: string;
}

/**
 * Fixed credentials fallback per tone — used when the user leaves the
 * credentials input empty, so no placeholder is ever rendered blank.
 */
const CRED_FALLBACK: Record<AboutTone, string> = {
  professional: "a practitioner who values tested ideas over hype",
  friendly: "just someone who loves figuring things out and sharing what works",
  bold: "years of doing the work, not just talking about it",
  playful: "professionally curious and unprofessionally obsessed with the details",
};

/**
 * Fixed about-copy template bank: 4 tones x 3 lengths = 12 templates.
 * Hand-written, assembled deterministically — NOT AI-generated copy.
 */
export const ABOUT_TEMPLATES: Record<AboutTone, Record<AboutLength, string>> = {
  professional: {
    short:
      "{name} is a {role}. {credSentence} This blog exists to give you practical, no-fluff guidance on {roleLower} — the strategies, the mistakes, and the systems that actually work. Expect tested ideas and clear next steps, every week.",
    medium:
      "{name} is a {role}. {credSentence} This blog exists to give you practical, no-fluff guidance on {roleLower} — the strategies, the mistakes, and the systems that actually work. Expect tested ideas and clear next steps, every week.\n\nI started this blog because most {roleLower} advice online is either too vague or too salesy. Here you get the middle path: honest, tested guidance that respects your time. What you will find: step-by-step breakdowns, real examples from my own work, and straight answers to the questions readers actually ask. Every post has one goal — to leave you with something you can use the same day.",
    long:
      "{name} is a {role}. {credSentence} This blog exists to give you practical, no-fluff guidance on {roleLower} — the strategies, the mistakes, and the systems that actually work. Expect tested ideas and clear next steps, every week.\n\nI started this blog because most {roleLower} advice online is either too vague or too salesy. Here you get the middle path: honest, tested guidance that respects your time. What you will find: step-by-step breakdowns, real examples from my own work, and straight answers to the questions readers actually ask. Every post has one goal — to leave you with something you can use the same day.\n\nWhat you will not find here: recycled listicles, hype without proof, or advice I would not follow myself. If I recommend something, I have tested it — or I will tell you exactly where the evidence ends. This blog is my public notebook as a {role}, and you are welcome to learn alongside me. New articles every week: bring your questions, leave with a plan.",
  },
  friendly: {
    short:
      "Hi, I am {firstName}! I am a {role}, and {credPhrase}. I started this blog to share everything I am learning about {roleLower} — the wins, the face-plants, and the lessons in between. Pull up a chair: new posts every week, written like we are chatting over coffee.",
    medium:
      "Hi, I am {firstName}! I am a {role}, and {credPhrase}. I started this blog to share everything I am learning about {roleLower} — the wins, the face-plants, and the lessons in between. Pull up a chair: new posts every week, written like we are chatting over coffee.\n\nWhy read here instead of anywhere else? Because I write the posts I wish someone had written for me. Short on jargon, long on examples, and always honest about what I do not know yet. Expect practical how-tos, behind-the-scenes stories, and the occasional strong opinion — all from real experience as a {role}.",
    long:
      "Hi, I am {firstName}! I am a {role}, and {credPhrase}. I started this blog to share everything I am learning about {roleLower} — the wins, the face-plants, and the lessons in between. Pull up a chair: new posts every week, written like we are chatting over coffee.\n\nWhy read here instead of anywhere else? Because I write the posts I wish someone had written for me. Short on jargon, long on examples, and always honest about what I do not know yet. Expect practical how-tos, behind-the-scenes stories, and the occasional strong opinion — all from real experience as a {role}.\n\nA little more about me: {credSentence} When I am not writing, I am experimenting, taking notes, and talking to people who know more than I do. This blog is where those notes become something useful for you. Say hello in the comments and tell me what you want covered next — this is a two-way conversation.",
  },
  bold: {
    short:
      "I am {name}, a {role} who tells it like it is. {credSentence} This blog cuts through the noise on {roleLower}. No guru talk, no recycled platitudes — just sharp, honest takes and tactics that survive contact with reality. If you want comfortable, look elsewhere.",
    medium:
      "I am {name}, a {role} who tells it like it is. {credSentence} This blog cuts through the noise on {roleLower}. No guru talk, no recycled platitudes — just sharp, honest takes and tactics that survive contact with reality. If you want comfortable, look elsewhere.\n\nMost advice in this space is designed to sell you something. Mine is designed to make you dangerous — informed, skeptical, and effective. I name names, I show receipts, and I admit when I get it wrong. Read this blog if you want the unfiltered version of {roleLower}.",
    long:
      "I am {name}, a {role} who tells it like it is. {credSentence} This blog cuts through the noise on {roleLower}. No guru talk, no recycled platitudes — just sharp, honest takes and tactics that survive contact with reality. If you want comfortable, look elsewhere.\n\nMost advice in this space is designed to sell you something. Mine is designed to make you dangerous — informed, skeptical, and effective. I name names, I show receipts, and I admit when I get it wrong. Read this blog if you want the unfiltered version of {roleLower}.\n\nFair warning: I will challenge conventional wisdom, including my own past advice. I will also never waste your time with filler — every article earns its place or it does not ship. My loyalty as a {role} is to readers, not trends, and my patience for bad advice is officially exhausted. I keep naming names, showing receipts, and updating old posts when the facts change. New posts weekly: bring skepticism, leave with an edge.",
  },
  playful: {
    short:
      "Hello, human! I am {name}, your friendly neighborhood {role}. {credSentence} Around here we talk {roleLower} — the good, the bad, and the hilariously wrong. Expect strong opinions, zero jargon, and posts that are actually fun to read. New mischief weekly.",
    medium:
      "Hello, human! I am {name}, your friendly neighborhood {role}. {credSentence} Around here we talk {roleLower} — the good, the bad, and the hilariously wrong. Expect strong opinions, zero jargon, and posts that are actually fun to read. New mischief weekly.\n\nThink of this blog as {roleLower} with the boring parts removed. I translate expert-speak into plain English, test the trendy tactics so you do not have to, and report back with receipts. There will be metaphors. There may be puns. There will definitely be useful stuff.",
    long:
      "Hello, human! I am {name}, your friendly neighborhood {role}. {credSentence} Around here we talk {roleLower} — the good, the bad, and the hilariously wrong. Expect strong opinions, zero jargon, and posts that are actually fun to read. New mischief weekly.\n\nThink of this blog as {roleLower} with the boring parts removed. I translate expert-speak into plain English, test the trendy tactics so you do not have to, and report back with receipts. There will be metaphors. There may be puns. There will definitely be useful stuff.\n\nThe fine print: I am a real {role}, not a content robot. {credSentence} Everything here is written by a human who genuinely enjoys this stuff — and it shows. Stick around for weekly posts, questionable analogies, and advice that actually works.",
  },
};

/**
 * Fixed headline template bank: 10 hand-written headline patterns.
 * 8 are returned per run, rotated from a deterministic start index.
 */
export const HEADLINE_TEMPLATES: readonly string[] = [
  "Meet {name}: {role}",
  "The story behind this blog",
  "Why {firstName} writes about {roleLower}",
  "{firstName}’s no-fluff guide to {roleLower}",
  "About {name}",
  "Real talk from a real {role}",
  "The person behind the posts",
  "What {name} believes about {roleLower}",
  "From {role} to blogger",
  "Why this blog exists",
];

/** Deterministic 32-bit FNV-1a hash over Unicode code points. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (const ch of s) {
    h ^= ch.codePointAt(0) as number;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Strip anything that looks like an HTML tag; keep plain text only. */
export function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

/** Keep at most MAX_INPUT_CHARS Unicode code points. */
export function takeCodePoints(s: string, n: number): string {
  return [...s].slice(0, n).join("");
}

function cleanInput(raw: unknown): [string, boolean] {
  const s = stripTags(String(raw)).trim();
  if ([...s].length > MAX_INPUT_CHARS) {
    return [takeCodePoints(s, MAX_INPUT_CHARS).trimEnd(), true];
  }
  return [s, false];
}

/** True when two identical words sit next to each other (case-insensitive). */
export function hasRepeatedWords(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  for (let i = 0; i + 1 < words.length; i++) {
    if (words[i] === words[i + 1]) return true;
  }
  return false;
}

function fillSlots(template: string, slots: CopySlots): string {
  return template
    .replaceAll("{name}", slots.name)
    .replaceAll("{firstName}", slots.firstName)
    .replaceAll("{role}", slots.role)
    .replaceAll("{roleLower}", slots.roleLower)
    .replaceAll("{credSentence}", slots.credSentence)
    .replaceAll("{credPhrase}", slots.credPhrase);
}

export interface AboutCopyResult {
  aboutCopy: string;
  headlineOptions: string[];
}

/**
 * Core generator. Throws RangeError on invalid input; runTool converts
 * those into the { ok: false, error } contract shape.
 */
export function generateAboutCopy(
  name: string,
  role: string,
  credentials: string,
  tone: string,
  length: string,
): AboutCopyResult {
  if (typeof name !== "string" || stripTags(name).trim().length === 0) {
    throw new RangeError("name must not be empty or whitespace-only.");
  }
  if (typeof role !== "string" || stripTags(role).trim().length === 0) {
    throw new RangeError("role must not be empty or whitespace-only.");
  }
  if (!ABOUT_TONES.includes(tone as AboutTone)) {
    throw new RangeError(`tone must be one of: ${ABOUT_TONES.join(", ")}.`);
  }
  if (!ABOUT_LENGTHS.includes(length as AboutLength)) {
    throw new RangeError(`length must be one of: ${ABOUT_LENGTHS.join(", ")}.`);
  }

  const [cleanName, nameTrimmed] = cleanInput(name);
  const [cleanRole, roleTrimmed] = cleanInput(role);
  const [cleanCreds, credsTrimmed] = cleanInput(credentials ?? "");
  const t = tone as AboutTone;

  const credPhrase = cleanCreds.length > 0 ? cleanCreds : CRED_FALLBACK[t];
  const slots: CopySlots = {
    name: cleanName,
    firstName: cleanName.split(/\s+/)[0] ?? cleanName,
    role: cleanRole,
    roleLower: cleanRole.toLowerCase(),
    credSentence: `My background: ${credPhrase}.`,
    credPhrase,
  };

  let aboutCopy = fillSlots(ABOUT_TEMPLATES[t][length as AboutLength], slots);

  const notices: string[] = [];
  if (nameTrimmed || roleTrimmed || credsTrimmed) {
    notices.push(
      `Note: an overlong input was trimmed to ${MAX_INPUT_CHARS} characters. Nothing was dropped silently.`,
    );
  }
  if (hasRepeatedWords(aboutCopy)) {
    notices.push(
      "Review flag: the draft contains a repeated word — please fix it before publishing.",
    );
  }
  if (notices.length > 0) {
    aboutCopy += "\n\n[" + notices.join(" ") + "]";
  }

  const start = hashString(cleanName) % HEADLINE_TEMPLATES.length;
  const headlineOptions: string[] = [];
  for (let i = 0; i < HEADLINE_COUNT; i++) {
    headlineOptions.push(
      fillSlots(HEADLINE_TEMPLATES[(start + i) % HEADLINE_TEMPLATES.length], slots),
    );
  }

  return { aboutCopy, headlineOptions };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { name, role, credentials?, tone, length }
 * values out: { aboutCopy, headlineOptions }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { name, role, credentials, tone, length } = values;
  if (typeof name !== "string" || stripTags(name).trim().length === 0) {
    return { ok: false, error: "Please enter your name as you want it shown." };
  }
  if (typeof role !== "string" || stripTags(role).trim().length === 0) {
    return { ok: false, error: "Please enter your role (e.g. “email marketing consultant”)." };
  }
  if (typeof tone !== "string" || !ABOUT_TONES.includes(tone as AboutTone)) {
    return { ok: false, error: `Please choose a tone: ${ABOUT_TONES.join(", ")}.` };
  }
  if (typeof length !== "string" || !ABOUT_LENGTHS.includes(length as AboutLength)) {
    return { ok: false, error: `Please choose a length: ${ABOUT_LENGTHS.join(", ")}.` };
  }

  let result: AboutCopyResult;
  try {
    result = generateAboutCopy(name, role, (credentials as string) ?? "", tone, length);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate about-page copy.",
    };
  }

  return {
    ok: true,
    values: {
      aboutCopy: result.aboutCopy,
      headlineOptions: result.headlineOptions,
    },
  };
}
