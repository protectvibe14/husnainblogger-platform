/**
 * Rate Card Generator — pure logic (tool-085).
 *
 * HONESTY: document generator from user-supplied numbers. The output is
 * only as accurate as the user's inputs — said outright in the document
 * itself, the disclaimer, and the meta copy. Missing user rates fall back
 * to generic labeled ESTIMATE bands, never silently presented as the
 * creator's researched rates. No fabricated platform fees anywhere.
 *
 * Input row format (one platform per line, textarea):
 *   platform, followers, baseLow-baseHigh
 * e.g.  YouTube, 120000, 800-1500
 * e.g.  Podcast, 8000               (falls back to the estimate band)
 *
 * Fallback estimate bands by audience (USD, labeled estimates — the same
 * family as the tool-081 tiers, generic across platforms):
 * - <10k:        $50 – $200
 * - 10k–99,999: $200 – $1,000
 * - 100k–999,999: $1,000 – $10,000
 * - 1M–9,999,999: $10,000 – $50,000
 * - 10M+:        $50,000 – $300,000
 *
 * Zero imports, zero network, zero DOM. Fully deterministic:
 * same inputs -> identical outputs (no dates or randomness in the document).
 */

export const CURRENCY = "USD";

/** Max rows parsed from the textarea (sanity guard). */
export const MAX_ROWS = 50;

/** Max platform-name length (sanity guard). */
export const MAX_PLATFORM_LEN = 80;

/** Largest follower count accepted (sanity guard). */
export const MAX_FOLLOWERS = 1e12;

/** Fallback estimate band tiers (audience -> USD range). */
export interface EstimateTier {
  minAudience: number;
  low: number;
  high: number;
}
export const ESTIMATE_TIERS: EstimateTier[] = [
  { minAudience: 0, low: 50, high: 200 },
  { minAudience: 10000, low: 200, high: 1000 },
  { minAudience: 100000, low: 1000, high: 10000 },
  { minAudience: 1000000, low: 10000, high: 50000 },
  { minAudience: 10000000, low: 50000, high: 300000 },
];

/** Deliverable label per platform keyword. */
export function formatForPlatform(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("podcast")) return "Sponsored episode";
  if (p.includes("newsletter") || p.includes("substack") || p.includes("beehiiv")) return "Sponsored placement";
  if (p.includes("youtube")) return "Sponsored video";
  if (
    p.includes("tiktok") || p.includes("instagram") || p.includes("reel") ||
    p.includes("twitter") || p === "x" || p.includes("facebook") || p.includes("shorts")
  ) {
    return "Sponsored post";
  }
  return "Sponsored placement";
}

/** Platform-specific honesty notes (estimate context per platform). */
export function platformNote(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("podcast")) {
    return "Under ~1k downloads/ep use flat-fee guidance ($300–$500/ep estimate); see the Podcast Sponsorship Rate Calculator for CPM math.";
  }
  if (p.includes("newsletter") || p.includes("substack") || p.includes("beehiiv")) {
    return "Newsletter benchmarks ~$150 CPM primary / ~$50 CPM secondary (2026 estimates); see the Newsletter Sponsorship Rate Calculator.";
  }
  if (p.includes("youtube")) {
    return "Band family matches the YouTube Sponsorship Rate Calculator tiers (nano $20–$200 to mega $50k–$300k+).";
  }
  return "Generic estimate band — not platform-verified; adjust before sending to brands.";
}

export interface RateCardRow {
  platform: string;
  audience: number;
  format: string;
  rateLow: number;
  rateHigh: number;
  /** "your-rate" when the user supplied base rates, else "estimate-band". */
  source: "your-rate" | "estimate-band";
  note: string;
}

export interface RateCardInput {
  /** Optional creator/brand name for the document header. */
  creatorName?: string;
  /** Raw textarea content: one platform per line. */
  platformRows: string;
}

export interface RateCardResult {
  /** The rendered rate-card document (copy-ready text). */
  rateCard: string;
  /** One-line summary. */
  summary: string;
  /** Honesty disclaimer surfaced in the UI. */
  disclaimer: string;
  rows: RateCardRow[];
}

/** Round to the nearest $25 (fallback estimate bands). */
function roundEstimate(value: number): number {
  return Math.round(value / 25) * 25;
}

/** Round half-up to cents (user-supplied rates pass through nearly unchanged). */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function estimateBandFor(audience: number): { low: number; high: number } {
  let tier = ESTIMATE_TIERS[0];
  for (const t of ESTIMATE_TIERS) {
    if (audience >= t.minAudience) tier = t;
  }
  return { low: roundEstimate(tier.low), high: roundEstimate(tier.high) };
}

/**
 * Parse one textarea line into a RateCardRow.
 * @throws {Error} with a human message naming the line number on bad input.
 */
