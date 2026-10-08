/**
 * Quarterly Tax Estimator for Freelancers — pure logic (tool-469), zero
 * imports, zero network, zero DOM.
 *
 * HONESTY CONTRACT (critical): tax rates are USER-PROVIDED inputs only.
 * There are NO hardcoded tax rates, brackets, defaults, or placeholders
 * that look like rates anywhere in this file. The tool multiplies the
 * user's profit by the user's rate — nothing more.
 *
 * Formula J-TAX-EST (published in methodology):
 *   Mode A (single effective rate):
 *     estimatedAnnualTax       = annualNetProfitEstimate * (effectiveTaxRatePct / 100)
 *     estimatedQuarterlyPayment = estimatedAnnualTax / 4
 *   Mode B (split rates — both must be entered explicitly):
 *     estimatedAnnualTax       = annualNetProfitEstimate * ((incomeTaxRatePct + selfEmploymentTaxRatePct) / 100)
 *     estimatedQuarterlyPayment = estimatedAnnualTax / 4
 *
 * Mode selection: if BOTH split rates are entered -> Mode B (an entered
 * effective rate is ignored and reported as ignored). If no split rates
 * -> Mode A requires an explicitly entered effective rate. If neither ->
 * validation error (the tool never assumes a rate).
 *
 * quarterNetProfit is optional context only; the quarterly figure is
 * always annual/4 per the formula. It is echoed in the breakdown so the
 * user can compare.
 *
 * Money values round to the nearest cent (half-up).
 */

export const DISCLAIMER =
  "Estimate only — general information, not tax advice. Tax rules vary by country and state; verify with a tax professional.";

export interface TaxEstimateInput {
  quarterNetProfit?: unknown;
  annualNetProfitEstimate?: unknown;
  effectiveTaxRatePct?: unknown;
  incomeTaxRatePct?: unknown;
  selfEmploymentTaxRatePct?: unknown;
}

