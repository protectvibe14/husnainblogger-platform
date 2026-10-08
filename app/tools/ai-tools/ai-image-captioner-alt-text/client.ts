/**
 * AI Image Captioner & Alt Text — client.ts (tool-540).
 * Upload an image -> on-device ViT-GPT2 captioning
 * (Xenova/vit-gpt2-image-captioning) -> caption + <=125-char alt text
 * with copy buttons. Never uploads the image.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import { validateInputs, getModelConfig, getDisclosures, toAltText } from "./logic.ts";

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

  const intro = el("p", "hb-ai-label", "Pick an image to describe (under 25 MB).");
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";

  const runBtn = el("button", "hb-btn hb-btn--primary", "Generate caption") as HTMLButtonElement;
  const progress = el("div", "hb-ai-progress");
  progress.style.display = "none";
  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";

  const resultBox = el("div", "hb-ai-result");
  resultBox.style.display = "none";
  const captionLabel = el("p", "hb-ai-label", "Caption");
  const captionText = el("p", "");
  const altLabel = el("p", "hb-ai-label", "Alt text (≤125 chars)");
  const altText = el("p", "");
  const actions = el("div", "hb-ai-actions");
  const copyCaptionBtn = el("button", "hb-btn", "Copy caption") as HTMLButtonElement;
  const copyAltBtn = el("button", "hb-btn hb-btn--ghost", "Copy alt text") as HTMLButtonElement;
  actions.append(copyCaptionBtn, copyAltBtn);
  resultBox.append(captionLabel, captionText, altLabel, altText, actions);

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

  const flashCopied = (btn: HTMLButtonElement, label: string): void => {
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = label), 1500);
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
    status.textContent = "Loading captioning model (first run downloads ~350 MB)…";

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
      status.textContent = "Describing your image…";
      const url = URL.createObjectURL(imageFile);
      try {
        const out = (await pipe(url)) as unknown;
        const caption = firstGeneratedText(out).trim();
        const alt = toAltText(caption);
        captionText.textContent = caption || "(no caption generated — try another image)";
        altText.textContent = alt || "—";
        resultBox.style.display = "";
        status.textContent = "Done. Review the wording before publishing.";

        copyCaptionBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(caption);
            flashCopied(copyCaptionBtn, "Copy caption");
          } catch {
            showError("Copy failed — select the text manually.");
          }
        };
        copyAltBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(alt);
            flashCopied(copyAltBtn, "Copy alt text");
          } catch {
            showError("Copy failed — select the text manually.");
          }
        };
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      showError(
        err instanceof Error
          ? `Captioning failed: ${err.message}`
          : "Captioning failed — please try a different image.",
      );
    } finally {
      progress.style.display = "none";
      runBtn.disabled = false;
    }
  });
}
