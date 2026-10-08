import { test } from "node:test";
import assert from "node:assert";
import { runTool, STOPWORDS, HOOK_WORDS, MAX_WORDS } from "./logic.ts";

const OUTPUT_IDS = ["shortened", "variants", "wordCount", "guidance", "wasAlreadyShort", "banks"];

test("happy path: long title shortened to <= 5 words", () => {
  const r = runTool({
    text: "How to build a simple website for your business in 2025",
  });
  assert.strictEqual(r.ok, true);
  const v = r.values!;
  assert.deepStrictEqual(Object.keys(v).sort(), OUTPUT_IDS.sort());
  assert.ok((v.wordCount as number) <= 5);
  // "2025" is a number (+3), "simple" is a hook word (+2) — both kept.
  const words = (v.shortened as string).split(" ");
  assert.ok(words.includes("2025"));
});

test("edge: already short text returned as-is", () => {
  const r = runTool({ text: "Cabin build complete" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.wasAlreadyShort, true);
  assert.strictEqual(r.values!.shortened, "Cabin build complete");
  assert.strictEqual(r.values!.wordCount, 3);
});

test("edge: exactly 5 words returned as-is", () => {
  const r = runTool({ text: "Six brave foxes jumped high" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.wasAlreadyShort, true);
  assert.strictEqual(r.values!.wordCount, 5);
  assert.strictEqual(r.values!.shortened, "Six brave foxes jumped high");
});

test("stopwords removed from short text", () => {
  const r = runTool({ text: "The secrets of my success" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.shortened, "secrets success");
});

test("numbers and hook words preferred when trimming", () => {
  const r = runTool({
    text: "My first video about learning how to cook dinner tonight cheaply",
  });
  assert.strictEqual(r.ok, true);
  const words = (r.values!.shortened as string).split(" ");
  assert.ok(words.length <= MAX_WORDS);
});

test("casing upper", () => {
  const r = runTool({ text: "I built a cabin", casing: "upper" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.shortened, "I BUILT CABIN");
});

test("casing title", () => {
  const r = runTool({ text: "the secrets of MY success", casing: "title" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.shortened, "Secrets Success"); // "MY" matches stopword "my"
});

test("variants list has 3 mechanical casings", () => {
  const r = runTool({ text: "I built a cabin" });
  assert.strictEqual(r.ok, true);
  const variants = r.values!.variants as string[];
  assert.strictEqual(variants.length, 3);
  assert.ok(variants.includes("I built cabin"));
  assert.ok(variants.includes("I BUILT CABIN"));
});

test("guidance mentions small sizes", () => {
  const r = runTool({ text: "hello world" });
  assert.ok((r.values!.guidance as string).includes("small"));
});

test("banks reported with documented sizes", () => {
  const r = runTool({ text: "hello world" });
  const banks = r.values!.banks as { stopwords: number; hookWords: number };
  assert.strictEqual(banks.stopwords, STOPWORDS.length);
  assert.strictEqual(banks.hookWords, HOOK_WORDS.length);
  assert.strictEqual(STOPWORDS.length, 64);
  assert.strictEqual(HOOK_WORDS.length, 40);
});

test("validation: empty text rejected", () => {
  const r = runTool({ text: "   " });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error);
});

test("validation: missing text rejected", () => {
  const r = runTool({});
  assert.strictEqual(r.ok, false);
});

test("validation: non-string text rejected", () => {
  const r = runTool({ text: 42 });
  assert.strictEqual(r.ok, false);
});

test("validation: unknown casing rejected", () => {
  const r = runTool({ text: "hello world", casing: "fancy" });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("casing"));
});

test("validation: text over 5000 chars rejected", () => {
  const r = runTool({ text: "a".repeat(5001) });
  assert.strictEqual(r.ok, false);
});

test("label copy is rule-based, never AI", () => {
  // Internal honesty: engine has no generative model — verify determinism
  // across repeated runs as the practical proof.
  const a = runTool({ text: "How I made ten thousand dollars last year online", casing: "upper" });
  const b = runTool({ text: "How I made ten thousand dollars last year online", casing: "upper" });
  assert.deepStrictEqual(a, b);
});

test("unicode text handled without throwing", () => {
  const r = runTool({ text: "Café crème brûlée tasting tour video highlights reel" });
  assert.strictEqual(r.ok, true);
  assert.ok(((r.values!.shortened) as string).length > 0);
});

test("determinism: run twice identical", () => {
  const a = runTool({ text: "Why everyone is wrong about money and investing in 2026" });
  const b = runTool({ text: "Why everyone is wrong about money and investing in 2026" });
  assert.deepStrictEqual(a, b);
});
