/**
 * Semantic Note Search — pure config/validation + ranking math (tool-543),
 * zero imports, zero network, zero DOM.
 *
 * Inference runs in client.ts via Transformers.js
 * (pipeline "feature-extraction" with Xenova/bge-small-en-v1.5) 100%
 * on-device. Notes live in the browser (in-memory + localStorage); search
 * embeds the query (with the model's recommended retrieval prefix) and
 * ranks notes by cosine similarity. The pure math below operates on plain
 * number arrays so it is unit-testable in Node.
 */

/** Local re-declaration (zero-import rule); mirrors lib/ai/types.ts. */
export interface AiModelInfo {
  id: string;
  task: string;
  sizeMb: number;
  license: string;
  dtype?: string;
  notes?: string;
}

/** Query prefix recommended for bge-small-en-v1.5 retrieval. */
export const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

export const MAX_NOTE_CHARS = 10000;
export const MAX_NOTES = 200;

export function getModelConfig(): AiModelInfo {
  return {
    id: "Xenova/bge-small-en-v1.5",
    task: "feature-extraction",
    sizeMb: 22,
    license: "MIT (BAAI)",
    notes: "384-dim embeddings, English-optimized, mean pooling + normalization",
  };
}

export function getDisclosures(): string[] {
  return [
    "Runs 100% in your browser — your notes are never uploaded anywhere.",
    "Downloads ~22 MB of model weights once, then works offline.",
    "English-optimized embeddings — other languages rank poorly.",
    "Similarity is a statistical guess, not understanding — always skim the matched note.",
  ];
}

export const HEADLINE =
  "Search your own notes by meaning, not keywords — on-device embeddings, nothing uploaded.";

/** Cosine similarity of two equal-length vectors (0 when degenerate). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface RankedNote<T> {
  note: T;
  score: number;
}

/**
 * Rank notes by cosine similarity to the query embedding, highest first.
 * getEmbedding extracts the vector from a note record. Deterministic:
 * ties break by note id order (stable sort keeps input order).
 */
export function rankNotes<T>(
  queryEmbedding: number[],
  notes: T[],
  getEmbedding: (note: T) => number[] | null,
): RankedNote<T>[] {
  const ranked: RankedNote<T>[] = [];
  for (const note of notes) {
    const emb = getEmbedding(note);
    if (!emb) continue;
    ranked.push({ note, score: cosineSimilarity(queryEmbedding, emb) });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

/**
 * Validate a note before saving.
 * values.title: string, optional. values.text: string, required, 1..MAX_NOTE_CHARS.
 */
export function validateNote(values: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  const raw = values["text"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Please write the note text first." };
  }
  if (raw.trim().length > MAX_NOTE_CHARS) {
    return {
      ok: false,
      error: `Keep notes under ${MAX_NOTE_CHARS.toLocaleString("en-US")} characters.`,
    };
  }
  const title = values["title"];
  if (title !== undefined && title !== null && typeof title !== "string") {
    return { ok: false, error: "Note title must be text." };
  }
  return { ok: true };
}

/** Validate a search query. values.query: string, required, non-empty. */
export function validateQuery(values: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  const raw = values["query"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Type a search query first." };
  }
  return { ok: true };
}
