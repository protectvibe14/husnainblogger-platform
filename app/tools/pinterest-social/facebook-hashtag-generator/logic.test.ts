import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateHashtags,
  detectCategory,
  topicTag,
  combinedPool,
  USAGE_NOTE,
  BANK_SIZES,
  CATEGORIES,
  MIN_COUNT,
  MAX_COUNT,
  DEFAULT_COUNT,
  MAX_TOPIC_TAG_LENGTH,
} from "./logic.ts";

describe("facebook-hashtag-generator", () => {
  it("happy path: topic + count 3 returns 3 normalized tags", () => {
    const r = runTool({ topic: "small business", count: 3 });
    assert.equal(r.ok, true);
    const tags = r.values!.hashtags as string[];
    assert.equal(tags.length, 3);
    assert.equal(tags[0], "#smallbusiness");
    for (const t of tags) {
      assert.ok(t.startsWith("#"), t);
      assert.match(t, /^#[a-z0-9]+$/);
    }
    assert.equal(r.values!.usageNote, USAGE_NOTE);
  });

  it("count defaults to 3 when omitted", () => {
    const r = runTool({ topic: "travel" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.hashtags as string[]).length, DEFAULT_COUNT);
  });

  it("count 1 returns only the topic tag", () => {
    const r = runTool({ topic: "yoga", count: 1 });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values!.hashtags, ["#yoga"]);
  });

  it("count 5 returns exactly 5 tags", () => {
    const r = runTool({ topic: "yoga", count: 5 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.hashtags as string[]).length, 5);
  });

  it("no duplicate tags in output", () => {
    for (const topic of ["fitness", "coffee shop", "makeup", "startup"]) {
      const r = runTool({ topic, count: 5 });
      assert.equal(r.ok, true);
      const tags = r.values!.hashtags as string[];
      assert.equal(new Set(tags).size, tags.length, topic);
    }
  });

  it("fitness topic pulls from the fitness pool", () => {
    const r = runTool({ topic: "gym workouts", count: 5 });
    assert.equal(r.ok, true);
    const tags = r.values!.hashtags as string[];
    assert.ok(tags.some((t) => ["#fitness", "#workout", "#gym", "#fitnessmotivation"].includes(t)));
  });

  it("business topic pulls from the business pool", () => {
    const r = runTool({ topic: "coffee shop", count: 5 });
    assert.equal(r.ok, true);
    const tags = r.values!.hashtags as string[];
    assert.ok(tags.some((t) => ["#smallbusiness", "#shoplocal", "#business"].includes(t)));
  });

  it("unknown topic falls back to the general pool", () => {
    const r = runTool({ topic: "quantum gardening", count: 5 });
    assert.equal(r.ok, true);
    assert.equal(detectCategory("quantum gardening"), "general");
    assert.deepEqual(r.values!.hashtags, ["#quantumgardening", "#trending", "#viral", "#community", "#inspiration"]);
  });

  it("topic is normalized: symbols and case stripped", () => {
    assert.equal(topicTag("Coffee Shop!"), "coffeeshop");
    assert.equal(topicTag("  SOURDOUGH  "), "sourdough");
  });

  it("long topic tag is truncated to the max length", () => {
    const r = runTool({ topic: "a".repeat(60), count: 2 });
    assert.equal(r.ok, true);
    const tags = r.values!.hashtags as string[];
    assert.equal(tags[0].length, 1 + MAX_TOPIC_TAG_LENGTH);
  });

  it("count below min errors", () => {
    const r = runTool({ topic: "travel", count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /from 1 to 5/);
  });

  it("count above max errors", () => {
    const r = runTool({ topic: "travel", count: 6 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /from 1 to 5/);
  });

  it("non-integer count errors", () => {
    const r = runTool({ topic: "travel", count: 2.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("missing topic errors", () => {
    const r = runTool({ count: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("blank topic errors", () => {
    const r = runTool({ topic: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("non-string topic errors", () => {
    const r = runTool({ topic: 42 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("symbols-only topic errors (no usable tag)", () => {
    const r = runTool({ topic: "!!! ???" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /letters or numbers/);
  });

  it("deterministic: same inputs give identical outputs", () => {
    const a = runTool({ topic: "handmade candles", count: 4 });
    const b = runTool({ topic: "handmade candles", count: 4 });
    assert.deepEqual(a, b);
  });

  it("usage note is honest about low Facebook weight", () => {
    assert.ok(USAGE_NOTE.includes("low weight"));
    assert.ok(USAGE_NOTE.includes("1-3"));
  });

  it("bank sizes are documented and consistent", () => {
    assert.equal(BANK_SIZES.categories, CATEGORIES.length);
    assert.equal(BANK_SIZES.tagsPerCategory, 10);
    assert.equal(BANK_SIZES.total, 68);
    assert.equal(combinedPool("food").length, 18);
    for (const c of CATEGORIES) assert.equal(combinedPool(c).length, 18);
  });

  it("output ids match meta.ts (hashtags, usageNote)", () => {
    const r = runTool({ topic: "x", count: 2 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["hashtags", "usageNote"]);
  });

  it("MIN/MAX bounds exported correctly", () => {
    assert.equal(MIN_COUNT, 1);
    assert.equal(MAX_COUNT, 5);
    assert.equal(generateHashtags("x", 1).hashtags.length, 1);
  });
});
