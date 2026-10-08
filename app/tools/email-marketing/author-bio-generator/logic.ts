/**
 * Author Bio Generator (tool-443) — pure logic, zero imports,
 * zero network, zero DOM, no randomness.
 *
 * WHAT THIS IS (honesty, enforced):
 * - Generates a first-draft author bio from FIXED hand-written templates.
 *   NOT AI copy, NOT personalized beyond slot substitution.
 * - Bank size: 3 target lengths (50 / 100 / 200 words) x 2 points of view
 *   (first / third) = 6 bio templates. Same inputs always produce the same
 *   bio — verified by tests.
 * - The `wordCount` output is the ACTUAL word count of the generated bio
 *   (whitespace-separated tokens), not a promise: inserted names, expertise
 *   phrases, and publications shift the total, so the label is the target
 *   and the number is the truth.
 * - Slots: {name}, {firstName}, {expertise}, {expertiseLower}, {pubSentence}.
 *   Publications are optional: an empty value falls back to a fixed generic
 *   sentence, so no placeholder is ever rendered blank.
 * - Sanitization: HTML tags are stripped from user inputs before insertion.
 *
 * Edge-case handling (shared validation rules):
 * - Lengths measured in Unicode code points ([...s].length) so emoji and
 *   CJK/RTL text are counted correctly, never split mid-surrogate.
 * - Overlong inputs trimmed to MAX_INPUT_CHARS with a visible notice
 *   appended to the bio — never dropped silently.
 * - Generated bio scanned for accidental adjacent duplicate words; any hit
 *   is reported in a visible "[Review flags]" line.
 */

export type BioLength = "50" | "100" | "200";
export type BioPov = "first" | "third";

export const BIO_LENGTHS: readonly BioLength[] = ["50", "100", "200"];
export const BIO_POVS: readonly BioPov[] = ["first", "third"];

/** Max Unicode code points kept from a user input; excess is trimmed. */
export const MAX_INPUT_CHARS = 300;

interface BioSlots {
  name: string;
  firstName: string;
  expertise: string;
  expertiseLower: string;
  pubSentence: string;
}

/**
 * Fixed bio template bank: 3 lengths x 2 points of view = 6 templates.
 * Hand-written, assembled deterministically — NOT AI-generated copy.
 * Length labels are targets; the real count is reported honestly.
 */
export const BIO_TEMPLATES: Record<BioLength, Record<BioPov, string>> = {
  "50": {
    first:
      "I am {name}, a {expertise}. I write about {expertiseLower} — breaking down complex ideas into practical, usable advice. {pubSentence} When I am not writing, I am researching, testing, and talking to people in the field. Connect with me for {expertiseLower} tips you can actually use.",
    third:
      "{name} is a {expertise}. They write about {expertiseLower} — breaking down complex ideas into practical, usable advice. {pubSentence} When they are not writing, they are researching, testing, and talking to people in the field. Follow them for {expertiseLower} tips you can actually use.",
  },
  "100": {
    first:
      "I am {name}, a {expertise}. I write about {expertiseLower} — breaking down complex ideas into practical, usable advice. {pubSentence} When I am not writing, I am researching, testing, and talking to people in the field.\n\nMy goal is simple: save you the trial and error. Every guide I publish comes from hands-on work — tested methods, real examples, and honest notes on what did not work. I believe {expertiseLower} should be accessible to everyone, not just insiders. That is why I write in plain language, show my process step by step, and answer reader questions in every post.",
    third:
      "{name} is a {expertise}. They write about {expertiseLower} — breaking down complex ideas into practical, usable advice. {pubSentence} When they are not writing, they are researching, testing, and talking to people in the field.\n\nTheir goal is simple: save readers the trial and error. Every guide they publish comes from hands-on work — tested methods, real examples, and honest notes on what did not work. They believe {expertiseLower} should be accessible to everyone, not just insiders. That is why they write in plain language, show the process step by step, and answer reader questions in every post.",
  },
  "200": {
    first:
      "I am {name}, a {expertise}. I write about {expertiseLower} — breaking down complex ideas into practical, usable advice. {pubSentence} When I am not writing, I am researching, testing, and talking to people in the field.\n\nMy goal is simple: save you the trial and error. Every guide I publish comes from hands-on work — tested methods, real examples, and honest notes on what did not work. I believe {expertiseLower} should be accessible to everyone, not just insiders. That is why I write in plain language, show my process step by step, and answer reader questions in every post.\n\nBefore blogging, I spent years learning {expertiseLower} the hard way — through projects, mistakes, and late-night experiments. That experience shapes everything published here: no theory without practice, no claims without testing. Today, {firstName} helps readers get better at {expertiseLower} through weekly articles, free resources, and an open inbox. The mission has not changed since day one: useful content, zero fluff, and respect for your time.",
    third:
      "{name} is a {expertise}. They write about {expertiseLower} — breaking down complex ideas into practical, usable advice. {pubSentence} When they are not writing, they are researching, testing, and talking to people in the field.\n\nTheir goal is simple: save readers the trial and error. Every guide they publish comes from hands-on work — tested methods, real examples, and honest notes on what did not work. They believe {expertiseLower} should be accessible to everyone, not just insiders. That is why they write in plain language, show the process step by step, and answer reader questions in every post.\n\nBefore blogging, {name} spent years learning {expertiseLower} the hard way — through projects, mistakes, and late-night experiments. That experience shapes everything published here: no theory without practice, no claims without testing. Today, they help readers get better at {expertiseLower} through weekly articles, free resources, and an open inbox. The mission has not changed since day one: useful content, zero fluff, and respect for your time.",
  },
};

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

