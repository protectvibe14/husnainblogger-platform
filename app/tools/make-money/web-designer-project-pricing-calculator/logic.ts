/**
 * Web Designer Project Pricing Calculator — pure logic (tool-073).
 *
 * Pure TypeScript: zero imports, zero DOM, zero network, fully deterministic
 * (same inputs → same outputs, always).
 *
 * ENGINE: benchmark lookup over FIXED tables in code (no AI, no network).
 *
 * FIXED TABLE 1 — base project price band by scope (4 rows, USD/project):
 *   landing   → $500–$2,000
 *   five_page → $2,000–$7,500
 *   ecommerce → $5,000–$25,000
 *   custom    → $10,000–$50,000
 *
 * FIXED TABLE 2 — experience multiplier (3 rows):
 *   entry  → 0.75
 *   mid    → 1.00
 *   senior → 1.50
 *
 * PAGE-COUNT SCALING: for "landing" and "five_page" scopes the band scales by
 * pageCount / referencePages (reference: landing 1, five_page 5). For
 * "ecommerce" and "custom" scopes the page count is ignored (scope is priced
 * on functionality, not page count) and this is stated in the output note.
 *
 * HONESTY: every figure above is a survey/market ESTIMATE of typical freelance
 * project pricing — NOT an official rate and NOT current verified market data.
 * The ecommerce and custom bands are deliberately wide: they are estimates and
 * the tool says so. Results are starting-point ranges the user can adjust.
 *
 * Formula:  suggested = [low × factor, high × factor]
 *           factor = experience_multiplier × page_factor
 * Rounding: nearest $50 (wide bands — false precision is avoided).
 */

/** Currency all amounts are expressed in. No FX conversion is performed. */
export const CURRENCY = "USD";

/** Project scopes accepted by the calculator. */
export const PROJECT_SCOPES = ["landing", "five_page", "ecommerce", "custom"] as const;
export type ProjectScope = (typeof PROJECT_SCOPES)[number];

/** Experience levels accepted by the calculator. */
export const EXPERIENCE_LEVELS = ["entry", "mid", "senior"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

/** Human-readable labels for the scope options. */
export const SCOPE_LABELS: Record<ProjectScope, string> = {
  landing: "Landing page",
  five_page: "5-page business website",
  ecommerce: "E-commerce store",
  custom: "Custom web application",
};

/**
 * FIXED benchmark table 1: 4 rows mapping project scope → base USD/project
 * band. All figures are survey/market ESTIMATES — never official rates.
 */
export const SCOPE_BASE_BANDS: Record<ProjectScope, { low: number; high: number }> = {
  landing: { low: 500, high: 2000 },
  five_page: { low: 2000, high: 7500 },
  ecommerce: { low: 5000, high: 25000 },
  custom: { low: 10000, high: 50000 },
};

/**
 * FIXED benchmark table 2: 3 rows mapping experience level → price multiplier.
 * Multipliers are labeled ESTIMATES.
 */
export const EXPERIENCE_MULTIPLIERS: Record<ExperienceLevel, number> = {
  entry: 0.75,
  mid: 1.0,
  senior: 1.5,
};

/** Reference page counts used for page-count scaling (landing & five_page only). */
export const SCOPE_REFERENCE_PAGES: Record<ProjectScope, number | null> = {
  landing: 1,
  five_page: 5,
  ecommerce: null,
  custom: null,
};

/** Sanity cap on page count (guards against absurd inputs). */
export const MAX_PAGE_COUNT = 100000;

export interface WebDesignPricingResult {
  ok: boolean;
  values?: {
    projectPriceLow: number;
    projectPriceHigh: number;
    scopeNote: string;
  };
  error?: string;
}

/** Round to the nearest $50 (wide bands — avoids false precision). */
function round50(value: number): number {
  return Math.round(value / 50) * 50;
}

/**
 * Coerce a value to a number: accepts numbers and numeric strings,
 * returns NaN for anything else (handled as a validation error).
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (!Number.isNaN(n)) return n;
  }
  return Number.NaN;
}

/** Normalize an enum-ish string: trim + lowercase, empty string when absent. */
function norm(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function runTool(values: Record<string, unknown>): WebDesignPricingResult {
  const raw = values && typeof values === "object" ? values : {};

  const scope = norm(raw["projectScope"]);
  if (!scope || !(PROJECT_SCOPES as readonly string[]).includes(scope)) {
    return {
      ok: false,
      error:
        "Pick a project scope (landing page, 5-page site, e-commerce, or custom) to get a price range.",
    };
  }

  const level = norm(raw["experienceLevel"]);
  if (!level || !(EXPERIENCE_LEVELS as readonly string[]).includes(level)) {
    return {
      ok: false,
      error:
        "Pick an experience level (Entry, Mid, or Senior) to get a price range.",
    };
  }

  const pages = toNumber(raw["pageCount"]);
  if (Number.isNaN(pages) || !Number.isFinite(pages)) {
    return {
      ok: false,
      error: "Enter the number of pages as a whole number.",
    };
  }
  if (!Number.isInteger(pages) || pages <= 0) {
    return {
      ok: false,
      error: "Page count must be a whole number greater than 0.",
    };
  }
  if (pages > MAX_PAGE_COUNT) {
    return {
      ok: false,
      error: `Page count looks too high — keep it under ${MAX_PAGE_COUNT}.`,
    };
  }

  const s = scope as ProjectScope;
  const exp = level as ExperienceLevel;
  const base = SCOPE_BASE_BANDS[s];
  const expFactor = EXPERIENCE_MULTIPLIERS[exp];

  const referencePages = SCOPE_REFERENCE_PAGES[s];
  const pageFactor = referencePages === null ? 1 : pages / referencePages;
  const factor = expFactor * pageFactor;

  const projectPriceLow = round50(base.low * factor);
  const projectPriceHigh = round50(base.high * factor);

  const parts: string[] = [];
  parts.push(
    `${SCOPE_LABELS[s]}: base band $${base.low.toLocaleString("en-US")}–$${base.high.toLocaleString("en-US")} (survey estimate).`,
  );
  parts.push(`${exp}-level multiplier ×${expFactor}.`);
  if (referencePages === null) {
    parts.push(
      `Page count (${pages}) is informational only for ${SCOPE_LABELS[s].toLowerCase()} — pricing follows functionality, not pages.`,
    );
  } else {
    parts.push(
      `Page adjustment ×${roundPageFactor(pageFactor)} (${pages} pages vs ${referencePages}-page reference).`,
    );
  }
  parts.push("Wide estimate — get a real quote for exact requirements.");

  return {
    ok: true,
    values: {
      projectPriceLow,
      projectPriceHigh,
      scopeNote: parts.join(" "),
    },
  };
}

/** Format the page factor with up to 2 decimals for the note. */
function roundPageFactor(value: number): string {
  const r = Math.round(value * 100) / 100;
  return String(r);
}
