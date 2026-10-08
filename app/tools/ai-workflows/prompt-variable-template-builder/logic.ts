/**
 * Prompt Variable Template Builder (tool-347) — pure logic, zero imports.
 *
 * VARIABLE DETECTOR + FILL-IN PREVIEW, NOT A WRITER: detects {variables} in
 * the user's OWN template text, lists them in order of first appearance,
 * and renders a fill-in preview. No prompt content is written by the tool —
 * the user's text IS the template.
 *
 * Detection rules (documented for honest UI copy):
 *   - A variable is `{name}`: 1-60 chars inside braces; name must start
 *     with a letter or underscore and contain only letters, digits,
 *     spaces, underscores, hyphens, or periods.
 *   - Duplicates collapse to one entry (order of first appearance);
 *     per-variable occurrence counts are reported.
 *   - Names are case-sensitive: {Topic} and {topic} are different.
 *   - Unmatched braces (a "{" that never closes, a "}" with no opener,
 *     empty "{}", or an invalid name) do NOT fail the item — they are
 *     listed in the `warnings` output (spec edge case).
 *
 * Validation (per item): templateText required (max 2000 chars);
 * at least one {variable} must be detected (spec validation).
 */

export const MAX_ITEMS = 20;
export const MAX_TEXT_CHARS = 2000;
export const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9 _.-]*$/;

export interface BuilderItem {
  templateText?: unknown;
}

export interface DetectedVariable {
  /** Variable name as written (case preserved). */
  name: string;
  /** How many times {name} appears in the template. */
  count: number;
}

export interface DetectionResult {
  variables: DetectedVariable[];
  warnings: string[];
}

export interface ToolValues {
  /** One summary line per template: name + variable count + list. */
  lines: string[];
  /** Full fill-in preview (fill-in slots + the reusable template text). */
  preview: string;
  /** Unmatched-brace / invalid-name warnings across all items. */
  warnings: string[];
}

export interface RunResult {
  ok: boolean;
  values?: ToolValues;
  error?: string;
}

/** Trim, drop control chars, collapse whitespace, cap length. */
export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/[ \t]+/g, " ").trim();
}

/**
 * Scan the template for {variables}. Returns variables in order of first
 * appearance plus warnings for unmatched/invalid braces.
 */
export function detectVariables(text: string): DetectionResult {
  const seen: string[] = [];
  const counts: Record<string, number> = {};
  const warnings: string[] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];
    if (ch === "{") {
      const close = text.indexOf("}", i + 1);
      if (close === -1) {
        warnings.push(`Unmatched "{" at character ${i + 1} — it never closes.`);
        i++;
        continue;
      }
      const raw = text.slice(i + 1, close);
      const name = raw.trim();
      if (raw.length > 60 || name === "" || !VARIABLE_NAME_PATTERN.test(name)) {
        if (name === "") {
          warnings.push(
            `Empty "{}" at character ${i + 1} — put a variable name inside, e.g. {topic}.`,
          );
        } else {
          warnings.push(
            `"${raw.length > 60 ? raw.slice(0, 57) + "..." : raw}" at character ${i + 1} is not a valid variable name — use 1-60 chars, starting with a letter or underscore.`,
          );
        }
      } else {
        if (!(name in counts)) {
          counts[name] = 0;
          seen.push(name);
        }
        counts[name]++;
      }
      i = close + 1;
    } else if (ch === "}") {
      warnings.push(`Unmatched "}" at character ${i + 1} — there is no opening "{".`);
      i++;
    } else {
      i++;
    }
  }

  return { variables: seen.map((name) => ({ name, count: counts[name] })), warnings };
}

/** Validate + detect for one item; error already prefixed with "Item N:". */
export function normalizeItem(item: BuilderItem, index: number): {
  ok: boolean;
  text?: string;
  detection?: DetectionResult;
  error?: string;
} {
  const label = `Item ${index + 1}`;
  if (!item || typeof item !== "object")
    return { ok: false, error: `${label}: not an object.` };

  const text = sanitize(item.templateText);
  if (text === "")
    return { ok: false, error: `${label}: template text is required.` };
  if (text.length > MAX_TEXT_CHARS)
    return {
      ok: false,
      error: `${label}: template text is too long (max ${MAX_TEXT_CHARS} characters).`,
    };

  const detection = detectVariables(text);
  if (detection.variables.length === 0)
    return {
      ok: false,
      error: `${label}: no {variables} found — add at least one, e.g. {topic}, to make a reusable template.`,
    };

  return { ok: true, text, detection };
}

/** One-line summary for the `lines` output. */
export function summarizeItem(index: number, text: string, vars: DetectedVariable[]): string {
  const names = vars.map((v) => (v.count > 1 ? `${v.name} (x${v.count})` : v.name)).join(", ");
  const snippet = text.length > 80 ? text.slice(0, 77) + "..." : text;
  return `Template ${index + 1} — ${vars.length} variable${vars.length === 1 ? "" : "s"} (${names}): "${snippet}"`;
}

/** Render the copyable fill-in preview for all templates. */
export function renderPreview(items: { text: string; detection: DetectionResult }[]): string {
  const blocks: string[] = [];
  items.forEach(({ text, detection }, index) => {
    const vars = detection.variables;
    const slots = vars.map((v) => `${v.name} = [____________]`).join("   ");
    const names = vars.map((v) => v.name).join(", ");
    blocks.push(
      [
        `TEMPLATE ${index + 1} — reusable form (${vars.length} variable${vars.length === 1 ? "" : "s"}: ${names})`,
        `Fill in: ${slots}`,
        "",
        text,
        "",
        "---",
      ].join("\n"),
    );
  });
  return blocks.join("\n").trimEnd();
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  if (!args || !Array.isArray(args.items))
    return { ok: false, error: "No items were provided." };
  if (args.items.length === 0)
    return { ok: false, error: "Add at least one template to build a reusable form." };
  if (args.items.length > MAX_ITEMS)
    return { ok: false, error: `Too many items (max ${MAX_ITEMS}).` };

  const lines: string[] = [];
  const warnings: string[] = [];
  const good: { text: string; detection: DetectionResult }[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const res = normalizeItem(args.items[i] as BuilderItem, i);
    if (!res.ok || !res.text || !res.detection) return { ok: false, error: res.error };
    good.push({ text: res.text, detection: res.detection });
    lines.push(summarizeItem(i, res.text, res.detection.variables));
    for (const w of res.detection.warnings) warnings.push(`Template ${i + 1}: ${w}`);
  }

  return {
    ok: true,
    values: { lines, preview: renderPreview(good), warnings },
  };
}
