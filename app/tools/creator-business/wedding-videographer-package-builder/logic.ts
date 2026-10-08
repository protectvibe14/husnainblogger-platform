/**
 * Wedding Videographer Package Builder — pure logic (tool-471), zero
 * imports, zero network, zero DOM.
 *
 * HONESTY CONTRACT: arithmetic tier builder on USER-ENTERED pricing only.
 * Every price, hour count, and discount is entered by the user per tier —
 * the tool structures and compares them; it never suggests, researches,
 * or invents prices.
 *
 * Formula J-PACKAGE-TIER (per tier):
 *   fullPrice   = basePrice + SUM(addOnPrices)          (all user inputs)
 *   tierPrice   = fullPrice * (1 - bundleDiscountPct / 100)
 *   bundleSavings = fullPrice - tierPrice
 *
 * Item fields (BuilderField type is text|url only, so numeric fields are
 * text inputs parsed strictly here):
 *   tierName           text, required
 *   hoursOfCoverage    text, required number > 0 (0 -> validation error)
 *   shooters           text, optional integer >= 0 (empty -> 1)
 *   deliverables       text, required comma-separated, at least 1
 *                      (none -> validation error)
 *   basePrice          text, required number >= 0
 *   addOnPrices        text, optional comma-separated numbers >= 0
 *   bundleDiscountPct  text, optional 0-100 (empty -> 0)
 *
 * runTool({ items }) validates each item; every failure is reported as
 * "Item N: <human message>". Max 10 tiers.
 *
 * Money values round to the nearest cent (half-up).
 */

export const MAX_ITEMS = 10;
export const MAX_FIELD_CHARS = 300;

export interface TierItem {
  tierName?: unknown;
  hoursOfCoverage?: unknown;
  shooters?: unknown;
  deliverables?: unknown;
  basePrice?: unknown;
  addOnPrices?: unknown;
  bundleDiscountPct?: unknown;
}

export interface TierResult {
  tierName: string;
  hoursOfCoverage: number;
  shooters: number;
  deliverables: string[];
  basePrice: number;
  addOnPrices: number[];
  bundleDiscountPct: number;
  fullPrice: number;
  tierPrice: number;
  bundleSavings: number;
}

export interface RunResult {
  ok: boolean;
  values?: {
    packageTiers: { columns: string[]; rows: string[][] };
    packageSummary: string;
  };
  error?: string;
}

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Trim, strip control chars, collapse whitespace, cap length. */
export function sanitize(value: unknown, maxChars: number = MAX_FIELD_CHARS): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars);
}

/** Format a money value: thousands separators + 2 decimals, no currency symbol. */
export function formatMoney(n: number): string {
  const [int, dec] = roundToCents(n).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}

function fail(itemNo: number, message: string): { error: string } {
  return { error: `Item ${itemNo}: ${message}` };
}

/**
 * Parse a numeric field. Accepts numbers or numeric strings.
 * Returns { value, error } where error is already prefixed with "Item N:".
 */
export function parseNumberField(
  itemNo: number,
  fieldLabel: string,
  value: unknown,
  opts: { required: boolean; min: number; integer?: boolean; allowZero?: boolean },
): { value: number; error: string | null } {
  const raw = typeof value === "number" ? value : sanitize(String(value ?? ""));
  if (raw === "" || raw === null) {
    return opts.required
      ? { value: 0, error: fail(itemNo, `${fieldLabel} is required.`).error }
      : { value: opts.min, error: null };
  }
  if (typeof raw !== "number" && !/^\d+(\.\d+)?$/.test(raw)) {
    return { value: 0, error: fail(itemNo, `${fieldLabel} must be a number.`).error };
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) {
    return { value: 0, error: fail(itemNo, `${fieldLabel} must be a finite number.`).error };
  }
  if (opts.integer && !Number.isInteger(n)) {
    return { value: 0, error: fail(itemNo, `${fieldLabel} must be a whole number.`).error };
  }
  if (n < opts.min) {
    return { value: 0, error: fail(itemNo, `${fieldLabel} must be >= ${opts.min}.`).error };
  }
  return { value: n, error: null };
}

/** Parse the comma-separated add-on prices. */
export function parseAddOnPrices(
  itemNo: number,
  value: unknown,
): { prices: number[]; error: string | null } {
  const raw = sanitize(value);
  if (raw === "") return { prices: [], error: null };
  const prices: number[] = [];
  const parts = raw.split(",");
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim();
    if (p === "") continue;
    if (!/^\d+(\.\d+)?$/.test(p)) {
      return { prices: [], error: fail(itemNo, `add-on price #${i + 1} ("${p}") must be a number >= 0.`).error };
    }
    const n = Number(p);
    if (!Number.isFinite(n) || n < 0) {
      return { prices: [], error: fail(itemNo, `add-on price #${i + 1} must be a finite number >= 0.`).error };
    }
    prices.push(n);
  }
  return { prices, error: null };
}

/** Parse the deliverables list; at least one required. Split before sanitizing so newlines survive. */
export function parseDeliverables(
  itemNo: number,
  value: unknown,
): { deliverables: string[]; error: string | null } {
  if (typeof value !== "string" || sanitize(value) === "") {
    return { deliverables: [], error: fail(itemNo, "add at least one deliverable (e.g. highlight film, teaser).").error };
  }
  const list = value
    .split(/[,;\n]+/)
    .map((s) => sanitize(s, 120))
    .filter((s) => s !== "");
  if (list.length === 0) {
    return { deliverables: [], error: fail(itemNo, "add at least one deliverable (e.g. highlight film, teaser).").error };
  }
  return { deliverables: list, error: null };
}

