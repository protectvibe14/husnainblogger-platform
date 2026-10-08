/**
 * Milestone Payment Planner — pure logic (tool-459).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Formula J-MILESTONE (from spec):
 *     amount_i = contractValue * (pct_i / 100)
 *     constraint: SUM(pct_i) = 100 (validation error otherwise; tolerance 0.01
 *     to absorb float formatting like 33.33 + 33.33 + 33.34)
 *     remainder cents from rounding go to the FINAL milestone.
 * - Percentages are USER-DEFINED. The tool does pure split math — it does not
 *   recommend percentages and gives no legal/financial advice (honesty note).
 * - Milestones enter as a textarea, one per line: "Name | pct | due condition"
 *   (due condition optional). runTool also accepts a pre-parsed array of
 *   {name, pct, dueCondition} objects for API-style calls.
 * - All money values round to the nearest cent (half-up).
 */

export const PCT_SUM_TOLERANCE = 0.01;

/** Round money to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function requireNonNegativeFinite(name: string, value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite (no Infinity).`);
  }
  if (value < 0) {
    throw new RangeError(`${name} must be >= 0.`);
  }
  return value;
}

/** One milestone as the user defines it. */
export interface MilestoneInput {
  name: string;
  /** Percentage of the contract total, 0–100. */
  pct: number;
  dueCondition: string;
}

/** One row of the computed schedule. */
export interface MilestoneScheduleRow {
  milestone: string;
  percent: number;
  amount: number;
  dueCondition: string;
}

/** Result of planning milestones. */
export interface MilestonePlanResult {
  contractValue: number;
  milestoneSchedule: MilestoneScheduleRow[];
  /** Total of the percentages (must be 100). */
  sumCheck: number;
  /** Human-readable one-line-per-milestone timeline. */
  paymentTimeline: string;
  /** Informational warnings (e.g. single 100% milestone), or null. */
  warning: string | null;
}

/**
 * Parse the milestone textarea: one milestone per line,
 * "Name | pct | due condition" (due condition optional).
 */
export function parseMilestoneText(raw: string): MilestoneInput[] {
  const milestones: MilestoneInput[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue; // skip blank lines
    const parts = line.split("|").map((p) => p.trim());
    const lineNo = i + 1;
    const name = parts[0] ?? "";
    if (!name) {
      throw new Error(`Line ${lineNo}: milestone name is required.`);
    }
    if (parts.length < 2 || parts[1] === "") {
      throw new Error(`Line ${lineNo}: percentage is required (format "Name | pct | due condition").`);
    }
    const pct = Number(parts[1].replace(/%$/, "").trim());
    if (Number.isNaN(pct)) {
      throw new Error(`Line ${lineNo}: "${parts[1]}" is not a valid percentage.`);
    }
    milestones.push({
      name,
      pct,
      dueCondition: parts.slice(2).join(" | ").trim(),
    });
  }
  return milestones;
}

/**
 * Plan milestone payments for a contract value.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs.
 * @throws {RangeError} for negative contract value or pct outside 0–100.
 * @throws {Error} when percentages do not sum to 100 or a name is empty.
 */
export function planMilestones(
  contractValue: number,
  milestones: MilestoneInput[],
): MilestonePlanResult {
  const value = requireNonNegativeFinite("contractValue", contractValue);

  if (!Array.isArray(milestones) || milestones.length === 0) {
    throw new Error("At least one milestone is required.");
  }

  const parsed: MilestoneInput[] = milestones.map((m, i) => {
    const n = i + 1;
    if (!m || typeof m !== "object") {
      throw new Error(`Milestone ${n}: must be an object.`);
    }
    if (typeof m.name !== "string" || m.name.trim() === "") {
      throw new Error(`Milestone ${n}: name is required.`);
    }
    const pct = requireNonNegativeFinite(`Milestone ${n} percentage`, m.pct);
    if (pct > 100) {
      throw new RangeError(`Milestone ${n} percentage must be between 0 and 100.`);
    }
    return {
      name: m.name.trim(),
      pct,
      dueCondition: typeof m.dueCondition === "string" ? m.dueCondition.trim() : "",
    };
  });

  const totalPct = parsed.reduce((sum, m) => sum + m.pct, 0);
  const sumCheck = Math.round(totalPct * 100) / 100;
  if (Math.abs(totalPct - 100) > PCT_SUM_TOLERANCE) {
    throw new Error(
      `Milestone percentages must add up to 100% (currently ${sumCheck}%).`,
    );
  }

  // Amounts: round each row to cents; the final milestone absorbs rounding
  // remainder so the schedule always totals exactly contractValue.
  const schedule: MilestoneScheduleRow[] = [];
  let runningTotal = 0;
  for (let i = 0; i < parsed.length; i++) {
    const m = parsed[i];
    const amount =
      i === parsed.length - 1
        ? roundToCents(value - runningTotal)
        : roundToCents((value * m.pct) / 100);
    runningTotal = roundToCents(runningTotal + amount);
    schedule.push({
      milestone: m.name,
      percent: Math.round(m.pct * 100) / 100,
      amount,
      dueCondition: m.dueCondition,
    });
  }

  const paymentTimeline = schedule
    .map(
      (row, i) =>
        `#${i + 1} ${row.milestone} — $${row.amount.toFixed(2)} (${row.percent}%)` +
        (row.dueCondition ? ` — due: ${row.dueCondition}` : ""),
    )
    .join("\n");

  let warning: string | null = null;
  if (parsed.length === 1 && Math.abs(parsed[0].pct - 100) <= PCT_SUM_TOLERANCE) {
    warning =
      "Single 100% milestone: there is no upfront payment protection. Consider splitting off a deposit milestone (e.g. 30–50% to start) — this is an informational flag, not advice.";
  }

  return { contractValue: roundToCents(value), milestoneSchedule: schedule, sumCheck, paymentTimeline, warning };
}

/**
 * runTool entry point (verifiedToolType: planner).
 * values: { contractValue: number, milestones: string (textarea) | MilestoneInput[] }
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Input must be an object." };
    }
    const rawValue = values["contractValue"];
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      return { ok: false, error: "contractValue is required." };
    }
    const rawMilestones = values["milestones"];
    if (rawMilestones === undefined || rawMilestones === null || rawMilestones === "") {
      return { ok: false, error: "milestones is required." };
    }

    let milestones: MilestoneInput[];
    if (typeof rawMilestones === "string") {
      milestones = parseMilestoneText(rawMilestones);
    } else if (Array.isArray(rawMilestones)) {
      milestones = rawMilestones as MilestoneInput[];
    } else {
      return { ok: false, error: "milestones must be text (one per line) or a list." };
    }

    const r = planMilestones(
      requireNonNegativeFinite("contractValue", rawValue),
      milestones,
    );
    return {
      ok: true,
      values: {
        contractValue: r.contractValue,
        milestoneSchedule: r.milestoneSchedule,
        sumCheck: r.sumCheck,
        paymentTimeline: r.paymentTimeline,
        warning: r.warning,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
