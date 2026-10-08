/**
 * Blog Traffic-to-Income Planner — pure logic (tool-054).
 *
 * FORMULA:
 *   adIncome            = round2(monthlySessions * rpm / 1000)
 *   totalMonthlyIncome  = round2(adIncome + affiliateRevenue + productRevenue + sponsoredRevenue)
 *   annualProjection    = round2(totalMonthlyIncome * 12)
 *   share(stream)       = round1(stream / totalMonthlyIncome * 100)  (0 when total is 0)
 *
 * HONESTY:
 * - Pure user-input arithmetic. The tool performs arithmetic, not
 *   forecasting: revenue inputs other than ad income are entered by the
 *   user, not predicted.
 * - The annual projection is a straight x12 of the monthly total — no
 *   growth/decay modeling, no seasonality.
 * - All-zero inputs -> $0 totals plus a guidance message (valid, not an
 *   error). Results are estimates built from your own assumptions.
 *
 * DETERMINISM: same inputs -> identical outputs (no randomness, no clock).
 * ZERO IMPORTS: no node:, no DOM, no network, no Math.random.
 */

export const STREAM_LABELS = [
  "Display ads",
  "Affiliate revenue",
  "Product revenue",
  "Sponsored revenue",
] as const;

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
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

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

const NUMERIC_INPUTS = [
  "monthlySessions",
  "rpm",
  "affiliateRevenue",
  "productRevenue",
  "sponsoredRevenue",
] as const;

export interface IncomeBreakdownTable {
  columns: string[];
  rows: string[][];
}

/**
 * runTool({ monthlySessions?, rpm?, affiliateRevenue?, productRevenue?,
 *           sponsoredRevenue? })
 *
 * Every input is optional and defaults to 0. Each must be a finite number
 * >= 0 (negative values are rejected). Missing/invalid-but-empty ("") input
 * is treated as 0 so the planner can be filled in gradually.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!isPlainRecord(values)) {
    return fail("Input must be an object with your values.");
  }

  const parsed: Record<string, number> = {};
  for (const id of NUMERIC_INPUTS) {
    const raw = values[id];
    if (raw === undefined || raw === null || raw === "") {
      parsed[id] = 0;
      continue;
    }
    if (typeof raw !== "number" || Number.isNaN(raw) || !Number.isFinite(raw)) {
      return fail(`${labelFor(id)} must be a finite number.`);
    }
    if (raw < 0) {
      return fail(`${labelFor(id)} cannot be negative.`);
    }
    parsed[id] = raw;
  }

  const monthlySessions = parsed.monthlySessions as number;
  const rpm = parsed.rpm as number;
  const adIncome = round2((monthlySessions * rpm) / 1000);
  const streams: { label: string; amount: number }[] = [
    { label: "Display ads", amount: adIncome },
    { label: "Affiliate revenue", amount: round2(parsed.affiliateRevenue as number) },
    { label: "Product revenue", amount: round2(parsed.productRevenue as number) },
    { label: "Sponsored revenue", amount: round2(parsed.sponsoredRevenue as number) },
  ];

  const totalMonthlyIncome = round2(streams.reduce((s, x) => s + x.amount, 0));
  const annualProjection = round2(totalMonthlyIncome * 12);

  const rows = streams.map((x) => [
    x.label,
    fmtMoney(x.amount),
    fmtPct(totalMonthlyIncome > 0 ? round1((x.amount / totalMonthlyIncome) * 100) : 0),
  ]);

  let guidance: string;
  if (totalMonthlyIncome === 0) {
    guidance =
      "All income streams are $0 right now. To build a plan: raise Monthly sessions or RPM to grow ad income, or enter real numbers for affiliate, product, and sponsored revenue. Most full-time blogs combine several streams — rarely ads alone.";
  } else {
    const top = [...streams].sort((a, b) => b.amount - a.amount)[0];
    const topPct = round1((top.amount / totalMonthlyIncome) * 100);
    guidance =
      `Your biggest stream is ${top.label} at ${topPct}% of total income. ` +
      `The annual figure (${fmtMoney(annualProjection)}) is a straight x12 of the monthly total — it does not model traffic growth, seasonality, or rate changes.`;
  }

  return {
    ok: true,
    values: {
      totalMonthlyIncome,
      annualProjection,
      incomeBreakdown: {
        columns: ["Income stream", "Monthly amount (USD)", "Share of total"],
        rows,
      } as IncomeBreakdownTable,
      guidance,
    },
  };
}

function labelFor(id: string): string {
  switch (id) {
    case "monthlySessions":
      return "Monthly sessions";
    case "rpm":
      return "RPM";
    case "affiliateRevenue":
      return "Affiliate revenue";
    case "productRevenue":
      return "Product revenue";
    case "sponsoredRevenue":
      return "Sponsored revenue";
    default:
      return id;
  }
}
