/**
 * Title Swipe File Vault — pure logic.
 *
 * ENGINE: local list manager over an entries array (add/tag/search/filter/export).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports, no Math.random, no Date.now.
 * - STORAGE-AGNOSTIC: the vault itself is passed in and out as JSON
 *   (`vaultJson`). Persistence is the UI layer's job (localStorage) — this
 *   module never reads or writes storage, so it stays pure and testable.
 *   The "vault" is a local collection, NOT a content generator: it creates
 *   no titles, it only stores and organizes the ones you add.
 * - Entry ids are deterministic: a slug of the entry text plus its grapheme
 *   length. Duplicate detection is on identical text (trimmed,
 *   case-insensitive), so ids are unique in practice.
 * - Duplicate add -> error. Title over 100 graphemes on save -> warning in
 *   the message (YouTube's hard title limit), but the entry is still saved.
 * - Export produces CSV or pretty JSON as plain text lines — the UI's copy
 *   button or download control handles the actual file.
 * - Deterministic: same (action, inputs, vaultJson) -> same result, always.
 */

export type VaultAction = "add" | "list" | "search" | "export";
export type VaultStatus = "unused" | "used";
export type ExportFormat = "json" | "csv";

/** Actions offered by the tool. */
export const ACTIONS: readonly VaultAction[] = ["add", "list", "search", "export"];
/** Statuses an entry can carry. */
export const STATUSES: readonly VaultStatus[] = ["unused", "used"];
/** Export formats. */
export const EXPORT_FORMATS: readonly ExportFormat[] = ["json", "csv"];
/** YouTube title hard limit — used for the save-time length warning only. */
export const TITLE_HARD_LIMIT = 100;

export interface VaultEntry {
  id: string;
  text: string;
  source: string;
  tags: string[];
  status: VaultStatus;
}

function graphemes(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...seg.segment(text)].map((s) => s.segment);
}

export function charCountGraphemes(text: string): number {
  if (typeof text !== "string") throw new TypeError("charCountGraphemes expects a string");
  return graphemes(text).length;
}

/** Deterministic entry id: slug of first 40 graphemes + grapheme length. */
export function entryId(text: string): string {
  const trimmed = text.trim();
  const slug = graphemes(trimmed)
    .slice(0, 40)
    .join("")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "title"}-${charCountGraphemes(trimmed)}`;
}

/** Parse the vault JSON the UI passes in; throws a human-readable Error. */
export function parseVault(raw: unknown): VaultEntry[] {
  if (raw === undefined || raw === null || raw === "") return [];
  if (typeof raw !== "string") throw new Error("Vault data must be JSON text.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Vault data is not valid JSON — it may have been edited by hand.");
  }
  if (!Array.isArray(parsed)) throw new Error("Vault data must be a JSON array of entries.");
  return parsed.map((e, i) => {
    if (typeof e !== "object" || e === null) throw new Error(`Vault entry ${i + 1} is not an object.`);
    const entry = e as Record<string, unknown>;
    if (typeof entry.text !== "string") throw new Error(`Vault entry ${i + 1} is missing its title text.`);
    return {
      id: typeof entry.id === "string" ? entry.id : entryId(entry.text),
      text: entry.text,
      source: typeof entry.source === "string" ? entry.source : "",
      tags: Array.isArray(entry.tags) ? entry.tags.filter((t): t is string => typeof t === "string") : [],
      status: entry.status === "used" ? ("used" as VaultStatus) : ("unused" as VaultStatus),
    };
  });
}

/** Split a comma-separated tags string into a clean array. */
export function parseTags(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** One-line human-readable rendering of an entry (the UI's copy target). */
export function formatEntry(entry: VaultEntry): string {
  const tags = entry.tags.length > 0 ? entry.tags.join(", ") : "no tags";
  const source = entry.source ? ` · source: ${entry.source}` : "";
  return `${entry.text} [${entry.status}] · tags: ${tags}${source}`;
}

function escapeCsvCell(cell: string): string {
  return `"${cell.replace(/"/g, '""')}"`;
}

/** Export the vault as text lines: pretty JSON (one string in the list) or CSV lines. */
export function exportVault(vault: VaultEntry[], format: ExportFormat): string[] {
  if (format === "csv") {
    const lines = ["id,text,source,tags,status"];
    for (const e of vault) {
      lines.push(
        [
          escapeCsvCell(e.id),
          escapeCsvCell(e.text),
          escapeCsvCell(e.source),
          escapeCsvCell(e.tags.join("; ")),
          escapeCsvCell(e.status),
        ].join(","),
      );
    }
    return lines;
  }
  return [JSON.stringify(vault, null, 2)];
}

