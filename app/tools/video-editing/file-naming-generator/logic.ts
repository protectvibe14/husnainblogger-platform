/**
 * File Naming Generator — pure logic (tool-293). Zero imports, zero DOM,
 * zero network, zero randomness.
 *
 * HONEST SCOPE: pure string templating with sanitization — no AI, no file
 * system access. It assembles a filename from a FIXED bank of 6 naming
 * patterns, joins the tokens with the chosen separator, strips
 * filesystem-illegal characters, and can generate a batch of versioned
 * names.
 *
 * Fixed pattern bank (6 entries, labels shown in the UI):
 *   1. "Project · Date · Version"                        -> project, date, version
 *   2. "Date · Project · Scene · Take · Version"          -> date, project, scene, take, version
 *   3. "Platform · Project · Date · Version"             -> platform, project, date, version
 *   4. "Project · Scene · Take · Platform · Version"     -> project, scene, take, platform, version
 *   5. "Full Production (all tokens)"                   -> date, project, scene, take, platform, version
 *   6. "Simple (Project · Version)"                      -> project, version
 *
 * Token rules:
 *   - Empty optional parts (scene, take, platform) are skipped silently.
 *   - date is formatted YYYYMMDD; if no date is entered the literal
 *     placeholder "YYYYMMDD" is used and a warning is added.
 *   - version defaults to "v1" when empty.
 *   - Sanitization: removes / \ : * ? " < > | and control characters,
 *     replaces whitespace runs with the separator, collapses repeated
 *     separators, and trims separators from both ends. Case is preserved.
 *   - Names longer than 200 characters produce a warning.
 *   - Batch: when batchVersions > 1, batchNames[] holds one filename per
 *     version (v01..vN style, zero-padding derived from the typed version);
 *     when batchVersions is 1, batchNames = [fileName].
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface NamingPattern {
  label: string;
  tokens: Array<"project" | "date" | "version" | "scene" | "take" | "platform">;
}

/** Fixed pattern bank — 6 entries. */
export const PATTERNS: NamingPattern[] = [
  { label: "Project · Date · Version", tokens: ["project", "date", "version"] },
  { label: "Date · Project · Scene · Take · Version", tokens: ["date", "project", "scene", "take", "version"] },
  { label: "Platform · Project · Date · Version", tokens: ["platform", "project", "date", "version"] },
  { label: "Project · Scene · Take · Platform · Version", tokens: ["project", "scene", "take", "platform", "version"] },
  { label: "Full Production (all tokens)", tokens: ["date", "project", "scene", "take", "platform", "version"] },
  { label: "Simple (Project · Version)", tokens: ["project", "version"] },
];

/** Fixed separator set — 3 entries. */
export const SEPARATORS = ["_", "-", "."] as const;

const ILLEGAL_CHARS = /[\/\\:*?"<>|\x00-\x1f]/g;
const MAX_NAME_LENGTH = 200;

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Sanitize one token. Returns the cleaned value and whether anything
 * illegal was stripped (for the warning list).
 */
function sanitizeToken(raw: string, sep: string): { clean: string; stripped: boolean } {
  const stripped = ILLEGAL_CHARS.test(raw);
  ILLEGAL_CHARS.lastIndex = 0;
  let clean = raw.replace(ILLEGAL_CHARS, "");
  clean = clean.replace(/\s+/g, sep);
  const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  clean = clean.replace(new RegExp(`${escapedSep}{2,}`, "g"), sep);
  clean = clean.replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, "g"), "");
  return { clean, stripped };
}

function formatDate(raw: string): string {
  return raw.replace(/-/g, "");
}

function versionForBatch(version: string, i: number): string {
  const m = /^(.*?)(\d+)$/.exec(version);
  if (!m) return `${version}-${i}`;
  const pad = m[2].length;
  return `${m[1]}${String(i).padStart(pad, "0")}`;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const projectRaw =
    typeof values.project === "string" ? values.project.trim() : "";
  if (projectRaw.length === 0) {
    return { ok: false, error: "Enter a project name — it is the core of every filename." };
  }

  const patternLabel =
    typeof values.pattern === "string" ? values.pattern.trim() : PATTERNS[0].label;
  const pattern = PATTERNS.find((p) => p.label === patternLabel);
  if (!pattern) {
    return { ok: false, error: "Choose one of the listed naming patterns." };
  }

  const sepRaw = typeof values.separator === "string" ? values.separator.trim() : "_";
  if (!(SEPARATORS as readonly string[]).includes(sepRaw)) {
    return { ok: false, error: "Separator must be one of: _, -, ." };
  }
  const sep = sepRaw;

  const dateRaw = typeof values.date === "string" ? values.date.trim() : "";
  if (dateRaw !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
    return { ok: false, error: "Date must be in YYYY-MM-DD format (or left empty)." };
  }

  const versionRaw =
    typeof values.version === "string" && values.version.trim() !== ""
      ? values.version.trim()
      : "v1";

  const batchRaw = toInt(values.batchVersions);
  const batchVersions = values.batchVersions === undefined || values.batchVersions === null || values.batchVersions === ""
    ? 1
    : batchRaw;
  if (batchVersions === null || !Number.isInteger(batchVersions) || batchVersions < 1 || batchVersions > 12) {
    return { ok: false, error: "Batch versions must be a whole number from 1 to 12." };
  }

  const warnings: string[] = [];

  // Build tokens in pattern order.
  const tokenValues: Record<string, string> = {};
  const tokenInputs: Record<string, string> = {
    project: projectRaw,
    date: dateRaw,
    version: versionRaw,
    scene: typeof values.scene === "string" ? values.scene.trim() : "",
    take: typeof values.take === "string" ? values.take.trim() : "",
    platform: typeof values.platform === "string" ? values.platform.trim() : "",
  };

  const tokenParts: string[] = [];
  for (const token of pattern.tokens) {
    let rawValue = tokenInputs[token];
    if (token === "date") {
      if (dateRaw === "") {
        warnings.push('No date entered — used the placeholder "YYYYMMDD".');
        rawValue = "YYYYMMDD";
      } else {
        rawValue = formatDate(dateRaw);
      }
    } else if (token === "version" && tokenInputs.version === "") {
      rawValue = "v1";
    }
    if (rawValue === "" && token !== "date" && token !== "version") {
      continue; // empty optional parts are skipped silently
    }
    const { clean, stripped } = sanitizeToken(rawValue, sep);
    if (stripped) {
      warnings.push(`Removed filesystem-illegal characters (/ \\ : * ? " < > |) from "${token}".`);
    }
    if (clean === "") continue;
    tokenValues[token] = clean;
    tokenParts.push(clean);
  }

  const fileName = tokenParts.join(sep);

  if (fileName.length > MAX_NAME_LENGTH) {
    warnings.push(
      `Filename is ${fileName.length} characters — over ${MAX_NAME_LENGTH}. Some systems and platforms truncate very long names.`
    );
  }

  const batchNames: string[] =
    batchVersions === 1
      ? [fileName]
      : Array.from({ length: batchVersions }, (_, i) => {
          const v = versionForBatch(tokenValues.version ?? "v1", i + 1);
          const parts = pattern.tokens
            .map((t) => (t === "version" ? v : tokenValues[t]))
            .filter((p): p is string => typeof p === "string" && p !== "");
          return parts.join(sep);
        });

  const patternPreview =
    `Pattern "${pattern.label}" → ` +
    pattern.tokens.map((t) => `{${t}}`).join(sep) +
    `  (separator "${sep}")`;

  return {
    ok: true,
    values: {
      fileName,
      patternPreview,
      batchNames,
      warnings,
    },
  };
}
