/**
 * Highlight Cover Maker — core logic (tool-205).
 *
 * 100% client-side. Pure TypeScript, zero imports, zero network, zero DOM,
 * no Math.random. Deterministic: same inputs -> same outputs.
 *
 * ## What this does
 * Builder template calls `runTool({ items })`, where each item is
 * `{ label, background, icon }`. For every item the engine builds a
 * 1080x1080 SVG cover string (DOM-free string construction — no canvas,
 * no browser APIs): a full-bleed background circle (solid color or a
 * two-color diagonal gradient), a centered icon (emoji or letter), and/or
 * a centered label. The SVG text is returned as both a `download` payload
 * (save as .svg) and a `copy` payload (paste into any editor).
 *
 * ## Validation (per item, errors labeled "Item N: ...")
 *   - label: required unless icon is set; max 60 chars
 *   - background: required; "#RGB" or "#RRGGBB", or "colorA|colorB" gradient
 *   - icon: optional; max 12 characters (emoji or letter)
 *
 * All user text is XML-escaped before insertion into the SVG.
 *
 * @module highlight-cover-maker/logic
 */

export interface CoverItem {
  label: string;
  background: string;
  icon: string;
}

export interface CoverResult {
  itemIndex: number;
  svg: string;
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SIZE = 1080;
const CENTER = SIZE / 2;

/** XML-escape user text before embedding in SVG. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface ParsedBackground {
  kind: "solid" | "gradient";
  colorA: string;
  colorB?: string;
}

/** Parse "color" or "colorA|colorB" into a background spec. Throws on invalid input. */
export function parseBackground(raw: string, itemIndex: number): ParsedBackground {
  const n = itemIndex + 1;
  const parts = raw.split("|").map((p) => p.trim());
  if (parts.length === 1) {
    if (!HEX_COLOR.test(parts[0])) {
      throw new Error(`Item ${n}: background must be a hex color like #FF6B6B (got "${raw}").`);
    }
    return { kind: "solid", colorA: parts[0] };
  }
  if (parts.length === 2 && HEX_COLOR.test(parts[0]) && HEX_COLOR.test(parts[1])) {
    return { kind: "gradient", colorA: parts[0], colorB: parts[1] };
  }
  throw new Error(`Item ${n}: background must be "#RRGGBB" or a gradient "#RRGGBB|#RRGGBB".`);
}

/** Font size for the label: shrinks as the label gets longer (floor 40). */
export function labelFontSize(label: string): number {
  if (label.length === 0) return 96;
  return Math.max(40, Math.min(96, Math.floor(560 / label.length)));
}

function validateItem(item: unknown, index: number): CoverItem {
  const n = index + 1;
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(`Item ${n}: each row needs a label, a background, and an optional icon.`);
  }
  const row = item as Record<string, unknown>;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  const background = typeof row.background === "string" ? row.background.trim() : "";
  const icon = typeof row.icon === "string" ? row.icon.trim() : "";
  if (label === "" && icon === "") {
    throw new Error(`Item ${n}: add a label or an icon — a cover needs at least one.`);
  }
  if (label.length > 60) {
    throw new Error(`Item ${n}: label must be 60 characters or fewer (got ${label.length}).`);
  }
  if (background === "") {
    throw new Error(`Item ${n}: background is required (e.g. #FF6B6B or #FF6B6B|#4ECDC4).`);
  }
  if (icon.length > 12) {
    throw new Error(`Item ${n}: icon must be 12 characters or fewer.`);
  }
  return { label, background, icon };
}

/**
 * Build the SVG cover string for one validated item.
 * Layout: full-bleed circle background, icon (if any), label (if any).
 */
export function buildSvg(item: CoverItem, itemIndex: number): string {
  const bg = parseBackground(item.background, itemIndex);
  const hasIcon = item.icon !== "";
  const hasLabel = item.label !== "";

  const defs =
    bg.kind === "gradient"
      ? `<defs><linearGradient id="g${itemIndex}" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="${bg.colorA}"/><stop offset="1" stop-color="${bg.colorB}"/></linearGradient></defs>`
      : "";
  const fill = bg.kind === "gradient" ? `url(#g${itemIndex})` : bg.colorA;

  let inner = "";
  if (hasIcon && hasLabel) {
    const iconSize = 300;
    const fs = labelFontSize(item.label);
    inner =
      `<text x="${CENTER}" y="${CENTER - 40}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-size="${iconSize}" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${escapeXml(item.icon)}</text>` +
      `<text x="${CENTER}" y="${CENTER + 260}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-size="${fs}" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="#FFFFFF">${escapeXml(item.label)}</text>`;
  } else if (hasIcon) {
    inner =
      `<text x="${CENTER}" y="${CENTER + 20}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-size="380" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${escapeXml(item.icon)}</text>`;
  } else {
    const fs = labelFontSize(item.label);
    inner =
      `<text x="${CENTER}" y="${CENTER + 10}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-size="${fs}" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="#FFFFFF">${escapeXml(item.label)}</text>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    defs +
    `<circle cx="${CENTER}" cy="${CENTER}" r="${CENTER}" fill="${fill}"/>` +
    inner +
    `</svg>`
  );
}

/**
 * Contract entry point. Builder template calls `runTool({ items })`.
 * Output ids match meta.ts outputs: svg (download), svgCode (copy).
 */
export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!args || !Array.isArray(args.items) || args.items.length === 0) {
    return { ok: false, error: "Add at least one cover row (label + background) to generate covers." };
  }
  if (args.items.length > 20) {
    return { ok: false, error: "Too many rows — keep it to 20 or fewer." };
  }

  try {
    const results: CoverResult[] = args.items.map((raw, i) => ({
      itemIndex: i,
      svg: buildSvg(validateItem(raw, i), i),
    }));
    const svg = results.map((r) => r.svg).join("\n");
    return {
      ok: true,
      values: {
        svg,
        svgCode: svg,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