function parseRow(line: string, lineNo: number): RateCardRow {
  const parts = line.split(",").map((s) => s.trim());

  const platform = parts[0] ?? "";
  if (platform.length === 0) {
    throw new Error(`Line ${lineNo}: missing platform name (format: platform, followers, baseLow-baseHigh).`);
  }
  if (platform.length > MAX_PLATFORM_LEN) {
    throw new Error(`Line ${lineNo}: platform name is too long (max ${MAX_PLATFORM_LEN} characters).`);
  }

  const rawFollowers = parts[1] ?? "";
  if (rawFollowers.length === 0) {
    throw new Error(`Line ${lineNo} (${platform}): missing follower count (format: platform, followers, baseLow-baseHigh).`);
  }
  const audience = Number(rawFollowers);
  if (!Number.isFinite(audience) || Number.isNaN(audience)) {
    throw new Error(`Line ${lineNo} (${platform}): follower count must be a number.`);
  }
  if (!Number.isInteger(audience) || audience <= 0) {
    throw new Error(`Line ${lineNo} (${platform}): follower count must be a whole number greater than 0.`);
  }
  if (audience > MAX_FOLLOWERS) {
    throw new Error(`Line ${lineNo} (${platform}): follower count is unrealistically large.`);
  }

  let rateLow: number;
  let rateHigh: number;
  let source: RateCardRow["source"];

  const rawBase = parts[2] ?? "";
  if (rawBase.length === 0) {
    const band = estimateBandFor(audience);
    rateLow = band.low;
    rateHigh = band.high;
    source = "estimate-band";
  } else {
    const dash = rawBase.split("-").map((s) => s.trim());
    if (dash.length !== 2) {
      throw new Error(`Line ${lineNo} (${platform}): base rate must look like "800-1500".`);
    }
    const low = Number(dash[0]);
    const high = Number(dash[1]);
    if (!Number.isFinite(low) || !Number.isFinite(high) || Number.isNaN(low) || Number.isNaN(high)) {
      throw new Error(`Line ${lineNo} (${platform}): base rate low and high must be numbers.`);
    }
    if (low <= 0 || high <= 0) {
      throw new Error(`Line ${lineNo} (${platform}): base rate low and high must be greater than 0.`);
    }
    if (low > high) {
      throw new Error(`Line ${lineNo} (${platform}): base rate low cannot exceed high.`);
    }
    rateLow = roundMoney(low);
    rateHigh = roundMoney(high);
    source = "your-rate";
  }

  return {
    platform,
    audience,
    format: formatForPlatform(platform),
    rateLow,
    rateHigh,
    source,
    note: platformNote(platform),
  };
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Render the copy-ready rate-card document (deterministic, no dates). */
function renderCard(creatorName: string, rows: RateCardRow[]): string {
  const header = creatorName.length > 0 ? `RATE CARD — ${creatorName}` : "RATE CARD";
  const lines: string[] = [
    header,
    "Built with the HusnainBlogger Rate Card Generator (runs fully client-side).",
    "",
    "PLATFORM | AUDIENCE | DELIVERABLE | RATE (USD) | SOURCE",
  ];
  for (const r of rows) {
    lines.push(
      `${r.platform} | ${r.audience.toLocaleString("en-US")} | ${r.format} | ` +
      `${fmtMoney(r.rateLow)}–${fmtMoney(r.rateHigh)} | ` +
      (r.source === "your-rate" ? "Your rate" : "ESTIMATE band"),
    );
  }
  lines.push("");
  lines.push("NOTES");
  for (const r of rows) {
    lines.push(`- ${r.platform}: ${r.note}`);
  }
  lines.push(
    "- This card is only as accurate as the numbers you entered. Rates marked ESTIMATE are generic " +
    "labeled estimates, not verified platform rates — adjust before sending to brands.",
  );
  lines.push("- Actual deal prices vary by niche, engagement, audience geography, and negotiation.");
  return lines.join("\n");
}

/**
 * Build a rate card from the textarea rows.
 *
 * @throws {TypeError} for a non-object input or a non-string platformRows.
 * @throws {Error} when no valid platform rows remain (needs >= 1 platform),
 *   or when any row is malformed (message names the line number).
 */
export function generateRateCard(input: RateCardInput): RateCardResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  const rawRows = input.platformRows;
  if (typeof rawRows !== "string") {
    throw new TypeError("platformRows must be text (one platform per line).");
  }

  const creatorName =
    typeof input.creatorName === "string" ? input.creatorName.trim().slice(0, 80) : "";

  const lines = rawRows
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error("Add at least one platform (format: platform, followers, baseLow-baseHigh).");
  }
  if (lines.length > MAX_ROWS) {
    throw new Error(`Too many rows — keep it to ${MAX_ROWS} platforms or fewer.`);
  }

  const rows = lines.map((line, i) => parseRow(line, i + 1));

  const estimateRows = rows.filter((r) => r.source === "estimate-band").length;
  const estimateSuffix =
    estimateRows > 0
      ? rows.length === 1
        ? " This row uses an ESTIMATE band."
        : ` ${estimateRows} of ${rows.length} rows use ESTIMATE bands.`
      : " All rows use your rates.";
  const summary =
    rows.length === 1
      ? `Rate card with 1 platform (${rows[0].platform}): ${fmtMoney(rows[0].rateLow)}–${fmtMoney(rows[0].rateHigh)} USD.${estimateSuffix}`
      : `Rate card with ${rows.length} platforms.${estimateSuffix}`;

  const disclaimer =
    "This card is only as accurate as the numbers you entered — it is assembled " +
    "from your rates plus generic labeled estimate bands, not researched market data. " +
    "Verify every number before sending it to a brand.";

  return {
    rateCard: renderCard(creatorName, rows),
    summary,
    disclaimer,
    rows,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ creatorName?, platformRows })`
 * -> { ok, values?, error? }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input received — add at least one platform first." };
  }

  const rawRows = values["platformRows"];
  if (typeof rawRows !== "string" || rawRows.trim().length === 0) {
    return { ok: false, error: "Add at least one platform — one per line: platform, followers, baseLow-baseHigh." };
  }

  const rawName = values["creatorName"];

  let result: RateCardResult;
  try {
    result = generateRateCard({
      platformRows: rawRows,
      creatorName: typeof rawName === "string" ? rawName : undefined,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not build the rate card." };
  }

  return {
    ok: true,
    values: {
      rateCard: result.rateCard,
      summary: result.summary,
      disclaimer: result.disclaimer,
    },
  };
}
