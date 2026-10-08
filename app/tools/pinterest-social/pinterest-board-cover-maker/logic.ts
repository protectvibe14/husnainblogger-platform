/**
 * Pinterest Board Cover Maker (tool-501) — pure logic (zero imports, zero
 * network, zero DOM, zero canvas).
 *
 * HONESTY CONTRACT: a pure-TS module cannot paint pixels or download an
 * image file, so this module does what a 100%-client-side tool CAN do:
 * it VALIDATES each board item and COMPUTES a fully specified, copy-ready
 * cover design spec per board — background palette, title typography
 * treatment, accent layout, an 800x800 recreate recipe, and an HTML snippet
 * the user can paste into an HTML preview and rebuild in Canva (or any
 * editor) in minutes. It never claims to generate image files.
 *
 * Item fields (see meta.ts itemFields):
 *   - boardName  (required): 2-60 chars, any Unicode.
 *   - theme      (optional): free-text keyword/theme, max 80 chars.
 *   - brandColor (optional): hex color "#RRGGBB" or "#RGB" — replaces the
 *     palette's accent color when given.
 *
 * Deterministic selection banks (fixed sizes — do not change without a
 * version bump, or saved specs will shift):
 *   - PALETTES:   8 named palettes (background / accent / text hex triplets).
 *   - TYPOGRAPHY: 6 named typography treatments (recreate instructions).
 *   - LAYOUTS:    4 named accent layouts (recreate instructions).
 *
 * Mapping: FNV-1a hash of the lowercased board name -> palette index
 * (hash % 8), typography index ((hash >>> 3) % 6), layout index
 * ((hash >>> 6) % 4). Same board name always yields the same spec.
 *
 * On any invalid item the whole run fails: "Item N: <reason>".
 * All HTML output is escaped (escapeHtml).
 */

export const BOARD_NAME_MIN = 2;
export const BOARD_NAME_MAX = 60;
export const THEME_MAX = 80;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;

export interface Palette {
  name: string;
  background: string;
  accent: string;
  text: string;
}

/** 8 fixed palettes — background / accent / text hex triplets. */
export const PALETTES: Palette[] = [
  { name: "Terracotta",        background: "#F5EDE3", accent: "#C96F4A", text: "#2E2A24" },
  { name: "Sage",              background: "#EDEFE6", accent: "#7A8B6F", text: "#23282A" },
  { name: "Navy & Gold",       background: "#1F2A44", accent: "#D9A441", text: "#F6F3EA" },
  { name: "Blush",             background: "#F9EDEF", accent: "#D98CA3", text: "#33262B" },
  { name: "Forest",            background: "#1E3329", accent: "#9FBF8F", text: "#F2F5EE" },
  { name: "Mustard & Charcoal", background: "#2B2B28", accent: "#E0A93E", text: "#F6F2E7" },
  { name: "Ocean",             background: "#E8F1F5", accent: "#2E86AB", text: "#1F2E36" },
  { name: "Lavender",          background: "#F1ECFA", accent: "#8B7BC7", text: "#2A2533" },
];

export interface TypographyTreatment {
  name: string;
  instruction: string;
}

/** 6 fixed typography treatments — recreate instructions for Canva. */
export const TYPOGRAPHY: TypographyTreatment[] = [
  {
    name: "Bold centered sans-serif",
    instruction: "Set the board name in a bold sans-serif (e.g. Montserrat Bold), centered, about 3-5 words per line, letter-spacing slightly tight.",
  },
  {
    name: "Elegant serif",
    instruction: "Set the board name in a high-contrast serif (e.g. Playfair Display), centered, generous line spacing.",
  },
  {
    name: "Stacked all-caps",
    instruction: "Set the board name in ALL CAPS, one or two words per line, stacked and centered, wide letter-spacing.",
  },
  {
    name: "Minimal lowercase",
    instruction: "Set the board name in lowercase with a clean geometric sans (e.g. Poppins), centered, with lots of open space.",
  },
  {
    name: "Script accent",
    instruction: "Pair a script font for the first word (e.g. Dancing Script) with a simple sans for the rest, both centered.",
  },
  {
    name: "Outline display",
    instruction: "Set the board name in a heavy display font as an outline/stroke over a solid accent block, centered.",
  },
];

