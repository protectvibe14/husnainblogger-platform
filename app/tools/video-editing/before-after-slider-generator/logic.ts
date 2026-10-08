/**
 * Before/After Slider Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY: this tool generates EMBED CODE ONLY. It does not process, host,
 * upload, or store any image. The generated snippet references two image URLs
 * the user supplies (placeholders YOUR_BEFORE_IMAGE_URL / YOUR_AFTER_IMAGE_URL
 * are left in the markup for the user to replace). No AI is involved — the
 * snippets are fixed templates with the user's labels, orientation, and start
 * position filled in. Fully deterministic: same inputs → identical snippets.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - LAYOUTS: 2 fixed layouts driven by the `orientation` input
 *   (horizontal | vertical). Orientation changes which CSS/JS axis the
 *   templates emit — no other layout variation exists.
 * - HANDLE_STYLES: 4 fixed handle/transition presets (circle | ring | arrows |
 *   neon). All four are emitted inside the CSS bank with a comment explaining
 *   the switch; the markup activates "circle" by default via a data-style
 *   attribute. The drag transition itself is fixed (direct pointer-follow,
 *   no animation) for every preset.
 * - Total bank: 2 layouts + 4 handle presets = 6 fixed style strings.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Fixed handle-style bank. Every style is emitted in the CSS; "circle" is active by default. */
export const HANDLE_STYLES: string[] = ["circle", "ring", "arrows", "neon"];

/** Placeholder tokens the generated HTML leaves for the user's own image URLs. */
export const PLACEHOLDER_BEFORE = "YOUR_BEFORE_IMAGE_URL";
export const PLACEHOLDER_AFTER = "YOUR_AFTER_IMAGE_URL";

export const MAX_LABEL_CHARS = 40;
export const MIN_START_PCT = 5;
export const MAX_START_PCT = 95;
export const DEFAULT_START_PCT = 50;

/** Escape user text before it is interpolated into the generated snippets. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isOrientation(v: unknown): v is "horizontal" | "vertical" {
  return v === "horizontal" || v === "vertical";
}

function coerceNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function buildHtml(
  orientation: "horizontal" | "vertical",
  startPct: number,
  labelBefore: string,
  labelAfter: string,
): string {
  return `<!-- Before/After slider embed.
  1) Replace ${PLACEHOLDER_BEFORE} and ${PLACEHOLDER_AFTER} with your own image URLs.
     This tool does NOT host or process images.
  2) Paste the CSS snippet in a <style> tag and the JS snippet before </body>.
  3) Switch handle style: change data-style="${HANDLE_STYLES[0]}" to one of: ${HANDLE_STYLES.join(" | ")}. -->
<div class="hb-ba" data-orientation="${orientation}" data-style="${HANDLE_STYLES[0]}" style="--hb-pos:${startPct}%">
  <img class="hb-ba-img hb-ba-after" src="${PLACEHOLDER_AFTER}" alt="${escapeHtml(labelAfter)}">
  <div class="hb-ba-before">
    <img class="hb-ba-img" src="${PLACEHOLDER_BEFORE}" alt="${escapeHtml(labelBefore)}">
  </div>
  <div class="hb-ba-handle" role="slider" tabindex="0"
       aria-label="Reveal slider" aria-valuemin="0" aria-valuemax="100"
       aria-valuenow="${startPct}">
    <span class="hb-ba-knob">&#8596;</span>
  </div>
  <span class="hb-ba-tag hb-ba-tag-before">${escapeHtml(labelBefore)}</span>
  <span class="hb-ba-tag hb-ba-tag-after">${escapeHtml(labelAfter)}</span>
</div>`;
}

function buildCss(vertical: boolean): string {
  const axis = vertical ? "vertical" : "horizontal";
  const clip = vertical
    ? "inset(0 0 calc(100% - var(--hb-pos, 50%)) 0)"
    : "inset(0 calc(100% - var(--hb-pos, 50%)) 0 0)";
  const linePos = vertical
    ? "left: 0; right: 0; top: var(--hb-pos, 50%); height: 2px; margin-top: -1px;"
    : "top: 0; bottom: 0; left: var(--hb-pos, 50%); width: 2px; margin-left: -1px;";
  const knobPos = vertical ? "left: 50%; top: 50%;" : "top: 50%; left: 50%;";
  return `/* Before/After slider styles (${axis} layout).
   Handle styles bank: ${HANDLE_STYLES.join(" | ")}.
   The markup uses data-style="circle" — change it on the .hb-ba element
   to "ring", "arrows", or "neon" to switch presets. No other files needed. */
