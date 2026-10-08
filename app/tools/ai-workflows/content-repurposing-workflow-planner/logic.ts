/**
 * Content Repurposing Workflow Planner (tool-327) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a FIXED PIPELINE TEMPLATE mapper, not a content
 * transformer. It maps your chosen source and target formats onto a fixed
 * repurposing pipeline — ordered stages, per-format task lists, and
 * dependencies. NO content transformation is performed; no content is
 * rewritten, summarized, or adapted by the tool.
 *
 * Fixed banks (documented here):
 *   - FORMATS: 8 supported formats (blog post, video, podcast episode,
 *     newsletter, webinar recording, ebook/guide, social thread,
 *     short-form video)
 *   - PREP_TASKS: 3 fixed Stage-1 preparation tasks
 *   - PER_FORMAT_TASKS: 4 fixed per-format tasks, each with a fixed
 *     dependency label, reused for every target format
 *   - WRAPUP_TASKS: 3 fixed Stage-3 wrap-up tasks
 *
 * Planner contract: runTool(values) -> { ok, values, error }.
 * values in  = { sourceFormat, targetFormats }
 *   - sourceFormat: one of the 8 format ids
 *   - targetFormats: comma-separated string (UI text input) or string[]
 * values out = { stages, overview }
 *   - stages:   { columns, rows } table — order, target format, task,
 *               depends on
 *   - overview: one copy-ready paragraph summarizing the pipeline
 * Output ids match meta.ts outputs.
 *
 * Edge cases from the spec: none.
 * Validation from the spec: at least one target format; source != target.
 */

export interface StageTable {
  columns: string[];
  rows: string[][];
}

export interface RepurposeValues {
  stages: StageTable;
  overview: string;
}

export interface RepurposeResult {
  ok: boolean;
  values?: RepurposeValues;
  error?: string;
}

export interface ContentFormat {
  id: string;
  label: string;
}

export const FORMATS: ContentFormat[] = [
  { id: "blog-post", label: "Blog post" },
  { id: "video", label: "Video" },
  { id: "podcast", label: "Podcast episode" },
  { id: "newsletter", label: "Newsletter" },
  { id: "webinar", label: "Webinar recording" },
  { id: "ebook", label: "Ebook / guide" },
  { id: "thread", label: "Social thread" },
  { id: "short-video", label: "Short-form video" },
];

/** Stage 1: fixed preparation tasks (order 1.x). */
const PREP_TASKS: { task: string; dependsOn: string }[] = [
  {
    task: "Audit the source piece: list every reusable asset (key points, quotes, examples, data, visuals).",
    dependsOn: "—",
  },
  {
    task: "Extract the core message and 3–5 supporting points into a reusable content brief.",
    dependsOn: "1.1",
  },
  {
    task: "Decide the angle and hook for each target format (what changes, what stays).",
    dependsOn: "1.2",
  },
];

/**
 * Per target format: 4 fixed sequential tasks.
 * The first task depends on the last prep task ("1.3"); each later task
 * depends on the previous task in the same format stage.
 */
const PER_FORMAT_TASKS: string[] = [
  "Pull the needed assets from the content brief (no rewriting).",
  "Adapt the assets to the format's structure (length, pacing, visuals).",
  "Add a format-appropriate hook, CTA, and cross-link to the source.",
  "Publish (or schedule) and verify links, captions, and tags.",
];

/** Stage N+1: fixed wrap-up tasks (order = last stage + 1). */
const WRAPUP_TASKS: { task: string; dependsOn: string }[] = [
  {
    task: "Cross-link every repurposed piece back to the source and to each other.",
    dependsOn: "all format stages",
  },
  {
    task: "Review each piece for format fit (right length, right tone, no leftover references).",
    dependsOn: "W.1",
  },
  {
    task: "Record what worked; note which format deserves more effort next time.",
    dependsOn: "W.2",
  },
];

const COLUMNS = ["Order", "Stage", "Target format", "Task", "Depends on"];

function formatIdList(): string {
  return FORMATS.map((f) => f.id).join(", ");
}

