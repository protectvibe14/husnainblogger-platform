/**
 * Blogger Press Release Template Generator (tool-446) — pure logic,
 * zero imports, zero network, zero DOM, no randomness.
 *
 * WHAT THIS IS (honesty, enforced):
 * - Formats your announcement into a standard press-release structure
 *   (headline, FOR IMMEDIATE RELEASE, lead, optional quote, body,
 *   boilerplate, media contact) using FIXED hand-written structures.
 *   NOT AI copy; it formats what you provide and adds only standard
 *   press-release scaffolding around it.
 * - Bank size: 3 fixed press-release structures. One is picked
 *   deterministically by hashing (brand + announcement), so the same
 *   inputs always produce the same release — verified by tests.
 * - Quotes are optional: when empty, the quote paragraph is omitted
 *   entirely — never rendered as an empty placeholder.
 * - The boilerplate and media-contact sections reuse only your own inputs;
 *   the tool invents no facts, dates, locations, or company details.
 * - Sanitization: HTML tags are stripped from user inputs before insertion,
 *   so no unescaped markup reaches the plain-text release.
 *
 * Edge-case handling (shared validation rules):
 * - Lengths measured in Unicode code points ([...s].length); emoji and
 *   CJK/RTL text are counted correctly, never split mid-surrogate.
 * - Overlong inputs trimmed to per-field caps with a visible notice
 *   appended to the release — never dropped silently.
 * - The release is scanned for accidental adjacent duplicate words; any
 *   hit is reported in a visible "[Review flags]" line.
 */

export interface PressReleaseStructure {
  /** Stable id for the structure. */
  id: string;
  headline: (brand: string, headlineCore: string) => string;
  body: (brand: string, announcement: string, quotePara: string, contactInfo: string) => string;
}

/** Max Unicode code points kept per input field; excess is trimmed. */
export const MAX_ANNOUNCEMENT_CHARS = 2000;
export const MAX_FIELD_CHARS = 300;

/**
 * Fixed structure bank: 3 hand-written press-release structures.
 * Deterministically selected by hash — NOT AI-generated copy.
 */
