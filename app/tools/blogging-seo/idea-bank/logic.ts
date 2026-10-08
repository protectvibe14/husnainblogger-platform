/**
 * Idea Bank — pure logic (tool-040).
 *
 * Zero imports, zero network, zero DOM. A stateless content-idea
 * collection manager: actions are add | list | update | delete | export,
 * operating on a bank of ideas you pass in (`existingIdeas`) and get back
 * (`ideas`). The function keeps no state between calls — the bank lives
 * in the page (paste your saved JSON back in, or download the CSV and
 * re-import). Deterministic: same inputs -> same outputs.
 *
 * HONESTY (also in meta.ts content.methodology + assumptions):
 * - This is a local organizer, not a generator: it stores, filters, and
 *   exports the ideas YOU enter. It suggests no topics and invents no
 *   content.
 * - Duplicate titles are allowed but flagged (duplicateTitle: true) so
 *   you can spot them.
 *
 * VALIDATION:
 * - action must be add|list|update|delete|export.
 * - title 1-200 chars on add (and on update when provided).
 * - status in idea|draft|published|archived (default "idea" on add).
 * - tags: comma-separated input -> trimmed, de-duplicated, capped at
 *   MAX_TAGS_PER_IDEA (flagged tagsTruncated: true when capped).
 * - update/delete use a 1-based index into the current bank.
 * - Bank capped at MAX_IDEAS ideas per call.
 */

export const ACTIONS = ["add", "list", "update", "delete", "export"] as const;
export type Action = (typeof ACTIONS)[number];

export const STATUSES = ["idea", "draft", "published", "archived"] as const;
export type IdeaStatus = (typeof STATUSES)[number];

/** Maximum ideas held in one bank per call. */
export const MAX_IDEAS = 500;

/** Maximum tags kept per idea (extras are dropped, flagged). */
export const MAX_TAGS_PER_IDEA = 20;

/** Maximum title length. */
export const MAX_TITLE_CHARS = 200;

