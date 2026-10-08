/**
 * Reaction Layout Planner — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY: pure layout rectangles + safe-area rules. No AI, no video
 * analysis — the tool computes facecam (PIP) and content rectangles from
 * fixed geometry rules on a standard canvas and returns planning notes.
 * The rectangles are estimates for laying out your edit; platform UI
 * overlays (TikTok right rail, YouTube end screens) change over time, so
 * the notes say to verify in your editor.
 *
 * Fixed rules (documented per the builder honesty contract):
 * - CANVASES: 2 fixed canvases — "16:9" = 1920x1080, "9:16" = 1080x1920.
 * - FACECAM_SIZES: 3 fixed sizes as a fraction of canvas width —
 *   small 0.22, medium 0.32, large 0.45. Facecam keeps a 16:9 aspect.
 * - MARGIN: fixed 2.5% of canvas width inset from canvas edges.
 * - FACEcam corners: 4 (top-left | top-right | bottom-left | bottom-right).
 * - Platform UI rules (fixed, estimated — layouts change over time):
 *   (a) 9:16 + right-side corner -> TikTok/Shorts right action rail note.
 *   (b) 16:9 + bottom-right -> YouTube end-screen overlap note.
 *   (c) large facecam on 9:16 covering > 5% of the canvas -> warning.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface Canvas {
  w: number;
  h: number;
}

const CANVASES: Record<string, Canvas> = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
};

const VALID_ASPECTS = ["16:9", "9:16"];
const VALID_SIZES = ["small", "medium", "large"];
const VALID_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];

/** Facecam width as a fraction of canvas width (facecam keeps 16:9 aspect). */
const FACECAM_SIZE_FRAC: Record<string, number> = {
  small: 0.22,
  medium: 0.32,
  large: 0.45,
};

const MARGIN_FRAC = 0.025; // 2.5% of canvas width
const LARGE_COVERAGE_WARN_FRAC = 0.05; // warn when facecam covers > 5% of canvas

function fmtRect(label: string, x: number, y: number, w: number, h: number, canvas: Canvas): string {
  return `${label}: x=${x}, y=${y}, w=${w}, h=${h} px (on a ${canvas.w}x${canvas.h} canvas)`;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const canvasAspect = values["canvasAspect"];
  const facecamSize = values["facecamSize"];
  const facecamCorner = values["facecamCorner"];

  if (typeof canvasAspect !== "string" || VALID_ASPECTS.indexOf(canvasAspect) === -1) {
    return { ok: false, error: "Please choose a canvas aspect: 16:9 or 9:16." };
  }
  if (typeof facecamSize !== "string" || VALID_SIZES.indexOf(facecamSize) === -1) {
    return { ok: false, error: "Please choose a facecam size: small, medium, or large." };
  }
  if (typeof facecamCorner !== "string" || VALID_CORNERS.indexOf(facecamCorner) === -1) {
    return { ok: false, error: "Please choose a facecam corner." };
  }

  const canvas = CANVASES[canvasAspect];
  const margin = Math.round(canvas.w * MARGIN_FRAC);
  const fw = Math.round(canvas.w * FACECAM_SIZE_FRAC[facecamSize]);
  const fh = Math.round((fw * 9) / 16);

  let fx = margin;
  let fy = margin;
  if (facecamCorner === "top-right" || facecamCorner === "bottom-right") {
    fx = canvas.w - fw - margin;
  }
  if (facecamCorner === "bottom-left" || facecamCorner === "bottom-right") {
    fy = canvas.h - fh - margin;
  }

  const facecamRect = fmtRect("Facecam", fx, fy, fw, fh, canvas);
  const contentRect = fmtRect("Content (full-bleed, behind facecam)", 0, 0, canvas.w, canvas.h, canvas);

  const coveragePct = ((fw * fh) / (canvas.w * canvas.h)) * 100;
  const coverageStr = coveragePct.toFixed(1);
  const OPPOSITE: Record<string, string> = {
    "top-left": "bottom-right",
    "top-right": "bottom-left",
    "bottom-left": "top-right",
    "bottom-right": "top-left",
  };
  const opposite = OPPOSITE[facecamCorner];

  const notes: string[] = [];
  notes.push(
    `The ${facecamSize} facecam covers about ${coverageStr}% of the canvas over the ${facecamCorner} corner. Keep key subjects of the reacted-to video in the ${opposite} half so the facecam never covers them.`,
  );

  if (facecamSize === "large" && canvasAspect === "9:16" && coveragePct > LARGE_COVERAGE_WARN_FRAC * 100) {
    notes.push(
      `Warning: a large facecam on a vertical canvas eats a lot of the reacted-to content (${coverageStr}% of the frame). Consider "medium" unless your reactions carry the video.`,
    );
  }

  if (canvasAspect === "9:16" && (facecamCorner === "top-right" || facecamCorner === "bottom-right")) {
    notes.push(
      "Safe-area note: TikTok, Reels, and Shorts put the like/comment/share rail on the right edge. A right-side facecam can sit under those buttons — shift it toward the left side or nudge it inward. Platform layouts change over time; verify in the app.",
    );
  }

  if (canvasAspect === "16:9" && facecamCorner === "bottom-right") {
    notes.push(
      "Safe-area note: YouTube end-screen elements appear in the bottom-right during the last ~20 seconds. Keep your facecam out of that corner on the outro, or move it for the final segment.",
    );
  }

  if (canvasAspect === "9:16" && (facecamCorner === "bottom-left" || facecamCorner === "bottom-right")) {
    notes.push(
      "Safe-area note: captions and the progress bar live along the bottom of vertical players — keep the facecam at least a margin above them and keep lower-third text inside the reacted-to footage.",
    );
  }

  notes.push(
    "These rectangles are planning estimates for laying out your edit — measure in your editor before publishing. Platform UI overlays change, so re-check safe areas when you upload.",
  );

  return {
    ok: true,
    values: { facecamRect, contentRect, safeAreaNotes: notes },
  };
}
