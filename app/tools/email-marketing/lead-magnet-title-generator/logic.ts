/**
 * Lead Magnet Title Generator — pure logic (tool-426).
 *
 * ASSEMBLY, NOT AI: titles are assembled from FIXED title-pattern and
 * tone-adjective banks bundled below — no network, no model, no randomness.
 * Selection is a deterministic hash of the inputs, so identical inputs always
 * produce identical output. The copy says "templates" and never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - TITLE_PATTERNS: 12 title patterns
 *   (placeholders: {adj}, {type}, {topic}, {outcome})
 * - TONE_ADJECTIVES: 16 tone adjectives (4 per tone x 4 tones)
 * - TONES: 4 selectable tones
 *
 * Output: 10 titles, each with its length in Unicode code points (the
 * `charCount` shown next to every title counts emoji / CJK / RTL as one
 * character each).
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length).
 * - Over-long inputs are TRUNCATED with a visible notice appended as a table
 *   note row — never silently dropped.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 */

export const TITLE_COUNT = 10;
export const TONES: readonly string[] = ["professional", "friendly", "playful", "bold"];

/** Documented input length caps (Unicode code points). */
export const MAX_MAGNET_TYPE_CHARS = 60;
export const MAX_TOPIC_CHARS = 80;
export const MAX_OUTCOME_CHARS = 80;

/** 12 title patterns. Placeholders: {adj}, {type}, {topic}, {outcome}. */
export const TITLE_PATTERNS: readonly string[] = [
  "The {adj} {topic} {type}: Your Path to {outcome}",
  "{topic} Made {adj}: {outcome} with This {type}",
  "The {adj} Guide to {topic} for {outcome}",
  "{outcome} Starts Here: The {adj} {topic} {type}",
  "The {adj} {topic} {type} That Delivers {outcome}",
  "From {topic} Confusion to {outcome}: A {adj} {type}",
  "Your {adj} {topic} Shortcut to {outcome}",
  "{topic} in Action: Get {outcome} the {adj} Way",
  "Master {topic}: The {adj} {type} for Real {outcome}",
  "{outcome}, Simplified: A {adj} {topic} {type}",
  "Unlock {outcome} with This {adj} {type}",
  "The {adj} {topic} Playbook for {outcome}",
];

/** 16 tone adjectives, 4 per tone: professional, friendly, playful, bold. */
export const TONE_ADJECTIVES: readonly string[][] = [
  ["Complete", "Essential", "Definitive", "Professional's"],
  ["Friendly", "Simple", "Handy", "No-Stress"],
  ["Fun-Sized", "No-Boring", "Cheeky", "Delightful"],
  ["No-BS", "Ultimate", "Ruthless", "Zero-Fluff"],
];

/** Table columns for the `titles` output. */
export const TITLES_COLUMNS: readonly string[] = ["#", "Title", "Characters"];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers (all local — logic.ts has zero imports by contract)
// ---------------------------------------------------------------------------

/** djb2 hash, returned as an unsigned 32-bit int. Deterministic pick source. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Length in Unicode code points (emoji / CJK / RTL count as one each). */
function codePoints(s: string): number {
  return [...s].length;
}

/** Escape HTML so user input stays plain text in the output. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface TextRead {
  ok: true;
  value: string;
  notice?: string;
}

interface TextFail {
  ok: false;
  error: string;
}

function readText(
  values: Record<string, unknown>,
  id: string,
  label: string,
  maxChars: number,
): TextRead | TextFail {
  const raw = values[id];
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return { ok: false, error: `${label} is required — please fill it in.` };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: `${label} must be text.` };
  }
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: false, error: `${label} must not be empty.` };
  }
  let notice: string | undefined;
  let value = trimmed;
  if (codePoints(trimmed) > maxChars) {
    value = [...trimmed].slice(0, maxChars).join("");
    notice =
      `${label} was shortened from ${codePoints(trimmed)} to ${maxChars} characters.`;
  }
  return { ok: true, value: escapeHtml(value), notice };
}

/** Fill {token} placeholders from a map. */
function fill(template: string, map: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m,
  );
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Generate lead-magnet titles from fixed pattern banks.
 *
 * Inputs (values): magnetType, topic, outcome (required text), tone
 * (required select: professional|friendly|playful|bold).
 * Outputs (values): titles ({ columns: string[]; rows: string[][] }) —
 * 10 titles with character counts.
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const magnetType = readText(values, "magnetType", "Magnet type", MAX_MAGNET_TYPE_CHARS);
  if (!magnetType.ok) return { ok: false, error: magnetType.error };
  const topic = readText(values, "topic", "Topic", MAX_TOPIC_CHARS);
  if (!topic.ok) return { ok: false, error: topic.error };
  const outcome = readText(values, "outcome", "Outcome", MAX_OUTCOME_CHARS);
  if (!outcome.ok) return { ok: false, error: outcome.error };

  const toneRaw = values["tone"];
  if (typeof toneRaw !== "string" || !TONES.includes(toneRaw)) {
    return {
      ok: false,
      error: `Tone must be one of: ${TONES.join(", ")}.`,
    };
  }
  const toneIndex = TONES.indexOf(toneRaw);

  const notices: string[] = [];
  if (magnetType.notice) notices.push(magnetType.notice);
  if (topic.notice) notices.push(topic.notice);
  if (outcome.notice) notices.push(outcome.notice);

  // Deterministic variant selection from the joined inputs.
  const h = hashString(
    [magnetType.value, topic.value, outcome.value, toneRaw].join(" "),
  );

  const rows: string[][] = [];
  const seen = new Set<string>();
  let i = 0;
  let guard = 0;
  while (rows.length < TITLE_COUNT && guard < 60) {
    // Step 5 is coprime to 12, so 10 pattern picks are always distinct.
    const pattern = TITLE_PATTERNS[(h + 5 * i) % TITLE_PATTERNS.length];
    const adj = TONE_ADJECTIVES[toneIndex][(h + 3 * i) % TONE_ADJECTIVES[toneIndex].length];
    i++;
    guard++;
    const title = fill(pattern, {
      adj,
      type: magnetType.value,
      topic: topic.value,
      outcome: outcome.value,
    });
    if (seen.has(title)) continue;
    seen.add(title);
    rows.push([String(rows.length + 1), title, String(codePoints(title))]);
  }

  if (notices.length > 0) {
    rows.push(["", `Note: ${notices.join(" ")}`, ""]);
  }

  return {
    ok: true,
    values: { titles: { columns: [...TITLES_COLUMNS], rows } },
  };
}
