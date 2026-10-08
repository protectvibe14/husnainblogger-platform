/**
 * Kill Fee Calculator — pure logic (tool-462).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure arithmetic only.
 * - Kill-fee percentages are USER INPUTS from the user's own contract terms.
 *   This tool never invents or presents a "standard" percentage.
 * - Formula: killFee = contractValue * (killPctForStage / 100),
 *   where killPctForStage is the user-entered percentage for the selected
 *   project stage. clientRefund (if the project was prepaid) =
 *   contractValue - killFee.
 * - Money values round to the nearest cent (half-up).
 * - runTool validates every input and returns { ok:false, error } with a
 *   human-readable message on any invalid or missing input.
 */

export const PROJECT_STAGES = [
  "not-started",
  "in-progress",
  "near-complete",
] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

const STAGE_PCT_INPUT: Record<ProjectStage, string> = {
  "not-started": "killPctNotStarted",
  "in-progress": "killPctInProgress",
  "near-complete": "killPctNearComplete",
};

export interface KillFeeResult {
  /** Kill fee amount owed by the client. */
  killFeeAmount: number;
  /** The percentage that was applied (echoed back). */
  killFeePctApplied: number;
  /** contractValue - killFee; meaningful when the client prepaid in full. */
  clientRefund: number;
}

/** Round to the nearest cent (half-up). */
export function roundToCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function computeKillFee(
  contractValue: number,
  killPctForStage: number,
): KillFeeResult {
  const killFeeAmount = roundToCents(contractValue * (killPctForStage / 100));
  const clientRefund = roundToCents(contractValue - killFeeAmount);
  return { killFeeAmount, killFeePctApplied: killPctForStage, clientRefund };
}

export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const contractValue = coerceNumber(values.contractValue);
  if (contractValue === null || contractValue < 0) {
    return {
      ok: false,
      error: "Enter a valid contract value of 0 or more.",
    };
  }

  const stage = String(values.projectStage ?? "");
  if (!(PROJECT_STAGES as readonly string[]).includes(stage)) {
    return {
      ok: false,
      error:
        "Select a project stage: not started, in progress, or near complete.",
    };
  }

  const pctId = STAGE_PCT_INPUT[stage as ProjectStage];
  const pct = coerceNumber(values[pctId]);
  if (pct === null || pct < 0 || pct > 100) {
    return {
      ok: false,
      error:
        "Enter a kill fee percentage between 0 and 100 for this stage (from your own contract terms — no standard rate is assumed).",
    };
  }

  const result = computeKillFee(contractValue, pct);

  return {
    ok: true,
    values: {
      killFeeAmount: result.killFeeAmount,
      killFeePctApplied: result.killFeePctApplied,
      clientRefund: result.clientRefund,
    },
  };
}
