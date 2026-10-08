/**
 * Service Package Builder (tool-497) — pure logic, zero imports.
 *
 * COMPOSITE BUILDER, HONEST MATH + DOCUMENT ASSEMBLY: items are services
 * [{ name, price }]. Package-level config (packageName, bundleDiscountPct,
 * packageDescription) is read from optional top-level args first, then
 * from the FIRST item row that carries them (the BuilderTemplate only
 * passes { items }, so the itemFields surface these fields on every row
 * and the first filled one wins), then from defaults.
 *
 * Formulas (formulaRef J-PACKAGE-TIER):
 *   alaCarteTotal = sum(service prices)
 *   packagePrice  = alaCarteTotal * (1 - bundleDiscountPct / 100)
 *   savings       = alaCarteTotal - packagePrice
 *
 * Rules:
 *   - At least one service; each needs a non-empty name and a finite
 *     price >= 0 (numeric strings accepted; "$1,200" style is stripped).
 *   - bundleDiscountPct must be a number between 0 and 100; defaults to 10.
 *   - packageName defaults to "My Service Package"; packageDescription
 *     defaults to "" (omitted from the sheet).
 *   - All money values rounded to 2 decimals; deterministic.
 */

export const DEFAULT_PACKAGE_NAME = "My Service Package";
export const DEFAULT_DISCOUNT_PCT = 10;
export const MAX_SERVICES = 20;
export const MAX_SHORT_FIELD = 200;
export const MAX_DESC = 1000;

export interface Service {
  name: string;
  price: number;
}

export interface PackageValues {
  packagePrice: number;
  savingsVsALaCarte: number;
  packageSalesSheet: string;
}

export interface RunResult {
  ok: boolean;
  values?: PackageValues;
  error?: string;
}

export interface RunArgs {
  items: Record<string, unknown>[];
  packageName?: unknown;
  bundleDiscountPct?: unknown;
  packageDescription?: unknown;
}

