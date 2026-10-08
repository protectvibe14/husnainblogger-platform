/**
 * Platform Fee Comparer — pure logic (zero imports, zero network, zero DOM).
 *
 * Compares net payouts across selling platforms using ONLY user-entered fees.
 * The tool NEVER hardcodes any platform's fee schedule — every platform's
 * feePct and fixedFee must be entered by the user for each run.
 *
 * Formula J-PLATFORM-FEE (published in meta.ts content.methodology):
 *   feeAmount = salePrice x (feePct / 100) + fixedFee
 *   netPayout = max(0, salePrice - feeAmount)   // floored at zero
 * Results are ranked by netPayout descending; ties on the top payout are
 * reported as a tie note instead of picking a single winner.
 * All money values are rounded to 2 decimals.
 */

export interface PlatformFeeInput {
  name: string;
  feePct: number;
  fixedFee: number;
}

export interface PlatformComparison {
  name: string;
  feePct: number;
  fixedFee: number;
  feeAmount: number;
  netPayout: number;
}

export type ToolResult =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; error: string };

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function money(n: number): string {
  return "$" + round2(n).toFixed(2);
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Parse the `platforms` input into validated per-platform fee records.
 * Accepts either:
 *  - an array of { name, feePct, fixedFee } records, or
 *  - a textarea string with one platform per line: "name, feePct, fixedFee".
 * Exported for tests.
 */
export function parsePlatforms(
  value: unknown,
): { ok: true; platforms: PlatformFeeInput[] } | { ok: false; error: string } {
  if (Array.isArray(value)) {
    return validatePlatformRecords(value);
  }
  const text = clean(value);
  if (text.length === 0) {
    return { ok: false, error: "Add at least one platform with its fees." };
  }
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { ok: false, error: "Add at least one platform with its fees." };
  }
  const records: Record<string, unknown>[] = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length !== 3) {
      return {
        ok: false,
        error: `Platform line ${i + 1}: use the format "name, fee %, fixed fee" (3 comma-separated values).`,
      };
    }
    const feePct = parts[1] === "" ? NaN : Number(parts[1]);
    const fixedFee = parts[2] === "" ? NaN : Number(parts[2]);
    records.push({ name: parts[0], feePct, fixedFee });
  }
  return validatePlatformRecords(records);
}

function validatePlatformRecords(
  records: Record<string, unknown>[],
): { ok: true; platforms: PlatformFeeInput[] } | { ok: false; error: string } {
  if (records.length === 0) {
    return { ok: false, error: "Add at least one platform with its fees." };
  }
  const platforms: PlatformFeeInput[] = [];
  for (let i = 0; i < records.length; i++) {
    const label = `Platform ${i + 1}`;
    const rec = records[i];
    if (!rec || typeof rec !== "object") {
      return { ok: false, error: `${label}: not a valid entry.` };
    }
    const name = clean(rec["name"]);
    if (name.length === 0) {
      return { ok: false, error: `${label}: platform name is required.` };
    }
    const feePct = rec["feePct"];
    if (!isFiniteNumber(feePct) || feePct < 0) {
      return {
        ok: false,
        error: `${label} ("${name}"): fee % must be a finite number, 0 or more. Enter the platform's fee yourself — this tool stores no fee schedules.`,
      };
    }
    const fixedFee = rec["fixedFee"];
    if (!isFiniteNumber(fixedFee) || fixedFee < 0) {
      return {
        ok: false,
        error: `${label} ("${name}"): fixed fee must be a finite number, 0 or more.`,
      };
    }
    platforms.push({ name, feePct, fixedFee });
  }
  return { ok: true, platforms };
}

/**
 * Tool logic slot (calculator). Called as runTool(values).
 * values: { salePrice: number|string, platforms: string | PlatformFeeInput[] }
 * Returns values.netPayoutPerPlatform (table), values.bestNetPayout (text),
 * values.feeBreakdownPerPlatform (list).
 */
export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter a sale price and at least one platform." };
  }

  const rawPrice = values["salePrice"];
  const salePrice =
    typeof rawPrice === "string" && rawPrice.trim() !== ""
      ? Number(rawPrice.trim())
      : rawPrice;
  if (typeof rawPrice === "string" && rawPrice.trim() === "") {
    return { ok: false, error: "Enter a sale price." };
  }
  if (!isFiniteNumber(salePrice)) {
    return { ok: false, error: "Sale price must be a finite number." };
  }
  if (salePrice < 0) {
    return { ok: false, error: "Sale price must be 0 or more." };
  }

  const parsed = parsePlatforms(values["platforms"]);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const ranked: PlatformComparison[] = parsed.platforms
    .map((p) => {
      const feeAmount = round2(salePrice * (p.feePct / 100) + p.fixedFee);
      const netPayout = round2(Math.max(0, salePrice - feeAmount));
      return { name: p.name, feePct: p.feePct, fixedFee: p.fixedFee, feeAmount, netPayout };
    })
    .sort((a, b) => b.netPayout - a.netPayout); // stable: input order kept on ties

  const top = ranked[0].netPayout;
  const winners = ranked.filter((r) => Math.abs(r.netPayout - top) < 0.005);
  const bestNetPayout =
    winners.length > 1
      ? `Tie: ${winners.map((w) => w.name).join(", ")} — ${money(top)} net payout each (based on the fees you entered).`
      : `${winners[0].name} — ${money(top)} net payout (highest, based on the fees you entered).`;

  const netPayoutPerPlatform = {
    columns: ["Platform", "Fee %", "Fixed fee", "Fees", "Net payout"],
    rows: ranked.map((r) => [
      r.name,
      `${r.feePct}%`,
      money(r.fixedFee),
      money(r.feeAmount),
      money(r.netPayout),
    ]),
  };

  const feeBreakdownPerPlatform: string[] = ranked.map(
    (r) =>
      `${r.name}: ${r.feePct}% + ${money(r.fixedFee)} on ${money(salePrice)} = ${money(r.feeAmount)} in fees → ${money(r.netPayout)} net.`,
  );

  return {
    ok: true,
    values: { netPayoutPerPlatform, bestNetPayout, feeBreakdownPerPlatform },
  };
}