function findFormat(id: string): ContentFormat | undefined {
  return FORMATS.find((f) => f.id === id);
}

function cleanId(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Accept a comma-separated string or an array; return deduped, non-empty ids.
 */
function parseTargetFormats(raw: unknown): string[] {
  const list: string[] = [];
  if (typeof raw === "string") {
    for (const part of raw.split(",")) {
      const id = cleanId(part);
      if (id && list.indexOf(id) === -1) list.push(id);
    }
  } else if (Array.isArray(raw)) {
    for (const part of raw) {
      if (typeof part === "string") {
        const id = cleanId(part);
        if (id && list.indexOf(id) === -1) list.push(id);
      }
    }
  }
  return list;
}

/**
 * Build the repurposing pipeline. Deterministic: same inputs always
 * produce the same ordered stage table.
 */
export function runTool(values: Record<string, unknown>): RepurposeResult {
  const sourceRaw = values?.sourceFormat;
  const sourceFormat = typeof sourceRaw === "string" ? cleanId(sourceRaw) : "";

  if (!sourceFormat) {
    return {
      ok: false,
      error: "Choose a source format: " + formatIdList() + ".",
    };
  }
  const source = findFormat(sourceFormat);
  if (!source) {
    return {
      ok: false,
      error: "Unknown source format. Choose one of: " + formatIdList() + ".",
    };
  }

  const targetIds = parseTargetFormats(values?.targetFormats);
  if (targetIds.length === 0) {
    return {
      ok: false,
      error:
        "Choose at least one target format (comma-separated): " +
        formatIdList() +
        ".",
    };
  }
  for (const id of targetIds) {
    if (!findFormat(id)) {
      return {
        ok: false,
        error: `Unknown target format "${id}". Choose from: ` + formatIdList() + ".",
      };
    }
    if (id === sourceFormat) {
      const label = findFormat(id)!.label;
      return {
        ok: false,
        error: `The source format ("${label}") cannot also be a target format. Pick a different target.`,
      };
    }
  }

  const rows: string[][] = [];
  const pushRow = (
    order: string,
    stage: string,
    formatLabel: string,
    task: string,
    dependsOn: string,
  ): void => {
    rows.push([order, stage, formatLabel, task, dependsOn]);
  };

  // Stage 1: prep
  PREP_TASKS.forEach((t, i) => {
    pushRow(`1.${i + 1}`, "1 — Prep", source.label, t.task, t.dependsOn);
  });

  // Stages 2..N: one per target format
  targetIds.forEach((id, idx) => {
    const stageNum = idx + 2;
    const stageLabel = `${stageNum} — Repurpose`;
    const label = findFormat(id)!.label;
    PER_FORMAT_TASKS.forEach((task, i) => {
      const order = `${stageNum}.${i + 1}`;
      const dependsOn = i === 0 ? "1.3" : `${stageNum}.${i}`;
      pushRow(order, stageLabel, label, task, dependsOn);
    });
  });

  // Final stage: wrap-up
  const wrapStage = `${targetIds.length + 2} — Wrap up`;
  WRAPUP_TASKS.forEach((t, i) => {
    const dependsOn =
      t.dependsOn === "W.1" ? "W.1" : t.dependsOn === "W.2" ? "W.2" : t.dependsOn;
    pushRow(`W.${i + 1}`, wrapStage, "All formats", t.task, dependsOn);
  });

  const targetLabels = targetIds.map((id) => findFormat(id)!.label).join(", ");
  const overview =
    `Repurposing plan: turn one ${source.label.toLowerCase()} into ${targetIds.length} ` +
    `format${targetIds.length === 1 ? "" : "s"} (${targetLabels}). ` +
    `The pipeline has ${rows.length} ordered tasks across ${targetIds.length + 2} stages: ` +
    `prep (audit, brief, angles), one repurpose stage per format (extract, adapt, hook + CTA, publish), ` +
    `and wrap-up (cross-link, format-fit review, learnings). ` +
    `Each task lists what it depends on. No content is transformed by this tool — you do the adapting.`;

  return {
    ok: true,
    values: {
      stages: { columns: COLUMNS, rows },
      overview,
    },
  };
}
