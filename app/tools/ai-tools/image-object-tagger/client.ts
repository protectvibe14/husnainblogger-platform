/**
 * Image Object Tagger — client.ts (tool-541, redesigned).
 *
 * Flow: beautiful drag-drop upload zone with photo preview ->
 * on-device ViT image classifier (Xenova/vit-base-patch16-224 via
 * Transformers.js) -> top-8 labels with confidence bars + photo preview.
 * Never uploads the image. User text is injected via textContent only.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  normalizeTags,
  TOP_K,
  MAX_FILE_MB,
} from "./logic.ts";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
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
    .hb-tag-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-tag-header {
      background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-tag-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-tag-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-tag-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-tag-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-tag-drop:hover, .hb-tag-drop.hb-tag-dragover {
      border-color: #059669; background: #ecfdf5;
    }
    .hb-tag-drop.hb-tag-has-image { padding: 12px; }
    .hb-tag-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-tag-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-tag-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-tag-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: #059669; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-tag-browse:hover { background: #047857; }
    .hb-tag-preview { max-width: 100%; max-height: 220px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-tag-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-tag-change { font-size: 13px; color: #059669; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 4px; }
    .hb-tag-run {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-tag-run:hover:not(:disabled) { opacity: .92; }
    .hb-tag-run:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-tag-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-tag-progress > div { height: 100%; background: linear-gradient(90deg, #059669, #0d9488); width: 0%; transition: width .3s; }
    .hb-tag-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-tag-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-tag-result-photo { width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
    .hb-tag-row {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      margin-bottom: 8px;
    }
    .hb-tag-rank {
      font-size: 13px; font-weight: 700; color: #fff; background: #059669;
      border-radius: 6px; min-width: 28px; height: 28px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .hb-tag-name { font-size: 14px; font-weight: 600; color: #1e293b; flex: 1; word-break: break-word; }
    .hb-tag-track {
      flex: 2; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;
    }
    .hb-tag-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #059669, #0d9488); }
    .hb-tag-pct { font-size: 13px; font-weight: 700; color: #059669; min-width: 52px; text-align: right; }
    .hb-tag-note { font-size: 13px; color: #64748b; margin: 0; }
    @media (max-width: 640px) {
      .hb-tag-header { padding: 18px; }
      .hb-tag-card { padding: 16px; }
      .hb-tag-track { flex: 1; }
    }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-tag-wrap");
  host.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el("div", "hb-tag-header");
  header.appendChild(el("h3", "", "🏷️ Image Object Tagger"));
  header.appendChild(
    el(
      "p",
      "",
      "Tag the objects in any photo with an on-device image classifier — no uploads, no API key.",
    ),
  );
  wrap.appendChild(header);

  // --- drop zone ----------------------------------------------------------------
  const card = el("div", "hb-tag-card");
  wrap.appendChild(card);

  const drop = el("div", "hb-tag-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload a photo: drag and drop, or click to browse");

  const icon = el("div", "hb-tag-icon", "📸");
  const title = el("p", "hb-tag-title", "Drop your photo here");
  const sub = el(
    "p",
    "hb-tag-sub",
    `or click to browse — JPG, PNG, WEBP up to ${MAX_FILE_MB} MB`,
  );
  const browseBtn = el("button", "hb-tag-browse", "Choose photo");
  browseBtn.type = "button";

  drop.appendChild(icon);
  drop.appendChild(title);
  drop.appendChild(sub);
  drop.appendChild(browseBtn);
  card.appendChild(drop);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  card.appendChild(fileInput);

  // --- run ------------------------------------------------------------------------
  const runBtn = el("button", "hb-tag-run", "🏷️ Tag objects");
  runBtn.type = "button";
  runBtn.disabled = true;
  card.appendChild(runBtn);

  const progress = el("div", "hb-tag-progress");
  progress.hidden = true;
  const progressBar = el("div", "");
  progress.appendChild(progressBar);
  card.appendChild(progress);

  const status = el("p", "hb-tag-status");
  status.setAttribute("role", "status");
  card.appendChild(status);

  const errorBox = el("div", "hb-tag-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  card.appendChild(errorBox);

  // --- result -----------------------------------------------------------------------
  const resultBox = el("div", "hb-tag-card");
  resultBox.hidden = true;
  const resultLabel = el(
    "h4",
    "",
    `🎯 Top ${TOP_K} predicted labels`,
  );
  resultLabel.style.margin = "0 0 14px";
  resultLabel.style.fontSize = "15px";
  resultLabel.style.fontWeight = "700";
  resultLabel.style.color = "#1e293b";
  resultBox.appendChild(resultLabel);
  const tagList = el("div", "");
  resultBox.appendChild(tagList);
  wrap.appendChild(resultBox);

  const noteBox = el("p", "hb-tag-note", getDisclosures()[3]);
  wrap.appendChild(noteBox);

  // --- state --------------------------------------------------------------------------
  let file: File | null = null;
  let objectUrl: string | null = null;
  let resultUrl: string | null = null;

  function showDropPreview(url: string, name: string): void {
    drop.classList.add("hb-tag-has-image");
    drop.innerHTML = "";
    const preview = document.createElement("img");
    preview.src = url;
    preview.className = "hb-tag-preview";
    preview.alt = "Selected photo preview";
    const fname = el("p", "hb-tag-filename", name);
    const change = el("button", "hb-tag-change", "Choose a different photo");
    change.type = "button";
    change.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.appendChild(preview);
    drop.appendChild(fname);
    drop.appendChild(change);
  }

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function hideError(): void {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
  function setProgress(fraction: number, msg: string): void {
    progress.hidden = false;
    progressBar.style.width = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`;
    status.textContent = msg;
  }
  function hideProgress(): void {
    progress.hidden = true;
    progressBar.style.width = "0%";
  }

  function pickFile(f: File | null): void {
    hideError();
    resultBox.hidden = true;
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      showError(`That file is over ${MAX_FILE_MB} MB. Please choose a smaller image.`);
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    file = f;
    objectUrl = URL.createObjectURL(f);
    showDropPreview(objectUrl, f.name);
    runBtn.disabled = false;
    status.textContent = "Photo ready — click “Tag objects”.";
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
    drop.classList.add("hb-tag-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-tag-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-tag-dragover");
    const f = e.dataTransfer?.files?.[0];
    pickFile(f ?? null);
  });
  fileInput.addEventListener("change", () => pickFile(fileInput.files?.[0] ?? null));

  runBtn.addEventListener("click", () => {
    void run();
  });

  async function run(): Promise<void> {
    hideError();
    resultBox.hidden = true;
    tagList.innerHTML = "";

    const f = file;
    const check = validateInputs({
      fileName: f?.name,
      fileSizeMb: f ? f.size / (1024 * 1024) : undefined,
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose an image file first.");
      return;
    }
    const imageFile = f as File;

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = "Working…";
    try {
      const pipe = (await loadPipeline(cfg.task, cfg.id, {
        onProgress: (p) => {
          setProgress(p.fraction < 0 ? 0 : p.fraction, p.status);
        },
      })) as (input: string, opts?: Record<string, unknown>) => Promise<unknown>;

      setProgress(0.98, "Analyzing your photo…");
      const url = URL.createObjectURL(imageFile);
      try {
        const out = (await pipe(url, { top_k: TOP_K })) as unknown;
        const tags = normalizeTags(out, TOP_K);
        if (tags.length === 0) {
          URL.revokeObjectURL(url);
          tagList.append(el("p", "hb-tag-note", "No labels returned — try another photo."));
        } else {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          resultUrl = url; // result photo displays this URL — released on next pick
          const photo = document.createElement("img");
          photo.src = url;
          photo.className = "hb-tag-result-photo";
          photo.alt = "Tagged photo";
          tagList.appendChild(photo);
          let rank = 1;
          for (const t of tags) {
            const row = el("div", "hb-tag-row");
            row.appendChild(el("span", "hb-tag-rank", String(rank)));
            const name = el("span", "hb-tag-name", t.label.replace(/_/g, " "));
            const pct = Math.round(t.score * 100);
            row.appendChild(name);
            const track = el("div", "hb-tag-track");
            const fill = el("div", "hb-tag-fill");
            fill.style.width = `${Math.max(2, pct)}%`;
            track.appendChild(fill);
            row.appendChild(track);
            row.appendChild(el("span", "hb-tag-pct", `${pct}%`));
            tagList.appendChild(row);
            rank++;
          }
        }
        hideProgress();
        status.textContent = "Done. Scores are model confidence, not certainty.";
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {
        URL.revokeObjectURL(url);
        throw err;
      }
    } catch (err) {
      hideProgress();
      showError(
        err instanceof Error
          ? `Tagging failed: ${err.message}`
          : "Tagging failed — please try a different image.",
      );
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
