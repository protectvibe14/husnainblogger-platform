import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, assemblePrompt, MIN_ADJECTIVES, MAX_ADJECTIVE_CHARS } from "./logic.ts";

describe("brand-voice-prompt-builder", () => {
  it("happy path: full item produces a complete system prompt", () => {
    const r = runTool({
      items: [
        {
          adjectives: "friendly, bold, curious",
          doList: "use short sentences, ask questions",
          dontList: "use jargon, sound corporate",
          sampleText: "Hey! Let's build something great today.",
        },
      ],
    });
    assert.equal(r.ok, true);
    const prompts = r.values?.prompts as string[];
    assert.equal(prompts.length, 1);
    const p = prompts[0];
    assert.match(p, /writing assistant/i);
    assert.ok(p.includes("friendly, bold, and curious"));
    assert.ok(p.includes("- use short sentences"));
    assert.ok(p.includes("- ask questions"));
    assert.ok(p.includes("- use jargon"));
    assert.ok(p.includes("Hey! Let's build something great today."));
    assert.ok(p.includes("Match the rhythm"));
    assert.ok(p.includes("Never break character"));
  });

  it("output id matches meta.ts outputs", () => {
    const r = runTool({ items: [{ adjectives: "warm, witty" }] });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), ["prompts"]);
  });

  it("empty do/don't lists are omitted (spec edge case)", () => {
    const p = assemblePrompt(["warm", "witty"], [], [], "");
    assert.ok(!p.includes("DO\n"), "no DO section when empty");
    assert.ok(!p.includes("DON'T"), "no DON'T section when empty");
    assert.ok(!p.includes("VOICE EXAMPLE"), "no sample section when empty");
    assert.ok(p.includes("BRAND VOICE"));
    assert.ok(p.includes("RULES"));
  });

  it("empty sampleText omits the VOICE EXAMPLE section", () => {
    const p = assemblePrompt(["a", "b"], ["do this"], [], "");
    assert.ok(p.includes("DO"));
    assert.ok(!p.includes("VOICE EXAMPLE"));
  });

  it("fewer than 2 adjectives -> Item N error", () => {
    const r = runTool({ items: [{ adjectives: "friendly" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 1.*at least 2 adjectives/i);
  });

  it("missing adjectives -> error", () => {
    const r = runTool({ items: [{ doList: "be nice" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /adjectives/i);
  });

  it("blank adjectives (commas only) -> error", () => {
    const r = runTool({ items: [{ adjectives: " , , " }] });
    assert.equal(r.ok, false);
  });

  it("over-long adjective rejected", () => {
    const r = runTool({ items: [{ adjectives: "friendly, " + "x".repeat(MAX_ADJECTIVE_CHARS + 1) }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /too long/i);
  });

  it("second bad item reports its own number", () => {
    const r = runTool({
      items: [{ adjectives: "warm, witty" }, { adjectives: "solo" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 2/);
  });

  it("empty items array -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /at least one brand voice entry/i);
  });

  it("missing items -> error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("multiple items produce one prompt each", () => {
    const r = runTool({
      items: [
        { adjectives: "warm, witty" },
        { adjectives: "formal, precise", doList: "cite sources" },
      ],
    });
    assert.equal(r.ok, true);
    const prompts = r.values?.prompts as string[];
    assert.equal(prompts.length, 2);
    assert.ok(prompts[0].includes("warm and witty"));
    assert.ok(prompts[1].includes("cite sources"));
  });

  it("adjective lists are trimmed and empty entries dropped", () => {
    const r = runTool({ items: [{ adjectives: "  warm ,, witty , " }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.prompts as string[])[0].includes("warm and witty"));
  });

  it("two adjectives join with 'and', three+ use oxford comma", () => {
    assert.ok(assemblePrompt(["a", "b"], [], [], "").includes("a and b"));
    assert.ok(assemblePrompt(["a", "b", "c"], [], [], "").includes("a, b, and c"));
  });

  it("no invented voice content: every non-fixed word comes from the user", () => {
    const p = assemblePrompt(["zesty", "quirky"], ["use emojis"], ["be boring"], "Yo!");
    assert.ok(p.includes("zesty"));
    assert.ok(p.includes("quirky"));
    assert.ok(p.includes("use emojis"));
    assert.ok(p.includes("be boring"));
    assert.ok(p.includes("Yo!"));
    // none of these sample words appear when the user does not supply them
    const plain = assemblePrompt(["calm", "clear"], [], [], "");
    assert.ok(!plain.includes("zesty") && !plain.includes("emojis"));
  });

  it("deterministic: same items give identical output twice", () => {
    const items = [{ adjectives: "warm, witty", doList: "be brief" }];
    assert.deepEqual(runTool({ items }), runTool({ items }));
  });

  it("MIN_ADJECTIVES is 2 per spec", () => {
    assert.equal(MIN_ADJECTIVES, 2);
  });
});
