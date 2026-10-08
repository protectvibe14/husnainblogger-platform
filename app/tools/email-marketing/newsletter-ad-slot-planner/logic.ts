/**
 * Newsletter Ad Slot Planner — pure logic (tool-450).
 *
 * Pure arithmetic on USER-SUPPLIED slot prices — the tool has no market
 * data, no rate defaults, and no benchmarks. Everything it computes comes
 * from the prices and fill rates the user types in.
 *
 * FORMULAS (published in meta.ts methodology; FORMULA-I-450):
 * - grossPerIssue = SUM(pricePerIssue_i)
 * - grossMonthlyRevenue = grossPerIssue * issuesPerMonth
 *   (upper-bound estimate: every slot sold in every issue)
 * - expectedRevenuePerIssue_i = pricePerIssue_i * (fillRatePct_i / 100)
 * - netRevenueAtFill = SUM(expectedRevenuePerIssue_i) * issuesPerMonth
 *   (fill-adjusted estimate, labeled as an estimate everywhere)
 * - utilizationPct = 100 * netRevenueAtFill / grossMonthlyRevenue
 *   (0 when gross is 0; this equals the price-weighted average fill rate)
 *
 * HONESTY / ASSUMPTIONS:
 * - The tool never invents ad rates or RPM figures. Price and fill-rate
 *   numbers come ONLY from the user's own input.
 * - results are ESTIMATES, not guarantees; revenue depends on actual sales.
 * - The fill rate defaults to 100% only when the user leaves it blank on a
 *   line, and each defaulted line is flagged in `notice` — never silent.
 * - Money rounds to 2 decimals; percentages to 2 decimals.
 * - Zero imports, zero network, zero DOM, zero randomness. Deterministic.
 */

export const MIN_ISSUES_PER_MONTH = 1;
export const MAX_ISSUES_PER_MONTH = 31;
export const MAX_SLOTS = 20;
export const MAX_NAME_CHARS = 80;
export const MAX_PRICE = 1_000_000_000;