.hb-ba { position: relative; overflow: hidden; max-width: 100%;
  aspect-ratio: 16 / 9; background: #111; user-select: none; touch-action: none; }
.hb-ba-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.hb-ba-before { position: absolute; inset: 0; z-index: 1; clip-path: ${clip}; }
.hb-ba-handle { position: absolute; z-index: 3; background: #fff; cursor: ${vertical ? "ns" : "ew"}-resize; ${linePos} }
.hb-ba-knob { position: absolute; transform: translate(-50%, -50%); ${knobPos}
  width: 44px; height: 44px; border-radius: 50%;
  background: #fff; color: #111; font-size: 20px; line-height: 44px; text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,.4); }
/* --- handle style presets (fixed bank; switch via data-style) --- */
.hb-ba[data-style="ring"] .hb-ba-knob { background: transparent; color: #fff; border: 3px solid #fff; }
.hb-ba[data-style="arrows"] .hb-ba-knob { border-radius: 8px; background: #111; color: #fff; }
.hb-ba[data-style="neon"] .hb-ba-knob { background: #0ff; color: #003; box-shadow: 0 0 14px #0ff; }
.hb-ba-tag { position: absolute; z-index: 2; top: 10px; padding: 4px 10px;
  background: rgba(0,0,0,.55); color: #fff; font: 600 13px/1.4 system-ui, sans-serif;
  border-radius: 4px; pointer-events: none; }
.hb-ba-tag-before { left: 10px; }
.hb-ba-tag-after { right: 10px; }`;
}

function buildJs(vertical: boolean): string {
  const dim = vertical ? "height" : "width";
  const clientAxis = vertical ? "clientY" : "clientX";
  return `/* Before/After slider drag logic (no dependencies).
   Works for the ${vertical ? "vertical" : "horizontal"} layout emitted above.
   Transition behavior is fixed: the divider follows the pointer directly
   (no animation). Keyboard: focus the handle and use arrow keys. */
(function () {
  var root = document.querySelector(".hb-ba");
  if (!root) return;
  var vertical = root.getAttribute("data-orientation") === "vertical";
  var handle = root.querySelector(".hb-ba-handle");
  function setPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    root.style.setProperty("--hb-pos", pct + "%");
    if (handle) handle.setAttribute("aria-valuenow", String(Math.round(pct)));
  }
  function fromEvent(e) {
    var r = root.getBoundingClientRect();
    var pos = vertical
      ? ((e.${clientAxis} - r.top) / r.${dim}) * 100
      : ((e.${clientAxis} - r.left) / r.${dim}) * 100;
    setPos(pos);
  }
  var dragging = false;
  root.addEventListener("pointerdown", function (e) { dragging = true; root.setPointerCapture(e.pointerId); fromEvent(e); });
  root.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
  root.addEventListener("pointerup", function () { dragging = false; });
  root.addEventListener("pointercancel", function () { dragging = false; });
  if (handle) handle.addEventListener("keydown", function (e) {
    var cur = parseFloat(getComputedStyle(root).getPropertyValue("--hb-pos")) || 50;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") setPos(cur - 2);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") setPos(cur + 2);
  });
})();`;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const labelBeforeRaw = values["labelBefore"];
  const labelAfterRaw = values["labelAfter"];
  const orientation = values["orientation"];

  if (typeof labelBeforeRaw !== "string" || labelBeforeRaw.trim() === "") {
    return { ok: false, error: "Please enter a label for the BEFORE image." };
  }
  if (typeof labelAfterRaw !== "string" || labelAfterRaw.trim() === "") {
    return { ok: false, error: "Please enter a label for the AFTER image." };
  }
  const labelBefore = labelBeforeRaw.trim();
  const labelAfter = labelAfterRaw.trim();
  if (labelBefore.length > MAX_LABEL_CHARS) {
    return { ok: false, error: `The BEFORE label must be ${MAX_LABEL_CHARS} characters or fewer.` };
  }
  if (labelAfter.length > MAX_LABEL_CHARS) {
    return { ok: false, error: `The AFTER label must be ${MAX_LABEL_CHARS} characters or fewer.` };
  }
  if (!isOrientation(orientation)) {
    return { ok: false, error: "Please choose an orientation: horizontal or vertical." };
  }

  let startPct = DEFAULT_START_PCT;
  if (values["startPct"] !== undefined && values["startPct"] !== null && values["startPct"] !== "") {
    const n = coerceNumber(values["startPct"]);
    if (n === null) {
      return { ok: false, error: "Start position must be a number." };
    }
    if (n < MIN_START_PCT || n > MAX_START_PCT) {
      return { ok: false, error: `Start position must be between ${MIN_START_PCT} and ${MAX_START_PCT}.` };
    }
    startPct = n;
  }

  const vertical = orientation === "vertical";
  const htmlSnippet = buildHtml(orientation, startPct, labelBefore, labelAfter);
  const cssSnippet = buildCss(vertical);
  const jsSnippet = buildJs(vertical);
  const embedParams =
    `orientation=${orientation}; startPct=${startPct}; labels: "${labelBefore}" / "${labelAfter}"; ` +
    `image placeholders: ${PLACEHOLDER_BEFORE}, ${PLACEHOLDER_AFTER} (replace with your own URLs — this tool hosts no images); ` +
    `handle style bank: ${HANDLE_STYLES.length} presets (${HANDLE_STYLES.join(", ")}), default "${HANDLE_STYLES[0]}"`;

  return {
    ok: true,
    values: { htmlSnippet, cssSnippet, jsSnippet, embedParams },
  };
}
