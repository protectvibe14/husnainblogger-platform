/**
 * Semantic Note Search — client.ts (tool-543).
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

  let notes = loadNotes();
  let pipePromise: Promise<unknown> | null = null;

  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";
  const showError = (msg: string): void => {
    errorBox.textContent = msg;
    errorBox.style.display = "";
  };
  const clearError = (): void => {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  };

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

  // ---- Save-note section ----
  const saveTitle = el("p", "hb-ai-label", "1. Save a note (stored only in this browser)");
  const titleInput = el("input", "hb-ai-input") as HTMLInputElement;
  titleInput.placeholder = "Note title (optional)";
  const textInput = el("textarea", "hb-ai-textarea") as HTMLTextAreaElement;
  textInput.rows = 4;
  textInput.placeholder = "Write or paste a note…";
  const saveBtn = el("button", "hb-btn", "Save note") as HTMLButtonElement;
  const saveStatus = el("p", "hb-ai-label", `${notes.length} note(s) saved.`);

  // ---- Search section ----
  const searchTitle = el("p", "hb-ai-label", "2. Search your notes by meaning");
  const queryInput = el("input", "hb-ai-input") as HTMLInputElement;
  queryInput.placeholder = "Describe what you are looking for…";
  const searchBtn = el("button", "hb-btn hb-btn--primary", "Search") as HTMLButtonElement;
  const progress = el("div", "hb-ai-progress");
  progress.style.display = "none";
  const resultBox = el("div", "hb-ai-result");
  resultBox.style.display = "none";
  const noteBox = el("p", "hb-ai-label", getDisclosures()[3]);

  host.append(
    saveTitle,
    titleInput,
    textInput,
    saveBtn,
    saveStatus,
    searchTitle,
    queryInput,
    searchBtn,
    progress,
    status,
    errorBox,
    resultBox,
    noteBox,
  );

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
    status.textContent = "Embedding note (first run downloads ~22 MB)…";
    try {
      const embedding = await embed(textInput.value.trim(), (p) => {
        status.textContent = p.status;
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
      saveStatus.textContent = `${notes.length} note(s) saved.`;
      status.textContent = "Note saved.";
    } catch (err) {
      showError(err instanceof Error ? `Could not embed the note: ${err.message}` : "Could not save the note.");
    } finally {
      saveBtn.disabled = false;
    }
  });

  searchBtn.addEventListener("click", async () => {
    clearError();
    resultBox.style.display = "none";
    resultBox.innerHTML = "";
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
    progress.style.display = "";
    status.textContent = "Embedding query…";
    try {
      const queryEmb = await embed(QUERY_PREFIX + queryInput.value.trim(), (p) => {
        status.textContent = p.status;
      });
      if (!queryEmb) {
        showError("Could not embed the query — please try again.");
        return;
      }
      const ranked = rankNotes(queryEmb, notes, (n) => n.embedding).slice(0, 10);
      if (ranked.length === 0) {
        resultBox.append(el("p", "hb-ai-label", "No embedded notes to search."));
      } else {
        for (const r of ranked) {
          const item = el("div", "");
          item.style.marginBottom = "12px";
          const head = el(
            "p",
            "hb-ai-label",
            `${r.note.title || "(untitled)"} — ${(r.score * 100).toFixed(1)}%`,
          );
          const body = el("p", "", r.note.text.slice(0, 300));
          item.append(head, body);
          resultBox.append(item);
        }
      }
      resultBox.style.display = "";
      status.textContent = `Done — ${ranked.length} match(es). Skim the note to confirm.`;
    } catch (err) {
      showError(err instanceof Error ? `Search failed: ${err.message}` : "Search failed.");
    } finally {
      progress.style.display = "none";
      searchBtn.disabled = false;
    }
  });
}
