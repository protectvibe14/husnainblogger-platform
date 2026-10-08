/**
 * AI Workflow Checklist Builder (tool-312) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a CHECKLIST ASSEMBLER, not a workflow engine. It turns
 * the user's own stage list (stage name + responsible role per stage) into
 * a reusable checklist. It adds no AI, no workflow logic, no advice — the
 * stages, owners, and order are entirely the user's.
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * `values.lines` is a string[] (title line + one checkbox line per stage)
 * and `values.markdown` is the same checklist as a Markdown string.
 * Output ids match meta.ts outputs ('lines', 'markdown').
 *
 * Item shape (one repeatable row in the UI):
 *   - workflowName (optional; fill on the first row — used as the title)
 *   - stageName (required)
 *   - owner (optional; responsible role for the stage)
 *
 * Edge cases from the spec:
 *   - at least one stage is required
 *   - stages are capped at 25 (spec: "stages capped at 25")
 *   - user order is preserved (never reordered)
 */

export interface WorkflowStageItem {
  workflowName?: string;
  stageName?: string;
  owner?: string;
}

export interface WorkflowChecklistValues {
  /** Title line + one checkbox line per stage. */
  lines: string[];
  /** The same checklist as a Markdown string (copy/paste reuse). */
  markdown: string;
}

export interface WorkflowChecklistResult {
  ok: boolean;
  values?: WorkflowChecklistValues;
  error?: string;
}

/** Spec edge case: stages capped at 25. */
export const MAX_STAGES = 25;
export const DEFAULT_TITLE = "AI Workflow Checklist";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

interface Stage {
  name: string;
  owner: string;
}

function stageLine(index: number, stage: Stage): string {
  const base = `[ ] ${index + 1}. ${stage.name}`;
  return stage.owner ? `${base} — Owner: ${stage.owner}` : base;
}

/**
 * Build the checklist from the user's stages. The title comes from the
 * first non-empty workflowName across items; stages keep the user's order.
 */
export function runTool(args: { items: Record<string, unknown>[] }): WorkflowChecklistResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one stage to build the checklist." };
  }
  if (items.length > MAX_STAGES) {
    return {
      ok: false,
      error: `Too many stages: the builder accepts at most ${MAX_STAGES} stages per checklist.`,
    };
  }

  let title = "";
  const stages: Stage[] = [];
  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const n = i + 1;
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const item = row as WorkflowStageItem;
    const stageName = clean(item.stageName);
    if (!stageName) {
      return { ok: false, error: `Item ${n}: Stage name is required.` };
    }
    if (!title) {
      title = clean(item.workflowName);
    }
    stages.push({ name: stageName, owner: clean(item.owner) });
  }

  const finalTitle = title || DEFAULT_TITLE;
  const lines: string[] = [finalTitle];
  for (let i = 0; i < stages.length; i++) {
    lines.push(stageLine(i, stages[i]));
  }
  const markdown =
    `# ${finalTitle}\n\n` +
    stages.map((s, i) => `- ${stageLine(i, s)}`).join("\n");

  return { ok: true, values: { lines, markdown } };
}
