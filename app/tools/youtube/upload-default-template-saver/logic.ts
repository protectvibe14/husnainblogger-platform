/**
 * Upload Default Template Saver (tool-142) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * WHAT THIS HONESTLY IS: a builder that composes NAMED upload-default
 * presets from fixed fields (preset name, title suffix, description footer,
 * default tags, visibility, playlist) and renders copy-paste blocks plus a
 * step-by-step guide for applying them inside YouTube Studio's
 * Settings → Upload defaults panel.
 *
 * WHAT THIS HONESTLY IS NOT:
 *   - No YouTube API, no OAuth, no direct integration. This tool CANNOT
 *     write to your YouTube Studio settings. Copy-paste workflow only.
 *   - "Saver" means: composed for this session and exported as
 *     copy/download text. No cross-session storage is claimed (presets are
 *     NOT stored on a server and NOT synced anywhere).
 *
 * No word/template banks are used; output is assembled verbatim from the
 * user's own fields. Deterministic: same items → same output.
 */

export interface PresetItem {
  /** Preset name, e.g. "Weekly tutorial". Required. */
  name: string;
  /** Appended to every video title, e.g. "| Tech Tips". Optional. */
  titleSuffix?: string;
  /** Footer block pasted at the end of every description. Optional. */
  descriptionFooter?: string;
  /** Comma-separated default tags. Total length must be <= 500 chars. */
  defaultTags?: string;
  /** One of: public | unlisted | private. Defaults to "unlisted". */
  visibility?: string;
  /** Optional playlist name to file uploads under. */
  playlist?: string;
}

/** Allowed visibility values (YouTube Studio upload-default options). */
export const ALLOWED_VISIBILITY = ["public", "unlisted", "private"] as const;

/** YouTube's total tag-length limit per video. */
export const MAX_TAGS_CHARS = 500;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const HONESTY_NOTES: string[] = [
  "Copy-paste workflow only: this tool cannot change your YouTube Studio settings. Paste the blocks into Settings → Upload defaults yourself.",
  "Presets are composed for this session and exported as copyable/downloadable text. Nothing is stored on a server and nothing syncs anywhere.",
  "YouTube limits total tag length to 500 characters per video; presets exceeding that are rejected so you never paste a broken set.",
];

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Validate one preset item. Returns the cleaned item or an error message.
 * `index` is 0-based; errors are reported 1-based per the builder contract.
 */
function validateItem(
  raw: Record<string, unknown>,
  index: number
): { item?: PresetItem; error?: string } {
  const label = `Item ${index + 1}`;
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: `${label}: preset must be an object of fields.` };
  }
  const name = asStr(raw["name"]);
  if (name.length === 0) {
    return { error: `${label}: "name" is required (e.g. "Weekly tutorial").` };
  }
  if (name.length > 120) {
    return { error: `${label}: "name" must be 120 characters or fewer.` };
  }

  const visibilityRaw = asStr(raw["visibility"]).toLowerCase();
  const visibility =
    visibilityRaw.length === 0 ? "unlisted" : visibilityRaw;
  if (
    !((ALLOWED_VISIBILITY as readonly string[]) as string[]).includes(visibility)
  ) {
    return {
      error: `${label}: "visibility" must be one of public, unlisted, private (got "${asStr(raw["visibility"])}").`,
    };
  }

  const tagsRaw = asStr(raw["defaultTags"]);
  const tagList = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const tagsJoined = tagList.join(", ");
  if (tagsJoined.length > MAX_TAGS_CHARS) {
    return {
      error: `${label}: default tags total ${tagsJoined.length} characters — YouTube's limit is ${MAX_TAGS_CHARS}. Remove some tags.`,
    };
  }
  for (const tag of tagList) {
    if (tag.length > 60) {
      return {
        error: `${label}: tag "${tag.slice(0, 30)}…" is ${tag.length} characters — individual tags should stay under 60.`,
      };
    }
  }

  const item: PresetItem = { name };
  const suffix = asStr(raw["titleSuffix"]);
  if (suffix) item.titleSuffix = suffix;
  const footer = asStr(raw["descriptionFooter"]);
  if (footer) item.descriptionFooter = footer;
  if (tagsJoined) item.defaultTags = tagsJoined;
  item.visibility = visibility;
  const playlist = asStr(raw["playlist"]);
  if (playlist) item.playlist = playlist;
  return { item };
}

