/**
 * Image SEO Filename Renamer — pure logic (zero imports, zero network, zero DOM).
 *
 * Turns a messy camera/upload filename (e.g. "IMG_20241001 (2).JPG") into a
 * clean, keyword-rich, lowercase-hyphenated filename. PURE STRING TRANSFORM:
 * it never sees, uploads, or modifies the actual image file — the renamed
 * file is produced by the UI layer from the suggested name (user supplies
 * the file). You apply the name yourself in your CMS, media library, or OS.
 *
 * Fixed rules:
 * 1. Strip any path components (both / and \ separators).
 * 2. If descriptive keywords are given, the name is built from them;
 *    otherwise it is built from the original name's base words.
 * 3. Transliterate accented Latin letters to ASCII (NFKD + strip combining
 *    marks). Non-Latin scripts (CJK, Arabic, etc.) lose those characters —
 *    if nothing ASCII remains the fallback name "image" is used.
 * 4. Lowercase; every run of non a-z/0-9 becomes one hyphen; leading/trailing
 *    hyphens trimmed; name part capped at 60 characters.
 * 5. The extension is the suffix after the LAST dot (1-5 alnum chars),
 *    lowercased. No extension → no extension added. A long or unusual suffix
 *    after the last dot is treated as part of the name, not an extension.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NAME_CHARS = 200;
const MAX_KEYWORDS_CHARS = 120;
const MAX_SLUG_CHARS = 60;

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Keep only the filename; drop directories ("a/b\c.jpg" -> "c.jpg"). */
function stripPath(name: string): string {
  const parts = name.split(/[\\/]/);
  return parts[parts.length - 1] ?? "";
}

function transliterate(s: string): string {
  // Strip combining diacritical marks after NFKD decomposition (é -> e).
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** lowercase → non-alnum runs become one hyphen → trim edge hyphens. */
function slugify(s: string): string {
  return transliterate(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function splitExtension(filename: string): { base: string; ext: string } {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) return { base: filename, ext: "" };
  const ext = filename.slice(dot + 1);
  if (/^[a-z0-9]{1,5}$/i.test(ext)) {
    return { base: filename.slice(0, dot), ext: ext.toLowerCase() };
  }
  return { base: filename, ext: "" };
}

export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }

  const originalName = clean(values["originalName"]);
  if (!originalName) {
    return {
      ok: false,
      error: "Enter the original file name first — for example IMG_20241001.jpg.",
    };
  }
  if (originalName.length > MAX_NAME_CHARS) {
    return {
      ok: false,
      error: `File name is too long (${originalName.length} characters). The limit is ${MAX_NAME_CHARS} characters.`,
    };
  }

  const keywordsRaw = values["keywords"];
  let keywords = "";
  if (keywordsRaw === undefined || keywordsRaw === null || keywordsRaw === "") {
    keywords = "";
  } else if (typeof keywordsRaw === "string") {
    keywords = keywordsRaw.trim();
  } else {
    return { ok: false, error: "Keywords must be plain text." };
  }
  if (keywords.length > MAX_KEYWORDS_CHARS) {
    return {
      ok: false,
      error: `Keywords are too long (${keywords.length} characters). Keep them under ${MAX_KEYWORDS_CHARS} characters.`,
    };
  }

  const file = stripPath(originalName);
  const { base, ext } = splitExtension(file);

  let slug = keywords ? slugify(keywords) : slugify(base);
  if (!slug) slug = "image"; // nothing ASCII survived (e.g. pure CJK/Arabic name)
  if (slug.length > MAX_SLUG_CHARS) {
    slug = slug.slice(0, MAX_SLUG_CHARS).replace(/-+$/, "");
  }

  const suggestedFilename = ext ? `${slug}.${ext}` : slug;
  return {
    ok: true,
    values: {
      suggestedFilename,
      // The UI download button uses this name for the renamed file you supply.
      downloadFilename: suggestedFilename,
    },
  };
}
