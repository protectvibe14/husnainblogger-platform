/**
 * Keyword Prioritization Scorer — pure logic (zero imports, zero network, zero DOM).
 *
 * Ranks user-entered keywords with a transparent weighted rubric. All
 * inputs are USER-supplied judgments — the tool has no live keyword data
 * (no search volume, no real difficulty); it only combines the numbers you
 * enter. Estimates and scores are heuristic and labeled as such.
 *
 * Published rubric (formulaRef F-A-009):
 *   score = (wRel*relevance + wVol*volume + wDiff*(10-difficulty) + wComm*commercialIntent)
 *           / (wRel + wVol + wDiff + wComm) / 10 * 100
 *   - Each rating is 0-10. Difficulty is INVERTED (10 - difficulty) because
 *     lower difficulty is better.
 *   - Default weights: 0.25 each; each weight must be 0-1 and their sum > 0.
 *   - Score is rounded to 1 decimal, range 0-100.
 *   - Bands: 70+ "High priority — target first", 40-69 "Medium priority —
 *     schedule next", below 40 "Low priority — revisit later".
 *   - Ties keep input order (stable sort); the top pick is the first
 *     highest-scoring keyword.
 *
 * Determinism: same inputs -> identical outputs.
 */

export const MAX_KEYWORDS = 200;

export interface KeywordRating {
  term: string;
  relevance: number;
  volume: number;
  difficulty: number;
  commercial: number;
}

export interface ScorerWeights {
  wRelevance: number;
  wVolume: number;
  wDifficulty: number;
  wCommercial: number;
}

export const DEFAULT_WEIGHTS: ScorerWeights = {
  wRelevance: 0.25,
  wVolume: 0.25,
  wDifficulty: 0.25,
  wCommercial: 0.25,
};

const RATING_LABELS = ["relevance", "volume", "difficulty", "commercial intent"] as const;

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function checkRating(value: unknown, label: string, term: string): { n: number; error: string | null } {
  if (!isFiniteNumber(value)) {
    return { n: 0, error: `Keyword "${term}": ${label} must be a number from 0 to 10.` };
  }
  if (value < 0 || value > 10) {
    return { n: 0, error: `Keyword "${term}": ${label} must be between 0 and 10 (got ${value}).` };
  }
  return { n: value, error: null };
}

/**
 * Parse the keywords input:
 *  - textarea string: one keyword per line as "term | relevance | volume | difficulty | commercial intent"
 *  - string[]: same line format
 *  - object[]: { term, relevance, volume, difficulty, commercialIntent | commercial }
 */
function parseKeywords(raw: unknown): { rows: KeywordRating[]; error: string | null } {
  if (raw === undefined || raw === null) {
    return { rows: [], error: "Keywords are required." };
  }
  let entries: unknown[];
  if (typeof raw === "string") {
    if (raw.trim() === "") return { rows: [], error: "Keywords are required." };
    entries = raw.split(/\r?\n/);
  } else if (Array.isArray(raw)) {
    entries = raw;
  } else {
    return { rows: [], error: "Keywords must be text (one per line) or a list." };
  }

  const rows: KeywordRating[] = [];
  for (const entry of entries) {
    let term: unknown;
    let ratings: unknown[];
    if (typeof entry === "string") {
      const parts = entry.split("|").map((p) => p.trim());
      if (parts.length !== 5) {
        return {
          rows: [],
          error: `Each line needs 5 parts: "term | relevance | volume | difficulty | commercial intent" (0-10). Bad line: "${entry.trim().slice(0, 60)}"`,
        };
      }
      term = parts[0];
      ratings = parts.slice(1).map((p) => Number(p));
      if (ratings.some((n) => !isFiniteNumber(n))) {
        return { rows: [], error: `Keyword "${parts[0]}": all four ratings must be numbers from 0 to 10.` };
      }
    } else if (entry !== null && typeof entry === "object") {
      const obj = entry as Record<string, unknown>;
      term = obj["term"];
      ratings = [
        obj["relevance"],
        obj["volume"],
        obj["difficulty"],
        obj["commercialIntent"] !== undefined ? obj["commercialIntent"] : obj["commercial"],
      ];
    } else {
      return { rows: [], error: "Each keyword must be a text line or an object with a term and four ratings." };
    }

    const termText = typeof term === "string" ? term.trim() : "";
    if (!termText) {
      return { rows: [], error: "Every keyword needs a non-empty term." };
    }
    const checked: number[] = [];
    for (let i = 0; i < 4; i++) {
      const c = checkRating(ratings[i], RATING_LABELS[i], termText);
      if (c.error) return { rows: [], error: c.error };
      checked.push(c.n);
    }
    rows.push({ term: termText, relevance: checked[0], volume: checked[1], difficulty: checked[2], commercial: checked[3] });
  }

  if (rows.length === 0) {
    return { rows: [], error: "Keywords are required — add at least one keyword." };
  }
  if (rows.length > MAX_KEYWORDS) {
    return { rows: [], error: `Score at most ${MAX_KEYWORDS} keywords at once (you entered ${rows.length}).` };
  }
  return { rows, error: null };
}

