/**
 * Old Photo Restorer — client.ts (tool-539).
 * Upload a scan -> classic filters (auto-contrast, gray-world fade
 * correction, median dust reduction, optional 2x upscale) -> before/after
 * preview + PNG download. No model, no network — honest filters only.
 */
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  validateInputs,
  computeContrastLut,
  grayWorldGains,
  medianFilter3x3,
  getDisclosures,
  MAX_DIM,
} from "./logic.ts";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

/** Apply the selected filters to src canvas, drawing the result into dst. */
function applyFilters(
  src: HTMLCanvasElement,
  dst: HTMLCanvasElement,
  opts: { contrast: boolean; fade: boolean; dust: boolean; upscale: boolean },
): void {
  const w = src.width;
  const h = src.height;
  const sctx = src.getContext("2d")!;
  const data = sctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Channel stats for contrast + white balance.
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  const n = w * h;
  for (let i = 0; i < n; i++) {
    const r = px[i * 4];
    const g = px[i * 4 + 1];
    const b = px[i * 4 + 2];
    rs.push(r);
    gs.push(g);
    bs.push(b);
    sumR += r;
    sumG += g;
    sumB += b;
  }
  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);

  const lutR = opts.contrast ? computeContrastLut(percentile(rs, 1), percentile(rs, 99)) : null;
  const lutG = opts.contrast ? computeContrastLut(percentile(gs, 1), percentile(gs, 99)) : null;
  const lutB = opts.contrast ? computeContrastLut(percentile(bs, 1), percentile(bs, 99)) : null;
  const gains = opts.fade ? grayWorldGains(sumR / n, sumG / n, sumB / n) : null;

  for (let i = 0; i < n; i++) {
    let r = px[i * 4];
    let g = px[i * 4 + 1];
    let b = px[i * 4 + 2];
    if (lutR && lutG && lutB) {
      r = lutR[r];
      g = lutG[g];
      b = lutB[b];
    }
    if (gains) {
      r = Math.min(255, Math.max(0, Math.round(r * gains[0])));
      g = Math.min(255, Math.max(0, Math.round(g * gains[1])));
      b = Math.min(255, Math.max(0, Math.round(b * gains[2])));
    }
    px[i * 4] = r;
    px[i * 4 + 1] = g;
    px[i * 4 + 2] = b;
  }

  if (opts.dust) {
    // Median-filter a grayscale copy and blend it back at 50% to soften specks.
    const gray: number[][] = [];
    for (let y = 0; y < h; y++) {
      const row: number[] = [];
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        row.push(Math.round((px[i] + px[i + 1] + px[i + 2]) / 3));
      }
      gray.push(row);
    }
    const med = medianFilter3x3(gray, w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const m = med[y][x];
        const g0 = Math.round((px[i] + px[i + 1] + px[i + 2]) / 3);
        const t = Math.min(1, Math.abs(g0 - m) / 60); // only soften outlier pixels
        const k = 0.5 * t;
        px[i] = Math.round(px[i] * (1 - k) + m * k);
        px[i + 1] = Math.round(px[i + 1] * (1 - k) + m * k);
        px[i + 2] = Math.round(px[i + 2] * (1 - k) + m * k);
      }
    }
  }
  sctx.putImageData(data, 0, 0);

  if (opts.upscale) {
    // 2x upscale via drawImage (bilinear) — fast path for the canvas pipeline.
    const big = document.createElement("canvas");
    big.width = w * 2;
    big.height = h * 2;
    const bctx = big.getContext("2d")!;
    bctx.imageSmoothingEnabled = true;
    bctx.imageSmoothingQuality = "high";
    bctx.drawImage(src, 0, 0, big.width, big.height);
    dst.width = big.width;
    dst.height = big.height;
    dst.getContext("2d")!.drawImage(big, 0, 0);
  } else {
    dst.width = w;
    dst.height = h;
    dst.getContext("2d")!.drawImage(src, 0, 0);
  }
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";

  const intro = el("p", "hb-ai-label", "Pick a scanned photo (under 25 MB).");
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";

  const optsBox = el("div", "");
  const checks: { box: HTMLInputElement; key: "contrast" | "fade" | "dust" | "upscale"; label: string }[] = [
    { box: el("input", "") as HTMLInputElement, key: "contrast", label: "Auto-contrast" },
    { box: el("input", "") as HTMLInputElement, key: "fade", label: "Fade correction" },
    { box: el("input", "") as HTMLInputElement, key: "dust", label: "Dust & scratch reduction" },
    { box: el("input", "") as HTMLInputElement, key: "upscale", label: "2x upscale" },
  ];
  for (const c of checks) {
    c.box.type = "checkbox";
    c.box.checked = c.key !== "upscale";
    const wrap = el("label", "hb-ai-label", "");
    wrap.append(c.box, document.createTextNode(" " + c.label));
    optsBox.append(wrap);
  }

  const runBtn = el("button", "hb-btn hb-btn--primary", "Enhance photo") as HTMLButtonElement;
  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";

  const beforeCanvas = document.createElement("canvas");
  const afterCanvas = document.createElement("canvas");
  for (const c of [beforeCanvas, afterCanvas]) {
    c.style.maxWidth = "100%";
    c.style.height = "auto";
  }
  const preview = el("div", "hb-ai-result");
  preview.style.display = "none";
  const beforeWrap = el("div", "", "");
  beforeWrap.append(el("p", "hb-ai-label", "Before"), beforeCanvas);
  const afterWrap = el("div", "", "");
  afterWrap.append(el("p", "hb-ai-label", "After"), afterCanvas);
  const dlBtn = el("button", "hb-btn hb-btn--ghost", "Download PNG") as HTMLButtonElement;
  preview.append(beforeWrap, afterWrap, dlBtn);

  const noteBox = el("p", "hb-ai-label", getDisclosures()[0]);

  host.append(intro, fileInput, optsBox, runBtn, status, errorBox, preview, noteBox);

  const showError = (msg: string): void => {
    errorBox.textContent = msg;
    errorBox.style.display = "";
  };

  runBtn.addEventListener("click", () => {
    errorBox.style.display = "none";
    preview.style.display = "none";
    const file = fileInput.files?.[0];
    const check = validateInputs({
      fileName: file?.name,
      fileSizeMb: file ? file.size / (1024 * 1024) : undefined,
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose a photo first.");
      return;
    }
    status.textContent = "Loading photo…";
    const url = URL.createObjectURL(file as File);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      beforeCanvas.width = Math.round(img.width * scale);
      beforeCanvas.height = Math.round(img.height * scale);
      const bctx = beforeCanvas.getContext("2d")!;
      bctx.drawImage(img, 0, 0, beforeCanvas.width, beforeCanvas.height);

      // Work on a copy so "before" stays untouched.
      const work = document.createElement("canvas");
      work.width = beforeCanvas.width;
      work.height = beforeCanvas.height;
      work.getContext("2d")!.drawImage(beforeCanvas, 0, 0);

      status.textContent = "Applying filters…";
      const opts = {
        contrast: checks[0].box.checked,
        fade: checks[1].box.checked,
        dust: checks[2].box.checked,
        upscale: checks[3].box.checked,
      };
      // Yield so the status paints before the heavy loop.
      setTimeout(() => {
        try {
          applyFilters(work, afterCanvas, opts);
          preview.style.display = "";
          status.textContent = "Done — these are classic filters, not AI restoration.";
          dlBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = afterCanvas.toDataURL("image/png");
            a.download = "enhanced-photo.png";
            document.body.append(a);
            a.click();
            a.remove();
          };
        } catch (err) {
          showError(err instanceof Error ? err.message : "Enhancement failed.");
        }
      }, 30);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showError("Could not read that image — please try another file.");
    };
    img.src = url;
  });
}
