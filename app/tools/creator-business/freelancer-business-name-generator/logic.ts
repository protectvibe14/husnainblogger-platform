/**
 * Freelancer Business Name Generator (tool-492) — pure logic, zero imports,
 * zero network, zero DOM, no randomness.
 *
 * HONESTY: this is a TEMPLATE-BASED name combiner, not an AI and not a
 * creative service. Names are assembled by plugging your keywords into
 * fixed combination patterns with fixed suffix word banks. It CANNOT check
 * domain or trademark availability — every result set carries an
 * `availabilityNote` reminding you to verify availability yourself.
 *
 * Word banks (all fixed, documented here):
 *   - SUFFIXES: 3 styles x 10 entries = 30 fixed suffix words.
 *     professional: Studio, Partners, Solutions, Works, Consulting,
 *       Collective, Co., Group, Atelier, House
 *     playful: Squad, Club, Lab, Magic, Factory, Den, Crew, Hive,
 *       Playground, Pops
 *     minimal: Studio, Co., Lab, Works, Atelier, Supply, Goods, Form,
 *       Grid, Line
 *   - PATTERNS: 4 fixed combination patterns shared by all styles:
 *       "{K} {S}", "{S} {K}", "{K} & {S}", "{K}{S}" (merged, punctuation-free)
 *   - Combination space per keyword: 10 suffixes x 4 patterns = 40 names.
 *   - Keywords are capped at MAX_KEYWORDS (20); the merge pattern strips
 *     spaces/punctuation so "{K}{S}" stays one word.
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * values in  = { keywords, style, nameCount? }
 * values out = { nameIdeas, availabilityNote }
 * Output ids match meta.ts outputs. Deterministic: same inputs -> same names,
 * in the same order, every time.
 */

export interface BusinessNameValues {
  /** Up to `nameCount` unique name ideas, in fixed generation order. */
  nameIdeas: string[];
  /** Fixed reminder that availability/trademark were not checked. */
  availabilityNote: string;
}

export interface BusinessNameResult {
  ok: boolean;
  values?: BusinessNameValues;
  error?: string;
}

/** Style options shown in the UI select; keys of SUFFIXES. */
export const STYLES: string[] = ["professional", "playful", "minimal"];

/** Max keywords read from the textarea; bounds total work. */
const MAX_KEYWORDS = 20;

/** Min/max names the tool will produce. */
const MIN_COUNT = 1;
const MAX_COUNT = 50;
const DEFAULT_COUNT = 10;

/** 30 fixed suffixes: 3 styles x 10. */
const SUFFIXES: Record<string, string[]> = {
  professional: [
    "Studio",
    "Partners",
    "Solutions",
    "Works",
    "Consulting",
    "Collective",
    "Co.",
    "Group",
    "Atelier",
    "House",
  ],
  playful: [
    "Squad",
    "Club",
    "Lab",
    "Magic",
    "Factory",
    "Den",
    "Crew",
    "Hive",
    "Playground",
    "Pops",
  ],
  minimal: [
    "Studio",
    "Co.",
    "Lab",
    "Works",
    "Atelier",
    "Supply",
    "Goods",
    "Form",
    "Grid",
    "Line",
  ],
};

/** 4 fixed combination patterns; K = keyword, S = suffix. */
const PATTERNS: Array<(keyword: string, suffix: string) => string> = [
  (k, s) => k + " " + s,
  (k, s) => s + " " + k,
  (k, s) => k + " & " + s,
  (k, s) =>
    k.replace(/[^A-Za-z0-9]/g, "") + s.replace(/[^A-Za-z0-9]/g, ""),
];

const AVAILABILITY_NOTE =
  "Heads-up: these names are template-based combinations from a fixed word " +
  "bank — not AI ideas, and not checked for domain or trademark availability. " +
  "Search domain registrars and your country's trademark database yourself " +
  "before using one.";

/** Split a textarea into a keyword list (commas, semicolons, newlines). */
function parseKeywords(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, MAX_KEYWORDS);
}

/** Title-case each word: "web design" -> "Web Design". */
function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((word) =>
      word.length === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function toCount(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_COUNT;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || Math.floor(n) !== n) return null;
  return n;
}

/**
 * Combine keywords with the style's suffix bank through the fixed patterns.
 * Keyword-major order, duplicates removed, capped at `count`.
 */
export function runTool(values: Record<string, unknown>): BusinessNameResult {
  const source = values ?? {};

  const keywords = parseKeywords(source.keywords);
  if (keywords.length === 0) {
    return {
      ok: false,
      error:
        "Enter at least one keyword (for example: design, pixel, bright).",
    };
  }

  const rawStyle =
    typeof source.style === "string" ? source.style.trim().toLowerCase() : "";
  if (STYLES.indexOf(rawStyle) === -1) {
    return {
      ok: false,
      error: "Choose a style: " + STYLES.join(", ") + ".",
    };
  }

  const count = toCount(source.nameCount);
  if (count === null || count < MIN_COUNT || count > MAX_COUNT) {
    return {
      ok: false,
      error:
        "Enter how many names you want as a whole number between " +
        MIN_COUNT +
        " and " +
        MAX_COUNT +
        ".",
    };
  }

  const titled = keywords.map(titleCase);
  const suffixes = SUFFIXES[rawStyle];
  const names: string[] = [];
  const seen: Record<string, boolean> = {};

  outer: for (const keyword of titled) {
    for (const suffix of suffixes) {
      for (const pattern of PATTERNS) {
        const name = pattern(keyword, suffix);
        const key = name.toLowerCase();
        if (!seen[key]) {
          seen[key] = true;
          names.push(name);
          if (names.length >= count) break outer;
        }
      }
    }
  }

  return {
    ok: true,
    values: {
      nameIdeas: names,
      availabilityNote: AVAILABILITY_NOTE,
    },
  };
}
