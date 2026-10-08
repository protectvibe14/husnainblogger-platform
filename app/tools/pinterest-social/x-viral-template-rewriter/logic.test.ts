import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  rewriteDraft,
  weightedLength,
  TEMPLATES,
  CHAR_LIMIT,
  URL_WEIGHT,
} from "./logic.ts";

// --- happy path: one test per template ---------------------------------------

for (const tpl of TEMPLATES) {
  test(`happy path: template "${tpl.key}" returns 3 in-budget rewrites`, () => {
    const r = runTool({ draft: "I post every day and my reach tripled in a month.", template: tpl.key });
    assert.equal(r.ok, true);
    const rewrites = r.values!.rewrites as string[];
    assert.equal(rewrites.length, 3);
    for (const rw of rewrites) {
      assert.ok(weightedLength(rw) <= CHAR_LIMIT, `over budget (${weightedLength(rw)}): ${rw}`);
      assert.ok(rw.length > 0);
    }
    assert.ok(typeof r.values!.fitNote === "string");
    assert.ok((r.values!.fitNote as string).includes(tpl.label));
  });
}

test("rewrites reuse the draft's own words (no invented content)", () => {
  const draft = "Consistency beats intensity every single time.";
  const r = runTool({ draft, template: "question-hook" });
  assert.equal(r.ok, true);
  const rewrites = r.values!.rewrites as string[];
  // the draft (or its trimmed prefix) must appear in each rewrite
  for (const rw of rewrites) {
    assert.ok(rw.includes("Consistency beats intensity"), `draft missing: ${rw}`);
  }
});

// --- already-on-template detection --------------------------------------------

test("hot-take draft already matching -> light-polish note", () => {
  const r = rewriteDraft("Unpopular opinion: hashtags are dead.", "hot-take");
  assert.equal(r.alreadyOnTemplate, true);
  assert.ok(r.fitNote.includes("light polish"));
});

test("question draft ending with ? -> light-polish note for question-hook", () => {
  const r = rewriteDraft("Do you still use hashtags?", "question-hook");
  assert.equal(r.alreadyOnTemplate, true);
});

test("stat-like draft (% sign) -> light-polish note for stat-hook", () => {
  const r = rewriteDraft("80% of my reach comes from replies.", "stat-hook");
  assert.equal(r.alreadyOnTemplate, true);
});

test("plain draft -> not already on template", () => {
  const r = rewriteDraft("I like posting in the morning.", "hot-take");
  assert.equal(r.alreadyOnTemplate, false);
  assert.ok(r.fitNote.includes("pattern-library"));
});

// --- budget edge cases ----------------------------------------------------------

test("very long draft is trimmed so rewrites stay in budget", () => {
  const long = "word ".repeat(400).trim(); // 2000 chars
  const r = runTool({ draft: long, template: "hot-take" });
  assert.equal(r.ok, true);
  for (const rw of r.values!.rewrites as string[]) {
    assert.ok(weightedLength(rw) <= CHAR_LIMIT, `over budget: ${weightedLength(rw)}`);
    assert.ok(rw.includes("…"));
  }
});

test("draft with URL: URL counts as 23 weighted chars", () => {
  assert.equal(weightedLength("https://example.com/very/long/path/that/keeps/going/on"), URL_WEIGHT);
  assert.equal(weightedLength("hi https://example.com/x"), 3 + URL_WEIGHT);
  assert.equal(weightedLength("plain text"), 10);
});

test("URL-heavy draft still fits the 280 budget", () => {
  const r = runTool({
    draft: "Read this guide https://example.com/a/very/long/article/path/about/growth now please",
    template: "stat-hook",
  });
  assert.equal(r.ok, true);
  for (const rw of r.values!.rewrites as string[]) {
    assert.ok(weightedLength(rw) <= CHAR_LIMIT);
  }
});

// --- validation errors ------------------------------------------------------------

test("error: missing draft", () => {
  const r = runTool({ template: "hot-take" });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("draft"));
});

test("error: empty draft", () => {
  const r = runTool({ draft: "   ", template: "hot-take" });
  assert.equal(r.ok, false);
});

test("error: draft over 2000 chars", () => {
  const r = runTool({ draft: "x".repeat(2001), template: "hot-take" });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("2,000"));
});

test("error: missing template", () => {
  const r = runTool({ draft: "Some draft text here." });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("template"));
});

test("error: unknown template", () => {
  const r = runTool({ draft: "Some draft text here.", template: "meme-lord" });
  assert.equal(r.ok, false);
});

// --- determinism & bank bounds -------------------------------------------------------

test("deterministic: same inputs -> identical output", () => {
  const a = runTool({ draft: "I post every day.", template: "build-in-public" });
  const b = runTool({ draft: "I post every day.", template: "build-in-public" });
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const r = runTool({ draft: "Test draft.", template: "hot-take" });
  assert.deepEqual(Object.keys(r.values!).sort(), ["fitNote", "rewrites"].sort());
});

test("template bank bounds: 4 templates x 3 frames each", () => {
  assert.equal(TEMPLATES.length, 4);
  assert.deepEqual(TEMPLATES.map((t) => t.key), ["stat-hook", "question-hook", "hot-take", "build-in-public"]);
  for (const t of TEMPLATES) {
    assert.equal(t.frames.length, 3);
    assert.ok(t.frames.every((f) => f.includes("{core}")));
  }
  assert.equal(CHAR_LIMIT, 280);
  assert.equal(URL_WEIGHT, 23);
});
