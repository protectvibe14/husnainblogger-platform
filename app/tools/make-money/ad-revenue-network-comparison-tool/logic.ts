/**
 * Ad Revenue Network Comparison Tool — pure logic (tool-053).
 *
 * FORMULA (per network row):
 *   geoFactor      = 0.4 + 0.6 * (trafficShareUS / 100)
 *   nicheFactor    = benchmark multiplier for the selected niche (see below)
 *   adjustedRpm    = round2(networkRpm * geoFactor * nicheFactor)
 *   estEarnings    = round2(monthlySessions * adjustedRpm / 1000)
 * Rows are sorted by estEarnings descending.
 *
 * HONESTY (read the spec honestyNote before touching this):
 * - This is PURE CLIENT-SIDE TABLE MATH. There is NO live network data.
 * - Every network RPM is a BENCHMARK ESTIMATE from a fixed, user-editable
 *   default. The UI must never present these as real network payout data.
 * - The geo and niche multipliers are simplified benchmark adjustments
 *   (non-US traffic pays less; some niches pay more), not verified market
 *   rates. They are documented here and in content.methodology.
 * - Network traffic minimums are typical published requirements from a
 *   static table — not fetched live, not guaranteed current.
 * - Zero sessions -> all rows $0 (valid, not an error). Heavy non-US
 *   traffic -> a lower-RPM note is returned in `trafficNote`.
 *
 * DETERMINISM: same inputs -> identical outputs (no randomness, no clock).
 * ZERO IMPORTS: no node:, no DOM, no network, no Math.random.
 */

/** Network table — defaults are benchmark estimates, user-editable. */
export interface NetworkRow {
  id: string;
  label: string;
  /** Benchmark estimate default RPM (USD per 1000 sessions), user-editable. */
  defaultRpm: number;
  /** Typical published traffic minimum (static; not verified live). */
  requirement: string;
  /** Session threshold for the eligibility column, or null if none. */
  thresholdSessions: number | null;
}

export const NETWORKS: NetworkRow[] = [
  { id: "adsense", label: "Google AdSense", defaultRpm: 5, requirement: "No minimum traffic requirement", thresholdSessions: null },
  { id: "ezoic", label: "Ezoic", defaultRpm: 12, requirement: "No minimum traffic requirement", thresholdSessions: null },
  { id: "journey", label: "Mediavine Journey", defaultRpm: 18, requirement: "50,000 monthly sessions", thresholdSessions: 50000 },
  { id: "mediavine", label: "Mediavine", defaultRpm: 25, requirement: "50,000 monthly sessions", thresholdSessions: 50000 },
  { id: "raptive", label: "Raptive", defaultRpm: 30, requirement: "100,000 monthly pageviews", thresholdSessions: 100000 },
];

/**
 * Niche multiplier table — simplified benchmark estimates (higher-value
 * niches like finance and tech tend to pay more per 1000 sessions).
 * NOT verified market rates.
 */
export const NICHE_FACTORS: Record<string, number> = {
  "Personal Finance": 1.5,
  Tech: 1.3,
  "Health & Wellness": 1.25,
  Travel: 1.1,
  "Food & Recipes": 1.0,
  Lifestyle: 1.0,
  Parenting: 1.0,
  Sports: 1.0,
  "DIY & Crafts": 0.9,
  Pets: 0.9,
};

export const NICHE_OPTIONS: string[] = Object.keys(NICHE_FACTORS);
export const DEFAULT_NICHE = "Food & Recipes";
export const MIN_NETWORK_RPM = 0.5;
export const MAX_NETWORK_RPM = 200;

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function fmtMoney(v: number): string {
  return `$${v.toFixed(2)}`;
}

function fmtInt(v: number): string {
  return Math.floor(v).toLocaleString("en-US");
}

export interface ComparisonTable {
  columns: string[];
  rows: string[][];
}

export interface ComparisonResult {
  [key: string]: unknown;
  comparisonRows: ComparisonTable;
  trafficNote: string;
}

