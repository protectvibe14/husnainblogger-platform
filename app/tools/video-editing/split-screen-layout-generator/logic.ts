/**
 * Split-Screen Layout Generator — pure logic (tool-295). Zero imports,
 * zero DOM, zero network, zero randomness.
 *
 * HONEST SCOPE: pure rectangle-subdivision math (geometry only). It
 * computes integer-pixel pane rectangles for a canvas, plus a CSS grid
 * snippet and SVG preview parameters the UI uses to draw the preview.
 * Nothing is rendered by this file.
 *
 * Fixed canvas presets per aspect ratio:
 *   16:9 -> 1920x1080 · 9:16 -> 1080x1920 · 1:1 -> 1080x1080 · 4:3 -> 1600x1200
 *
 * Fixed arrangement bank (4 entries):
 *   side-by-side: N equal vertical columns, full height.
 *   stacked:      N equal horizontal rows, full width.
 *   grid:         2 panes -> side-by-side if landscape else stacked;
 *                 3 panes -> top row of 2 panes + 1 full-width bottom pane;
 *                 4 panes -> 2x2.
 *   pip:          pane 1 is full-canvas; panes 2..N are overlays stacked
 *                 along the right edge, each 28% of canvas width at 16:9
 *                 (margins = gapPx, or 16px when gap is 0). Overlays render
 *                 above the main pane (higher z-order) — noted in output.
 *
 * Pixel math: widths/heights are computed with exact division, floored,
 * and the leftover remainder pixels go to the LAST pane in the row/column
 * (deterministic, no gaps). gapPx >= 0; coordinates rounded to integers.
 *
 * Warnings (guidance, not errors): any pane narrower than 280px, or a
 * sliver narrower than half its height, warns ("panes get tiny") — this
 * catches e.g. 3 panes side-by-side on 9:16. PiP always adds a z-order note.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface PaneRect {
  pane: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  label: string;
}

export const ARRANGEMENTS = ["side-by-side", "stacked", "grid", "pip"] as const;
export const ASPECTS = ["16:9", "9:16", "1:1", "4:3"] as const;

const CANVAS: Record<(typeof ASPECTS)[number], { w: number; h: number }> = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
  "1:1": { w: 1080, h: 1080 },
  "4:3": { w: 1600, h: 1200 },
};

const TINY_PANE_PX = 280;
const PIP_WIDTH_RATIO = 0.28;

function toNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Split `total` px into n segments separated by `gap`, remainder to last. */
function split(total: number, n: number, gap: number): number[] {
  const usable = total - gap * (n - 1);
  const base = Math.floor(usable / n);
  const sizes: number[] = [];
  let assigned = 0;
  for (let i = 0; i < n; i++) {
    if (i === n - 1) sizes.push(total - assigned - gap * (n - 1));
    else {
      sizes.push(base);
      assigned += base;
    }
  }
  return sizes;
}

function layoutPanes(
  panes: number,
  arrangement: string,
  canvas: { w: number; h: number },
  gap: number
): PaneRect[] {
  const { w: W, h: H } = canvas;
  const rects: PaneRect[] = [];
  const push = (pane: number, x: number, y: number, w: number, h: number, z = 1, label = "") =>
    rects.push({ pane, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), z, label: label || `Pane ${pane}` });

  if (arrangement === "side-by-side" || (arrangement === "grid" && panes === 2 && W >= H)) {
    const widths = split(W, panes, gap);
    let x = 0;
    for (let i = 0; i < panes; i++) {
      push(i + 1, x, 0, widths[i], H);
      x += widths[i] + gap;
    }
  } else if (arrangement === "stacked" || (arrangement === "grid" && panes === 2)) {
    const heights = split(H, panes, gap);
    let y = 0;
    for (let i = 0; i < panes; i++) {
      push(i + 1, 0, y, W, heights[i]);
      y += heights[i] + gap;
    }
  } else if (arrangement === "grid" && panes === 3) {
    const topHeights = split(H, 2, gap);
    const topWidths = split(W, 2, gap);
    push(1, 0, 0, topWidths[0], topHeights[0]);
    push(2, topWidths[0] + gap, 0, topWidths[1], topHeights[0]);
    push(3, 0, topHeights[0] + gap, W, topHeights[1]);
  } else if (arrangement === "grid" && panes === 4) {
    const colW = split(W, 2, gap);
    const rowH = split(H, 2, gap);
    let p = 1;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        push(p, c === 0 ? 0 : colW[0] + gap, r === 0 ? 0 : rowH[0] + gap, colW[c], rowH[r]);
        p++;
      }
    }
  } else if (arrangement === "pip") {
    push(1, 0, 0, W, H, 1, "Pane 1 (main)");
    const margin = gap > 0 ? gap : 16;
    const pipW = Math.round(W * PIP_WIDTH_RATIO);
    const pipH = Math.round((pipW * 9) / 16);
    let y = H - margin - pipH;
    for (let i = 2; i <= panes; i++) {
      push(i, W - margin - pipW, y, pipW, pipH, i, `Pane ${i} (PiP overlay)`);
      y -= pipH + margin;
    }
  }
  return rects;
}

