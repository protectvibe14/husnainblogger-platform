/**
 * Blog Monetization Planner — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Shows a fixed table of ILLUSTRATIVE monthly revenue ranges for common blog
 * revenue streams, filtered by the traffic band you pick. The ranges are a
 * static lookup table of broad, clearly-labeled ESTIMATES — they are NOT
 * real revenue data, not from any platform, and not a prediction of what
 * you will earn. Your traffic level only selects which column to show; the
 * revenueStreams input (optional) only filters which rows to show.
 *
 * FIXED WORD BANKS (documented):
 * - STREAMS: 6 revenue streams, each with:
 *     - fixed low/high illustrative monthly USD ranges for each of the 4
 *       TRAFFIC_BANDS (24 range pairs total),
 *     - a fixed one-line guidance note.
 * - TRAFFIC_BANDS: 4 preset bands. trafficLevel must match one exactly.
 *
 * Every output row is labeled "Illustrative range (estimate, USD)" and the
 * estimateNote output restates that these are estimates, not real data.
 *
 * Deterministic: same (trafficLevel, revenueStreams) -> identical table,
 * always. Zero imports, zero DOM, zero network, zero Math.random.
 */

/** Traffic band ids (also the exact option values in meta.ts). */
export const TRAFFIC_BANDS: ReadonlyArray<string> = [
  "Under 10,000 / month",
  "10,000 - 50,000 / month",
  "50,000 - 250,000 / month",
  "Over 250,000 / month",
];

interface StreamRange {
  low: number;
  high: number;
}

interface RevenueStream {
  name: string;
  ranges: Record<string, StreamRange>; // keyed by TRAFFIC_BANDS
  note: string;
}

/**
 * Fixed illustrative revenue ranges (size: 6 streams x 4 bands).
 * These are broad planning estimates, NOT real earnings data.
 */
export const STREAMS: ReadonlyArray<RevenueStream> = [
  {
    name: "Display ads",
    ranges: {
      "Under 10,000 / month": { low: 0, high: 20 },
      "10,000 - 50,000 / month": { low: 50, high: 200 },
      "50,000 - 250,000 / month": { low: 200, high: 1000 },
      "Over 250,000 / month": { low: 1000, high: 5000 },
    },
    note: "Earns passively from pageviews; needs steady traffic to matter.",
  },
  {
    name: "Affiliate marketing",
    ranges: {
      "Under 10,000 / month": { low: 0, high: 30 },
      "10,000 - 50,000 / month": { low: 100, high: 500 },
      "50,000 - 250,000 / month": { low: 500, high: 2500 },
      "Over 250,000 / month": { low: 2500, high: 10000 },
    },
    note: "Works best with product reviews and how-to content in buying niches.",
  },
  {
    name: "Sponsored posts",
    ranges: {
      "Under 10,000 / month": { low: 0, high: 50 },
      "10,000 - 50,000 / month": { low: 100, high: 400 },
      "50,000 - 250,000 / month": { low: 400, high: 2000 },
      "Over 250,000 / month": { low: 2000, high: 8000 },
    },
    note: "Brands usually pay once your niche authority is visible.",
  },
  {
    name: "Digital products",
    ranges: {
      "Under 10,000 / month": { low: 0, high: 100 },
      "10,000 - 50,000 / month": { low: 200, high: 1000 },
      "50,000 - 250,000 / month": { low: 1000, high: 5000 },
      "Over 250,000 / month": { low: 5000, high: 20000 },
    },
    note: "Highest margin stream; you keep almost all of each sale.",
  },
  {
    name: "Services or coaching",
    ranges: {
      "Under 10,000 / month": { low: 0, high: 200 },
      "10,000 - 50,000 / month": { low: 500, high: 2000 },
      "50,000 - 250,000 / month": { low: 2000, high: 8000 },
      "Over 250,000 / month": { low: 8000, high: 30000 },
    },
    note: "Often the first real income for small blogs in expert niches.",
  },
  {
    name: "Email list monetization",
    ranges: {
      "Under 10,000 / month": { low: 0, high: 20 },
      "10,000 - 50,000 / month": { low: 50, high: 300 },
      "50,000 - 250,000 / month": { low: 300, high: 1500 },
      "Over 250,000 / month": { low: 1500, high: 6000 },
    },
    note: "Grows with your list size and how engaged subscribers are.",
  },
];

export interface MonetizationTable {
  columns: string[];
  rows: string[][];
}

const ESTIMATE_NOTE =
  "These are broad, illustrative estimate ranges from a fixed planning table - " +
  "not real revenue data and not a prediction of your earnings. Actual income " +
  "depends on your niche, pricing, audience, and execution. Use this as a " +
  "starting point for planning, not as financial advice.";

/** Format a range as "$50 - $200". */
function formatRange(r: StreamRange): string {
  return `$${r.low.toLocaleString("en-US")} - $${r.high.toLocaleString("en-US")}`;
}

/** Split a raw revenueStreams value (string or string[]) into clean names. */
function parseStreams(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null || raw === "") return [];
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
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(t);
  }
  return unique;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawLevel = values["trafficLevel"];
  const trafficLevel =
    typeof rawLevel === "string" ? rawLevel.trim() : undefined;
  if (!trafficLevel || TRAFFIC_BANDS.indexOf(trafficLevel) === -1) {
    return {
      ok: false,
      error: `Please pick a traffic level from: ${TRAFFIC_BANDS.join("; ")}.`,
    };
  }

  const requested = parseStreams(values["revenueStreams"]);
  if (requested === undefined) {
    return { ok: false, error: "Revenue streams must be a comma-separated list or an array of names." };
  }
  const validNames = STREAMS.map((s) => s.name);
  let selected: RevenueStream[];
  if (requested.length === 0) {
    selected = [...STREAMS];
  } else {
    selected = [];
    for (const name of requested) {
      const found = STREAMS.find((s) => s.name.toLowerCase() === name.toLowerCase());
      if (!found) {
        return {
          ok: false,
          error: `Unknown revenue stream: "${name}". Choose from: ${validNames.join(", ")}.`,
        };
      }
      selected.push(found);
    }
    // Keep the fixed table order, not the user's request order.
    selected.sort((a, b) => STREAMS.indexOf(a) - STREAMS.indexOf(b));
  }

  const columns = ["Revenue stream", "Illustrative monthly range (estimate, USD)", "Guidance"];
  const rows: string[][] = selected.map((s) => [
    s.name,
    formatRange(s.ranges[trafficLevel]),
    s.note,
  ]);

  const summary =
    `At "${trafficLevel}" traffic, this planning table shows illustrative estimate ranges for ` +
    `${selected.length} of ${STREAMS.length} revenue streams. ` +
    "Ranges are labeled estimates from a fixed table - not real data.";

  return {
    ok: true,
    values: {
      monetizationTable: { columns, rows } as MonetizationTable,
      estimateNote: `${summary} ${ESTIMATE_NOTE}`,
    },
  };
}
