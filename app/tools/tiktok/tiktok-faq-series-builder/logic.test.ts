import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["seriesPlan", "episodes"];

const q1 = { question: "How much does it cost to start?" };
const q2 = {
  question: "What tools do I need?",
  answerPoints: "A decent phone, a ring light, a tripod",
};

function okResult(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: { seriesPlan: string; episodes: string[] } }).values;
}

describe("tiktok-faq-series-builder", () => {
  it("happy path: question-only item gets answer placeholder", () => {
    const v = okResult([q1]);
    assert.equal(v.episodes.length, 1);
    assert.ok(v.episodes[0].includes(q1.question));
    assert.ok(v.episodes[0].includes("[ADD YOUR ANSWER HERE"));
  });

  it("answerPoints appear as answer beats (user-supplied facts)", () => {
    const v = okResult([q2]);
    assert.ok(v.episodes[0].includes("A decent phone"));
    assert.ok(v.episodes[0].includes("a ring light"));
    assert.ok(!v.episodes[0].includes("[ADD YOUR ANSWER HERE"));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okResult([q1]);
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });

  it("seriesPlan carries title, intro, episode count", () => {
    const v = okResult([q1, q2]);
    assert.ok(v.seriesPlan.includes("SERIES TITLE:"));
    assert.ok(v.seriesPlan.includes("INTRO FRAME"));
    assert.ok(v.seriesPlan.includes("TOTAL EPISODES: 2"));
    assert.ok(v.seriesPlan.includes("EPISODE 2:"));
  });

  it("series title embeds the first question", () => {
    const v = okResult([q1, q2]);
    const titleLine = v.seriesPlan.split("\n").find((l) => l.startsWith("SERIES TITLE:"));
    assert.ok(titleLine && titleLine.includes(q1.question));
  });

  it("each episode has hook, beats, outro", () => {
    const v = okResult([q1, q2]);
    for (const ep of v.episodes) {
      assert.ok(ep.includes("HOOK:"), `missing HOOK in ${ep.slice(0, 40)}`);
      assert.ok(ep.includes("OUTRO:"), `missing OUTRO in ${ep.slice(0, 40)}`);
    }
    assert.ok(v.episodes[0].includes("EPISODE 1"));
    assert.ok(v.episodes[1].includes("EPISODE 2"));
  });

  it("no leftover template slots in output", () => {
    const v = okResult([q1, q2]);
    for (const bad of ["{question}", "{count}", "{next}"]) {
      assert.ok(!v.seriesPlan.includes(bad), `leftover slot ${bad}`);
    }
  });

  it("empty items: error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("at least one"));
  });

  it("more than 20 items: error", () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ question: `q ${i}?` }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("Max 20"));
  });

  it("exactly 20 items: ok (upper bound)", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ question: `question ${i}?` }));
    const v = okResult(items);
    assert.equal(v.episodes.length, 20);
  });

  it("missing question: Item 1 error", () => {
    const r = runTool({ items: [{}] });
    assert.equal(r.ok, false);
    assert.equal(
      (r as { error: string }).error,
      "Item 1: question is required — write the question your audience asks.",
    );
  });

  it("missing question on item 3: Item 3 error", () => {
    const r = runTool({ items: [q1, q2, {}] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.startsWith("Item 3:"));
  });

  it("whitespace-only question: error", () => {
    const r = runTool({ items: [{ question: "  " }] });
    assert.equal(r.ok, false);
  });

  it("null item: Item N invalid item error", () => {
    const r = runTool({ items: [null as unknown as Record<string, unknown>] });
    assert.equal(r.ok, false);
    assert.equal((r as { error: string }).error, "Item 1: invalid item.");
  });

  it("question over 200 chars: error", () => {
    const r = runTool({ items: [{ question: "q".repeat(201) + "?" }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("200 characters"));
  });

  it("more than 4 answer points: error", () => {
    const r = runTool({ items: [{ question: "q?", answerPoints: "a, b, c, d, e" }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("max 4"));
  });

  it("answer point over 160 chars: error", () => {
    const r = runTool({ items: [{ question: "q?", answerPoints: "p".repeat(161) }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("160 characters"));
  });

  it("blank answerPoints behaves like none (placeholder shown)", () => {
    const v = okResult([{ question: "q?", answerPoints: "   " }]);
    assert.ok(v.episodes[0].includes("[ADD YOUR ANSWER HERE"));
  });

  it("deterministic: same items run twice → identical", () => {
    const a = okResult([q1, q2]);
    const b = okResult([q1, q2]);
    assert.deepEqual(a, b);
  });

  it("different questions vary picks across the bank", () => {
    const hooks = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const v = okResult([{ question: `totally different question ${i}?` }]);
      const hook = v.episodes[0].split("\n").find((l) => l.includes("HOOK:"));
      assert.ok(hook && hook.length > 10);
      hooks.add(hook);
    }
    assert.ok(hooks.size > 1, "hooks should vary across questions");
  });
});
