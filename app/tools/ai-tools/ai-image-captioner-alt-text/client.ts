/**
 * AI Image Captioner & Alt Text — client.ts (tool-540), Lane A (redesigned).
 *
 * Flow: gradient header -> upload card with live preview ->
 * big gradient Generate button -> progress + status -> result card
 * with Caption + Alt-text cards and copy buttons.
 *
 * Upload an image -> on-device ViT-GPT2 captioning
 * (Xenova/vit-gpt2-image-captioning) -> caption + <=125-char alt text.
 * Never uploads the image. User data rendered via textContent only.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import { validateInputs, getModelConfig, getDisclosures, toAltText, MAX_FILE_MB } from "./logic.ts";

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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";
  const cfg = getModelConfig();

  // --- styles ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-ic-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-ic-header {
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-ic-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-ic-header p { margin: 0; font-size: 14px; opacity: .9; }
    .hb-ic-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-ic-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-ic-drop {
      border: 2px dashed #9aa4b2; border-radius: 12px; padding: 32px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-ic-drop:hover, .hb-ic-drop.hb-ic-dragover {
      border-color: #10b981; background: #ecfdf5;
    }
    .hb-ic-drop-icon { font-size: 38px; margin-bottom: 8px; }
    .hb-ic-drop-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-ic-drop-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-ic-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: #10b981; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-ic-browse:hover { background: #059669; }
    .hb-ic-preview { max-width: 100%; max-height: 240px; border-radius: 10px; margin: 12px auto 0; display: block; }
    .hb-ic-filename { font-size: 13px; color: #475569; margin: 8px 0 0; text-align: center; word-break: break-all; }
    .hb-ic-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-ic-generate:hover:not(:disabled) { opacity: .92; }
    .hb-ic-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-ic-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-ic-progress > div {
      height: 100%; background: linear-gradient(90deg, #10b981, #0d9488);
      width: 0%; transition: width .3s;
    }
    .hb-ic-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-ic-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-ic-result-card {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%);
      border-radius: 14px; padding: 20px;
    }
    .hb-ic-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-ic-out { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
    .hb-ic-out h4 { margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #0d9488; }
    .hb-ic-out p { margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #1e293b; }
    .hb-ic-out button {
      padding: 10px 20px; background: #10b981; color: #fff; border: none;
      border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .hb-ic-out button:hover { background: #059669; }
    .hb-ic-note { font-size: 13px; color: #64748b; margin: 0; }
    @media (max-width: 640px) {
      .hb-ic-header { padding: 18px; }
      .hb-ic-header h3 { font-size: 18px; }
      .hb-ic-card, .hb-ic-result-card { padding: 16px; }
      .hb-ic-drop { padding: 24px 14px; }
    }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-ic-wrap");
  host.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-ic-header");
  header.appendChild(el("h3", "", "🖼️ AI Image Captioner & Alt Text"));
  header.appendChild(el("p", "", cfg.notes + " — runs 100% in your browser, your image is never uploaded."));
  wrap.appendChild(header);

  // --- upload card ----------------------------------------------------------
  const uploadCard = el("div", "hb-ic-card");
  uploadCard.appendChild(el("label", "hb-ic-label", "📤 Your image *"));
  const drop = el("div", "hb-ic-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload an image: drag and drop, or press Enter to browse");
  drop.appendChild(el("div", "hb-ic-drop-icon", "🖼️"));
  drop.appendChild(el("p", "hb-ic-drop-title", "Drag & drop your image here"));
  drop.appendChild(el("p", "hb-ic-drop-sub", "or click to browse — JPG, PNG, WEBP up to " + MAX_FILE_MB + " MB"));
  const browseBtn = el("button", "hb-ic-browse", "Choose image") as HTMLButtonElement;
  browseBtn.type = "button";
  drop.appendChild(browseBtn);
  const preview = el("img", "hb-ic-preview") as HTMLImageElement;
  preview.hidden = true;
  preview.alt = "Selected image preview";
  drop.appendChild(preview);
  const fileName = el("p", "hb-ic-filename");
  drop.appendChild(fileName);
  const fileInput = el("input", "") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  uploadCard.appendChild(drop);
  wrap.appendChild(uploadCard);

  // --- generate -------------------------------------------------------------
  const runBtn = el("button", "hb-ic-generate", "✨ Generate caption") as HTMLButtonElement;
  runBtn.type = "button";
  runBtn.disabled = true;
  wrap.appendChild(runBtn);

  const progress = el("div", "hb-ic-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  const progressBar = el("div", "");
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el("p", "hb-ic-status");
  status.setAttribute("role", "status");
  wrap.appendChild(status);

  const errorBox = el("div", "hb-ic-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- result ---------------------------------------------------------------
  const resultBox = el("div", "hb-ic-result-card");
  resultBox.hidden = true;
  resultBox.appendChild(el("p", "hb-ic-result-title", "✨ Caption & alt text"));
  const captionOut = el("div", "hb-ic-out");
  captionOut.appendChild(el("h4", "", "Caption"));
  const captionText = el("p", "");
  captionOut.appendChild(captionText);
  const copyCaptionBtn = el("button", "", "📋 Copy caption") as HTMLButtonElement;
  copyCaptionBtn.type = "button";
  captionOut.appendChild(copyCaptionBtn);
  const altOut = el("div", "hb-ic-out");
  altOut.appendChild(el("h4", "", "Alt text (≤125 chars)"));
  const altText = el("p", "");
  altOut.appendChild(altText);
  const copyAltBtn = el("button", "", "📋 Copy alt text") as HTMLButtonElement;
  copyAltBtn.type = "button";
  altOut.appendChild(copyAltBtn);
  resultBox.append(captionOut, altOut);
  wrap.appendChild(resultBox);

  const note = el("p", "hb-ic-note", getDisclosures()[2]);
  wrap.appendChild(note);

  // --- helpers --------------------------------------------------------------
  let previewUrl: string | null = null;

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function clearError(): void {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }
  function setProgress(fraction: number, label: string): void {
    progress.hidden = false;
    progressBar.style.width = Math.max(0, Math.min(100, Math.round(fraction * 100))) + "%";
    status.textContent = label;
  }
  function hideProgress(): void {
    progress.hidden = true;
    progressBar.style.width = "0%";
  }
  const flashCopied = (btn: HTMLButtonElement, label: string): void => {
    btn.textContent = "Copied ✓";
    setTimeout(() => (btn.textContent = label), 1500);
  };

  function pickFile(f: File | undefined | null): void {
    clearError();
    resultBox.hidden = true;
    if (!f) return;
    const check = validateInputs({
      fileName: f.name,
      fileSizeMb: f.size / (1024 * 1024),
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose an image file first.");
      runBtn.disabled = true;
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(f);
    preview.src = previewUrl;
    preview.hidden = false;
    fileName.textContent = f.name;
    runBtn.disabled = false;
    status.textContent = 'Image ready — click "Generate caption".';
  }

  drop.addEventListener("click", (e) => {
    if (e.target !== fileInput) fileInput.click();
  });
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("hb-ic-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-ic-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-ic-dragover");
    pickFile(e.dataTransfer?.files?.[0] ?? null);
  });
  fileInput.addEventListener("change", () => pickFile(fileInput.files?.[0] ?? null));

  // --- run ------------------------------------------------------------------
  runBtn.addEventListener("click", async () => {
    clearError();
    resultBox.hidden = true;

    const file = fileInput.files?.[0];
    const check = validateInputs({
      fileName: file?.name,
      fileSizeMb: file ? file.size / (1024 * 1024) : undefined,
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose an image file first.");
      return;
    }
    const imageFile = file as File;

    runBtn.disabled = true;
    setProgress(0.05, "Loading captioning model (first run downloads ~350 MB)…");
    try {
      const pipe = (await loadPipeline(cfg.task, cfg.id, {
        onProgress: (p) => setProgress(p.fraction < 0 ? 0 : p.fraction, p.status),
      })) as (input: string, opts?: Record<string, unknown>) => Promise<unknown>;
      setProgress(0.9, "Describing your image…");
      const url = URL.createObjectURL(imageFile);
      try {
        const out = (await pipe(url)) as unknown;
        const caption = firstGeneratedText(out).trim();
        const alt = toAltText(caption);
        captionText.textContent = caption || "(no caption generated — try another image)";
        altText.textContent = alt || "—";
        resultBox.hidden = false;
        setProgress(1, "Done.");
        hideProgress();
        status.textContent = "Done. Review the wording before publishing.";
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

        copyCaptionBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(caption);
            flashCopied(copyCaptionBtn, "📋 Copy caption");
          } catch {
            showError("Copy failed — select the text manually.");
          }
        };
        copyAltBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(alt);
            flashCopied(copyAltBtn, "📋 Copy alt text");
          } catch {
            showError("Copy failed — select the text manually.");
          }
        };
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      hideProgress();
      showError(
        err instanceof Error
          ? `Captioning failed: ${err.message}`
          : "Captioning failed — please try a different image.",
      );
    } finally {
      runBtn.disabled = false;
    }
  });
}
