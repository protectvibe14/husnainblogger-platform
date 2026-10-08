import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  X_POST_LIMIT,
  BRAND_GOALS,
  xWeightedLength,
  isBrandGoal,
  buildDrafts,
  runTool,
} from "./logic.ts";

describe("constants", () => {
  it("X_POST_LIMIT matches the platform rule", () => {
    assert.equal(X_POST_LIMIT, 280);
  });
  it("exactly the three documented goals", () => {
    assert.deepEqual(BRAND_GOALS, ["offer", "proof", "announcement"]);
  });
});

describe("isBrandGoal", () => {
  it("accepts the three goals, rejects the rest", () => {
    assert.equal(isBrandGoal("offer"), true);
    assert.equal(isBrandGoal("proof"), true);
    assert.equal(isBrandGoal("announcement"), true);
    assert.equal(isBrandGoal("joke"), false);
    assert.equal(isBrandGoal(""), false);
  });
});

describe("buildDrafts", () => {
  it("each goal returns exactly 5 drafts", () => {
    for (const goal of BRAND_GOALS) {
      assert.equal(buildDrafts(goal).length, 5, goal);
    }
  });
  it("every draft fits the 280 weighted-char budget", () => {
    for (const goal of BRAND_GOALS) {
      for (const d of buildDrafts(goal)) {
        assert.ok(xWeightedLength(d) <= X_POST_LIMIT, `${goal}: over budget (${xWeightedLength(d)}): ${d.slice(0, 40)}`);
      }
    }
  });
  it("drafts are self-contained: no 'thread (1/n)' or 'see my last post' dependencies", () => {
    for (const goal of BRAND_GOALS) {
      for (const d of buildDrafts(goal)) {
        assert.ok(!/my (last|previous) post/i.test(d), `depends on prior post: ${d.slice(0, 40)}`);
        assert.ok(!/continued/i.test(d));
      }
    }
  });
  it("offer drafts are CTA-led (link or DM prompt)", () => {
    for (const d of buildDrafts("offer")) {
      assert.ok(d.includes("[YOUR LINK]") || /DM me/i.test(d), `no CTA: ${d.slice(0, 40)}`);
    }
  });
  it("drafts use bracketed placeholders — nothing invented", () => {
    for (const goal of BRAND_GOALS) {
      for (const d of buildDrafts(goal)) {
        assert.ok(/\[[A-Z][A-Z /]+\]/.test(d), `no placeholder: ${d.slice(0, 40)}`);
      }
    }
  });
  it("goal banks are distinct", () => {
    const o = new Set(buildDrafts("offer"));
    const p = new Set(buildDrafts("proof"));
    const a = new Set(buildDrafts("announcement"));
    assert.equal(o.size, 5);
    assert.equal([...o].filter((d) => p.has(d) || a.has(d)).length, 0);
  });
  it("deterministic: same goal -> same drafts", () => {
    assert.deepEqual(buildDrafts("proof"), buildDrafts("proof"));
  });
  it("throws on unknown goal", () => {
    assert.throws(() => buildDrafts("meme"), /unknown goal/);
  });
  it("throws TypeError on non-string", () => {
    assert.throws(() => buildDrafts(3 as unknown as string), TypeError);
  });
});

describe("xWeightedLength", () => {
  it("URL = 23, emoji = 2", () => {
    assert.equal(xWeightedLength("https://x.com/very/long"), 23);
    assert.equal(xWeightedLength("🚀"), 2);
  });
});

describe("runTool", () => {
  it("happy path returns pinnedTweets for each goal", () => {
    for (const goal of BRAND_GOALS) {
      const res = runTool({ brandGoal: goal });
      assert.equal(res.ok, true, goal);
      assert.deepEqual(Object.keys(res.values ?? {}), ["pinnedTweets"]);
      assert.equal((res.values?.pinnedTweets as string[]).length, 5);
    }
  });
  it("trims whitespace around the goal", () => {
    assert.equal(runTool({ brandGoal: "  offer " }).ok, true);
  });
  it("missing goal -> validation error", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /choose what/i);
  });
  it("empty goal -> validation error", () => {
    assert.equal(runTool({ brandGoal: "   " }).ok, false);
  });
  it("unknown goal -> validation error", () => {
    const res = runTool({ brandGoal: "sales" });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /offer, proof, announcement/);
  });
  it("non-string goal -> validation error", () => {
    assert.equal(runTool({ brandGoal: 1 }).ok, false);
  });
  it("deterministic: same input -> identical output", () => {
    assert.deepEqual(runTool({ brandGoal: "announcement" }), runTool({ brandGoal: "announcement" }));
  });
});
