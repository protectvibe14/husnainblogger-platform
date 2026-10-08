/**
 * SVG Logo Composer — pure logic (tool-546), zero imports, zero network,
 * zero DOM.
 *
 * HONESTY CONTRACT: builds a REAL, working SVG from geometric primitives
 * (circles, polygons, paths, text) — no image generation, no AI, no
 * templates copied from anywhere. Every coordinate is computed in code.
 * The SVG is valid standalone markup: it renders in any browser and can be
 * saved as a .svg file.
 */

export type ShapeId = "circle" | "shield" | "hexagon" | "badge";
export type StyleId = "initial" | "wordmark";

export interface Palette {
  id: string;
  label: string;
  bg: string;
  fg: string;
  accent: string;
}

export const SHAPES: { id: ShapeId; label: string }[] = [
  { id: "circle", label: "Circle" },
  { id: "shield", label: "Shield" },
  { id: "hexagon", label: "Hexagon" },
  { id: "badge", label: "Badge" },
];

export const PALETTES: Palette[] = [
  { id: "ocean", label: "Ocean", bg: "#0ea5e9", fg: "#ffffff", accent: "#fbbf24" },
  { id: "sunset", label: "Sunset", bg: "#f97316", fg: "#ffffff", accent: "#1e293b" },
  { id: "forest", label: "Forest", bg: "#16a34a", fg: "#ffffff", accent: "#fef08a" },
  { id: "mono", label: "Mono", bg: "#111827", fg: "#f9fafb", accent: "#9ca3af" },
  { id: "neon", label: "Neon", bg: "#0f172a", fg: "#a5f3fc", accent: "#22d3ee" },
  { id: "royal", label: "Royal", bg: "#4c1d95", fg: "#ffffff", accent: "#f0abfc" },
];

export const STYLES: { id: StyleId; label: string }[] = [
  { id: "initial", label: "Monogram (initials)" },
  { id: "wordmark", label: "Wordmark (full text)" },
];

export const SHAPE_LABEL_TO_ID: Record<string, ShapeId> = {
  Circle: "circle",
  Shield: "shield",
  Hexagon: "hexagon",
  Badge: "badge",
};
export const PALETTE_LABEL_TO_ID: Record<string, string> = {
  Ocean: "ocean",
  Sunset: "sunset",
  Forest: "forest",
  Mono: "mono",
  Neon: "neon",
  Royal: "royal",
};
export const STYLE_LABEL_TO_ID: Record<string, StyleId> = {
  "Monogram (initials)": "initial",
  "Wordmark (full text)": "wordmark",
};

export const MAX_BRAND_CHARS = 20;

/** XML-escape text for safe embedding in SVG. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** First letters of the first two words, uppercased ("Blue Finch" -> "BF"). */
export function initialsOf(brand: string): string {
  const words = brand.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase());
  return initials.join("") || "?";
}

/** Flat-top hexagon points centered at (cx,cy) with radius r. */
function hexagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = Math.round((cx + r * Math.cos(angle)) * 10) / 10;
    const y = Math.round((cy + r * Math.sin(angle)) * 10) / 10;
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";

function textEl(
  content: string,
  fontSize: number,
  fill: string,
  y: number,
  letterSpacing = 0,
): string {
  const ls = letterSpacing > 0 ? ` letter-spacing="${letterSpacing}"` : "";
  return (
    `<text x="100" y="${y}" text-anchor="middle" dominant-baseline="central"` +
    ` font-family="${FONT_STACK}" font-size="${fontSize}" font-weight="700"` +
    ` fill="${fill}"${ls}>${escapeXml(content)}</text>`
  );
}

/**
 * Compose the SVG markup. Pure geometry — every coordinate computed here.
 * viewBox is 200x200; output is a complete standalone <svg> document.
 */
