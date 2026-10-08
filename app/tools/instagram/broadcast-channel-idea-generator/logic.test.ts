import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, GOALS, MIN_COUNT, MAX_COUNT, BANK_SIZES } from "./logic.ts";

type Idea = { name: string; description: string; firstPosts: string[] };

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const BASE = { niche: "fitness coaching", goal: "Educate", count: 2 };

describe("broadcast-channel-idea-generator", () => {
  it("happy path: returns the requested number of ideas", () => {
    const v = okRun({ ...BASE });
    const ideas = v.ideas as Idea[];
    assert.equal(ideas.length, 2);
    for (const idea of ideas) {
      assert.ok(idea.name.length > 0);
      assert.ok(idea.description.length > 0);
      assert.equal(idea.firstPosts.length, 3);
      for (const p of idea.firstPosts) assert.ok(p.length > 0);
    }
  });

  it("returns exactly the meta output ids", () => {
    const v = okRun({ ...BASE });
    assert.deepEqual(Object.keys(v).sort(), ["bankNote", "ideas"]);
  });

  it("channel names title-case the niche", () => {
    const v = okRun({ ...BASE, count: 1 });
    const ideas = v.ideas as Idea[];
    assert.ok(ideas[0].name.includes("Fitness Coaching"));
  });

  it("description carries the goal's call-to-action and the niche", () => {
    const v = okRun({ ...BASE, count: 1 });
    const ideas = v.ideas as Idea[];
    assert.ok(ideas[0].description.includes("fitness coaching"));
    assert.match(ideas[0].description, /weekly lessons/i);
  });

  it("first posts name the channel and stay on niche", () => {
    const v = okRun({ ...BASE, count: 1 });
    const ideas = v.ideas as Idea[];
    for (const p of ideas[0].firstPosts) {
      assert.ok(p.includes(ideas[0].name));
    }
  });

  it("all four goals produce a distinct call-to-action", () => {
    const ctas = new Set<string>();
    for (const goal of GOALS) {
      const v = okRun({ niche: "fitness", goal, count: 1 });
      const desc = (v.ideas as Idea[])[0].description;
      ctas.add(desc);
      assert.ok(desc.includes("fitness"));
    }
    assert.equal(ctas.size, 4);
  });

  it("ideas rotate through the banks: idea 2 differs from idea 1", () => {
    const v = okRun({ ...BASE, count: 4 });
    const ideas = v.ideas as Idea[];
    assert.notEqual(ideas[0].name, ideas[1].name);
    assert.notEqual(ideas[0].description, ideas[1].description);
  });

  it("bankNote honestly states the template banks", () => {
    const v = okRun({ ...BASE });
    assert.match(v.bankNote as string, /template banks/i);
    assert.match(v.bankNote as string, /not AI-generated/i);
  });

  it("deterministic: same inputs give identical ideas", () => {
    const a = JSON.stringify(runTool({ ...BASE, count: 6 }));
    const b = JSON.stringify(runTool({ ...BASE, count: 6 }));
    assert.equal(a, b);
  });

  it("count 10 returns ten ideas", () => {
    const v = okRun({ ...BASE, count: 10 });
    assert.equal((v.ideas as Idea[]).length, 10);
  });

  it("missing niche fails", () => {
    const r = runTool({ goal: "Educate", count: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Niche is required/);
  });

  it("blank niche fails", () => {
    const r = runTool({ ...BASE, niche: "  " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Niche is required/);
  });

  it("missing goal fails", () => {
    const r = runTool({ niche: "fitness", count: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Goal must be one of/);
  });

  it("unknown goal fails listing valid goals", () => {
    const r = runTool({ ...BASE, goal: "Go viral" });
    assert.equal(r.ok, false);
    for (const g of GOALS) assert.ok((r.error as string).includes(g));
  });

  it("missing count fails", () => {
    const r = runTool({ niche: "fitness", goal: "Educate" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("count below 1 fails", () => {
    const r = runTool({ ...BASE, count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 1 and 10/);
  });

  it("count above 10 fails", () => {
    const r = runTool({ ...BASE, count: 11 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 1 and 10/);
  });

  it("non-integer count fails", () => {
    const r = runTool({ ...BASE, count: 1.5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("bank sizes are documented: 8 + 6 + 8 templates + 4 goals = 26", () => {
    assert.equal(BANK_SIZES.nameFormulas, 8);
    assert.equal(BANK_SIZES.descriptionTemplates, 6);
    assert.equal(BANK_SIZES.firstPostTemplates, 8);
    assert.equal(BANK_SIZES.goals, 4);
    assert.equal(BANK_SIZES.total, 26);
  });
});
