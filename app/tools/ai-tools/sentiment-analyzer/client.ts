/**
 * Sentiment Analyzer — client.ts (tool-542).
 * Paste text -> on-device DistilBERT SST-2 classifier ->
 * POSITIVE/NEGATIVE verdict with confidence bars. Never uploads the text.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  normalizeSentiment,
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

function scoreBar(score: number): HTMLElement {
  const track = el("div", "");
  track.style.height = "10px";
  track.style.background = "rgba(127,127,127,0.25)";
  track.style.borderRadius = "5px";
  track.style.margin = "4px 0 10px";
  const fill = el("div", "");
  fill.style.height = "10px";
  fill.style.borderRadius = "5px";
  fill.style.background = "var(--hb-accent, #4c1d95)";
  fill.style.width = `${Math.max(2, Math.round(score * 100))}%`;
  track.append(fill);
  return track;
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";
  const cfg = getModelConfig();

  const intro = el("p", "hb-ai-label", "Paste English text (up to 5,000 characters).");
  const textArea = el("textarea", "hb-ai-textarea") as HTMLTextAreaElement;
  textArea.rows = 5;
  textArea.placeholder = "Paste a review, comment or message…";

  const runBtn = el("button", "hb-btn hb-btn--primary", "Analyze sentiment") as HTMLButtonElement;
  const progress = el("div", "hb-ai-progress");
  progress.style.display = "none";
  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";

  const resultBox = el("div", "hb-ai-result");
  resultBox.style.display = "none";
  const verdict = el("p", "hb-ai-label", "");
  verdict.style.fontSize = "1.25em";
  const posLabel = el("p", "hb-ai-label", "Positive");
  const negLabel = el("p", "hb-ai-label", "Negative");
  resultBox.append(verdict, posLabel, negLabel);

  const noteBox = el("p", "hb-ai-label", getDisclosures()[2]);

  host.append(intro, textArea, runBtn, progress, status, errorBox, resultBox, noteBox);

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

    const check = validateInputs({ text: textArea.value });
    if (!check.ok) {
      showError(check.error ?? "Please enter the text to analyze.");
      return;
    }
    const text = textArea.value.trim();

    runBtn.disabled = true;
    progress.style.display = "";
    status.textContent = "Loading classifier (first run downloads ~67 MB)…";

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
      status.textContent = "Analyzing…";
      const out = (await pipe(text, { top_k: 2 })) as unknown;
      const result = normalizeSentiment(out);
      if (!result) {
        showError("The classifier returned no usable result — please try again.");
        return;
      }
      verdict.textContent = `${result.label} (${(result.score * 100).toFixed(1)}%)`;
      // Rebuild bars after the labels.
      for (const old of Array.from(resultBox.querySelectorAll("[data-bar]"))) old.remove();
      const posBar = scoreBar(result.positive);
      posBar.setAttribute("data-bar", "");
      const negBar = scoreBar(result.negative);
      negBar.setAttribute("data-bar", "");
      posLabel.after(posBar);
      negLabel.after(negBar);
      resultBox.style.display = "";
      status.textContent = "Done. Binary sentiment only — not sarcasm-proof.";
    } catch (err) {
      showError(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : "Analysis failed — please try again.",
      );
    } finally {
      progress.style.display = "none";
      runBtn.disabled = false;
    }
  });
}
