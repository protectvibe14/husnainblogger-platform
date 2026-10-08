/**
 * Meme Caption Maker — pure logic (tool-294). Zero imports, zero DOM,
 * zero network, zero randomness.
 *
 * HONEST SCOPE: the logic produces a meme SPEC {template, texts, font,
 * layout} plus svgPreviewParams for the UI — it does NOT render an image.
 * Actual rasterization happens in the page's canvas/SVG preview from the
 * emitted spec. This is a template-engine builder, not AI.
 *
 * Fixed template bank (6 entries). Each template defines font, colors,
 * text placement, and the base font size for a 1080x1080 canvas:
 *   1. classic-top-bottom — Impact, white fill + black stroke; top text at
 *      8% height, bottom text at 88%; base size 64.
 *   2. modern-minimal     — bold sans (Arial/Helvetica), white, bottom
 *      third centered block; base size 56.
 *   3. top-only           — like classic but a single top caption; base 64.
 *   4. bottom-only        — like classic but a single bottom caption; base 64.
 *   5. demotivator        — black frame, Georgia serif; title 48 centered
 *      at 62% height, subtitle 28 at 72%; base 48.
 *   6. split-caption      — two stacked caption panels (setup / punchline);
 *      base 48.
 *
 * Text rules:
 *   - topText / bottomText each ≤ 120 chars (validation error otherwise).
 *   - At least one of topText/bottomText must be non-empty.
 *   - Templates that need a specific caption (top-only needs topText,
 *     bottom-only needs bottomText) error when it is missing.
 *   - Auto-shrink: any caption longer than 60 chars scales its font size
 *     proportionally (base * 60 / chars), floored at 24px, and a note is
 *     added to the spec line. Short text never shrinks.
 *   - style must be "classic" or "modern" (case-insensitive); defaults to
 *     "classic". "modern" switches the font stack to a bold rounded sans
 *     and drops the stroke on classic templates.
 *
 * Outputs per run: summary (text), memeSpecs (human-readable list),
 * svgParams (list of key=value;... strings the UI preview consumes),
 * exportJson (download — full spec objects).
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface MemeTemplate {
  id: string;
  label: string;
  fontStack: string;
  fill: string;
  stroke: string | null;
  baseSize: number;
  layout: string;
  requiresTop: boolean;
  requiresBottom: boolean;
}

/** Fixed template bank — 6 entries. */
export const TEMPLATES: MemeTemplate[] = [
  {
    id: "classic-top-bottom",
    label: "Classic top + bottom",
    fontStack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    fill: "#FFFFFF",
    stroke: "#000000",
    baseSize: 64,
    layout: "top-bottom",
    requiresTop: false,
    requiresBottom: false,
  },
  {
    id: "modern-minimal",
    label: "Modern minimal",
    fontStack: "'Arial Black', Arial, Helvetica, sans-serif",
    fill: "#FFFFFF",
    stroke: null,
    baseSize: 56,
    layout: "bottom-block",
    requiresTop: false,
    requiresBottom: false,
  },
  {
    id: "top-only",
    label: "Top caption only",
    fontStack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    fill: "#FFFFFF",
    stroke: "#000000",
    baseSize: 64,
    layout: "top-only",
    requiresTop: true,
    requiresBottom: false,
  },
  {
    id: "bottom-only",
    label: "Bottom caption only",
    fontStack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    fill: "#FFFFFF",
    stroke: "#000000",
    baseSize: 64,
    layout: "bottom-only",
    requiresTop: false,
    requiresBottom: true,
  },
  {
    id: "demotivator",
    label: "Demotivator frame",
    fontStack: "Georgia, 'Times New Roman', serif",
    fill: "#FFFFFF",
    stroke: null,
    baseSize: 48,
    layout: "demotivator",
    requiresTop: false,
    requiresBottom: false,
  },
  {
    id: "split-caption",
    label: "Split caption (setup / punchline)",
    fontStack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    fill: "#FFFFFF",
    stroke: "#000000",
    baseSize: 48,
    layout: "split",
    requiresTop: false,
    requiresBottom: false,
  },
];

export const VALID_STYLES = ["classic", "modern"] as const;

const MAX_TEXT_LEN = 120;
const SHRINK_THRESHOLD = 60;
const MIN_FONT_SIZE = 24;
const CANVAS = "1080x1080";

function escParam(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/=/g, "\\=");
}

/** Proportional shrink for long captions; returns { size, shrunk }. */
function fitSize(base: number, text: string): { size: number; shrunk: boolean } {
  if (text.length <= SHRINK_THRESHOLD) return { size: base, shrunk: false };
  const scaled = Math.floor((base * SHRINK_THRESHOLD) / text.length);
  return { size: Math.max(MIN_FONT_SIZE, scaled), shrunk: true };
}

