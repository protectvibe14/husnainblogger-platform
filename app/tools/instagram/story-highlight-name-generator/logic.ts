/**
 * Story Highlight Name Generator — pure logic (tool-208), zero imports, zero
 * network, zero DOM, no Math.random.
 *
 * TEMPLATE BANK, NOT AI: names are assembled from a fixed bank of 48
 * hand-written name patterns. Each pattern carries the tones it suits
 * (exactly 2 tones each), so every tone's pool holds exactly 24 patterns.
 * Selection is deterministic: a string hash of the niche picks the start
 * offset, then patterns are taken in bank order (no repeats — pools are
 * larger than the max count of 20). The {niche} slot is filled verbatim
 * with the user's trimmed niche.
 *
 * Honesty: names longer than 15 characters are flagged in the note output,
 * because Instagram truncates highlight names around 10-11 characters.
 */

export type HighlightTone = "playful" | "professional" | "minimal" | "bold";

/** The four supported tones, in canonical order. */
export const HIGHLIGHT_TONES: HighlightTone[] = ["playful", "professional", "minimal", "bold"];

export const MIN_COUNT = 1;
export const MAX_COUNT = 20;
export const LONG_NAME_CHARS = 15; // flagged when exceeded (IG truncates ~10-11)

interface NamePattern {
  text: string; // {niche} = user's trimmed niche
  tones: [HighlightTone, HighlightTone];
}

/** 48 fixed patterns: 12 per tone-pair group → 24 patterns per tone pool. */
const NAME_BANK: NamePattern[] = [
  // playful + minimal
  { text: "{niche} 101", tones: ["playful", "minimal"] },
  { text: "My {niche}", tones: ["playful", "minimal"] },
  { text: "{niche} Diary", tones: ["playful", "minimal"] },
  { text: "Daily {niche}", tones: ["playful", "minimal"] },
  { text: "{niche} Vibes", tones: ["playful", "minimal"] },
  { text: "The {niche} Edit", tones: ["playful", "minimal"] },
  { text: "Ask {niche}", tones: ["playful", "minimal"] },
  { text: "{niche} Faves", tones: ["playful", "minimal"] },
  { text: "Start {niche}", tones: ["playful", "minimal"] },
  { text: "New to {niche}?", tones: ["playful", "minimal"] },
  { text: "{niche} Basics", tones: ["playful", "minimal"] },
  { text: "Hello {niche}", tones: ["playful", "minimal"] },
  // professional + bold
  { text: "{niche} Pro", tones: ["professional", "bold"] },
  { text: "Expert {niche}", tones: ["professional", "bold"] },
  { text: "{niche} Guide", tones: ["professional", "bold"] },
  { text: "The {niche} Lab", tones: ["professional", "bold"] },
  { text: "{niche} Wins", tones: ["professional", "bold"] },
  { text: "Proven {niche}", tones: ["professional", "bold"] },
  { text: "{niche} Playbook", tones: ["professional", "bold"] },
  { text: "Level Up {niche}", tones: ["professional", "bold"] },
  { text: "Master {niche}", tones: ["professional", "bold"] },
  { text: "{niche} Results", tones: ["professional", "bold"] },
  { text: "Top {niche} Tips", tones: ["professional", "bold"] },
  { text: "{niche} Secrets", tones: ["professional", "bold"] },
  // playful + bold
  { text: "{niche} Party", tones: ["playful", "bold"] },
  { text: "Big {niche} Energy", tones: ["playful", "bold"] },
  { text: "{niche} Hacks", tones: ["playful", "bold"] },
  { text: "Wild {niche}", tones: ["playful", "bold"] },
  { text: "{niche} Goals", tones: ["playful", "bold"] },
  { text: "Fresh {niche}", tones: ["playful", "bold"] },
  { text: "{niche} Squad", tones: ["playful", "bold"] },
  { text: "Obsessed: {niche}", tones: ["playful", "bold"] },
  { text: "{niche} Magic", tones: ["playful", "bold"] },
  { text: "Go {niche}!", tones: ["playful", "bold"] },
  { text: "{niche} Inspo", tones: ["playful", "bold"] },
  { text: "Pop {niche}", tones: ["playful", "bold"] },
  // minimal + professional
  { text: "{niche}", tones: ["minimal", "professional"] },
  { text: "About {niche}", tones: ["minimal", "professional"] },
  { text: "{niche} Notes", tones: ["minimal", "professional"] },
  { text: "Our {niche}", tones: ["minimal", "professional"] },
  { text: "{niche} Info", tones: ["minimal", "professional"] },
  { text: "FAQ: {niche}", tones: ["minimal", "professional"] },
  { text: "{niche} Menu", tones: ["minimal", "professional"] },
  { text: "The {niche} Page", tones: ["minimal", "professional"] },
  { text: "{niche} Index", tones: ["minimal", "professional"] },
  { text: "All {niche}", tones: ["minimal", "professional"] },
  { text: "{niche} Files", tones: ["minimal", "professional"] },
  { text: "Start Here: {niche}", tones: ["minimal", "professional"] },
];

