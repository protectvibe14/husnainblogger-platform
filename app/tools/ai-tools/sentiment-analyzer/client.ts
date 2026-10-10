/**
 * Sentiment Analyzer — client.ts (tool-542, redesigned).
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
  MAX_TEXT_CHARS,
} from "./logic.ts";

const SAMPLE_TEXT =
  "This is by far the best purchase I have made this year. The quality is amazing and the support team was incredibly helpful. Highly recommended!";

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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-snt-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-snt-header {
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-snt-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-snt-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-snt-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-snt-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-snt-textarea {
      width: 100%; min-height: 130px; padding: 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box; color: #1e293b;
    }
    .hb-snt-textarea:focus { outline: none; border-color: #10b981; }
    .hb-snt-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-snt-sample {
      font-size: 13px; color: #0d9488; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-snt-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-snt-generate:hover:not(:disabled) { opacity: .92; }
    .hb-snt-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-snt-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-snt-progress > div {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #10b981, #0d9488);
      transition: width .3s;
    }
    .hb-snt-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-snt-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-snt-result {
      border-radius: 14px; padding: 22px; text-align: center;
    }
    .hb-snt-result--pos {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
    }
    .hb-snt-result--neg {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid #fecaca;
    }
    .hb-snt-verdict { font-size: 28px; font-weight: 800; margin: 0 0 4px; }
    .hb-snt-result--pos .hb-snt-verdict { color: #047857; }
    .hb-snt-result--neg .hb-snt-verdict { color: #b91c1c; }
    .hb-snt-conf { font-size: 14px; color: #475569; margin: 0 0 14px; }
    .hb-snt-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .hb-snt-bar-name { font-size: 13px; font-weight: 700; color: #334155; min-width: 64px; text-align: left; }
    .hb-snt-bar-track { flex: 1; height: 12px; background: rgba(127,127,127,.22); border-radius: 6px; overflow: hidden; }
    .hb-snt-bar-fill { height: 100%; border-radius: 6px; transition: width .4s ease; }
    .hb-snt-bar-fill--pos { background: linear-gradient(90deg, #10b981, #34d399); }
    .hb-snt-bar-fill--neg { background: linear-gradient(90deg, #ef4444, #f87171); }
    .hb-snt-bar-pct { font-size: 13px; font-weight: 700; color: #475569; min-width: 48px; text-align: right; }
    .hb-snt-note { font-size: 13px; color: #64748b; margin: 0; text-align: center; }
    @media (max-width: 640px) {
      .hb-snt-header { padding: 18px; }
      .hb-snt-verdict { font-size: 24px; }
    }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-snt-wrap");
  host.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el("div", "hb-snt-header");
  header.appendChild(el("h3", "", "😊 Sentiment Analyzer"));
  header.appendChild(
    el("p", "", "Positive or negative? Paste text and get an instant verdict — on-device, nothing uploaded."),
  );
  wrap.appendChild(header);

  // --- input card ---------------------------------------------------------------
  const inputCard = el("div", "hb-snt-card");
  const textLabel = el("label", "hb-snt-label", "✍️ Text to analyze (English, up to 5,000 characters)");
  textLabel.htmlFor = "hb-snt-text";
  inputCard.appendChild(textLabel);
  const textArea = el("textarea", "hb-snt-textarea") as HTMLTextAreaElement;
  textArea.id = "hb-snt-text";
  textArea.rows = 5;
  textArea.placeholder = "Paste a review, comment or message…";
  inputCard.appendChild(textArea);
  const count = el("p", "hb-snt-count", "0 / " + MAX_TEXT_CHARS.toLocaleString("en-US"));
  inputCard.appendChild(count);
  const sampleBtn = el("button", "hb-snt-sample", "✨ Try a sample review");
  sampleBtn.type = "button";
  sampleBtn.addEventListener("click", () => {
    textArea.value = SAMPLE_TEXT;
    textArea.dispatchEvent(new Event("input"));
  });
  inputCard.appendChild(sampleBtn);
  wrap.appendChild(inputCard);

  // --- analyze --------------------------------------------------------------------
  const runBtn = el("button", "hb-snt-generate", "🔍 Analyze sentiment") as HTMLButtonElement;
  wrap.appendChild(runBtn);

  const progress = el("div", "hb-snt-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  const progressBar = el("div", "");
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el("p", "hb-snt-status");
  status.setAttribute("role", "status");
  wrap.appendChild(status);

  const errorBox = el("div", "hb-snt-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- result ----------------------------------------------------------------------
  const resultBox = el("div", "hb-snt-result hb-snt-result--pos");
  resultBox.hidden = true;
  const verdict = el("p", "hb-snt-verdict", "");
  const conf = el("p", "hb-snt-conf", "");
  resultBox.append(verdict, conf);

  const posRow = el("div", "hb-snt-bar-row");
  posRow.appendChild(el("span", "hb-snt-bar-name", "Positive"));
  const posTrack = el("div", "hb-snt-bar-track");
  const posFill = el("div", "hb-snt-bar-fill hb-snt-bar-fill--pos");
  posTrack.appendChild(posFill);
  posRow.appendChild(posTrack);
  const posPct = el("span", "hb-snt-bar-pct", "");
  posRow.appendChild(posPct);
  resultBox.appendChild(posRow);

  const negRow = el("div", "hb-snt-bar-row");
  negRow.appendChild(el("span", "hb-snt-bar-name", "Negative"));
  const negTrack = el("div", "hb-snt-bar-track");
  const negFill = el("div", "hb-snt-bar-fill hb-snt-bar-fill--neg");
  negTrack.appendChild(negFill);
  negRow.appendChild(negTrack);
  const negPct = el("span", "hb-snt-bar-pct", "");
  negRow.appendChild(negPct);
  resultBox.appendChild(negRow);
  wrap.appendChild(resultBox);

  const noteBox = el("p", "hb-snt-note", getDisclosures()[2]);
  wrap.appendChild(noteBox);

  // --- helpers ------------------------------------------------------------------------
  const showError = (msg: string): void => {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  };
  const clearError = (): void => {
    errorBox.textContent = "";
    errorBox.hidden = true;
  };
  const setProgress = (fraction: number, msg: string): void => {
    progress.hidden = false;
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    progressBar.style.width = pct + "%";
    status.textContent = msg;
  };
  const hideProgress = (): void => {
    progress.hidden = true;
    progressBar.style.width = "0%";
  };

  textArea.addEventListener("input", () => {
    const n = textArea.value.trim().length;
    count.textContent =
      n.toLocaleString("en-US") + " / " + MAX_TEXT_CHARS.toLocaleString("en-US") + " characters";
  });

  runBtn.addEventListener("click", async () => {
    clearError();
    resultBox.hidden = true;

    const check = validateInputs({ text: textArea.value });
    if (!check.ok) {
      showError(check.error ?? "Please enter the text to analyze.");
      return;
    }
    const text = textArea.value.trim();

    runBtn.disabled = true;
    setProgress(0.05, "Loading classifier (first run downloads ~67 MB)…");

    try {
      const pipe = (await loadPipeline(cfg.task, cfg.id, {
        onProgress: (p) => {
          setProgress(p.fraction < 0 ? 0 : p.fraction, p.status);
        },
      })) as (input: string, opts?: Record<string, unknown>) => Promise<unknown>;
      setProgress(0.95, "Analyzing…");
      const out = (await pipe(text, { top_k: 2 })) as unknown;
      const result = normalizeSentiment(out);
      if (!result) {
        showError("The classifier returned no usable result — please try again.");
        return;
      }
      const isPos = result.label === "POSITIVE";
      resultBox.classList.toggle("hb-snt-result--pos", isPos);
      resultBox.classList.toggle("hb-snt-result--neg", !isPos);
      verdict.textContent = isPos ? "😄 POSITIVE" : "😟 NEGATIVE";
      conf.textContent = `Confidence ${(result.score * 100).toFixed(1)}%`;
      posFill.style.width = `${Math.round(result.positive * 100)}%`;
      negFill.style.width = `${Math.round(result.negative * 100)}%`;
      posPct.textContent = `${(result.positive * 100).toFixed(1)}%`;
      negPct.textContent = `${(result.negative * 100).toFixed(1)}%`;
      resultBox.hidden = false;
      hideProgress();
      status.textContent = "Done. Binary sentiment only — not sarcasm-proof.";
      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      hideProgress();
      showError(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : "Analysis failed — please try again.",
      );
    } finally {
      runBtn.disabled = false;
    }
  });
}
