/**
 * Content Ideas Matrix Generator — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Cross-multiplies YOUR topics × YOUR formats into a matrix. Each cell gets
 * a working title built from a FIXED title formula — this is templated text
 * assembly, not AI ideation. The user supplies every topic and every format;
 * the tool only combines them.
 *
 * FIXED WORD BANKS (documented):
 * - TITLE_FORMULAS: 8 fixed working-title formulas. The formula for cell
 *   (topicIndex, formatIndex) is chosen as
 *   FORMULAS[(topicIndex * FORMAT_SLOTS + formatIndex) % 8] — a deterministic
 *   spread so neighboring cells rarely repeat the same formula.
 * - Caps: MAX_TOPICS = 20, MAX_FORMATS = 10, MAX_CELLS = 200
 *   (edge case "large matrices paginated": matrices above the caps are
 *   rejected with a human message — the user splits them into batches).
 *
 * Deterministic: same inputs -> identical matrix, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

/** Fixed working-title formulas. {topic} and {format} are substituted (size: 8). */
export const TITLE_FORMULAS: ReadonlyArray<string> = [
  "{topic}: a {format} beginner's guide",
  "{topic} — 7 {format} ideas worth stealing",
  "How I use {topic} in one {format}",
  "{topic} mistakes that ruin a good {format}",
  "The only {topic} {format} you need this year",
  "{topic} vs. the alternatives: a {format} breakdown",
  "10 {topic} questions, answered ({format} edition)",
  "{topic} for busy people: the 5-minute {format}",
];

export const MAX_TOPICS = 20;
export const MAX_FORMATS = 10;
export const MAX_CELLS = 200;

/** Split a textarea into trimmed, non-empty lines, deduped case-insensitively. */
export function parseList(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const item = line.trim();
    if (item.length === 0) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Render one working title from the fixed formula bank (deterministic). */
export function buildTitle(topic: string, format: string, topicIndex: number, formatIndex: number): string {
  const formula = TITLE_FORMULAS[(topicIndex * MAX_FORMATS + formatIndex) % TITLE_FORMULAS.length];
  return formula.replace("{topic}", topic).replace("{format}", format);
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const topics = parseList(values["topics"]);
  const formats = parseList(values["formats"]);

  if (topics.length === 0) {
    return { ok: false, error: "Please enter at least one topic (one per line)." };
  }
  if (formats.length === 0) {
    return { ok: false, error: "Please enter at least one format (one per line)." };
  }
  if (topics.length > MAX_TOPICS) {
    return {
      ok: false,
      error: `That's ${topics.length} topics — the matrix supports up to ${MAX_TOPICS}. Split your topics into smaller batches and run the tool again.`,
    };
  }
  if (formats.length > MAX_FORMATS) {
    return {
      ok: false,
      error: `That's ${formats.length} formats — the matrix supports up to ${MAX_FORMATS}. Split your formats into smaller batches and run the tool again.`,
    };
  }
  if (topics.length * formats.length > MAX_CELLS) {
    return {
      ok: false,
      error: `That's ${topics.length * formats.length} cells — the limit is ${MAX_CELLS}. Reduce topics or formats and run again.`,
    };
  }

  const rows: string[][] = topics.map((topic, ti) => [
    topic,
    ...formats.map((format, fi) => buildTitle(topic, format, ti, fi)),
  ]);

  return {
    ok: true,
    values: {
      ideaMatrix: { columns: ["Topic", ...formats], rows },
    },
  };
}