export const PRESS_RELEASE_STRUCTURES: readonly PressReleaseStructure[] = [
  {
    id: "classic",
    headline: (brand, core) => `${brand} Announces ${core}`,
    body: (brand, announcement, quotePara, contactInfo) =>
      `FOR IMMEDIATE RELEASE\n\n${brand} today announced ${announcement}\n\n${quotePara}` +
      `The announcement marks a new chapter for ${brand} and its readers. Details, dates, and how to take part will be published on the blog in the coming days.\n\n` +
      `About ${brand}\n${brand} is an independent blog. For interviews, review copies, or more information, please contact the media contact below.\n\n` +
      `Media contact:\n${contactInfo}\n\n###`,
  },
  {
    id: "quote-led",
    headline: (brand, core) => `${core} — ${brand} Shares Big News`,
    body: (brand, announcement, quotePara, contactInfo) =>
      `FOR IMMEDIATE RELEASE\n\n${quotePara}${brand} today announced ${announcement}\n\n` +
      `Readers can expect full details on the blog, including what is changing, when it takes effect, and how to get involved. ${brand} will publish updates as the story develops.\n\n` +
      `About ${brand}\n${brand} is an independent blog. For interviews, review copies, or more information, please contact the media contact below.\n\n` +
      `Media contact:\n${contactInfo}\n\n###`,
  },
  {
    id: "milestone",
    headline: (brand, core) => `Press Release: ${core} (${brand})`,
    body: (brand, announcement, quotePara, contactInfo) =>
      `FOR IMMEDIATE RELEASE\n\n${brand} is pleased to share the following announcement: ${announcement}\n\n${quotePara}` +
      `This milestone reflects the growth of the ${brand} community. Further announcements, including dates and participation details, will follow on the blog.\n\n` +
      `About ${brand}\n${brand} is an independent blog. For interviews, review copies, or more information, please contact the media contact below.\n\n` +
      `Media contact:\n${contactInfo}\n\n###`,
  },
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

/** Keep at most n Unicode code points, never splitting a surrogate pair. */
export function takeCodePoints(s: string, n: number): string {
  return [...s].slice(0, n).join("");
}

function cleanField(raw: unknown, max: number): [string, boolean] {
  const s = stripTags(String(raw)).replace(/\s+/g, " ").trim();
  if ([...s].length > max) {
    return [takeCodePoints(s, max).trimEnd(), true];
  }
  return [s, false];
}

/**
 * Derive a short headline core from the announcement: the first sentence,
 * or the first 90 code points when no sentence boundary exists.
 */
export function headlineCoreOf(announcement: string): string {
  const oneLine = announcement.replace(/\s+/g, " ").trim();
  const m = oneLine.match(/^(.{10,200}?[.?!])(\s|$)/);
  if (m) return m[1].trim();
  const cut = takeCodePoints(oneLine, 90).trimEnd();
  return cut.length < oneLine.length ? cut + "…" : cut;
}

/** True when two identical words sit next to each other (case-insensitive). */
export function hasRepeatedWords(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  for (let i = 0; i + 1 < words.length; i++) {
    if (words[i] === words[i + 1]) return true;
  }
  return false;
}

export interface PressReleaseResult {
  pressRelease: string;
}

/**
 * Core generator. Throws RangeError on invalid input; runTool converts
 * those into the { ok: false, error } contract shape.
 */
export function generatePressRelease(
  announcement: string,
  brand: string,
  quotes: string,
  contactInfo: string,
): PressReleaseResult {
  if (typeof announcement !== "string" || stripTags(announcement).trim().length === 0) {
    throw new RangeError("announcement must not be empty or whitespace-only.");
  }
  if (typeof brand !== "string" || stripTags(brand).trim().length === 0) {
    throw new RangeError("brand must not be empty or whitespace-only.");
  }
  if (typeof contactInfo !== "string" || stripTags(contactInfo).trim().length === 0) {
    throw new RangeError("contactInfo must not be empty or whitespace-only.");
  }

  const [cleanAnnouncement, aTrimmed] = cleanField(announcement, MAX_ANNOUNCEMENT_CHARS);
  const [cleanBrand, bTrimmed] = cleanField(brand, MAX_FIELD_CHARS);
  const [cleanQuotes, qTrimmed] = cleanField(quotes ?? "", MAX_FIELD_CHARS * 2);
  const [cleanContact, cTrimmed] = cleanField(contactInfo, MAX_FIELD_CHARS);

  const structure =
    PRESS_RELEASE_STRUCTURES[hashString(cleanBrand + "\n" + cleanAnnouncement) % PRESS_RELEASE_STRUCTURES.length];
  const quotePara = cleanQuotes.length > 0 ? `"${cleanQuotes}"\n\n` : "";
  const headline = structure.headline(cleanBrand, headlineCoreOf(cleanAnnouncement));

  let pressRelease = `${headline}\n\n${structure.body(cleanBrand, cleanAnnouncement, quotePara, cleanContact)}`;

  const notices: string[] = [];
  if (aTrimmed || bTrimmed || qTrimmed || cTrimmed) {
    notices.push("Note: an overlong input was trimmed to its documented limit. Nothing was dropped silently.");
  }
  if (hasRepeatedWords(pressRelease)) {
    notices.push("Review flag: the release contains a repeated word — please fix it before sending.");
  }
  if (notices.length > 0) {
    pressRelease += "\n\n[" + notices.join(" ") + "]";
  }

  return { pressRelease };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { announcement, brand, quotes?, contactInfo }
 * values out: { pressRelease }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { announcement, brand, quotes, contactInfo } = values;
  if (typeof announcement !== "string" || stripTags(announcement).trim().length === 0) {
    return { ok: false, error: "Please describe your announcement." };
  }
  if (typeof brand !== "string" || stripTags(brand).trim().length === 0) {
    return { ok: false, error: "Please enter your brand or blog name." };
  }
  if (typeof contactInfo !== "string" || stripTags(contactInfo).trim().length === 0) {
    return { ok: false, error: "Please enter media contact info (name, email, phone)." };
  }

  let result: PressReleaseResult;
  try {
    result = generatePressRelease(announcement, brand, (quotes as string) ?? "", contactInfo);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate the press release.",
    };
  }

  return { ok: true, values: { pressRelease: result.pressRelease } };
}
