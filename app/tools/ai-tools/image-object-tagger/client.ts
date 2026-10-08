/**
 * Image Object Tagger — client.ts (tool-541).
 * Upload a photo -> on-device ViT image classifier
 * (Xenova/vit-base-patch16-224) -> top-8 labels with confidence bars.
 * Never uploads the image.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import { validateInputs, getModelConfig, getDisclosures, normalizeTags, TOP_K } from "./logic.ts";

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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";
  const cfg = getModelConfig();

  const intro = el("p", "hb-ai-label", "Pick a photo to tag (under 25 MB).");
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";

  const runBtn = el("button", "hb-btn hb-btn--primary", "Tag objects") as HTMLButtonElement;
  const progress = el("div", "hb-ai-progress");
  progress.style.display = "none";
  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";

  const resultBox = el("div", "hb-ai-result");
  resultBox.style.display = "none";
  const resultLabel = el("p", "hb-ai-label", `Top ${TOP_K} predicted labels`);
  const tagList = el("div", "");
  resultBox.append(resultLabel, tagList);

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
    tagList.innerHTML = "";

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
    status.textContent = "Loading classifier (first run downloads ~70 MB)…";

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
      status.textContent = "Analyzing your photo…";
      const url = URL.createObjectURL(imageFile);
      try {
        const out = (await pipe(url, { top_k: TOP_K })) as unknown;
        const tags = normalizeTags(out, TOP_K);
        if (tags.length === 0) {
          tagList.append(el("p", "hb-ai-label", "No labels returned — try another photo."));
        } else {
          for (const t of tags) {
            const row = el("div", "");
            row.style.marginBottom = "8px";
            const name = el("span", "hb-ai-label", t.label);
            const pct = el("span", "hb-ai-label", ` ${(t.score * 100).toFixed(1)}%`);
            const track = el("div", "");
            track.style.height = "8px";
            track.style.background = "rgba(127,127,127,0.25)";
            track.style.borderRadius = "4px";
            const fill = el("div", "");
            fill.style.height = "8px";
            fill.style.borderRadius = "4px";
            fill.style.background = "var(--hb-accent, #4c1d95)";
            fill.style.width = `${Math.max(2, Math.round(t.score * 100))}%`;
            track.append(fill);
            row.append(name, pct, track);
            tagList.append(row);
          }
        }
        resultBox.style.display = "";
        status.textContent = "Done. Scores are model confidence, not certainty.";
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      showError(
        err instanceof Error
          ? `Tagging failed: ${err.message}`
          : "Tagging failed — please try a different image.",
      );
    } finally {
      progress.style.display = "none";
      runBtn.disabled = false;
    }
  });
}
