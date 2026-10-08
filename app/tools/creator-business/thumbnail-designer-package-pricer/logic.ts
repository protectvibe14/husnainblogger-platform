/**
 * Thumbnail Designer Package Pricer — pure logic (tool-474).
 *
 * ZERO imports, zero network, zero DOM. Deterministic arithmetic only.
 *
 * HONESTY: every number is USER-PROVIDED. The per-thumbnail rate, the bundle
 * discount, and the monthly volume are yours — the tool knows no market
 * rates, no "typical" thumbnail prices, and no platform averages. Results
 * are ESTIMATES from your own inputs:
 *
 *   monthlyPackagePrice   = thumbnailsPerMonth * pricePerThumbnail
 *                           * (1 - bundleDiscountPct / 100)
 *   perThumbnailEffective = monthlyPackagePrice / thumbnailsPerMonth
 *   tierOptions           = for pack sizes 10 / 20 / 30:
 *                           packPrice    = packSize * pricePerThumbnail
 *                                          * (1 - bundleDiscountPct / 100)
 *                           savingsVsALaCarte = packSize * pricePerThumbnail
 *                                             - packPrice
 *
 * revisionsIncluded is recorded as a package feature only — it changes no
 * price (documented in assumptions[]).
 *
 * Money values round to the nearest cent (half-up).
 */

const TIER_PACK_SIZES = [10, 20, 30];

/** Round to the nearest cent, half-up. */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseNumber(
  name: string,
  value: unknown,
  opts: { min: number; max?: number; minExclusive?: boolean; integer?: boolean }
): { ok: true; value: number } | { ok: false; error: string } {
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
    return {
      ok: false,
      error: `${name} must be ${opts.minExclusive ? "greater than" : "at least"} ${opts.min}.`,
    };
  }
  if (opts.max !== undefined && n > opts.max) {
    return { ok: false, error: `${name} must be at most ${opts.max}.` };
  }
  if (opts.integer && !Number.isInteger(n)) {
    return { ok: false, error: `${name} must be a whole number.` };
  }
  return { ok: true, value: n };
}

export interface TierOption {
  packSize: number;
  aLaCartePrice: number;
  packPrice: number;
  savingsVsALaCarte: number;
}

export interface ThumbnailPackageValues {
  /** Monthly package price, rounded to cents (ESTIMATE). */
  monthlyPackagePrice: number;
  /** Effective per-thumbnail price inside the package, rounded to cents. */
  perThumbnailEffective: number;
  /** 10 / 20 / 30 pack options with a-la-carte comparison. */
  tierOptions: TierOption[];
  /** Package feature (informational — no price effect). */
  revisionsIncluded: number;
}

export interface ThumbnailPackageResult {
  ok: boolean;
  values?: ThumbnailPackageValues;
  error?: string;
}

/**
 * Price a thumbnail design package from the user's own inputs.
 *
 * Expected keys in `values`:
 *   thumbnailsPerMonth (integer > 0),
 *   pricePerThumbnail (number >= 0),
 *   revisionsIncluded (integer >= 0),
 *   bundleDiscountPct (number 0–100).
 */
export function runTool(values: Record<string, unknown>): ThumbnailPackageResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Input must be an object." };
  }

  const volume = parseNumber("thumbnailsPerMonth", values.thumbnailsPerMonth, {
    min: 0,
    minExclusive: true,
    integer: true,
  });
  if (!volume.ok) return { ok: false, error: volume.error };

  const perThumb = parseNumber("pricePerThumbnail", values.pricePerThumbnail, { min: 0 });
  if (!perThumb.ok) return { ok: false, error: perThumb.error };

  const revisions = parseNumber("revisionsIncluded", values.revisionsIncluded, {
    min: 0,
    integer: true,
  });
  if (!revisions.ok) return { ok: false, error: revisions.error };

  const discount = parseNumber("bundleDiscountPct", values.bundleDiscountPct, {
    min: 0,
    max: 100,
  });
  if (!discount.ok) return { ok: false, error: discount.error };

  const discountFactor = 1 - discount.value / 100;

  const monthlyPackagePrice = roundToCents(
    volume.value * perThumb.value * discountFactor
  );
  const perThumbnailEffective = roundToCents(monthlyPackagePrice / volume.value);

  const tierOptions: TierOption[] = TIER_PACK_SIZES.map((packSize) => {
    const aLaCartePrice = roundToCents(packSize * perThumb.value);
    const packPrice = roundToCents(packSize * perThumb.value * discountFactor);
    return {
      packSize,
      aLaCartePrice,
      packPrice,
      savingsVsALaCarte: roundToCents(aLaCartePrice - packPrice),
    };
  });

  return {
    ok: true,
    values: {
      monthlyPackagePrice,
      perThumbnailEffective,
      tierOptions,
      revisionsIncluded: revisions.value,
    },
  };
}
