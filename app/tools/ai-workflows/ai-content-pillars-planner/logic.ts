/**
 * Content Pillars Planner — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Arranges the user's niche into a pillar/cluster CONTENT GRID TEMPLATE.
 * It does NOT invent pillar names or subtopics — the grid is a fill-in
 * template: numbered pillars, numbered subtopic slots (the user names them),
 * and format suggestions rotated deterministically from a FIXED format bank.
 *
 * FIXED WORD BANKS (documented):
 * - FORMAT_BANK: 8 formats. Each (pillar, slot) pair gets the format at
 *   index (pillarIndex + slotIndex) % 8 — a pure rotation, no randomness.
 * - SUBTOPIC_SLOTS_PER_PILLAR: 6 numbered slots per pillar.
 *
 * Deterministic: same (niche, pillarCount) -> identical grid, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

/** Fixed bank of content formats suggested across pillar slots (size: 8). */
export const FORMAT_BANK: ReadonlyArray<string> = [
  "Blog post",
  "YouTube video",
  "Short-form video (TikTok / Reels / Shorts)",
  "Carousel post",
  "Newsletter issue",
  "Podcast episode",
  "X / Threads post",
  "Infographic / Pinterest pin",
];

/** Numbered subtopic slots rendered per pillar (fixed, not generated). */
export const SUBTOPIC_SLOTS_PER_PILLAR = 6;

export const MIN_PILLARS = 3;
export const MAX_PILLARS = 7;
export const MAX_NICHE_LENGTH = 120;

export interface PillarGrid {
  columns: string[];
  rows: string[][];
}

/** Coerce a value to an integer pillar count, or undefined when invalid. */
function parsePillarCount(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isInteger(raw)) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
  }
  return undefined;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Please enter your niche (for example, \"meal prep for beginners\")." };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return {
      ok: false,
      error: `Your niche is ${niche.length} characters — please keep it under ${MAX_NICHE_LENGTH}.`,
    };
  }

  const pillarCount = parsePillarCount(values["pillarCount"]);
  if (pillarCount === undefined) {
    return { ok: false, error: "Please choose how many pillars you want (a whole number from 3 to 7)." };
  }
  if (pillarCount < MIN_PILLARS || pillarCount > MAX_PILLARS) {
    return {
      ok: false,
      error: `Pillar count must be between ${MIN_PILLARS} and ${MAX_PILLARS} — you entered ${pillarCount}.`,
    };
  }

  const rows: string[][] = [];
  for (let p = 1; p <= pillarCount; p += 1) {
    for (let s = 1; s <= SUBTOPIC_SLOTS_PER_PILLAR; s += 1) {
      const format = FORMAT_BANK[(p - 1 + (s - 1)) % FORMAT_BANK.length];
      rows.push([
        `Pillar ${p}`,
        `Slot ${p}.${s} — name your subtopic (niche: ${niche})`,
        format,
      ]);
    }
  }

  const grid: PillarGrid = {
    columns: ["Pillar", "Subtopic slot", "Suggested format"],
    rows,
  };
  return { ok: true, values: { pillarGrid: grid } };
}
