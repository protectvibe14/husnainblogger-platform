import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, SIGNALS, NEXT_STEPS, DISCLAIMER } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function outputIdsOf(result: { values?: Record<string, unknown> }): string[] {
  return Object.keys(result.values ?? {}).sort();
}

describe("client-red-flag-checklist", () => {
  it("happy path: single signal scores its weight", () => {
    const r = runTool({ observedSignals: ["no-written-contract"] });
    assert.equal(r.ok, true);
    assert.equal(r.values!["riskScore"], 3);
    assert.equal(r.values!["riskBand"], "Caution");
    assert.equal((r.values!["flaggedSignals"] as string[]).length, 1);
  });

  it("happy path: sums weights across multiple signals", () => {
    const r = runTool({
      observedSignals: ["no-written-contract", "scope-creep", "no-assets-on-time"],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["riskScore"], 3 + 2 + 1); // 6 -> Caution
    assert.equal(r.values!["riskBand"], "Caution");
  });

  it("band boundary: score 2 -> Low", () => {
    const r = runTool({ observedSignals: ["no-assets-on-time", "no-team-access"] });
    assert.equal(r.values!["riskScore"], 2);
    assert.equal(r.values!["riskBand"], "Low");
  });

  it("band boundary: score 3 -> Caution", () => {
    const r = runTool({ observedSignals: ["no-written-contract"] });
    assert.equal(r.values!["riskScore"], 3);
    assert.equal(r.values!["riskBand"], "Caution");
  });

  it("band boundary: score 6 -> Caution, score 7 -> High", () => {
    const r6 = runTool({
      observedSignals: ["no-written-contract", "free-spec-work"],
    }); // 3+3=6
    assert.equal(r6.values!["riskBand"], "Caution");
    const r7 = runTool({
      observedSignals: ["no-written-contract", "free-spec-work", "no-assets-on-time"],
    }); // 3+3+1=7
    assert.equal(r7.values!["riskBand"], "High");
  });

  it("validation: missing signals -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one/i);
  });

  it("validation: empty string signals -> error", () => {
    const r = runTool({ observedSignals: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one/i);
  });

  it("validation: unknown signal -> error naming it", () => {
    const r = runTool({ observedSignals: ["no-written-contract", "is-a-vampire"] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /is-a-vampire/);
  });

  it("accepts newline-separated string input", () => {
    const r = runTool({
      observedSignals: "no-written-contract\nscope-creep",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["riskScore"], 5);
  });

  it("accepts comma-separated string input", () => {
    const r = runTool({ observedSignals: "no-written-contract, scope-creep" });
    assert.equal(r.ok, true);
    assert.equal(r.values!["riskScore"], 5);
  });

  it("matches by exact label case-insensitively", () => {
    const r = runTool({
      observedSignals: ["client refuses to sign a written contract or agreement"],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["riskScore"], 3);
  });

  it("dedupes repeated signals", () => {
    const r = runTool({
      observedSignals: ["no-written-contract", "no-written-contract", "No-Written-Contract"],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["riskScore"], 3);
    assert.equal((r.values!["flaggedSignals"] as string[]).length, 1);
  });

  it("validation: notes longer than 2000 chars -> error", () => {
    const r = runTool({
      observedSignals: ["no-written-contract"],
      notes: "x".repeat(2001),
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /too long/i);
  });

  it("output ids exactly match meta.ts outputs", () => {
    const r = runTool({ observedSignals: ["scope-creep"] });
    assert.equal(r.ok, true);
    assert.deepEqual(outputIdsOf(r), OUTPUT_IDS);
  });

  it("determinism: same input -> identical output", () => {
    const input = { observedSignals: ["scope-creep", "no-written-contract"], notes: "hi" };
    const a = JSON.stringify(runTool(input));
    const b = JSON.stringify(runTool(input));
    assert.equal(a, b);
  });

  it("word bank: 24 signals, weights 1-3, unique kebab ids, non-empty labels", () => {
    assert.equal(SIGNALS.length, 24);
    const ids = new Set<string>();
    for (const s of SIGNALS) {
      assert.ok(s.label.trim().length > 0, "label must be non-empty");
      assert.ok([1, 2, 3].includes(s.weight), "weight must be 1-3");
      assert.match(s.id, /^[a-z0-9-]+$/, "id must be kebab-case");
      assert.ok(!ids.has(s.id), "ids must be unique");
      ids.add(s.id);
    }
  });

  it("next steps: fixed list, non-empty, no legal-advice claim", () => {
    const r = runTool({ observedSignals: ["scope-creep"] });
    const steps = r.values!["nextSteps"] as string[];
    assert.ok(steps.length >= 5);
    assert.deepEqual(steps, NEXT_STEPS);
    assert.ok(DISCLAIMER.includes("assessment aid"));
    assert.equal(r.values!["disclaimer"], DISCLAIMER);
  });

  it("signal labels avoid defamation-adjacent language", () => {
    const banned = /scammer|fraudster|thief|liar|criminal/i;
    for (const s of SIGNALS) {
      assert.ok(!banned.test(s.label), `defamation-adjacent word in: ${s.label}`);
    }
  });
});
