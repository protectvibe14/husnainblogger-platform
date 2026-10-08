import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, LIMIT_NOTE } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { liveTopic: "weeknight meal prep", niche: "budget cooking" };

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-live-title-generator", () => {
  it("happy path: yields 8 titles + honesty limit note", () => {
    const v = okValues();
    assert.equal((v.liveTitles as string[]).length, 8);
    assert.equal(v.limitNote, LIMIT_NOTE);
  });

  it("every title is <= 60 chars (conservative cap)", () => {
    for (const topic of ["weeknight meal prep", "a".repeat(60), "budget grocery haul for one week"]) {
      const v = okValues({ liveTopic: topic });
      for (const t of v.liveTitles as string[]) {
        assert.ok(t.length <= 60, `title within cap (${t.length}): ${t}`);
      }
    }
  });

  it("long titles are not cut mid-word when possible", () => {
    const v = okValues({ liveTopic: "supercalifragilisticexpialidocious baking marathon spectacular" });
    for (const t of v.liveTitles as string[]) {
      assert.ok(t.length <= 60);
      assert.ok(!t.endsWith(" "), `no trailing space: "${t}"`);
    }
  });

  it("titles mention the topic and niche", () => {
    const v = okValues();
    for (const t of v.liveTitles as string[]) {
      assert.ok(t.includes("weeknight meal prep"), `mentions topic: ${t}`);
      assert.ok(t.includes("budget cooking"), `mentions niche: ${t}`);
    }
  });

  it("works without niche", () => {
    const v = okValues({ niche: undefined });
    assert.equal((v.liveTitles as string[]).length, 8);
    for (const t of v.liveTitles as string[]) {
      assert.ok(t.includes("weeknight meal prep"));
      assert.ok(t.length <= 60);
    }
  });

  it("blank niche treated as absent", () => {
    const a = okValues({ niche: "   " });
    const b = okValues({ niche: undefined });
    assert.deepEqual(a.liveTitles, b.liveTitles);
  });

  it("titles are unique within a run", () => {
    const v = okValues();
    const titles = v.liveTitles as string[];
    assert.equal(new Set(titles).size, titles.length);
  });

  it("limit note states TikTok does not publish the limit", () => {
    assert.match(LIMIT_NOTE, /does not publish/i);
    assert.match(LIMIT_NOTE, /60 characters/i);
    assert.match(LIMIT_NOTE, /best practice/i);
  });

  it("errors on missing liveTopic", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic/i);
  });

  it("errors on blank liveTopic", () => {
    const r = runTool({ ...BASE, liveTopic: "  " });
    assert.equal(r.ok, false);
  });

  it("errors on non-string liveTopic", () => {
    const r = runTool({ ...BASE, liveTopic: 12 });
    assert.equal(r.ok, false);
  });

  it("errors on liveTopic over 80 chars", () => {
    const r = runTool({ ...BASE, liveTopic: "x".repeat(81) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /80/);
  });

  it("errors on niche over 60 chars", () => {
    const r = runTool({ ...BASE, niche: "y".repeat(61) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /60/);
  });

  it("deterministic: same inputs twice -> identical output", () => {
    const a = runTool(BASE);
    const b = runTool({ liveTopic: "weeknight meal prep", niche: "budget cooking" });
    assert.deepEqual(a, b);
  });

  it("different topics -> different title sets", () => {
    const a = (okValues({ liveTopic: "pottery basics" }).liveTitles as string[]).join("|");
    const b = (okValues({ liveTopic: "chess openings" }).liveTitles as string[]).join("|");
    assert.notEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues();
    assert.deepEqual(Object.keys(v).sort(), outputs.map((o) => o.id).sort());
  });

  it("word-bank bounds: 8 non-empty titles, all banks contribute variety", () => {
    const v = okValues({ liveTopic: "gardening tips", niche: "urban plants" });
    const titles = v.liveTitles as string[];
    assert.ok(titles.every((t) => t.trim().length > 0));
    // variety check: titles should not all start with the same prefix
    const prefixes = new Set(titles.map((t) => t.split(" ")[0]));
    assert.ok(prefixes.size > 1, "multiple prefixes used");
  });

  it("error results carry no values", () => {
    const r = runTool({ liveTopic: "", niche: "z".repeat(70) });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});