/**
 * runTool({ monthlySessions, trafficShareUS?, niche?, adsenseRpm?, ezoicRpm?,
 *           journeyRpm?, mediavineRpm?, raptiveRpm? })
 *
 * monthlySessions: required, finite number >= 0 (0 -> all rows $0).
 * trafficShareUS: optional number 0-100, default 100.
 * niche: optional, must be one of NICHE_OPTIONS; defaults to Food & Recipes.
 * <network>Rpm: optional benchmark-estimate override per network,
 *   must sit in the 0.5-200 sanity band.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!isPlainRecord(values)) {
    return fail("Input must be an object with your values.");
  }

  const rawSessions = values["monthlySessions"];
  if (typeof rawSessions !== "number" || Number.isNaN(rawSessions)) {
    return fail("Monthly sessions must be a number (e.g. 50000).");
  }
  if (!Number.isFinite(rawSessions)) {
    return fail("Monthly sessions must be finite — Infinity is not a valid count.");
  }
  if (rawSessions < 0) {
    return fail("Monthly sessions cannot be negative.");
  }

  const rawShare = values["trafficShareUS"];
  let shareUS: number;
  if (rawShare === undefined || rawShare === null || rawShare === "") {
    shareUS = 100;
  } else {
    if (typeof rawShare !== "number" || Number.isNaN(rawShare) || !Number.isFinite(rawShare)) {
      return fail("US traffic share must be a number between 0 and 100.");
    }
    if (rawShare < 0 || rawShare > 100) {
      return fail("US traffic share must be between 0 and 100 percent.");
    }
    shareUS = rawShare;
  }

  const rawNiche = values["niche"];
  let niche: string;
  if (rawNiche === undefined || rawNiche === null || rawNiche === "") {
    niche = DEFAULT_NICHE;
  } else if (typeof rawNiche === "string" && rawNiche in NICHE_FACTORS) {
    niche = rawNiche;
  } else {
    return fail(
      `Niche must be one of: ${NICHE_OPTIONS.join(", ")} (got ${String(rawNiche)}).`,
    );
  }

  const geoFactor = 0.4 + 0.6 * (shareUS / 100);
  const nicheFactor = NICHE_FACTORS[niche] as number;

  const rows: { label: string; requirement: string; eligibility: string; adjustedRpm: number; earnings: number }[] =
    [];
  for (const net of NETWORKS) {
    const rawRpm = values[`${net.id}Rpm`];
    let networkRpm: number;
    if (rawRpm === undefined || rawRpm === null || rawRpm === "") {
      networkRpm = net.defaultRpm;
    } else {
      if (typeof rawRpm !== "number" || Number.isNaN(rawRpm) || !Number.isFinite(rawRpm)) {
        return fail(`${net.label} RPM must be a finite number.`);
      }
      if (rawRpm < MIN_NETWORK_RPM || rawRpm > MAX_NETWORK_RPM) {
        return fail(
          `${net.label} RPM of ${rawRpm} is outside the ${MIN_NETWORK_RPM}-${MAX_NETWORK_RPM} sanity band — the default benchmark estimate is ${net.defaultRpm}.`,
        );
      }
      networkRpm = rawRpm;
    }

    const adjustedRpm = round2(networkRpm * geoFactor * nicheFactor);
    const earnings = round2((rawSessions * adjustedRpm) / 1000);
    const eligibility =
      net.thresholdSessions === null
        ? "No minimum"
        : rawSessions >= net.thresholdSessions
          ? "Meets minimum (est.)"
          : `Below ${fmtInt(net.thresholdSessions)} — likely not eligible`;

    rows.push({
      label: net.label,
      requirement: net.requirement,
      eligibility,
      adjustedRpm,
      earnings,
    });
  }

  rows.sort((a, b) => b.earnings - a.earnings);

  const trafficNote =
    shareUS < 50
      ? `Your traffic is mostly non-US (${fmtInt(shareUS)}% US), so every RPM was scaled down with a simplified benchmark adjustment — non-US traffic typically pays less. All figures are estimates, and the adjustment itself is an approximation.`
      : "Your traffic is mostly US-based, so benchmark RPMs were kept near full strength. All figures are still estimates — actual payouts depend on niche, season, and ad demand.";

  const result: ComparisonResult = {
    comparisonRows: {
      columns: [
        "Ad network",
        "Traffic requirement",
        "Eligibility",
        "Adjusted RPM (est.)",
        "Est. monthly earnings",
      ],
      rows: rows.map((r) => [
        r.label,
        r.requirement,
        r.eligibility,
        fmtMoney(r.adjustedRpm),
        fmtMoney(r.earnings),
      ]),
    },
    trafficNote,
  };

  return { ok: true, values: result };
}
