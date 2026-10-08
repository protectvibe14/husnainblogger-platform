/**
 * AI Tool Stack Planner — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Recommends a monthly tool stack from a FIXED curated database of 12
 * tools across 6 categories. Your use cases are matched to categories by a
 * fixed keyword map (not AI); for each matched category the tool picks the
 * cheapest default-price tool that fits your monthly budget, or the cheapest
 * tool overall (flagged as over budget) when nothing fits. Prices are editable
 * DEFAULTS from a static list — they are NOT live vendor prices and must be
 * verified on each vendor's site.
 *
 * FIXED WORD BANKS (documented):
 * - TOOL_DB: 12 tools (6 categories x 2 tools each), each with
 *   { category, name, defaultPriceUsd, freePlan, note }.
 * - KEYWORD_MAP: 6 categories, each with a fixed list of lowercase match
 *   keywords (33 keywords total). A use case matches a category when it
 *   contains any of that category's keywords.
 * - Selection rule: within a category, candidates stay in DB order; the
 *   first candidate whose defaultPriceUsd <= monthlyBudget is picked.
 *   Otherwise the first candidate is picked and flagged "Over budget".
 *
 * Deterministic: same (monthlyBudget, useCases) -> identical table, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

interface ToolEntry {
  category: string;
  name: string;
  defaultPriceUsd: number;
  freePlan: boolean;
  note: string;
}

/** Fixed curated tool database (size: 12 tools, 6 categories x 2). */
export const TOOL_DB: ReadonlyArray<ToolEntry> = [
  { category: "Writing", name: "ChatGPT Plus", defaultPriceUsd: 20, freePlan: true, note: "General writing and drafting assistant with a free tier." },
  { category: "Writing", name: "Jasper", defaultPriceUsd: 49, freePlan: false, note: "Marketing-focused writing assistant." },
  { category: "Images", name: "Midjourney", defaultPriceUsd: 10, freePlan: false, note: "AI image generation for thumbnails and graphics." },
  { category: "Images", name: "Canva Pro", defaultPriceUsd: 15, freePlan: true, note: "Design tool with templates and a free tier." },
  { category: "Video", name: "CapCut", defaultPriceUsd: 0, freePlan: true, note: "Free video editor with captions and effects." },
  { category: "Video", name: "Runway", defaultPriceUsd: 15, freePlan: true, note: "AI video generation and editing with a free tier." },
  { category: "Voice & audio", name: "ElevenLabs", defaultPriceUsd: 5, freePlan: true, note: "AI voice generation with a free tier." },
  { category: "Voice & audio", name: "Murf", defaultPriceUsd: 29, freePlan: true, note: "Text-to-speech studio with a free tier." },
  { category: "SEO & research", name: "Ahrefs Starter", defaultPriceUsd: 129, freePlan: false, note: "Keyword and backlink research suite." },
  { category: "SEO & research", name: "Semrush Pro", defaultPriceUsd: 139, freePlan: false, note: "SEO toolkit for keywords and site audits." },
  { category: "Scheduling", name: "Buffer Essentials", defaultPriceUsd: 6, freePlan: true, note: "Social scheduling with a free tier." },
  { category: "Scheduling", name: "Later", defaultPriceUsd: 25, freePlan: true, note: "Visual social scheduler with a free tier." },
];

interface KeywordCategory {
  category: string;
  keywords: ReadonlyArray<string>;
}

/** Fixed use-case keyword map (size: 6 categories, 33 keywords). */
export const KEYWORD_MAP: ReadonlyArray<KeywordCategory> = [
  { category: "Writing", keywords: ["writing", "blog", "article", "copy", "draft", "newsletter"] },
  { category: "Images", keywords: ["image", "thumbnail", "design", "graphics", "art", "photo"] },
  { category: "Video", keywords: ["video", "shorts", "reels", "tiktok", "youtube", "editing"] },
  { category: "Voice & audio", keywords: ["voice", "audio", "podcast", "voiceover", "narration", "tts"] },
  { category: "SEO & research", keywords: ["seo", "keyword", "research", "ranking", "traffic", "backlink"] },
  { category: "Scheduling", keywords: ["schedule", "scheduling", "publish", "social", "automation"] },
];

export const MAX_USE_CASES = 10;
export const MAX_USE_CASE_LENGTH = 60;

export interface ToolTable {
  columns: string[];
  rows: string[][];
}

