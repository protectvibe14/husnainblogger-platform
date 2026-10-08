/**
 * Online Coach Package Builder — pure logic (tool-476).
 *
 * ZERO imports, zero network, zero DOM. Deterministic arithmetic + document
 * assembly only.
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * Output ids match meta.ts outputs ('packagePrice', 'packageTiers',
 * 'packageDescription').
 *
 * Row model: one row per package add-on with
 *   - addOnDescription (required text; e.g. "Voxer support between sessions")
 *   - addOnPrice (text parsed as a number >= 0; 0 = listed but not charged)
 *
 * Global package settings are read from the FIRST item only (same convention
 * as other builder tools in this repo):
 *   - packageName (optional text)
 *   - sessionsPerPackage (integer >= 1; 0 is a validation error)
 *   - sessionLengthMin (number > 0)
 *   - pricePerSession (number >= 0)
 *   - packageDiscountPct (number 0–100)
 *
 * If the package has no paid add-ons, enter one row with a 0 price.
 *
 * HONESTY: every price is USER-PROVIDED. The per-session price, the add-on
 * prices, and the discount are yours — the tool knows no market coaching
 * rates. The three package tiers are derived purely from the user's own
 * numbers (sessions only / with add-ons / with add-ons + the user's
 * discount); nothing about "typical" coaching packages is invented.
 * Results are ESTIMATES.
 */

const MAX_ITEMS = 50;

export interface PackageTier {
  name: string;
  includes: string;
  price: number;
}

export interface PackageValues {
  /** Final package price (with the user's discount), rounded to cents (ESTIMATE). */
  packagePrice: number;
  /** Three tiers derived from the user's own numbers. */
  packageTiers: PackageTier[];
  /** Client-ready plain-text package description. */
  packageDescription: string;
}

export interface PackageResult {
  ok: boolean;
  values?: PackageValues;
  error?: string;
}

/** Round to the nearest cent, half-up. */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Parse a number from a text/number cell. */
function parseNumberCell(
  itemNo: number,
  name: string,
  value: unknown,
  opts: { min: number; max?: number; minExclusive?: boolean; integer?: boolean }
): { ok: true; value: number } | { ok: false; error: string } {
  const label = `Item ${itemNo}: ${name}`;
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return { ok: false, error: `${label} is required.` };
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: `${label} must be a finite number.` };
  }
  if (opts.minExclusive ? n <= opts.min : n < opts.min) {
    return {
      ok: false,
      error: `${label} must be ${opts.minExclusive ? "greater than" : "at least"} ${opts.min}.`,
    };
  }
  if (opts.max !== undefined && n > opts.max) {
    return { ok: false, error: `${label} must be at most ${opts.max}.` };
  }
  if (opts.integer && !Number.isInteger(n)) {
    return { ok: false, error: `${label} must be a whole number.` };
  }
  return { ok: true, value: n };
}

function money(n: number): string {
  return "$" + n.toFixed(2);
}

export function runTool(args: { items: Record<string, unknown>[] }): PackageResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error:
        "Add at least one row to build a coaching package (use a 0 price if the package has no paid add-ons).",
    };
  }
  if (items.length > MAX_ITEMS) {
    return { ok: false, error: `Too many rows: the builder accepts at most ${MAX_ITEMS} rows.` };
  }

  // ---- Global settings from the first item ----
  const first = items[0] as Record<string, unknown>;
  const packageName = clean(first.packageName);

  const sessions = parseNumberCell(1, "sessionsPerPackage", first.sessionsPerPackage, {
    min: 0,
    minExclusive: true,
    integer: true,
  });
  if (!sessions.ok) return { ok: false, error: sessions.error };

  const sessionLength = parseNumberCell(1, "sessionLengthMin", first.sessionLengthMin, {
    min: 0,
    minExclusive: true,
  });
  if (!sessionLength.ok) return { ok: false, error: sessionLength.error };

  const pricePerSession = parseNumberCell(1, "pricePerSession", first.pricePerSession, {
    min: 0,
  });
  if (!pricePerSession.ok) return { ok: false, error: pricePerSession.error };

  const discount = parseNumberCell(1, "packageDiscountPct", first.packageDiscountPct, {
    min: 0,
    max: 100,
  });
  if (!discount.ok) return { ok: false, error: discount.error };

  // ---- Add-on rows ----
  const addOns: Array<{ description: string; price: number }> = [];
  for (let i = 0; i < items.length; i++) {
    const row = items[i] as Record<string, unknown>;
    const n = i + 1;
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const description = clean(row.addOnDescription);
    if (!description) {
      return { ok: false, error: `Item ${n}: addOnDescription is required.` };
    }
    const price = parseNumberCell(n, "addOnPrice", row.addOnPrice, { min: 0 });
    if (!price.ok) return { ok: false, error: price.error };
    addOns.push({ description, price: roundToCents(price.value) });
  }

  const sessionsTotal = roundToCents(sessions.value * pricePerSession.value);
  const addOnTotal = roundToCents(addOns.reduce((acc, a) => acc + a.price, 0));
  const fullPrice = roundToCents(sessionsTotal + addOnTotal);
  const packagePrice = roundToCents(fullPrice * (1 - discount.value / 100));
  const savings = roundToCents(fullPrice - packagePrice);

  const packageTiers: PackageTier[] = [
    {
      name: "Starter",
      includes: `${sessions.value} sessions only (no add-ons)`,
      price: sessionsTotal,
    },
    {
      name: "Standard",
      includes: `${sessions.value} sessions + all add-ons`,
      price: fullPrice,
    },
    {
      name: "Premium",
      includes: `${sessions.value} sessions + all add-ons (${discount.value}% package discount)`,
      price: packagePrice,
    },
  ];

  const title = packageName ? packageName.toUpperCase() : "COACHING PACKAGE";
  const docLines: string[] = [
    title,
    "=".repeat(Math.min(title.length, 40)),
    "",
    `Package: ${sessions.value} × ${sessionLength.value}-minute sessions @ ${money(roundToCents(pricePerSession.value))}/session = ${money(sessionsTotal)}`,
  ];
  if (addOnTotal > 0) {
    docLines.push("Included add-ons:");
    for (const a of addOns) {
      if (a.price > 0) docLines.push(`- ${a.description}: ${money(a.price)}`);
    }
  } else {
    docLines.push("Add-ons: none priced in this package.");
  }
  docLines.push(
    "",
    `Package discount: ${discount.value}% (your own discount)`,
    `PACKAGE PRICE (estimate): ${money(packagePrice)}`,
    discount.value > 0 ? `You save ${money(savings)} vs. the undiscounted ${money(fullPrice)}.` : "",
    "",
    "Prepared from the coach's own rates. Session format, scheduling, and refund terms to be agreed in writing before the package begins."
  );

  return {
    ok: true,
    values: {
      packagePrice,
      packageTiers,
      packageDescription: docLines.filter((l) => l !== "").join("\n"),
    },
  };
}