/**
 * Parse the weights input: undefined -> defaults; "0.25, 0.25, 0.25, 0.25"
 * string -> four weights in relevance/volume/difficulty/commercial order;
 * object -> { wRelevance, wVolume, wDifficulty, wCommercial } (missing keys default to 0.25).
 */
function parseWeights(raw: unknown): { weights: ScorerWeights; error: string | null } {
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return { weights: { ...DEFAULT_WEIGHTS }, error: null };
  }
  const keys: (keyof ScorerWeights)[] = ["wRelevance", "wVolume", "wDifficulty", "wCommercial"];
  let list: unknown[];
  if (typeof raw === "string") {
    list = raw.split(/[,;\s]+/).filter(Boolean).map((p) => Number(p));
    if (list.length !== 4) {
      return { weights: DEFAULT_WEIGHTS, error: "Weights need 4 numbers (relevance, volume, difficulty, commercial intent), e.g. \"0.3, 0.2, 0.3, 0.2\"." };
    }
  } else if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    list = keys.map((k) => (obj[k] === undefined ? 0.25 : obj[k]));
  } else {
    return { weights: DEFAULT_WEIGHTS, error: "Weights must be four numbers or an object with wRelevance, wVolume, wDifficulty, wCommercial." };
  }

  const weights = {} as ScorerWeights;
  const labels = ["relevance", "volume", "difficulty", "commercial intent"];
  for (let i = 0; i < 4; i++) {
    const w = list[i];
    if (!isFiniteNumber(w) || w < 0 || w > 1) {
      return {
        weights: DEFAULT_WEIGHTS,
        error: `Weight for ${labels[i]} must be a number from 0 to 1.`,
      };
    }
    weights[keys[i]] = w;
  }
  const sum = weights.wRelevance + weights.wVolume + weights.wDifficulty + weights.wCommercial;
  if (sum <= 0) {
    return { weights: DEFAULT_WEIGHTS, error: "Weights must add up to more than 0 — at least one weight has to be positive." };
  }
  return { weights, error: null };
}

/** Composite 0-100 score for one keyword. */
export function scoreKeyword(r: KeywordRating, w: ScorerWeights): number {
  const sum = w.wRelevance + w.wVolume + w.wDifficulty + w.wCommercial;
  const weighted =
    w.wRelevance * r.relevance +
    w.wVolume * r.volume +
    w.wDifficulty * (10 - r.difficulty) +
    w.wCommercial * r.commercial;
  return Math.round((weighted / (sum * 10)) * 100 * 10) / 10;
}

/** Priority band label for a 0-100 score. */
export function scoreBand(score: number): string {
  if (score >= 70) return "High priority — target first";
  if (score >= 40) return "Medium priority — schedule next";
  return "Low priority — revisit later";
}

/**
 * Run the scorer. Values in:
 *   keywords: string | string[] | object[]   (required)
 *   weights: string | object                 (optional)
 *
 * Values out:
 *   rankedKeywords: { columns: string[]; rows: string[][] }
 *   topPick: string
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values ?? {};

  const parsedKw = parseKeywords(v["keywords"]);
  if (parsedKw.error) return { ok: false, error: parsedKw.error };

  const parsedW = parseWeights(v["weights"]);
  if (parsedW.error) return { ok: false, error: parsedW.error };

  const w = parsedW.weights;
  const scored = parsedKw.rows.map((r, i) => ({ ...r, score: scoreKeyword(r, w), inputOrder: i }));
  // Stable: ties keep input order.
  scored.sort((a, b) => (b.score - a.score) || (a.inputOrder - b.inputOrder));

  const columns = ["#", "Keyword", "Relevance", "Volume", "Difficulty", "Commercial intent", "Score /100", "Priority"];
  const rows: string[][] = scored.map((s, rank) => [
    String(rank + 1),
    s.term,
    String(s.relevance),
    String(s.volume),
    String(s.difficulty),
    String(s.commercial),
    s.score.toFixed(1),
    scoreBand(s.score),
  ]);

  const top = scored[0];
  const strengths: Array<[string, number]> = [
    ["relevance", top.relevance],
    ["search volume", top.volume],
    ["low difficulty", 10 - top.difficulty],
    ["commercial intent", top.commercial],
  ];
  strengths.sort((a, b) => b[1] - a[1]);
  const topTwo = strengths.slice(0, 2).map(([label, val]) => `${label} ${val}/10`).join(", ");
  const topPick =
    `${top.term} — ${top.score.toFixed(1)}/100 (${scoreBand(top.score)}). ` +
    `Strongest on: ${topTwo}. ` +
    `Scores are heuristic estimates from your own ratings, not measured data.`;

  return {
    ok: true,
    values: {
      rankedKeywords: { columns, rows },
      topPick,
    },
  };
}