/** Trim, strip control chars, collapse whitespace, cap length. */
export function sanitize(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\x00-\x1f\x7f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Coerce a price: strips $, commas, spaces; null when not a finite number >= 0. */
export function parsePrice(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value === "string") {
    const v = value.trim().replace(/[$,\s]/g, "");
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

/** Round to 2 decimals (money). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** "$1,234.56" — manual comma grouping, locale-independent (deterministic). */
export function formatMoney(n: number): string {
  const fixed = n.toFixed(2);
  const [int, dec] = fixed.split(".");
  return `$${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}

function validateService(item: Record<string, unknown>, index: number): {
  ok: boolean;
  service?: Service;
  error?: string;
} {
  const label = `Item ${index + 1}`;
  if (!item || typeof item !== "object") return { ok: false, error: `${label}: not an object.` };
  const name = sanitize(item.name, MAX_SHORT_FIELD);
  if (name === "") return { ok: false, error: `${label}: service name is required.` };
  const price = parsePrice(item.price);
  if (price === null) return { ok: false, error: `${label}: price must be a number of 0 or more.` };
  return { ok: true, service: { name, price } };
}

function firstNonEmpty(items: Record<string, unknown>[], key: string): { value: string; index: number } | null {
  for (let i = 0; i < items.length; i++) {
    const v = sanitize(items[i]?.[key], key === "packageDescription" ? MAX_DESC : MAX_SHORT_FIELD);
    if (v !== "") return { value: v, index: i };
  }
  return null;
}

function parseDiscount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const v = value.trim().replace(/[%\s]/g, "");
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Resolve package config: top-level args → first filled row → defaults. */
export function resolvePackageConfig(args: RunArgs): {
  ok: boolean;
  name?: string;
  discountPct?: number;
  description?: string;
  error?: string;
} {
  const nameRaw = sanitize(args.packageName, MAX_SHORT_FIELD);
  const descRaw = sanitize(args.packageDescription, MAX_DESC);
  const fromName = nameRaw !== "" ? nameRaw : firstNonEmpty(args.items, "packageName")?.value;
  const fromDesc = descRaw !== "" ? descRaw : firstNonEmpty(args.items, "packageDescription")?.value;

  let discount: number | null = null;
  let discountSource = "";
  const topDiscount = parseDiscount(args.bundleDiscountPct);
  if (args.bundleDiscountPct !== undefined && args.bundleDiscountPct !== null && args.bundleDiscountPct !== "") {
    discount = topDiscount;
    discountSource = "Bundle discount";
  } else {
    const found = (() => {
      for (let i = 0; i < args.items.length; i++) {
        const raw = args.items[i]?.["bundleDiscountPct"];
        if (raw !== undefined && raw !== null && raw !== "") return { raw, index: i };
      }
      return null;
    })();
    if (found) {
      discount = parseDiscount(found.raw);
      discountSource = `Item ${found.index + 1}: bundle discount`;
    }
  }
  if (discount === null && discountSource !== "")
    return { ok: false, error: `${discountSource} must be a number between 0 and 100.` };
  const discountPct = discount === null ? DEFAULT_DISCOUNT_PCT : discount;
  if (discountPct < 0 || discountPct > 100)
    return { ok: false, error: `${discountSource || "Bundle discount"} must be a number between 0 and 100.` };

  return {
    ok: true,
    name: fromName ?? DEFAULT_PACKAGE_NAME,
    discountPct,
    description: fromDesc ?? "",
  };
}

/** Assemble the copy-paste sales sheet from the fixed template. */
export function buildSalesSheet(
  name: string,
  description: string,
  services: Service[],
  alaCarteTotal: number,
  discountPct: number,
  packagePrice: number,
  savings: number,
): string {
  const lines: string[] = [];
  lines.push(name.toUpperCase());
  if (description !== "") lines.push("", description);
  lines.push("", "WHAT'S INCLUDED");
  services.forEach((s, i) => lines.push(`${i + 1}. ${s.name} — ${formatMoney(s.price)}`));
  lines.push(
    "",
    `A-la-carte total: ${formatMoney(alaCarteTotal)}`,
    `Bundle discount: ${discountPct}%`,
    `Package price: ${formatMoney(packagePrice)}`,
    `You save: ${formatMoney(savings)}`,
    "",
    `Ready to start? Reply with "START" and I'll send the next steps to book the ${name}.`,
  );
  return lines.join("\n");
}

export function runTool(args: RunArgs): RunResult {
  if (!args || !Array.isArray(args.items)) return { ok: false, error: "No items were provided." };
  if (args.items.length === 0) return { ok: false, error: "Add at least one service to build a package." };
  if (args.items.length > MAX_SERVICES)
    return { ok: false, error: `Too many services (max ${MAX_SERVICES}).` };

  const services: Service[] = [];
  for (let i = 0; i < args.items.length; i++) {
    const res = validateService(args.items[i], i);
    if (!res.ok || !res.service) return { ok: false, error: res.error };
    services.push(res.service);
  }

  const cfg = resolvePackageConfig(args);
  if (!cfg.ok || cfg.name === undefined || cfg.discountPct === undefined || cfg.description === undefined)
    return { ok: false, error: cfg.error };

  const alaCarteTotal = round2(services.reduce((sum, s) => sum + s.price, 0));
  const packagePrice = round2(alaCarteTotal * (1 - cfg.discountPct / 100));
  const savingsVsALaCarte = round2(alaCarteTotal - packagePrice);

  return {
    ok: true,
    values: {
      packagePrice,
      savingsVsALaCarte,
      packageSalesSheet: buildSalesSheet(
        cfg.name,
        cfg.description,
        services,
        alaCarteTotal,
        cfg.discountPct,
        packagePrice,
        savingsVsALaCarte,
      ),
    },
  };
}
