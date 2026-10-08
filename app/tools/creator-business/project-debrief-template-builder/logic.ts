/**
 * Project Debrief Template Builder — tool-500 pure logic.
 * Zero imports. Zero network. Zero DOM. No Math.random. Deterministic:
 * identical items always produce the identical document.
 *
 * ENGINE (honest): template assembly with reflective prompts — NOT AI.
 * FIXED SECTION BANK (documented; 5 sections in canonical order,
 * 3 reflective prompts each = 15 prompts total):
 *   wins      — Wins & highlights
 *   issues    — Issues & blockers
 *   metrics   — Key metrics
 *   lessons   — Lessons learned
 *   followups — Follow-ups & next steps
 * The Builder UI calls runTool({ items }); each item is one section of a
 * debrief: { projectName, section, note? }. Items are grouped by
 * projectName (first-seen order) and sections are emitted in canonical
 * order with duplicates merged. Optional per-item notes are appended
 * under their section. Output is a Markdown document string.
 */

export interface DebriefItem {
  projectName: unknown;
  section: unknown;
  note?: unknown;
}

export interface DebriefBuilderResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Canonical section order (fixed bank: 5). */
export const SECTION_IDS = [
  "wins",
  "issues",
  "metrics",
  "lessons",
  "followups",
] as const;

export type DebriefSection = (typeof SECTION_IDS)[number];

const SECTION_META: Record<DebriefSection, { title: string; prompts: string[] }> = {
  wins: {
    title: "Wins & highlights",
    prompts: [
      "What went best on this project?",
      "Which decisions paid off the most?",
      "What should we make sure to repeat next time?",
    ],
  },
  issues: {
    title: "Issues & blockers",
    prompts: [
      "What problems came up, and why did they happen?",
      "What would we do differently if we started over?",
      "Which issues were avoidable, and how?",
    ],
  },
  metrics: {
    title: "Key metrics",
    prompts: [
      "What were the final numbers (revenue, hours, deliverables)?",
      "How did the actuals compare to the original quote or estimate?",
      "Which metric are you proudest of — or most worried about?",
    ],
  },
  lessons: {
    title: "Lessons learned",
    prompts: [
      "What did you learn about the client, the work, or yourself?",
      "Which single process change would have the biggest impact?",
      "What advice would you give yourself at the start of this project?",
    ],
  },
  followups: {
    title: "Follow-ups & next steps",
    prompts: [
      "What tasks are still outstanding?",
      "Who owns each follow-up, and by when is it due?",
      "Is there a natural next project to propose to this client?",
    ],
  },
};

const MAX_PROJECT_NAME = 120;
const MAX_NOTE = 1000;

function isSectionId(value: string): value is DebriefSection {
  return (SECTION_IDS as readonly string[]).includes(value);
}

interface ParsedItem {
  projectName: string;
  section: DebriefSection;
  note: string | null;
}

function parseItem(raw: unknown, index: number): ParsedItem | { error: string } {
  const label = `Item ${index + 1}`;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { error: `${label}: each item must be an object with projectName and section.` };
  }
  const item = raw as Record<string, unknown>;

  const nameRaw = item["projectName"];
  if (typeof nameRaw !== "string" || nameRaw.trim().length === 0) {
    return { error: `${label}: project name is required.` };
  }
  const projectName = nameRaw.trim();
  if (projectName.length > MAX_PROJECT_NAME) {
    return {
      error: `${label}: project name must be ${MAX_PROJECT_NAME} characters or fewer.`,
    };
  }

  const sectionRaw = item["section"];
  if (typeof sectionRaw !== "string" || sectionRaw.trim().length === 0) {
    return { error: `${label}: section is required.` };
  }
  const sectionNorm = sectionRaw.trim().toLowerCase();
  if (!isSectionId(sectionNorm)) {
    return {
      error: `${label}: section must be one of: ${SECTION_IDS.join(", ")}.`,
    };
  }

  let note: string | null = null;
  const noteRaw = item["note"];
  if (noteRaw !== undefined && noteRaw !== null && String(noteRaw).trim().length > 0) {
    if (typeof noteRaw !== "string") {
      return { error: `${label}: note must be text.` };
    }
    if (noteRaw.trim().length > MAX_NOTE) {
      return {
        error: `${label}: note must be ${MAX_NOTE} characters or fewer.`,
      };
    }
    note = noteRaw.trim();
  }

  return { projectName, section: sectionNorm, note };
}

export function runTool(args: { items: unknown }): DebriefBuilderResult {
  const items = (args as { items?: unknown }).items;

  if (!Array.isArray(items)) {
    return { ok: false, error: "Add at least one section to build the debrief." };
  }
  if (items.length === 0) {
    return { ok: false, error: "Add at least one section to build the debrief." };
  }

  const parsed: ParsedItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const p = parseItem(items[i], i);
    if ("error" in p) return { ok: false, error: p.error };
    parsed.push(p);
  }

  // Group by projectName (first-seen order), sections in canonical order.
  const projectOrder: string[] = [];
  const byProject = new Map<string, Map<DebriefSection, string[]>>();
  for (const p of parsed) {
    if (!byProject.has(p.projectName)) {
      byProject.set(p.projectName, new Map());
      projectOrder.push(p.projectName);
    }
    const sections = byProject.get(p.projectName)!;
    if (!sections.has(p.section)) sections.set(p.section, []);
    if (p.note) sections.get(p.section)!.push(p.note);
  }

  const docs: string[] = [];
  for (const projectName of projectOrder) {
    const sections = byProject.get(projectName)!;
    const parts: string[] = [`# Project Debrief — ${projectName}`, ""];
    for (const id of SECTION_IDS) {
      if (!sections.has(id)) continue;
      const meta = SECTION_META[id];
      parts.push(`## ${meta.title}`, "");
      for (const prompt of meta.prompts) {
        parts.push(`- ${prompt}`);
      }
      const notes = sections.get(id)!;
      if (notes.length > 0) {
        parts.push("", `*Your notes:* ${notes.join(" | ")}`);
      }
      parts.push("");
    }
    docs.push(parts.join("\n").trimEnd());
  }

  return { ok: true, values: { debriefDocument: docs.join("\n\n---\n\n") } };
}
