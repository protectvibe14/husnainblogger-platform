import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  X_POST_LIMIT,
  STANCES,
  DEFAULT_STANCE,
  MAX_CONTEXT_LEN,
  xWeightedLength,
  isStance,
  buildComments,
  runTool,
} from "./logic.ts";

describe("constants", () => {
  it("X_POST_LIMIT matches the platform rule", () => {
    assert.equal(X_POST_LIMIT, 280);
  });
  it("exactly the three documented stances, default add-nuance", () => {
    assert.deepEqual(STANCES, ["agree", "add-nuance", "disagree"]);
    assert.equal(DEFAULT_STANCE, "add-nuance");
  });
});

describe("isStance", () => {
  it("accepts the three stances, rejects the rest", () => {
    assert.equal(isStance("agree"), true);
    assert.equal(isStance("disagree"), true);
    assert.equal(isStance("neutral"), false);
    assert.equal(isStance(""), false);
  });
});

describe("buildComments", () => {
  it("each stance returns exactly 5 drafts", () => {
    for (const s of STANCES) {
      assert.equal(buildComments("posting daily wins", s).length, 5, s);
    }
  });
  it("every draft fits the 280 weighted-char budget", () => {
    for (const s of STANCES) {
      for (const c of buildComments("a".repeat(MAX_CONTEXT_LEN), s)) {
        assert.ok(xWeightedLength(c) <= X_POST_LIMIT, `${s}: over budget (${xWeightedLength(c)})`);
      }
    }
  });
  it("context is inserted into every draft", () => {
    for (const c of buildComments("morning pages", "agree")) {
      assert.ok(c.includes("morning pages"));
    }
  });
  it("tone matches stance: agree endorses, disagree pushes back", () => {
    const agree = buildComments("cold showers", "agree").join(" ");
    assert.ok(/100%|couldn.t agree more|exactly right/i.test(agree));
    const disagree = buildComments("cold showers", "disagree").join(" ");
    assert.ok(/respectfully disagree|counterpoint|half right/i.test(disagree));
  });
  it("add-nuance drafts include a user-fillable caveat slot", () => {
    for (const c of buildComments("cold showers", "add-nuance")) {
      assert.ok(/\[[A-Z][A-Z /]+\]/.test(c), `no placeholder: ${c.slice(0, 40)}`);
    }
  });
  it("stance banks are distinct", () => {
    const a = new Set(buildComments("x", "agree"));
    const d = new Set(buildComments("x", "disagree"));
    assert.equal([...a].filter((c) => d.has(c)).length, 0);
  });
  it("deterministic: same inputs -> same drafts", () => {
    assert.deepEqual(buildComments("email lists", "disagree"), buildComments("email lists", "disagree"));
  });
  it("throws on empty context", () => {
    assert.throws(() => buildComments("   ", "agree"), /non-empty context/);
  });
  it("throws on unknown stance", () => {
    assert.throws(() => buildComments("x", "neutral"), /unknown stance/);
  });
  it("throws TypeError on non-string inputs", () => {
    assert.throws(() => buildComments(1 as unknown as string, "agree"), TypeError);
  });
});

describe("runTool", () => {
  it("happy path returns quoteComments", () => {
    const res = runTool({ context: "AI will replace junior devs", stance: "disagree" });
    assert.equal(res.ok, true);
    assert.deepEqual(Object.keys(res.values ?? {}), ["quoteComments"]);
    assert.equal((res.values?.quoteComments as string[]).length, 5);
  });
  it("stance defaults to add-nuance when omitted", () => {
    const res = runTool({ context: "AI will replace junior devs" });
    assert.equal(res.ok, true);
    const withDefault = res.values?.quoteComments;
    const explicit = runTool({ context: "AI will replace junior devs", stance: "add-nuance" }).values?.quoteComments;
    assert.deepEqual(withDefault, explicit);
  });
  it("all three stances accepted", () => {
    for (const s of STANCES) {
      assert.equal(runTool({ context: "remote work", stance: s }).ok, true, s);
    }
  });
  it("missing/empty context -> validation error", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ context: "   " }).ok, false);
    assert.match(runTool({}).error ?? "", /quoting/i);
  });
  it("context over max length -> validation error", () => {
    const res = runTool({ context: "x".repeat(MAX_CONTEXT_LEN + 1) });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /too long/);
  });
  it("unknown stance -> validation error", () => {
    const res = runTool({ context: "x", stance: "neutral" });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /agree, add-nuance, disagree/);
  });
  it("non-string context -> validation error", () => {
    assert.equal(runTool({ context: 7 }).ok, false);
  });
  it("deterministic: same inputs -> identical output", () => {
    const a = runTool({ context: "build in public", stance: "agree" });
    const b = runTool({ context: "build in public", stance: "agree" });
    assert.deepEqual(a, b);
  });
});