function cssSnippet(arrangement: string, panes: number, gap: number): string {
  const g = `gap: ${gap}px;`;
  if (arrangement === "side-by-side" || (arrangement === "grid" && panes === 2)) {
    return `display: grid;\ngrid-template-columns: repeat(${panes}, 1fr);\n${g}`;
  }
  if (arrangement === "stacked") {
    return `display: grid;\ngrid-template-rows: repeat(${panes}, 1fr);\n${g}`;
  }
  if (arrangement === "grid" && panes === 3) {
    return `display: grid;\ngrid-template-columns: 1fr 1fr;\n${g}\n/* Pane 3 spans both columns: grid-column: 1 / -1; */`;
  }
  if (arrangement === "grid" && panes === 4) {
    return `display: grid;\ngrid-template-columns: 1fr 1fr;\ngrid-template-rows: 1fr 1fr;\n${g}`;
  }
  // pip
  return (
    `position: relative;\n/* Pane 1: absolute inset 0 (main video) */\n` +
    `/* Panes 2+ : position: absolute; right: ${gap}px; bottom: ${gap}px;\n` +
    `   width: 28%; aspect-ratio: 16 / 9; z-index above pane 1 */`
  );
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const panesRaw = toNum(values.panes);
  if (panesRaw === null || !Number.isInteger(panesRaw) || panesRaw < 2 || panesRaw > 4) {
    return { ok: false, error: "Panes must be a whole number from 2 to 4." };
  }
  const panes = panesRaw;

  const arrangement =
    typeof values.arrangement === "string" ? values.arrangement.trim() : "";
  if (!(ARRANGEMENTS as readonly string[]).includes(arrangement)) {
    return {
      ok: false,
      error: `Arrangement must be one of: ${ARRANGEMENTS.join(", ")}.`,
    };
  }

  const aspect = typeof values.canvasAspect === "string" ? values.canvasAspect.trim() : "";
  if (!(ASPECTS as readonly string[]).includes(aspect)) {
    return {
      ok: false,
      error: `Canvas aspect must be one of: ${ASPECTS.join(", ")}.`,
    };
  }
  const canvas = CANVAS[aspect as (typeof ASPECTS)[number]];

  const gapRaw =
    values.gapPx === undefined || values.gapPx === null || values.gapPx === ""
      ? 0
      : toNum(values.gapPx);
  if (gapRaw === null || gapRaw < 0 || !Number.isFinite(gapRaw)) {
    return { ok: false, error: "Gap must be 0 or more pixels." };
  }
  const gap = Math.round(gapRaw);

  const rects = layoutPanes(panes, arrangement, canvas, gap);

  const paneList = rects.map(
    (r) => `${r.label}: x=${r.x}, y=${r.y}, w=${r.w}, h=${r.h}${r.z > 1 ? ` (z-order ${r.z})` : ""}`
  );

  const svgPreview =
    `viewBox="0 0 ${canvas.w} ${canvas.h}" | ` +
    rects.map((r) => `rect(${r.x},${r.y},${r.w},${r.h})`).join(" ");

  const warnings: string[] = [];
  for (const r of rects) {
    if (r.z === 1 && (r.w < TINY_PANE_PX || r.w * 2 < r.h)) {
      warnings.push(
        `Pane ${r.pane} is only ${r.w}px wide on a ${aspect} canvas — tiny on most screens. Use fewer panes, stacked, or a wider canvas.`
      );
    }
  }
  if (arrangement === "pip") {
    warnings.push(
      "PiP panes sit on top of the main pane (higher z-order) — keep captions and faces clear of the overlay corner."
    );
  }

  return {
    ok: true,
    values: {
      paneList,
      cssGridSnippet: cssSnippet(arrangement, panes, gap),
      svgPreview,
      warnings,
    },
  };
}