export interface AccentLayout {
  name: string;
  instruction: string;
}

/** 4 fixed accent layouts — recreate instructions for Canva. */
export const LAYOUTS: AccentLayout[] = [
  {
    name: "Top accent bar",
    instruction: "A horizontal accent-color bar across the top ~18% of the cover; the board name sits centered in the open space below it.",
  },
  {
    name: "Centered card",
    instruction: "The board name sits on a centered card (about 70% width) in the text color over the background color.",
  },
  {
    name: "Bottom accent band",
    instruction: "An accent-color band across the bottom ~22% of the cover; the board name sits centered in the open space above it.",
  },
  {
    name: "Thin frame border",
    instruction: "A 24 px accent-color frame inset 40 px from the edges; the board name sits centered inside the frame.",
  },
];

export interface CoverSpec {
  /** 1-based item number. */
  n: number;
  boardName: string;
  /** Null when the user did not supply a theme. */
  theme: string | null;
  palette: Palette;
  /** The user's brand color when supplied (replaces palette.accent); null otherwise. */
  customAccent: string | null;
  typography: TypographyTreatment;
  layout: AccentLayout;
  canvas: "800x800";
  /** Multi-line copy-ready design brief for this board. */
  brief: string;
  /** Copy-ready 800x800 HTML layout snippet for this board (all user text escaped). */
  html: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Fixed cover facts for Pinterest board covers. A fixed list — the same
 * facts are returned on every successful run.
 */
export const COVER_TIPS: string[] = [
  "Board covers are square (800 x 800 px); Pinterest may crop them to a circle on desktop profiles, so keep the title inside the central area.",
  "Short board names read best at thumbnail size — 2-4 words beats a full sentence.",
  "Use one consistent palette across all your boards so your profile looks branded.",
  "Recreate the spec in Canva (or any editor) at 800 x 800 px, then export as PNG.",
  "Set the cover in Pinterest: open the board, tap the edit/pencil icon, then choose the cover.",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** FNV-1a 32-bit hash — deterministic mapping from board name to bank picks. */
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function parseBrandColor(raw: string, itemNo: number): string {
  if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(raw)) {
    throw new Error(
      `Item ${itemNo}: brand color "${raw}" is not a valid hex color (use #RRGGBB or #RGB).`
    );
  }
  return raw.toUpperCase();
}

/** Accent block HTML per layout — user text is escaped before embedding. */
function accentBlock(
  layoutName: string,
  palette: Palette,
  boardNameEscaped: string
): string {
  const textColor = palette.text;
  const accent = palette.accent;
  const nameDiv =
    `<div style="color:${textColor};font-size:72px;font-weight:800;line-height:1.15;text-align:center;padding:0 70px;overflow-wrap:break-word;">${boardNameEscaped}</div>`;
  switch (layoutName) {
    case "Top accent bar":
      return (
        `<div style="position:absolute;top:0;left:0;right:0;height:144px;background:${accent};"></div>` +
        `<div style="position:absolute;top:144px;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;">${nameDiv}</div>`
      );
    case "Bottom accent band":
      return (
        `<div style="position:absolute;top:0;bottom:176px;left:0;right:0;display:flex;align-items:center;justify-content:center;">${nameDiv}</div>` +
        `<div style="position:absolute;bottom:0;left:0;right:0;height:176px;background:${accent};"></div>`
      );
    case "Thin frame border":
      return (
        `<div style="position:absolute;top:40px;bottom:40px;left:40px;right:40px;border:24px solid ${accent};box-sizing:border-box;"></div>` +
        `<div style="position:absolute;top:0;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;">${nameDiv}</div>`
      );
    case "Centered card":
    default:
      return (
        `<div style="position:absolute;top:0;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;">` +
        `<div style="background:${textColor};padding:56px 64px;max-width:70%;border-radius:8px;">` +
        `<div style="color:${accent};font-size:64px;font-weight:800;line-height:1.15;text-align:center;overflow-wrap:break-word;">${boardNameEscaped}</div>` +
        `</div></div>`
      );
  }
}

function buildBrief(spec: CoverSpec): string {
  const lines = [
    `Pinterest Board Cover — "${spec.boardName}" (800 x 800 px)`,
    `Palette: ${spec.palette.name} (background ${spec.palette.background}, accent ${spec.palette.accent}, text ${spec.palette.text})`,
    spec.customAccent
      ? `Accent overridden by your brand color ${spec.customAccent}.`
      : null,
    `Typography: ${spec.typography.name} — ${spec.typography.instruction}`,
    `Layout: ${spec.layout.name} — ${spec.layout.instruction}`,
    spec.theme ? `Theme keyword: ${spec.theme}` : null,
    "Recreate: make an 800x800 canvas in Canva, apply the colors, typography, and layout above, export as PNG, and set it as the board cover in Pinterest.",
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

function buildHtml(spec: CoverSpec): string {
  const escaped = escapeHtml(spec.boardName);
  const themeLine = spec.theme
    ? `\n  <!-- Theme keyword: ${escapeHtml(spec.theme)} -->`
    : "";
  return (
    `<div style="width:800px;height:800px;background:${spec.palette.background};position:relative;font-family:Arial,Helvetica,sans-serif;">${themeLine}\n` +
    `  ${accentBlock(spec.layout.name, spec.palette, escaped)}\n` +
    `</div>`
  );
}

function buildOne(item: Record<string, unknown>, itemNo: number): CoverSpec {
  const boardName = clean(item.boardName);
  const theme = clean(item.theme);
  const brandColorRaw = clean(item.brandColor);

  if (boardName.length === 0) {
    throw new Error(`Item ${itemNo}: board name is required.`);
  }
  if (boardName.length < BOARD_NAME_MIN || boardName.length > BOARD_NAME_MAX) {
    throw new Error(
      `Item ${itemNo}: board name must be ${BOARD_NAME_MIN}-${BOARD_NAME_MAX} characters (got ${boardName.length}).`
    );
  }
  if (theme.length > THEME_MAX) {
    throw new Error(
      `Item ${itemNo}: theme must be ${THEME_MAX} characters or fewer (got ${theme.length}).`
    );
  }

  let customAccent: string | null = null;
  if (brandColorRaw.length > 0) {
    customAccent = parseBrandColor(brandColorRaw, itemNo);
  }

  const h = hash32(boardName.toLowerCase());
  const basePalette = PALETTES[h % PALETTES.length];
  const palette: Palette =
    customAccent !== null ? { ...basePalette, accent: customAccent } : basePalette;
  const typography = TYPOGRAPHY[(h >>> 3) % TYPOGRAPHY.length];
  const layout = LAYOUTS[(h >>> 6) % LAYOUTS.length];

  const spec: CoverSpec = {
    n: itemNo,
    boardName,
    theme: theme.length > 0 ? theme : null,
    palette,
    customAccent,
    typography,
    layout,
    canvas: "800x800",
    brief: "",
    html: "",
  };
  spec.brief = buildBrief(spec);
  spec.html = buildHtml(spec);
  return spec;
}

/**
 * Builder entry point. `args.items` is one object per board:
 * { boardName, theme?, brandColor? }. Returns per-board cover design specs,
 * a combined copy-ready HTML snippet, the cover tips, and the count.
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "No boards to build." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one board to build." };
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
      html: covers.map((c) => c.html).join("\n"),
      count: covers.length,
      coverTips: [...COVER_TIPS],
    },
  };
}