export interface AdSlotInput {
  name: string;
  /** Price per issue, >= 0, user-supplied. */
  pricePerIssue: number;
  /** Expected fill rate %, 0-100, user-supplied (100 if omitted). */
  expectedFillRatePct: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function codePoints(s: string): number {
  return [...s].length;
}

/**
 * Parse the slots textarea: one slot per line,
 * "Name | pricePerIssue | expectedFillRatePct" (fill rate optional).
 * Returns the slots plus the names of slots whose fill rate defaulted to
 * 100% because the user left it blank (flagged in `notice`).
 */
export function parseSlotsText(raw: string): AdSlotInput[] {
  return parseSlotsInternal(raw).slots;
}

function parseSlotsInternal(raw: string): { slots: AdSlotInput[]; defaulted: string[] } {
  const slots: AdSlotInput[] = [];
  const defaulted: string[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    const lineNo = i + 1;
    const parts = line.split("|").map((p) => p.trim());
    const name = (parts[0] ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (!name) {
      throw new Error(`Line ${lineNo}: slot name is required.`);
    }
    if (codePoints(name) > MAX_NAME_CHARS) {
      throw new Error(`Line ${lineNo}: slot name must be ${MAX_NAME_CHARS} characters or fewer.`);
    }
    if (parts.length < 2 || parts[1] === "") {
      throw new Error(`Line ${lineNo}: price per issue is required (format "Name | price | fill rate %").`);
    }
    const price = Number(parts[1].replace(/[$,]/g, ""));
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Line ${lineNo}: "${parts[1]}" is not a valid price (must be 0 or more).`);
    }
    if (price > MAX_PRICE) {
      throw new Error(`Line ${lineNo}: price looks unrealistic (max ${MAX_PRICE.toLocaleString("en-US")}).`);
    }
    let fillRate = 100;
    if (parts.length >= 3 && parts[2] !== "") {
      fillRate = Number(parts[2].replace(/%$/, "").trim());
      if (!Number.isFinite(fillRate) || fillRate < 0 || fillRate > 100) {
        throw new Error(`Line ${lineNo}: "${parts[2]}" is not a valid fill rate (must be 0-100).`);
      }
    } else {
      defaulted.push(name);
    }
    slots.push({ name, pricePerIssue: price, expectedFillRatePct: fillRate });
  }
  return { slots, defaulted };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your newsletter ad slots first." };
  }

  // --- issuesPerMonth (required, integer 1-31) ---
  const rawIssues = values["issuesPerMonth"];
  const issues =
    typeof rawIssues === "number" ? rawIssues : Number(rawIssues);
  if (
    rawIssues === undefined ||
    rawIssues === null ||
    rawIssues === "" ||
    !Number.isFinite(issues) ||
    !Number.isInteger(issues) ||
    issues < MIN_ISSUES_PER_MONTH ||
    issues > MAX_ISSUES_PER_MONTH
  ) {
    return {
      ok: false,
      error: `Issues per month must be a whole number from ${MIN_ISSUES_PER_MONTH} to ${MAX_ISSUES_PER_MONTH}.`,
    };
  }

  // --- slots (textarea text or pre-parsed array) ---
  const rawSlots = values["slots"];
  let slots: AdSlotInput[];
  let defaulted: string[] = [];
  try {
    if (typeof rawSlots === "string") {
      const parsed = parseSlotsInternal(rawSlots);
      slots = parsed.slots;
      defaulted = parsed.defaulted;
    } else if (Array.isArray(rawSlots)) {
      slots = rawSlots.map((s, i) => {
        const n = i + 1;
        if (!s || typeof s !== "object") {
          throw new Error(`Slot ${n}: must be an object.`);
        }
        const nameRaw = (s as Record<string, unknown>)["name"];
        const name =
          typeof nameRaw === "string"
            ? nameRaw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
            : "";
        if (!name) throw new Error(`Slot ${n}: name is required.`);
        if (codePoints(name) > MAX_NAME_CHARS) {
          throw new Error(`Slot ${n}: name must be ${MAX_NAME_CHARS} characters or fewer.`);
        }
        const priceRaw = (s as Record<string, unknown>)["pricePerIssue"];
        const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error(`Slot ${n}: price must be a number of 0 or more.`);
        }
        if (price > MAX_PRICE) {
          throw new Error(`Slot ${n}: price looks unrealistic (max ${MAX_PRICE.toLocaleString("en-US")}).`);
        }
        const fillRaw = (s as Record<string, unknown>)["expectedFillRatePct"];
        let fillRate = 100;
        if (fillRaw !== undefined && fillRaw !== null && fillRaw !== "") {
          fillRate = typeof fillRaw === "number" ? fillRaw : Number(fillRaw);
          if (!Number.isFinite(fillRate) || fillRate < 0 || fillRate > 100) {
            throw new Error(`Slot ${n}: fill rate must be between 0 and 100.`);
          }
        }
        return { name, pricePerIssue: price, expectedFillRatePct: fillRate };
      });
    } else {
      return { ok: false, error: "Enter your ad slots, one per line: Name | price | fill rate %." };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not parse your ad slots." };
  }

  if (slots.length === 0) {
    return { ok: false, error: "Enter at least one ad slot." };
  }
  if (slots.length > MAX_SLOTS) {
    return {
      ok: false,
      error: `Too many slots (max ${MAX_SLOTS}). Combine or remove some.`,
    };
  }
  const names = slots.map((s) => s.name.toLowerCase());
  if (new Set(names).size !== names.length) {
    return { ok: false, error: "Slot names must be unique — two slots share a name." };
  }

  // --- compute ---
  const perSlot = slots.map((s) => ({
    name: s.name,
    pricePerIssue: round2(s.pricePerIssue),
    fillRatePct: round2(s.expectedFillRatePct),
    expectedRevenuePerIssue: round2(s.pricePerIssue * (s.expectedFillRatePct / 100)),
  }));

  const grossPerIssue = slots.reduce((sum, s) => sum + s.pricePerIssue, 0);
  const grossMonthlyRevenue = round2(grossPerIssue * issues);
  const netPerIssue = slots.reduce(
    (sum, s) => sum + s.pricePerIssue * (s.expectedFillRatePct / 100),
    0,
  );
  const netRevenueAtFill = round2(netPerIssue * issues);
  const utilizationPct =
    grossMonthlyRevenue === 0 ? 0 : round2((netRevenueAtFill / grossMonthlyRevenue) * 100);

  const defaultedNames = defaulted;
  const notices: string[] = [
    "Estimates only: these numbers come from YOUR prices and fill rates — the tool has no market-rate data and cannot tell you what to charge.",
  ];
  if (defaultedNames.length > 0) {
    notices.push(
      `Fill rate not given for ${defaultedNames.join(", ")} — assumed 100%. Add your real expected fill rates for better estimates.`,
    );
  }

  return {
    ok: true,
    values: {
      grossMonthlyRevenue,
      netRevenueAtFill,
      utilizationPct,
      slotTable: {
        columns: ["Slot", "Price / issue", "Fill rate %", "Expected revenue / issue"],
        rows: perSlot.map((r) => [
          r.name,
          r.pricePerIssue.toFixed(2),
          r.fillRatePct.toFixed(2),
          r.expectedRevenuePerIssue.toFixed(2),
        ]),
      },
      notice: notices.join(" "),
    },
  };
}
