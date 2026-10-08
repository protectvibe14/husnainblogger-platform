import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseHashtags, scoreHashtags, runTool, IDEAL_MIN_COUNT, IDEAL_MAX_COUNT } from "./logic.ts";

describe("parseHashtags", () => {
  it("extracts tags from mixed text", () => {
    assert.deepEqual(parseHashtags("Love this! #travel #sunset-vibes #2026goals"), ["travel", "sunset", "2026goals"]);
  });
  it("handles newlines and commas", () => {
    assert.deepEqual(parseHashtags("#a\n#b, #c"), ["a", "b", "c"]);
  });
  it("ignores lone # and non-tag chars", () => {
    assert.deepEqual(parseHashtags("# #!wow #ok_tag"), ["ok_tag"]);
  });
  it("empty -> empty array", () => {
    assert.deepEqual(parseHashtags("no tags here"), []);
    assert.deepEqual(parseHashtags(""), []);
  });
  it("throws on non-string", () => {
    assert.throws(() => parseHashtags(5 as unknown as string), TypeError);
  });
});

describe("scoreHashtags — normal cases", () => {
  it("strong set scores high", () => {
    const r = scoreHashtags("#travelphotography #sunsetlovers #wanderlust #beachlife #mountainviews #citylights #foodiegram #naturelover");
    assert.equal(r.heuristic, true);
    assert.ok(r.score >= 80, `expected >=80, got ${r.score}`);
    assert.equal(r.grade, "Strong");
    assert.equal(r.riskyTags.length, 0);
    assert.equal(r.duplicates.length, 0);
    assert.equal(r.factors.reduce((a, f) => a + f.max, 0), 100);
  });
  it("risky pod tags get penalized", () => {
    const r = scoreHashtags("#travel #likeforlike #followforfollow #sunset #l4l");
    assert.ok(r.riskyTags.length === 3, `expected 3 risky, got ${r.riskyTags.length}`);
    const f = r.factors.find((x) => x.name === "Banned-risk patterns")!;
    assert.equal(f.points, Math.max(0, 25 - 3 * 8));
    const riskyVerdicts = r.perTag.filter((e) => e.verdict === "risky");
    assert.equal(riskyVerdicts.length, 3);
  });
  it("duplicates penalized", () => {
    const r = scoreHashtags("#travel #Travel #TRAVEL #sunset #beach");
    assert.equal(r.duplicates.length, 1);
    const f = r.factors.find((x) => x.name === "No duplicates")!;
    assert.equal(f.points, 10);
  });
  it("too few tags scores low on count", () => {
    const r = scoreHashtags("#travel");
    const f = r.factors.find((x) => x.name === "Tag count")!;
    assert.equal(f.points, 8);
  });
  it("over 30 tags gets zero count points", () => {
    const many = Array.from({ length: 35 }, (_, i) => `#tag${i}`).join(" ");
    const r = scoreHashtags(many);
    const f = r.factors.find((x) => x.name === "Tag count")!;
    assert.equal(f.points, 0);
  });
});

describe("scoreHashtags — boundaries", () => {
  it("exactly 5 and 15 tags get full count points", () => {
    const five = "#traveling #sunsett #beachday #foodies #wanderer";
    const fifteen = Array.from({ length: 15 }, (_, i) => `#traveltag${i}`).join(" ");
    assert.equal(scoreHashtags(five).factors.find((f) => f.name === "Tag count")!.points, 25);
    assert.equal(scoreHashtags(fifteen).factors.find((f) => f.name === "Tag count")!.points, 25);
  });
  it("ideal constants are sane", () => {
    assert.equal(IDEAL_MIN_COUNT, 5);
    assert.equal(IDEAL_MAX_COUNT, 15);
  });
  it("broad/niche mix rewards both sides", () => {
    const r = scoreHashtags("#travel #photo #sunsett #beachday #wanderer #mountainview #citylights");
    const f = r.factors.find((x) => x.name === "Broad/niche mix")!;
    assert.equal(f.points, 20);
  });
  it("throws when no hashtags", () => {
    assert.throws(() => scoreHashtags("no tags"), Error);
    assert.throws(() => scoreHashtags(""), Error);
  });
});

describe("runTool — contract", () => {
  it("rejects empty input", () => {
    const r = runTool({ hashtags: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });
  it("rejects non-string input", () => {
    const r = runTool({ hashtags: 42 });
    assert.equal(r.ok, false);
  });
  it("returns score, grade, verdicts, mix, honesty note", () => {
    const r = runTool({ hashtags: "#travelphotography #sunsetlovers #wanderlust #beachlife #mountainviews" });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values!.score === "number");
    assert.ok(typeof r.values!.grade === "string");
    assert.ok(Array.isArray(r.values!.perTagVerdicts));
    assert.ok(typeof r.values!.mixSummary === "string");
    assert.ok((r.values!.heuristicNote as string).includes("Heuristic only"));
  });
});