/** Validate one tier item and compute its pricing. */
export function buildTier(itemNo: number, item: TierItem): { tier: TierResult; error: string | null } {
  const tierName = sanitize(item.tierName, 120);
  if (tierName === "") {
    return { tier: null as unknown as TierResult, error: fail(itemNo, "tier name is required.").error };
  }

  const hours = parseNumberField(itemNo, "hours of coverage", item.hoursOfCoverage, {
    required: true,
    min: 0,
  });
  if (hours.error) return { tier: null as unknown as TierResult, error: hours.error };
  if (hours.value <= 0) {
    return { tier: null as unknown as TierResult, error: fail(itemNo, "hours of coverage must be greater than 0.").error };
  }

  const shootersRaw = sanitize(item.shooters);
  let shooters = 1;
  if (shootersRaw !== "") {
    const s = parseNumberField(itemNo, "shooters", item.shooters, { required: false, min: 0, integer: true });
    if (s.error) return { tier: null as unknown as TierResult, error: s.error };
    shooters = s.value;
  }

  const deliverables = parseDeliverables(itemNo, item.deliverables);
  if (deliverables.error) return { tier: null as unknown as TierResult, error: deliverables.error };

  const base = parseNumberField(itemNo, "base price", item.basePrice, { required: true, min: 0 });
  if (base.error) return { tier: null as unknown as TierResult, error: base.error };

  const addOns = parseAddOnPrices(itemNo, item.addOnPrices);
  if (addOns.error) return { tier: null as unknown as TierResult, error: addOns.error };

  const discountRaw = sanitize(item.bundleDiscountPct);
  let bundleDiscountPct = 0;
  if (discountRaw !== "") {
    const d = parseNumberField(itemNo, "bundle discount %", item.bundleDiscountPct, {
      required: false,
      min: 0,
    });
    if (d.error) return { tier: null as unknown as TierResult, error: d.error };
    if (d.value > 100) {
      return { tier: null as unknown as TierResult, error: fail(itemNo, "bundle discount % must be between 0 and 100.").error };
    }
    bundleDiscountPct = d.value;
  }

  const fullPrice = roundToCents(base.value + addOns.prices.reduce((a, b) => a + b, 0));
  const tierPrice = roundToCents(fullPrice * (1 - bundleDiscountPct / 100));
  const bundleSavings = roundToCents(fullPrice - tierPrice);

  return {
    tier: {
      tierName,
      hoursOfCoverage: hours.value,
      shooters,
      deliverables: deliverables.deliverables,
      basePrice: roundToCents(base.value),
      addOnPrices: addOns.prices.map(roundToCents),
      bundleDiscountPct,
      fullPrice,
      tierPrice,
      bundleSavings,
    },
    error: null,
  };
}

const TABLE_COLUMNS = [
  "Tier",
  "Hours",
  "Shooters",
  "Deliverables",
  "Full price",
  "Package price",
  "Bundle savings",
];

/** Build the comparison table from computed tiers. */
export function buildTable(tiers: TierResult[]): { columns: string[]; rows: string[][] } {
  return {
    columns: TABLE_COLUMNS,
    rows: tiers.map((t) => [
      t.tierName,
      String(t.hoursOfCoverage),
      String(t.shooters),
      t.deliverables.join(", "),
      formatMoney(t.fullPrice),
      formatMoney(t.tierPrice),
      formatMoney(t.bundleSavings),
    ]),
  };
}

/** Build the copy-paste package summary document. */
export function buildSummary(tiers: TierResult[]): string {
  const lines: string[] = [
    "WEDDING VIDEOGRAPHY PACKAGES",
    "Structured from your own pricing — this tool does not set prices.",
    "",
  ];
  tiers.forEach((t, i) => {
    const addOnPart =
      t.addOnPrices.length > 0
        ? ` (base ${formatMoney(t.basePrice)} + add-ons ${t.addOnPrices.map(formatMoney).join(" + ")})`
        : ` (base ${formatMoney(t.basePrice)})`;
    lines.push(`TIER ${i + 1}: ${t.tierName}`);
    lines.push(`  Hours of coverage: ${t.hoursOfCoverage} | Shooters: ${t.shooters}`);
    lines.push(`  Deliverables: ${t.deliverables.join(", ")}`);
    lines.push(`  Full price: ${formatMoney(t.fullPrice)}${addOnPart}`);
    lines.push(`  Bundle discount: ${t.bundleDiscountPct}%`);
    lines.push(`  Package price: ${formatMoney(t.tierPrice)}`);
    lines.push(`  Client saves vs full price: ${formatMoney(t.bundleSavings)}`);
    lines.push("");
  });
  lines.push(
    "Note: all prices were entered by you; this tool only structures and compares them. Not pricing advice.",
  );
  return lines.join("\n");
}

/** Tool entry point (builder shape). */
export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one package tier to build." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one package tier to build." };
  }
  if (args.items.length > MAX_ITEMS) {
    return { ok: false, error: `Too many tiers — the maximum is ${MAX_ITEMS}.` };
  }

  const tiers: TierResult[] = [];
  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    if (!item || typeof item !== "object") {
      return { ok: false, error: `Item ${i + 1}: tier details are missing.` };
    }
    const built = buildTier(i + 1, item as TierItem);
    if (built.error) {
      return { ok: false, error: built.error };
    }
    tiers.push(built.tier);
  }

  return {
    ok: true,
    values: {
      packageTiers: buildTable(tiers),
      packageSummary: buildSummary(tiers),
    },
  };
}
