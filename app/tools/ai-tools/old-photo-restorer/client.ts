/**
 * Old Photo Restorer — client.ts (redesigned, tool-539).
 * Upload a scan -> drag-drop zone with preview -> classic filters
 * (auto-contrast, gray-world fade correction, median dust reduction,
 * optional 2x upscale) -> before/after comparison + PNG download.
 * No model, no network — honest filters only.
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

  const style = document.createElement("style");
  style.textContent = `
    .hb-rst-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-rst-header {
      background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-rst-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-rst-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-rst-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-rst-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .hb-rst-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease; background: #f8fafc;
    }
    .hb-rst-drop:hover, .hb-rst-drop.hb-rst-dragover { border-color: #d97706; background: #fffbeb; }
    .hb-rst-drop.hb-rst-has-image { padding: 12px; }
    .hb-rst-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-rst-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-rst-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-rst-preview { max-width: 100%; max-height: 240px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-rst-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-rst-change { font-size: 13px; color: #d97706; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 4px; }
    .hb-rst-check {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px;
      cursor: pointer; font-size: 15px; color: #1e293b; background: #fff;
      transition: border-color .15s ease;
    }
    .hb-rst-check:hover { border-color: #d97706; }
    .hb-rst-check input { width: 18px; height: 18px; accent-color: #d97706; cursor: pointer; }
    .hb-rst-check small { display: block; font-size: 12px; color: #64748b; margin-top: 2px; }
    .hb-rst-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-rst-generate:hover:not(:disabled) { opacity: .92; }
    .hb-rst-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-rst-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-rst-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-rst-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .hb-rst-compare { grid-template-columns: 1fr; } }
    .hb-rst-compare figure { margin: 0; }
    .hb-rst-compare canvas {
      width: 100%; border-radius: 10px; border: 1px solid #e2e8f0;
      background: #0f172a; display: block;
    }
    .hb-rst-compare figcaption { font-size: 13px; font-weight: 600; color: #475569; margin-top: 6px; text-align: center; }
    .hb-rst-result {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 14px; padding: 20px; border: 1px solid #fde68a;
    }
    .hb-rst-dl {
      display: inline-block; padding: 12px 28px; background: #d97706; color: #fff;
      border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; border: none; margin-top: 14px;
    }
    .hb-rst-dl:hover { background: #b45309; }
    .hb-rst-note { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.6; }
    @media (max-width: 640px) { .hb-rst-header { padding: 18px; } }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-rst-wrap");
  host.appendChild(wrap);

  // --- header ------------------------------------------------------------------
  const header = el("div", "hb-rst-header");
  header.appendChild(el("h3", "", "🖼️ Old Photo Restorer"));
  header.appendChild(el("p", "", "Clean up faded scans — auto-contrast, fade correction and dust reduction, right in your browser. No AI magic, no uploads."));
  wrap.appendChild(header);

  // --- upload ---------------------------------------------------------------------
  const upCard = el("div", "hb-rst-card");
  upCard.appendChild(el("label", "hb-rst-label", "📸 Your scanned photo"));
  const drop = el("div", "hb-rst-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload a photo: drag and drop, or press Enter to browse");
  const icon = el("div", "hb-rst-icon", "🖼️");
  const title = el("p", "hb-rst-title", "Drop your scanned photo here");
  const sub = el("p", "hb-rst-sub", "or click to browse — JPG, PNG, WEBP up to 25 MB");
  drop.append(icon, title, sub);
  upCard.appendChild(drop);
  const fileInput = el("input", "") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  upCard.appendChild(fileInput);
  wrap.appendChild(upCard);

  // --- options ----------------------------------------------------------------------
  const optCard = el("div", "hb-rst-card");
  optCard.appendChild(el("p", "hb-rst-label", "✨ Enhancements"));
  const checks: {
    box: HTMLInputElement;
    key: "contrast" | "fade" | "dust" | "upscale";
    label: string;
    hint: string;
  }[] = [
    { box: el("input", "") as HTMLInputElement, key: "contrast", label: "Auto-contrast", hint: "Stretches the tonal range so faded photos pop again." },
    { box: el("input", "") as HTMLInputElement, key: "fade", label: "Fade correction", hint: "Neutralizes yellow/brown age cast with gray-world white balance." },
    { box: el("input", "") as HTMLInputElement, key: "dust", label: "Dust & scratch reduction", hint: "Softens specks and small scratches with a smart median filter." },
    { box: el("input", "") as HTMLInputElement, key: "upscale", label: "2× upscale", hint: "Doubles the resolution for sharper prints and shares." },
  ];
  for (const c of checks) {
    c.box.type = "checkbox";
    c.box.checked = c.key !== "upscale";
    const wrapEl = el("label", "hb-rst-check");
    const textWrap = el("span", "");
    textWrap.appendChild(el("span", "", c.label));
    textWrap.appendChild(el("small", "", c.hint));
    wrapEl.append(c.box, textWrap);
    optCard.appendChild(wrapEl);
  }
  wrap.appendChild(optCard);

  // --- action -------------------------------------------------------------------------
  const runBtn = el("button", "hb-rst-generate", "✨ Enhance photo") as HTMLButtonElement;
  runBtn.type = "button";
  runBtn.disabled = true;
  wrap.appendChild(runBtn);

  const status = el("p", "hb-rst-status");
  status.setAttribute("role", "status");
  wrap.appendChild(status);

  const errorBox = el("div", "hb-rst-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- result ---------------------------------------------------------------------------
  const resultBox = el("div", "hb-rst-result");
  resultBox.hidden = true;
  resultBox.appendChild(el("p", "hb-rst-label", "🔍 Before / after"));
  const compare = el("div", "hb-rst-compare");
  const figBefore = document.createElement("figure");
  const beforeCanvas = document.createElement("canvas");
  const capBefore = el("figcaption", "", "Before");
  figBefore.append(beforeCanvas, capBefore);
  const figAfter = document.createElement("figure");
  const afterCanvas = document.createElement("canvas");
  const capAfter = el("figcaption", "", "After");
  figAfter.append(afterCanvas, capAfter);
  compare.append(figBefore, figAfter);
  resultBox.appendChild(compare);
  const dlBtn = el("button", "hb-rst-dl", "⬇ Download PNG") as HTMLButtonElement;
  dlBtn.type = "button";
  resultBox.appendChild(dlBtn);
  wrap.appendChild(resultBox);

  const note = el("p", "hb-rst-note", getDisclosures().join(" "));
  wrap.appendChild(note);

  // --- state -----------------------------------------------------------------------------
  let file: File | null = null;
  let objectUrl: string | null = null;

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    resultBox.hidden = true;
  }

  function showDropPreview(url: string, name: string): void {
    drop.classList.add("hb-rst-has-image");
    drop.innerHTML = "";
    const preview = document.createElement("img");
    preview.src = url;
    preview.className = "hb-rst-preview";
    preview.alt = "Selected photo preview";
    const fname = el("p", "hb-rst-filename", name);
    const change = el("button", "hb-rst-change", "Choose a different photo");
    change.type = "button";
    change.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.append(preview, fname, change);
  }

  function pickFile(f: File | null): void {
    errorBox.hidden = true;
    resultBox.hidden = true;
    if (!f) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    file = f;
    objectUrl = URL.createObjectURL(f);
    showDropPreview(objectUrl, f.name);
    runBtn.disabled = false;
    status.textContent = "Photo ready — pick your enhancements and click “Enhance photo”.";
  }

  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("hb-rst-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-rst-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-rst-dragover");
    pickFile(e.dataTransfer?.files?.[0] ?? null);
  });
  fileInput.addEventListener("change", () => pickFile(fileInput.files?.[0] ?? null));

  runBtn.addEventListener("click", () => {
    errorBox.hidden = true;
    resultBox.hidden = true;
    const chosen = file;
    const check = validateInputs({
      fileName: chosen?.name,
      fileSizeMb: chosen ? chosen.size / (1024 * 1024) : undefined,
    });
    if (!check.ok || !chosen) {
      showError(check.error ?? "Please choose a photo first.");
      return;
    }
    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = "Working…";
    status.textContent = "Loading photo…";
    const url = URL.createObjectURL(chosen);
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
          resultBox.hidden = false;
          status.textContent = "Done — classic filters applied. This is enhancement, not AI restoration.";
          resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
        } finally {
          runBtn.disabled = false;
          runBtn.textContent = origLabel;
        }
      }, 30);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
      showError("Could not read that image — please try another file.");
    };
    img.src = url;
  });
}
