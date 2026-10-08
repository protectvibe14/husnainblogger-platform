/**
 * Project Quote Generator — pure logic (tool-069).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Core is cost-plus-margin pricing math; the "quote document" is a
 *   formatted view of computed numbers (the generator type is
 *   calculator-first per the spec's honesty note).
 * - Formula: subtotal = estimated_hours * hourly_rate + material_costs
 *             quote_total = subtotal * (1 + margin_percent/100) * rush_multiplier
 * - lineItems is a string[] rendered as the quote document: one line per
 *   component (labor, materials, margin, rush).
 * - A rush multiplier above 5 triggers a SANITY WARNING (surfaced in the
 *   warning output) rather than an error — the quote still computes.
 * - Rounding: half-up to 2 decimals (USD). All inputs are user-supplied;
 *   no market data, no invented prices.
 * - Results are estimates based on the user's own hour/rate estimates.
 */

/** Largest value any single numeric input may take (sanity guard). */
export const MAX_INPUT_VALUE = 1e9;
/** Rush multipliers above this trigger a sanity warning (not an error). */
export const RUSH_WARNING_THRESHOLD = 5;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Format a USD amount with 2 decimals, deterministic (no locale). */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
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
 * runTool adapter for the Project Quote Generator.
 *
 * Inputs (values): estimatedHours (required, >0), hourlyRate (required, >0),
 * materialCosts (optional, >=0, default 0), marginPercent (optional, >=0,
 * default 0), rushMultiplier (optional, >=1, default 1).
 *
 * Outputs: subtotal (USD), quoteTotal (USD), lineItems (string[] — the
 * formatted quote document), warning (text — rush sanity warning or "").
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const hours = parseNumber(values, "estimatedHours", {
    required: true,
    min: 0.01,
    max: MAX_INPUT_VALUE,
    label: "Estimated hours",
  });
  if (!hours.ok) return { ok: false, error: hours.error };

  const rate = parseNumber(values, "hourlyRate", {
    required: true,
    min: 0.01,
    max: MAX_INPUT_VALUE,
    label: "Hourly rate",
  });
  if (!rate.ok) return { ok: false, error: rate.error };

  const materials = parseNumber(values, "materialCosts", {
    required: false,
    min: 0,
    max: MAX_INPUT_VALUE,
    label: "Material costs",
  });
  if (!materials.ok) return { ok: false, error: materials.error };
  const materialsValue = Number.isNaN(materials.value) ? 0 : materials.value;

  const margin = parseNumber(values, "marginPercent", {
    required: false,
    min: 0,
    max: 10000,
    label: "Margin percent",
  });
  if (!margin.ok) return { ok: false, error: margin.error };
  const marginPct = Number.isNaN(margin.value) ? 0 : margin.value;

  const rush = parseNumber(values, "rushMultiplier", {
    required: false,
    min: 1,
    max: MAX_INPUT_VALUE,
    label: "Rush multiplier",
  });
  if (!rush.ok) return { ok: false, error: rush.error };
  const rushMultiplier = Number.isNaN(rush.value) ? 1 : rush.value;

  const laborCost = roundToCents(hours.value * rate.value);
  const materialsCost = roundToCents(materialsValue);
  const subtotal = roundToCents(laborCost + materialsCost);
  const marginAmount = roundToCents(subtotal * (marginPct / 100));
  const preRushTotal = roundToCents(subtotal + marginAmount);
  const quoteTotal = roundToCents(preRushTotal * rushMultiplier);
  const rushAmount = roundToCents(quoteTotal - preRushTotal);

  const lineItems: string[] = [
    `Labor: ${hours.value} h x ${formatUSD(rate.value)}/h = ${formatUSD(laborCost)}`,
    `Materials & pass-through costs = ${formatUSD(materialsCost)}`,
    `Subtotal = ${formatUSD(subtotal)}`,
    `Margin (${marginPct}%) = ${formatUSD(marginAmount)}`,
  ];
  if (rushMultiplier > 1) {
    lineItems.push(
      `Rush fee (${rushMultiplier}x multiplier) = ${formatUSD(rushAmount)}`,
    );
  }
  lineItems.push(`Quote total = ${formatUSD(quoteTotal)}`);

  const warning =
    rushMultiplier > RUSH_WARNING_THRESHOLD
      ? `Sanity check: a rush multiplier of ${rushMultiplier}x is unusually high — ` +
        `confirm the client actually agreed to it before sending this quote.`
      : "";

  return {
    ok: true,
    values: { subtotal, quoteTotal, lineItems, warning },
  };
}
