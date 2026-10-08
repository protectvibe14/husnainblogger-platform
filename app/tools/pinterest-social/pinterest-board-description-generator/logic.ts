/**
 * Pinterest Board Description Generator — pure logic (tool-352), zero
 * imports, zero network, zero DOM, zero randomness.
 *
 * TEMPLATE + KEYWORD-WEAVING, NOT AI: a description is assembled from
 * hand-written sentence templates. Your board name always opens the first
 * sentence; supplied keywords are woven into the middle sentences in
 * natural phrasing (never a comma/pipe-separated keyword list — those are
 * rejected at input validation).
 *
 * Bank sizes (documented so the UI can state them honestly):
 *   openers per tone  — 4 (friendly / professional / seo)
 *   value lines       — 8 shared (4 pair + 4 single) + 2 generic (no keywords)
 *   closers per tone  — 2 (friendly / professional / seo)
 *   TOTAL             — 12 openers + 10 value + 6 closers = 28 templates.
 *
 * Placeholders: {board} = board name, {kw1}/{kw2} = keywords.
 *
 * Honesty rules enforced here:
 * - Hard 500-char cap on the description. Sentences are added only while
 *   they fit; the closer is dropped first, then value lines, and the opener
 *   alone is truncated at a word boundary as a last resort.
 * - At most 6 keywords are woven in; extras are ignored (the sentence
 *   budget is fixed). This is stated in the UI, not silently exceeded.
 * - Keyword-stuffing is impossible by construction: keywords only appear
 *   inside sentences, and a single keyword containing "," or "|" is
 *   rejected outright (it looks like a pasted list).
 * - Non-Latin board names / keywords pass through unchanged.
 *
 * Deterministic: opener and closer are picked by a char-code hash of the
 * inputs; value lines cycle in bank order. Same inputs -> same output.
 */

export type BoardDescTone = "friendly" | "professional" | "seo";

/** Valid tones, in canonical order. */
export const BOARD_DESC_TONES: BoardDescTone[] = ["friendly", "professional", "seo"];

/** Default tone when the caller omits it. */
export const DEFAULT_TONE: BoardDescTone = "friendly";

/** Hard description cap (chars). */
export const MAX_DESCRIPTION_LENGTH = 500;

/** Board names longer than this cannot fit under the 500-char cap. */
export const MAX_BOARD_NAME_LENGTH = 200;

/** Max single keyword length (chars). */
export const MAX_KEYWORD_LENGTH = 60;

/** Max keywords woven into one description; extras are ignored. */
export const MAX_KEYWORDS_USED = 6;

/** Openers per tone — 4 each (12 total). {board} = board name. */
export const OPENER_BANK: Record<BoardDescTone, string[]> = {
  friendly: [
    "Welcome to {board} — a board full of ideas, inspiration and how-tos to save for later.",
    "{board} is where I collect my favorite ideas, tips and inspiration in one place.",
    "Looking for {board} inspiration? This board is packed with ideas worth saving.",
    "Everything {board}, gathered in one spot — browse, save and try the ideas you love.",
  ],
  professional: [
    "{board}: a curated collection of ideas, guides and inspiration for your projects.",
    "Explore {board} — hand-picked ideas and practical guides, organized in one board.",
    "This board covers {board} with clear ideas and inspiration you can put to use.",
    "{board} resources, ideas and inspiration, collected to help you plan with confidence.",
  ],
  seo: [
    "{board} ideas, inspiration and guides — find the best {board} pins to save and try.",
    "Discover {board} ideas and inspiration: the best {board} pins, all in one board.",
    "Your source for {board} ideas — browse {board} inspiration and save your favorites.",
    "Best {board} ideas and inspiration, organized so you can find and save them fast.",
  ],
};

/** Value lines weaving two keywords — 4 shared templates. */
export const VALUE_PAIR_BANK: string[] = [
  "Save ideas about {kw1} and {kw2} to plan your next project with confidence.",
  "From {kw1} to {kw2}, every pin here helps you take the next step.",
  "You'll find {kw1}, {kw2} and plenty of inspiration to keep you going.",
  "Pin your favorites on {kw1} and {kw2} so they're ready when you need them.",
];

/** Value lines weaving a single keyword — 4 shared templates. */
export const VALUE_SINGLE_BANK: string[] = [
  "Save ideas about {kw1} to plan your next project with confidence.",
  "Every pin on {kw1} here helps you take the next step.",
  "You'll find {kw1} and plenty of inspiration to keep you going.",
  "Pin your favorites on {kw1} so they're ready when you need them.",
];

/** Generic value lines used when no keywords are supplied — 2 templates. */
export const VALUE_GENERIC_BANK: string[] = [
  "New ideas are added regularly, so follow the board to never miss an update.",
  "Browse the pins, save what inspires you, and come back for fresh ideas.",
];

/** Closers per tone — 2 each (6 total). */
export const CLOSER_BANK: Record<BoardDescTone, string[]> = {
  friendly: [
    "Happy pinning — save your favorites and share the board with a friend!",
    "Follow along for fresh ideas, and save the pins you love most.",
  ],
  professional: [
    "Follow this board for ongoing ideas and updates.",
    "Save the pins that fit your plans and revisit the board anytime.",
  ],
  seo: [
    "Follow for more {board} ideas, and save this board to find it again fast.",
    "Save this {board} board so these ideas are easy to find later.",
  ],
};