/** Honest word count: whitespace-separated tokens of the final bio. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function fillSlots(template: string, slots: BioSlots): string {
  return template
    .replaceAll("{name}", slots.name)
    .replaceAll("{firstName}", slots.firstName)
    .replaceAll("{expertise}", slots.expertise)
    .replaceAll("{expertiseLower}", slots.expertiseLower)
    .replaceAll("{pubSentence}", slots.pubSentence);
}

export interface BioResult {
  bio: string;
  wordCount: number;
}

/**
 * Core generator. Throws RangeError on invalid input; runTool converts
 * those into the { ok: false, error } contract shape.
 */
export function generateBio(
  name: string,
  expertise: string,
  publications: string,
  length: string,
  pov: string,
): BioResult {
  if (typeof name !== "string" || stripTags(name).trim().length === 0) {
    throw new RangeError("name must not be empty or whitespace-only.");
  }
  if (typeof expertise !== "string" || stripTags(expertise).trim().length === 0) {
    throw new RangeError("expertise must not be empty or whitespace-only.");
  }
  if (!BIO_LENGTHS.includes(length as BioLength)) {
    throw new RangeError(`length must be one of: ${BIO_LENGTHS.join(", ")} (words).`);
  }
  if (!BIO_POVS.includes(pov as BioPov)) {
    throw new RangeError(`pov must be one of: ${BIO_POVS.join(", ")}.`);
  }

  const [cleanName, nameTrimmed] = cleanInput(name);
  const [cleanExpertise, expertiseTrimmed] = cleanInput(expertise);
  const [cleanPubs, pubsTrimmed] = cleanInput(publications ?? "");
  const p = pov as BioPov;

  const pubSentence =
    cleanPubs.length > 0
      ? p === "first"
        ? `My work has appeared in ${cleanPubs}.`
        : `Their work has appeared in ${cleanPubs}.`
      : p === "first"
        ? "I share lessons from real projects, not textbooks."
        : "They share lessons from real projects, not textbooks.";

  const slots: BioSlots = {
    name: cleanName,
    firstName: cleanName.split(/\s+/)[0] ?? cleanName,
    expertise: cleanExpertise,
    expertiseLower: cleanExpertise.toLowerCase(),
    pubSentence,
  };

  let bio = fillSlots(BIO_TEMPLATES[length as BioLength][p], slots);

  const notices: string[] = [];
  if (nameTrimmed || expertiseTrimmed || pubsTrimmed) {
    notices.push(
      `Note: an overlong input was trimmed to ${MAX_INPUT_CHARS} characters. Nothing was dropped silently.`,
    );
  }
  if (hasRepeatedWords(bio)) {
    notices.push(
      "Review flag: the bio contains a repeated word — please fix it before publishing.",
    );
  }
  if (notices.length > 0) {
    bio += "\n\n[" + notices.join(" ") + "]";
  }

  return { bio, wordCount: countWords(bio) };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { name, expertise, publications?, length, pov }
 * values out: { bio, wordCount }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { name, expertise, publications, length, pov } = values;
  if (typeof name !== "string" || stripTags(name).trim().length === 0) {
    return { ok: false, error: "Please enter the author name." };
  }
  if (typeof expertise !== "string" || stripTags(expertise).trim().length === 0) {
    return { ok: false, error: "Please describe the author’s expertise." };
  }
  if (typeof length !== "string" || !BIO_LENGTHS.includes(length as BioLength)) {
    return { ok: false, error: `Please choose a length: ${BIO_LENGTHS.join(", ")} words.` };
  }
  if (typeof pov !== "string" || !BIO_POVS.includes(pov as BioPov)) {
    return { ok: false, error: `Please choose a point of view: ${BIO_POVS.join(", ")}.` };
  }

  let result: BioResult;
  try {
    result = generateBio(name, expertise, (publications as string) ?? "", length, pov);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate the author bio.",
    };
  }

  return {
    ok: true,
    values: { bio: result.bio, wordCount: result.wordCount },
  };
}