export function composeSvg(
  brand: string,
  shape: ShapeId,
  palette: Palette,
  style: StyleId,
): string {
  const label = style === "initial" ? initialsOf(brand) : brand.trim();
  const fontSize =
    style === "initial"
      ? 76
      : Math.max(18, Math.min(44, Math.floor(190 / Math.max(1, label.length * 0.62))));
  const ls = style === "wordmark" ? 2 : 4;

  let body = "";
  if (shape === "circle") {
    body =
      `<circle cx="100" cy="100" r="92" fill="${palette.bg}"/>` +
      `<circle cx="100" cy="100" r="78" fill="none" stroke="${palette.accent}" stroke-width="4"/>` +
      textEl(label, fontSize, palette.fg, 104, ls);
  } else if (shape === "shield") {
    body =
      `<path d="M100 12 L168 38 V102 C168 144 138 170 100 188 C62 170 32 144 32 102 V38 Z" fill="${palette.bg}"/>` +
      `<path d="M100 26 L154 47 V100 C154 133 130 156 100 171 C70 156 46 133 46 100 V47 Z" fill="none" stroke="${palette.accent}" stroke-width="4"/>` +
      textEl(label, fontSize, palette.fg, 100, ls);
  } else if (shape === "hexagon") {
    body =
      `<polygon points="${hexagonPoints(100, 100, 92)}" fill="${palette.bg}"/>` +
      `<polygon points="${hexagonPoints(100, 100, 78)}" fill="none" stroke="${palette.accent}" stroke-width="4"/>` +
      textEl(label, fontSize, palette.fg, 104, ls);
  } else {
    // badge: accent outer ring, bg inner disc, star dots top/bottom
    body =
      `<circle cx="100" cy="100" r="94" fill="${palette.accent}"/>` +
      `<circle cx="100" cy="100" r="80" fill="${palette.bg}"/>` +
      `<circle cx="100" cy="34" r="5" fill="${palette.bg}"/>` +
      `<circle cx="100" cy="166" r="5" fill="${palette.bg}"/>` +
      textEl(label, fontSize, palette.fg, 104, ls);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" ` +
    `width="200" height="200" role="img" aria-label="${escapeXml(brand.trim())} logo">` +
    body +
    `</svg>`
  );
}

/** Slug for the download filename: "Blue Finch" -> "blue-finch-logo.svg". */
export function downloadName(brand: string): string {
  const slug =
    brand
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "logo";
  return `${slug}-logo.svg`;
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.brandText: string, required, 1..MAX_BRAND_CHARS.
 * values.shape / values.palette / values.style: select labels (or ids).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawBrand = values["brandText"];
  if (rawBrand === undefined || rawBrand === null || rawBrand === "") {
    return { ok: false, error: "Please enter your brand name or initials." };
  }
  if (typeof rawBrand !== "string") {
    return { ok: false, error: "Brand text must be text." };
  }
  const brand = rawBrand.replace(/\s+/g, " ").trim();
  if (brand.length === 0) {
    return { ok: false, error: "Please enter your brand name or initials." };
  }
  if (brand.length > MAX_BRAND_CHARS) {
    return {
      ok: false,
      error: `Keep the brand text to ${MAX_BRAND_CHARS} characters or fewer.`,
    };
  }

  const shapeRaw = typeof values["shape"] === "string" ? values["shape"] : "";
  const shape: ShapeId | null =
    shapeRaw in SHAPE_LABEL_TO_ID
      ? SHAPE_LABEL_TO_ID[shapeRaw]
      : (["circle", "shield", "hexagon", "badge"] as ShapeId[]).includes(shapeRaw as ShapeId)
        ? (shapeRaw as ShapeId)
        : null;
  if (!shape) return { ok: false, error: "Please choose a shape." };

  const paletteRaw = typeof values["palette"] === "string" ? values["palette"] : "";
  const paletteId =
    paletteRaw in PALETTE_LABEL_TO_ID ? PALETTE_LABEL_TO_ID[paletteRaw] : paletteRaw;
  const palette = PALETTES.find((p) => p.id === paletteId) ?? null;
  if (!palette) return { ok: false, error: "Please choose a color palette." };

  const styleRaw = typeof values["style"] === "string" ? values["style"] : "";
  const style: StyleId | null =
    styleRaw in STYLE_LABEL_TO_ID
      ? STYLE_LABEL_TO_ID[styleRaw]
      : (["initial", "wordmark"] as StyleId[]).includes(styleRaw as StyleId)
        ? (styleRaw as StyleId)
        : null;
  if (!style) return { ok: false, error: "Please choose a text style." };

  const svg = composeSvg(brand, shape, palette, style);
  return {
    ok: true,
    values: {
      svg,
      downloadName: downloadName(brand),
      shape,
      palette: palette.label,
      style,
      initials: initialsOf(brand),
      honestyNote:
        "Geometric logo built from SVG primitives in your browser — a clean starting mark, not a professionally designed identity.",
    },
  };
}