/** Bank sizes, exported so the UI can state them honestly. */
export const BANK_SIZES = {
  openersPerTone: OPENER_BANK.friendly.length,
  valuePair: VALUE_PAIR_BANK.length,
  valueSingle: VALUE_SINGLE_BANK.length,
  valueGeneric: VALUE_GENERIC_BANK.length,
  closersPerTone: CLOSER_BANK.friendly.length,
  total:
    OPENER_BANK.friendly.length * BOARD_DESC_TONES.length +
    VALUE_PAIR_BANK.length +
    VALUE_SINGLE_BANK.length +
    VALUE_GENERIC_BANK.length +
    CLOSER_BANK.friendly.length * BOARD_DESC_TONES.length,
};

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isBoardDescTone(s: string): s is BoardDescTone {
  return (BOARD_DESC_TONES as string[]).includes(s);
}

/** Simple deterministic hash: sum of char codes. No randomness anywhere. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Parse `keywords`: accepts a string[] or a comma-separated string.
 * Returns null when any keyword is invalid (non-string, empty, contains
 * ","/"|"/newline = looks like a pasted keyword list, or too long).
 */
function parseKeywords(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  let list: unknown[];
  if (typeof raw === "string") {
    if (raw.trim() === "") return [];
    list = raw.split(",");
  } else if (Array.isArray(raw)) {
    list = raw;
  } else {
    return null;
  }
  const out: string[] = [];
  for (const item of list) {
    if (typeof item !== "string") return null;
    const kw = item.trim();
    if (kw.length === 0) continue;
    if (kw.length > MAX_KEYWORD_LENGTH) return null;
    if (/[|,\n\r]/.test(kw)) return null; // pasted list, not a keyword
    out.push(kw);
  }
  return out;
}

/** Fill {board}, {kw1}, {kw2} placeholders. */
function fill(
  template: string,
  board: string,
  kw1: string,
  kw2: string
): string {
  return template
    .replaceAll("{board}", board)
    .replaceAll("{kw1}", kw1)
    .replaceAll("{kw2}", kw2);
}

/** Truncate at a word boundary so no word is cut mid-word. */
function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

/**
 * runTool({ boardName, keywords?, tone? }) -> { boardDescription }.
 *
 * Errors (ok: false) for: missing/blank/non-string boardName; boardName
 * longer than 200 chars; invalid keywords (a list pasted as one keyword,
 * non-strings, or >60 chars each); unknown tone.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Enter your board name to generate a description (for example: Cozy Fall Decor).",
    };
  }

  const rawBoard = values["boardName"];
  if (typeof rawBoard !== "string" || rawBoard.trim().length === 0) {
    return {
      ok: false,
      error: "A board name is required — it becomes the first sentence of your description.",
    };
  }
  const boardName = rawBoard.trim();
  if (boardName.length > MAX_BOARD_NAME_LENGTH) {
    return {
      ok: false,
      error: `That board name is ${boardName.length} characters — keep it under ${MAX_BOARD_NAME_LENGTH} characters so the description fits the 500-character cap.`,
    };
  }

  const keywords = parseKeywords(values["keywords"]);
  if (keywords === null) {
    return {
      ok: false,
      error: "Keywords must be plain words or short phrases — enter them one per item (or comma-separated), not a pasted list inside a single keyword.",
    };
  }
  const usedKeywords = keywords.slice(0, MAX_KEYWORDS_USED);

  const rawTone = values["tone"];
  let tone: BoardDescTone = DEFAULT_TONE;
  if (rawTone !== undefined && rawTone !== null && String(rawTone).trim() !== "") {
    if (typeof rawTone !== "string" || !isBoardDescTone(rawTone.trim())) {
      return {
        ok: false,
        error: `Unknown tone. Choose one of: ${BOARD_DESC_TONES.join(", ")}.`,
      };
    }
    tone = rawTone.trim() as BoardDescTone;
  }

  // Deterministic template picks from input hashes.
  const opener = OPENER_BANK[tone][hashString(boardName) % OPENER_BANK[tone].length];
  const closer =
    CLOSER_BANK[tone][
      hashString(boardName + "|" + usedKeywords.join(",")) % CLOSER_BANK[tone].length
    ];

  const sentences: string[] = [fill(opener, boardName, "", "")];
  if (usedKeywords.length === 0) {
    sentences.push(VALUE_GENERIC_BANK[hashString(boardName + "g") % VALUE_GENERIC_BANK.length]);
  } else {
    let lineIndex = 0;
    for (let k = 0; k < usedKeywords.length && lineIndex < 3; k += 2, lineIndex++) {
      const kw1 = usedKeywords[k];
      const kw2 = usedKeywords[k + 1];
      if (kw2 === undefined) {
        sentences.push(
          fill(VALUE_SINGLE_BANK[lineIndex % VALUE_SINGLE_BANK.length], boardName, kw1, "")
        );
      } else {
        sentences.push(
          fill(VALUE_PAIR_BANK[lineIndex % VALUE_PAIR_BANK.length], boardName, kw1, kw2)
        );
      }
    }
  }
  sentences.push(fill(closer, boardName, "", ""));

  // Enforce the 500-char cap: drop closer first, then value lines from the
  // end; truncate the opener at a word boundary only as a last resort.
  const dropOrder = [sentences.length - 1];
  for (let s = sentences.length - 2; s >= 1; s--) dropOrder.push(s);
  const kept = sentences.slice();
  for (const idx of dropOrder) {
    if (kept.filter((x) => x !== "").join(" ").length <= MAX_DESCRIPTION_LENGTH) break;
    kept[idx] = "";
  }
  let boardDescription = kept.filter((x) => x !== "").join(" ");
  boardDescription = truncateWords(boardDescription, MAX_DESCRIPTION_LENGTH);

  return { ok: true, values: { boardDescription } };
}