export interface RunResult {
  ok: boolean;
  values?: {
    estimatedQuarterlyPayment: number;
    estimatedAnnualTax: number;
    rateBreakdown: string[];
  };
  error?: string;
}

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** True when the raw value counts as "entered by the user". */
function isEntered(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

/**
 * Parse a required-or-optional money input. Accepts numbers or numeric
 * strings. Returns { amount, error }.
 */
export function parseMoney(
  name: string,
  value: unknown,
  opts: { required: boolean },
): { amount: number; error: string | null } {
  if (!isEntered(value)) {
    return opts.required
      ? { amount: 0, error: `Please enter ${name}.` }
      : { amount: 0, error: null };
  }
  const raw = typeof value === "number" ? value : String(value).trim();
  const n = typeof raw === "number" ? raw : Number(raw);
  if (typeof raw !== "number" && !/^\d+(\.\d+)?$/.test(raw)) {
    return { amount: 0, error: `${name} must be a number (got "${String(value)}").` };
  }
  if (!Number.isFinite(n)) {
    return { amount: 0, error: `${name} must be a finite number.` };
  }
  if (n < 0) {
    return { amount: 0, error: `${name} cannot be negative.` };
  }
  return { amount: n, error: null };
}

/**
 * Parse an optional tax-rate input. Returns { provided, rate, error }.
 * A rate of 0 entered explicitly counts as provided.
 */
export function parseRate(
  name: string,
  value: unknown,
): { provided: boolean; rate: number; error: string | null } {
  if (!isEntered(value)) {
    return { provided: false, rate: 0, error: null };
  }
  const raw = typeof value === "number" ? value : String(value).trim();
  const n = typeof raw === "number" ? raw : Number(raw);
  if (typeof raw !== "number" && !/^\d+(\.\d+)?$/.test(raw)) {
    return { provided: false, rate: 0, error: `${name} must be a number between 0 and 100.` };
  }
  if (!Number.isFinite(n)) {
    return { provided: false, rate: 0, error: `${name} must be a finite number.` };
  }
  if (n < 0 || n > 100) {
    return { provided: false, rate: 0, error: `${name} must be between 0 and 100.` };
  }
  return { provided: true, rate: n, error: null };
}

/** Format a money value with thousands separators and 2 decimals. */
export function formatMoney(n: number): string {
  const [int, dec] = roundToCents(n).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}

/** Tool entry point. */
export function runTool(values: Record<string, unknown>): RunResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your profit and tax rate." };
  }
  const v = values as TaxEstimateInput;

  const annual = parseMoney("annual net profit estimate", v.annualNetProfitEstimate, { required: true });
  if (annual.error) return { ok: false, error: annual.error };

  const quarter = parseMoney("quarter net profit", v.quarterNetProfit, { required: false });
  if (quarter.error) return { ok: false, error: quarter.error };

  const effective = parseRate("effective tax rate", v.effectiveTaxRatePct);
  if (effective.error) return { ok: false, error: effective.error };
  const income = parseRate("income tax rate", v.incomeTaxRatePct);
  if (income.error) return { ok: false, error: income.error };
  const se = parseRate("self-employment tax rate", v.selfEmploymentTaxRatePct);
  if (se.error) return { ok: false, error: se.error };

  // -- Mode selection: no rate is ever assumed. ---------------------------
  const useSplit = income.provided || se.provided;
  if (useSplit && (!income.provided || !se.provided)) {
    return {
      ok: false,
      error:
        "For the split-rate method, enter BOTH your income tax rate and your self-employment tax rate — or clear both and enter a single effective tax rate instead.",
    };
  }
  if (!useSplit && !effective.provided) {
    return {
      ok: false,
      error:
        "Please enter your effective tax rate (your own figure — this tool never fills one in), or enter both split rates instead.",
    };
  }

  const breakdown: string[] = [];
  let estimatedAnnualTax: number;

  if (useSplit) {
    const combined = income.rate + se.rate;
    estimatedAnnualTax = roundToCents(annual.amount * (combined / 100));
    breakdown.push(`Income tax rate: ${income.rate}% (entered by you)`);
    breakdown.push(`Self-employment tax rate: ${se.rate}% (entered by you)`);
    breakdown.push(`Combined rate applied: ${combined}%`);
    breakdown.push(
      `Annual: ${formatMoney(annual.amount)} x ${combined}% = ${formatMoney(estimatedAnnualTax)}`,
    );
    if (effective.provided) {
      breakdown.push(
        `Note: you also entered an effective rate of ${effective.rate}% — it was ignored because both split rates were provided.`,
      );
    }
  } else {
    estimatedAnnualTax = roundToCents(annual.amount * (effective.rate / 100));
    breakdown.push(`Effective tax rate: ${effective.rate}% (entered by you)`);
    breakdown.push(
      `Annual: ${formatMoney(annual.amount)} x ${effective.rate}% = ${formatMoney(estimatedAnnualTax)}`,
    );
  }

  const estimatedQuarterlyPayment = roundToCents(estimatedAnnualTax / 4);
  breakdown.push(
    `Quarterly: ${formatMoney(estimatedAnnualTax)} / 4 = ${formatMoney(estimatedQuarterlyPayment)}`,
  );

  if (isEntered(v.quarterNetProfit)) {
    breakdown.push(
      `Your reported quarter profit of ${formatMoney(quarter.amount)} is shown for comparison only — the quarterly figure above is always your annual estimate / 4.`,
    );
  }
  if (effective.provided && effective.rate === 0 && !useSplit) {
    breakdown.push("You entered a 0% rate, so the computed estimate is $0.00.");
  }

  breakdown.push(DISCLAIMER);

  return {
    ok: true,
    values: { estimatedQuarterlyPayment, estimatedAnnualTax, rateBreakdown: breakdown },
  };
}
