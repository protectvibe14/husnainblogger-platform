import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateNote,
  validateQuery,
  cosineSimilarity,
  rankNotes,
  HEADLINE,
  QUERY_PREFIX,
  MAX_NOTE_CHARS,
} from "./logic.ts";

describe("semantic-note-search logic", () => {
  it("model config is the verified BGE small embedding checkpoint", () => {
    const cfg = getModelConfig();
    assert.equal(cfg.id, "Xenova/bge-small-en-v1.5");
    assert.equal(cfg.task, "feature-extraction");
    assert.ok(cfg.sizeMb > 0);
  });

  it("disclosures are honest (English-optimized, on-device, statistical guess)", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("never uploaded"));
    assert.ok(d.includes("English-optimized"));
    assert.ok(d.includes("statistical guess"));
  });

  it("headline is not hype", () => {
    assert.ok(!/ai-powered/i.test(HEADLINE));
  });

  it("query prefix matches the model's recommended retrieval prefix", () => {
    assert.ok(QUERY_PREFIX.startsWith("Represent this sentence"));
  });

  it("cosineSimilarity: identical vectors -> 1, orthogonal -> 0", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 2, 3], [1, 2, 3]) - 1) < 1e-9);
    assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-9);
    assert.ok(Math.abs(cosineSimilarity([1, 1], [-1, -1]) + 1) < 1e-9);
  });

  it("cosineSimilarity: degenerate inputs -> 0", () => {
    assert.equal(cosineSimilarity([], []), 0);
    assert.equal(cosineSimilarity([1, 2], [1]), 0);
    assert.equal(cosineSimilarity([0, 0], [1, 2]), 0);
  });

  it("rankNotes orders by similarity, skips notes without embeddings", () => {
    const notes = [
      { id: "a", emb: [1, 0] },
      { id: "b", emb: null as number[] | null },
      { id: "c", emb: [0.9, 0.1] },
    ];
    const ranked = rankNotes([1, 0], notes, (n) => n.emb);
    assert.deepEqual(ranked.map((r) => r.note.id), ["a", "c"]);
    assert.ok(ranked[0].score >= ranked[1].score);
  });

  it("rankNotes is deterministic", () => {
    const notes = [{ id: "a", emb: [0.5, 0.5] }];
    const r1 = rankNotes([1, 0], notes, (n) => n.emb);
    const r2 = rankNotes([1, 0], notes, (n) => n.emb);
    assert.deepEqual(r1, r2);
  });

  it("validateNote: happy path", () => {
    assert.deepEqual(validateNote({ title: "Shopping", text: "buy milk" }), { ok: true });
    assert.deepEqual(validateNote({ text: "no title" }), { ok: true });
  });

  it("validateNote: empty / too long -> error", () => {
    assert.equal(validateNote({}).ok, false);
    assert.equal(validateNote({ text: "   " }).ok, false);
    assert.equal(validateNote({ text: "a".repeat(MAX_NOTE_CHARS + 1) }).ok, false);
  });

  it("validateQuery: empty -> error", () => {
    assert.equal(validateQuery({}).ok, false);
    assert.equal(validateQuery({ query: "cats" }).ok, true);
  });
});
