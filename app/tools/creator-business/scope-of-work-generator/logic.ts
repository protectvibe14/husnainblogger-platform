/**
 * Scope of Work Generator — pure logic (tool-464).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Deterministic document assembly
 *   from fixed section templates with the user's values interpolated.
 * - Deliverables, out-of-scope items, and assumptions accept either an
 *   array of strings or a newline/comma-separated string; entries are
 *   trimmed and empty entries are dropped.
 * - At least one deliverable is required; title and client name are required.
 * - If no out-of-scope items are provided, an informational warning is
 *   included in the document (informational only — the document still
 *   generates).
 * - Revision limit is required as a whole number >= 0 (0 = no revisions).
 * - This produces a scope-of-work DRAFT template, not legal advice.
 * - runTool validates every input and returns { ok:false, error } with a
 *   human-readable message on any invalid or missing input.
 */

export const OUT_OF_SCOPE_WARNING =
  "NOTE: No out-of-scope items were listed. Explicitly excluding what is NOT included (e.g. extra platforms, additional revisions, rush delivery) is the single most effective way to prevent scope creep.";

export interface ScopeOfWorkInputs {
  projectTitle: string;
  clientName: string;
  deliverables: string[];
  timeline: string;
  revisionLimit: number;
  outOfScope: string[];
  paymentTerms: string;
  assumptions: string[];
}

/** Accept a string[] or a newline/comma-separated string; return clean lines. */
export function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v ?? "").trim())
      .filter((v) => v !== "");
  }
  if (typeof value === "string") {
    return value
      .split(/[\r\n]+/)
      .flatMap((line) => line.split(";"))
      .map((v) => v.trim())
      .filter((v) => v !== "");
  }
  return [];
}

function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

export function generateScopeOfWork(input: ScopeOfWorkInputs): string {
  const {
    projectTitle,
    clientName,
    deliverables,
    timeline,
    revisionLimit,
    outOfScope,
    paymentTerms,
    assumptions,
  } = input;

  const revisionLine =
    revisionLimit === 0
      ? "No revision rounds are included. Additional changes are billed separately at the agreed rate."
      : `${revisionLimit} revision round${revisionLimit === 1 ? "" : "s"} included per deliverable. Further revisions are billed separately at the agreed rate.`;

  const lines: string[] = [
    `SCOPE OF WORK (DRAFT TEMPLATE) — ${projectTitle}`,
    "",
    "1. PROJECT",
    `Project: ${projectTitle}`,
    `Client: ${clientName}`,
    "",
    "2. DELIVERABLES",
    ...deliverables.map((d, i) => `${i + 1}. ${d}`),
    "",
    "3. TIMELINE",
    timeline,
    "",
    "4. REVISIONS",
    revisionLine,
    "",
    "5. OUT OF SCOPE (NOT INCLUDED)",
  ];

  if (outOfScope.length === 0) {
    lines.push(OUT_OF_SCOPE_WARNING);
  } else {
    outOfScope.forEach((item, i) => lines.push(`${i + 1}. ${item}`));
  }

  lines.push("", "6. PAYMENT TERMS", paymentTerms, "", "7. ASSUMPTIONS");
  if (assumptions.length === 0) {
    lines.push("(No assumptions listed.)");
  } else {
    assumptions.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  }

  lines.push(
    "",
    "This is a draft scope-of-work template assembled from your inputs — not legal advice. Both parties should review and sign a final version.",
  );

  return lines.join("\n");
}

export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const projectTitle = nonEmpty(values.projectTitle);
  if (!projectTitle) {
    return { ok: false, error: "Enter a project title." };
  }
  const clientName = nonEmpty(values.clientName);
  if (!clientName) {
    return { ok: false, error: "Enter the client name." };
  }
  const deliverables = parseList(values.deliverables);
  if (deliverables.length === 0) {
    return {
      ok: false,
      error: "List at least one deliverable for this project.",
    };
  }
  const timeline = nonEmpty(values.timeline);
  if (!timeline) {
    return { ok: false, error: "Enter the project timeline." };
  }
  const revisionLimit = coerceNumber(values.revisionLimit);
  if (
    revisionLimit === null ||
    revisionLimit < 0 ||
    !Number.isInteger(revisionLimit)
  ) {
    return {
      ok: false,
      error: "Enter a whole number of included revisions (0 or more).",
    };
  }
  const outOfScope = parseList(values.outOfScope);
  const paymentTerms = nonEmpty(values.paymentTerms);
  if (!paymentTerms) {
    return { ok: false, error: "Enter the payment terms." };
  }
  const assumptions = parseList(values.assumptions);

  return {
    ok: true,
    values: {
      scopeOfWorkDocument: generateScopeOfWork({
        projectTitle,
        clientName,
        deliverables,
        timeline,
        revisionLimit,
        outOfScope,
        paymentTerms,
        assumptions,
      }),
    },
  };
}
