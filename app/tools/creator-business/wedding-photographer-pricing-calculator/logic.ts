/**
 * Wedding Photographer Pricing Calculator — pure logic (tool-472).
 *
 * ZERO imports, zero network, zero DOM. Deterministic arithmetic only.
 *
 * HONESTY: every number is USER-PROVIDED. There are no market rates, no
 * "typical" prices, no platform fees anywhere in this file. The result is an
 * ESTIMATE computed from the user's own inputs:
 *
 *   shootingLabor     = hoursOfCoverage * baseRate
 *   editingHours      = hoursOfCoverage * editingHoursPerShootingHour
 *   editingLabor      = editingHours * baseRate
 *   secondShooterCost = hoursOfCoverage * secondShooterRate (when enabled;
 *                       secondShooterRate is treated as an HOURLY rate —
 *                       documented in assumptions[])
 *   recommendedPackagePrice = shootingLabor + editingLabor
 *                             + secondShooterCost + printsAlbumsCost
 *
 * Money values round to the nearest cent (half-up).
 */


/** Round to the nearest cent, half-up. */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Parse a numeric input: accepts numbers and trimmed numeric strings.
 * Returns {ok:true,value} or {ok:false,message}.
 */
function parseNumber(
  name: string,
  value: unknown,
  opts: { min: number; minExclusive?: boolean }
): { ok: true; value: number } | { ok: false; error: string } {
  const minLabel = opts.minExclusive ? `greater than ${opts.min}` : `at least ${opts.min}`;
  if (value === undefined || value === null) {
    return { ok: false, error: `${name} is required.` };
  }
  let n: number;
  if (typeof value === "number") {
    n = value;
  } else if (typeof value === "string") {
    if (value.trim() === "") {
      return { ok: false, error: `${name} is required.` };
    }
    n = Number(value.trim());
  } else {
    return { ok: false, error: `${name} must be a number (got ${typeof value}).` };
  }
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: `${name} must be a finite number.` };
  }
  if (opts.minExclusive ? n <= opts.min : n < opts.min) {
    return { ok: false, error: `${name} must be ${minLabel}.` };
  }
  return { ok: true, value: n };
}

export interface WeddingPricingValues {
  /** Recommended package price, rounded to cents (ESTIMATE). */
  recommendedPackagePrice: number;
  /** Itemized breakdown: { label, amount } rows, last row is the total. */
  costBreakdown: Array<{ label: string; amount: number }>;
}

export interface WeddingPricingResult {
  ok: boolean;
  values?: WeddingPricingValues;
  error?: string;
}

/**
 * Calculate a wedding photography package price from the user's own inputs.
 *
 * Expected keys in `values`:
 *   hoursOfCoverage (number, > 0), baseRate (number, >= 0),
 *   editingHoursPerShootingHour (number, >= 0),
 *   printsAlbumsCost (number, >= 0),
 *   secondShooter (boolean, default false),
 *   secondShooterRate (number, >= 0; required when secondShooter is true).
 */
export function runTool(values: Record<string, unknown>): WeddingPricingResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Input must be an object." };
  }

  const hours = parseNumber("hoursOfCoverage", values.hoursOfCoverage, {
    min: 0,
    minExclusive: true,
  });
  if (!hours.ok) return { ok: false, error: hours.error };

  const baseRate = parseNumber("baseRate", values.baseRate, { min: 0 });
  if (!baseRate.ok) return { ok: false, error: baseRate.error };

  const editMult = parseNumber(
    "editingHoursPerShootingHour",
    values.editingHoursPerShootingHour,
    { min: 0 }
  );
  if (!editMult.ok) return { ok: false, error: editMult.error };

  const prints = parseNumber("printsAlbumsCost", values.printsAlbumsCost, { min: 0 });
  if (!prints.ok) return { ok: false, error: prints.error };

  let secondShooter = false;
  if (values.secondShooter !== undefined && values.secondShooter !== null) {
    if (typeof values.secondShooter !== "boolean") {
      return { ok: false, error: "secondShooter must be true or false." };
    }
    secondShooter = values.secondShooter;
  }

  let secondShooterRate = 0;
  if (secondShooter) {
    const r = parseNumber("secondShooterRate", values.secondShooterRate, { min: 0 });
    if (!r.ok) {
      return {
        ok: false,
        error:
          "secondShooterRate is required when a second shooter is enabled (their hourly rate).",
      };
    }
    secondShooterRate = r.value;
  }

  const shootingLabor = hours.value * baseRate.value;
  const editingHours = hours.value * editMult.value;
  const editingLabor = editingHours * baseRate.value;
  const secondShooterCost = secondShooter ? hours.value * secondShooterRate : 0;
  const recommendedPackagePrice = roundToCents(
    shootingLabor + editingLabor + secondShooterCost + prints.value
  );

  const breakdown: Array<{ label: string; amount: number }> = [
    {
      label: `Shooting labor (${fmt(hours.value)} h × ${money(baseRate.value)}/h)`,
      amount: roundToCents(shootingLabor),
    },
    {
      label: `Editing labor (${fmt(editingHours)} h × ${money(baseRate.value)}/h)`,
      amount: roundToCents(editingLabor),
    },
  ];
  if (secondShooter) {
    breakdown.push({
      label: `Second shooter (${fmt(hours.value)} h × ${money(secondShooterRate)}/h)`,
      amount: roundToCents(secondShooterCost),
    });
  }
  breakdown.push({
    label: "Prints & albums",
    amount: roundToCents(prints.value),
  });
  breakdown.push({ label: "TOTAL", amount: recommendedPackagePrice });

  return {
    ok: true,
    values: { recommendedPackagePrice, costBreakdown: breakdown },
  };
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

function money(n: number): string {
  return "$" + (Math.round(n * 100) / 100).toFixed(2);
}
