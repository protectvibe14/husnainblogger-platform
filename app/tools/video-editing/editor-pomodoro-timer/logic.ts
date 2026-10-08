/**
 * Editor Pomodoro Timer — pure logic (tool-291). Zero imports, zero DOM,
 * zero network, zero randomness.
 *
 * HONEST SCOPE: this is a session-PLAN generator, not a live timer. It
 * takes a start time plus focus/break/round settings and returns the
 * ordered phase plan, the total minutes, and the computed end time.
 * The ticking countdown itself is UI (app shell, setInterval) and lives
 * outside this file.
 *
 * Plan rules (fixed, documented — no AI):
 *   - Phases alternate: Focus, Break, Focus, Break, ... A break is placed
 *     BETWEEN rounds only; there is no break after the final round.
 *   - totalMin = rounds * focusMin + (rounds - 1) * breakMin.
 *   - endTime = startTime + totalMin on a 24-hour clock. If the session
 *     crosses midnight, the end time is marked "(next day)".
 *   - Sessions longer than 8 hours (480 min) produce a warning; the plan
 *     is still returned.
 *
 * Defaults: focusMin 25, breakMin 5, rounds 4 (classic Pomodoro).
 * Validation: focusMin 5–120, breakMin 1–30, rounds 1–12 (integers);
 * startTime required, HH:MM 24-hour.
 */

export interface PomodoroPhase {
  order: number;
  kind: "focus" | "break";
  label: string;
  minutes: number;
  start: string;
  end: string;
}

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const DEFAULT_FOCUS_MIN = 25;
const DEFAULT_BREAK_MIN = 5;
const DEFAULT_ROUNDS = 4;
const LONG_SESSION_WARN_MIN = 480; // 8 hours

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function checkInt(
  name: string,
  value: unknown,
  fallback: number,
  min: number,
  max: number
): { value: number } | { error: string } {
  if (value === undefined || value === null || value === "") {
    return { value: fallback };
  }
  const n = toInt(value);
  if (n === null || !Number.isInteger(n)) {
    return { error: `${name} must be a whole number.` };
  }
  if (n < min || n > max) {
    return { error: `${name} must be between ${min} and ${max}.` };
  }
  return { value: n };
}

/** Format minutes-since-midnight (may exceed 1440) as HH:MM. */
function fmtClock(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function fmtDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const rawStart =
    typeof values.startTime === "string" ? values.startTime.trim() : "";
  const startMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(rawStart);
  if (!startMatch) {
    return {
      ok: false,
      error: "Enter a start time as HH:MM in 24-hour format, e.g. 09:00.",
    };
  }
  const startMin = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);

  const focus = checkInt("Focus minutes", values.focusMin, DEFAULT_FOCUS_MIN, 5, 120);
  if ("error" in focus) return { ok: false, error: focus.error };
  const brk = checkInt("Break minutes", values.breakMin, DEFAULT_BREAK_MIN, 1, 30);
  if ("error" in brk) return { ok: false, error: brk.error };
  const roundsRes = checkInt("Rounds", values.rounds, DEFAULT_ROUNDS, 1, 12);
  if ("error" in roundsRes) return { ok: false, error: roundsRes.error };

  const focusMin = focus.value;
  const breakMin = brk.value;
  const rounds = roundsRes.value;

  const taskLabel =
    typeof values.taskLabel === "string" ? values.taskLabel.trim() : "";

  const phases: PomodoroPhase[] = [];
  const planLines: string[] = [];
  let cursor = startMin;
  let order = 0;
  for (let r = 1; r <= rounds; r++) {
    order += 1;
    const focusStart = fmtClock(cursor);
    cursor += focusMin;
    const focusEnd = fmtClock(cursor);
    phases.push({
      order,
      kind: "focus",
      label: `Round ${r} — Focus`,
      minutes: focusMin,
      start: focusStart,
      end: focusEnd,
    });
    planLines.push(`${order}. Focus (Round ${r}) — ${focusMin} min (${focusStart} → ${focusEnd})`);
    if (r < rounds) {
      order += 1;
      const breakStart = fmtClock(cursor);
      cursor += breakMin;
      const breakEnd = fmtClock(cursor);
      phases.push({
        order,
        kind: "break",
        label: `Break ${r}`,
        minutes: breakMin,
        start: breakStart,
        end: breakEnd,
      });
      planLines.push(`${order}. Break ${r} — ${breakMin} min (${breakStart} → ${breakEnd})`);
    }
  }

  const totalMin = rounds * focusMin + (rounds - 1) * breakMin;
  const endTotal = startMin + totalMin;
  const crossesMidnight = endTotal >= 1440;
  const endTime = fmtClock(endTotal) + (crossesMidnight ? " (next day)" : "");

  const header = taskLabel
    ? `Plan for "${taskLabel}" — starts ${fmtClock(startMin)}, ends ${endTime} (${fmtDuration(totalMin)} total).`
    : `Session plan — starts ${fmtClock(startMin)}, ends ${endTime} (${fmtDuration(totalMin)} total).`;
  const sessionPlan: string[] = [header, ...planLines];

  const warnings: string[] = [];
  if (totalMin > LONG_SESSION_WARN_MIN) {
    warnings.push(
      `This plan is ${fmtDuration(totalMin)} — over 8 hours. Consider splitting it across days; very long sessions hurt focus and export/render stamina.`
    );
  }

  return {
    ok: true,
    values: {
      sessionPlan,
      totalMin,
      endTime,
      warnings,
    },
  };
}
