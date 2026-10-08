/**
 * Competitor Gap Finder — pure logic (tool-119).
 *
 * MANUAL WORKSHEET, NOT ANALYSIS: this tool performs no automated
 * competitor analysis — there is no YouTube Data API access and no
 * scraping (which YouTube's ToS forbids). It organizes topics the user
 * pastes in manually into a coverage matrix, flags competitor topics the
 * user has not covered, and attaches angle prompts from a hand-written
 * template bank.
 *
 * Matching is a simple normalized-text comparison (exact match or
 * containment, both directions, minimum-length guard). Uncovered topics
 * get angle suggestions by cycling through the 12 hand-written angle
 * templates in bank order (deterministic).
 *
 * Angle template bank: 12 templates, documented here and in the result.
 *
 * Zero imports. Deterministic.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Minimum topic length (chars) for the containment fallback. */
export const MIN_CONTAIN_LENGTH = 8;
/** Maximum topics processed per run (each list). */
export const MAX_TOPICS = 50;

/**
 * Hand-written angle template bank. `{topic}` is replaced with the
 * uncovered competitor topic. Bank size: 12 templates.
 */
export const ANGLE_BANK: string[] = [
  "Beginner-friendly version: explain {topic} assuming zero prior knowledge.",
  "Mistakes angle: the most common mistakes people make with {topic} (and fixes).",
  "2026 update angle: what changed about {topic} this year.",
  "Comparison angle: {topic} vs the most popular alternative — which wins?",
  "Case-study angle: document your real results or process with {topic}.",
  "Myths angle: {topic} myths that hold beginners back.",
  "Speed-run angle: achieve a {topic} result in the shortest time possible.",
  "Tools angle: the best free tools for {topic}, tested and ranked.",
  "Deep-dive angle: the advanced {topic} guide nobody else made.",
  "Cost angle: how much {topic} really costs (honest breakdown).",
  "Q&A angle: answer the 10 most-asked questions about {topic}.",
  "Contrarian angle: the unpopular opinion about {topic} — with evidence.",
];

export const ANGLE_BANK_SIZE = ANGLE_BANK.length;

export interface CoverageRow {
  /** Competitor topic (trimmed, original casing). */
  topic: string;
  /** True when one of your topics covers it. */
  coveredByYou: boolean;
  /** Suggested next step for this topic. */
  suggestion: string;
}

export interface GapFinderResult {
  competitorName: string | null;
  totalCompetitorTopics: number;
  coveredCount: number;
  uncoveredCount: number;
  coveragePercent: number;
  /** Matrix rows: one per competitor topic. */
  coverageMatrix: CoverageRow[];
  /** Competitor topics you have not covered. */
  uncoveredTopics: string[];
  /** Angle prompts for uncovered topics (from the 12-template bank). */
  angleSuggestions: string[];
  /** Always present honesty statement. */
  honestyNote: string;
  /** Always true — worksheet, not automated analysis. */
  isWorksheet: true;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** One topic per line: trim, drop empties, dedupe (case-insensitive). */
export function parseTopicList(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split("\n")) {
    const t = line.replace(/\s+/g, " ").trim();
    if (t.length === 0) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_TOPICS) break;
  }
  return out;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** True when two topics refer to the same subject (exact or containment). */
export function topicsMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na.length === 0 || nb.length === 0) return false;
  if (na === nb) return true;
  if (na.length >= MIN_CONTAIN_LENGTH && nb.length >= MIN_CONTAIN_LENGTH) {
    return na.includes(nb) || nb.includes(na);
  }
  return false;
}

export function findGaps(
  competitorTopics: string[],
  ownTopics: string[],
  competitorName: string | null
): GapFinderResult {
  const matrix: CoverageRow[] = [];
  const uncovered: string[] = [];

  for (const topic of competitorTopics) {
    const covered = ownTopics.some((own) => topicsMatch(topic, own));
    if (covered) {
      matrix.push({
        topic,
        coveredByYou: true,
        suggestion: "Covered — consider a refresh, sequel, or a better angle rather than a duplicate.",
      });
    } else {
      uncovered.push(topic);
      matrix.push({
        topic,
        coveredByYou: false,
        suggestion: "Gap — you have no video on this. Pick an angle below before filming.",
      });
    }
  }

  const angleSuggestions = uncovered.map(
    (topic, i) => ANGLE_BANK[i % ANGLE_BANK_SIZE].replaceAll("{topic}", topic)
  );

  const coveragePercent =
    competitorTopics.length === 0
      ? 0
      : Math.round((matrix.filter((r) => r.coveredByYou).length / competitorTopics.length) * 100);

  return {
    competitorName,
    totalCompetitorTopics: competitorTopics.length,
    coveredCount: competitorTopics.length - uncovered.length,
    uncoveredCount: uncovered.length,
    coveragePercent,
    coverageMatrix: matrix,
    uncoveredTopics: uncovered,
    angleSuggestions,
    honestyNote:
      "Manual worksheet only: this organizes topics YOU pasted in — it performs no automated competitor analysis, uses no YouTube data, and makes no claim about which gaps are actually worth filling. Validate demand with your own research before filming.",
    isWorksheet: true,
  };
}

/**
 * Template entry point. values keys: competitorName (optional),
 * competitorTopics (textarea, required), ownTopics (textarea, optional).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  let competitorName: string | null = null;
  const rawName = values["competitorName"];
  if (rawName !== undefined && rawName !== null && rawName !== "") {
    if (!isNonEmptyString(rawName)) {
      return { ok: false, error: "Competitor name must be text." };
    }
    if (rawName.trim().length > 80) {
      return { ok: false, error: "Competitor name must be 80 characters or fewer." };
    }
    competitorName = rawName.trim();
  }

  const competitorTopics = parseTopicList(values["competitorTopics"]);
  if (competitorTopics.length === 0) {
    return { ok: false, error: "Paste at least 1 competitor video topic (one per line)." };
  }
  const ownTopics = parseTopicList(values["ownTopics"]);

  const result = findGaps(competitorTopics, ownTopics, competitorName);
  return {
    ok: true,
    values: {
      coverageMatrix: {
        columns: ["Competitor topic", "You cover it?", "Suggestion"],
        rows: result.coverageMatrix.map((r) => [
          r.topic,
          r.coveredByYou ? "Yes" : "No",
          r.suggestion,
        ]),
      },
      uncoveredTopics: result.uncoveredTopics,
      angleSuggestions: result.angleSuggestions,
      coveragePercent: result.coveragePercent,
      coveredCount: result.coveredCount,
      uncoveredCount: result.uncoveredCount,
      honestyNote: result.honestyNote,
      isWorksheet: result.isWorksheet,
    },
  };
}
