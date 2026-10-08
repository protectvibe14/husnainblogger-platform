import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TITLE_FORMULAS,
  SEGMENT_BANK,
  SHORT_SEGMENTS,
  STANDARD_SEGMENTS,
  LONG_SEGMENTS,
  DEFAULT_EPISODE_MINUTES,
  IDEA_COUNT,
  MIN_EPISODE_MINUTES,
  MAX_EPISODE_MINUTES,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = { showTheme: "indie game dev", episodeLengthMinutes: 30 };

describe("podcast-episode-idea-generator", () => {
  it("happy path: 6 ideas, each with a segment breakdown", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as string[];
    assert.equal(ideas.length, 6);
    for (const idea of ideas) {
      assert.match(idea, /Segments \(\d+\):/);
      assert.ok(idea.split("\n").length === 2);
    }
  });

  it("happy path: theme appears in every idea, no placeholders leak", () => {
    const r = runTool({ ...base });
    const joined = (r.values!.ideas as string[]).join("\n");
    assert.ok(joined.includes("indie game dev"));
    assert.ok(!joined.includes("{theme}"));
  });

  it("default: omitted episodeLengthMinutes plans for 30-minute episodes", () => {
    const r = runTool({ showTheme: "indie game dev" });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as string[];
    assert.match(ideas[0], /Segments \(3\):/);
    assert.match(r.values!.planNote as string, /≈30-minute/);
  });

  it("empty-string episodeLengthMinutes: treated as omitted", () => {
    const r = runTool({ showTheme: "indie game dev", episodeLengthMinutes: "" });
    assert.equal(r.ok, true);
    assert.match(r.values!.planNote as string, /≈30-minute/);
  });

  it("short episode (10 min): 2 segments (hook + takeaways)", () => {
    const r = runTool({ ...base, episodeLengthMinutes: 10 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as string[];
    assert.match(ideas[0], /Segments \(2\):/);
    assert.ok(ideas[0].includes("Cold Open Hook"));
    assert.ok(ideas[0].includes("Action Takeaways"));
  });

  it("boundary (19 min): still short; boundary (20 min): standard", () => {
    const short = runTool({ ...base, episodeLengthMinutes: 19 });
    const standard = runTool({ ...base, episodeLengthMinutes: 20 });
    assert.match((short.values!.ideas as string[])[0], /Segments \(2\):/);
    assert.match((standard.values!.ideas as string[])[0], /Segments \(3\):/);
  });

  it("boundary (45 min): standard; boundary (46 min): long (4 segments)", () => {
    const standard = runTool({ ...base, episodeLengthMinutes: 45 });
    const long = runTool({ ...base, episodeLengthMinutes: 46 });
    assert.match((standard.values!.ideas as string[])[0], /Segments \(3\):/);
    assert.match((long.values!.ideas as string[])[0], /Segments \(4\):/);
    assert.ok((long.values!.ideas as string[])[0].includes("Guest Interview"));
    assert.ok((long.values!.ideas as string[])[0].includes("Listener Q&A"));
  });

  it("numeric string minutes ('60'): accepted as long episode", () => {
    const r = runTool({ ...base, episodeLengthMinutes: "60" });
    assert.equal(r.ok, true);
    assert.match((r.values!.ideas as string[])[0], /Segments \(4\):/);
  });

  it("missing showTheme: rejected with human message", () => {
    const r = runTool({ episodeLengthMinutes: 30 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /show's theme/);
  });

  it("blank showTheme: rejected", () => {
    const r = runTool({ showTheme: "   ", episodeLengthMinutes: 30 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /show's theme/);
  });

  it("episodeLengthMinutes 0: rejected", () => {
    const r = runTool({ ...base, episodeLengthMinutes: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 300/);
  });

  it("episodeLengthMinutes 301: rejected", () => {
    const r = runTool({ ...base, episodeLengthMinutes: 301 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 300/);
  });

  it('episodeLengthMinutes non-numeric ("long"): rejected', () => {
    const r = runTool({ ...base, episodeLengthMinutes: "long" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 300/);
  });

  it("determinism: same inputs produce identical output", () => {
    const a = runTool({ ...base });
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it("word-bank bounds: 6 formulas, 8 segments, buckets drawn from the bank", () => {
    assert.equal(TITLE_FORMULAS.length, 6);
    assert.equal(SEGMENT_BANK.length, 8);
    assert.equal(IDEA_COUNT, 6);
    assert.ok(TITLE_FORMULAS.every((f) => f.includes("{theme}")));
    const bankNames = new Set(SEGMENT_BANK.map((s) => s.name));
    for (const name of [...SHORT_SEGMENTS, ...STANDARD_SEGMENTS, ...LONG_SEGMENTS]) {
      assert.ok(bankNames.has(name), `${name} not in SEGMENT_BANK`);
    }
    assert.equal(SHORT_SEGMENTS.length, 2);
    assert.equal(STANDARD_SEGMENTS.length, 3);
    assert.equal(LONG_SEGMENTS.length, 4);
  });

  it("idea titles are distinct across formulas", () => {
    const r = runTool({ ...base });
    const titles = (r.values!.ideas as string[]).map((i) => i.split("\n")[0]);
    assert.equal(new Set(titles).size, 6);
  });

  it("planNote names the fixed bank honestly", () => {
    const r = runTool({ ...base });
    assert.match(r.values!.planNote as string, /fixed bank/);
  });

  it("constants honor spec", () => {
    assert.equal(DEFAULT_EPISODE_MINUTES, 30);
    assert.equal(MIN_EPISODE_MINUTES, 1);
    assert.equal(MAX_EPISODE_MINUTES, 300);
  });

  it("non-object input: rejected", () => {
    const r = runTool([] as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