/** One-line human summary of a preset. */
function presetSummary(item: PresetItem): string {
  const tagCount =
    item.defaultTags === undefined
      ? 0
      : item.defaultTags.split(",").filter((t) => t.trim().length > 0).length;
  const parts: string[] = [`Preset "${item.name}"`];
  if (item.titleSuffix) parts.push(`title suffix: ${item.titleSuffix}`);
  if (item.descriptionFooter) parts.push(`description footer: set`);
  parts.push(
    `${tagCount} tag${tagCount === 1 ? "" : "s"} (${(item.defaultTags ?? "").length}/${MAX_TAGS_CHARS} chars)`
  );
  parts.push(`visibility: ${item.visibility}`);
  if (item.playlist) parts.push(`playlist: ${item.playlist}`);
  return parts.join(" · ");
}

/** Full copy-paste block for a preset (verbatim user content). */
function copyBlock(item: PresetItem): string {
  const lines: string[] = [`=== Preset: ${item.name} ===`];
  lines.push(`[TITLE SUFFIX — paste after each video title]`);
  lines.push(item.titleSuffix ?? "(none — no suffix set)");
  lines.push(``);
  lines.push(`[DESCRIPTION FOOTER — paste at the end of each description]`);
  lines.push(item.descriptionFooter ?? "(none — no footer set)");
  lines.push(``);
  lines.push(`[DEFAULT TAGS — paste into the tags field]`);
  lines.push(item.defaultTags ?? "(none — no tags set)");
  lines.push(``);
  lines.push(
    `[SET IN YOUTUBE STUDIO] Visibility: ${item.visibility}${item.playlist ? ` · Playlist: ${item.playlist}` : ""}`
  );
  return lines.join("\n");
}

function pasteGuide(item: PresetItem): string[] {
  return [
    `Open YouTube Studio → Settings → Upload defaults and pick your preset "${item.name}".`,
    `Title default: add your title suffix text: ${item.titleSuffix ?? "(none set)"}.`,
    `Description default: paste your footer: ${item.descriptionFooter ? `"${item.descriptionFooter.slice(0, 80)}${item.descriptionFooter.length > 80 ? "…" : ""}"` : "(none set)"}.`,
    `Tags: paste ${item.defaultTags ? item.defaultTags.split(",").filter((t) => t.trim().length > 0).length : 0} default tags into the tags box.`,
    `Set default visibility to "${item.visibility}"${item.playlist ? ` and default playlist to "${item.playlist}"` : ""}.`,
    `Save, then upload a private test video to confirm the defaults appear — the tool cannot apply them for you.`,
  ];
}

/**
 * Builder entry point. `args.items` is the array of preset items.
 * Invalid items → `{ ok: false, error: "Item N: ..." }`.
 *
 * Output keys (must match meta.ts outputs): presets, copyBlocks,
 * guides, honestyNotes, count.
 */
export function runTool(args: {
  items: Record<string, unknown>[];
}): RunToolResult {
  if (!args || !Array.isArray(args.items) || args.items.length === 0) {
    return {
      ok: false,
      error: "Add at least one preset item before running.",
    };
  }
  if (args.items.length > 20) {
    return {
      ok: false,
      error: "Maximum 20 presets per run — split larger sets into multiple runs.",
    };
  }

  const presets: string[] = [];
  const copyBlocks: string[] = [];
  const guides: string[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const { item, error } = validateItem(args.items[i], i);
    if (error) {
      return { ok: false, error };
    }
    const p = item as PresetItem;
    presets.push(presetSummary(p));
    copyBlocks.push(copyBlock(p));
    for (const step of pasteGuide(p)) guides.push(step);
  }

  return {
    ok: true,
    values: {
      presets,
      copyBlocks,
      guides,
      honestyNotes: [...HONESTY_NOTES],
      count: presets.length,
    },
  };
}