/** Coerce a value to a non-negative finite number, or undefined. */
function parseBudget(raw: unknown): number | undefined {
  let n: number | undefined;
  if (typeof raw === "number") n = raw;
  else if (typeof raw === "string") {
    const t = raw.trim();
    if (/^\d+(\.\d{1,2})?$/.test(t)) n = Number(t);
  }
  if (n === undefined || !Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100) / 100;
}

/** Split a raw useCases value (string or string[]) into clean tokens. */
function parseUseCases(raw: unknown): string[] | undefined {
  let tokens: string[];
  if (typeof raw === "string") {
    tokens = raw.split(/[,;\n]+/);
  } else if (Array.isArray(raw)) {
    if (!raw.every((t) => typeof t === "string")) return undefined;
    tokens = raw as string[];
  } else {
    return undefined;
  }
  const cleaned = tokens.map((t) => t.replace(/\s+/g, " ").trim()).filter((t) => t.length > 0);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const t of cleaned) {
    const key = t.toLowerCase();
    if (t.length > MAX_USE_CASE_LENGTH || seen.has(key)) continue;
    seen.add(key);
    unique.push(t);
  }
  if (unique.length < 1 || unique.length > MAX_USE_CASES) return undefined;
  return unique;
}

/** Match use cases to categories via the fixed keyword map (DB order, deduped). */
function matchCategories(useCases: string[]): { matched: string[]; unmatched: string[] } {
  const matched: string[] = [];
  const unmatched: string[] = [];
  for (const uc of useCases) {
    const lower = uc.toLowerCase();
    const hit = KEYWORD_MAP.find((kc) => kc.keywords.some((kw) => lower.includes(kw)));
    if (!hit) {
      unmatched.push(uc);
      continue;
    }
    if (!matched.includes(hit.category)) matched.push(hit.category);
  }
  return { matched, unmatched };
}

/** Pick the first candidate at or under budget, else the first candidate (over budget). */
function pickTool(category: string, budget: number): { tool: ToolEntry; overBudget: boolean } {
  const candidates = TOOL_DB.filter((t) => t.category === category);
  const affordable = candidates.find((t) => t.defaultPriceUsd <= budget);
  if (affordable) return { tool: affordable, overBudget: false };
  return { tool: candidates[0], overBudget: true };
}

/** Format a USD number as "$20" or "$20.50". */
function formatUsd(n: number): string {
  return `$${Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2)}`;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const budget = parseBudget(values["monthlyBudget"]);
  if (budget === undefined) {
    return {
      ok: false,
      error: "Please enter a monthly budget of 0 or more (for example, 50).",
    };
  }

  const useCases = parseUseCases(values["useCases"]);
  if (!useCases) {
    return {
      ok: false,
      error: `Please list 1 to ${MAX_USE_CASES} use cases (comma-separated, each up to ${MAX_USE_CASE_LENGTH} characters).`,
    };
  }

  const { matched, unmatched } = matchCategories(useCases);
  if (matched.length === 0) {
    return {
      ok: false,
      error:
        "None of your use cases matched a tool category. Try terms like writing, images, video, voice, SEO, or scheduling.",
    };
  }

  const columns = [
    "Category",
    "Recommended tool",
    "Monthly cost (default USD)",
    "Free plan?",
    "Budget status",
  ];
  const rows: string[][] = [];
  let total = 0;
  let overBudgetCount = 0;
  for (const category of matched) {
    const { tool, overBudget } = pickTool(category, budget);
    total = Math.round((total + tool.defaultPriceUsd) * 100) / 100;
    if (overBudget) overBudgetCount++;
    rows.push([
      category,
      tool.name,
      formatUsd(tool.defaultPriceUsd),
      tool.freePlan ? "Yes" : "No",
      overBudget ? "Over budget - default price exceeds your budget" : "Within budget",
    ]);
  }

  const summaryParts = [
    `Stack for: ${useCases.join(", ")}.`,
    `Estimated monthly total (default prices): ${formatUsd(total)} against a ${formatUsd(budget)} budget.`,
  ];
  if (overBudgetCount > 0) {
    summaryParts.push(
      `${overBudgetCount} ${overBudgetCount === 1 ? "pick" : "picks"} exceed your budget - consider free plans or raising the budget.`
    );
  } else {
    summaryParts.push("All picks fit within your budget.");
  }
  if (unmatched.length > 0) {
    summaryParts.push(`No category matched: ${unmatched.join(", ")}.`);
  }
  summaryParts.push(
    "Prices are editable defaults from a fixed list, not live vendor pricing - check each vendor's site before buying."
  );

  return {
    ok: true,
    values: {
      toolTable: { columns, rows } as ToolTable,
      budgetSummary: summaryParts.join(" "),
    },
  };
}
