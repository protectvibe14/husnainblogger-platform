/**
 * Pros & Cons Box Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Turns the user's pros and cons lists into a clean two-column HTML box
 * snippet plus a matching CSS block.
 *
 * Honesty contract:
 * - The tool only FORMATS the user's own pros/cons as HTML. Nothing is
 *   written by AI; the words in the output are always exactly the words the
 *   user typed.
 * - All user content is HTML-escaped — user input can never inject raw HTML,
 *   scripts, or attributes into the output.
 * - Styling is intentionally minimal and inline so the snippet works in any
 *   blog theme; the separate CSS block uses prefixed class names
 *   (hb-proscons-*) that are safe to customize or drop.
 * - Deterministic: same inputs → same outputs, always.
 *
 * Input shape for runTool values:
 * - pros: textarea string (one pro per line) or string[] (1–10 items)
 * - cons: textarea string (one con per line) or string[] (1–10 items)
 * - title: optional string, max 100 chars
 *
 * Validation bounds (documented per the batch contract):
 * - pros: 1–10 non-empty items; cons: 1–10 non-empty items
 * - each item: max 200 chars
 * - title: max 100 chars
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 10;
export const MAX_ITEM_CHARS = 200;
export const MAX_TITLE_CHARS = 100;
export const DEFAULT_TITLE = "Pros & Cons";

/** Escape user text so it can never become markup in the output. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Normalize a list input (string or string[]) to trimmed non-empty items. */
export function parseItems(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    return raw.map((i) => String(i).trim()).filter((i) => i !== "");
  }
  if (typeof raw === "string") {
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l !== "");
  }
  return null;
}

/** Validate one list; returns error messages (empty = valid). */
export function validateItems(
  items: string[],
  label: "pros" | "cons"
): string[] {
  const errors: string[] = [];
  if (items.length < MIN_ITEMS) {
    errors.push(`Add at least ${MIN_ITEMS} ${label === "pros" ? "pro" : "con"}.`);
    return errors;
  }
  if (items.length > MAX_ITEMS) {
    errors.push(
      `Too many ${label}: ${items.length} (max ${MAX_ITEMS}).`
    );
  }
  items.forEach((item, i) => {
    if (item.length > MAX_ITEM_CHARS) {
      errors.push(
        `${label === "pros" ? "Pro" : "Con"} ${i + 1} is ${item.length} chars (max ${MAX_ITEM_CHARS}).`
      );
    }
  });
  return errors;
}

/**
 * Core builder: assemble the pros/cons box HTML + CSS from validated parts.
 * All content is escaped here, so callers only need structural validation.
 */
export function buildProsConsBox(
  pros: string[],
  cons: string[],
  title: string
): { boxHtml: string; boxCss: string } {
  const proLis = pros.map((p) => `      <li>${escapeHtml(p)}</li>`).join("\n");
  const conLis = cons.map((c) => `      <li>${escapeHtml(c)}</li>`).join("\n");

  const boxHtml =
    `<div class="hb-proscons" style="border:1px solid #e2e2e2;border-radius:10px;padding:18px;margin:1.5em 0;">\n` +
    `  <h4 class="hb-proscons-title" style="margin:0 0 12px;font-size:18px;">${escapeHtml(title)}</h4>\n` +
    `  <div class="hb-proscons-cols" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">\n` +
    `    <div class="hb-proscons-pros">\n` +
    `      <p class="hb-proscons-heading" style="margin:0 0 8px;font-weight:700;color:#1a7f37;">✓ Pros</p>\n` +
    `      <ul class="hb-proscons-list" style="margin:0;padding-left:20px;">\n${proLis}\n      </ul>\n` +
    `    </div>\n` +
    `    <div class="hb-proscons-cons">\n` +
    `      <p class="hb-proscons-heading" style="margin:0 0 8px;font-weight:700;color:#b42318;">✕ Cons</p>\n` +
    `      <ul class="hb-proscons-list" style="margin:0;padding-left:20px;">\n${conLis}\n      </ul>\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</div>`;

  const boxCss =
    `/* Pros & cons box styles — optional. The HTML above carries inline\n` +
    `   styles, so it works even without this CSS. Customize freely. */\n` +
    `.hb-proscons { border: 1px solid #e2e2e2; border-radius: 10px; padding: 18px; margin: 1.5em 0; }\n` +
    `.hb-proscons-title { margin: 0 0 12px; font-size: 18px; }\n` +
    `.hb-proscons-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n` +
    `@media (max-width: 600px) { .hb-proscons-cols { grid-template-columns: 1fr; } }\n` +
    `.hb-proscons-heading { margin: 0 0 8px; font-weight: 700; }\n` +
    `.hb-proscons-pros .hb-proscons-heading { color: #1a7f37; }\n` +
    `.hb-proscons-cons .hb-proscons-heading { color: #b42318; }\n` +
    `.hb-proscons-list { margin: 0; padding-left: 20px; }\n` +
    `.hb-proscons-list li { margin-bottom: 6px; }\n`;

  return { boxHtml, boxCss };
}

/**
 * Tool-logic slot: validate input, build the box, return run values.
 * Values keys: boxHtml, boxCss (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Add your pros and cons first." };
  }

  const pros = parseItems(values["pros"]);
  const cons = parseItems(values["cons"]);

  const errors: string[] = [];
  if (pros === null) errors.push("Add at least 1 pro.");
  else errors.push(...validateItems(pros, "pros"));
  if (cons === null) errors.push("Add at least 1 con.");
  else errors.push(...validateItems(cons, "cons"));
  if (errors.length > 0) return { ok: false, error: errors[0] };

  let title = DEFAULT_TITLE;
  const rawTitle = values["title"];
  if (
    rawTitle !== undefined &&
    rawTitle !== null &&
    String(rawTitle).trim() !== ""
  ) {
    const t = String(rawTitle).trim();
    if (t.length > MAX_TITLE_CHARS) {
      return {
        ok: false,
        error: `Title is ${t.length} chars (max ${MAX_TITLE_CHARS}).`,
      };
    }
    title = t;
  }

  const { boxHtml, boxCss } = buildProsConsBox(pros!, cons!, title);
  return { ok: true, values: { boxHtml, boxCss } };
}
