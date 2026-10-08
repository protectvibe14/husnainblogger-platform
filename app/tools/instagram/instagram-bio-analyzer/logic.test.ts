import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeBio, runTool, BIO_LIMIT } from "./logic.ts";

describe("analyzeBio — strong bio", () => {
  it("scores high for a complete bio", () => {
    const bio = "Helping creators grow 🌱\n10k students taught 📚\nDM me 'START' 👇";
    const r = analyzeBio(bio, "creators");
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 70, `expected >=70, got ${r.score}`);
    assert.equal(r.lineCount, 3);
    assert.ok(r.emojiCount >= 1 && r.emojiCount <= 5);
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
});

describe("analyzeBio — weak bio", () => {
  it("scores low for a single-line bio with no CTA", () => {
    const r = analyzeBio("just a person", "");
    assert.ok(r.score < 40, `expected <40, got ${r.score}`);
    assert.ok(r.tips.length > 0);
  });

  it("gives zero length points over the 150 limit", () => {
    const r = analyzeBio("x".repeat(160), "");
    const len = r.factors.find((f) => f.name === "Length discipline");
    assert.equal(len?.points, 0);
    assert.ok(r.tips.some((t) => t.includes("150")));
  });
});

describe("analyzeBio — emoji handling", () => {
  it("penalizes emoji overuse", () => {
    const r = analyzeBio("🎉🎊🥳🎈🎁🎀🌟💫 line one\nline two\nline three", "");
    const em = r.factors.find((f) => f.name === "Emoji usage");
    assert.equal(em?.points, 5);
  });
});

describe("analyzeBio — keyword", () => {
  it("awards full keyword points when present", () => {
    const r = analyzeBio("Fitness coach 💪\nDM to start", "fitness");
    const kw = r.factors.find((f) => f.name === "Keyword clarity");
    assert.equal(kw?.points, 20);
  });

  it("is neutral when no keyword given", () => {
    const r = analyzeBio("Fitness coach 💪\nDM to start", "");
    const kw = r.factors.find((f) => f.name === "Keyword clarity");
    assert.equal(kw?.points, 10);
  });
});

describe("analyzeBio — errors", () => {
  it("throws on empty bio", () => {
    assert.throws(() => analyzeBio("  ", ""), /non-empty/);
  });
  it("throws on non-string", () => {
    assert.throws(() => analyzeBio(null as unknown as string, ""), TypeError);
  });
});

describe("runTool contract", () => {
  it("returns ok with all output keys", () => {
    const r = runTool({ bio: "Creator tips daily 🌱\nLink in bio 👇", keyword: "creator" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values?.score === "number");
    assert.match(String(r.values?.bioStats), new RegExp(String(BIO_LIMIT)));
  });

  it("rejects empty bio", () => {
    const r = runTool({ bio: " ", keyword: "" });
    assert.equal(r.ok, false);
  });
});
