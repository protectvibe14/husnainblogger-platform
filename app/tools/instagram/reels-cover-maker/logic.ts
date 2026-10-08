/**
 * Reels Cover Maker (tool-247) — pure logic (zero imports, zero network,
 * zero DOM).
 *
 * HONESTY CONTRACT: a pure-TS module cannot paint a canvas or download a
 * PNG, so this module does what a 100%-client-side tool CAN do without a
 * browser: it VALIDATES each cover item and COMPUTES a fully specified
 * cover spec (title, resolved background, 1080x1920 canvas, safe-zone
 * checklist). The Builder template renders those specs on a real <canvas>
 * in the user's browser and handles the PNG download — no server involved.
 *
 * Background formats accepted per item (field: background):
 *   - hex color:          "#0A0A0A" or "#0aa"  (also "color: #0A0A0A")
 *   - named gradient:     one of GRADIENTS (5), also "gradient: sunset"
 *   - uploaded image URL: "https://..." (also "upload: https://...")
 *
 * Validation rules (documented here and in meta assumptions):
 *   - title required, 1-60 chars (covers crop hard outside the safe zone,
 *     so 60 is enforced, not just recommended).
 *   - background required and must parse to one of the three kinds.
 *   - upload URLs must be absolute http(s) URLs (javascript:/data: rejected).
 *   - on invalid item the whole run fails: "Item N: <reason>".
 *
 * SAFE_ZONE_GUIDE: fixed list of the 1080x1920 safe-zone facts used by the
 * preview. Deterministic: same items -> same specs, always.
 */

export const MAX_TITLE_LENGTH = 60;
export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

/** Named gradients the canvas renderer supports — 5 fixed recipes. */
export const GRADIENTS = ["sunset", "ocean", "neon", "mono", "pastel"] as const;
export type GradientName = (typeof GRADIENTS)[number];

export type BackgroundKind = "color" | "gradient" | "upload";

export interface CoverSpec {
  /** 1-based item number. */
  n: number;
  title: string;
  backgroundKind: BackgroundKind;
  /** Resolved value: hex color, gradient name, or the upload URL. */
  background: string;
  canvas: "1080x1920";
  /** Characters over MAX_TITLE_LENGTH — always 0 since we enforce it. */
  titleOverBudget: number;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * 1080x1920 safe-zone facts for a Reels cover. Fixed list — the Builder
 * template draws the same overlay these facts describe.
 */
export const SAFE_ZONE_GUIDE: string[] = [
  "Canvas is 1080 × 1920 px (9:16) — the exact Reels cover size.",
  "Keep the title inside the central safe zone: Instagram crops roughly the top and bottom 340 px when the cover appears in the profile grid and feed.",
  "Keep all important graphics inside a centered 1080 × 1240 px band (from y ≈ 340 to y ≈ 1580).",
  "Title type should be at least 80 px tall to stay readable at thumbnail size.",
  "60 characters max keeps the title to about two short lines at 1080 px wide.",
  "Upload backgrounds should be at least 1080 × 1920 px; smaller images are stretched by the renderer and may look soft.",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isGradientName(value: string): value is GradientName {
  return (GRADIENTS as readonly string[]).includes(value.toLowerCase());
}

function parseBackground(raw: string, itemNo: number): { kind: BackgroundKind; value: string } {
  const fail = (why: string): never => {
    throw new Error(`Item ${itemNo}: background ${why}.`);
  };

  // "color: #0A0A0A" / "gradient: sunset" / "upload: https://..." prefixes.
  const prefixed = raw.match(/^(color|colour|gradient|grad|upload)\s*:\s*(.+)$/i);
  const kindWord = prefixed ? prefixed[1].toLowerCase() : null;
  const rest = (prefixed ? prefixed[2] : raw).trim();

  if (kindWord === "color" || kindWord === "colour") {
    if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(rest)) {
      return { kind: "color", value: rest.toUpperCase() };
    }
    return fail(`"${rest}" is not a valid hex color (use #RRGGBB or #RGB)`);
  }
  if (kindWord === "gradient" || kindWord === "grad") {
    if (isGradientName(rest)) return { kind: "gradient", value: rest.toLowerCase() };
    return fail(`unknown gradient "${rest}" — pick one of: ${GRADIENTS.join(", ")}`);
  }
  if (kindWord === "upload") {
    return validateUploadUrl(rest, itemNo);
  }

  // Unprefixed forms.
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(raw)) {
    return { kind: "color", value: raw.toUpperCase() };
  }
  if (isGradientName(raw)) {
    return { kind: "gradient", value: raw.toLowerCase() };
  }
  if (/^https?:\/\//i.test(raw)) {
    return validateUploadUrl(raw, itemNo);
  }
  if (raw.startsWith("#")) {
    return fail(`"${raw}" is not a valid hex color (use #RRGGBB or #RGB)`);
  }
  return fail(
    `must be a hex color like #0A0A0A, a gradient (${GRADIENTS.join(", ")}), or an https:// upload URL`
  );
}

function validateUploadUrl(raw: string, itemNo: number): { kind: BackgroundKind; value: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Item ${itemNo}: background upload URL is not a valid URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Item ${itemNo}: background upload URL must use http or https.`);
  }
  // This module cannot inspect the file: size/type checks happen in the
  // Builder UI before the item is submitted. Documented in assumptions.
  return { kind: "upload", value: raw };
}

function buildOne(item: Record<string, unknown>, itemNo: number): CoverSpec {
  const title = clean(item.title);
  const backgroundRaw = clean(item.background);

  if (title.length === 0) throw new Error(`Item ${itemNo}: title is required.`);
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `Item ${itemNo}: title must be ${MAX_TITLE_LENGTH} characters or fewer (got ${title.length}).`
    );
  }
  if (backgroundRaw.length === 0) throw new Error(`Item ${itemNo}: background is required.`);

  const bg = parseBackground(backgroundRaw, itemNo);
  return {
    n: itemNo,
    title,
    backgroundKind: bg.kind,
    background: bg.value,
    canvas: "1080x1920",
    titleOverBudget: 0,
  };
}

/**
 * Builder entry point. `args.items` is one object per cover:
 * { title, background }. Returns per-cover specs, the safe-zone guide,
 * and the cover count.
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "No covers to build." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one cover to build." };
  }
  const covers: CoverSpec[] = [];
  try {
    args.items.forEach((raw, index) => {
      if (!raw || typeof raw !== "object") {
        throw new Error(`Item ${index + 1}: not an object.`);
      }
      covers.push(buildOne(raw as Record<string, unknown>, index + 1));
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  return {
    ok: true,
    values: {
      covers,
      safeZoneGuide: [...SAFE_ZONE_GUIDE],
      count: covers.length,
    },
  };
}
