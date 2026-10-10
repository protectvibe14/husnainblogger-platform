/**
 * Semantic Note Search — client.ts (tool-543, redesigned).
 * Save notes (embedded on-device with Xenova/bge-small-en-v1.5, stored in
 * localStorage) -> search by meaning via cosine similarity ranking.
 * Nothing is ever uploaded.
 */
import { loadPipeline } from "../../../src/lib/ai/model-loader.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import type { ProgressCallback } from "../../../src/lib/ai/model-loader.ts";
import {
  validateNote,
  validateQuery,
  getModelConfig,
  getDisclosures,
  rankNotes,
  QUERY_PREFIX,
  MAX_NOTES,
} from "./logic.ts";

const SAMPLE_NOTE = {
  title: "Project kickoff ideas",
  text: "The new dashboard needs a bold hero section, a weekly summary email, and a mobile-first settings page. Launch before the holiday rush.",
};
const SAMPLE_QUERY = "what do we need for the dashboard launch?";

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

interface StoredNote {
  id: string;
  title: string;
  text: string;
  embedding: number[] | null;
}

const STORAGE_KEY = "hb-semantic-notes-v1";

function loadNotes(): StoredNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is StoredNote =>
        n !== null &&
        typeof n === "object" &&
        typeof (n as { id?: unknown }).id === "string" &&
        typeof (n as { text?: unknown }).text === "string",
    );
  } catch {
    return [];
  }
}

function saveNotes(notes: StoredNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Storage full or unavailable — notes stay in memory for the session.
  }
}

/**
 * Pool a feature-extraction output into a normalized plain vector.
 * Handles dims [1, dim] (when pooling+normalize options are used) and
 * falls back to manual mean-pool + L2 normalize for [1, seq, dim].
 */
function poolEmbedding(out: unknown): number[] | null {
  const t = out as { data?: ArrayLike<number>; dims?: number[] } | null;
  if (!t || !t.data || !t.dims) return null;
  const dims = t.dims;
  if (dims.length === 3 && dims[0] === 1) {
    const seq = dims[1];
    const dim = dims[2];
    if (seq <= 0 || dim <= 0) return null;
    const mean = new Array<number>(dim).fill(0);
    for (let s = 0; s < seq; s++) {
      for (let d = 0; d < dim; d++) mean[d] += t.data[s * dim + d] ?? 0;
    }
    for (let d = 0; d < dim; d++) mean[d] /= seq;
    let norm = 0;
    for (let d = 0; d < dim; d++) norm += mean[d] * mean[d];
    norm = Math.sqrt(norm);
    if (norm === 0) return null;
    return mean.map((v) => v / norm);
  }
  if (dims.length === 2 && dims[0] === 1) {
    const dim = dims[1];
    if (dim <= 0) return null;
    const vec: number[] = [];
    for (let d = 0; d < dim; d++) vec.push(t.data[d] ?? 0);
    return vec;
  }
  return null;
}

