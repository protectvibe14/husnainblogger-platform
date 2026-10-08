/**
 * Client Revision Tracker — pure logic (tool-292). Zero imports, zero DOM,
 * zero network, zero randomness.
 *
 * HONEST SCOPE (batch-6 precedent): the platform has no localStorage tracker
 * mode, so this tool is built as a BUILDER: runTool({ items }) where each
 * item is one revision entry { round, request, status }. The list is
 * SESSION-BASED — nothing is saved between visits. The tool returns a
 * summary plus a CSV export the user downloads to keep their log.
 *
 * Status handling: statuses are canonicalized case-insensitively against a
 * fixed enum of 4 values (pending, in-progress, approved, rejected) with a
 * small documented alias table (12 alias keys). Unknown statuses are a
 * validation error.
 *
 * Rules (fixed, documented — no AI):
 *   - round must be a positive whole number.
 *   - request must be a non-empty string.
 *   - Revisions are sorted by round ascending; if the input order was
 *     different, the summary notes that the rounds were re-sorted.
 *   - "Open" = status pending or in-progress.
 *   - If revisionLimit (optional arg) is set and item count exceeds it,
 *     overLimit is "Yes" and the summary flags it.
 *   - CSV export: header `round,request,status`, one row per revision,
 *     fields quoted when they contain a comma, quote, or newline
 *     (quotes doubled).
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Canonical statuses (fixed enum, 4 entries). */
export const VALID_STATUSES = [
  "pending",
  "in-progress",
  "approved",
  "rejected",
] as const;

export type RevisionStatus = (typeof VALID_STATUSES)[number];

/**
 * Alias table (12 keys) — common ways people type a status, mapped to the
 * canonical 4. Matching is case-insensitive on the trimmed input.
 */
const STATUS_ALIASES: Record<string, RevisionStatus> = {
  pending: "pending",
  todo: "pending",
  open: "pending",
  "in-progress": "in-progress",
  "in progress": "in-progress",
  inprogress: "in-progress",
  wip: "in-progress",
  doing: "in-progress",
  approved: "approved",
  done: "approved",
  complete: "approved",
  completed: "approved",
  rejected: "rejected",
  declined: "rejected",
};

function canonicalizeStatus(raw: unknown): RevisionStatus | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return STATUS_ALIASES[key] ?? null;
}

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function csvField(value: string): string {
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

interface Revision {
  round: number;
  request: string;
  status: RevisionStatus;
}

export interface RevisionTrackerArgs {
  items: Record<string, unknown>[];
  /** Optional client-side limit; NOT persisted — pass it each run. */
  revisionLimit?: unknown;
}

export function runTool(args: RevisionTrackerArgs): ToolResult {
  if (!args || !Array.isArray(args.items) || args.items.length === 0) {
    return {
      ok: false,
      error: "Add at least one revision to track (round, request, status).",
    };
  }

  let revisionLimit: number | null = null;
  if (
    args.revisionLimit !== undefined &&
    args.revisionLimit !== null &&
    args.revisionLimit !== ""
  ) {
    const n = toInt(args.revisionLimit);
    if (n === null || !Number.isInteger(n) || n < 1) {
      return {
        ok: false,
        error: "Revision limit must be a positive whole number.",
      };
    }
    revisionLimit = n;
  }

  const revisions: Revision[] = [];
  const inputOrder: number[] = [];
  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    const label = `Item ${i + 1}`;

    const round = toInt(item.round);
    if (round === null || !Number.isInteger(round) || round < 1) {
      return {
        ok: false,
        error: `${label}: round must be a positive whole number (e.g. 1, 2, 3).`,
      };
    }

    const request = typeof item.request === "string" ? item.request.trim() : "";
    if (request.length === 0) {
      return {
        ok: false,
        error: `${label}: request must describe what the client asked to change.`,
      };
    }

    const status = canonicalizeStatus(item.status);
    if (status === null) {
      return {
        ok: false,
        error: `${label}: status must be one of: ${VALID_STATUSES.join(", ")}.`,
      };
    }

    revisions.push({ round, request, status });
    inputOrder.push(round);
  }

  // Sort by round ascending; note if the input was out of order.
  const sorted = [...revisions].sort((a, b) => a.round - b.round);
  const wasOutOfOrder = inputOrder.some((r, idx) => r !== sorted[idx].round);

  const count = (s: RevisionStatus) => sorted.filter((r) => r.status === s).length;
  const pending = count("pending");
  const inProgress = count("in-progress");
  const approved = count("approved");
  const rejected = count("rejected");
  const openCount = pending + inProgress;
  const overLimit = revisionLimit !== null && sorted.length > revisionLimit;

  const parts: string[] = [];
  parts.push(
    `${sorted.length} revision${sorted.length === 1 ? "" : "s"} logged — ` +
      `${openCount} open (${pending} pending, ${inProgress} in-progress), ` +
      `${approved} approved, ${rejected} rejected.`
  );
  if (revisionLimit !== null) {
    parts.push(
      overLimit
        ? `Over your limit of ${revisionLimit} revision${revisionLimit === 1 ? "" : "s"} — flag this to the client.`
        : `Within your limit of ${revisionLimit} revision${revisionLimit === 1 ? "" : "s"}.`
    );
  }
  if (wasOutOfOrder) {
    parts.push("Rounds were entered out of order — sorted ascending by round.");
  }
  const summary = parts.join(" ");

  const roundHistory = sorted.map(
    (r) => `Round ${r.round} — ${r.status} — "${r.request}"`
  );

  const csvRows = sorted.map((r) =>
    [String(r.round), csvField(r.request), r.status].join(",")
  );
  const exportCsv = ["round,request,status", ...csvRows].join("\n");

  return {
    ok: true,
    values: {
      summary,
      openCount,
      overLimit: overLimit ? "Yes" : "No",
      roundHistory,
      exportCsv,
    },
  };
}
