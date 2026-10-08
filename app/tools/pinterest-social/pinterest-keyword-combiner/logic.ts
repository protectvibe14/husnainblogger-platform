/**
 * Pinterest Keyword Combiner — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds Pinterest keyword idea seeds from a deterministic cartesian product
 * of seed keywords x modifiers, plus seed x seed pairings — then deduplicates
 * after normalization. No external data, no search-volume or difficulty
 * numbers: these are brainstorming IDEA SEEDS, not measured keyword data.
 *
 * No word banks are used — every output is derived from the user's own
 * inputs. The only fixed list is the DEFAULT_MODIFIERS fallback (5 items).
 *
 * Output cap: capped at maxCombos (validated 1..500, default 50).
 * Ordering is deterministic: modifier+seed, then seed+modifier, then
 * seed+seed pairs — same inputs always yield the identical list.
 */

export const MIN_SEEDS = 1;
export const MAX_SEEDS = 10;
export const DEFAULT_MODIFIERS: string[] = ["how to", "best", "ideas", "easy", "quick"];
export const DEFAULT_MAX_COMBOS = 50;
export const MAX_ALLOWED_COMBOS = 500;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Parse a textarea/array input into a normalized, deduped string list. */
function parseList(raw: unknown): string[] {
  const items: string[] = [];
  const push = (line: string) => {
    const n = normalize(line);
    if (n && !items.includes(n)) items.push(n);
  };
  if (typeof raw === "string") {
    for (const line of raw.split("\n")) {
      // also split comma-separated entries pasted on one line
      for (const part of line.split(",")) push(part);
    }
  } else if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === "string") {
        for (const part of entry.split("\n")) {
          for (const sub of part.split(",")) push(sub);
        }
      }
    }
  }
  return items;
}

function parseMaxCombos(raw: unknown): number | { error: string } {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_MAX_COMBOS;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    return { error: "Max combos must be a whole number of at least 1." };
  }
  if (n > MAX_ALLOWED_COMBOS) {
    return { error: `Max combos is too large (max ${MAX_ALLOWED_COMBOS}).` };
  }
  return n;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const seeds = parseList(values["seedKeywords"]);
  if (seeds.length < MIN_SEEDS) {
    return { ok: false, error: "Please enter at least one seed keyword (one per line)." };
  }
  if (seeds.length > MAX_SEEDS) {
    return {
      ok: false,
      error: `Too many seed keywords — enter at most ${MAX_SEEDS}, one per line.`,
    };
  }

  let modifiers = parseList(values["modifiers"]);
  if (modifiers.length === 0) modifiers = [...DEFAULT_MODIFIERS];

  const maxCombos = parseMaxCombos(values["maxCombos"]);
  if (typeof maxCombos === "object") {
    return { ok: false, error: maxCombos.error };
  }

  const seen = new Set<string>();
  const combos: string[] = [];
  const add = (combo: string) => {
    const n = normalize(combo);
    if (!n || seen.has(n)) return;
    seen.add(n);
    if (combos.length < maxCombos) combos.push(n);
  };

  // 1. modifier + seed (e.g. "best cozy bedroom")
  for (const m of modifiers) {
    for (const s of seeds) add(`${m} ${s}`);
  }
  // 2. seed + modifier (e.g. "cozy bedroom ideas")
  for (const s of seeds) {
    for (const m of modifiers) add(`${s} ${m}`);
  }
  // 3. seed + seed pairs (e.g. "cozy bedroom small apartment")
  for (let i = 0; i < seeds.length; i++) {
    for (let j = 0; j < seeds.length; j++) {
      if (i !== j) add(`${seeds[i]} ${seeds[j]}`);
    }
  }

  return {
    ok: true,
    values: {
      keywordCombos: combos,
      note: "These are brainstorming idea seeds — they carry no search volume or difficulty data. Check real interest in the Pinterest search bar or a keyword tool before building content around them.",
    },
  };
}
