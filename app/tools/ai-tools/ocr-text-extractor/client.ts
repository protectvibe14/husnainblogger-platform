/**
 * OCR Text Extractor — client.ts (tool-538).
 * Upload an image -> on-device TrOCR (Xenova/trocr-small-printed) ->
 * extracted text + copy / download. Never uploads the image.
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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";
  const cfg = getModelConfig();

  const intro = el("p", "hb-ai-label", "Pick an image with printed text (under 25 MB).");
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";

  const runBtn = el("button", "hb-btn hb-btn--primary", "Extract text") as HTMLButtonElement;
  const progress = el("div", "hb-ai-progress");
  progress.style.display = "none";
  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";

  const resultBox = el("div", "hb-ai-result");
  resultBox.style.display = "none";
  const resultLabel = el("p", "hb-ai-label", "Extracted text");
  const resultPre = el("pre", "");
  resultPre.style.whiteSpace = "pre-wrap";
  const actions = el("div", "hb-ai-actions");
  const copyBtn = el("button", "hb-btn", "Copy") as HTMLButtonElement;
  const dlBtn = el("button", "hb-btn hb-btn--ghost", "Download .txt") as HTMLButtonElement;
  actions.append(copyBtn, dlBtn);
  resultBox.append(resultLabel, resultPre, actions);

  const noteBox = el("p", "hb-ai-label", getDisclosures()[2]);

  host.append(intro, fileInput, runBtn, progress, status, errorBox, resultBox, noteBox);

  const showError = (msg: string): void => {
    errorBox.textContent = msg;
    errorBox.style.display = "";
  };
  const clearError = (): void => {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  };

  runBtn.addEventListener("click", async () => {
    clearError();
    resultBox.style.display = "none";

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
    progress.style.display = "";
    status.textContent = "Loading OCR model (first run downloads ~120 MB)…";

    try {
      const pipe = (await loadPipeline(cfg.task, cfg.id, {
        onProgress: (p) => {
          progress.textContent = "";
          const bar = el("div", "");
          bar.style.height = "8px";
          bar.style.background = "var(--hb-accent, #4c1d95)";
          bar.style.width = `${Math.round(p.fraction * 100)}%`;
          progress.append(bar);
          status.textContent = p.status;
        },
      })) as (input: string, opts?: Record<string, unknown>) => Promise<unknown>;
      status.textContent = "Reading text from your image…";
      const url = URL.createObjectURL(imageFile);
      try {
        const out = (await pipe(url)) as unknown;
        let text = firstGeneratedText(out).trim();
        resultPre.textContent = text || "(no text recognized — try a sharper, better-lit image)";
        resultBox.style.display = "";
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
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      showError(
        err instanceof Error
          ? `OCR failed: ${err.message}`
          : "OCR failed — please try a different image.",
      );
    } finally {
      progress.style.display = "none";
      runBtn.disabled = false;
    }
  });
}
