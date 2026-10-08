/**
 * Content Pillar Mapper — pure logic (tool-121).
 *
 * TEMPLATE SCAFFOLD, NOT RESEARCH: builds a pillar map from the pillar
 * names the user supplies. Subtopic prompts are fixed template patterns
 * (not researched topics) and formats come from a fixed list — both are
 * assigned deterministically by pillar index, cycling through the banks.
 *
 * Word banks (sizes documented here and in the result):
 *   SUBTOPIC_PROMPTS — 12 hand-written subtopic prompt patterns with
 *                      {pillar} and {niche} placeholders
 *   FORMAT_BANK      — 8 suggested video formats with a one-line use note
 *
 * Per pillar: 3 subtopic prompts (bank offset = pillar index, cycling)
 * and 2 formats (same scheme).
 *
 * Zero imports. Deterministic.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_PILLARS = 1;
export const MAX_PILLARS = 8;
export const MAX_PILLAR_LENGTH = 60;
export const MAX_NICHE_LENGTH = 80;

/** 12 hand-written subtopic prompt patterns. */
export const SUBTOPIC_PROMPTS: string[] = [
  "{pillar} for beginners: what {niche} newcomers must know first",
  "Common {pillar} mistakes in {niche} (and how to fix them)",
  "{pillar} tools and resources for {niche} creators",
  "Advanced {pillar} strategies for {niche}",
  "{pillar} case study: real {niche} examples broken down",
  "{pillar} myths in {niche} that need debunking",
  "How {pillar} changed {niche} in 2026",
  "{pillar} on a budget: {niche} edition",
  "{pillar} vs alternatives in {niche}: honest comparison",
  "Your {pillar} questions answered ({niche} Q&A)",
  "{pillar} checklist every {niche} channel needs",
  "The future of {pillar} in {niche}",
];

/** 8 suggested formats with a one-line use note. */
export const FORMAT_BANK: Array<{ format: string; use: string }> = [
  { format: "Tutorial", use: "best for how-to pillars — high search intent" },
  { format: "Listicle", use: "best for roundup pillars — easy to scan" },
  { format: "Case study", use: "best for proof pillars — builds trust" },
  { format: "Comparison", use: "best for decision pillars — captures buyers" },
  { format: "Q&A", use: "best for community pillars — answers real questions" },
  { format: "Documentary / deep dive", use: "best for story pillars — high watch time" },
  { format: "Challenge / experiment", use: "best for entertainment pillars — shareable" },
  { format: "News / update", use: "best for trend pillars — timely traffic" },
];

export const PROMPTS_PER_PILLAR = 3;
export const FORMATS_PER_PILLAR = 2;

export interface PillarCard {
  pillar: string;
  subtopicPrompts: string[];
  suggestedFormats: Array<{ format: string; use: string }>;
}

export interface PillarMapResult {
  niche: string;
  pillarCount: number;
  pillars: PillarCard[];
  /** Flat list of every prompt card, prefixed with its pillar. */
  promptCards: string[];
  methodologyNote: string;
  /** Always true — prompts are template patterns, not researched topics. */
  isTemplateBased: true;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** One pillar per line: trim, drop empties, dedupe (case-insensitive). */
export function parsePillars(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split("\n")) {
    const p = line.replace(/\s+/g, " ").trim();
    if (p.length === 0) continue;
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function mapPillars(niche: string, pillars: string[]): PillarMapResult {
  const cards: PillarCard[] = pillars.map((pillar, i) => {
    const subtopicPrompts: string[] = [];
    for (let k = 0; k < PROMPTS_PER_PILLAR; k++) {
      subtopicPrompts.push(
        SUBTOPIC_PROMPTS[(i + k) % SUBTOPIC_PROMPTS.length]
          .replaceAll("{pillar}", pillar)
          .replaceAll("{niche}", niche)
      );
    }
    const suggestedFormats: Array<{ format: string; use: string }> = [];
    for (let k = 0; k < FORMATS_PER_PILLAR; k++) {
      suggestedFormats.push(FORMAT_BANK[(i + k) % FORMAT_BANK.length]);
    }
    return { pillar, subtopicPrompts, suggestedFormats };
  });

  const promptCards = cards.flatMap((c) =>
    c.subtopicPrompts.map((p) => `[${c.pillar}] ${p}`)
  );

  return {
    niche,
    pillarCount: pillars.length,
    pillars: cards,
    promptCards,
    methodologyNote: `Scaffold built from your ${pillars.length} pillar(s): ${PROMPTS_PER_PILLAR} subtopic prompt patterns and ${FORMATS_PER_PILLAR} format suggestions per pillar, drawn from fixed banks of ${SUBTOPIC_PROMPTS.length} prompts and ${FORMAT_BANK.length} formats. These are template patterns, not researched topics — validate demand for each idea yourself.`,
    isTemplateBased: true,
  };
}

/**
 * Template entry point. values keys: niche (text, required),
 * pillars (textarea, required — one per line, 1–8).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const niche = values["niche"];
  if (!isNonEmptyString(niche)) {
    return { ok: false, error: "Enter your channel niche first." };
  }
  if (niche.trim().length > MAX_NICHE_LENGTH) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.` };
  }

  const pillars = parsePillars(values["pillars"]);
  if (pillars.length < MIN_PILLARS) {
    return { ok: false, error: "Enter at least 1 pillar (one per line)." };
  }
  if (pillars.length > MAX_PILLARS) {
    return { ok: false, error: `Maximum ${MAX_PILLARS} pillars — keep the map focused.` };
  }
  for (const p of pillars) {
    if (p.length > MAX_PILLAR_LENGTH) {
      return { ok: false, error: `Pillar "${p.slice(0, 30)}..." must be ${MAX_PILLAR_LENGTH} characters or fewer.` };
    }
  }

  const cleanNiche = niche.trim().toLowerCase();
  const result = mapPillars(cleanNiche, pillars);
  return {
    ok: true,
    values: {
      pillarMap: {
        columns: ["Pillar", "Subtopic prompts", "Suggested formats"],
        rows: result.pillars.map((c) => [
          c.pillar,
          c.subtopicPrompts.join(" | "),
          c.suggestedFormats.map((f) => `${f.format} (${f.use})`).join(" | "),
        ]),
      },
      promptCards: result.promptCards,
      pillarCount: result.pillarCount,
      methodologyNote: result.methodologyNote,
      isTemplateBased: result.isTemplateBased,
    },
  };
}
