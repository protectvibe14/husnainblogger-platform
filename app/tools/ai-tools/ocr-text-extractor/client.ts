/**
 * client.ts — OCR Text Extractor (redesigned).
 *
 * Flow: drag-drop upload zone with image preview (or one-click
 * generated sample) -> on-device TrOCR (Xenova/trocr-small-printed)
 * -> extracted text card with copy / download. Never uploads the image.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import { validateInputs, getModelConfig, getDisclosures } from "./logic.ts";

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

/** Extract generated_text from image-to-text output (array or single object). */
function firstGeneratedText(out: unknown): string {
  const item = Array.isArray(out) ? out[0] : out;
  if (
    item !== null &&
    typeof item === "object" &&
    typeof (item as { generated_text?: unknown }).generated_text === "string"
  ) {
    return (item as { generated_text: string }).generated_text;
  }
  return "";
}

/** Build a small sample image (canvas-rendered text) so users can try OCR instantly. */
function makeSampleImage(): Promise<File> {
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 240;
  const x = c.getContext("2d");
  if (!x) return Promise.reject(new Error("Could not create the sample image."));
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, 800, 240);
  x.fillStyle = "#111827";
  x.textAlign = "center";
  x.font = "bold 58px Georgia, serif";
  x.fillText("HusnainBlogger", 400, 96);
  x.font = "34px Georgia, serif";
  x.fillText("Free AI tools that run in your browser.", 400, 162);
  x.font = "26px Georgia, serif";
  x.fillStyle = "#374151";
  x.fillText("Upload any photo of printed text to try OCR.", 400, 208);
  return new Promise((resolve, reject) => {
    c.toBlob((b) => {
      if (!b) {
        reject(new Error("Could not create the sample image."));
        return;
      }
      resolve(new File([b], "ocr-sample.png", { type: "image/png" }));
    }, "image/png");
  });
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";
  const cfg = getModelConfig();

  const style = document.createElement("style");
  style.textContent = `
    .hb-ocr-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-ocr-header {
      background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-ocr-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-ocr-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-ocr-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-ocr-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .hb-ocr-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease; background: #f8fafc;
    }
    .hb-ocr-drop:hover, .hb-ocr-drop.hb-ocr-dragover { border-color: #0891b2; background: #ecfeff; }
    .hb-ocr-drop.hb-ocr-has-image { padding: 12px; }
    .hb-ocr-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-ocr-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-ocr-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-ocr-preview { max-width: 100%; max-height: 240px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-ocr-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-ocr-change { font-size: 13px; color: #0891b2; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 4px; }
    .hb-ocr-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-ocr-generate:hover:not(:disabled) { opacity: .92; }
    .hb-ocr-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-ocr-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-ocr-progress > div { height: 100%; background: linear-gradient(90deg, #0d9488, #0891b2); width: 0%; transition: width .3s; }
    .hb-ocr-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-ocr-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-ocr-result {
      background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
      border-radius: 14px; padding: 20px; border: 1px solid #99f6e4;
    }
    .hb-ocr-result pre {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 14px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;
      word-break: break-word; color: #1e293b; font-family: inherit; margin: 0 0 14px;
      max-height: 320px; overflow-y: auto;
    }
    .hb-ocr-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .hb-ocr-btn {
      padding: 11px 22px; border-radius: 10px; font-size: 15px; font-weight: 700;
      cursor: pointer; border: none;
    }
    .hb-ocr-btn-primary { background: #0d9488; color: #fff; }
    .hb-ocr-btn-primary:hover { background: #0f766e; }
    .hb-ocr-btn-ghost { background: #fff; color: #0d9488; border: 2px solid #99f6e4; }
    .hb-ocr-btn-ghost:hover { background: #f0fdfa; }
    .hb-ocr-note { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.6; }
    .hb-ocr-sample { font-size: 13px; color: #0891b2; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px; }
    @media (max-width: 640px) { .hb-ocr-header { padding: 18px; } }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-ocr-wrap");
  host.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-ocr-header");
  header.appendChild(el("h3", "", "📄 OCR Text Extractor"));
  header.appendChild(el("p", "", "Pull printed text out of any image — scanned pages, screenshots, signs. 100% on your device, never uploaded."));
  wrap.appendChild(header);

  // --- upload card ------------------------------------------------------------
  const upCard = el("div", "hb-ocr-card");
  upCard.appendChild(el("label", "hb-ocr-label", "🖼️ Your image"));
  const drop = el("div", "hb-ocr-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload an image: drag and drop, or press Enter to browse");
  const icon = el("div", "hb-ocr-icon", "📷");
  const title = el("p", "hb-ocr-title", "Drop your image here");
  const sub = el("p", "hb-ocr-sub", "or click to browse — JPG, PNG, WEBP up to 25 MB");
  drop.append(icon, title, sub);
  upCard.appendChild(drop);
  const fileInput = el("input", "") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  upCard.appendChild(fileInput);
  const sampleBtn = el("button", "hb-ocr-sample", "✨ No image handy? Try a sample");
  sampleBtn.type = "button";
  upCard.appendChild(sampleBtn);
  wrap.appendChild(upCard);

  // --- action -------------------------------------------------------------------
  const genBtn = el("button", "hb-ocr-generate", "🔍 Extract text") as HTMLButtonElement;
  genBtn.type = "button";
  genBtn.disabled = true;
  wrap.appendChild(genBtn);

  const progress = el("div", "hb-ocr-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  const progressBar = el("div", "");
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el("p", "hb-ocr-status");
  wrap.appendChild(status);

  const errorBox = el("div", "hb-ocr-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- result ---------------------------------------------------------------------
  const resultBox = el("div", "hb-ocr-result");
  resultBox.hidden = true;
  resultBox.appendChild(el("p", "hb-ocr-label", "📝 Extracted text"));
  const resultPre = el("pre", "");
  resultBox.appendChild(resultPre);
  const actions = el("div", "hb-ocr-actions");
  const copyBtn = el("button", "hb-ocr-btn hb-ocr-btn-primary", "Copy") as HTMLButtonElement;
  copyBtn.type = "button";
  const dlBtn = el("button", "hb-ocr-btn hb-ocr-btn-ghost", "Download .txt") as HTMLButtonElement;
  dlBtn.type = "button";
  actions.append(copyBtn, dlBtn);
  resultBox.appendChild(actions);
  wrap.appendChild(resultBox);

  const note = el("p", "hb-ocr-note", getDisclosures().join(" "));
  wrap.appendChild(note);

  // --- state ----------------------------------------------------------------------
  let file: File | null = null;
  let objectUrl: string | null = null;

  function showDropPreview(url: string, name: string): void {
    drop.classList.add("hb-ocr-has-image");
    drop.innerHTML = "";
    const preview = document.createElement("img");
    preview.src = url;
    preview.className = "hb-ocr-preview";
    preview.alt = "Selected image preview";
    const fname = el("p", "hb-ocr-filename", name);
    const change = el("button", "hb-ocr-change", "Choose a different image");
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
    genBtn.disabled = false;
    status.textContent = "Image ready — click “Extract text”.";
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
    drop.classList.add("hb-ocr-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-ocr-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-ocr-dragover");
    pickFile(e.dataTransfer?.files?.[0] ?? null);
  });
  fileInput.addEventListener("change", () => pickFile(fileInput.files?.[0] ?? null));

  sampleBtn.addEventListener("click", () => {
    makeSampleImage()
      .then((f) => pickFile(f))
      .catch((err: unknown) => {
        errorBox.textContent = err instanceof Error ? err.message : "Could not create the sample image.";
        errorBox.hidden = false;
      });
  });

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    resultBox.hidden = true;
  }

  function setProgress(fraction: number, label: string): void {
    progress.hidden = false;
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    progressBar.style.width = pct + "%";
    status.textContent = label;
  }

  genBtn.addEventListener("click", () => {
    void (async () => {
      errorBox.hidden = true;
      resultBox.hidden = true;
      const imageFile = file;
      const check = validateInputs({
        fileName: imageFile?.name,
        fileSizeMb: imageFile ? imageFile.size / (1024 * 1024) : undefined,
      });
      if (!check.ok || !imageFile) {
        showError(check.error ?? "Please choose an image file first.");
        return;
      }

      genBtn.disabled = true;
      const origLabel = genBtn.textContent;
      genBtn.textContent = "Working…";

      try {
        const pipe = (await loadPipeline(cfg.task, cfg.id, {
          onProgress: (p) => {
            setProgress(p.fraction < 0 ? 0 : p.fraction, p.status);
          },
        })) as (input: string, opts?: Record<string, unknown>) => Promise<unknown>;
        setProgress(0.95, "Reading text from your image…");
        const url = URL.createObjectURL(imageFile);
        try {
          const out = (await pipe(url)) as unknown;
          const text = firstGeneratedText(out).trim();
          resultPre.textContent = text || "(no text recognized — try a sharper, better-lit image)";
          resultBox.hidden = false;
          progress.hidden = true;
          status.textContent = "Done.";

          copyBtn.onclick = async () => {
            try {
              await navigator.clipboard.writeText(text);
              copyBtn.textContent = "Copied!";
              setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
            } catch {
              showError("Copy failed — select the text manually.");
            }
          };
          dlBtn.onclick = () => {
            const blob = new Blob([text], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "ocr-text.txt";
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          };
          resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } finally {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        progress.hidden = true;
        showError(
          err instanceof Error
            ? `OCR failed: ${err.message}`
            : "OCR failed — please try a different image.",
        );
      } finally {
        progressBar.style.width = "0%";
        genBtn.disabled = false;
        genBtn.textContent = origLabel;
      }
    })();
  });
}
