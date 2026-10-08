/**
 * Blogging SOP Template Builder (tool-330) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a DOCUMENT FORMATTER, not a process consultant. It
 * formats YOUR steps into a standard operating procedure document with
 * per-step slots for owner, frequency, and QA checkpoint. The tool adds
 * NO process knowledge — every step, owner, and frequency comes from you.
 * Steps you leave blank get clearly-labeled fill-in slots (e.g.
 * "[assign owner]") so no placeholder text reads as a real assignment.
 *
 * Fixed template (documented here):
 *   - DOC structure: title line, meta line, "Purpose" placeholder, then
 *     one numbered section per step with fixed slots: Owner, Frequency,
 *     QA checkpoint, Details
 *   - SLOT_FALLBACKS: 4 fixed fill-in slot labels
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * values out = { sopDocument, stepChecklist }
 *   - sopDocument:  copy — the full SOP document in Markdown
 *   - stepChecklist: list — one numbered summary line per step
 * Output ids match meta.ts outputs.
 *
 * Item shape (one repeatable row in the UI):
 *   - processName (required; must be identical across all rows)
 *   - stepTitle (required)
 *   - owner (optional)
 *   - frequency (optional)
 *   - details (optional)
 *
 * Edge cases from the spec: steps capped at 30.
 * Validation from the spec: processName required; at least one step.
 */

export interface SopItem {
  processName?: string;
  stepTitle?: string;
  owner?: string;
  frequency?: string;
  details?: string;
}

export interface SopValues {
  /** Full SOP document in Markdown, copy-ready. */
  sopDocument: string;
  /** One numbered summary line per step. */
  stepChecklist: string[];
}

export interface SopResult {
  ok: boolean;
  values?: SopValues;
  error?: string;
}

/** Spec edge case: steps capped at 30. */
export const MAX_STEPS = 30;

/** 4 fixed fill-in slot labels for blank optional fields. */
const SLOT_FALLBACKS = {
  owner: "[assign owner]",
  frequency: "[set frequency]",
  qaCheckpoint: "[add QA checkpoint]",
  details: "[add details]",
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Format the user's steps into an SOP document. Deterministic: same
 * items always produce the same document.
 */
export function runTool(args: { items: unknown[] }): SopResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one step to build the SOP." };
  }
  if (items.length > MAX_STEPS) {
    return {
      ok: false,
      error: `Too many steps: the builder accepts at most ${MAX_STEPS} steps.`,
    };
  }

  interface Step {
    title: string;
    owner: string;
    frequency: string;
    details: string;
  }
  const steps: Step[] = [];
  let processName = "";

  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const row = items[i];
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const item = row as SopItem;
    const rowProcess = clean(item.processName);
    const stepTitle = clean(item.stepTitle);

    if (!rowProcess) {
      return { ok: false, error: `Item ${n}: Process name is required.` };
    }
    if (!stepTitle) {
      return { ok: false, error: `Item ${n}: Step title is required.` };
    }
    if (n === 1) {
      processName = rowProcess;
    } else if (rowProcess !== processName) {
      return {
        ok: false,
        error: `Item ${n}: process name "${rowProcess}" differs from "${processName}" — all steps must belong to the same process.`,
      };
    }

    steps.push({
      title: stepTitle,
      owner: clean(item.owner) || SLOT_FALLBACKS.owner,
      frequency: clean(item.frequency) || SLOT_FALLBACKS.frequency,
      details: clean(item.details) || SLOT_FALLBACKS.details,
    });
  }

  const docLines: string[] = [];
  docLines.push(`# SOP: ${processName}`);
  docLines.push("");
  docLines.push(`Steps: ${steps.length} | Generated from your own process description.`);
  docLines.push("");
  docLines.push("## Purpose");
  docLines.push("");
  docLines.push("[Write 2–3 sentences on why this process exists and when to use it.]");
  docLines.push("");
  docLines.push("## Steps");
  docLines.push("");

  steps.forEach((s, i) => {
    const n = i + 1;
    docLines.push(`### ${n}. ${s.title}`);
    docLines.push("");
    docLines.push(`- Owner: ${s.owner}`);
    docLines.push(`- Frequency: ${s.frequency}`);
    docLines.push(`- QA checkpoint: ${SLOT_FALLBACKS.qaCheckpoint}`);
    docLines.push(`- Details: ${s.details}`);
    docLines.push("");
  });

  docLines.push("## Revision log");
  docLines.push("");
  docLines.push("| Date | Changed by | Change |");
  docLines.push("| ---- | ---------- | ------ |");
  docLines.push("|      |            |        |");

  const stepChecklist = steps.map(
    (s, i) => `${i + 1}. ${s.title} — owner: ${s.owner}, frequency: ${s.frequency}`,
  );

  return {
    ok: true,
    values: {
      sopDocument: docLines.join("\n"),
      stepChecklist,
    },
  };
}