type EmbedFn = (input: string, opts?: Record<string, unknown>) => Promise<unknown>;

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";
  const cfg = getModelConfig();

  // --- styles ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-sns-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-sns-header {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-sns-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-sns-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-sns-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-sns-card h4 { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1e293b; }
    .hb-sns-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-sns-input, .hb-sns-textarea {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box; color: #1e293b;
    }
    .hb-sns-input:focus, .hb-sns-textarea:focus { outline: none; border-color: #0ea5e9; }
    .hb-sns-textarea { min-height: 96px; resize: vertical; }
    .hb-sns-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 6px 0 0; }
    .hb-sns-btn {
      padding: 12px 24px; font-size: 15px; font-weight: 700; color: #fff;
      background: #0284c7; border: none; border-radius: 10px; cursor: pointer;
    }
    .hb-sns-btn:hover:not(:disabled) { background: #0369a1; }
    .hb-sns-btn:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-sns-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-sns-generate:hover:not(:disabled) { opacity: .92; }
    .hb-sns-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-sns-sample {
      font-size: 13px; color: #0284c7; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-sns-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-sns-progress > div {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #0ea5e9, #2563eb);
      transition: width .3s;
    }
    .hb-sns-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-sns-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-sns-match {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 14px 16px; margin-bottom: 10px;
    }
    .hb-sns-match-head {
      display: flex; justify-content: space-between; align-items: center;
      gap: 10px; margin-bottom: 6px;
    }
    .hb-sns-match-title { font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-sns-score {
      font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe;
      padding: 3px 10px; border-radius: 999px; white-space: nowrap;
    }
    .hb-sns-match-body { font-size: 14px; color: #475569; margin: 0; line-height: 1.55; }
    .hb-sns-note { font-size: 13px; color: #64748b; margin: 0; }
    .hb-sns-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .hb-sns-chip {
      font-size: 12px; font-weight: 600; color: #334155; background: #f1f5f9;
      border: 1px solid #e2e8f0; border-radius: 999px; padding: 5px 12px;
    }
    @media (max-width: 640px) {
      .hb-sns-header { padding: 18px; }
      .hb-sns-card { padding: 16px; }
    }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-sns-wrap");
  host.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el("div", "hb-sns-header");
  header.appendChild(el("h3", "", "🔍 Semantic Note Search"));
  header.appendChild(
    el("p", "", "Search your own notes by meaning, not keywords — on-device embeddings, nothing uploaded."),
  );
  wrap.appendChild(header);

  // --- save-note card ------------------------------------------------------------
  const saveCard = el("div", "hb-sns-card");
  saveCard.appendChild(el("h4", "", "1️⃣ Save a note — stored only in this browser"));
  const titleLabel = el("label", "hb-sns-label", "Note title (optional)");
  titleLabel.htmlFor = "hb-sns-title";
  saveCard.appendChild(titleLabel);
  const titleInput = el("input", "hb-sns-input") as HTMLInputElement;
  titleInput.id = "hb-sns-title";
  titleInput.placeholder = "e.g. Meeting notes";
  saveCard.appendChild(titleInput);
  const textLabel = el("label", "hb-sns-label", "Note text");
  textLabel.htmlFor = "hb-sns-text";
  textLabel.style.marginTop = "14px";
  saveCard.appendChild(textLabel);
  const textInput = el("textarea", "hb-sns-textarea") as HTMLTextAreaElement;
  textInput.id = "hb-sns-text";
  textInput.rows = 4;
  textInput.placeholder = "Write or paste a note…";
  saveCard.appendChild(textInput);
  const saveRow = el("div", "");
  saveRow.style.marginTop = "12px";
  saveRow.style.display = "flex";
  saveRow.style.gap = "12px";
  saveRow.style.alignItems = "center";
  saveRow.style.flexWrap = "wrap";
  const saveBtn = el("button", "hb-sns-btn", "💾 Save note") as HTMLButtonElement;
  saveRow.appendChild(saveBtn);
  const saveStatus = el("p", "hb-sns-count", "0 notes saved.");
  saveRow.appendChild(saveStatus);
  saveCard.appendChild(saveRow);
  const sampleNoteBtn = el("button", "hb-sns-sample", "✨ Try a sample note") as HTMLButtonElement;
  sampleNoteBtn.addEventListener("click", () => {
    titleInput.value = SAMPLE_NOTE.title;
    textInput.value = SAMPLE_NOTE.text;
  });
  saveCard.appendChild(sampleNoteBtn);
  const savedList = el("div", "hb-sns-list");
  saveCard.appendChild(savedList);
  wrap.appendChild(saveCard);

  // --- search card ----------------------------------------------------------------
  const searchCard = el("div", "hb-sns-card");
  searchCard.appendChild(el("h4", "", "2️⃣ Search your notes by meaning"));
  const queryLabel = el("label", "hb-sns-label", "What are you looking for?");
  queryLabel.htmlFor = "hb-sns-query";
  searchCard.appendChild(queryLabel);
  const queryInput = el("input", "hb-sns-input") as HTMLInputElement;
  queryInput.id = "hb-sns-query";
  queryInput.placeholder = "Describe it in your own words…";
  searchCard.appendChild(queryInput);
  const sampleQueryBtn = el("button", "hb-sns-sample", "✨ Try a sample search") as HTMLButtonElement;
  sampleQueryBtn.addEventListener("click", () => {
    queryInput.value = SAMPLE_QUERY;
  });
  searchCard.appendChild(sampleQueryBtn);
  const searchBtn = el("button", "hb-sns-generate", "🔍 Search notes") as HTMLButtonElement;
  searchBtn.style.marginTop = "14px";
  searchCard.appendChild(searchBtn);
  const progress = el("div", "hb-sns-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  const progressBar = el("div", "");
  progress.appendChild(progressBar);
  searchCard.appendChild(progress);
  const status = el("p", "hb-sns-status");
  status.setAttribute("role", "status");
  searchCard.appendChild(status);
  wrap.appendChild(searchCard);

  const errorBox = el("div", "hb-sns-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- results card ------------------------------------------------------------------
  const resultCard = el("div", "hb-sns-card");
  resultCard.hidden = true;
  resultCard.appendChild(el("h4", "", "🎯 Matches"));
  const resultList = el("div", "");
  resultCard.appendChild(resultList);
  wrap.appendChild(resultCard);

  const noteBox = el("p", "hb-sns-note", getDisclosures()[3]);
  noteBox.style.textAlign = "center";
  wrap.appendChild(noteBox);

  // --- state --------------------------------------------------------------------------
  let notes = loadNotes();
  let pipePromise: Promise<unknown> | null = null;

  function refreshSaved(): void {
    saveStatus.textContent = `${notes.length} note${notes.length === 1 ? "" : "s"} saved.`;
    savedList.innerHTML = "";
    for (const n of notes.slice(0, 12)) {
      const chip = el("span", "hb-sns-chip", n.title || n.text.slice(0, 28));
      chip.title = n.text.slice(0, 120);
      savedList.appendChild(chip);
    }
  }

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function clearError(): void {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }
  function setProgress(fraction: number, msg: string): void {
    progress.hidden = false;
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    progressBar.style.width = pct + "%";
    status.textContent = msg;
  }
  function hideProgress(): void {
    progress.hidden = true;
    progressBar.style.width = "0%";
  }

  const getPipe = async (onProgress: ProgressCallback): Promise<EmbedFn> => {
    if (!pipePromise) {
      pipePromise = loadPipeline(cfg.task, cfg.id, { onProgress }).catch((err) => {
        pipePromise = null;
        throw err;
      });
    }
    return (await pipePromise) as EmbedFn;
  };

  const embed = async (
    text: string,
    onProgress: ProgressCallback,
  ): Promise<number[] | null> => {
    const pipe = await getPipe(onProgress);
    // bge-small-en-v1.5's recommended setup: mean pooling + normalization.
    return poolEmbedding(await pipe(text, { pooling: "mean", normalize: true }));
  };

  refreshSaved();

  saveBtn.addEventListener("click", async () => {
    clearError();
    const check = validateNote({ title: titleInput.value, text: textInput.value });
    if (!check.ok) {
      showError(check.error ?? "Please write the note text first.");
      return;
    }
    if (notes.length >= MAX_NOTES) {
      showError(`Note limit reached (${MAX_NOTES}) — delete some from browser storage to add more.`);
      return;
    }
    saveBtn.disabled = true;
    setProgress(0.05, "Embedding note (first run downloads ~22 MB)…");
    try {
      const embedding = await embed(textInput.value.trim(), (p) => {
        setProgress(p.fraction < 0 ? 0 : p.fraction, p.status);
      });
      const note: StoredNote = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        title: titleInput.value.trim(),
        text: textInput.value.trim(),
        embedding,
      };
      notes = [note, ...notes];
      saveNotes(notes);
      titleInput.value = "";
      textInput.value = "";
      refreshSaved();
      status.textContent = "Note saved.";
    } catch (err) {
      showError(err instanceof Error ? `Could not embed the note: ${err.message}` : "Could not save the note.");
    } finally {
      hideProgress();
      saveBtn.disabled = false;
    }
  });

  searchBtn.addEventListener("click", async () => {
    clearError();
    resultCard.hidden = true;
    resultList.innerHTML = "";
    const check = validateQuery({ query: queryInput.value });
    if (!check.ok) {
      showError(check.error ?? "Type a search query first.");
      return;
    }
    if (notes.length === 0) {
      showError("No notes saved yet — save at least one note first.");
      return;
    }
    searchBtn.disabled = true;
    setProgress(0.05, "Embedding query…");
    try {
      const queryEmb = await embed(QUERY_PREFIX + queryInput.value.trim(), (p) => {
        setProgress(p.fraction < 0 ? 0 : p.fraction, p.status);
      });
      if (!queryEmb) {
        showError("Could not embed the query — please try again.");
        return;
      }
      const ranked = rankNotes(queryEmb, notes, (n) => n.embedding).slice(0, 10);
      if (ranked.length === 0) {
        resultList.appendChild(el("p", "hb-sns-note", "No embedded notes to search."));
      } else {
        for (const r of ranked) {
          const item = el("div", "hb-sns-match");
          const head = el("div", "hb-sns-match-head");
          head.appendChild(el("span", "hb-sns-match-title", r.note.title || "(untitled)"));
          head.appendChild(el("span", "hb-sns-score", `${(r.score * 100).toFixed(1)}% match`));
          item.appendChild(head);
          item.appendChild(el("p", "hb-sns-match-body", r.note.text.slice(0, 300)));
          resultList.appendChild(item);
        }
      }
      resultCard.hidden = false;
      hideProgress();
      status.textContent = `Done — ${ranked.length} match(es). Skim the note to confirm.`;
      resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      hideProgress();
      showError(err instanceof Error ? `Search failed: ${err.message}` : "Search failed.");
    } finally {
      searchBtn.disabled = false;
    }
  });
}