export interface Idea {
  title: string;
  tags: string[];
  status: IdeaStatus;
  notes: string;
  /** True when another idea in the bank has the same title (case-insensitive). */
  duplicateTitle?: boolean;
  /** True when the tag list was capped at MAX_TAGS_PER_IDEA. */
  tagsTruncated?: boolean;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function readString(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function isStatus(value: unknown): value is IdeaStatus {
  return (
    typeof value === "string" &&
    (STATUSES as readonly string[]).includes(value)
  );
}

/** Parse the comma-separated tags field: trim, drop empties, de-dupe (case-insensitive), cap. */
export function parseTags(raw: unknown): { tags: string[]; truncated: boolean } {
  const text = readString(raw);
  if (text.length === 0) return { tags: [], truncated: false };
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of text.split(",")) {
    const tag = part.trim();
    if (tag.length === 0) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  if (tags.length > MAX_TAGS_PER_IDEA) {
    return { tags: tags.slice(0, MAX_TAGS_PER_IDEA), truncated: true };
  }
  return { tags, truncated: false };
}

/** Parse and validate the bank JSON from the existingIdeas field. */
export function parseBank(raw: unknown): { ideas?: Idea[]; error?: string } {
  if (raw === undefined || raw === null || readString(raw).length === 0) {
    return { ideas: [] };
  }
  if (typeof raw !== "string") {
    return { error: "Existing ideas must be a JSON array." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      error:
        'Existing ideas must be valid JSON, e.g. [{"title":"My idea","tags":["seo"],"status":"idea","notes":""}].',
    };
  }
  if (!Array.isArray(parsed)) {
    return { error: "Existing ideas must be a JSON array of idea objects." };
  }
  if (parsed.length > MAX_IDEAS) {
    return {
      error: `Idea bank is capped at ${MAX_IDEAS} ideas (got ${parsed.length}). Export and archive old ideas first.`,
    };
  }
  const ideas: Idea[] = [];
  for (let i = 0; i < parsed.length; i += 1) {
    const item = parsed[i];
    const n = i + 1;
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      return { error: `Idea ${n}: each idea must be an object.` };
    }
    const obj = item as Record<string, unknown>;
    const title = readString(obj["title"]);
    if (title.length === 0 || title.length > MAX_TITLE_CHARS) {
      return {
        error: `Idea ${n}: title must be 1-${MAX_TITLE_CHARS} characters.`,
      };
    }
    if (!isStatus(obj["status"])) {
      return {
        error: `Idea ${n}: status must be one of ${STATUSES.join(", ")}.`,
      };
    }
    const tagsRaw = obj["tags"];
    let tags: string[] = [];
    if (tagsRaw !== undefined) {
      if (!Array.isArray(tagsRaw) || tagsRaw.some((t) => typeof t !== "string")) {
        return { error: `Idea ${n}: tags must be an array of strings.` };
      }
      tags = (tagsRaw as string[]).map((t) => t.trim()).filter((t) => t.length > 0);
    }
    ideas.push({
      title,
      tags,
      status: obj["status"] as IdeaStatus,
      notes: readString(obj["notes"]),
    });
  }
  return { ideas };
}

/** Flag duplicate titles (case-insensitive) across the bank. */
export function flagDuplicates(ideas: Idea[]): Idea[] {
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    const key = idea.title.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return ideas.map((idea) =>
    (counts.get(idea.title.toLowerCase()) ?? 0) > 1
      ? { ...idea, duplicateTitle: true }
      : idea,
  );
}

export interface IdeaFilter {
  tag: string;
  status: string;
  query: string;
}

/** Apply the optional list filters (all case-insensitive). */
export function filterIdeas(ideas: Idea[], filter: IdeaFilter): Idea[] {
  return ideas.filter((idea) => {
    if (filter.tag.length > 0) {
      const tagKey = filter.tag.toLowerCase();
      if (!idea.tags.some((t) => t.toLowerCase() === tagKey)) return false;
    }
    if (filter.status.length > 0 && idea.status !== filter.status) return false;
    if (filter.query.length > 0) {
      const q = filter.query.toLowerCase();
      const hay = `${idea.title}\n${idea.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Quote one CSV cell (RFC 4180-ish): quote when needed, double inner quotes. */
export function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Export the bank as CSV: title,tags,status,notes (tags joined with ";"). */
export function exportCsv(ideas: Idea[]): string {
  const lines = ["title,tags,status,notes"];
  for (const idea of ideas) {
    lines.push(
      [
        csvCell(idea.title),
        csvCell(idea.tags.join(";")),
        csvCell(idea.status),
        csvCell(idea.notes),
      ].join(","),
    );
  }
  return lines.join("\n");
}

/** Shape ideas as a { columns, rows } table for the UI. */
function ideasTable(ideas: Idea[]): { columns: string[]; rows: string[][] } {
  return {
    columns: ["#", "Title", "Tags", "Status", "Notes", "Flags"],
    rows: ideas.map((idea, i) => [
      String(i + 1),
      idea.title,
      idea.tags.join(", "),
      idea.status,
      idea.notes,
      [
        idea.duplicateTitle ? "duplicate title" : "",
        idea.tagsTruncated ? "tags capped" : "",
      ]
        .filter((f) => f.length > 0)
        .join("; "),
    ]),
  };
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please choose an action first." };
  }

  const actionRaw = readString(values["action"]);
  if (!(ACTIONS as readonly string[]).includes(actionRaw)) {
    return {
      ok: false,
      error: `Action must be one of ${ACTIONS.join(", ")} (got "${actionRaw}").`,
    };
  }
  const action = actionRaw as Action;

  const parsedBank = parseBank(values["existingIdeas"]);
  if (parsedBank.error || !parsedBank.ideas) {
    return { ok: false, error: parsedBank.error as string };
  }
  let bank = parsedBank.ideas;

  const statusRaw = readString(values["status"]);

  if (action === "add") {
    const title = readString(values["title"]);
    if (title.length === 0) {
      return { ok: false, error: "Please enter the idea title." };
    }
    if (title.length > MAX_TITLE_CHARS) {
      return {
        ok: false,
        error: `Title is ${title.length} characters (max ${MAX_TITLE_CHARS}).`,
      };
    }
    if (statusRaw.length > 0 && !isStatus(statusRaw)) {
      return {
        ok: false,
        error: `Status must be one of ${STATUSES.join(", ")} (got "${statusRaw}").`,
      };
    }
    if (bank.length >= MAX_IDEAS) {
      return {
        ok: false,
        error: `Idea bank is full (${MAX_IDEAS} ideas). Export and archive old ideas first.`,
      };
    }
    const { tags, truncated } = parseTags(values["tags"]);
    bank = [
      ...bank,
      {
        title,
        tags,
        status: (statusRaw.length > 0 ? statusRaw : "idea") as IdeaStatus,
        notes: readString(values["notes"]),
        ...(truncated ? { tagsTruncated: true } : {}),
      },
    ];
  } else if (action === "update" || action === "delete") {
    const indexRaw = values["index"];
    const index =
      typeof indexRaw === "string" && indexRaw.trim() !== ""
        ? Number(indexRaw)
        : indexRaw;
    if (
      typeof index !== "number" ||
      !Number.isInteger(index) ||
      index < 1 ||
      index > bank.length
    ) {
      return {
        ok: false,
        error:
          bank.length === 0
            ? "The idea bank is empty — nothing to update or delete."
            : `Index must be a whole number from 1 to ${bank.length} (got "${String(indexRaw ?? "").slice(0, 20)}").`,
      };
    }
    const at = index - 1;
    if (action === "delete") {
      bank = bank.filter((_, i) => i !== at);
    } else {
      const current = bank[at];
      const title = readString(values["title"]);
      if (title.length > MAX_TITLE_CHARS) {
        return {
          ok: false,
          error: `Title is ${title.length} characters (max ${MAX_TITLE_CHARS}).`,
        };
      }
      if (statusRaw.length > 0 && !isStatus(statusRaw)) {
        return {
          ok: false,
          error: `Status must be one of ${STATUSES.join(", ")} (got "${statusRaw}").`,
        };
      }
      // Only provided fields overwrite: empty title keeps the current one;
      // tags/notes provided as empty strings clear the field.
      const tagsGiven = values["tags"] !== undefined && values["tags"] !== null;
      const parsed = tagsGiven ? parseTags(values["tags"]) : null;
      bank = bank.map((idea, i) =>
        i === at
          ? {
              title: title.length > 0 ? title : idea.title,
              tags: parsed ? parsed.tags : idea.tags,
              status:
                statusRaw.length > 0 ? (statusRaw as IdeaStatus) : idea.status,
              notes:
                values["notes"] !== undefined && values["notes"] !== null
                  ? readString(values["notes"])
                  : idea.notes,
              ...(parsed && parsed.truncated ? { tagsTruncated: true } : {}),
            }
          : idea,
      );
    }
  }

  bank = flagDuplicates(bank);

  let shown = bank;
  if (action === "list") {
    const filterStatus = readString(values["filterStatus"]);
    if (filterStatus.length > 0 && !isStatus(filterStatus)) {
      return {
        ok: false,
        error: `Filter status must be one of ${STATUSES.join(", ")}.`,
      };
    }
    shown = filterIdeas(bank, {
      tag: readString(values["filterTag"]),
      status: filterStatus,
      query: readString(values["filterQuery"]),
    });
  }

  return {
    ok: true,
    values: {
      ideas: ideasTable(shown),
      count: shown.length,
      exportCsv: exportCsv(bank),
    },
  };
}
