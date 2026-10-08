/**
 * Freelance Hourly Rate Calculator — pure logic (tool-068).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Pure backwards math from user-supplied inputs: no external data, no
 *   market benchmarks, no invented rates. Every input comes from the user.
 * - required_hourly_rate = (annual_income_target + business_expenses) /
 *   billable_hours_per_year
 * - rate_with_tax_buffer = required_hourly_rate / (1 - tax_rate), where
 *   tax_rate is a fraction (0–1). This pre-funds the tax bill so that after
 *   paying the effective tax rate, the target income remains.
 * - Guard rails: billable hours <= 0 is rejected (division by zero);
 *   billable hours > 8760 (hours in a year) is rejected as impossible;
 *   a 100% tax rate is rejected (would require an infinite rate).
 * - Rounding: half-up to 2 decimals (USD). This is arithmetic on
 *   user-provided estimates, not a market-data claim.
 */

export const MAX_HOURS_PER_YEAR = 8760;
/** Largest income target the calculator will attempt (sanity guard). */
export const MAX_INCOME_TARGET = 1e12;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

interface NumberResult {
  ok: boolean;
  value: number;
  error?: string;
}

function parseNumber(
  values: Record<string, unknown>,
  id: string,
  opts: { required: boolean; min: number; max: number; label: string },
): NumberResult {
  const raw = values[id];
  if (raw === undefined || raw === null || raw === "") {
    if (!opts.required) return { ok: true, value: NaN };
    return { ok: false, value: NaN, error: `Please enter ${opts.label}.` };
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (typeof raw === "boolean" || Number.isNaN(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a number.` };
  }
  if (!Number.isFinite(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a finite number.` };
  }
  if (n < opts.min) {
    return { ok: false, value: NaN, error: `${opts.label} must be at least ${opts.min}.` };
  }
  if (n > opts.max) {
    return { ok: false, value: NaN, error: `${opts.label} must be at most ${opts.max}.` };
  }
  return { ok: true, value: n };
}

/**
 * runTool adapter for the Freelance Hourly Rate Calculator.
 *
 * Inputs (values): annualIncomeTarget (required, >0), billableHoursPerYear
 * (required, >0 and <= 8760), businessExpenses (optional, >=0, default 0),
 * taxRate (optional percent 0–100, default 0).
 *
 * Outputs: requiredHourlyRate (USD/hour), rateWithTaxBuffer (USD/hour),
 * note (text — methodology note).
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const target = parseNumber(values, "annualIncomeTarget", {
    required: true,
    min: 0.01,
    max: MAX_INCOME_TARGET,
    label: "Annual income target",
  });
  if (!target.ok) return { ok: false, error: target.error };

  const hours = parseNumber(values, "billableHoursPerYear", {
    required: true,
    min: 0.01,
    max: MAX_HOURS_PER_YEAR,
    label: "Billable hours per year",
  });
  if (!hours.ok) return { ok: false, error: hours.error };

  const expenses = parseNumber(values, "businessExpenses", {
    required: false,
    min: 0,
    max: MAX_INCOME_TARGET,
    label: "Business expenses",
  });
  if (!expenses.ok) return { ok: false, error: expenses.error };
  const expenseValue = Number.isNaN(expenses.value) ? 0 : expenses.value;

  const taxRate = parseNumber(values, "taxRate", {
    required: false,
    min: 0,
    max: 100,
    label: "Tax rate",
  });
  if (!taxRate.ok) return { ok: false, error: taxRate.error };
  const taxPct = Number.isNaN(taxRate.value) ? 0 : taxRate.value;
  if (taxPct >= 100) {
    return {
      ok: false,
      error: "A 100% tax rate would require an infinite hourly rate — please enter a rate below 100%.",
    };
  }

  const requiredHourlyRate = roundToCents((target.value + expenseValue) / hours.value);
  const taxFraction = taxPct / 100;
  const rateWithTaxBuffer = roundToCents(requiredHourlyRate / (1 - taxFraction));

  const note =
    "Pure arithmetic on your own inputs — no market data is used. " +
    "The tax buffer pre-funds your effective tax rate so the target income " +
    "remains after tax; it is not tax advice. Billable hours should reflect " +
    "realistic hours you can actually bill, not 40h × 52 weeks.";

  return {
    ok: true,
    values: { requiredHourlyRate, rateWithTaxBuffer, note },
  };
}
