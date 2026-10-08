import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, seededShuffle, MIN_ENTRIES, MAX_ENTRIES } from "./logic.ts";
import { outputs } from "./meta.ts";

const ENTRIES = "alice\nbob\ncarol\ndave\neve\nfrank";

describe("giveaway-winner-picker", () => {
  it("happy path: draws 1 winner from entries", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 1, dedupe: true, seed: "draw-1" });
    assert.equal(r.ok, true);
    const winners = r.values!["winners"] as string[];
    assert.equal(winners.length, 1);
    assert.ok(winners[0].startsWith("Winner 1: "));
    const name = winners[0].replace("Winner 1: ", "");
    assert.ok(ENTRIES.split("\n").includes(name));
  });

  it("draws N winners, all unique", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 3, seed: "abc" });
    assert.equal(r.ok, true);
    const winners = r.values!["winners"] as string[];
    assert.equal(winners.length, 3);
    assert.equal(new Set(winners).size, 3);
  });

  it("seed makes the draw reproducible", () => {
    const v = { entries: ENTRIES, winnerCount: 2, seed: "episode-42" };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("different seeds produce different draws (sanity)", () => {
    // Draw all 6 entries so seed differences are visible in ordering.
    const draws = ["s1", "s2", "s3", "s4"].map(
      (seed) => (runTool({ entries: ENTRIES, winnerCount: 6, seed }).values!["winners"] as string[]).join("|"),
    );
    assert.ok(new Set(draws).size > 1, "all seeds gave identical draws");
  });

  it("blank seed is still deterministic (derived from entries)", () => {
    const v = { entries: ENTRIES, winnerCount: 2 };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("dedupe removes duplicate entries (case-insensitive)", () => {
    const r = runTool({ entries: "Alice\nalice\nALICE\nbob", winnerCount: 2, dedupe: true, seed: "d" });
    assert.equal(r.ok, true);
    const audit = r.values!["audit"] as string[];
    assert.equal(audit.length, 2);
    assert.ok((r.values!["summary"] as string).includes("duplicates removed"));
  });

  it("dedupe off keeps duplicates", () => {
    const r = runTool({ entries: "alice\nalice\nbob", winnerCount: 2, dedupe: false, seed: "d" });
    assert.equal(r.ok, true);
    assert.equal((r.values!["audit"] as string[]).length, 3);
    assert.ok((r.values!["summary"] as string).includes("duplicates kept"));
  });

  it("winner count equal to entries is allowed", () => {
    const r = runTool({ entries: "a\nb", winnerCount: 2, seed: "x" });
    assert.equal(r.ok, true);
    assert.equal((r.values!["winners"] as string[]).length, 2);
  });

  it("blank lines are ignored", () => {
    const r = runTool({ entries: "\n\nalice\n\nbob\n\n", winnerCount: 1, seed: "z" });
    assert.equal(r.ok, true);
    assert.equal((r.values!["audit"] as string[]).length, 2);
  });

  it("missing entries -> error", () => {
    const r = runTool({ winnerCount: 1 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("entries"));
  });

  it("blank entries -> error", () => {
    const r = runTool({ entries: "   \n  " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("fewer than 2 entries -> error", () => {
    const r = runTool({ entries: "only-one" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes(String(MIN_ENTRIES)));
  });

  it("winner count 0 -> error", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("at least 1"));
  });

  it("winner count > entries -> error", () => {
    const r = runTool({ entries: "a\nb", winnerCount: 3 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("cannot exceed"));
  });

  it("fractional winner count -> error", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 1.5 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("whole number"));
  });

  it("too many entries -> error", () => {
    const many = Array.from({ length: MAX_ENTRIES + 1 }, (_, i) => `user${i}`).join("\n");
    const r = runTool({ entries: many, winnerCount: 1 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes(String(MAX_ENTRIES)));
  });

  it("audit lists every entry considered", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 1, seed: "a" });
    const audit = r.values!["audit"] as string[];
    assert.equal(audit.length, 6);
    for (const name of ENTRIES.split("\n")) {
      assert.ok(audit.some((a) => a.includes(name)));
    }
  });

  it("compliance checklist is embedded and honest", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 1, seed: "a" });
    const compliance = r.values!["compliance"] as string[];
    assert.ok(compliance.length >= 4);
    const joined = compliance.join(" ").toLowerCase();
    assert.ok(joined.includes("not sponsored") && joined.includes("youtube"));
    assert.ok(joined.includes("creator") && joined.includes("responsible"));
    assert.ok(joined.includes("lotter"));
  });

  it("summary states winners, entry count, dedupe and seed", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 2, dedupe: true, seed: "final" });
    const summary = r.values!["summary"] as string;
    assert.ok(summary.includes("2 winners"));
    assert.ok(summary.includes("6 entries"));
    assert.ok(summary.includes('"final"'));
  });

  it("seededShuffle is deterministic and a true permutation", () => {
    const items = ["a", "b", "c", "d", "e"];
    const s1 = seededShuffle(items, 123);
    const s2 = seededShuffle(items, 123);
    assert.deepEqual(s1, s2);
    assert.deepEqual([...s1].sort(), [...items].sort());
    assert.deepEqual(items, ["a", "b", "c", "d", "e"], "input not mutated");
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ entries: ENTRIES, winnerCount: 1, seed: "a" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });
});
