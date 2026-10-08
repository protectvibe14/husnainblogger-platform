/**
 * Faceless Channel Idea Mixer — pure logic (tool-120).
 *
 * TEMPLATE WORDBANK, NOT AI: channel concepts are assembled by
 * deterministic combinatorics over fixed hand-written banks —
 * niche × format × angle — and served in bank order, cycling when the
 * requested count exceeds a bank's size. Outputs are labeled "idea
 * seeds", never researched opportunities.
 *
 * Word banks (sizes documented here and in the result):
 *   NICHES        — 16 faceless-friendly niche seeds (used only when the
 *                    user leaves the niche blank)
 *   FORMATS       — 4 formats: listicle, compilation, narration, tutorial
 *   ANGLE_BANK    — 12 hand-written angle templates with {niche}
 *   NAME_PATTERNS — 10 hand-written channel-name patterns with {Niche}
 *
 * YPP honesty note: since July 2025 YouTube's inauthentic-content policy
 * tightened review of mass-produced templated channels — every result
 * carries a warning to add original value.
 *
 * Zero imports. Deterministic.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export type FacelessFormat = "listicle" | "compilation" | "narration" | "tutorial";

export const FORMATS: FacelessFormat[] = ["listicle", "compilation", "narration", "tutorial"];

export const FORMAT_LABELS: Record<FacelessFormat, string> = {
  listicle: "Listicle",
  compilation: "Compilation",
  narration: "Narration / documentary",
  tutorial: "Tutorial",
};

/** 16 faceless-friendly niche seeds, used when the user gives no niche. */
export const NICHES: string[] = [
  "personal finance tips",
  "true crime stories",
  "space facts",
  "history explained",
  "AI tools tutorials",
  "cooking recipes",
  "motivational stories",
  "animal facts",
  "sports highlights analysis",
  "scary stories narration",
  "geography facts",
  "movie explanations",
  "business case studies",
  "health tips",
  "gaming lore",
  "travel guides",
];

/** 12 hand-written angle templates. `{niche}` is replaced per idea. */
export const ANGLE_BANK: string[] = [
  "Top 10 {niche} you never knew existed",
  "{niche} explained in 60 seconds — rapid-fire edition",
  "The untold story behind famous {niche}",
  "7 {niche} mistakes beginners always make",
  "{niche} tier list: ranking the best to worst",
  "What experts won't tell you about {niche}",
  "A day in the life of {niche} — narrated documentary",
  "{niche} before vs after: shocking transformations",
  "The ultimate beginner's guide to {niche}",
  "{niche} myths debunked with evidence",
  "Rare {niche} facts that sound fake but are real",
  "How {niche} actually works — visual breakdown",
];

/** 10 hand-written channel-name patterns. `{Niche}` = title-cased niche. */
export const NAME_PATTERNS: string[] = [
  "{Niche} Lab",
  "The {Niche} Channel",
  "{Niche} Explained",
  "Daily {Niche}",
  "{Niche} Vault",
  "Ask {Niche}",
  "{Niche} Uncovered",
  "The {Niche} Files",
  "{Niche} Academy",
  "Inside {Niche}",
];

export const MAX_IDEAS = 30;
export const MAX_NAME_SEEDS = 10;

export const POLICY_NOTE =
  "YouTube's inauthentic-content policy (tightened July 2025) puts mass-produced, templated channels under extra monetization review. These are idea seeds only — add original research, commentary, or storytelling so the channel is not just re-uploaded templates.";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isFormat(v: unknown): v is FacelessFormat {
  return (FORMATS as string[]).includes(v as string);
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export interface MixerResult {
  ideas: string[];
  channelNameSeeds: string[];
  policyNote: string;
  bankInfo: string;
  /** Always true — ideas are template seeds, not researched opportunities. */
  isTemplateBased: true;
}

export function mixIdeas(
  niche: string | null,
  format: FacelessFormat | null,
  count: number
): MixerResult {
  const ideas: string[] = [];
  for (let i = 0; i < count; i++) {
    const n = niche ?? NICHES[i % NICHES.length];
    const f = format ?? FORMATS[i % FORMATS.length];
    const angle = ANGLE_BANK[i % ANGLE_BANK.length].replaceAll("{niche}", n);
    ideas.push(`${FORMAT_LABELS[f]} — ${angle}`);
  }

  const seedNiche = niche ?? NICHES[0];
  const nameSeeds = NAME_PATTERNS.map((p) =>
    p.replaceAll("{Niche}", titleCase(seedNiche))
  );

  return {
    ideas,
    channelNameSeeds: nameSeeds,
    policyNote: POLICY_NOTE,
    bankInfo: `Idea seeds assembled from fixed banks: ${NICHES.length} niches × ${FORMATS.length} formats × ${ANGLE_BANK.length} angles, plus ${NAME_PATTERNS.length} name patterns. No AI generation, no demand research.`,
    isTemplateBased: true,
  };
}

/**
 * Template entry point. values keys: niche (optional text), format
 * (optional: any|listicle|compilation|narration|tutorial), count (optional number).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  let niche: string | null = null;
  const rawNiche = values["niche"];
  if (rawNiche !== undefined && rawNiche !== null && rawNiche !== "") {
    if (!isNonEmptyString(rawNiche)) {
      return { ok: false, error: "Niche must be text." };
    }
    if (rawNiche.trim().length > 60) {
      return { ok: false, error: "Niche must be 60 characters or fewer." };
    }
    niche = rawNiche.trim().toLowerCase();
  }

  let format: FacelessFormat | null = null;
  const rawFormat = values["format"];
  if (rawFormat !== undefined && rawFormat !== null && rawFormat !== "" && rawFormat !== "any") {
    if (!isFormat(rawFormat)) {
      return { ok: false, error: "Format must be one of: listicle, compilation, narration, tutorial." };
    }
    format = rawFormat;
  }

  let count = 10;
  const rawCount = values["count"];
  if (rawCount !== undefined && rawCount !== null && rawCount !== "") {
    if (typeof rawCount !== "number" || !Number.isInteger(rawCount) || rawCount < 1) {
      return { ok: false, error: "Count must be a whole number of at least 1." };
    }
    if (rawCount > MAX_IDEAS) {
      return { ok: false, error: `Maximum ${MAX_IDEAS} ideas per run.` };
    }
    count = rawCount;
  }

  const result = mixIdeas(niche, format, count);
  return {
    ok: true,
    values: {
      ideas: result.ideas,
      channelNameSeeds: result.channelNameSeeds,
      policyNote: result.policyNote,
      bankInfo: result.bankInfo,
      isTemplateBased: result.isTemplateBased,
    },
  };
}