interface MemeSpec {
  item: number;
  template: string;
  templateLabel: string;
  topText: string;
  bottomText: string;
  font: string;
  fontSize: number;
  fill: string;
  stroke: string | null;
  layout: string;
  style: string;
  canvas: string;
  notes: string[];
}

export function runTool(args: { items: Record<string, unknown>[] }): ToolResult {
  if (!args || !Array.isArray(args.items) || args.items.length === 0) {
    return {
      ok: false,
      error: "Add at least one meme to build (template, captions, style).",
    };
  }

  const specs: MemeSpec[] = [];
  const specLines: string[] = [];
  const svgParams: string[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    const label = `Item ${i + 1}`;

    const templateRaw =
      typeof item.template === "string" ? item.template.trim().toLowerCase() : "";
    const template =
      TEMPLATES.find((t) => t.id === templateRaw) ??
      TEMPLATES.find((t) => t.label.toLowerCase() === templateRaw);
    if (!template) {
      return {
        ok: false,
        error: `${label}: template must be one of: ${TEMPLATES.map((t) => t.id).join(", ")}.`,
      };
    }

    const topText = typeof item.topText === "string" ? item.topText.trim() : "";
    const bottomText = typeof item.bottomText === "string" ? item.bottomText.trim() : "";
    if (topText.length > MAX_TEXT_LEN || bottomText.length > MAX_TEXT_LEN) {
      return {
        ok: false,
        error: `${label}: captions must be ${MAX_TEXT_LEN} characters or fewer each.`,
      };
    }
    if (topText === "" && bottomText === "") {
      return {
        ok: false,
        error: `${label}: enter at least one caption (top or bottom text).`,
      };
    }
    if (template.requiresTop && topText === "") {
      return {
        ok: false,
        error: `${label}: the "${template.id}" template needs top text.`,
      };
    }
    if (template.requiresBottom && bottomText === "") {
      return {
        ok: false,
        error: `${label}: the "${template.id}" template needs bottom text.`,
      };
    }

    const styleRaw =
      typeof item.style === "string" && item.style.trim() !== ""
        ? item.style.trim().toLowerCase()
        : "classic";
    if (!(VALID_STYLES as readonly string[]).includes(styleRaw)) {
      return {
        ok: false,
        error: `${label}: style must be "classic" or "modern".`,
      };
    }

    const notes: string[] = [];
    const topFit = fitSize(template.baseSize, topText);
    const bottomFit = fitSize(template.baseSize, bottomText);
    const fontSize = Math.min(topFit.size, bottomFit.size);
    if (topFit.shrunk || bottomFit.shrunk) {
      notes.push(`caption over ${SHRINK_THRESHOLD} chars — font auto-shrunk to ${fontSize}px`);
    }
    const font =
      styleRaw === "modern"
        ? "'Trebuchet MS', Verdana, sans-serif"
        : template.fontStack;
    const stroke = styleRaw === "modern" ? null : template.stroke;

    specs.push({
      item: i + 1,
      template: template.id,
      templateLabel: template.label,
      topText,
      bottomText,
      font,
      fontSize,
      fill: template.fill,
      stroke,
      layout: template.layout,
      style: styleRaw,
      canvas: CANVAS,
      notes,
    });

    const noteStr = notes.length > 0 ? ` (${notes.join("; ")})` : "";
    specLines.push(
      `Meme ${i + 1}: "${template.label}" [${template.layout}] — top: "${topText || "—"}" / bottom: "${bottomText || "—"}" — ${fontSize}px ${styleRaw}${noteStr}`
    );

    const paramPairs = [
      `template=${template.id}`,
      `top=${escParam(topText)}`,
      `bottom=${escParam(bottomText)}`,
      `font=${escParam(font)}`,
      `fontSize=${fontSize}`,
      `fill=${template.fill}`,
      `stroke=${stroke ?? "none"}`,
      `layout=${template.layout}`,
      `style=${styleRaw}`,
      `canvas=${CANVAS}`,
    ];
    svgParams.push(paramPairs.join(";"));
  }

  const summary =
    `${specs.length} meme spec${specs.length === 1 ? "" : "s"} ready — ` +
    "render them in the page preview or export the JSON. " +
    "This tool builds the spec; the image itself is drawn by the preview (canvas).";

  return {
    ok: true,
    values: {
      summary,
      memeSpecs: specLines,
      svgParams,
      exportJson: JSON.stringify(specs, null, 2),
    },
  };
}