/** Filter entries by a case-insensitive query over text, source, and tags. */
export function searchVault(vault: VaultEntry[], query: string): VaultEntry[] {
  const q = query.trim().toLocaleLowerCase("en");
  return vault.filter(
    (e) =>
      e.text.toLocaleLowerCase("en").includes(q) ||
      e.source.toLocaleLowerCase("en").includes(q) ||
      e.tags.some((t) => t.toLocaleLowerCase("en").includes(q)),
  );
}

/**
 * UI adapter (generator template dispatch): runs one vault action on the
 * vault JSON passed in and returns the updated vault JSON for the UI to
 * persist. Output keys match meta.ts outputs: entries, vaultJson, count, message.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawAction = values.action;
  if (typeof rawAction !== "string" || !(ACTIONS as readonly string[]).includes(rawAction)) {
    return { ok: false, error: `Pick an action: ${ACTIONS.join(", ")}.` };
  }
  const action = rawAction as VaultAction;

  let vault: VaultEntry[];
  try {
    vault = parseVault(values.vaultJson);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not read the vault." };
  }

  if (action === "add") {
    const rawText = values.titleText;
    if (typeof rawText !== "string" || rawText.trim() === "") {
      return { ok: false, error: "Enter a title to save — the title field is empty." };
    }
    const text = rawText.trim();
    const duplicate = vault.some(
      (e) => e.text.trim().toLocaleLowerCase("en") === text.toLocaleLowerCase("en"),
    );
    if (duplicate) {
      return { ok: false, error: "That exact title is already in your vault — no duplicates saved." };
    }
    const rawStatus = values.status;
    const status: VaultStatus = rawStatus === "used" ? "used" : "unused";
    const entry: VaultEntry = {
      id: entryId(text),
      text,
      source: typeof values.source === "string" ? values.source.trim() : "",
      tags: parseTags(values.tags),
      status,
    };
    vault = [...vault, entry];
    const len = charCountGraphemes(text);
    const message =
      len > TITLE_HARD_LIMIT
        ? `Saved with a warning: ${len} characters — over YouTube's 100-character title limit. Trim it before using it as a real title.`
        : `Saved to your vault (${vault.length} ${vault.length === 1 ? "title" : "titles"} total).`;
    return {
      ok: true,
      values: {
        entries: vault.map(formatEntry),
        vaultJson: JSON.stringify(vault),
        count: vault.length,
        message,
      },
    };
  }

  if (action === "list") {
    if (vault.length === 0) {
      return {
        ok: true,
        values: {
          entries: [],
          vaultJson: JSON.stringify(vault),
          count: 0,
          message:
            "Your vault is empty — start your swipe file by saving titles you spot in the wild (use the add action). Great titles come from real videos, not from thin air.",
        },
      };
    }
    return {
      ok: true,
      values: {
        entries: vault.map(formatEntry),
        vaultJson: JSON.stringify(vault),
        count: vault.length,
        message: `${vault.length} ${vault.length === 1 ? "title" : "titles"} in your vault.`,
      },
    };
  }

  if (action === "search") {
    const rawQuery = values.query;
    if (typeof rawQuery !== "string" || rawQuery.trim() === "") {
      return { ok: false, error: "Enter a search query — the search box is empty." };
    }
    const hits = searchVault(vault, rawQuery);
    return {
      ok: true,
      values: {
        entries: hits.map(formatEntry),
        vaultJson: JSON.stringify(vault),
        count: hits.length,
        message:
          hits.length === 0
            ? `No titles match "${rawQuery.trim()}". Try a different word or check the full list.`
            : `${hits.length} ${hits.length === 1 ? "match" : "matches"} for "${rawQuery.trim()}".`,
      },
    };
  }

  // action === "export"
  const rawFormat = values.exportFormat;
  const format: ExportFormat =
    rawFormat === "csv" ? "csv" : "json";
  if (vault.length === 0) {
    return {
      ok: true,
      values: {
        entries: [],
        vaultJson: JSON.stringify(vault),
        count: 0,
        message: "Nothing to export — your vault is empty. Add some titles first.",
      },
    };
  }
  const lines = exportVault(vault, format);
  return {
    ok: true,
    values: {
      entries: lines,
      vaultJson: JSON.stringify(vault),
      count: vault.length,
      message: `Exported ${vault.length} ${vault.length === 1 ? "title" : "titles"} as ${format.toUpperCase()} — copy it from the results. Storage stays on your device (localStorage); nothing is uploaded.`,
    },
  };
}