/** Documented bank sizes. */
export const BANK_SIZES = {
  patterns: NAME_BANK.length,
  poolPerTone: NAME_BANK.filter((p) => p.tones.includes("playful")).length,
  tones: HIGHLIGHT_TONES.length,
};

/** Deterministic FNV-1a 32-bit hash (no Math.random anywhere). */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isHighlightTone(s: string): s is HighlightTone {
  return (HIGHLIGHT_TONES as string[]).includes(s);
}

function toCount(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value.trim()) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export interface HighlightNamesResult {
  niche: string;
  tone: HighlightTone;
  count: number;
  names: string[];
  longNames: string[];
  note: string;
  isTemplateBased: true;
}

export function generateHighlightNames(nicheRaw: string, tone: HighlightTone, count: number): HighlightNamesResult {
  const niche = nicheRaw.trim().replace(/\s+/g, " ");
  const pool = NAME_BANK.filter((p) => p.tones.includes(tone));
  const offset = hashString(niche.toLowerCase()) % pool.length;
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const pattern = pool[(offset + i) % pool.length];
    names.push(pattern.text.replace("{niche}", niche));
  }
  const longNames = names.filter((n) => n.length > LONG_NAME_CHARS);
  const noteLines = [
    `${count} highlight name${count === 1 ? "" : "s"} for "${niche}" (${tone} tone), picked deterministically from a fixed bank of 48 name patterns — not AI-generated.`,
    "Instagram truncates highlight names around 10-11 characters on profile; the shortest names above read best.",
  ];
  if (longNames.length > 0) {
    noteLines.push(
      `Heads up: ${longNames.length} name${longNames.length === 1 ? "" : "s"} exceed ${LONG_NAME_CHARS} characters and will be cut off: ${longNames.join(" · ")}.`,
    );
  }
  return { niche, tone, count, names, longNames, note: noteLines.join(" "), isTemplateBased: true };
}

/** Template entry point. values: niche (text), tone (select), count (number). */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const nicheRaw = values.niche;
  if (typeof nicheRaw !== "string" || nicheRaw.trim() === "") {
    return { ok: false, error: "Niche is required — tell us your niche (e.g. \"fitness\", \"bakeries\")." };
  }
  const toneRaw = values.tone;
  const tone: string =
    toneRaw === undefined || toneRaw === null || String(toneRaw).trim() === ""
      ? "playful"
      : String(toneRaw).trim().toLowerCase();
  if (!isHighlightTone(tone)) {
    return { ok: false, error: `Tone "${String(toneRaw)}" is not supported — pick one: ${HIGHLIGHT_TONES.join(", ")}.` };
  }
  const count = toCount(values.count);
  if (count === null || count < MIN_COUNT || count > MAX_COUNT) {
    return { ok: false, error: `Count must be a whole number from ${MIN_COUNT} to ${MAX_COUNT}.` };
  }
  const result = generateHighlightNames(nicheRaw, tone, count);
  return {
    ok: true,
    values: {
      names: result.names,
      note: result.note,
    },
  };
}
